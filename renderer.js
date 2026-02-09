const noteField = document.getElementById('note');

// Konfiguracja
const MIN_HEIGHT = 52; // Wysokość dla 1 linii (20px + 2*16px padding)
const MAX_HEIGHT = 140; // Wysokość dla ~5 linii
const BASE_FONT_SIZE = 20;
const MIN_FONT_SIZE = 12; // Minimalna czcionka gdy tekst jest bardzo długi

// Funkcja do auto-resize textarea i okna
function autoResize() {
    // Reset do normalnych wartości
    noteField.style.fontSize = BASE_FONT_SIZE + 'px';
    noteField.style.height = 'auto';

    let scrollHeight = noteField.scrollHeight;
    let fontSize = BASE_FONT_SIZE;

    // Jeśli tekst wymaga więcej niż MAX_HEIGHT, zmniejsz czcionkę
    if (scrollHeight > MAX_HEIGHT) {
        console.log('Text overflow - reducing font size. scrollHeight:', scrollHeight, 'MAX_HEIGHT:', MAX_HEIGHT);

        // Iteracyjnie zmniejszaj czcionkę aż tekst się zmieści
        while (scrollHeight > MAX_HEIGHT && fontSize > MIN_FONT_SIZE) {
            fontSize -= 1;
            noteField.style.fontSize = fontSize + 'px';
            noteField.style.height = 'auto';
            scrollHeight = noteField.scrollHeight;
        }

        console.log('Final font size:', fontSize);
    }

    // Ustaw finalną wysokość (ograniczoną do MAX_HEIGHT)
    const newHeight = Math.min(scrollHeight, MAX_HEIGHT);
    noteField.style.height = newHeight + 'px';

    // Resize okna aplikacji
    const windowHeight = Math.max(MIN_HEIGHT, newHeight);

    // Wywołaj resize tylko jeśli API jest dostępne
    if (window.api && window.api.resizeWindow) {
        window.api.resizeWindow(windowHeight);
    }
}

// Auto-resize podczas pisania
noteField.addEventListener('input', autoResize);

// Opóźnione pierwsze wywołanie aby mainWindow było gotowe
setTimeout(() => {
    autoResize();
}, 100);

noteField.addEventListener('keyup', async (e) => {
    console.log(e.key);
    if (e.key === 'Enter' && !e.shiftKey) {
        // Enter bez Shift - zapisz notatkę
        e.preventDefault();
        const content = noteField.value.trim();
        if (content) {
            await window.api.createNote(content).then(() => {
                noteField.value = '';
                autoResize(); // Reset rozmiaru
                return window.api.hideWindow();
            });
        }
    }
    // Shift+Enter - nowa linia (domyślne zachowanie textarea)
});

document.body.addEventListener('dblclick', async () => {
    await window.api.centerWindow();
});

document.body.addEventListener('keyup', async (e) => {
    if (e.key === 'Escape') {
        if (noteField.value.length > 0) {
            noteField.value = '';
            autoResize(); // Reset rozmiaru okna po wyczyszczeniu
        } else {
            await window.api.hideWindow();
        }
    }
});

document.getElementById('settings').addEventListener('click', async () => {
    await window.api.showSettings();
});
