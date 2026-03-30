const noteField = document.getElementById('note');
const tagSuggestions = document.getElementById('tag-suggestions');

// Konfiguracja
const MIN_HEIGHT = 52;
const MAX_HEIGHT = 140;
const BASE_FONT_SIZE = 20;
const MIN_FONT_SIZE = 12;

// --- Tag mappings cache ---
let availableTags = [];

async function loadTags() {
    try {
        const mappings = await window.api.getTagMappings();
        availableTags = mappings.map(m => m.tag);
    } catch (e) {
        availableTags = [];
    }
}

loadTags();
window.addEventListener('focus', loadTags);

// --- Autocomplete state ---
let selectedIndex = -1;
let filteredTags = [];
let suggestionsJustClosed = false;

function getCurrentTagQuery() {
    const text = noteField.value;
    const cursorPos = noteField.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const hashIndex = textBeforeCursor.lastIndexOf('#');
    if (hashIndex === -1) return null;
    // # musi być na początku lub po białym znaku
    if (hashIndex > 0 && !/\s/.test(textBeforeCursor[hashIndex - 1])) return null;
    const partial = textBeforeCursor.substring(hashIndex + 1);
    // Jeśli po # jest spacja — tag jest zakończony
    if (/\s/.test(partial)) return null;
    return { query: partial.toLowerCase(), startIndex: hashIndex, endIndex: cursorPos };
}

function getHashPixelOffset() {
    const query = getCurrentTagQuery();
    if (!query) return 0;

    const textBefore = noteField.value.substring(0, query.startIndex);
    const style = window.getComputedStyle(noteField);

    // Ukryty element lustrzany do pomiaru szerokości tekstu
    const mirror = document.createElement('span');
    mirror.style.font = style.font;
    mirror.style.fontSize = style.fontSize;
    mirror.style.fontFamily = style.fontFamily;
    mirror.style.letterSpacing = style.letterSpacing;
    mirror.style.whiteSpace = 'pre';
    mirror.style.visibility = 'hidden';
    mirror.style.position = 'absolute';
    mirror.textContent = textBefore;

    document.body.appendChild(mirror);
    const textWidth = mirror.offsetWidth;
    document.body.removeChild(mirror);

    // Pozycja = drag handle + textarea padding-left + szerokość tekstu
    const dragHandle = document.getElementById('drag-handle');
    const dragWidth = dragHandle ? dragHandle.offsetWidth : 0;
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const left = dragWidth + paddingLeft + textWidth;

    // Nie wychodź za prawą krawędź okna
    const maxLeft = window.innerWidth - 160;
    return Math.max(0, Math.min(left, maxLeft));
}

function showSuggestions(tags) {
    filteredTags = tags;
    selectedIndex = 0;
    tagSuggestions.innerHTML = '';
    tags.forEach((tag, i) => {
        const item = document.createElement('div');
        item.className = 'tag-item' + (i === 0 ? ' active' : '');
        item.textContent = '#' + tag;
        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            selectTag(tag);
        });
        tagSuggestions.appendChild(item);
    });
    tagSuggestions.style.marginLeft = getHashPixelOffset() + 'px';
    tagSuggestions.classList.add('visible');
    updateWindowSize();
}

function hideSuggestions() {
    if (!isSuggestionsVisible()) return;
    tagSuggestions.classList.remove('visible');
    tagSuggestions.innerHTML = '';
    filteredTags = [];
    selectedIndex = -1;
    updateWindowSize();
}

function isSuggestionsVisible() {
    return tagSuggestions.classList.contains('visible');
}

function moveSelection(delta) {
    if (filteredTags.length === 0) return;
    const items = tagSuggestions.querySelectorAll('.tag-item');
    if (items[selectedIndex]) items[selectedIndex].classList.remove('active');
    selectedIndex = (selectedIndex + delta + filteredTags.length) % filteredTags.length;
    if (items[selectedIndex]) {
        items[selectedIndex].classList.add('active');
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
}

function selectTag(tag) {
    const query = getCurrentTagQuery();
    if (!query) { hideSuggestions(); return; }
    const text = noteField.value;
    const before = text.substring(0, query.startIndex);
    const after = text.substring(query.endIndex);
    noteField.value = before + '#' + tag + ' ' + after;
    const newPos = query.startIndex + tag.length + 2;
    noteField.selectionStart = newPos;
    noteField.selectionEnd = newPos;
    hideSuggestions();
    noteField.focus();
}

function updateSuggestions() {
    if (availableTags.length === 0) { hideSuggestions(); return; }
    const query = getCurrentTagQuery();
    if (!query) { hideSuggestions(); return; }
    const matches = availableTags.filter(t =>
        t.toLowerCase().startsWith(query.query)
    );
    if (matches.length === 0) { hideSuggestions(); return; }
    showSuggestions(matches);
}

// --- Rozmiar okna ---
function updateWindowSize() {
    requestAnimationFrame(() => {
        const totalHeight = Math.max(MIN_HEIGHT, document.body.scrollHeight);
        if (window.api && window.api.resizeWindow) {
            window.api.resizeWindow(totalHeight);
        }
    });
}

// --- Auto-resize textarea ---
function autoResize() {
    noteField.style.fontSize = BASE_FONT_SIZE + 'px';
    noteField.style.height = 'auto';

    let scrollHeight = noteField.scrollHeight;
    let fontSize = BASE_FONT_SIZE;

    if (scrollHeight > MAX_HEIGHT) {
        while (scrollHeight > MAX_HEIGHT && fontSize > MIN_FONT_SIZE) {
            fontSize -= 1;
            noteField.style.fontSize = fontSize + 'px';
            noteField.style.height = 'auto';
            scrollHeight = noteField.scrollHeight;
        }
    }

    const newHeight = Math.min(scrollHeight, MAX_HEIGHT);
    noteField.style.height = newHeight + 'px';
    updateWindowSize();
}

// --- Event listeners ---

noteField.addEventListener('input', () => {
    autoResize();
    updateSuggestions();
});

noteField.addEventListener('keydown', async (e) => {
    // Obsługa klawiatury gdy dropdown jest widoczny
    if (isSuggestionsVisible()) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            moveSelection(1);
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            moveSelection(-1);
            return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < filteredTags.length) {
                selectTag(filteredTags[selectedIndex]);
            }
            return;
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            hideSuggestions();
            suggestionsJustClosed = true;
            return;
        }
    }

    // Enter bez Shift — zapisz notatkę
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const content = noteField.value.trim();
        if (content) {
            await window.api.createNote(content).then(() => {
                noteField.value = '';
                autoResize();
                return window.api.hideWindow();
            });
        }
    }
});

document.body.addEventListener('dblclick', async () => {
    await window.api.centerWindow();
});

document.body.addEventListener('keyup', async (e) => {
    if (e.key === 'Escape') {
        if (suggestionsJustClosed) {
            suggestionsJustClosed = false;
            return;
        }
        if (noteField.value.length > 0) {
            noteField.value = '';
            autoResize();
        } else {
            await window.api.hideWindow();
        }
    }
});

document.getElementById('settings').addEventListener('click', async () => {
    await window.api.showSettings();
});

setTimeout(() => {
    autoResize();
}, 100);

