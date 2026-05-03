/**
 * DFU Protocol Handler (dfu-util compatible)
 * Implements STM32 DFU class requests and state machine
 */

// DFU Requests
const DFU_REQUEST = {
  DETACH: 0x00,
  DNLOAD: 0x01,
  UPLOAD: 0x02,
  GETSTATUS: 0x03,
  CLRSTATUS: 0x04,
  GETSTATE: 0x05,
  ABORT: 0x06,
};

// DFU States
const DFU_STATE = {
  0x00: 'APP_IDLE',
  0x01: 'APP_DETACH',
  0x02: 'DFU_IDLE',
  0x03: 'DFU_DOWNLOAD_SYNC',
  0x04: 'DFU_DOWNLOAD_BUSY',
  0x05: 'DFU_DOWNLOAD_IDLE',
  0x06: 'DFU_MANIFEST_SYNC',
  0x07: 'DFU_MANIFEST',
  0x08: 'DFU_MANIFEST_WAIT_RESET',
  0x09: 'DFU_ERROR',
};

// DFU Status codes
const DFU_STATUS = {
  0x00: 'OK',
  0x01: 'ERROR_TARGET',
  0x02: 'ERROR_FILE',
  0x03: 'ERROR_WRITE',
  0x04: 'ERROR_ERASE',
  0x05: 'ERROR_CHECK_ERASED',
  0x06: 'ERROR_PROG',
  0x07: 'ERROR_VERIFY',
  0x08: 'ERROR_ADDRESS',
  0x09: 'ERROR_NOTDONE',
  0x0A: 'ERROR_FIRMWARE',
  0x0B: 'ERROR_VENDOR',
  0x0C: 'ERROR_USB_R',
  0x0D: 'ERROR_USB_W',
  0x0E: 'ERROR_USB_TRANSFER',
  0x0F: 'ERROR_WDT',
  0x10: 'ERROR_WRPBYTES',
  0x11: 'ERROR_MEDIA',
  0x12: 'ERROR_UNKNOWN',
};

// Request type: host-to-device, vendor, interface
const REQUEST_TYPE_OUT = 0x21;
// Request type: device-to-host, vendor, interface
const REQUEST_TYPE_IN = 0xA1;

// STM32 memory addresses (example - adjust for your device)
const STM32_FLASH_BASE = 0x08000000;
const STM32_SRAM_BASE = 0x20000000;

// Default transfer size (page size for STM32)
const DEFAULT_TRANSFER_SIZE = 2048;

class DFUProtocol {
  constructor(webusb) {
    this.usb = webusb;
    this.state = DFU_STATE[0x02]; // DFU_IDLE
    this.status = 'OK';
    this.progress = 0;
    this.onProgress = null; // Callback for progress updates
    this.onLog = null; // Callback for log messages
  }

  /**
   * Log message helper
   */
  log(message, type = 'info') {
    if (this.onLog) {
      this.onLog(message, type);
    }
  }

  /**
   * Set progress callback
   */
  setProgressCallback(callback) {
    this.onProgress = callback;
  }

  /**
   * Update progress
   */
  updateProgress(percent, phase = '') {
    this.progress = percent;
    if (this.onProgress) {
      this.onProgress(percent, phase);
    }
  }

  /**
   * Send DFU detach command
   */
  async detach() {
    this.log('Sending DETACH...');
    const result = await this.usb.controlTransferOut(
      REQUEST_TYPE_OUT,
      DFU_REQUEST.DETACH,
      0, // wValue: timeout in ms
      0  // wIndex: interface
    );
    return result;
  }

  /**
   * Download command (send data to device)
   * @param {number} blockNum - Block number (wValue)
   * @param {Uint8Array} data - Data to send
   */
  async download(blockNum, data) {
    const result = await this.usb.controlTransferOut(
      REQUEST_TYPE_OUT,
      DFU_REQUEST.DNLOAD,
      blockNum,
      0,
      data
    );
    return result;
  }

  /**
   * Upload command (read data from device)
   * @param {number} blockNum - Block number
   * @param {number} length - Bytes to read
   */
  async upload(blockNum, length) {
    const result = await this.usb.controlTransferIn(
      REQUEST_TYPE_IN,
      DFU_REQUEST.UPLOAD,
      blockNum,
      0,
      length
    );
    return result;
  }

  /**
   * Get status - poll device until it reports a non-busy state
   */
  async getStatus() {
    const result = await this.usb.controlTransferIn(
      REQUEST_TYPE_IN,
      DFU_REQUEST.GETSTATUS,
      0,
      0,
      6 // Status response is 6 bytes
    );

    if (result.data && result.data.byteLength >= 6) {
      const view = new DataView(result.data.buffer, result.data.byteOffset, result.data.byteLength);
      this.status = DFU_STATUS[view.getUint8(0)] || 'ERROR_UNKNOWN';
      this.state = DFU_STATE[view.getUint8(4)] || 'UNKNOWN';

      // Poll for completion if busy
      const pollTimeout = view.getUint8(1) | (view.getUint8(2) << 8) | (view.getUint8(3) << 16);

      if (this.state === 'DFU_DOWNLOAD_BUSY' || this.state === 'DFU_MANIFEST') {
        await this.delay(pollTimeout);
        return await this.getStatus();
      }

      return {
        status: this.status,
        state: this.state,
        pollTimeout,
      };
    }

    throw new Error('Invalid GET_STATUS response');
  }

  /**
   * Clear status
   */
  async clearStatus() {
    this.log('Clearing status...');
    await this.usb.controlTransferOut(
      REQUEST_TYPE_OUT,
      DFU_REQUEST.CLRSTATUS,
      0,
      0
    );
    return await this.getStatus();
  }

  /**
   * Get current state
   */
  async getState() {
    const result = await this.usb.controlTransferIn(
      REQUEST_TYPE_IN,
      DFU_REQUEST.GETSTATE,
      0,
      0,
      1
    );

    if (result.data && result.data.byteLength >= 1) {
      this.state = DFU_STATE[result.data.getUint8(0)] || 'UNKNOWN';
      return this.state;
    }

    throw new Error('Invalid GET_STATE response');
  }

  /**
   * Abort current operation
   */
  async abort() {
    this.log('Aborting...');
    await this.usb.controlTransferOut(
      REQUEST_TYPE_OUT,
      DFU_REQUEST.ABORT,
      0,
      0
    );
    return await this.getStatus();
  }

  /**
   * Set memory address for operations
   * Block 0: Set address pointer
   */
  async setAddress(addr) {
    this.log(`Setting address: 0x${addr.toString(16).toUpperCase()}`);
    const addrBytes = new Uint8Array(5);
    const view = new DataView(addrBytes.buffer);
    addrBytes[0] = 0x21; // CMD_SET_ADDRESS
    view.setUint32(1, addr, true);
    await this.download(0, addrBytes);
    await this.getStatus();
    return await this.getState();
  }

  /**
   * Read unprotect (erase flash)
   * Block 1: Read unprotect command
   */
  async readUnprotect() {
    this.log('Read unprotect (erase)...');
    const cmd = new Uint8Array(1);
    cmd[0] = 0x92; // CMD_READ_UNPROTECT
    await this.download(1, cmd);
    const status = await this.getStatus();
    return status;
  }

  /**
   * Erase memory at address
   */
  async eraseMemory(addr) {
    this.log(`Erasing memory at: 0x${addr.toString(16).toUpperCase()}`);
    const cmd = new Uint8Array(5);
    const view = new DataView(cmd.buffer);
    cmd[0] = 0x41; // CMD_ERASE
    view.setUint32(1, addr, true);
    await this.download(1, cmd);
    const status = await this.getStatus();

    if (status.status !== 'OK') {
      throw new Error(`Erase failed: ${status.status}`);
    }

    return status;
  }

  /**
   * Write memory at address
   * @param {number} addr - Target address
   * @param {Uint8Array} data - Data to write
   */
  async writeMemory(addr, data) {
    // Set address first
    await this.setAddress(addr);

    // Send data
    const result = await this.download(2, data);
    const status = await this.getStatus();

    if (status.status !== 'OK') {
      throw new Error(`Write failed: ${status.status}`);
    }

    return status;
  }

  /**
   * Read memory from device (for verification/backup)
   */
  async readMemory(addr, length) {
    this.log(`Reading ${length} bytes from 0x${addr.toString(16).toUpperCase()}`);

    // Set address
    await this.setAddress(addr);

    // Read data
    const result = await this.upload(0, length);

    if (result.data) {
      return new Uint8Array(result.data.buffer);
    }

    throw new Error('Upload failed');
  }

  /**
   * Jump to application
   * Block 3: Leave DFU mode
   */
  async leaveDFU() {
    this.log('Leaving DFU mode...');
    const cmd = new Uint8Array(1);
    cmd[0] = 0x21; // CMD_LEAVE
    await this.download(3, cmd);
    const status = await this.getStatus();
    return status;
  }

  /**
   * Flash firmware to device
   * @param {Uint8Array} firmware - Firmware binary data
   * @param {number} startAddr - Starting flash address
   */
  async flashFirmware(firmware, startAddr = STM32_FLASH_BASE) {
    const totalSize = firmware.length;
    let address = startAddr;

    this.log(`Flashing ${totalSize} bytes to 0x${startAddr.toString(16).toUpperCase()}`);

    // Phase 1: Erase (progress 0-25%)
    this.updateProgress(0, 'Erasing');
    this.log('Phase 1: Erasing flash...');

    await this.eraseMemory(startAddr);
    this.updateProgress(15, 'Erasing');

    this.log('Flash erased');
    this.updateProgress(25, 'Erasing complete');

    // Phase 2: Write (progress 25-75%)
    this.updateProgress(25, 'Writing');
    this.log('Phase 2: Writing firmware...');

    const pageSize = DEFAULT_TRANSFER_SIZE;
    const pages = Math.ceil(totalSize / pageSize);

    for (let page = 0; page < pages; page++) {
      const offset = page * pageSize;
      const remaining = totalSize - offset;
      const chunkSize = Math.min(pageSize, remaining);

      // Extract page data
      const pageData = firmware.slice(offset, offset + chunkSize);

      // Pad to page size if needed
      if (pageData.length < pageSize) {
        const padded = new Uint8Array(pageSize);
        padded.set(pageData);
        await this.writeMemory(address, padded);
      } else {
        await this.writeMemory(address, pageData);
      }

      address += chunkSize;

      // Update progress
      const writeProgress = 25 + (50 * (page + 1) / pages);
      this.updateProgress(writeProgress, 'Writing');
    }

    this.log('Firmware write complete');
    this.updateProgress(75, 'Writing complete');

    // Phase 3: Verify (progress 75-100%)
    this.updateProgress(75, 'Verifying');
    this.log('Phase 3: Verifying...');

    // Read back and compare
    const verificationData = await this.readMemory(startAddr, totalSize);

    if (!this.compareArrays(firmware, verificationData)) {
      this.updateProgress(75, 'Verification failed');
      throw new Error('Verification failed: firmware mismatch');
    }

    this.log('Verification successful');
    this.updateProgress(100, 'Complete');

    return true;
  }

  /**
   * Create backup of current firmware
   */
  async createBackup(length, startAddr = STM32_FLASH_BASE) {
    this.log(`Creating backup of ${length} bytes...`);
    const data = await this.readMemory(startAddr, length);
    return data;
  }

  /**
   * Restore firmware from backup
   */
  async restoreFirmware(firmware, startAddr = STM32_FLASH_BASE) {
    this.log('Restoring backup...');
    await this.eraseMemory(startAddr);
    await this.flashFirmware(firmware, startAddr);
    return true;
  }

  /**
   * Helper: compare two arrays
   */
  compareArrays(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * Helper: delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export
window.DFUProtocol = DFUProtocol;
window.DFU_REQUEST = DFU_REQUEST;
window.DFU_STATE = DFU_STATE;
window.DFU_STATUS = DFU_STATUS;
