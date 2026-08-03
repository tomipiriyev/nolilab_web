// ── Serial terminal ──────────────────────────────────────────────────────────
const termOutput = document.getElementById("termOutput");
const termClearBtn = document.getElementById("termClearBtn");

function termLog(text, type = "default") {
    if (!termOutput) return;
    const wasAtBottom = termOutput.scrollHeight - termOutput.clientHeight <= termOutput.scrollTop + 4;
    const line = document.createElement("span");
    line.className = "term-line" + (type !== "default" ? " term-" + type : "");
    line.textContent = text;
    if (termOutput.firstChild?.classList?.contains("term-muted") &&
        termOutput.firstChild?.textContent === "Waiting for connection…") {
        termOutput.replaceChildren();
    }
    termOutput.appendChild(line);
    if (wasAtBottom) termOutput.scrollTop = termOutput.scrollHeight;
}

function termClear() {
    if (termOutput) termOutput.replaceChildren();
}

if (termClearBtn) termClearBtn.addEventListener("click", termClear);
// ─────────────────────────────────────────────────────────────────────────────

const frequencyRange = document.getElementById("frequencyRange");
const powerRange = document.getElementById("powerRange");
const frequencyValue = document.getElementById("frequencyValue");
const powerValue = document.getElementById("powerValue");
const configTabs = [...document.querySelectorAll(".settings-card .tab")];
const configPanels = [...document.querySelectorAll(".settings-card .panel")];
const mainTabs = [...document.querySelectorAll(".main-tab")];
const mainPanels = [...document.querySelectorAll(".main-panel")];
const deviceTabs = [...document.querySelectorAll(".device-tab")];
const devicePanels = [...document.querySelectorAll(".device-panel")];
const modeToggle = document.getElementById("operatingModeToggle");
const modeNames = [...document.querySelectorAll(".mode-name")];
const connectButton = document.getElementById("connectButton");
const connectButtonLabel = document.getElementById("connectButtonLabel");
const connectionLabel = document.getElementById("connectionLabel");
const connectionHint = document.getElementById("connectionHint");
const portInfo = document.getElementById("portInfo");
const statusIcon = document.querySelector(".status-icon");
const id1Input = document.getElementById("id1");
const id2Input = document.getElementById("id2");
const idFormatToggle = document.getElementById("idFormatToggle");
const idFormatDecLabel = document.getElementById("idFormatDecLabel");
const idFormatHexLabel = document.getElementById("idFormatHexLabel");
const p2pEncryptedToggle = document.getElementById("isP2pEncrypted");
const p2pEncryptionKeyInput = document.getElementById("p2pEncryptionKey");
const extendedPacketToggle = document.getElementById("isExtendedPacket");
const loraWanRegionSelect = document.getElementById("loraWanRegion");
const gnssModeSelect = document.getElementById("gnssMode");
const devEuiInput = document.getElementById("devEui");
const appEuiInput = document.getElementById("appEui");
const appKeyInput = document.getElementById("appKey");
const wakeUpPeriodInput = document.getElementById("wakeUpPeriod");
const wakeUpPeriodUnitSelect = document.getElementById("wakeUpPeriodUnit");
const sendEveryInput = document.getElementById("sendEvery");
const saveEveryInput = document.getElementById("saveEvery");
const sleepWindowToggle = document.getElementById("sleepWindowEnabled");
const sleepStartInput = document.getElementById("sleepStart");
const sleepEndInput = document.getElementById("sleepEnd");
const sleepWindowSummary = document.getElementById("sleepWindowSummary");
const timingSummary = document.getElementById("timingSummary");
const readGnssTraceButton = document.getElementById("readGnssTraceButton");
const eraseGnssTraceButton = document.getElementById("eraseGnssTraceButton");
const exportGnssTraceButton = document.getElementById("exportGnssTraceButton");
const exportGnssTraceCsvButton = document.getElementById("exportGnssTraceCsvButton");
const gnssTraceOutputBody = document.getElementById("gnssTraceOutputBody");
const gnssTraceOutputTableWrap = document.querySelector(".gnss-trace-table-wrap");
const gnssTraceProgress = document.getElementById("gnssTraceProgress");
const gnssTraceProgressLabel = document.getElementById("gnssTraceProgressLabel");
const gnssTraceMapContainer = document.getElementById("gnssTraceMap");
const saveButton = document.getElementById("saveButton");
const resetButton = document.getElementById("resetButton");
const saveStatus = document.getElementById("saveStatus");
const connectionSensitiveControls = [
    ...document.querySelectorAll(".mode-card input, .mode-card select, .settings-card input, .settings-card select, .settings-card button, .gnss-trace-card input, .gnss-trace-card select, .gnss-trace-card button")
];

const WAKE_UP_PERIOD_MAX_SECONDS = 43200;
const SEND_SAVE_MULT_MAX = 200;
const GNSS_MODE_MAX = 4;
const SLEEP_WINDOW_OFF = "off";
const SLEEP_WINDOW_DEFAULT_START = "22:00";
const SLEEP_WINDOW_DEFAULT_END = "07:30";
const DEVICE_INFO_TIMEOUT_MS = 1000;
// A `reset` reboots the device. Boot time varies, and an `info` sent too early
// is simply dropped by a device that is not listening yet, so the refresh that
// follows a reset retries a few times instead of relying on one long wait.
const DEVICE_REBOOT_DELAY_MS = 1200;
const DEVICE_INFO_AFTER_REBOOT_TIMEOUT_MS = 2000;
const DEVICE_INFO_AFTER_REBOOT_ATTEMPTS = 3;
const ERASE_TRACE_CONFIRM_WINDOW_MS = 3000;
const GNSS_TRACE_OUTPUT_MAX_LINES = 4000;
const GNSS_TRACE_OUTPUT_FLUSH_INTERVAL_MS = 50;
const DEBUG_SERIAL = false;
const WAKE_UP_PERIOD_UNITS = {
    "1": { max: WAKE_UP_PERIOD_MAX_SECONDS },
    "60": { max: WAKE_UP_PERIOD_MAX_SECONDS / 60 },
    "3600": { max: WAKE_UP_PERIOD_MAX_SECONDS / 3600 }
};
const NUMERIC_CONFIG_FIELDS = [
    "id_1",
    "id_2",
    "lora_frequency_hz",
    "tx_power",
    "auto_wakeup_period_s",
    "save_trace_every_n",
    "send_data_every_n",
    "is_lorawan_mode",
    "is_p2p_encrypted",
    "is_debug_output",
    "gnss_mode",
    "is_extended_packet"
];

let connectedPort = null;
let reader = null;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
let deviceConfig = createEmptyDeviceConfig();
let idRadix = 10;
const idNumericValues = {
    id1: null,
    id2: null
};
let p2pEncryptionKey = "";
let gnssTraceRecordsBuffer = [];
let gnssTraceMap = null;
let gnssTraceLayer = null;
let gnssTraceSelectionLayer = null;
let selectedGnssTraceRecordNumber = null;
// The sleep window is only pushed to the device once the user has touched the
// controls, so a firmware whose `info` dump omits it never gets an unsolicited
// `sleep set off` on every save.
let sleepWindowDirty = false;
let eraseTraceConfirmArmed = false;
let eraseTraceConfirmTimer = null;
let resetConfirmArmed = false;
let resetConfirmTimer = null;

window.lokoAirGnssTraceRecords = gnssTraceRecordsBuffer;

function debugSerial(...args) {
    if (DEBUG_SERIAL) {
        console.log(...args);
    }
}

function sanitizeIdInput(raw, radix) {
    if (!raw) {
        return "";
    }

    const pattern = radix === 16 ? /[^0-9a-f]/gi : /\D/g;
    const clean = raw.replace(pattern, "");
    return radix === 16 ? clean.toUpperCase() : clean;
}

function formatIdValue(value, radix) {
    if (value === null || Number.isNaN(value)) {
        return "";
    }

    return radix === 16 ? value.toString(16).toUpperCase() : String(value);
}

function parseIdValue(text, radix) {
    if (!text) {
        return null;
    }

    const parsed = parseInt(text, radix);
    return Number.isNaN(parsed) ? null : parsed;
}

function syncIdFormatUi() {
    const hexMode = idRadix === 16;
    idFormatDecLabel.classList.toggle("active", !hexMode);
    idFormatHexLabel.classList.toggle("active", hexMode);
    id1Input.inputMode = hexMode ? "text" : "numeric";
    id2Input.inputMode = hexMode ? "text" : "numeric";
}

function applyIdFormatToInputs() {
    id1Input.value = formatIdValue(idNumericValues.id1, idRadix);
    id2Input.value = formatIdValue(idNumericValues.id2, idRadix);
}

function handleIdInput(input, key) {
    const sanitized = sanitizeIdInput(input.value, idRadix);
    if (sanitized !== input.value) {
        input.value = sanitized;
    }

    idNumericValues[key] = parseIdValue(sanitized, idRadix);
}

function sanitizeP2pEncryptionKey(raw) {
    if (!raw) {
        return "";
    }

    return raw.replace(/[^0-9a-f]/gi, "").toUpperCase().slice(0, 64);
}

function isValidP2pEncryptionKey(value) {
    return /^[0-9A-F]{64}$/.test(value);
}

function syncP2pEncryptionKeyUi() {
    const connected = Boolean(connectedPort);
    const encryptionEnabled = connected && p2pEncryptedToggle.checked;
    p2pEncryptionKeyInput.disabled = !encryptionEnabled;
}

function syncControlsAvailability() {
    const connected = Boolean(connectedPort);

    connectionSensitiveControls.forEach((control) => {
        control.disabled = !connected;
    });

    // Wake Up Period controls stay interactive when disconnected so users
    // can preview battery life estimates without a connected device.
    wakeUpPeriodInput.disabled = false;
    wakeUpPeriodUnitSelect.disabled = false;

    syncModeTabsAvailability();
    syncP2pEncryptionKeyUi();
    syncSleepWindowUi();
}

function handleP2pEncryptionKeyInput() {
    const sanitized = sanitizeP2pEncryptionKey(p2pEncryptionKeyInput.value);
    if (sanitized !== p2pEncryptionKeyInput.value) {
        p2pEncryptionKeyInput.value = sanitized;
    }

    p2pEncryptionKey = sanitized;
    syncP2pEncryptionKeyUi();
}

function isValidTimeOfDay(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function formatMinutesAsTimeOfDay(minutes) {
    const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
    const hours = Math.floor(normalized / 60);
    return `${String(hours).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

function timeOfDayToMinutes(value) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
}

// Accepts "22:00", "22:00:00" and raw minutes-since-midnight ("1320").
function normalizeTimeOfDay(raw) {
    if (raw === null || raw === undefined) {
        return null;
    }

    const value = String(raw).trim();
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
        const [hours, minutes] = value.split(":");
        const candidate = `${hours.padStart(2, "0")}:${minutes}`;
        return isValidTimeOfDay(candidate) ? candidate : null;
    }

    if (/^\d+$/.test(value)) {
        const minutes = Number(value);
        return minutes >= 0 && minutes < 1440 ? formatMinutesAsTimeOfDay(minutes) : null;
    }

    return null;
}

// A native <input type="time"> renders am/pm on locales that use it and offers
// no way to override that, so the times are plain text fields masked to strict
// 24-hour HH:MM here. Typing "930" is read as 09:30, not an invalid hour 93.
function maskTimeDigits(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    return digits.length >= 2 && Number(digits.slice(0, 2)) > 23
        ? `0${digits.slice(0, 3)}`
        : digits;
}

function sanitizeTimeOfDayInput(input) {
    const digits = maskTimeDigits(input.value);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;

    if (formatted !== input.value) {
        input.value = formatted;
    }
}

// Runs on blur: pad a partial entry and clamp out-of-range values so the field
// always ends up as a real time of day.
function commitTimeOfDayInput(input, fallback) {
    const digits = maskTimeDigits(input.value);
    if (digits.length === 0) {
        input.value = fallback;
        return;
    }

    const hourDigits = digits.length === 1 ? `0${digits}` : digits.slice(0, 2);
    const minuteDigits = digits.length > 2 ? digits.slice(2).padEnd(2, "0") : "00";
    const hours = Math.min(Number(hourDigits), 23);
    const minutes = Math.min(Number(minuteDigits), 59);
    input.value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Canonical form used both for comparison against the device config and as the
// `sleep set` argument list: either "off" or "HH:MM HH:MM".
function getSleepWindowValue() {
    if (!sleepWindowToggle.checked) {
        return SLEEP_WINDOW_OFF;
    }

    const start = normalizeTimeOfDay(sleepStartInput.value);
    const end = normalizeTimeOfDay(sleepEndInput.value);
    if (!start || !end || start === end) {
        return null;
    }

    return `${start} ${end}`;
}

function formatSleepWindowDuration(start, end) {
    const startMinutes = timeOfDayToMinutes(start);
    const endMinutes = timeOfDayToMinutes(end);
    const spanMinutes = endMinutes > startMinutes ? endMinutes - startMinutes : 1440 - startMinutes + endMinutes;
    return formatDurationLabel(spanMinutes * 60);
}

function updateSleepWindowSummary() {
    if (!sleepWindowSummary) {
        return;
    }

    if (!sleepWindowToggle.checked) {
        sleepWindowSummary.textContent = "Sleep window disabled — the device wakes up around the clock.";
        return;
    }

    const window = getSleepWindowValue();
    if (!window) {
        sleepWindowSummary.textContent = "Enter a valid start and end time (they must differ).";
        return;
    }

    const [start, end] = window.split(" ");
    sleepWindowSummary.textContent =
        `Asleep ${start}–${end} UTC (${formatSleepWindowDuration(start, end)}), ` +
        `awake ${end}–${start} UTC.`;
}

function syncSleepWindowUi() {
    const enabled = Boolean(connectedPort) && sleepWindowToggle.checked;
    sleepStartInput.disabled = !enabled;
    sleepEndInput.disabled = !enabled;
    updateSleepWindowSummary();
}

function applySleepWindowConfig(value) {
    if (value === SLEEP_WINDOW_OFF) {
        sleepWindowToggle.checked = false;
    } else {
        const [start, end] = value.split(" ");
        sleepWindowToggle.checked = true;
        sleepStartInput.value = start;
        sleepEndInput.value = end;
    }

    sleepWindowDirty = false;
    syncSleepWindowUi();
}

// Tolerant of the shapes firmware may print the window in:
//   sleep_window = 22:00-07:30 | off
//   sleep_start = 22:00        sleep_end = 07:30
//   sleep_start_min = 1320     sleep_end_min = 450
function parseSleepWindowConfig(buffer) {
    const combined = parseStringConfigField(buffer, "sleep_window");
    if (combined !== null) {
        if (/^(off|disabled|none)$/i.test(combined)) {
            return SLEEP_WINDOW_OFF;
        }

        const parts = combined.split(/\s*(?:-|–|to|\s)\s*/i).filter(Boolean);
        if (parts.length >= 2) {
            const start = normalizeTimeOfDay(parts[0]);
            const end = normalizeTimeOfDay(parts[1]);
            if (start && end) {
                return `${start} ${end}`;
            }
        }
    }

    const start = normalizeTimeOfDay(
        parseStringConfigField(buffer, "sleep_start") ?? parseNumericConfigField(buffer, "sleep_start_min")
    );
    const end = normalizeTimeOfDay(
        parseStringConfigField(buffer, "sleep_end") ?? parseNumericConfigField(buffer, "sleep_end_min")
    );

    if (start && end) {
        const enabledFlag = parseNumericConfigField(buffer, "is_sleep_window_enabled")
            ?? parseNumericConfigField(buffer, "sleep_enabled");
        return enabledFlag === 0 ? SLEEP_WINDOW_OFF : `${start} ${end}`;
    }

    return null;
}

function syncLorawanRegionUi(region) {
    if (!region || !loraWanRegionSelect) {
        return;
    }

    const normalizedRegion = region.trim().toUpperCase();
    const matchingOption = [...loraWanRegionSelect.options].find((option) => option.value.toUpperCase() === normalizedRegion);

    if (matchingOption) {
        loraWanRegionSelect.value = matchingOption.value;
    }
}

function sanitizeHexFieldInput(input, maxLength) {
    const sanitized = input.value.replace(/[^0-9a-f]/gi, "").toUpperCase().slice(0, maxLength);
    if (sanitized !== input.value) {
        input.value = sanitized;
    }
}

function createEmptyDeviceConfig() {
    return {
        id_1: null,
        id_2: null,
        lora_frequency_hz: null,
        tx_power: null,
        auto_wakeup_period_s: null,
        save_trace_every_n: null,
        send_data_every_n: null,
        is_lorawan_mode: null,
        is_p2p_encrypted: null,
        is_debug_output: null,
        gnss_mode: null,
        is_extended_packet: null,
        lorawan_region: null,
        dev_eui: null,
        app_eui: null,
        sleep_window: null
    };
}

function parseNumericConfigField(buffer, fieldName) {
    const pattern = new RegExp(`(?:\\.)?${fieldName}\\s*=\\s*(-?\\d+)`);
    const match = buffer.match(pattern);
    return match ? Number(match[1]) : null;
}

function parseStringConfigField(buffer, fieldName) {
    const pattern = new RegExp(`(?:\\.)?${fieldName}\\s*=\\s*([^\\r\\n]+)`);
    const match = buffer.match(pattern);
    return match ? match[1].trim() : null;
}

function setGnssTraceRecordsBuffer(records) {
    gnssTraceRecordsBuffer = records;
    window.lokoAirGnssTraceRecords = gnssTraceRecordsBuffer;

    if (selectedGnssTraceRecordNumber !== null) {
        const hasSelectedRecord = gnssTraceRecordsBuffer.some((record) => record.recordNumber === selectedGnssTraceRecordNumber);
        if (!hasSelectedRecord) {
            selectedGnssTraceRecordNumber = null;
        }
    }

    syncGnssTraceExportButtonState();
    renderGnssTraceMap(gnssTraceRecordsBuffer);
    syncSelectedGnssTraceRow();
}

function syncGnssTraceExportButtonState() {
    if (!exportGnssTraceButton || !exportGnssTraceCsvButton) {
        return;
    }

    const hasRecords = gnssTraceRecordsBuffer.length > 0;
    exportGnssTraceButton.disabled = !hasRecords;
    exportGnssTraceCsvButton.disabled = !hasRecords;
}

function ensureGnssTraceMap() {
    if (gnssTraceMap || !gnssTraceMapContainer || typeof window.L === "undefined") {
        return;
    }

    gnssTraceMap = window.L.map(gnssTraceMapContainer, {
        zoomControl: true,
        preferCanvas: true
    });

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(gnssTraceMap);

    gnssTraceLayer = window.L.layerGroup().addTo(gnssTraceMap);
    gnssTraceSelectionLayer = window.L.layerGroup().addTo(gnssTraceMap);
    gnssTraceMap.setView([40.4093, 49.8671], 12);
}

function syncSelectedGnssTraceRow() {
    if (!gnssTraceOutputBody) {
        return;
    }

    const selectedClassName = "gnss-trace-row-selected";
    [...gnssTraceOutputBody.querySelectorAll("tr")].forEach((row) => {
        row.classList.remove(selectedClassName);
    });

    if (selectedGnssTraceRecordNumber === null) {
        return;
    }

    const selectedRow = gnssTraceOutputBody.querySelector(`tr[data-record-number="${selectedGnssTraceRecordNumber}"]`);
    if (selectedRow) {
        selectedRow.classList.add(selectedClassName);
    }
}

function scrollSelectedGnssTraceRowIntoView() {
    if (!gnssTraceOutputBody || selectedGnssTraceRecordNumber === null) {
        return;
    }

    const selectedRow = gnssTraceOutputBody.querySelector(`tr[data-record-number="${selectedGnssTraceRecordNumber}"]`);
    if (!selectedRow || !gnssTraceOutputTableWrap) {
        return;
    }

    const rowRect = selectedRow.getBoundingClientRect();
    const containerRect = gnssTraceOutputTableWrap.getBoundingClientRect();
    const rowAbove = rowRect.top < containerRect.top;
    const rowBelow = rowRect.bottom > containerRect.bottom;

    if (rowAbove || rowBelow) {
        selectedRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function syncSelectedGnssTraceMapMarker(shouldPan = false) {
    if (!gnssTraceMap || !gnssTraceSelectionLayer) {
        return;
    }

    gnssTraceSelectionLayer.clearLayers();

    if (selectedGnssTraceRecordNumber === null) {
        return;
    }

    const selectedRecord = gnssTraceRecordsBuffer.find((record) => record.recordNumber === selectedGnssTraceRecordNumber);
    if (!selectedRecord || !Number.isFinite(selectedRecord.latitude) || !Number.isFinite(selectedRecord.longitude)) {
        return;
    }

    const latLng = [selectedRecord.latitude, selectedRecord.longitude];

    window.L.circleMarker(latLng, {
        radius: 7,
        color: "#0c5d2d",
        weight: 2,
        fillColor: "#f0b37a",
        fillOpacity: 1
    }).addTo(gnssTraceSelectionLayer);

    if (shouldPan) {
        gnssTraceMap.panTo(latLng, { animate: true, duration: 0.25 });
    }
}

function selectGnssTraceRecord(recordNumber, shouldPan = true) {
    if (!Number.isFinite(recordNumber)) {
        return;
    }

    selectedGnssTraceRecordNumber = recordNumber;
    syncSelectedGnssTraceRow();
    scrollSelectedGnssTraceRowIntoView();
    syncSelectedGnssTraceMapMarker(shouldPan);
}

function clearSelectedGnssTraceRecord() {
    selectedGnssTraceRecordNumber = null;
    syncSelectedGnssTraceRow();
    syncSelectedGnssTraceMapMarker(false);
}

function refreshGnssTraceMapSize() {
    if (!gnssTraceMap) {
        return;
    }

    window.setTimeout(() => {
        gnssTraceMap.invalidateSize();
    }, 50);
}

function renderGnssTraceMap(records) {
    ensureGnssTraceMap();
    if (!gnssTraceMap || !gnssTraceLayer) {
        return;
    }

    gnssTraceLayer.clearLayers();

    const points = records
        .filter((record) => Number.isFinite(record.latitude) && Number.isFinite(record.longitude))
        .map((record) => [record.latitude, record.longitude]);

    if (!points.length) {
        syncSelectedGnssTraceMapMarker(false);
        refreshGnssTraceMapSize();
        return;
    }

    window.L.polyline(points, {
        color: "#0aa34b",
        weight: 3,
        opacity: 0.9
    }).addTo(gnssTraceLayer);

    records.forEach((record) => {
        if (!Number.isFinite(record.latitude) || !Number.isFinite(record.longitude)) {
            return;
        }

        const marker = window.L.circleMarker([record.latitude, record.longitude], {
            radius: 3,
            color: "#171a20",
            weight: 1,
            fillColor: "#c48a4a",
            fillOpacity: 0.95
        }).addTo(gnssTraceLayer);

        marker.on("click", () => {
            selectGnssTraceRecord(record.recordNumber, false);
        });
    });

    const bounds = window.L.latLngBounds(points);
    gnssTraceMap.fitBounds(bounds, { padding: [20, 20] });
    syncSelectedGnssTraceMapMarker(false);
    refreshGnssTraceMapSize();
}

function parseGnssTraceLine(line) {
    const pattern = /^#(\d+)\s+(\d{2}\/\d{2}\/\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/;
    const match = line.trim().match(pattern);

    if (!match) {
        return null;
    }

    return {
        recordNumber: Number(match[1]),
        date: match[2],
        time: match[3],
        latitude: Number(match[4]),
        longitude: Number(match[5]),
        alt: Number(match[6]),
        speedMps: Number(match[7]),
        hdop: Number(match[8])
    };
}

function parseGnssTraceRecords(rawResponse) {
    if (!rawResponse) {
        return [];
    }

    const lines = rawResponse.split(/\r\n|\n|\r/);
    const records = [];

    lines.forEach((line) => {
        const parsed = parseGnssTraceLine(line);
        if (parsed) {
            records.push(parsed);
        }
    });

    return records;
}

function clearGnssTraceOutputTable() {
    if (!gnssTraceOutputBody) {
        return;
    }

    gnssTraceOutputBody.replaceChildren();
}

function appendGnssTraceMessageRow(message) {
    if (!gnssTraceOutputBody) {
        return;
    }

    const row = document.createElement("tr");
    row.className = "gnss-trace-row-message";
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.textContent = message;
    row.appendChild(cell);
    gnssTraceOutputBody.appendChild(row);

    if (gnssTraceOutputTableWrap) {
        gnssTraceOutputTableWrap.scrollTop = gnssTraceOutputTableWrap.scrollHeight;
    }
}

function createGnssTraceTableRow(line) {
    const row = document.createElement("tr");
    const parsed = parseGnssTraceLine(line);

    if (!parsed) {
        row.className = "gnss-trace-row-message";
        const cell = document.createElement("td");
        cell.colSpan = 8;
        cell.textContent = line;
        row.appendChild(cell);
        return row;
    }

    row.className = "gnss-trace-row-record";
    row.dataset.recordNumber = String(parsed.recordNumber);

    const cells = [
        String(parsed.recordNumber),
        parsed.date,
        parsed.time,
        String(parsed.latitude),
        String(parsed.longitude),
        String(parsed.alt),
        String(parsed.speedMps),
        String(parsed.hdop)
    ];

    cells.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
    });

    return row;
}

function appendGnssTraceRows(lines, maxRows) {
    if (!gnssTraceOutputBody || !lines.length) {
        return false;
    }

    const hasPlaceholderOnly =
        gnssTraceOutputBody.children.length === 1 &&
        gnssTraceOutputBody.firstElementChild?.classList.contains("gnss-trace-row-message");

    if (hasPlaceholderOnly) {
        clearGnssTraceOutputTable();
    }

    const fragment = document.createDocumentFragment();
    lines.forEach((line) => {
        fragment.appendChild(createGnssTraceTableRow(line));
    });
    gnssTraceOutputBody.appendChild(fragment);

    let trimmed = false;
    while (gnssTraceOutputBody.children.length > maxRows) {
        gnssTraceOutputBody.removeChild(gnssTraceOutputBody.firstElementChild);
        trimmed = true;
    }

    if (gnssTraceOutputTableWrap) {
        gnssTraceOutputTableWrap.scrollTop = gnssTraceOutputTableWrap.scrollHeight;
    }

    return trimmed;
}

function setGnssTraceProgress(loaded, total) {
    if (!gnssTraceProgress || !gnssTraceProgressLabel) {
        return;
    }

    if (!Number.isFinite(total) || total <= 0) {
        gnssTraceProgress.max = 100;
        gnssTraceProgress.value = 0;
        gnssTraceProgressLabel.textContent = "0%";
        return;
    }

    const normalizedLoaded = Math.min(Math.max(loaded, 0), total);
    const percent = Math.round((normalizedLoaded / total) * 100);
    gnssTraceProgress.max = total;
    gnssTraceProgress.value = normalizedLoaded;
    gnssTraceProgressLabel.textContent = `${percent}% (${normalizedLoaded}/${total})`;
}

function waitForNextPaint() {
    return new Promise((resolve) => {
        window.requestAnimationFrame(() => resolve());
    });
}

function resetGnssTraceProgress() {
    setGnssTraceProgress(0, 0);
}

function resetEraseTraceConfirmationUi() {
    eraseTraceConfirmArmed = false;
    if (eraseTraceConfirmTimer) {
        window.clearTimeout(eraseTraceConfirmTimer);
        eraseTraceConfirmTimer = null;
    }

    if (eraseGnssTraceButton) {
        eraseGnssTraceButton.textContent = "Erase Trace";
        eraseGnssTraceButton.classList.remove("is-danger");
    }
}

function resetResetConfirmationUi() {
    resetConfirmArmed = false;
    if (resetConfirmTimer) {
        window.clearTimeout(resetConfirmTimer);
        resetConfirmTimer = null;
    }

    if (resetButton) {
        resetButton.textContent = "Reset to Defaults";
        resetButton.classList.remove("is-danger");
    }
}

function formatGpxTimeFromRecord(record) {
    const dateMatch = record.date.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
    const timeMatch = record.time.match(/^(\d{2}):(\d{2}):(\d{2})$/);

    if (!dateMatch || !timeMatch) {
        return null;
    }

    const year = 2000 + Number(dateMatch[1]);
    const month = Number(dateMatch[2]) - 1;
    const day = Number(dateMatch[3]);
    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    const second = Number(timeMatch[3]);
    const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second));

    return Number.isNaN(utcDate.getTime()) ? null : utcDate.toISOString();
}

function buildGpxFromTraceRecords(records) {
    const trackPoints = records.map((record) => {
        const timeIso = formatGpxTimeFromRecord(record);
        const ele = Number.isFinite(record.alt) ? `<ele>${record.alt}</ele>` : "";
        const time = timeIso ? `<time>${timeIso}</time>` : "";
        return `      <trkpt lat="${record.latitude}" lon="${record.longitude}">\n        ${ele}\n        ${time}\n      </trkpt>`;
    }).join("\n");

    return [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<gpx version=\"1.1\" creator=\"Loko-AIR Configurator\" xmlns=\"http://www.topografix.com/GPX/1/1\">",
        "  <trk>",
        "    <name>Loko-AIR GNSS Trace</name>",
        "    <trkseg>",
        trackPoints,
        "    </trkseg>",
        "  </trk>",
        "</gpx>"
    ].join("\n");
}

function buildCsvFromTraceRecords(records) {
    const header = "recordNumber,date,time,latitude,longitude,alt,speedMps,hdop";
    const rows = records.map((record) => [
        record.recordNumber,
        record.date,
        record.time,
        record.latitude,
        record.longitude,
        record.alt,
        record.speedMps,
        record.hdop
    ].join(","));

    return [header, ...rows].join("\n");
}

function downloadTextFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function clampInteger(value, min, max = Number.POSITIVE_INFINITY) {
    if (!Number.isFinite(value)) {
        return min;
    }

    return Math.min(Math.max(Math.trunc(value), min), max);
}

function sanitizeIntegerInput(input, min, max = Number.POSITIVE_INFINITY) {
    const raw = input.value.trim();
    if (!raw) {
        input.value = String(min);
        return min;
    }

    const parsed = Number(raw);
    const sanitized = clampInteger(parsed, min, max);
    input.value = String(sanitized);
    return sanitized;
}

function getWakeUpPeriodUnitMultiplier() {
    return Number(wakeUpPeriodUnitSelect.value) || 1;
}

function syncWakeUpPeriodConstraints() {
    const multiplier = String(getWakeUpPeriodUnitMultiplier());
    const max = WAKE_UP_PERIOD_UNITS[multiplier]?.max ?? WAKE_UP_PERIOD_MAX_SECONDS;
    wakeUpPeriodInput.max = String(max);
}

function formatWakeUpPeriodDisplayValue(seconds, multiplier) {
    const rawValue = seconds / multiplier;
    if (Number.isInteger(rawValue)) {
        return String(rawValue);
    }

    return rawValue.toFixed(3).replace(/\.?0+$/, "");
}

function setWakeUpPeriodFromSeconds(totalSeconds) {
    const seconds = clampInteger(totalSeconds, 0, WAKE_UP_PERIOD_MAX_SECONDS);
    let unit = "1";

    if (seconds > 0 && seconds % 3600 === 0) {
        unit = "3600";
    } else if (seconds > 0 && seconds % 60 === 0) {
        unit = "60";
    }

    wakeUpPeriodUnitSelect.value = unit;
    syncWakeUpPeriodConstraints();
    wakeUpPeriodInput.value = formatWakeUpPeriodDisplayValue(seconds, Number(unit));
}

function getWakeUpPeriodSeconds() {
    const multiplier = getWakeUpPeriodUnitMultiplier();
    syncWakeUpPeriodConstraints();

    const raw = wakeUpPeriodInput.value.trim();
    if (!raw) {
        wakeUpPeriodInput.value = "0";
        return 0;
    }

    const parsed = Number(raw);
    const maxDisplayed = WAKE_UP_PERIOD_UNITS[String(multiplier)]?.max ?? WAKE_UP_PERIOD_MAX_SECONDS;
    const normalizedDisplayed = Math.min(Math.max(parsed, 0), maxDisplayed);
    const seconds = clampInteger(normalizedDisplayed * multiplier, 0, WAKE_UP_PERIOD_MAX_SECONDS);
    wakeUpPeriodInput.value = formatWakeUpPeriodDisplayValue(seconds, multiplier);
    return seconds;
}

function handleWakeUpPeriodUnitChange() {
    const currentSeconds = getWakeUpPeriodSeconds();
    syncWakeUpPeriodConstraints();
    wakeUpPeriodInput.value = formatWakeUpPeriodDisplayValue(currentSeconds, getWakeUpPeriodUnitMultiplier());
}

function getWakeUpPeriodSecondsPreview() {
    const multiplier = getWakeUpPeriodUnitMultiplier();
    const raw = wakeUpPeriodInput.value.trim();

    if (!raw) {
        return 0;
    }

    const parsed = Number(raw);
    const maxDisplayed = WAKE_UP_PERIOD_UNITS[String(multiplier)]?.max ?? WAKE_UP_PERIOD_MAX_SECONDS;
    return clampInteger(Math.min(Math.max(parsed, 0), maxDisplayed) * multiplier, 0, WAKE_UP_PERIOD_MAX_SECONDS);
}

function getMultiplierPreview(input) {
    const raw = input.value.trim();
    if (!raw) {
        return 0;
    }

    return clampInteger(Number(raw), 0, SEND_SAVE_MULT_MAX);
}

function formatDurationLabel(totalSeconds) {
    if (totalSeconds <= 0) {
        return "off";
    }

    const parts = [];
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours) {
        parts.push(`${hours}h`);
    }

    if (minutes) {
        parts.push(`${minutes}m`);
    }

    if (seconds || parts.length === 0) {
        parts.push(`${seconds}s`);
    }

    return parts.join(" ");
}

function updateBatteryEstimate() {
    const el = document.getElementById("batteryEstimate");
    if (!el) return;
    const seconds = getWakeUpPeriodSecondsPreview();
    if (seconds <= 0) { el.textContent = ""; return; }
    const batteryLifeHours = 0.5735 / ((54 * 15) / (seconds * 1000) + 15 / 1000000);
    const days = batteryLifeHours / 24;
    let label;
    if (days >= 1) {
        label = `~${days.toFixed(1)} days`;
    } else if (batteryLifeHours < 1) {
        label = `~${(batteryLifeHours * 60).toFixed(1)} minutes`;
    } else {
        label = `~${batteryLifeHours.toFixed(1)} hours`;
    }
    el.textContent = `Est. battery life: ${label}`;
}

function updateTimingSummary() {
    const wakeUpSeconds = getWakeUpPeriodSecondsPreview();
    const sendEvery = getMultiplierPreview(sendEveryInput);
    const saveEvery = getMultiplierPreview(saveEveryInput);
    const sendSeconds = sendEvery > 0 ? wakeUpSeconds * sendEvery : 0;
    const saveSeconds = saveEvery > 0 ? wakeUpSeconds * saveEvery : 0;

    timingSummary.textContent =
        `Wake-up Period: ${formatDurationLabel(wakeUpSeconds)} | ` +
        `Send Period: ${sendEvery > 0 ? `${formatDurationLabel(sendSeconds)}, Every ${sendEvery} wake-up(s)` : "disabled"} | ` +
        `Save Period: ${saveEvery > 0 ? `${formatDurationLabel(saveSeconds)}, Every ${saveEvery} wake-up(s)` : "disabled"}` +
        `${sendEvery <= 0 && saveEvery <= 0 ? " | Warning: both periodic actions are disabled." : ""}`;
}

function syncConfigFieldToControl(field, value) {
    switch (field) {
        case "id_1":
            idNumericValues.id1 = value;
            applyIdFormatToInputs();
            break;
        case "id_2":
            idNumericValues.id2 = value;
            applyIdFormatToInputs();
            break;
        case "lora_frequency_hz":
            frequencyRange.value = String(value / 1000000);
            syncOutputs();
            break;
        case "tx_power":
            powerRange.value = String(value);
            syncOutputs();
            break;
        case "auto_wakeup_period_s":
            setWakeUpPeriodFromSeconds(value);
            break;
        case "send_data_every_n":
            sendEveryInput.value = String(clampInteger(value, 0, SEND_SAVE_MULT_MAX));
            break;
        case "save_trace_every_n":
            saveEveryInput.value = String(clampInteger(value, 0, SEND_SAVE_MULT_MAX));
            break;
        case "is_p2p_encrypted":
            p2pEncryptedToggle.checked = Boolean(value);
            syncP2pEncryptionKeyUi();
            break;
        case "is_extended_packet":
            extendedPacketToggle.checked = Boolean(value);
            break;
        case "is_lorawan_mode":
            modeToggle.checked = Boolean(value);
            syncModeToggle();
            break;
        case "gnss_mode":
            gnssModeSelect.value = String(clampInteger(value, 0, GNSS_MODE_MAX));
            break;
        case "lorawan_region":
            syncLorawanRegionUi(value);
            break;
        case "dev_eui":
            devEuiInput.value = value.toUpperCase().slice(0, 16);
            break;
        case "app_eui":
            appEuiInput.value = value.toUpperCase().slice(0, 16);
            break;
        case "sleep_window":
            applySleepWindowConfig(value);
            break;
        default:
            break;
    }
}

function parseDeviceConfig(buffer) {
    NUMERIC_CONFIG_FIELDS.forEach((field) => {
        const value = parseNumericConfigField(buffer, field);
        if (value !== null) {
            deviceConfig[field] = value;
            syncConfigFieldToControl(field, value);
        }
    });

    const lorawanRegion = parseStringConfigField(buffer, "lorawan_region");
    if (lorawanRegion !== null) {
        deviceConfig.lorawan_region = lorawanRegion;
        syncConfigFieldToControl("lorawan_region", lorawanRegion);
    }

    const devEui = parseStringConfigField(buffer, "dev_eui");
    if (devEui !== null) {
        deviceConfig.dev_eui = devEui;
        syncConfigFieldToControl("dev_eui", devEui);
    }

    const appEui = parseStringConfigField(buffer, "app_eui");
    if (appEui !== null) {
        deviceConfig.app_eui = appEui;
        syncConfigFieldToControl("app_eui", appEui);
    }

    const sleepWindow = parseSleepWindowConfig(buffer);
    if (sleepWindow !== null) {
        deviceConfig.sleep_window = sleepWindow;
        syncConfigFieldToControl("sleep_window", sleepWindow);
    }
}

function paintRange(input) {
    const min = Number(input.min);
    const max = Number(input.max);
    const value = Number(input.value);
    const percent = `${((value - min) / (max - min)) * 100}%`;
    input.style.setProperty("--percent", percent);
}

function syncOutputs() {
    frequencyValue.value = `${frequencyRange.value} MHz`;
    powerValue.value = `${powerRange.value} dBm`;
    paintRange(frequencyRange);
    paintRange(powerRange);
    updateTimingSummary();
}


function activateTab(tabName) {
    configTabs.forEach((tab) => {
        const active = tab.dataset.tab === tabName;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
    });

    configPanels.forEach((panel) => {
        const active = panel.dataset.panel === tabName;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
    });
}

function activateDeviceTab(tabName, scope) {
    // Configuration and Firmware Update each have their own Air/Ground strip,
    // so only touch the tabs and panels inside the calling main panel.
    const root = scope || document;

    [...root.querySelectorAll(".device-tab")].forEach((tab) => {
        const active = tab.dataset.deviceTab === tabName;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
    });

    [...root.querySelectorAll(".device-panel")].forEach((panel) => {
        const active = panel.dataset.devicePanel === tabName;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
    });
}

function activateMainTab(tabName) {
    mainTabs.forEach((tab) => {
        const active = tab.dataset.mainTab === tabName;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
    });

    mainPanels.forEach((panel) => {
        const active = panel.dataset.mainPanel === tabName;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
    });

    if (tabName === "gnss-trace") {
        ensureGnssTraceMap();
        renderGnssTraceMap(gnssTraceRecordsBuffer);
    }

    if (tabName === "firmware-updater") {
        initFirmwareUpdater();
    }
}

let _fwUpdaterInitialized = false;
function initFirmwareUpdater() {
    if (_fwUpdaterInitialized) return;
    _fwUpdaterInitialized = true;
    if (window.FirmwareUpdater) {
        const fwApp = new window.FirmwareUpdater();
        fwApp.init();
    }
}

function syncModeTabsAvailability() {
    const lorawan = modeToggle.checked;
    const connected = Boolean(connectedPort);

    configTabs.forEach((tab) => {
        const tabName = tab.dataset.tab;
        const shouldDisable = !connected || ((!lorawan && tabName === "lorawan") || (lorawan && tabName === "p2p"));

        tab.disabled = shouldDisable;
        tab.classList.toggle("is-disabled", shouldDisable);
        tab.setAttribute("aria-disabled", String(shouldDisable));
    });
}

function syncModeToggle() {
    const lorawan = modeToggle.checked;
    modeNames[0].classList.toggle("active", !lorawan);
    modeNames[1].classList.toggle("active", lorawan);
    syncModeTabsAvailability();
    activateTab(lorawan ? "lorawan" : "p2p");
}

function syncModeFromTab(tabName) {
    if (tabName === "p2p") {
        modeToggle.checked = false;
    }

    if (tabName === "lorawan") {
        modeToggle.checked = true;
    }

    modeNames[0].classList.toggle("active", !modeToggle.checked);
    modeNames[1].classList.toggle("active", modeToggle.checked);
}

function setConnectionState(connected, hint) {
    connectionLabel.textContent = connected ? "Connected" : "Disconnected";
    connectionLabel.classList.toggle("connected", connected);
    connectionLabel.classList.toggle("disconnected", !connected);
    connectionHint.textContent = hint;
    connectButtonLabel.textContent = connected ? "Disconnect" : "Connect";
    connectButton.classList.toggle("connected", connected);
    connectButton.classList.toggle("disconnected", !connected);
    statusIcon.classList.toggle("connected", connected);
    statusIcon.classList.toggle("disconnected", !connected);
    syncControlsAvailability();
}

function setPortInfo(text) {
    portInfo.textContent = `Port: ${text}`;
}

function formatPortDetails(port) {
    if (!port || typeof port.getInfo !== "function") {
        return "not selected";
    }

    const info = port.getInfo();

    if (Number.isInteger(info.usbVendorId) && Number.isInteger(info.usbProductId)) {
        const vendor = info.usbVendorId.toString(16).toUpperCase().padStart(4, "0");
        const product = info.usbProductId.toString(16).toUpperCase().padStart(4, "0");
        return `USB VID:${vendor} PID:${product}`;
    }

    if (info.bluetoothServiceClassId) {
        return `Bluetooth ${info.bluetoothServiceClassId}`;
    }

    return "connected (browser did not expose hardware IDs)";
}

function trimDeviceInfoBuffer(buffer) {
    return buffer.length > 4096 ? buffer.slice(-2048) : buffer;
}

function processDeviceInfoLine(line, state) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
        return;
    }

    state.buffer = trimDeviceInfoBuffer(`${state.buffer}${trimmedLine}\n`);

    if (trimmedLine === "OK") {
        state.receivedOk = true;
        return;
    }

    parseDeviceConfig(state.buffer);
}

function processDeviceInfoChunk(chunk, state) {
    state.pendingLine += chunk;
    const lines = state.pendingLine.split(/\r\n|\n|\r/);
    state.pendingLine = lines.pop() ?? "";

    for (const line of lines) {
        processDeviceInfoLine(line, state);

        if (state.receivedOk) {
            state.pendingLine = "";
            break;
        }
    }
}

function flushPendingDeviceInfo(state) {
    const line = state.pendingLine.trim();
    if (!line) {
        return;
    }

    state.pendingLine = "";
    processDeviceInfoLine(line, state);
}

function resolveDeviceInfoStatus(buffer) {
    const uidMatch = buffer.match(/Flavor: \s*([^\r\n]+)/);
    const versionMatch = buffer.match(/Loko v\d+\.\d+\.\d+/);

    if (!versionMatch) {
        return null;
    }

    return uidMatch
        ? `${versionMatch[0]} [${uidMatch[1].trim()}]`
        : versionMatch[0];
}

function normalizeConfigString(value) {
    if (value === null || value === undefined) {
        return null;
    }

    return String(value).trim().toUpperCase();
}

function differsFromConfig(fieldName, nextValue, normalize = (value) => value) {
    const currentValue = deviceConfig[fieldName];
    if (currentValue === null || currentValue === undefined) {
        return true;
    }

    return normalize(currentValue) !== normalize(nextValue);
}

function buildSaveCommands() {
    const wakeUpPeriod = getWakeUpPeriodSeconds();
    const sendEvery = sanitizeIntegerInput(sendEveryInput, 0, SEND_SAVE_MULT_MAX);
    const saveEvery = sanitizeIntegerInput(saveEveryInput, 0, SEND_SAVE_MULT_MAX);
    const id1 = idNumericValues.id1;
    const id2 = idNumericValues.id2;
    const frequencyHz = Number(frequencyRange.value) * 1000000;
    const txPower = Number(powerRange.value);
    const gnssMode = Number(gnssModeSelect.value);
    const region = loraWanRegionSelect.value;
    const p2pEncrypted = Number(p2pEncryptedToggle.checked);
    const isExtendedPacket = Number(extendedPacketToggle.checked);
    const lorawanMode = Number(modeToggle.checked);

    const commands = [];
    const updatedConfigFields = {};

    if (differsFromConfig("id_1", id1)) {
        commands.push(`set id1 ${id1}`);
        updatedConfigFields.id_1 = id1;
    }

    if (differsFromConfig("id_2", id2)) {
        commands.push(`set id2 ${id2}`);
        updatedConfigFields.id_2 = id2;
    }

    if (differsFromConfig("lora_frequency_hz", frequencyHz)) {
        commands.push(`set freq ${frequencyHz}`);
        updatedConfigFields.lora_frequency_hz = frequencyHz;
    }

    if (differsFromConfig("auto_wakeup_period_s", wakeUpPeriod)) {
        commands.push(`wakeup period ${wakeUpPeriod}`);
        updatedConfigFields.auto_wakeup_period_s = wakeUpPeriod;
    }

    if (differsFromConfig("send_data_every_n", sendEvery)) {
        commands.push(`send every ${sendEvery}`);
        updatedConfigFields.send_data_every_n = sendEvery;
    }

    if (differsFromConfig("save_trace_every_n", saveEvery)) {
        commands.push(`gtrace every ${saveEvery}`);
        updatedConfigFields.save_trace_every_n = saveEvery;
    }

    if (differsFromConfig("gnss_mode", gnssMode)) {
        commands.push(`set gnss mode ${gnssMode}`);
        updatedConfigFields.gnss_mode = gnssMode;
    }

    const sleepWindow = getSleepWindowValue();
    const sleepWindowKnown = deviceConfig.sleep_window !== null && deviceConfig.sleep_window !== undefined;
    if (sleepWindow && (sleepWindowKnown ? deviceConfig.sleep_window !== sleepWindow : sleepWindowDirty)) {
        commands.push(`sleep set ${sleepWindow}`);
        updatedConfigFields.sleep_window = sleepWindow;
    }

    if (differsFromConfig("is_p2p_encrypted", p2pEncrypted)) {
        commands.push(`p2p encryption ${p2pEncrypted}`);
        updatedConfigFields.is_p2p_encrypted = p2pEncrypted;
    }

    if (differsFromConfig("is_extended_packet", isExtendedPacket)) {
        commands.push(`extended ${isExtendedPacket}`);
        updatedConfigFields.is_extended_packet = isExtendedPacket;
    }

    if (differsFromConfig("tx_power", txPower)) {
        commands.push(`set tx ${txPower}`);
        updatedConfigFields.tx_power = txPower;
    }

    const p2pKey = p2pEncryptionKeyInput.value.trim();
    if (p2pKey) {
        commands.push(`set p2p-key ${p2pKey}`);
    }

    // LoRaWAN sequence: disable → Region → DevEUI → AppEUI → AppKey → enable
    const lorawanRegionChanged = differsFromConfig("lorawan_region", region, normalizeConfigString);
    const lorawanModeChanged = differsFromConfig("is_lorawan_mode", lorawanMode);
    let devEui = "";
    let appEui = "";
    let appKey = "";
    let devEuiChanged = false;
    let appEuiChanged = false;
    if (modeToggle.checked) {
        devEui = devEuiInput.value.trim().toUpperCase();
        appEui = appEuiInput.value.trim().toUpperCase();
        appKey = appKeyInput.value.trim();
        devEuiChanged = !!(devEui && differsFromConfig("dev_eui", devEui, normalizeConfigString));
        appEuiChanged = !!(appEui && differsFromConfig("app_eui", appEui, normalizeConfigString));
    }

    const hasLorawanParamChanges = lorawanRegionChanged || devEuiChanged || appEuiChanged || !!appKey;
    if (hasLorawanParamChanges) {
        commands.push("enable lorawan mode 0");
        if (lorawanRegionChanged) {
            commands.push(`set region ${region}`);
            updatedConfigFields.lorawan_region = region;
        }
        if (devEuiChanged) {
            commands.push(`set dev-eui ${devEui}`);
            updatedConfigFields.dev_eui = devEui;
        }
        if (appEuiChanged) {
            commands.push(`set app-eui ${appEui}`);
            updatedConfigFields.app_eui = appEui;
        }
        if (appKey) {
            commands.push(`set app-key ${appKey}`);
        }
        commands.push(`enable lorawan mode ${lorawanMode}`);
        if (lorawanModeChanged) {
            updatedConfigFields.is_lorawan_mode = lorawanMode;
        }
    } else if (lorawanModeChanged) {
        commands.push(`enable lorawan mode ${lorawanMode}`);
        updatedConfigFields.is_lorawan_mode = lorawanMode;
    }

    if (commands.length === 0) {
        return { commands: [], updatedConfigFields };
    }

    commands.push("reset");

    return { commands, updatedConfigFields };
}

function delay(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

async function drainSerialInput(idleTimeoutMs = 10, maxDrainMs = 10) {
    if (!connectedPort || !reader) {
        return "";
    }

    let drainedBuffer = "";
    const deadline = Date.now() + maxDrainMs;

    while (connectedPort && Date.now() < deadline) {
        const remainingMs = Math.min(idleTimeoutMs, deadline - Date.now());
        const readResult = await Promise.race([
            reader.read(),
            new Promise((resolve) => {
                window.setTimeout(() => resolve(null), remainingMs);
            })
        ]);

        if (!readResult) {
            break;
        }

        const { value, done } = readResult;
        const chunk = decoder.decode(value ?? new Uint8Array(), { stream: !done });

        if (chunk) {
            drainedBuffer = trimDeviceInfoBuffer(`${drainedBuffer}${chunk}`);
            debugSerial("[serial drain chunk]", JSON.stringify(chunk));
        }

        if (done) {
            break;
        }
    }

    if (drainedBuffer) {
        debugSerial("[serial drain complete]", JSON.stringify(drainedBuffer));
    }

    return drainedBuffer;
}

// Reads are raced against timeouts in several places. Abandoning the loser of
// that race leaves an in-flight reader.read() whose chunk would otherwise be
// swallowed by nobody, so the pending promise is cached and handed to the next
// reader instead of starting a second, competing read.
let pendingSerialRead = null;

function readSerialChunk() {
    if (!pendingSerialRead) {
        const read = reader.read();
        pendingSerialRead = read;
        const clear = () => {
            if (pendingSerialRead === read) {
                pendingSerialRead = null;
            }
        };
        read.then(clear, clear);
    }

    return pendingSerialRead;
}

async function sendSerialCommandAndWaitForOk(command, timeoutMs = 2000, lineEnding = "\r", onLine = null, trimResponseBuffer = true) {
    if (!connectedPort || !connectedPort.writable || !reader) {
        throw new Error("Serial connection is not ready.");
    }

    // await drainSerialInput();

    const writer = connectedPort.writable.getWriter();

    try {
        debugSerial("[serial write]", command);
        await writer.write(encoder.encode(`${command}${lineEnding}`));
        termLog("> " + command, "cmd");
    } finally {
        writer.releaseLock();
    }

    let pendingLine = "";
    let responseBuffer = "";
    const deadline = Date.now() + timeoutMs;

    while (connectedPort && Date.now() < deadline) {
        const remainingMs = deadline - Date.now();
        const readResult = await Promise.race([
            readSerialChunk(),
            new Promise((_, reject) => {
                window.setTimeout(() => reject(new Error(`Timeout waiting for OK after: ${command}`)), remainingMs);
            })
        ]);

        const { value, done } = readResult;
        const chunk = decoder.decode(value ?? new Uint8Array(), { stream: !done });

        if (chunk) {
            debugSerial("[serial ack chunk]", JSON.stringify(chunk));
            pendingLine += chunk;
            const lines = pendingLine.split(/\r\n|\n|\r/);
            pendingLine = lines.pop() ?? "";

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) {
                    continue;
                }

                if (typeof onLine === "function") {
                    await Promise.resolve(onLine(trimmedLine));
                }

                responseBuffer = trimResponseBuffer
                    ? trimDeviceInfoBuffer(`${responseBuffer}${trimmedLine}\n`)
                    : `${responseBuffer}${trimmedLine}\n`;
                debugSerial("[serial ack line]", trimmedLine);
                termLog("< " + trimmedLine, trimmedLine === "OK" ? "ok" : trimmedLine.startsWith("ERROR") ? "err" : "default");

                if (trimmedLine === "OK") {
                    return responseBuffer;
                }

                // The device answered but refused the command — no OK is coming,
                // so surface its own wording instead of stalling until timeout.
                if (trimmedLine.startsWith("ERROR")) {
                    throw new Error(`Device rejected "${command}" — ${trimmedLine}`);
                }
            }
        }

        if (done) {
            break;
        }
    }

    throw new Error(`Did not receive OK after: ${command}`);
}

// `alertOnTimeout` belongs to the connect-time probe only: there a silent port
// really does mean the wrong device was picked. After a `reset` the device is
// merely rebooting, so the caller passes a longer timeout and handles the miss
// itself instead of accusing the user of choosing the wrong port.
async function requestDeviceInfo({ timeoutMs = DEVICE_INFO_TIMEOUT_MS, alertOnTimeout = true } = {}) {
    if (!connectedPort || !connectedPort.writable || !reader) {
        setConnectionState(true, "Connected. Device info stream unavailable.");
        return false;
    }

    try {
        deviceConfig = createEmptyDeviceConfig();
        window.lokoAirConfig = deviceConfig;

        setConnectionState(true, "Connected. Waiting for device info...");

        const writer = connectedPort.writable.getWriter();

        await writer.write(encoder.encode("\r"));
        await delay(150);

        await writer.write(encoder.encode("info\r"));
        writer.releaseLock();

        const deviceInfoState = {
            buffer: "",
            pendingLine: "",
            receivedOk: false
        };

        let timedOut = false;
        let releaseWait = () => { };
        // Without alertOnTimeout nothing cancels the reader, so the timeout has
        // to break the read itself or the loop waits on a silent device forever.
        const timeoutSignal = new Promise((resolve) => { releaseWait = resolve; });
        const timeoutId = setTimeout(async () => {
            timedOut = true;
            if (alertOnTimeout) {
                await disconnectPort();
                window.alert("No response... Possibly selected port is not a Loko-AIR device port.");
            }
            releaseWait(null);
        }, timeoutMs);

        while (connectedPort && !timedOut) {
            const readResult = await Promise.race([readSerialChunk(), timeoutSignal]);
            if (!readResult) {
                break;
            }

            const { value, done } = readResult;
            const chunk = decoder.decode(value ?? new Uint8Array(), { stream: !done });

            if (chunk) {
                debugSerial("[serial chunk]", JSON.stringify(chunk));
                processDeviceInfoChunk(chunk, deviceInfoState);
            }

            if (done || deviceInfoState.receivedOk) {
                break;
            }

            const statusText = resolveDeviceInfoStatus(deviceInfoState.buffer);
            if (statusText) {
                clearTimeout(timeoutId);
                setConnectionState(true, statusText);
            }
        }

        flushPendingDeviceInfo(deviceInfoState);
        clearTimeout(timeoutId);
        releaseWait(null);

        if (timedOut || !connectedPort) {
            return false;
        }

        const statusText = resolveDeviceInfoStatus(deviceInfoState.buffer);
        if (statusText) {
            setConnectionState(true, statusText);
            return true;
        }

        setConnectionState(true, "Connected, but Loko version was not received.");
        return false;
    } catch (error) {
        if (!connectedPort) {
            return false;
        }

        setConnectionState(true, `Connected, info read failed: ${error.message || "unknown error"}`);
        return false;
    }
}

// Used after any command that reboots the device (`reset`, `erase`). Never
// alerts or drops the port: the settings were already acknowledged, so failing
// to re-read them is cosmetic.
async function refreshDeviceInfoAfterReboot() {
    for (let attempt = 0; attempt < DEVICE_INFO_AFTER_REBOOT_ATTEMPTS; attempt += 1) {
        await delay(DEVICE_REBOOT_DELAY_MS);

        if (!connectedPort) {
            return false;
        }

        const refreshed = await requestDeviceInfo({
            timeoutMs: DEVICE_INFO_AFTER_REBOOT_TIMEOUT_MS,
            alertOnTimeout: false
        });

        if (refreshed) {
            return true;
        }
    }

    return false;
}

async function disconnectPort() {
    pendingSerialRead = null;

    if (reader) {
        await reader.cancel().catch(() => { });
        reader.releaseLock();
        reader = null;
    }

    if (connectedPort) {
        await connectedPort.close().catch(() => { });
        connectedPort = null;
    }

    termLog("── disconnected ──", "muted");
    setConnectionState(false, "Serial connection closed.");
    setPortInfo("not selected");
}

async function connectPort() {
    if (!("serial" in navigator)) {
        setConnectionState(false, "Web Serial is available in Chromium-based browsers only.");
        setPortInfo("unavailable in this browser");
        return;
    }

    try {
        connectedPort = await navigator.serial.requestPort();
        await connectedPort.open({
            baudRate: 115200,
            dataBits: 8,
            stopBits: 1,
            parity: "none",
            flowControl: "none"
        });

        if (connectedPort.readable) {
            pendingSerialRead = null;
            reader = connectedPort.readable.getReader();
        }

        setConnectionState(true, "Connected.");
        setPortInfo(formatPortDetails(connectedPort));
        termLog("── connected: " + formatPortDetails(connectedPort) + " ──", "info");
        await requestDeviceInfo();
    } catch (error) {
        connectedPort = null;
        termLog("error: " + (error.message || "Serial port permission denied."), "err");
        setConnectionState(false, error.message || "Serial port permission denied.");
        setPortInfo("not selected");
    }
}

function resetForm() {
    frequencyRange.value = "915";
    powerRange.value = "14";
    idNumericValues.id1 = null;
    idNumericValues.id2 = null;
    idRadix = 10;
    idFormatToggle.checked = false;
    syncIdFormatUi();
    applyIdFormatToInputs();
    p2pEncryptedToggle.checked = false;
    p2pEncryptionKey = "";
    p2pEncryptionKeyInput.value = "";
    extendedPacketToggle.checked = false;
    wakeUpPeriodUnitSelect.value = "1";
    syncWakeUpPeriodConstraints();
    wakeUpPeriodInput.value = "0";
    sendEveryInput.value = "0";
    saveEveryInput.value = "0";
    gnssModeSelect.value = "0";
    sleepWindowToggle.checked = false;
    sleepStartInput.value = SLEEP_WINDOW_DEFAULT_START;
    sleepEndInput.value = SLEEP_WINDOW_DEFAULT_END;
    sleepWindowDirty = false;
    devEuiInput.value = "";
    appEuiInput.value = "";
    appKeyInput.value = "";
    modeToggle.checked = false;
    syncModeToggle();
    syncOutputs();
    syncP2pEncryptionKeyUi();
    syncSleepWindowUi();
    saveStatus.textContent = "Defaults restored.";
}

frequencyRange.addEventListener("input", syncOutputs);
powerRange.addEventListener("input", syncOutputs);
wakeUpPeriodInput.addEventListener("input", () => { updateTimingSummary(); updateBatteryEstimate(); });
wakeUpPeriodInput.addEventListener("change", () => {
    getWakeUpPeriodSeconds();
    syncOutputs();
    updateBatteryEstimate();
});
wakeUpPeriodUnitSelect.addEventListener("change", () => {
    handleWakeUpPeriodUnitChange();
    syncOutputs();
    updateBatteryEstimate();
});
sendEveryInput.addEventListener("input", updateTimingSummary);
sendEveryInput.addEventListener("change", () => {
    sanitizeIntegerInput(sendEveryInput, 0, SEND_SAVE_MULT_MAX);
    syncOutputs();
});
saveEveryInput.addEventListener("input", updateTimingSummary);
saveEveryInput.addEventListener("change", () => {
    sanitizeIntegerInput(saveEveryInput, 0, SEND_SAVE_MULT_MAX);
    syncOutputs();
});
id1Input.addEventListener("input", () => handleIdInput(id1Input, "id1"));
id2Input.addEventListener("input", () => handleIdInput(id2Input, "id2"));
p2pEncryptionKeyInput.addEventListener("input", handleP2pEncryptionKeyInput);
devEuiInput.addEventListener("input", () => sanitizeHexFieldInput(devEuiInput, 16));
appEuiInput.addEventListener("input", () => sanitizeHexFieldInput(appEuiInput, 16));
appKeyInput.addEventListener("input", () => sanitizeHexFieldInput(appKeyInput, 32));
idFormatToggle.addEventListener("change", () => {
    idRadix = idFormatToggle.checked ? 16 : 10;
    syncIdFormatUi();
    applyIdFormatToInputs();
});
p2pEncryptedToggle.addEventListener("change", syncP2pEncryptionKeyUi);
sleepWindowToggle.addEventListener("change", () => {
    sleepWindowDirty = true;
    syncSleepWindowUi();
});
[
    { input: sleepStartInput, fallback: SLEEP_WINDOW_DEFAULT_START },
    { input: sleepEndInput, fallback: SLEEP_WINDOW_DEFAULT_END }
].forEach(({ input, fallback }) => {
    input.addEventListener("input", () => {
        sleepWindowDirty = true;
        sanitizeTimeOfDayInput(input);
        updateSleepWindowSummary();
    });
    input.addEventListener("change", () => {
        commitTimeOfDayInput(input, fallback);
        updateSleepWindowSummary();
    });
});

gnssTraceOutputBody.addEventListener("click", (event) => {
    const clickedRow = event.target.closest("tr[data-record-number]");
    if (!clickedRow || !gnssTraceOutputBody.contains(clickedRow)) {
        return;
    }

    const recordNumber = Number(clickedRow.dataset.recordNumber);
    selectGnssTraceRecord(recordNumber, true);
});

readGnssTraceButton.addEventListener("click", async () => {
    if (!connectedPort) {
        return;
    }

    readGnssTraceButton.disabled = true;
    eraseGnssTraceButton.disabled = true;
    exportGnssTraceButton.disabled = true;
    exportGnssTraceCsvButton.disabled = true;
    clearSelectedGnssTraceRecord();
    clearGnssTraceOutputTable();
    appendGnssTraceMessageRow("Reading GNSS trace... Please wait.");
    resetGnssTraceProgress();

    let traceTotal = 0;
    let traceLoaded = 0;
    let pendingTraceOutputLines = [];
    let lastTraceOutputFlush = 0;
    let outputWasTrimmed = false;

    function flushTraceOutput(force = false) {
        if (!pendingTraceOutputLines.length) {
            return;
        }

        const now = Date.now();
        if (!force && now - lastTraceOutputFlush < GNSS_TRACE_OUTPUT_FLUSH_INTERVAL_MS) {
            return;
        }

        const linesToAppend = pendingTraceOutputLines;
        pendingTraceOutputLines = [];
        outputWasTrimmed = appendGnssTraceRows(linesToAppend, GNSS_TRACE_OUTPUT_MAX_LINES) || outputWasTrimmed;
        lastTraceOutputFlush = now;
    }

    try {
        let lastProgressPaint = 0;
        const response = await sendSerialCommandAndWaitForOk("gtrace print", 120000, "\r", async (line) => {
            pendingTraceOutputLines.push(line);
            flushTraceOutput();

            const totalMatch = line.match(/^Record found\s+(\d+)/i);
            if (totalMatch) {
                traceTotal = Number(totalMatch[1]);
                traceLoaded = 0;
                setGnssTraceProgress(traceLoaded, traceTotal);
                await waitForNextPaint();
                return;
            }

            const recordMatch = line.match(/^#(\d+)\s+/);
            if (recordMatch && traceTotal > 0) {
                traceLoaded = Math.max(traceLoaded, Number(recordMatch[1]) + 1);
                setGnssTraceProgress(traceLoaded, traceTotal);

                if (traceLoaded === traceTotal || Date.now() - lastProgressPaint >= 33) {
                    lastProgressPaint = Date.now();
                    flushTraceOutput(true);
                    await waitForNextPaint();
                }
            }
        }, false);
        flushTraceOutput(true);
        const parsedRecords = parseGnssTraceRecords(response);
        setGnssTraceRecordsBuffer(parsedRecords);

        if (traceTotal <= 0 && parsedRecords.length > 0) {
            setGnssTraceProgress(parsedRecords.length, parsedRecords.length);
        } else {
            setGnssTraceProgress(Math.max(traceLoaded, parsedRecords.length), traceTotal);
        }
    } catch (error) {
        clearGnssTraceOutputTable();
        appendGnssTraceMessageRow(`Read failed: ${error.message || "unknown error"}`);
        resetGnssTraceProgress();
    } finally {
        readGnssTraceButton.disabled = false;
        eraseGnssTraceButton.disabled = false;
        syncGnssTraceExportButtonState();
    }
});

eraseGnssTraceButton.addEventListener("click", async () => {
    if (!connectedPort) {
        return;
    }

    if (!eraseTraceConfirmArmed) {
        eraseTraceConfirmArmed = true;
        eraseGnssTraceButton.textContent = "Confirm Erase";
        eraseGnssTraceButton.classList.add("is-danger");

        eraseTraceConfirmTimer = window.setTimeout(() => {
            resetEraseTraceConfirmationUi();
        }, ERASE_TRACE_CONFIRM_WINDOW_MS);
        return;
    }

    resetEraseTraceConfirmationUi();

    eraseGnssTraceButton.disabled = true;
    readGnssTraceButton.disabled = true;
    exportGnssTraceButton.disabled = true;
    exportGnssTraceCsvButton.disabled = true;

    try {
        await sendSerialCommandAndWaitForOk("gtrace erase", 10000, "\r\n");
        clearSelectedGnssTraceRecord();
        setGnssTraceRecordsBuffer([]);
        clearGnssTraceOutputTable();
        appendGnssTraceMessageRow("GNSS trace erased.");
        resetGnssTraceProgress();
    } catch (error) {
        appendGnssTraceMessageRow(`GNSS trace erase failed: ${error.message || "unknown error"}`);
    } finally {
        eraseGnssTraceButton.disabled = false;
        readGnssTraceButton.disabled = false;
        syncGnssTraceExportButtonState();
        resetEraseTraceConfirmationUi();
    }
});

exportGnssTraceButton.addEventListener("click", () => {
    if (!gnssTraceRecordsBuffer.length) {
        return;
    }

    const gpx = buildGpxFromTraceRecords(gnssTraceRecordsBuffer);
    const fileName = `gnss-trace-${new Date().toISOString().replace(/[:.]/g, "-")}.gpx`;
    downloadTextFile(gpx, fileName, "application/gpx+xml;charset=utf-8");
});

exportGnssTraceCsvButton.addEventListener("click", () => {
    if (!gnssTraceRecordsBuffer.length) {
        return;
    }

    const csv = buildCsvFromTraceRecords(gnssTraceRecordsBuffer);
    const fileName = `gnss-trace-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    downloadTextFile(csv, fileName, "text/csv;charset=utf-8");
});

mainTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        activateMainTab(tab.dataset.mainTab);
    });
});

deviceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        activateDeviceTab(tab.dataset.deviceTab, tab.closest("[data-main-panel]"));
    });
});

configTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        if (tab.disabled) {
            return;
        }

        if (tab.dataset.tab === "p2p") {
            modeToggle.checked = false;
            syncModeToggle();
            return;
        }

        if (tab.dataset.tab === "lorawan") {
            modeToggle.checked = true;
            syncModeToggle();
            return;
        }

        syncModeFromTab(tab.dataset.tab);
    });
});

modeToggle.addEventListener("change", syncModeToggle);

connectButton.addEventListener("click", async () => {
    if (connectedPort) {
        await disconnectPort();
        return;
    }

    await connectPort();
});

saveButton.addEventListener("click", async () => {
    if (!connectedPort) {
        saveStatus.textContent = "Connect to the device before saving settings.";
        return;
    }

    if (idNumericValues.id1 === null || idNumericValues.id2 === null) {
        saveStatus.textContent = "ID1 and ID2 must be set before saving.";
        return;
    }

    const p2pKeyCandidate = sanitizeP2pEncryptionKey(p2pEncryptionKeyInput.value.trim());
    p2pEncryptionKeyInput.value = p2pKeyCandidate;
    p2pEncryptionKey = p2pKeyCandidate;

    if (p2pKeyCandidate && !isValidP2pEncryptionKey(p2pKeyCandidate)) {
        saveStatus.textContent = "P2P key must contain exactly 64 HEX characters or be empty.";
        return;
    }

    if (getSleepWindowValue() === null) {
        saveStatus.textContent = "Sleep window needs a valid start and end time (HH:MM UTC), and they must differ.";
        return;
    }

    const { commands, updatedConfigFields } = buildSaveCommands();
    if (commands.length === 0) {
        saveStatus.textContent = "No changes detected. Nothing to save.";
        return;
    }

    saveButton.disabled = true;
    saveStatus.textContent = "Sending settings to device...";
    let saveSucceeded = false;

    try {
        for (const [index, command] of commands.entries()) {
            saveStatus.textContent = `Sending: ${command}`;
            await sendSerialCommandAndWaitForOk(command);

            if (index < commands.length - 1) {
                await delay(180);
            }
        }

        Object.entries(updatedConfigFields).forEach(([fieldName, value]) => {
            deviceConfig[fieldName] = value;
        });

        saveStatus.textContent = "Settings saved successfully.";
        saveSucceeded = true;
    } catch (error) {
        saveStatus.textContent = `Save failed: ${error.message || "unknown error"}`;
    } finally {
        saveButton.disabled = false;
    }

    // Re-reading `info` after a failed save only produces a second, misleading
    // failure ("not a Loko-AIR device port") and drops the connection, hiding
    // the real error above. Stay connected so the save can be retried.
    if (!saveSucceeded) {
        return;
    }

    // The settings were already ACKed one by one; this refresh is a bonus, so a
    // device that is slow to come back from `reset` must not undo the save
    // message or drop the port.
    saveStatus.textContent = "Settings saved. Waiting for the device to restart...";
    const refreshed = await refreshDeviceInfoAfterReboot();

    saveStatus.textContent = refreshed
        ? "Settings saved successfully."
        : "Settings saved successfully. Device did not report back after restarting — reconnect to re-read it.";
});

resetButton.addEventListener("click", async () => {
    if (!connectedPort) {
        saveStatus.textContent = "Connect to the device before resetting settings.";
        return;
    }

    if (!resetConfirmArmed) {
        resetConfirmArmed = true;
        resetButton.textContent = "Confirm Reset";
        resetButton.classList.add("is-danger");
        saveStatus.textContent = "Press Reset to Defaults again within 5s to confirm.";

        resetConfirmTimer = window.setTimeout(() => {
            resetResetConfirmationUi();
            saveStatus.textContent = "Reset canceled.";
        }, ERASE_TRACE_CONFIRM_WINDOW_MS);
        return;
    }

    resetResetConfirmationUi();

    resetButton.disabled = true;
    saveButton.disabled = true;
    saveStatus.textContent = "Set default configuration...";

    try {
        await sendSerialCommandAndWaitForOk("erase");
        resetForm();
        saveStatus.textContent = "Defaults restored.";
    } catch (error) {
        saveStatus.textContent = `Reset failed: ${error.message || "unknown error"}`;
    } finally {
        syncControlsAvailability();
        resetResetConfirmationUi();
    }

    // `erase` restarts the device too — same reboot handling as a save.
    await refreshDeviceInfoAfterReboot();
});

window.addEventListener("beforeunload", () => {
    if (connectedPort) {
        disconnectPort();
    }
});

if ("serial" in navigator) {
    navigator.serial.getPorts().then((ports) => {
        if (ports.length > 0) {
            connectionHint.textContent = "Serial permission already exists for one or more devices.";
            setPortInfo(`${ports.length} authorized port(s)`);
        }
    }).catch(() => { });
}

syncOutputs();
syncModeToggle();
syncIdFormatUi();
syncP2pEncryptionKeyUi();
syncSleepWindowUi();
syncWakeUpPeriodConstraints();
updateBatteryEstimate();
activateMainTab("configuration");
setConnectionState(false, "Browser access to the serial device has not been granted.");
setPortInfo("serial permission not granted");
resetGnssTraceProgress();
syncGnssTraceExportButtonState();

// ── Ground Unit ───────────────────────────────────────────────────────────────
let groundConnectedPort = null;
let groundReader = null;

const groundTermOutput = document.getElementById("groundTermOutput");
const groundTermClearBtn = document.getElementById("groundTermClearBtn");
const groundTermExportBtn = document.getElementById("groundTermExportBtn");
const groundTermAutoscroll = document.getElementById("groundTermAutoscroll");
const groundTermTimestamps = document.getElementById("groundTermTimestamps");
const groundTermForm = document.getElementById("groundTermForm");
const groundTermInput = document.getElementById("groundTermInput");
const groundMonitorDot = document.getElementById("groundMonitorDot");
const groundConnectButton = document.getElementById("groundConnectButton");
const groundConnectButtonLabel = document.getElementById("groundConnectButtonLabel");
const groundConnectionLabel = document.getElementById("groundConnectionLabel");
const groundConnectionHint = document.getElementById("groundConnectionHint");
const groundPortInfo = document.getElementById("groundPortInfo");
const groundStatusIcon = document.getElementById("groundStatusIcon");
const groundId2Input = document.getElementById("groundId2");
const groundFreqInput = document.getElementById("groundFreq");
const groundP2pKeyInput = document.getElementById("groundP2pKey");
const groundReadButton = document.getElementById("groundReadButton");
const groundSendButton = document.getElementById("groundSendButton");
const groundSaveStatus = document.getElementById("groundSaveStatus");

// The monitor keeps at most this many lines so a long session cannot grow the
// DOM without bound.
const GROUND_TERM_MAX_LINES = 2000;

// Export reads from this buffer rather than the DOM, so exported logs always
// carry a timestamp regardless of the Timestamps display toggle.
let groundTermLines = [];

function groundTermTimestamp() {
    const now = new Date();
    const pad = (n, w = 2) => String(n).padStart(w, "0");
    return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)} `;
}

function groundTermLog(text, type = "default") {
    if (!groundTermOutput) return;
    const wasAtBottom = groundTermOutput.scrollHeight - groundTermOutput.clientHeight <= groundTermOutput.scrollTop + 4;
    const line = document.createElement("span");
    line.className = "term-line" + (type !== "default" ? " term-" + type : "");
    line.textContent = (groundTermTimestamps?.checked ? groundTermTimestamp() : "") + text;
    if (groundTermOutput.firstChild?.classList?.contains("term-muted") &&
        groundTermOutput.firstChild?.textContent === "Waiting for connection…") {
        groundTermOutput.replaceChildren();
    }
    groundTermOutput.appendChild(line);
    groundTermLines.push({ at: new Date().toISOString(), text });
    while (groundTermOutput.childElementCount > GROUND_TERM_MAX_LINES) {
        groundTermOutput.removeChild(groundTermOutput.firstChild);
    }
    if (groundTermLines.length > GROUND_TERM_MAX_LINES) {
        groundTermLines = groundTermLines.slice(-GROUND_TERM_MAX_LINES);
    }
    syncGroundTermExportState();
    if (groundTermAutoscroll?.checked !== false && wasAtBottom) {
        groundTermOutput.scrollTop = groundTermOutput.scrollHeight;
    }
}

function syncGroundTermExportState() {
    if (groundTermExportBtn) groundTermExportBtn.disabled = groundTermLines.length === 0;
}

if (groundTermClearBtn) {
    groundTermClearBtn.addEventListener("click", () => {
        if (groundTermOutput) groundTermOutput.replaceChildren();
        groundTermLines = [];
        syncGroundTermExportState();
    });
}

if (groundTermExportBtn) {
    groundTermExportBtn.addEventListener("click", () => {
        if (!groundTermLines.length) return;
        const header = [
            "# Loko Ground Unit — serial monitor log",
            `# Exported: ${new Date().toISOString()}`,
            `# Port: ${groundConnectedPort ? formatPortDetails(groundConnectedPort) : "not connected"}`,
            `# Lines: ${groundTermLines.length}`,
            ""
        ].join("\n");
        const body = groundTermLines.map((line) => `${line.at}\t${line.text}`).join("\n");
        const fileName = `ground-serial-${new Date().toISOString().replace(/[:.]/g, "-")}.log`;
        downloadTextFile(header + body + "\n", fileName, "text/plain;charset=utf-8");
    });
}

syncGroundTermExportState();

// ── Ground Unit serial monitor ───────────────────────────────────────────────
// A single read loop owns the reader for the lifetime of the connection so the
// device's output is always visible. Commands no longer read the port directly;
// they subscribe to the parsed lines this loop emits.
let groundLineListeners = [];
let groundReadLoopPromise = null;
// `info` responses are only parsed into the form fields while a Read is in
// flight — otherwise unsolicited output would overwrite what the user typed.
let groundParseInfoLines = false;

function emitGroundLine(text) {
    for (const listener of groundLineListeners.slice()) listener(text);
}

function waitForGroundOk(timeoutMs, label) {
    return new Promise((resolve, reject) => {
        let buffer = "";
        const cleanup = () => {
            groundLineListeners = groundLineListeners.filter((l) => l !== listener);
            window.clearTimeout(timer);
        };
        const listener = (text) => {
            buffer += text + "\n";
            if (text === "OK") { cleanup(); resolve(buffer); }
            else if (/^Error:/i.test(text)) { cleanup(); reject(new Error(text)); }
        };
        const timer = window.setTimeout(() => {
            cleanup();
            reject(new Error(`Did not receive OK after: ${label}`));
        }, timeoutMs);
        groundLineListeners.push(listener);
    });
}

function setGroundMonitorActive(active) {
    if (groundMonitorDot) groundMonitorDot.classList.toggle("success", active);
    if (groundTermInput) groundTermInput.disabled = !active;
}

async function groundReadLoop() {
    const decoder = new TextDecoder();
    let pendingLine = "";
    try {
        while (groundReader) {
            const { value, done } = await groundReader.read();
            if (done) break;
            const chunk = decoder.decode(value ?? new Uint8Array(), { stream: true });
            if (!chunk) continue;
            pendingLine += chunk;
            const lines = pendingLine.split(/\r\n|\n|\r/);
            pendingLine = lines.pop() ?? "";
            for (const line of lines) {
                const text = line.trim();
                if (!text) continue;
                const isErr = /^Error:/i.test(text);
                groundTermLog("< " + text, text === "OK" ? "ok" : isErr ? "err" : "default");
                if (groundParseInfoLines) parseGroundDeviceInfoLine(text);
                emitGroundLine(text);
            }
        }
    } catch (error) {
        // Cancelling the reader on disconnect rejects the pending read() — that
        // is the normal teardown path, not a failure worth surfacing.
        if (groundConnectedPort) {
            groundTermLog("monitor stopped: " + (error.message || "read error"), "err");
        }
    } finally {
        setGroundMonitorActive(false);
    }
}

async function writeGroundSerial(text) {
    if (!groundConnectedPort || !groundConnectedPort.writable) {
        throw new Error("Ground Unit serial connection is not ready.");
    }
    const writer = groundConnectedPort.writable.getWriter();
    try {
        await writer.write(new TextEncoder().encode(text));
    } finally {
        writer.releaseLock();
    }
}

if (groundTermForm) {
    groundTermForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const command = groundTermInput.value.trim();
        if (!command || !groundConnectedPort) return;
        groundTermInput.value = "";
        try {
            groundTermLog("> " + command, "cmd");
            await writeGroundSerial(`${command}\r`);
        } catch (error) {
            groundTermLog("write error: " + (error.message || "unknown error"), "err");
        }
    });
}

function setGroundConnectionState(connected, hint) {
    if (!groundConnectionLabel) return;
    groundConnectionLabel.textContent = connected ? "Connected" : "Disconnected";
    groundConnectionLabel.classList.toggle("connected", connected);
    groundConnectionLabel.classList.toggle("disconnected", !connected);
    groundConnectionHint.textContent = hint;
    groundConnectButtonLabel.textContent = connected ? "Disconnect" : "Connect";
    groundConnectButton.classList.toggle("connected", connected);
    groundConnectButton.classList.toggle("disconnected", !connected);
    groundStatusIcon.classList.toggle("connected", connected);
    groundStatusIcon.classList.toggle("disconnected", !connected);
    groundReadButton.disabled = !connected;
    groundSendButton.disabled = !connected;
}

function setGroundPortInfo(text) {
    if (groundPortInfo) groundPortInfo.textContent = `Port: ${text}`;
}

function parseGroundDeviceInfoLine(line) {
    let match = line.match(/(?:Device ID\s*\(id2\)|ID2|id2|gid2)\s*[:=]\s*([0-9a-fx]+)/i);
    if (match && groundId2Input) {
        let value = match[1].trim();
        if (/^0x/i.test(value)) value = parseInt(value, 16).toString();
        groundId2Input.value = value.replace(/[^0-9]/g, "");
        return;
    }
    match = line.match(/(?:Frequency|frequency|gfreq)\s*[:=]\s*([0-9]+)/i);
    if (match && groundFreqInput) {
        groundFreqInput.value = match[1].trim().replace(/[^0-9]/g, "");
        return;
    }
    // P2P key is intentionally not populated from Read — user must enter a new key explicitly to update it.
}

async function groundDisconnectPort() {
    // Clear the port first so the read loop treats its cancelled read() as a
    // normal teardown rather than a monitor failure.
    const port = groundConnectedPort;
    groundConnectedPort = null;
    if (groundReader) {
        const reader = groundReader;
        await reader.cancel().catch(() => {});
        groundReader = null;
        await groundReadLoopPromise?.catch(() => {});
        groundReadLoopPromise = null;
        reader.releaseLock();
    }
    groundLineListeners = [];
    if (port) await port.close().catch(() => {});
    setGroundMonitorActive(false);
    groundTermLog("── disconnected ──", "muted");
    setGroundConnectionState(false, "Serial connection closed.");
    setGroundPortInfo("not selected");
}

async function sendGroundCommandAndWaitForOk(command, timeoutMs = 2000) {
    if (!groundConnectedPort || !groundConnectedPort.writable || !groundReader) {
        throw new Error("Ground Unit serial connection is not ready.");
    }
    // Subscribe before writing so a fast reply cannot land between the two.
    const response = waitForGroundOk(timeoutMs, command);
    groundTermLog("> " + command, "cmd");
    await writeGroundSerial(`${command}\r`);
    return response;
}

async function requestGroundDeviceInfo() {
    if (!groundConnectedPort || !groundConnectedPort.writable || !groundReader) return;
    groundParseInfoLines = true;
    try {
        setGroundConnectionState(true, "Connected. Reading device info...");
        // Wake the device's line parser first (matches the Air-unit handshake),
        // then send the command terminated with a bare CR — the firmware does
        // not respond to "info\r\n".
        await writeGroundSerial("\r");
        await delay(150);

        const response = waitForGroundOk(1000, "info");
        groundTermLog("> info", "cmd");
        await writeGroundSerial("info\r");
        await response;

        setGroundConnectionState(true, "Connected to Ground Unit.");
    } catch (error) {
        if (!groundConnectedPort) return;
        if (/Did not receive OK/i.test(error.message || "")) {
            await groundDisconnectPort();
            window.alert("No response from Ground Unit… Make sure a Loko Ground Unit is connected.");
            return;
        }
        setGroundConnectionState(true, `Connected, info read failed: ${error.message || "unknown error"}`);
    } finally {
        groundParseInfoLines = false;
    }
}

async function groundConnectPort() {
    if (!("serial" in navigator)) {
        setGroundConnectionState(false, "Web Serial is available in Chromium-based browsers only.");
        setGroundPortInfo("unavailable in this browser");
        return;
    }
    try {
        groundConnectedPort = await navigator.serial.requestPort();
        await groundConnectedPort.open({ baudRate: 115200, dataBits: 8, stopBits: 1, parity: "none", flowControl: "none" });
        if (groundConnectedPort.readable) groundReader = groundConnectedPort.readable.getReader();
        setGroundConnectionState(true, "Connected.");
        setGroundPortInfo(formatPortDetails(groundConnectedPort));
        groundTermLog("── connected: " + formatPortDetails(groundConnectedPort) + " ──", "info");
        setGroundMonitorActive(true);
        groundReadLoopPromise = groundReadLoop();
        await requestGroundDeviceInfo();
    } catch (error) {
        groundConnectedPort = null;
        groundTermLog("error: " + (error.message || "Serial port permission denied."), "err");
        setGroundConnectionState(false, error.message || "Serial port permission denied.");
        setGroundPortInfo("not selected");
    }
}

groundConnectButton.addEventListener("click", async () => {
    if (groundConnectedPort) { await groundDisconnectPort(); return; }
    await groundConnectPort();
});

groundReadButton.addEventListener("click", async () => {
    if (!groundConnectedPort) return;
    groundSaveStatus.textContent = "";
    groundReadButton.disabled = true;
    try {
        await requestGroundDeviceInfo();
    } catch (error) {
        groundTermLog("Read error: " + (error.message || "unknown error"), "err");
    } finally {
        groundReadButton.disabled = false;
    }
});

groundSendButton.addEventListener("click", async () => {
    if (!groundConnectedPort) return;
    groundSaveStatus.textContent = "Sending settings...";
    groundSendButton.disabled = true;
    groundReadButton.disabled = true;
    try {
        if (groundId2Input.value !== "") {
            await sendGroundCommandAndWaitForOk(`set gid2 ${parseInt(groundId2Input.value, 10)}`);
        }
        if (groundFreqInput.value !== "") {
            await sendGroundCommandAndWaitForOk(`set gfreq ${parseInt(groundFreqInput.value, 10)}`);
        }
        const p2pKey = groundP2pKeyInput.value.trim().replace(/[^0-9a-f]/gi, "").toUpperCase().slice(0, 64);
        if (p2pKey.length >= 32) {
            await sendGroundCommandAndWaitForOk("p2p encryption 1");
            await sendGroundCommandAndWaitForOk(`set gp2p-key ${p2pKey}`);
        }
        groundSaveStatus.textContent = "Configuration sent successfully.";
        groundTermLog("Configuration sent successfully.", "ok");
    } catch (error) {
        groundSaveStatus.textContent = `Send failed: ${error.message || "unknown error"}`;
        groundTermLog("Send error: " + (error.message || "unknown error"), "err");
    } finally {
        groundSendButton.disabled = false;
        groundReadButton.disabled = false;
    }
});

window.addEventListener("beforeunload", () => {
    if (groundConnectedPort) groundDisconnectPort();
});

setGroundConnectionState(false, "Browser access to the Ground Unit has not been granted.");
setGroundPortInfo("serial permission not granted");
setGroundMonitorActive(false);


// ── Connect-card mirrors ─────────────────────────────────────────────────────
// A device has exactly one real status card (the one app.js talks to). Tabs that
// need the same control render a mirror: the source card's markup is copied in
// with its ids stripped, kept in sync by a MutationObserver, and clicks are
// forwarded to the real button. Avoids duplicate ids and duplicated state logic.
function installStatusMirror(source, mirrorEl) {
    if (!source || !mirrorEl) return;

    const sync = () => {
        mirrorEl.className = `${source.className} status-mirror`;
        mirrorEl.innerHTML = source.innerHTML;
        mirrorEl.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    };

    sync();
    new MutationObserver(sync).observe(source, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
    });

    mirrorEl.addEventListener("click", (event) => {
        if (event.target.closest("button")) {
            source.querySelector("button").click();
        }
    });
}

document.querySelectorAll(".status-mirror").forEach((mirrorEl) => {
    const sourceId = mirrorEl.dataset.mirror === "ground" ? "groundConnectButton" : "connectButton";
    installStatusMirror(document.getElementById(sourceId)?.closest(".status-card"), mirrorEl);
});
