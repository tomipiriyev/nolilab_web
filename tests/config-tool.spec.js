const { test, expect } = require('@playwright/test');

test('GNSS trace playback can play, pause, and scrub loaded fixes', async ({ page }) => {
  await page.goto('/loko-config-tool/?map3d=0');
  await page.getByRole('tab', { name: 'GNSS Trace' }).click();

  await page.evaluate(() => {
    window.setGnssTraceRecordsBuffer([
      { recordNumber: 1, date: '26/09/13', time: '10:00:00', latitude: 40.40, longitude: 49.86, alt: 10, speedMps: 1, hdop: 1, batteryMv: 3800 },
      { recordNumber: 2, date: '26/09/13', time: '10:00:01', latitude: 40.41, longitude: 49.87, alt: 11, speedMps: 1, hdop: 1, batteryMv: 3790 },
      { recordNumber: 3, date: '26/09/13', time: '10:00:02', latitude: 40.42, longitude: 49.88, alt: 12, speedMps: 1, hdop: 1, batteryMv: 3780 },
    ]);
  });

  const play = page.getByRole('button', { name: 'Play GNSS trace' });
  const slider = page.getByRole('slider', { name: 'GNSS trace position' });
  await expect(play).toBeEnabled();
  await expect(slider).toHaveAttribute('max', '2');
  await expect(page.locator('#gnssTracePlaybackPosition')).toHaveText('1 / 3');

  await slider.fill('2');
  await slider.dispatchEvent('input');
  await expect(page.locator('#gnssTracePlaybackPosition')).toHaveText('3 / 3');

  await play.click();
  await expect(page.getByRole('button', { name: 'Pause GNSS trace' })).toBeVisible();
  await expect(page.locator('#gnssTracePlaybackPosition')).toHaveText('1 / 3');
  await expect(page.locator('#gnssTracePlaybackPosition')).toHaveText('2 / 3', { timeout: 1_500 });
  await page.getByRole('button', { name: 'Pause GNSS trace' }).click();
  await expect(play).toBeVisible();
});

// ── Meshtastic mode ──────────────────────────────────────────────────────────

// Reference djb2 + slot formula written independently of app.js, from
// RadioInterface::applyModemConfig() in meshtastic/firmware v2.7.26.
function referenceMeshtasticHz(freqStartMHz, freqEndMHz, bandwidthKHz, channelName) {
  let hash = 5381n;
  for (const char of channelName) {
    hash = (hash * 33n + BigInt(char.charCodeAt(0))) % 2n ** 32n;
  }
  const slotCount = Math.floor((freqEndMHz - freqStartMHz) / (bandwidthKHz / 1000));
  const slot = Number(hash % BigInt(slotCount));
  return Math.round(freqStartMHz * 1e6 + bandwidthKHz * 500 + slot * bandwidthKHz * 1000);
}

function formatMHz(hz) {
  return `${(hz / 1e6).toFixed(4).replace(/0+$/, '').replace(/\.$/, '')} MHz`;
}

const AES256_KEY_BYTES = Buffer.from([...Array(32).keys()]);
const AES256_KEY_BASE64 = AES256_KEY_BYTES.toString('base64');
const AES256_KEY_HEX = AES256_KEY_BYTES.toString('hex').toUpperCase();
const US_MEDIUM_FAST_LOKO_HZ = referenceMeshtasticHz(902, 928, 250, 'Loko');

// A Loko Air on Web Serial: answers the text CLI the way Core/cmd_line/cmd_line.c
// does (OK / ERR lines, `info` dump with tab-indented fields and CRLF), and
// applies the settings so a `reset` + `info` reads them back.
async function installFakeLokoAir(page, { legacy = false, state = {} } = {}) {
  await page.addInitScript(({ legacy, state }) => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const PRESETS = ['LongFast', 'LongSlow', 'LongMod', 'LongTurbo', 'MediumSlow', 'MediumFast', 'ShortSlow', 'ShortFast', 'ShortTurbo'];
    const device = {
      id1: 1, id2: 2, loraFrequencyHz: 868000000, txPower: 14, p2pEncrypted: 0, extended: 0,
      wakeupPeriodS: 60, saveEvery: 1, sendEvery: 1, gnssMode: 0, lorawan: 0,
      meshtastic: 0, nodeId: '!829f9b97', meshFrequencyHz: 869525000, meshPreset: 'LongFast',
      meshChannel: '', meshHops: 3, meshKey: 'default', region: 'EU868',
      ...state,
    };
    const commands = [];
    window.__fakeLokoAir = { device, commands };

    let controller = null;
    let pending = '';
    const send = (text) => controller.enqueue(encoder.encode(text));

    function info() {
      const lines = [
        'Loko v2.1.11', 'Flavor: main', 'Settings:',
        '\t.is_debug_output = 0',
        `\t.id_1 = ${device.id1}`,
        `\t.id_2 = ${device.id2}`,
        `\t.lora_frequency_hz = ${device.loraFrequencyHz}`,
        '\t.lora_spreading_factor = 12',
        `\t.tx_power = ${device.txPower}`,
        `\t.is_p2p_encrypted = ${device.p2pEncrypted}`,
        `\t.is_extended_packet = ${device.extended}`,
        '\t.is_request_mode = 0',
        `\t.auto_wakeup_period_s = ${device.wakeupPeriodS}`,
        `\t.save_trace_every_n = ${device.saveEvery}`,
        `\t.send_data_every_n = ${device.sendEvery}`,
        `\t.gnss_mode = ${device.gnssMode}`,
        `\t.is_lorawan_mode = ${device.lorawan}`,
      ];
      if (!legacy) {
        lines.push(
          `\t.is_meshtastic_mode = ${device.meshtastic}`,
          `\t.meshtastic_node_id = ${device.nodeId}`,
          `\t.meshtastic_frequency_hz = ${device.meshFrequencyHz}`,
          `\t.meshtastic_preset = ${device.meshPreset}`,
          `\t.meshtastic_channel = ${device.meshChannel}`,
          `\t.meshtastic_hop_limit = ${device.meshHops}`,
          `\t.meshtastic_key = ${device.meshKey}`,
        );
      }
      lines.push(
        '\t.sleep_schedule_start_utc = --:--',
        '\t.sleep_schedule_end_utc = --:--',
        `\t.lorawan_region = ${device.region}`,
        '\t.dev_eui = 0000000000000000',
        '\t.app_eui = 0000000000000000',
        '',
      );
      return lines.join('\r\n');
    }

    function keyKind(hex) {
      if (hex.length === 2) {
        const index = parseInt(hex, 16);
        return index === 0 ? 'none' : index === 1 ? 'default' : `simple${index - 1}`;
      }
      return hex.length === 32 ? 'aes128' : 'aes256';
    }

    // Returns true for OK, false for a rejected argument.
    function apply(line) {
      const lower = line.toLowerCase();
      const value = (prefix) => line.slice(prefix.length).trim();
      if (lower === 'info') { send(info()); return true; }
      if (lower === 'reset') { return true; }
      if (lower.startsWith('set tx ')) { device.txPower = Number(value('set tx ')); return true; }
      if (lower.startsWith('set gnss mode ')) { device.gnssMode = Number(value('set gnss mode ')); return true; }
      if (lower.startsWith('enable lorawan mode ')) {
        device.lorawan = Number(value('enable lorawan mode '));
        if (device.lorawan) device.meshtastic = 0;
        return true;
      }
      if (legacy) { return null; }
      if (lower.startsWith('enable meshtastic mode ')) {
        device.meshtastic = Number(value('enable meshtastic mode '));
        if (device.meshtastic) device.lorawan = 0;
        return true;
      }
      if (lower.startsWith('set mesh-freq ')) { device.meshFrequencyHz = Number(value('set mesh-freq ')); return true; }
      if (lower.startsWith('set mesh-preset ')) {
        const preset = PRESETS.find((name) => name.toLowerCase() === value('set mesh-preset ').toLowerCase());
        if (!preset) return false;
        device.meshPreset = preset;
        return true;
      }
      if (lower.startsWith('set mesh-channel')) {
        const name = value('set mesh-channel');
        if (name.length > 11 || /[^\x21-\x7e]/.test(name)) return false;
        device.meshChannel = name;
        return true;
      }
      if (lower.startsWith('set mesh-hops ')) {
        const hops = Number(value('set mesh-hops '));
        if (!(hops >= 0 && hops <= 7)) return false;
        device.meshHops = hops;
        return true;
      }
      if (lower.startsWith('set mesh-key ')) {
        const hex = value('set mesh-key ');
        if (!/^[0-9a-f]+$/i.test(hex) || ![2, 32, 64].includes(hex.length)) return false;
        device.meshKey = keyKind(hex);
        return true;
      }
      return null;
    }

    function handle(rawLine) {
      const line = rawLine.trim();
      if (!line) return;
      commands.push(line);
      const result = apply(line);
      send(result === true ? 'OK\r\n' : result === false ? 'ERR Wrong argument\r\n' : 'ERR Unknown command\r\n');
    }

    const port = {
      readable: null,
      writable: null,
      async open() {
        this.readable = new ReadableStream({ start(c) { controller = c; } });
        this.writable = new WritableStream({
          write(chunk) {
            pending += decoder.decode(chunk);
            const lines = pending.split(/\r\n|\r|\n/);
            pending = lines.pop();
            lines.forEach(handle);
          },
        });
      },
      async close() {},
      getInfo() { return { usbVendorId: 0x0483, usbProductId: 0x5740 }; },
    };

    Object.defineProperty(navigator, 'serial', {
      configurable: true,
      value: {
        requestPort: async () => port,
        getPorts: async () => [],
        addEventListener() {},
        removeEventListener() {},
      },
    });
  }, { legacy, state });
}

async function connect(page) {
  await page.locator('#connectButton').click();
  await expect(page.locator('#connectionHint')).toHaveText(/Loko v2\.1\.11/);
}

// The commands one save sent: everything between the connect-time `info` and
// the `info` that re-reads the settings after the `reset`.
async function savedCommands(page) {
  await expect(page.locator('#saveStatus')).toHaveText('Settings saved successfully.', { timeout: 10_000 });
  const commands = await page.evaluate(() => window.__fakeLokoAir.commands);
  return commands.slice(commands.indexOf('info') + 1, commands.lastIndexOf('info'));
}

test('Meshtastic frequency follows the Meshtastic firmware slot formula', async ({ page }) => {
  await page.goto('/loko-config-tool/?map3d=0');

  const result = await page.evaluate(() => ({
    euLongFast: computeMeshtasticFrequency('EU_868', 'LongFast', ''),
    usLongFast: computeMeshtasticFrequency('US', 'LongFast', ''),
    usLongFastNamed: computeMeshtasticFrequency('US', 'LongFast', 'LongFast').frequencyHz,
    usMediumFastLoko: computeMeshtasticFrequency('US', 'MediumFast', 'Loko').frequencyHz,
    usLongSlowLoko: computeMeshtasticFrequency('US', 'LongSlow', 'Loko').frequencyHz,
    anzLongFastLoko: computeMeshtasticFrequency('ANZ', 'LongFast', 'Loko').frequencyHz,
    euShortTurbo: computeMeshtasticFrequency('EU_868', 'ShortTurbo', '').error,
    presetCaseInsensitive: computeMeshtasticFrequency('US', 'longfast', '').frequencyHz,
  }));

  expect(result.euLongFast.frequencyHz).toBe(869525000);
  expect(result.euLongFast.slotCount).toBe(1);
  expect(result.usLongFast.frequencyHz).toBe(906875000);
  expect(result.usLongFast.slot).toBe(19);
  expect(result.usLongFast.slotCount).toBe(104);
  // An empty channel name is the preset name, as Channels::getName() does.
  expect(result.usLongFastNamed).toBe(906875000);
  expect(result.usMediumFastLoko).toBe(US_MEDIUM_FAST_LOKO_HZ);
  expect(result.usLongSlowLoko).toBe(referenceMeshtasticHz(902, 928, 125, 'Loko'));
  expect(result.anzLongFastLoko).toBe(referenceMeshtasticHz(915, 928, 250, 'Loko'));
  expect(result.euShortTurbo).toBe('too-narrow');
  expect(result.presetCaseInsensitive).toBe(906875000);
});

test('Meshtastic channel keys convert from base64 to the hex the CLI takes', async ({ page }) => {
  await page.goto('/loko-config-tool/?map3d=0');

  const keys = await page.evaluate((aes256) => {
    const hex = (text) => {
      const key = parseMeshtasticKey(text);
      return key.bytes ? bytesToHex(key.bytes) : key.error ? 'error' : 'empty';
    };
    return {
      default: hex('AQ=='),
      none: hex('AA=='),
      simple1: hex('Ag=='),
      unpadded: hex('AQ'),
      urlSafe: hex('-w=='),
      aes128: hex('AAAAAAAAAAAAAAAAAAAAAA=='),
      aes256: hex(aes256),
      empty: hex('  '),
      wrongLength: hex('AAAA'),
      notBase64: hex('not a key!'),
      simpleKind: meshtasticKeyKindFromBytes(parseMeshtasticKey('Ag==').bytes),
    };
  }, AES256_KEY_BASE64);

  expect(keys.default).toBe('01');
  expect(keys.none).toBe('00');
  expect(keys.simple1).toBe('02');
  expect(keys.unpadded).toBe('01');
  expect(keys.urlSafe).toBe('FB');
  expect(keys.aes128).toBe('00'.repeat(16));
  expect(keys.aes256).toBe(AES256_KEY_HEX);
  expect(keys.empty).toBe('empty');
  expect(keys.wrongLength).toBe('error');
  expect(keys.notBase64).toBe('error');
  expect(keys.simpleKind).toBe('simple1');
});

test('Meshtastic settings round-trip through info', async ({ page }) => {
  await installFakeLokoAir(page);
  await page.goto('/loko-config-tool/?map3d=0');
  await connect(page);

  const meshtasticMode = page.getByRole('radio', { name: 'Meshtastic' });
  await expect(meshtasticMode).toBeVisible();
  await expect(page.getByRole('radio', { name: 'P2P' })).toBeChecked();
  await expect(page.locator('#meshNodeId')).toHaveValue('!829f9b97');

  await meshtasticMode.check();
  await expect(page.getByRole('tab', { name: 'Meshtastic Mode' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#meshRegion')).toHaveValue('EU_868');
  await expect(page.locator('#meshFrequency')).toHaveText('869.525 MHz');
  await expect(page.locator('#meshKey')).toHaveValue('AQ==');
  await expect(page.locator('#meshKeyWarning')).toBeVisible();
  await expect(page.locator('#meshKeyWarning')).toContainText("anyone with Meshtastic can read this tracker's position");

  await page.locator('#meshRegion').selectOption('US');
  await page.locator('#meshPreset').selectOption('MediumFast');
  await page.locator('#meshChannel').fill('Loko');
  await page.locator('#meshHops').selectOption('5');
  await page.locator('#meshPowerRange').fill('20');
  await page.locator('#meshKey').fill(AES256_KEY_BASE64);
  await expect(page.locator('#meshFrequency')).toHaveText(formatMHz(US_MEDIUM_FAST_LOKO_HZ));
  await expect(page.locator('#meshKeyWarning')).toBeHidden();

  await page.locator('#saveButton').click();
  expect(await savedCommands(page)).toEqual([
    'set tx 20',
    `set mesh-freq ${US_MEDIUM_FAST_LOKO_HZ}`,
    'set mesh-preset MediumFast',
    'set mesh-channel Loko',
    'set mesh-hops 5',
    `set mesh-key ${AES256_KEY_HEX}`,
    'enable meshtastic mode 1',
    'reset',
  ]);

  // Read back from the device's `info` after the reset.
  await expect(meshtasticMode).toBeChecked();
  await expect(page.locator('#meshRegion')).toHaveValue('US');
  await expect(page.locator('#meshPreset')).toHaveValue('MediumFast');
  await expect(page.locator('#meshChannel')).toHaveValue('Loko');
  await expect(page.locator('#meshHops')).toHaveValue('5');
  await expect(page.locator('#meshPowerRange')).toHaveValue('20');
  await expect(page.locator('#meshFrequency')).toHaveText(formatMHz(US_MEDIUM_FAST_LOKO_HZ));
  await expect(page.locator('#meshFrequencyNote')).toBeHidden();
  await expect(page.locator('#meshKey')).toHaveValue('');
  await expect(page.locator('#meshKey')).toHaveAttribute('placeholder', /AES-256 key is hidden/);
  await expect(page.locator('#meshKeyStatus')).toHaveText('On the tracker: an AES-256 key, which stays hidden.');
  await expect(page.locator('#meshKeyWarning')).toBeHidden();

  // Nothing changed, so nothing is sent.
  await page.locator('#saveButton').click();
  await expect(page.locator('#saveStatus')).toHaveText('No changes detected. Nothing to save.');
});

test('Meshtastic panel: empty channel, public keys, region limits and switching back to P2P', async ({ page }) => {
  await installFakeLokoAir(page, {
    state: {
      meshtastic: 1, meshFrequencyHz: US_MEDIUM_FAST_LOKO_HZ, meshPreset: 'MediumFast',
      meshChannel: 'Loko', meshHops: 2, meshKey: 'aes256',
    },
  });
  await page.goto('/loko-config-tool/?map3d=0');
  await connect(page);

  // The region is worked out from the frequency the tracker reports.
  await expect(page.getByRole('radio', { name: 'Meshtastic' })).toBeChecked();
  await expect(page.locator('#meshRegion')).toHaveValue('US');
  await expect(page.locator('#meshKeyWarning')).toBeHidden();

  // No channel name: the preset name picks the slot.
  await page.locator('#meshChannel').fill('');
  await expect(page.locator('#meshChannel')).toHaveAttribute('placeholder', 'MediumFast');
  const presetNameHz = referenceMeshtasticHz(902, 928, 250, 'MediumFast');
  await expect(page.locator('#meshFrequency')).toHaveText(formatMHz(presetNameHz));
  await expect(page.locator('#meshFrequencyNote')).toContainText(`The tracker is set to ${formatMHz(US_MEDIUM_FAST_LOKO_HZ)}`);

  // Spaces are not allowed in a channel name.
  await page.locator('#meshChannel').fill('My Mesh');
  await expect(page.locator('#meshChannel')).toHaveValue('MyMesh');
  await page.locator('#meshChannel').fill('');

  await page.locator('#meshKey').fill('AA==');
  await expect(page.locator('#meshKeyWarning')).toContainText('No encryption');
  await page.locator('#meshKey').fill('Ag==');
  await expect(page.locator('#meshKeyWarning')).toContainText('derived from the public default key');
  await page.locator('#meshKey').fill('AQ==');
  await expect(page.locator('#meshKeyWarning')).toContainText('Default key');
  await page.locator('#meshKey').fill('AAAA');
  await expect(page.locator('#meshKeyStatus')).toContainText('3 bytes long');
  await page.locator('#saveButton').click();
  await expect(page.locator('#saveStatus')).toContainText('3 bytes long');
  await page.locator('#meshKey').fill('AQ==');

  // JP caps Meshtastic TX power at 13 dBm; the tracker is at 14.
  await page.locator('#meshRegion').selectOption('JP');
  await expect(page.locator('#meshPowerNote')).toHaveText('Meshtastic allows at most 13 dBm in JP. Set 13 dBm or less.');

  // A 500 kHz preset does not fit in the 250 kHz EU_868 band.
  await page.locator('#meshRegion').selectOption('EU_868');
  await page.locator('#meshPreset').selectOption('ShortTurbo');
  await expect(page.locator('#meshFrequencyNote')).toContainText('too narrow for ShortTurbo');
  await page.locator('#saveButton').click();
  await expect(page.locator('#saveStatus')).toHaveText('ShortTurbo does not fit in EU_868. Pick another Meshtastic preset.');

  await page.locator('#meshRegion').selectOption('US');
  await page.locator('#meshPreset').selectOption('MediumFast');
  await page.locator('#saveButton').click();
  expect(await savedCommands(page)).toEqual([
    `set mesh-freq ${presetNameHz}`,
    'set mesh-channel',
    'set mesh-key 01',
    'reset',
  ]);

  await expect(page.locator('#meshChannel')).toHaveValue('');
  await expect(page.locator('#meshKey')).toHaveValue('AQ==');
  await expect(page.locator('#meshKeyStatus')).toHaveText('On the tracker: the default key (AQ==).');
  await expect(page.locator('#meshKeyWarning')).toBeVisible();

  // Back to P2P: only the mode changes.
  const commandsBefore = await page.evaluate(() => window.__fakeLokoAir.commands.length);
  await page.getByRole('radio', { name: 'P2P' }).check();
  await page.locator('#saveButton').click();
  await expect(page.locator('#saveStatus')).toHaveText('Settings saved successfully.', { timeout: 10_000 });
  const commands = await page.evaluate(() => window.__fakeLokoAir.commands);
  const p2pSave = commands.slice(commandsBefore);
  expect(p2pSave.slice(0, p2pSave.indexOf('info'))).toEqual(['enable meshtastic mode 0', 'reset']);
  await expect(page.getByRole('radio', { name: 'P2P' })).toBeChecked();
  expect(await page.evaluate(() => window.__fakeLokoAir.device.meshtastic)).toBe(0);
});

test('Meshtastic mode stays hidden on firmware without it', async ({ page }) => {
  await installFakeLokoAir(page, { legacy: true });
  await page.goto('/loko-config-tool/?map3d=0');
  await connect(page);

  await expect(page.getByRole('radio', { name: 'P2P' })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'LoRaWAN' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Meshtastic' })).toBeHidden();
  await expect(page.locator('.settings-card .tab[data-tab="meshtastic"]')).toBeHidden();

  await page.locator('#gnssMode').selectOption('2');
  await page.locator('#saveButton').click();
  expect(await savedCommands(page)).toEqual(['set gnss mode 2', 'reset']);
});

// ── Air firmware sources ─────────────────────────────────────────────────────

test('Air firmware: Experimental downloads the Meshtastic build, Latest stays on v2.1.11', async ({ page }) => {
  await page.goto('/loko-config-tool/?map3d=0');
  await page.getByRole('tab', { name: 'Firmware Update' }).click();
  await expect(page.locator('#fw-log-container')).toContainText('Ready');

  const badge = page.locator('#fw-version-badge');
  await expect(badge).toHaveText('v2.1.11 available');

  const requested = [];
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.startsWith('/air_firmware/')) requested.push(pathname);
  });

  // Runs the panel's own download + parse for whichever source is selected.
  const fetchSelectedFirmware = () => page.evaluate(async () => {
    const updater = new window.FirmwareUpdater();
    updater.cacheElements();
    await updater.fetchFirmware();
    const data = updater.firmwareData;
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    return {
      base: updater.firmwareBaseAddress,
      size: data.length,
      stack: view.getUint32(0, true),
      reset: view.getUint32(4, true),
      lastWord: view.getUint32(data.length - 4, true),
    };
  });

  await page.getByRole('radio', { name: /Experimental/ }).check();
  await expect(page.getByText('(Meshtastic connectivity)')).toBeVisible();
  await expect(badge).toHaveText('experimental');
  await expect(badge).toHaveClass(/is-experimental/);

  const experimental = await fetchSelectedFirmware();
  expect(requested).toEqual(['/air_firmware/loko_v2.1.11-meshtastic-exp1.hex']);
  expect(experimental.base).toBe(0x08008000);
  expect(experimental.size).toBe(0x08025B20 - 0x08008000);
  expect(experimental.stack).toBe(0x20010000);
  expect(experimental.reset).toBeGreaterThan(experimental.base);
  expect(experimental.reset).toBeLessThan(experimental.base + experimental.size);
  // The bootloader's "no CRC" marker, as in the public release hex.
  expect(experimental.lastWord).toBe(0x12345678);

  requested.length = 0;
  await page.getByRole('radio', { name: 'Latest (v2.1.11)' }).check();
  await expect(badge).toHaveText('v2.1.11 available');
  await expect(badge).not.toHaveClass(/is-experimental/);

  const latest = await fetchSelectedFirmware();
  expect(requested).toEqual(['/air_firmware/loko_v2.1.11.hex']);
  expect(latest.base).toBe(0x08008000);
  expect(latest.stack).toBe(0x20010000);
});
