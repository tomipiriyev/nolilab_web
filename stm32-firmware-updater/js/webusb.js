/**
 * WebUSB Manager
 * Handles WebUSB device connection, enumeration, and interface claiming
 */

class WebUSBManager {
  constructor() {
    this.device = null;
    this.interfaceNumber = 0;
    this.endpointOut = null;
    this.endpointIn = null;
  }

  /**
   * Check if WebUSB is supported in this browser
   */
  isSupported() {
    return 'usb' in navigator;
  }

  /**
 * Request device with DFU class codes
 * vid/pid can be passed to filter to specific STM32 device
 */
async requestDevice(vendorId = null, productId = null) {
    if (!this.isSupported()) {
      throw new Error('WebUSB is not supported in this browser. Use Chrome, Edge, or Opera.');
    }

    // Check for already paired devices first
    try {
      const devices = await navigator.usb.getDevices();
      console.log('Already paired devices:', devices);

      if (devices.length > 0) {
        // Find first device (or filter by VID if provided)
        const targetVid = vendorId || 0x0483;
        const device = devices.find(d => d.vendorId === targetVid) || devices[0];

        console.log('Using paired device:', device);
        this.device = device;
        return device;
      }
    } catch (err) {
      console.log('Error getting paired devices:', err);
    }

    // No paired device - need to request one
    // Build request filters
    const filters = [];

    // Specific VID filter if provided
    if (vendorId) {
      filters.push({ vendorId });
    } else {
      // Default: STMicroelectronics
      filters.push({ vendorId: 0x0483 });
    }

    // Standard DFU
    filters.push({ classCode: 0xFE, subclassCode: 0x01 });

    // Vendor DFU
    filters.push({ classCode: 0xFF, subclassCode: 0x01 });

    try {
      const device = await navigator.usb.requestDevice({ filters });
      this.device = device;
      return device;
    } catch (err) {
      if (err.name === 'NotFoundError') {
        return null;
      }
      throw err;
    }
  }

  /**
   * Get all connected USB devices (for debugging)
   */
  async getAllDevices() {
    try {
      const devices = await navigator.usb.getDevices();
      return devices.map(d => ({
        vendorId: d.vendorId,
        productId: d.productId,
        vendorName: d.vendorName,
        productName: d.productName,
        serialNumber: d.serialNumber,
      }));
    } catch (err) {
      console.error('Error getting devices:', err);
      return [];
    }
  }

  /**
   * Debug: log device descriptors
   */
  async debugDevice(device) {
    console.log('Device info:', {
      vendorId: this.formatId(device.vendorId),
      productId: this.formatId(device.productId),
      vendorName: device.vendorName,
      productName: device.productName,
    });

    // Open and list all interfaces
    await device.open();
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    console.log('Configuration:', device.configuration);

    for (const iface of device.configuration.interfaces) {
      console.log(`Interface ${iface.interfaceNumber}:`);
      for (const alt of iface.alternates) {
        console.log(`  Alternate ${alt.alternateSetting}: class=0x${alt.interfaceClass.toString(16)}, subclass=0x${alt.interfaceSubclass.toString(16)}, protocol=0x${alt.interfaceProtocol.toString(16)}`);
      }
    }

    await device.close();
  }

  /**
   * Connect to previously selected device
   */
  async connect(device = null) {
    if (device) {
      this.device = device;
    }

    if (!this.device) {
      throw new Error('No device selected');
    }

    try {
      console.log('Opening device...');
      await this.device.open();

      // Select configuration if needed
      if (this.device.configuration === null) {
        console.log('Selecting configuration 1...');
        await this.device.selectConfiguration(1);
      }

      // Find DFU interface - be more lenient, accept any interface
      const interfaces = this.device.configuration.interfaces;
      let foundInterface = null;

      console.log('Scanning interfaces:', interfaces.length);

      for (const iface of interfaces) {
        console.log(`Interface ${iface.interfaceNumber}:`);
        for (const alt of iface.alternates) {
          const cls = alt.interfaceClass;
          const sub = alt.interfaceSubclass;
          console.log(`  Alt ${alt.alternateSetting}: class=0x${cls.toString(16)}, subclass=0x${sub.toString(16)}, protocol=0x${alt.interfaceProtocol.toString(16)}`);

          // Accept DFU (0xFE/0x01 or 0xFF/0x01) or any vendor-specific interface
          if ((cls === 0xFE && sub === 0x01) || (cls === 0xFF && sub === 0x01)) {
            foundInterface = iface;
            this.interfaceNumber = iface.interfaceNumber;
            // Find endpoints
            for (const endpoint of alt.endpoints) {
              if (endpoint.direction === 'out') {
                this.endpointOut = endpoint.endpointNumber;
                console.log(`  -> Found OUT endpoint: ${endpoint.endpointNumber}`);
              } else if (endpoint.direction === 'in') {
                this.endpointIn = endpoint.endpointNumber;
                console.log(`  -> Found IN endpoint: ${endpoint.endpointNumber}`);
              }
            }
          }
        }
      }

      if (this.interfaceNumber === undefined) {
        // No DFU interface found - device might be in runtime mode
        // Try to claim interface 0 anyway
        this.interfaceNumber = 0;
        console.log('No DFU interface found, trying interface 0');
      }

      // Claim interface
      console.log(`Claiming interface ${this.interfaceNumber}...`);
      await this.device.claimInterface(this.interfaceNumber);

      return true;
    } catch (err) {
      await this.disconnect();
      throw err;
    }
  }

  /**
   * Disconnect and close device
   */
  async disconnect() {
    if (this.device) {
      try {
        if (this.interfaceNumber !== undefined) {
          await this.device.releaseInterface(this.interfaceNumber);
        }
        await this.device.close();
      } catch (err) {
        // Ignore close errors
      }
      this.device = null;
      this.interfaceNumber = undefined;
      this.endpointOut = null;
      this.endpointIn = null;
    }
  }

  /**
   * Control transfer (for DFU commands)
   * @param {number} requestType - bmRequestType (0x21 for host-to-device)
   * @param {number} request - bRequest
   * @param {number} value - wValue
   * @param {number} index - wIndex
   * @param {BufferSource} data - Optional data to send
   */
  async controlTransfer(requestType, request, value, index, dataOrLength = 0) {
    if (!this.device) {
      throw new Error('Device not connected');
    }

    const setup = { requestType, recipient: 'interface', request, value, index };
    if (requestType & 0x80) {
      return await this.device.controlTransferIn(setup, dataOrLength || 0);
    }

    return await this.device.controlTransferOut(setup, dataOrLength || undefined);
  }

  /**
   * Control transfer in (for reading DFU responses)
   */
  async controlTransferIn(requestType, request, value, index, length) {
    if (!this.device) {
      throw new Error('Device not connected');
    }

    return await this.device.controlTransferIn(
      { requestType, recipient: 'interface', request, value, index },
      length
    );
  }

  /**
   * Control transfer out (for sending DFU commands with data)
   */
  async controlTransferOut(requestType, request, value, index, data = null) {
    if (!this.device) {
      throw new Error('Device not connected');
    }

    if (data) {
      return await this.device.controlTransferOut(
        { requestType, recipient: 'interface', request, value, index },
        data
      );
    } else {
      return await this.device.controlTransferOut(
        { requestType, recipient: 'interface', request, value, index }
      );
    }
  }

  /**
   * Bulk transfer OUT (send data to device)
   */
  async bulkTransferOut(data) {
    if (!this.device) {
      throw new Error('Device not connected');
    }

    return await this.device.transferOut(this.endpointOut, data);
  }

  /**
   * Bulk transfer IN (read data from device)
   */
  async bulkTransferIn(length = 64) {
    if (!this.device) {
      throw new Error('Device not connected');
    }

    return await this.device.transferIn(this.endpointIn, length);
  }

  /**
   * Get device info for UI display
   */
  getDeviceInfo() {
    if (!this.device) {
      return null;
    }

    return {
      vendorId: this.device.vendorId,
      productId: this.device.productId,
      vendorName: this.device.vendorName,
      productName: this.device.productName,
      serialNumber: this.device.serialNumber,
    };
  }

  /**
   * Format vendor/product IDs as hex
   */
  formatId(id) {
    return '0x' + id.toString(16).toUpperCase().padStart(4, '0');
  }
}

// Export for use in other modules
window.WebUSBManager = WebUSBManager;
