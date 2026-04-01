// --- Ładowanie ustawień ---
let isDialogOpen = false;

async function loadSettings() {
    if (isDialogOpen) return;

    const settings = await window.api.getSettings();
    document.getElementById("DEFAULT_NOTES_FILE").value = settings.DEFAULT_NOTES_FILE || '';
    document.getElementById("GLOBAL_FOCUS_SHORTCUT").value = settings.GLOBAL_FOCUS_SHORTCUT || '';
    document.getElementById("NOTE_FORMAT").value = settings.NOTE_FORMAT || '';

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

    const fileInput = document.createElement('input');
    fileInput.type = 'text';
    fileInput.className = 'file-input';
    fileInput.placeholder = '/path/to/file.md';
    fileInput.value = file;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-mapping';
    removeBtn.textContent = '🗑';
    removeBtn.title = 'Remove mapping';
    removeBtn.addEventListener('click', () => {
        row.remove();
        showEmptyIfNeeded();
    });

    const browseBtn = document.createElement('button');
    browseBtn.type = 'button';
    browseBtn.className = 'browse-btn';
    browseBtn.textContent = '📂';
    browseBtn.title = 'Browse…';
    browseBtn.addEventListener('click', async () => {
        isDialogOpen = true;
        try {
            const filePath = await window.api.selectFile();
            if (filePath) fileInput.value = filePath;
        } finally {
            isDialogOpen = false;
        }
    });

    row.appendChild(tagInput);
    row.appendChild(fileInput);
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
        const file = row.querySelector('.file-input').value.trim();
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
        if (filePath) document.getElementById('DEFAULT_NOTES_FILE').value = filePath;
    } finally {
        isDialogOpen = false;
    }
});

document.getElementById('save').addEventListener('click', async () => {
    const DEFAULT_NOTES_FILE = document.getElementById("DEFAULT_NOTES_FILE").value;
    const GLOBAL_FOCUS_SHORTCUT = document.getElementById("GLOBAL_FOCUS_SHORTCUT").value;
    const NOTE_FORMAT = document.getElementById("NOTE_FORMAT").value;
    const TAG_FILE_MAPPINGS = collectMappings();

    const configuration = { DEFAULT_NOTES_FILE, TAG_FILE_MAPPINGS, GLOBAL_FOCUS_SHORTCUT, NOTE_FORMAT };
    await window.api.saveSettings(configuration).then(() => window.api.hideSettings());
});

document.getElementById('cancel').addEventListener('click', async () => {
    await window.api.hideSettings();
});

document.body.addEventListener('keyup', async (e) => {
    if (e.key === 'Escape') {
        await window.api.hideSettings();
    }
});

