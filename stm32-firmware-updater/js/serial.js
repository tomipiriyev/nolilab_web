/**
 * Serial Manager - Basic Web Serial wrapper
 */

class SerialManager {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.connected = false;
    this.readBuffer = [];
    this.pendingRead = null;
  }

  isSupported() {
    return 'serial' in navigator;
  }

  async requestPort() {
    if (!this.isSupported()) {
      throw new Error('Web Serial is not supported. Use Chrome, Edge, or Opera.');
    }

    try {
      this.port = await navigator.serial.requestPort();
      return this.port;
    } catch (err) {
      if (err.name === 'NotFoundError') {
        return null;
      }
      throw err;
    }
  }

  async open(port, options = {}) {
    if (!port) {
      throw new Error('No port selected');
    }

    this.port = port;

    const defaultOptions = {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      ...options
    };

    try {
      await this.port.open(defaultOptions);
      this.connected = true;

      if (this.port.readable) {
        this.reader = this.port.readable.getReader();
      }

      if (this.port.writable) {
        this.writer = this.port.writable.getWriter();
      }

      // Wait for device to be ready after connect
      await new Promise(r => setTimeout(r, 500));

      return true;
    } catch (err) {
      await this.close();
      throw err;
    }
  }

  /**
   * Set DTR and RTS control lines
   */
  async setControlSignals(dtr, rts) {
    if (!this.port || !this.connected) return;

    try {
      await this.port.setSignals({
        dataTerminalReady: dtr,
        requestToSend: rts
      });
    } catch (e) {
      // Some devices don't support control signals
    }
  }

  /**
   * Reset connected device via DTR toggle
   */
  async resetViaDtr() {
    await this.setControlSignals(false, false);
    await new Promise(r => setTimeout(r, 100));
    await this.setControlSignals(true, false);
    await new Promise(r => setTimeout(r, 50));
    await this.setControlSignals(false, false);
  }

  async close() {
    if (this.reader) {
      try {
        await this.reader.cancel();
        this.reader.releaseLock();
      } catch (e) { }
      this.reader = null;
    }

    if (this.writer) {
      try {
        await this.writer.close();
        this.writer.releaseLock();
      } catch (e) { }
      this.writer = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch (e) { }
      this.port = null;
    }

    this.connected = false;
    this.readBuffer = [];
    this.pendingRead = null;
  }

  async write(data) {
    if (!this.port || !this.writer) {
      throw new Error('Serial port not connected');
    }

    const encoded = data instanceof Uint8Array ? data : new Uint8Array(data);
    await this.writer.write(encoded);
  }

  async readByte(timeoutMs = 1000) {
    if (!this.port || !this.reader) {
      throw new Error('Serial port not connected');
    }

    if (this.readBuffer.length > 0) {
      return this.readBuffer.shift();
    }

    const result = await this.readChunk(timeoutMs);
    if (!result || result.done || !result.value || result.value.byteLength === 0) {
      return null;
    }

    this.readBuffer.push(...result.value);
    return this.readBuffer.shift() ?? null;
  }

  async readChunk(timeoutMs = 1000) {
    if (!this.reader) {
      return null;
    }

    if (!this.pendingRead) {
      this.pendingRead = this.reader.read();
    }

    const timeout = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs));

    try {
      const result = await Promise.race([this.pendingRead, timeout]);
      if (result) {
        this.pendingRead = null;
      }
      return result;
    } catch (e) {
      this.pendingRead = null;
      return null;
    }
  }

  clearReadBuffer() {
    this.readBuffer = [];
  }

  async drain(timeoutMs = 50) {
    if (!this.port || !this.reader) {
      return '';
    }

    let data = '';
    const deadline = Date.now() + timeoutMs;

    if (this.readBuffer.length > 0) {
      data += String.fromCharCode(...this.readBuffer);
      this.readBuffer = [];
    }

    while (Date.now() < deadline) {
      const result = await this.readChunk(Math.min(20, deadline - Date.now()));
      if (!result || result.done || !result.value || result.value.byteLength === 0) {
        break;
      }
      data += String.fromCharCode(...result.value);
    }

    return data;
  }

  getPortInfo() {
    if (!this.port) return null;
    try {
      const info = this.port.getInfo();
      return {
        vendorId: info.usbVendorId,
        productId: info.usbProductId,
      };
    } catch (e) {
      return null;
    }
  }

  formatId(id) {
    if (!id) return 'N/A';
    return '0x' + id.toString(16).toUpperCase().padStart(4, '0');
  }
}

// STM32 UART Bootloader Protocol
const CMD = {
  GET: 0x00,
  GET_VERSION: 0x01,
  GET_ID: 0x02,
  READ_MEMORY: 0x11,
  WRITE_MEMORY: 0x31,
  GO: 0x21,
  ERASE: 0x43,
  EXTENDED_ERASE: 0x44,
  WRITE_UNPROTECT: 0x73,
};

const ACK = 0x79;
const NACK = 0x1F;

class BootloaderProtocol {
  constructor(serial) {
    this.serial = serial;
    this.version = null;
    this.synced = false;
  }

  async sync() {
    if (this.synced) {
      return true;
    }

    await this.serial.write(new Uint8Array([0x7F]));
    const response = await this.serial.readByte(1000);
    this.synced = response === ACK;
    return this.synced;
  }

  async ensureSynced() {
    if (this.synced) {
      return true;
    }

    return this.sync();
  }

  async sendCommand(cmd, retry = true) {
    if (!await this.ensureSynced()) {
      throw new Error('No response from bootloader');
    }

    const cmdBytes = new Uint8Array([cmd, cmd ^ 0xFF]);
    await this.serial.write(cmdBytes);
    const response = await this.serial.readByte(1000);

    if (response !== ACK) {
      if (retry) {
        await new Promise(r => setTimeout(r, 100));
        this.serial.clearReadBuffer();

        try {
          return await this.sendCommand(cmd, false);
        } catch (err) {
          this.synced = false;
          this.serial.clearReadBuffer();

          if (await this.sync()) {
            return this.sendCommand(cmd, false);
          }
        }
      }

      throw new Error(`Command 0x${cmd.toString(16)} failed (received ${this.formatResponse(response)})`);
    }
    return true;
  }

  async sendCommandWithRetry(cmd) {
    try {
      return await this.sendCommand(cmd);
    } catch (err) {
      this.synced = false;
      this.serial.clearReadBuffer();

      if (!await this.sync()) {
        throw err;
      }

      return this.sendCommand(cmd);
    }
  }

  formatByte(byte) {
    return `0x${byte.toString(16).toUpperCase().padStart(2, '0')}`;
  }

  formatResponse(response) {
    return response === null ? 'timeout' : this.formatByte(response);
  }

  async sendData(data, label = 'Data') {
    let checksum = 0;
    for (const byte of data) {
      checksum ^= byte;
    }

    const packet = new Uint8Array([...data, checksum]);
    await this.serial.write(packet);

    const response = await this.serial.readByte(1000);
    if (response !== ACK) {
      throw new Error(`${label} rejected (received ${this.formatResponse(response)})`);
    }
    return true;
  }

  supportsCommand(cmd) {
    return !this.commands || Array.from(this.commands).includes(cmd);
  }

  async readBytes(count, timeoutMs = 5000) {
    const bytes = [];
    const deadline = Date.now() + timeoutMs;

    while (bytes.length < count && Date.now() < deadline) {
      while (this.serial.readBuffer.length > 0 && bytes.length < count) {
        bytes.push(this.serial.readBuffer.shift());
      }

      if (bytes.length >= count) {
        break;
      }

      const remainingMs = Math.max(1, Math.min(250, deadline - Date.now()));
      const result = await this.serial.readChunk(remainingMs);

      if (!result || result.done || !result.value || result.value.byteLength === 0) {
        continue;
      }

      for (const byte of result.value) {
        if (bytes.length < count) {
          bytes.push(byte);
        } else {
          this.serial.readBuffer.push(byte);
        }
      }
    }

    return new Uint8Array(bytes);
  }

  async readGetResponse() {
    const len = await this.serial.readByte(1000);
    if (len === null) throw new Error('No response from device');

    return this.readBytes(len + 2, 2000);
  }

  async get() {
    await this.sendCommandWithRetry(CMD.GET);

    const info = await this.readGetResponse();

    this.version = info[0];
    this.commands = info.slice(1, -1);

    return { version: this.version, commands: this.commands };
  }

  async readMemory(address, length) {
    if (length < 1 || length > 256) {
      throw new Error('Read length must be 1-256 bytes');
    }

    await this.sendCommand(CMD.READ_MEMORY);

    const addrBytes = new Uint8Array([
      (address >> 24) & 0xFF,
      (address >> 16) & 0xFF,
      (address >> 8) & 0xFF,
      address & 0xFF
    ]);
    await this.sendData(addrBytes, `Read address 0x${address.toString(16).toUpperCase()}`);

    const lengthByte = length - 1;
    await this.serial.write(new Uint8Array([lengthByte, lengthByte ^ 0xFF]));

    const response = await this.serial.readByte(1000);
    if (response !== ACK) {
      throw new Error(`Read length rejected (received ${this.formatResponse(response)})`);
    }

    const data = await this.readBytes(length, 8000);
    if (data.length !== length) {
      throw new Error(`Read returned ${data.length}/${length} bytes`);
    }

    return data;
  }

  async writeMemory(address, data) {
    // Must be word-aligned
    const paddedLength = Math.ceil(data.length / 4) * 4;
    const paddedData = new Uint8Array(paddedLength);
    paddedData.set(data);

    try {
      await this.sendCommand(CMD.WRITE_MEMORY);
    } catch (err) {
      throw new Error(`Write Memory command rejected. ${err.message}. Commands: ${this.formatCommands()}`);
    }

    const addrBytes = new Uint8Array([
      (address >> 24) & 0xFF,
      (address >> 16) & 0xFF,
      (address >> 8) & 0xFF,
      address & 0xFF
    ]);
    await this.sendData(addrBytes, `Write address 0x${address.toString(16).toUpperCase()}`);

    const lengthByte = paddedData.length - 1;
    let checksum = lengthByte;
    for (const byte of paddedData) {
      checksum ^= byte;
    }

    const packet = new Uint8Array(paddedData.length + 2);
    packet[0] = lengthByte;
    packet.set(paddedData, 1);
    packet[packet.length - 1] = checksum;
    await this.serial.write(packet);

    const response = await this.serial.readByte(1000);
    if (response !== ACK) {
      throw new Error(`Write data at 0x${address.toString(16).toUpperCase()} rejected (received ${this.formatResponse(response)})`);
    }

    return true;
  }

  async erase(pageNumber = 0xFF) {
    const supportsExtendedErase = this.supportsCommand(CMD.EXTENDED_ERASE);
    const supportsStandardErase = this.supportsCommand(CMD.ERASE);

    if (supportsExtendedErase) {
      await this.sendCommand(CMD.EXTENDED_ERASE);

      if (pageNumber === 0xFF) {
        await this.serial.write(new Uint8Array([0xFF, 0xFF, 0x00]));
      } else {
        const page = pageNumber;
        const pageHigh = (page >> 8) & 0xFF;
        const pageLow = page & 0xFF;
        await this.serial.write(new Uint8Array([
          0x00,
          0x00,
          pageHigh,
          pageLow,
          pageHigh ^ pageLow
        ]));
      }
    } else if (supportsStandardErase) {
      await this.sendCommand(CMD.ERASE);

      if (pageNumber === 0xFF) {
        await this.serial.write(new Uint8Array([0xFF, 0x00]));
      } else {
        const page = pageNumber & 0xFF;
        await this.serial.write(new Uint8Array([0x00, page, page]));
      }
    } else {
      throw new Error(`Bootloader does not report erase support. Commands: ${this.formatCommands()}`);
    }

    const response = await this.serial.readByte(90000);
    if (response === ACK) {
      await new Promise(r => setTimeout(r, 250));
      this.serial.clearReadBuffer();
      return true;
    }

    if (response === NACK) {
      throw new Error('Erase rejected by device (NACK) — flash may be write-protected');
    }

    throw new Error('Erase timed out — device did not respond after 90 seconds');
  }

  async erasePages(pageNumbers) {
    if (!pageNumbers.length) {
      return true;
    }

    if (pageNumbers.every(page => page >= 0 && page <= 0xFF)) {
      try {
        return await this.erasePagesStandard(pageNumbers);
      } catch (err) {
        this.serial.clearReadBuffer();
        try {
          for (const page of pageNumbers) {
            await this.erasePagesStandard([page]);
          }
          return true;
        } catch (singlePageErr) {
          this.serial.clearReadBuffer();
        }
      }
    }

    return await this.erasePagesExtended(pageNumbers);
  }

  async erasePagesStandard(pageNumbers) {
    this.serial.clearReadBuffer();
    await this.sendCommand(CMD.ERASE, false);

    const countByte = pageNumbers.length - 1;
    let checksum = countByte;
    const packet = new Uint8Array(pageNumbers.length + 2);
    packet[0] = countByte;

    for (let i = 0; i < pageNumbers.length; i++) {
      const page = pageNumbers[i] & 0xFF;
      packet[i + 1] = page;
      checksum ^= page;
    }

    packet[packet.length - 1] = checksum;
    await this.serial.write(packet);
    return await this.readEraseAck();
  }

  async erasePagesExtended(pageNumbers) {
    this.serial.clearReadBuffer();
    await this.sendCommand(CMD.EXTENDED_ERASE, false);

    const count = pageNumbers.length - 1;
    const packet = new Uint8Array(2 + (pageNumbers.length * 2) + 1);
    packet[0] = (count >> 8) & 0xFF;
    packet[1] = count & 0xFF;

    let checksum = packet[0] ^ packet[1];
    let idx = 2;
    for (const page of pageNumbers) {
      const high = (page >> 8) & 0xFF;
      const low = page & 0xFF;
      packet[idx++] = high;
      packet[idx++] = low;
      checksum ^= high ^ low;
    }

    packet[packet.length - 1] = checksum;
    await this.serial.write(packet);
    return await this.readEraseAck();
  }

  async readEraseAck() {
    const response = await this.serial.readByte(90000);
    if (response === ACK) {
      await new Promise(r => setTimeout(r, 250));
      this.serial.clearReadBuffer();
      return true;
    }

    if (response === NACK) {
      throw new Error('Erase rejected by device (NACK)');
    }

    throw new Error('Erase timed out — device did not respond after 90 seconds');
  }

  async writeUnprotect() {
    await this.sendCommand(CMD.WRITE_UNPROTECT);

    const response = await this.serial.readByte(10000);
    if (response !== ACK) {
      throw new Error(`Write unprotect failed (received ${this.formatResponse(response)})`);
    }

    this.synced = false;
    this.serial.clearReadBuffer();
    await new Promise(r => setTimeout(r, 1000));
    return true;
  }

  formatCommands() {
    if (!this.commands) return 'unknown';
    return Array.from(this.commands)
      .map(cmd => `0x${cmd.toString(16).toUpperCase().padStart(2, '0')}`)
      .join(', ');
  }

  async go(address) {
    await this.sendCommand(CMD.GO);

    const addrBytes = new Uint8Array([
      (address >> 24) & 0xFF,
      (address >> 16) & 0xFF,
      (address >> 8) & 0xFF,
      address & 0xFF
    ]);
    await this.sendData(addrBytes, `Go address 0x${address.toString(16).toUpperCase()}`);

    this.synced = false;
    return true;
  }
}

// Exports
window.SerialManager = SerialManager;
window.BootloaderProtocol = BootloaderProtocol;
window.CMD = CMD;
