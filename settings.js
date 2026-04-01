// --- Tabs ---
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
});

// --- Auto-save with debounce ---
let saveTimeout = null;
function scheduleAutoSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveSettings, 400);
}

function saveSettings() {
    const DEFAULT_NOTES_FILE = document.getElementById("DEFAULT_NOTES_FILE").value;
    const GLOBAL_FOCUS_SHORTCUT = document.getElementById("GLOBAL_FOCUS_SHORTCUT").value;
    const NOTE_FORMAT = document.getElementById("NOTE_FORMAT").value;
    const TAG_FILE_MAPPINGS = collectMappings();
    const configuration = { DEFAULT_NOTES_FILE, TAG_FILE_MAPPINGS, GLOBAL_FOCUS_SHORTCUT, NOTE_FORMAT };
    window.api.saveSettings(configuration);
}

// --- Truncated path display ---
function setPathDisplay(displayEl, fullPath) {
    displayEl.innerHTML = '';
    if (fullPath) {
        const sep = fullPath.includes('/') ? '/' : '\\';
        const lastSep = fullPath.lastIndexOf(sep);
        const dir = lastSep >= 0 ? fullPath.substring(0, lastSep + 1) : '';
        const fileName = lastSep >= 0 ? fullPath.substring(lastSep + 1) : fullPath;

        const dirSpan = document.createElement('span');
        dirSpan.className = 'file-path-dir';
        dirSpan.textContent = dir;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'file-path-name';
        nameSpan.textContent = fileName;

        displayEl.appendChild(dirSpan);
        displayEl.appendChild(nameSpan);
        displayEl.title = fullPath;
        displayEl.classList.remove('empty');
    } else {
        displayEl.textContent = 'No file selected';
        displayEl.title = '';
        displayEl.classList.add('empty');
    }
}

// --- Ładowanie ustawień ---
let isDialogOpen = false;

async function loadSettings() {
    if (isDialogOpen) return;

    const settings = await window.api.getSettings();
    document.getElementById("GLOBAL_FOCUS_SHORTCUT").value = settings.GLOBAL_FOCUS_SHORTCUT || '';
    document.getElementById("NOTE_FORMAT").value = settings.NOTE_FORMAT || '';

    // Default file
    const defaultFile = settings.DEFAULT_NOTES_FILE || '';
    document.getElementById("DEFAULT_NOTES_FILE").value = defaultFile;
    setPathDisplay(document.getElementById('default-file-display'), defaultFile);

    // Wyczyść istniejące wiersze mapowań i załaduj z ustawień
    clearMappingRows();
    const mappings = settings.TAG_FILE_MAPPINGS || [];
    if (mappings.length > 0) {
        mappings.forEach(m => addMappingRow(m.tag, m.file));
    } else {
        showEmptyIfNeeded();
    }
}

function clearMappingRows() {
    document.getElementById('tag-mappings-list').innerHTML = '';
}

// Załaduj ustawienia na start
loadSettings();

// Przeładuj ustawienia gdy okno dostaje focus (po ponownym otwarciu)
window.addEventListener('focus', loadSettings);

// Auto-save on text input changes
document.getElementById('NOTE_FORMAT').addEventListener('input', scheduleAutoSave);
document.getElementById('GLOBAL_FOCUS_SHORTCUT').addEventListener('input', scheduleAutoSave);

// --- Tag mappings management ---
function addMappingRow(tag = '', file = '') {
    const list = document.getElementById('tag-mappings-list');

    // Usuń placeholder "empty" jeśli istnieje
    const empty = list.querySelector('.empty-mappings');
    if (empty) empty.remove();

    const row = document.createElement('div');
    row.className = 'tag-row';

    const tagInput = document.createElement('input');
    tagInput.type = 'text';
    tagInput.className = 'tag-input';
    tagInput.placeholder = '#tag';
    tagInput.value = tag.startsWith('#') ? tag : (tag ? '#' + tag : '');
    tagInput.addEventListener('input', scheduleAutoSave);

    // Hidden input stores full path
    const fileHidden = document.createElement('input');
    fileHidden.type = 'hidden';
    fileHidden.className = 'file-value';
    fileHidden.value = file;

    // Display element for truncated path
    const fileDisplay = document.createElement('span');
    fileDisplay.className = 'file-path-display' + (file ? '' : ' empty');
    setPathDisplay(fileDisplay, file);

    const browseBtn = document.createElement('button');
    browseBtn.type = 'button';
    browseBtn.className = 'icon-btn';
    browseBtn.textContent = '📂';
    browseBtn.title = 'Browse…';
    browseBtn.addEventListener('click', async () => {
        isDialogOpen = true;
        try {
            const filePath = await window.api.selectFile();
            if (filePath) {
                fileHidden.value = filePath;
                setPathDisplay(fileDisplay, filePath);
                scheduleAutoSave();
            }
        } finally {
            isDialogOpen = false;
        }
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'icon-btn remove';
    removeBtn.textContent = '🗑';
    removeBtn.title = 'Remove mapping';
    removeBtn.addEventListener('click', () => {
        row.remove();
        showEmptyIfNeeded();
        scheduleAutoSave();
    });

    row.appendChild(tagInput);
    row.appendChild(fileHidden);
    row.appendChild(fileDisplay);
    row.appendChild(browseBtn);
    row.appendChild(removeBtn);
    list.appendChild(row);
}

function showEmptyIfNeeded() {
    const list = document.getElementById('tag-mappings-list');
    if (list.querySelectorAll('.tag-row').length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-mappings';
        empty.textContent = 'No tag mappings yet. Click "+ Add" to create one.';
        list.appendChild(empty);
    }
}

function collectMappings() {
    const rows = document.querySelectorAll('.tag-row');
    const mappings = [];
    rows.forEach(row => {
        let tag = row.querySelector('.tag-input').value.trim();
        const file = row.querySelector('.file-value').value.trim();
        if (tag.startsWith('#')) tag = tag.substring(1);
        if (tag && file) {
            mappings.push({ tag, file });
        }
    });
    return mappings;
}

// --- Przyciski ---
document.getElementById('add-mapping').addEventListener('click', () => {
    addMappingRow();
});

document.getElementById('browse-default').addEventListener('click', async () => {
    isDialogOpen = true;
    try {
        const filePath = await window.api.selectFile();
        if (filePath) {
            document.getElementById('DEFAULT_NOTES_FILE').value = filePath;
            setPathDisplay(document.getElementById('default-file-display'), filePath);
            scheduleAutoSave();
        }
    } finally {
        isDialogOpen = false;
    }
});

document.body.addEventListener('keyup', async (e) => {
    if (e.key === 'Escape') {
        await window.api.hideSettings();
    }
});
