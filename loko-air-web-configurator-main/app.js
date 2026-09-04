const frequencyRange = document.getElementById("frequencyRange");
const powerRange = document.getElementById("powerRange");
const frequencyValue = document.getElementById("frequencyValue");
const powerValue = document.getElementById("powerValue");
const configTabs = [...document.querySelectorAll(".settings-card .tab")];
const configPanels = [...document.querySelectorAll(".settings-card .panel")];
const mainTabs = [...document.querySelectorAll(".main-tab")];
const mainPanels = [...document.querySelectorAll(".main-panel")];
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

    syncModeTabsAvailability();
    syncP2pEncryptionKeyUi();
}

function handleP2pEncryptionKeyInput() {
    const sanitized = sanitizeP2pEncryptionKey(p2pEncryptionKeyInput.value);
    if (sanitized !== p2pEncryptionKeyInput.value) {
        p2pEncryptionKeyInput.value = sanitized;
    }

    p2pEncryptionKey = sanitized;
    syncP2pEncryptionKeyUi();
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
        app_eui: null
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

function showGnssTraceMapMessage(message) {
    if (!gnssTraceMapContainer) {
        return;
    }

    const note = document.createElement("p");
    note.className = "gnss-trace-map-message";
    note.textContent = message;
    gnssTraceMapContainer.replaceChildren(note);
}

function ensureGnssTraceMap() {
    if (gnssTraceMap || !gnssTraceMapContainer) {
        return;
    }

    if (typeof window.L === "undefined") {
        showGnssTraceMapMessage("The map library could not be loaded, so the trace map is unavailable. The trace table below still lists every recorded fix.");
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
    gnssTraceMap.setView([54.6853, 25.2821], 14);
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

    if (differsFromConfig("lorawan_region", region, normalizeConfigString)) {
        commands.push(`set region ${region}`);
        updatedConfigFields.lorawan_region = region;
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

    if (differsFromConfig("is_lorawan_mode", lorawanMode)) {
        commands.push(`enable lorawan mode ${lorawanMode}`);
        updatedConfigFields.is_lorawan_mode = lorawanMode;
    }

    const p2pKey = p2pEncryptionKeyInput.value.trim();
    if (p2pKey) {
        commands.push(`set p2p-key ${p2pKey}`);
    }

    if (modeToggle.checked) {
        const devEui = devEuiInput.value.trim().toUpperCase();
        const appEui = appEuiInput.value.trim().toUpperCase();
        const appKey = appKeyInput.value.trim();

        if (devEui && differsFromConfig("dev_eui", devEui, normalizeConfigString)) {
            commands.push(`set dev-eui ${devEui}`);
            updatedConfigFields.dev_eui = devEui;
        }

        if (appEui && differsFromConfig("app_eui", appEui, normalizeConfigString)) {
            commands.push(`set app-eui ${appEui}`);
            updatedConfigFields.app_eui = appEui;
        }

        if (appKey) {
            commands.push(`set app-key ${appKey}`);
        }
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

async function sendSerialCommandAndWaitForOk(command, timeoutMs = 2000, lineEnding = "\r", onLine = null, trimResponseBuffer = true) {
    if (!connectedPort || !connectedPort.writable || !reader) {
        throw new Error("Serial connection is not ready.");
    }

    // await drainSerialInput();

    const writer = connectedPort.writable.getWriter();

    try {
        debugSerial("[serial write]", command);
        await writer.write(encoder.encode(`${command}${lineEnding}`));
    } finally {
        writer.releaseLock();
    }

    let pendingLine = "";
    let responseBuffer = "";
    const deadline = Date.now() + timeoutMs;

    while (connectedPort && Date.now() < deadline) {
        const remainingMs = deadline - Date.now();
        const readResult = await Promise.race([
            reader.read(),
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

                if (trimmedLine === "OK") {
                    return responseBuffer;
                }
            }
        }

        if (done) {
            break;
        }
    }

    throw new Error(`Did not receive OK after: ${command}`);
}

async function requestDeviceInfo() {
    if (!connectedPort || !connectedPort.writable || !reader) {
        setConnectionState(true, "Connected. Device info stream unavailable.");
        return;
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
        const timeoutId = setTimeout(async () => {
            timedOut = true;
            await disconnectPort();
            window.alert("No response... Possibly selected port is not a Loko-AIR device port.");
        }, 1000);

        while (connectedPort && !timedOut) {
            const { value, done } = await reader.read();
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

        if (timedOut || !connectedPort) {
            return;
        }

        const statusText = resolveDeviceInfoStatus(deviceInfoState.buffer);
        if (statusText) {
            setConnectionState(true, statusText);
            return;
        }

        setConnectionState(true, "Connected, but Loko version was not received.");
    } catch (error) {
        if (!connectedPort) {
            return;
        }

        setConnectionState(true, `Connected, info read failed: ${error.message || "unknown error"}`);
    }
}

async function disconnectPort() {
    if (reader) {
        await reader.cancel().catch(() => { });
        reader.releaseLock();
        reader = null;
    }

    if (connectedPort) {
        await connectedPort.close().catch(() => { });
        connectedPort = null;
    }

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
            reader = connectedPort.readable.getReader();
        }

        setConnectionState(true, "Connected.");
        setPortInfo(formatPortDetails(connectedPort));
        await requestDeviceInfo();
    } catch (error) {
        connectedPort = null;
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
    devEuiInput.value = "";
    appEuiInput.value = "";
    appKeyInput.value = "";
    modeToggle.checked = false;
    syncModeToggle();
    syncOutputs();
    syncP2pEncryptionKeyUi();
    saveStatus.textContent = "Defaults restored.";
}

frequencyRange.addEventListener("input", syncOutputs);
powerRange.addEventListener("input", syncOutputs);
wakeUpPeriodInput.addEventListener("input", updateTimingSummary);
wakeUpPeriodInput.addEventListener("change", () => {
    getWakeUpPeriodSeconds();
    syncOutputs();
});
wakeUpPeriodUnitSelect.addEventListener("change", () => {
    handleWakeUpPeriodUnitChange();
    syncOutputs();
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

    const { commands, updatedConfigFields } = buildSaveCommands();
    if (commands.length === 0) {
        saveStatus.textContent = "No changes detected. Nothing to save.";
        return;
    }

    saveButton.disabled = true;
    saveStatus.textContent = "Sending settings to device...";

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
    } catch (error) {
        saveStatus.textContent = `Save failed: ${error.message || "unknown error"}`;
    } finally {
        saveButton.disabled = false;
    }

    await requestDeviceInfo();
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
    await requestDeviceInfo();
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
syncWakeUpPeriodConstraints();
activateMainTab("configuration");
setConnectionState(false, "Browser access to the serial device has not been granted.");
setPortInfo("serial permission not granted");
resetGnssTraceProgress();
syncGnssTraceExportButtonState();
