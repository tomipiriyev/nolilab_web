/**
 * STM32 Firmware Updater - Main Application
 * UI orchestration, firmware handling, checksum, backup/restore
 * Uses Web Serial API for device communication
 */

// IndexedDB for backup storage
const DB_NAME = 'stm32-updater';
const DB_VERSION = 1;
const BACKUP_STORE = 'backups';

// STM32 Flash configuration
const STM32_FLASH_ORIGIN = 0x08000000;
const STM32_FLASH_BASE = 0x08008000;
const STM32_FLASH_PAGE_SIZE = 2048;
const STM32_SRAM_BASE = 0x20000000;
const STM32_SRAM_END = 0x30000000;

/**
 * Parse Intel HEX file to binary (async, non-blocking)
 * Addresses are resolved to the application flash base (0x08008000).
 */
async function parseHexFile(content) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lines = content.split(/\r\n|\n|\r/);
      let dataRecords = []; // Store {address, data} pairs
      let extendedAddress = 0;
      let minAddress = Infinity;
      let maxAddress = 0;

      for (const line of lines) {
        if (!line.startsWith(':')) continue;

        const data = hexLineToBytes(line);
        if (!data || data.length < 5) continue;

        const byteCount = data[0];
        const address = (data[1] << 8) | data[2];
        const recordType = data[3];

        if (byteCount !== data.length - 5) continue;

        switch (recordType) {
          case 0x00: {
            const fullAddress = (extendedAddress << 16) | address;
            const dataBytes = Array.from(data.slice(4, 4 + byteCount));
            dataRecords.push({ address: fullAddress, data: dataBytes });

            if (fullAddress < minAddress) minAddress = fullAddress;
            if (fullAddress + byteCount > maxAddress) maxAddress = fullAddress + byteCount;
            break;
          }
          case 0x02:
            if (byteCount === 2) {
              extendedAddress = (data[4] << 12) | (data[5] << 4);
            }
            break;
          case 0x04:
            if (byteCount === 2) {
              extendedAddress = ((data[4] << 24) | (data[5] << 16)) >> 16;
            }
            break;
          case 0x01:
            break;
        }
      }

      if (minAddress === Infinity) {
        resolve({ data: new Uint8Array(0), baseAddress: STM32_FLASH_BASE });
        return;
      }

      // Build binary array starting from offset 0 (relative to min address)
      const binarySize = maxAddress - minAddress;
      const binary = new Uint8Array(binarySize);
      binary.fill(0xFF);

      for (const rec of dataRecords) {
        const offset = rec.address - minAddress;
        binary.set(rec.data, offset);
      }

      let baseAddress = minAddress;
      if (baseAddress < STM32_FLASH_BASE && binary.length >= 8) {
        const view = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
        const resetVector = view.getUint32(4, true);
        if (resetVector >= STM32_FLASH_BASE) {
          baseAddress = STM32_FLASH_BASE;
        }
      }

      resolve({ data: binary, baseAddress });
    }, 0);
  });
}

function hexLineToBytes(hexLine) {
  const bytes = [];
  for (let i = 1; i < hexLine.length; i += 2) {
    const byte = parseInt(hexLine.substr(i, 2), 16);
    if (isNaN(byte)) return null;
    bytes.push(byte);
  }
  return new Uint8Array(bytes);
}

class FirmwareUpdater {
  constructor() {
    this.serial = new SerialManager();
    this.bootloader = null;
    this.connected = false;
    this.isConnecting = false;
    this.isFlashing = false;
    this.isRebooting = false;
    this.firmwareData = null;
    this.firmwareBaseAddress = STM32_FLASH_BASE;
    this.firmwareChecksum = null;
    this.backupChecksum = null;
    this.backupData = null;
    this.backupBaseAddress = STM32_FLASH_BASE;
    this.db = null;

    // DOM elements
    this.elements = {};

    // Bind methods
    this.handleFileSelect = this.handleFileSelect.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  /**
   * Initialize the application
   */
  async init() {
    // Check browser support
    if (!this.serial.isSupported()) {
      this.showUnsupportedBrowser();
      return;
    }

    // Cache DOM elements
    this.cacheElements();

    // Initialize IndexedDB
    await this.initDB();

    // Set up event listeners
    this.setupEventListeners();

    this.log('Ready. Connect your STM32 device.');
  }

  /**
   * Cache DOM element references
   */
  cacheElements() {
    this.elements = {
      connectBtn: document.getElementById('connect-btn'),
      deviceStatus: document.getElementById('device-status'),
      deviceInfo: document.getElementById('device-info'),
      disconnectBtn: document.getElementById('disconnect-btn'),
      dropZone: document.getElementById('drop-zone'),
      downloadFirmwareBtn: document.getElementById('download-firmware-btn'),
      fileInput: document.getElementById('file-input'),
      firmwareInfo: document.getElementById('firmware-info'),
      firmwareFilename: document.getElementById('firmware-filename'),
      firmwareSize: document.getElementById('firmware-size'),
      firmwareChecksum: document.getElementById('firmware-checksum'),
      flashBtn: document.getElementById('flash-btn'),
      progressContainer: document.getElementById('progress-container'),
      progressBar: document.getElementById('progress-bar'),
      progressText: document.getElementById('progress-text'),
      progressPhase: document.getElementById('progress-phase'),
      statusIcon: document.getElementById('status-icon'),
      verificationBadge: document.getElementById('verification-badge'),
      logContainer: document.getElementById('log-container'),
    };
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    this.elements.connectBtn.addEventListener('click', () => this.connect());
    this.elements.disconnectBtn.addEventListener('click', () => this.disconnect());
    this.elements.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.elements.dropZone.classList.add('drag-over');
    });
    this.elements.dropZone.addEventListener('dragleave', () => {
      this.elements.dropZone.classList.remove('drag-over');
    });
    this.elements.dropZone.addEventListener('drop', this.handleDrop);

    // Click on drop zone opens file picker
    this.elements.dropZone.addEventListener('click', () => {
      this.elements.fileInput.click();
    });

    this.elements.fileInput.addEventListener('change', this.handleFileSelect);
    this.elements.downloadFirmwareBtn.addEventListener('click', () => this.downloadLatestFirmware());

    this.elements.flashBtn.addEventListener('click', () => this.flashFirmware());

    this.updateUI();
  }

  /**
   * Initialize IndexedDB
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(BACKUP_STORE)) {
          db.createObjectStore(BACKUP_STORE, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  /**
   * Connect to device
   */
  async connect() {
    if (this.isConnecting || this.connected) {
      return;
    }

    this.isConnecting = true;
    this.elements.connectBtn.disabled = true;

    try {
      this.log('Requesting serial port...');
      this.updateDeviceStatus('Connecting...', 'pending');

      const port = await this.serial.requestPort();

      if (!port) {
        this.updateDeviceStatus('No port selected', 'error');
        return;
      }

      this.log('Opening port...');
      await this.openSerialPort(port);

      // Initialize bootloader protocol
      this.bootloader = new BootloaderProtocol(this.serial);

      this.connected = true;

      this.updateDeviceStatus('Connected', 'success');
      this.updateDeviceInfo();

      this.elements.connectBtn.style.display = 'none';
      this.elements.disconnectBtn.style.display = 'block';

      this.log('Connected via Web Serial');

      await this.rebootToBootloader();

      // Check for existing backup
      await this.checkBackup();

      this.updateUI();

    } catch (err) {
      const message = this.getConnectionErrorMessage(err);
      this.log(`Connection failed: ${message}`, 'error');
      this.updateDeviceStatus('Connection failed', 'error');
      this.connected = false;
      this.elements.connectBtn.style.display = 'block';
      this.elements.disconnectBtn.style.display = 'none';
      this.updateUI();
    } finally {
      this.isConnecting = false;
      this.elements.connectBtn.disabled = false;
    }
  }

  async openSerialPort(port) {
    try {
      await this.serial.open(port);
    } catch (err) {
      if (!this.isPortOpenFailure(err)) {
        throw err;
      }

      this.log('Port did not open; retrying once after release delay...', 'warning');
      await new Promise(r => setTimeout(r, 1000));
      await this.serial.open(port);
    }
  }

  isPortOpenFailure(err) {
    return err && /open serial port|already open|busy|denied/i.test(err.message || '');
  }

  getConnectionErrorMessage(err) {
    if (this.isPortOpenFailure(err)) {
      return 'Serial port is busy or not released. Close STM32CubeProgrammer and other browser tabs using this port, then unplug/replug the device and try again.';
    }

    return err.message || 'Unknown error';
  }

  /**
   * Disconnect from device
   */
  async disconnect() {
    try {
      await this.serial.close();
      this.connected = false;

      this.updateDeviceStatus('Disconnected', '');
      this.elements.deviceInfo.innerHTML = '';
      this.elements.connectBtn.style.display = 'block';
      this.elements.disconnectBtn.style.display = 'none';

      this.log('Disconnected');
      this.updateUI();
    } catch (err) {
      this.log(`Disconnect error: ${err.message}`, 'error');
    }
  }

  /**
   * Reboot device into bootloader mode via DTR toggle
   */
  async rebootToBootloader() {
    if (this.isRebooting || !this.connected || !this.bootloader) {
      return;
    }

    this.isRebooting = true;

    try {
      this.log('Rebooting device to bootloader mode...');
      this.updateDeviceStatus('Rebooting...', 'pending');

      // Drain any pending data
      await this.serial.drain(100);
      this.serial.clearReadBuffer();
      this.bootloader.synced = false;

      // Toggle DTR to trigger reset
      // The device resets when USB disconnects/reconnects
      await this.serial.resetViaDtr();

      // Wait for device to come back up in bootloader
      this.log('Waiting for bootloader...');
      this.serial.clearReadBuffer();

      // Try to sync with bootloader. Some boards reset immediately but need
      // several seconds before the UART bootloader starts responding.
      const synced = await this.waitForBootloader(8000, false);
      if (synced) {
        this.log('Bootloader mode active', 'success');
        this.updateDeviceStatus('Bootloader active', 'success');
      } else {
        this.log('Could not detect bootloader - device may not support auto-boot', 'warning');
        this.updateDeviceStatus('Connected', 'success');
      }

    } catch (err) {
      this.log(`Reboot failed: ${err.message}`, 'error');
      this.updateDeviceStatus('Reboot failed', 'error');
    } finally {
      this.isRebooting = false;
    }
  }

  /**
   * Poll the STM32 UART bootloader until it responds or the deadline expires.
   */
  async waitForBootloader(timeoutMs, allowCommandProbe = true) {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 250));

      try {
        await this.serial.drain(25);
        const synced = allowCommandProbe
          ? await this.bootloader.ensureSynced()
          : await this.bootloader.sync();

        if (synced) {
          return true;
        }
      } catch (err) {
        // The USB serial device can be unavailable while it is resetting.
      }
    }

    return false;
  }

  /**
   * Handle file selection
   */
  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      this.loadFirmware(file);
    }
  }

  /**
   * Handle file drop
   */
  handleDrop(event) {
    event.preventDefault();
    this.elements.dropZone.classList.remove('drag-over');

    const file = event.dataTransfer.files[0];
    if (!file) return;

    const ext = file.name.toLowerCase();
    if (ext.endsWith('.bin') || ext.endsWith('.hex') || file.type === 'application/octet-stream') {
      this.loadFirmware(file);
    } else {
      this.log('Please drop a .bin or .hex file', 'error');
    }
  }

  downloadLatestFirmware() {
    this.log('Loko Air firmware download is not linked yet', 'warning');
  }

  /**
   * Load firmware file
   */
  async loadFirmware(file) {
    try {
      this.log(`Loading firmware: ${file.name}`);

      const ext = file.name.toLowerCase();

      if (ext.endsWith('.hex')) {
        const text = await file.text();
        const parsed = await parseHexFile(text);
        this.firmwareData = parsed.data;
        this.firmwareBaseAddress = parsed.baseAddress;
        this.log('Parsed .hex file');
      } else {
        this.firmwareData = await file.arrayBuffer().then(buf => new Uint8Array(buf));
        this.firmwareBaseAddress = STM32_FLASH_BASE;
      }

      if (!this.firmwareData || this.firmwareData.length === 0) {
        throw new Error('Firmware file is empty');
      }

      // Calculate checksum
      this.firmwareChecksum = await this.calculateChecksum(this.firmwareData);

      // Update UI
      this.elements.firmwareFilename.textContent = file.name;
      this.elements.firmwareSize.textContent = this.formatSize(this.firmwareData.length);
      this.elements.firmwareChecksum.textContent = this.formatChecksum(this.firmwareChecksum);
      this.elements.firmwareInfo.style.display = 'block';

      this.log(`Firmware loaded: ${this.formatSize(this.firmwareData.length)}`);
      this.log(`Address: 0x${this.firmwareBaseAddress.toString(16).toUpperCase()}`);
      this.log(`SHA-256: ${this.formatChecksum(this.firmwareChecksum)}`);
      this.validateFirmwareVectorTable();

      this.updateUI();
    } catch (err) {
      this.log(`Failed to load firmware: ${err.message}`, 'error');
      this.firmwareData = null;
      this.firmwareBaseAddress = STM32_FLASH_BASE;
      this.updateUI();
      console.error('Firmware load error:', err);
    }
  }

  /**
   * Calculate SHA-256 checksum
   */
  async calculateChecksum(data) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  }

  async verifyFirmwareWrite(address, expectedData) {
    this.log('Verifying written firmware...');

    const readBack = new Uint8Array(expectedData.length);
    const chunkSize = 256;
    const chunks = Math.ceil(expectedData.length / chunkSize);

    for (let i = 0; i < chunks; i++) {
      const offset = i * chunkSize;
      const size = Math.min(chunkSize, expectedData.length - offset);
      const chunk = await this.bootloader.readMemory(address + offset, size);
      readBack.set(chunk, offset);

      const progress = 95 + (4 * (i + 1) / chunks);
      this.updateProgress(progress, `Verifying ${Math.round(progress)}%`);
    }

    for (let i = 0; i < expectedData.length; i++) {
      if (readBack[i] !== expectedData[i]) {
        throw new Error(`Verification failed at 0x${(address + i).toString(16).toUpperCase()}: wrote 0x${expectedData[i].toString(16).padStart(2, '0').toUpperCase()}, read 0x${readBack[i].toString(16).padStart(2, '0').toUpperCase()}`);
      }
    }

    const readChecksum = await this.calculateChecksum(readBack);
    this.log(`Verified SHA-256: ${this.formatChecksum(readChecksum)}`);
  }

  async createFlashBackup() {
    if (!this.bootloader.supportsCommand(CMD.READ_MEMORY)) {
      return;
    }

    try {
      this.log('Creating backup before flash...');
      const backup = new Uint8Array(this.firmwareData.length);
      const chunkSize = 256;
      const chunks = Math.ceil(this.firmwareData.length / chunkSize);

      for (let i = 0; i < chunks; i++) {
        const offset = i * chunkSize;
        const size = Math.min(chunkSize, this.firmwareData.length - offset);
        const chunk = await this.bootloader.readMemory(this.firmwareBaseAddress + offset, size);
        backup.set(chunk, offset);
      }

      this.backupData = backup;
      this.backupBaseAddress = this.firmwareBaseAddress;
      this.backupChecksum = await this.calculateChecksum(backup);
      await this.saveBackup();
      this.log('Backup saved', 'success');
    } catch (err) {
      this.log(`Backup skipped: ${err.message}`, 'warning');
    }
  }

  async eraseFirmwareRange() {
    const firstPage = Math.floor((this.firmwareBaseAddress - STM32_FLASH_ORIGIN) / STM32_FLASH_PAGE_SIZE);
    const pageCount = Math.ceil(this.firmwareData.length / STM32_FLASH_PAGE_SIZE);
    const pages = Array.from({ length: pageCount }, (_, i) => firstPage + i);
    const lastPage = pages[pages.length - 1];

    this.log(`Erasing application sectors ${firstPage}-${lastPage}...`);
    await this.bootloader.erasePages(pages);
    this.log('Application sectors erased');
  }

  validateFirmwareVectorTable() {
    if (!this.firmwareData || this.firmwareData.length < 8) {
      throw new Error('Firmware is too small to contain a vector table');
    }

    const { initialStack, resetVector } = this.getFirmwareVectorTable();

    if (initialStack < STM32_SRAM_BASE || initialStack >= STM32_SRAM_END) {
      throw new Error(`Invalid vector table: stack pointer 0x${initialStack.toString(16).toUpperCase()} is not in SRAM`);
    }

    if (resetVector < STM32_FLASH_BASE || resetVector >= STM32_FLASH_BASE + 0x400000) {
      throw new Error(`Invalid vector table: reset vector 0x${resetVector.toString(16).toUpperCase()} is not in flash`);
    }

    this.log(`Initial SP: 0x${initialStack.toString(16).toUpperCase()}`);
    this.log(`Reset vector: 0x${resetVector.toString(16).toUpperCase()}`);
  }

  getFirmwareVectorTable() {
    const view = new DataView(
      this.firmwareData.buffer,
      this.firmwareData.byteOffset,
      this.firmwareData.byteLength
    );

    return {
      initialStack: view.getUint32(0, true),
      resetVector: view.getUint32(4, true),
    };
  }

  /**
   * Flash firmware to device (using STM32 UART bootloader)
   */
  async flashFirmware() {
    if (!this.connected || !this.firmwareData || !this.bootloader || this.isFlashing) {
      return;
    }

    this.isFlashing = true;
    this.elements.flashBtn.disabled = true;
    this.elements.progressContainer.style.display = 'block';
    this.elements.verificationBadge.style.display = 'none';

    try {
      // 1. Connect to bootloader
      this.log('Connecting to bootloader...');
      this.updateProgress(5, 'Connecting');

      const synced = await this.waitForBootloader(8000);
      if (!synced) {
        throw new Error('No response from bootloader. Make sure device is in bootloader mode.');
      }
      this.log('Bootloader synced');

      // 2. Get bootloader info
      this.updateProgress(10, 'Getting info');
      const info = await this.bootloader.get();
      this.log(`Bootloader version: 0x${info.version.toString(16)}`);
      this.log(`Supported commands: ${info.commands.length}`);
      this.log(`Commands: ${this.bootloader.formatCommands()}`);
      if (!this.bootloader.supportsCommand(CMD.WRITE_MEMORY)) {
        this.log('Bootloader did not report Write Memory support; trying anyway', 'warning');
      }

      // 3. Erase flash
      this.updateProgress(15, 'Erasing');

      this.log('Skipping backup before flash; UART bootloader rejects readback in this mode', 'warning');
      await this.eraseFirmwareRange();

      this.updateProgress(25, 'Erase complete');

      // 4. Write firmware
      this.log('Writing firmware...');
      const totalSize = this.firmwareData.length;
      const chunkSize = 128;
      const chunks = Math.ceil(totalSize / chunkSize);
      let triedWriteUnprotect = false;

      for (let i = 0; i < chunks; i++) {
        const offset = i * chunkSize;
        const remaining = totalSize - offset;
        const size = Math.min(chunkSize, remaining);
        const chunk = this.firmwareData.slice(offset, offset + size);

        const address = this.firmwareBaseAddress + offset;
        try {
          await this.bootloader.writeMemory(address, chunk);
        } catch (err) {
          const isWriteRejected =
            err.message.includes('Write Memory command rejected') ||
            err.message.includes('Write address');

          if (i !== 0 || triedWriteUnprotect || !isWriteRejected) {
            throw err;
          }

          triedWriteUnprotect = true;
          this.log('Write rejected; trying write unprotect...', 'warning');
          try {
            await this.bootloader.writeUnprotect();
          } catch (unprotectErr) {
            throw new Error(
              `Write rejected at 0x${address.toString(16).toUpperCase()} and write unprotect failed: ` +
              `${unprotectErr.message}. Use STM32CubeProgrammer to check option bytes/write protection.`
            );
          }

          this.log('Waiting for bootloader after write unprotect...');
          if (!await this.waitForBootloader(10000, false)) {
            throw new Error('No response after write unprotect');
          }

          this.log('Bootloader synced after write unprotect');
          const retryInfo = await this.bootloader.get();
          this.log(`Commands after unprotect: ${this.bootloader.formatCommands()}`);

          await this.eraseFirmwareRange();

          i = -1;
          continue;
        }

        const progress = 25 + (70 * (i + 1) / chunks);
        this.updateProgress(progress, `Writing ${Math.round(progress)}%`);
      }

      if (this.bootloader.supportsCommand(CMD.READ_MEMORY)) {
        await this.verifyFirmwareWrite(this.firmwareBaseAddress, this.firmwareData);
      } else {
        this.log('Skipping verification; bootloader does not report Read Memory support', 'warning');
      }

      this.updateProgress(99, 'Starting app');
      this.log(`Starting application at 0x${this.firmwareBaseAddress.toString(16).toUpperCase()}...`);
      await this.bootloader.go(this.firmwareBaseAddress);

      this.updateProgress(100, 'Complete');
      this.showVerificationSuccess();
      this.log('Flash complete!', 'success');

      setTimeout(() => this.disconnect(), 2000);

    } catch (err) {
      this.log(`Flash failed: ${err.message}`, 'error');
      console.error('Flash error:', err);
      this.showFlashError(err.message);
    } finally {
      this.isFlashing = false;
      this.elements.flashBtn.disabled = false;
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup() {
    if (!this.connected || !this.backupData) {
      this.log('No backup to restore', 'error');
      return;
    }

    this.log('Restoring backup... (using same flash procedure)');

    // Temporarily swap firmware data
    const currentFirmware = this.firmwareData;
    const currentBaseAddress = this.firmwareBaseAddress;
    this.firmwareData = this.backupData;
    this.firmwareBaseAddress = this.backupBaseAddress || STM32_FLASH_BASE;

    try {
      await this.flashFirmware();
    } finally {
      this.firmwareData = currentFirmware;
      this.firmwareBaseAddress = currentBaseAddress;
    }
  }

  /**
   * Save backup to IndexedDB
   */
  async saveBackup() {
    if (!this.db || !this.backupData) return;

    const backup = {
      timestamp: Date.now(),
      data: Array.from(this.backupData),
      checksum: Array.from(this.backupChecksum || []),
      baseAddress: this.backupBaseAddress,
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([BACKUP_STORE], 'readwrite');
      const store = tx.objectStore(BACKUP_STORE);
      store.clear();
      const request = store.add(backup);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load latest backup
   */
  async loadBackup() {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([BACKUP_STORE], 'readonly');
      const store = tx.objectStore(BACKUP_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const backups = request.result;
        if (backups.length > 0) {
          const latest = backups.reduce((a, b) => a.timestamp > b.timestamp ? a : b);
          resolve(latest);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check for existing backup
   */
  async checkBackup() {
    const backup = await this.loadBackup();
    if (backup) {
      this.backupData = new Uint8Array(backup.data);
      this.backupBaseAddress = backup.baseAddress || STM32_FLASH_BASE;
      this.backupChecksum = backup.checksum ? new Uint8Array(backup.checksum) : null;
      this.log(`Backup found from ${new Date(backup.timestamp).toLocaleString()}`);
    }
  }

  /**
   * Update progress display
   */
  updateProgress(percent, phase) {
    this.elements.progressBar.style.width = `${percent}%`;
    this.elements.progressText.textContent = `${Math.round(percent)}%`;
    this.elements.progressPhase.textContent = phase;
  }

  /**
   * Add log entry
   */
  log(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] ${message}`;
    this.elements.logContainer.appendChild(entry);
    this.elements.logContainer.scrollTop = this.elements.logContainer.scrollHeight;
  }

  /**
   * Update device status
   */
  updateDeviceStatus(status, type) {
    this.elements.deviceStatus.textContent = status;
    this.elements.deviceStatus.className = `status-text status-${type}`;
    this.elements.statusIcon.className = `status-icon ${type}`;
  }

  /**
   * Update device info
   */
  updateDeviceInfo() {
    this.elements.deviceInfo.innerHTML = '<div class="device-detail"><span class="label">Status:</span><span class="value">Connected</span></div>';
  }

  /**
   * Show verification success
   */
  showVerificationSuccess() {
    this.elements.verificationBadge.style.display = 'flex';
    this.elements.verificationBadge.className = 'badge badge-success';
    this.elements.verificationBadge.innerHTML = `
      <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M5 12l4 4L19 6"/>
      </svg>
      <span>Complete</span>
    `;
  }

  /**
   * Show flash error
   */
  showFlashError(message) {
    this.elements.verificationBadge.style.display = 'flex';
    this.elements.verificationBadge.className = 'badge badge-error';
    this.elements.verificationBadge.innerHTML = `
      <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M6 6l12 12M18 6 6 18"/>
      </svg>
      <span>Failed: ${message}</span>
    `;
  }

  /**
   * Show unsupported browser
   */
  showUnsupportedBrowser() {
    document.querySelector('.main-card').innerHTML = `
      <div class="unsupported">
        <h2>Browser Not Supported</h2>
        <p>Web Serial API requires a Chromium-based browser.</p>
        <p>Please use:</p>
        <ul>
          <li>Google Chrome 89+</li>
          <li>Microsoft Edge 89+</li>
          <li>Opera 75+</li>
        </ul>
      </div>
    `;
  }

  /**
   * Update UI state
   */
  updateUI() {
    const canFlash = this.connected && this.firmwareData && !this.isFlashing;
    this.elements.flashBtn.disabled = !canFlash;
    this.elements.flashBtn.style.opacity = canFlash ? 1 : 0.5;
    this.elements.dropZone.style.opacity = this.connected ? 1 : 0.5;
    this.elements.dropZone.style.pointerEvents = this.connected ? 'auto' : 'none';
  }

  /**
   * Format file size
   */
  formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Format checksum for display
   */
  formatChecksum(hashArray) {
    return Array.from(hashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const app = new FirmwareUpdater();
  app.init();
});

window.FirmwareUpdater = FirmwareUpdater;
