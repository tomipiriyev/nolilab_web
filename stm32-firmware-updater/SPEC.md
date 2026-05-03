# STM32 Firmware Updater — WebUSB Tool

## Overview

Single-page browser-based tool for upgrading STM32 firmware via USB using WebUSB API and dfu-util protocol.

## User Flow

1. User connects STM32 in DFU mode (bootloader) to PC via USB
2. User opens the page, clicks "Connect Device"
3. Browser prompts to select the STM32 DFU device
4. User selects firmware `.bin` file (drag-drop or file picker)
5. Page displays firmware info (size, SHA-256 checksum)
6. User clicks "Flash Firmware"
7. Progress bar shows erase → write → verify phases
8. On success: "Firmware updated successfully!" + checksum match badge
9. On failure: error message + auto-rollback (if backup available)

## UI Design

### Layout
- Centered card (max-width 600px)
- Dark theme (developer tool aesthetic)

### Sections
1. **Header** — Tool name + status indicator
2. **Device Panel** — Connect button, device info when connected
3. **Firmware Panel** — Drop zone, file info, checksum display
4. **Flash Panel** — Flash button, progress bar, phase labels
5. **Log Panel** — Scrolling log of operations with timestamps

### Color Palette
```
--bg-primary: #0d1117
--bg-secondary: #161b22
--bg-card: #21262d
--border: #30363d
--text-primary: #e6edf3
--text-secondary: #8b949e
--accent: #238636 (green — success/connect)
--accent-hover: #2ea043
--warning: #d29922
--error: #f85149
--info: #58a6ff
```

## Technical Spec

### DFU Protocol (dfu-util compatible)

**USB Configuration:**
- Class: 0xFF (Vendor Specific)
- Subclass: 0x01 (DFU mode run-time)
- Protocol: 0x01 (DFU mode)

**Requests (bmRequestType = 0x21):**
| Request | Value | Description |
|---------|-------|-------------|
| DETACH | 0x00 | Leave DFU mode |
| DNLOAD | 0x01 | Download data to device |
| UPLOAD | 0x02 | Upload data from device |
| GETSTATUS | 0x03 | Get device status |
| CLRSTATUS | 0x04 | Clear status |
| GETSTATE | 0x05 | Get state |
| ABORT | 0x06 | Abort current operation |

**DFU States:**
- APP_IDLE (0x00), APP_DETACH (0x01)
- DFU_IDLE (0x02), DFU_DOWNLOAD_SYNC (0x03)
- DFU_DOWNLOAD_BUSY (0x04), DFU_DOWNLOAD_IDLE (0x05)
- DFU_MANIFEST_SYNC (0x06), DFU_MANIFEST (0x07)
- DFU_MANIFEST_WAIT_RESET (0x08), DFU_ERROR (0x09)

**DFU Status Codes:**
- OK (0x00), ERROR_TARGET (0x01), ERROR_FILE (0x02)
- ERROR_WRITE (0x03), ERROR_ERASE (0x04), ERROR_CHECK_ERASED (0x05)
- ERROR_PROG (0x06), ERROR_VERIFY (0x07), ERROR_ADDRESS (0x08)
- ERROR_NOTDONE (0x09), ERROR_FIRMWARE (0x0A), ERROR_VENDOR (0x0B)
- ERROR_USB_R (0x0C), ERROR_USB_W (0x0D), ERROR_USB_TRANSFER (0x0E)
- ERROR_WDT (0x0F), ERROR_WRPBYTES (0x10), ERROR_MEDIA (0x11)
- ERROR_UNKNOWN (0x12)

### Flash Sequence

1. **DETACH** — Tell device to enter DFU
2. **DNLOAD (wValue=0)** — Set memory address (write flash starting address 0x08000000)
3. **DNLOAD (wValue=1)** — Erase memory (send erase command)
4. **GETSTATUS** — Poll until DFU_IDLE
5. **DNLOAD (wValue=2, data=firmware chunks)** — Write flash in 2048-byte pages
6. **GETSTATUS** — After each page, poll
7. **DNLOAD (wValue=3)** — Leave DFU (jump to app)

### Verification
- Compute SHA-256 of firmware file (display before flash)
- After writing, read back and compare checksums
- Display verification result in UI

### Rollback
- Before flashing, upload current firmware from device (UPLOAD request)
- Store in IndexedDB with timestamp
- On failure, offer "Restore Backup" button

## File Structure

```
stm32-firmware-updater/
├── SPEC.md
├── index.html
├── css/
│   └── style.css
└── js/
    ├── app.js          # UI logic, orchestration
    ├── dfu.js          # DFU protocol commands
    └── webusb.js       # WebUSB device management
```

## Browser Compatibility

- Chrome 78+ (WebUSB supported)
- Edge 79+ (Chromium-based)
- Opera 64+
- Samsung Internet 13.0+

**Note:** Firefox and Safari do NOT support WebUSB. Display message for unsupported browsers.

## Security Notes

- Page must be served over HTTPS (or localhost) for WebUSB to work
- No firmware is uploaded to any server — all processing is client-side
- Backup stored in IndexedDB (local to browser)