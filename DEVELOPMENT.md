# Quick Note - Przewodnik deweloperski

## 🏗️ Architektura aplikacji

### Główne komponenty

1. **index.js** - Główny proces Electron
   - Zarządza oknami (main window, settings window)
   - Rejestruje globalny skrót klawiszowy
   - Obsługuje IPC communication
   - Zarządza electron-store (konfiguracja)

2. **renderer.js** - Proces renderera dla głównego okna
   - Obsługa wprowadzania notatek
   - Interakcja z użytkownikiem (Enter, Escape, podwójne kliknięcie)

3. **settings.js** - Proces renderera dla okna ustawień
   - Formularz konfiguracji
   - Zapisywanie ustawień

4. **preload.js** - Preload script dla głównego okna
   - Bezpieczne API między main a renderer
   - Context isolation

5. **settings-preload.js** - Preload script dla okna ustawień
   - API dla ustawień
   - Pobieranie konfiguracji przez IPC

### Przepływ danych

```
User Input → Renderer Process → IPC → Main Process → electron-store
                                                    → File System (notes)
```

## 🚀 Uruchamianie

```bash
# Normalne uruchomienie
npm start

# Uruchomienie z DevTools (tryb debug)
npm run start:debug

# Build aplikacji
npm run pack
```

## 🔧 Konfiguracja

Konfiguracja przechowywana w `electron-store`:
- `NOTES_FILE` - ścieżka do pliku z notatkami
- `GLOBAL_FOCUS_SHORTCUT` - skrót klawiszowy (domyślnie: Alt+Shift+Space)
- `NOTE_FORMAT` - format zapisu notatki (używa placeholders: {{date}}, {{note}}, {{newLine}})

## 📝 Pomysły na nowe funkcjonalności

### Proste do implementacji:
1. **Historia notatek** - wyświetlanie ostatnich notatek w oknie głównym
2. **Kategorie/tagi** - możliwość oznaczania notatek tagami
3. **Szablony** - predefiniowane formaty notatek
4. **Różne pliki docelowe** - możliwość wyboru pliku na podstawie tagu/kategorii
5. **Dark mode** - przełącznik jasny/ciemny motyw
6. **Różne rozmiary okna** - mały/średni/duży
7. **Skróty formatowania** - markdown shortcuts (**, __, -, etc.)
8. **Statystyki** - licznik notatek, słów, etc.

### Średnio zaawansowane:
1. **Wyszukiwanie** - szybkie wyszukiwanie w notatkach
2. **Synchronizacja** - Dropbox/Google Drive/iCloud
3. **Eksport** - PDF, HTML, Markdown
4. **Przypomnienia** - notatki z przypomnieniami
5. **Snippety** - często używane frazy
6. **Multi-język** - internacjonalizacja

### Zaawansowane:
1. **Plugin system** - rozszerzenia napisane przez użytkowników
2. **AI integration** - sugestie, podsumowania, auto-kategoryzacja
3. **Collaboration** - współdzielenie notatek
4. **Mobile companion** - aplikacja mobilna
5. **Web clipper** - browser extension do zapisywania z przeglądarki

## 🔒 Security Best Practices

✅ **Już zaimplementowane:**
- Context isolation włączone
- Node integration wyłączone w renderer
- Preload scripts używają tylko contextBridge
- Store w głównym procesie (nie w preload)

⚠️ **Do rozważenia przy dalszym rozwoju:**
- Content Security Policy - już jest podstawowe, ale można rozszerzyć
- Walidacja input - dodać sanityzację danych od użytkownika
- Code signing - przy dystrybucji
- Auto-update - mechanizm bezpiecznej aktualizacji

## 📦 Build system

### @electron/packager (obecnie używane)

Projekt używa `@electron/packager` do budowania aplikacji:

```bash
npm install --save-dev @electron/packager
```

W package.json:
```json
"pack": "npx @electron/packager . --icon=..."
```

### electron-builder (alternatywa)
```bash
npm install --save-dev electron-builder
```

Zalety:
- Auto-update (electron-updater)
- Tworzenie instalatorów (DMG, NSIS, AppImage, etc.)
- Code signing
- Lepsze kompresja
- Więcej opcji konfiguracyjnych

Przykładowa konfiguracja w package.json:
```json
{
  "build": {
    "appId": "com.quicknote.app",
    "mac": {
      "category": "public.app-category.productivity",
      "icon": "assets/icons/mac/quick-note.icns"
    },
    "dmg": {
      "contents": [
        {
          "x": 110,
          "y": 150
        },
        {
          "x": 240,
          "y": 150,
          "type": "link",
          "path": "/Applications"
        }
      ]
    }
  }
}
```

## 🚢 Publikacja nowej wersji

> **🤖 Sekcja dla AI agenta:** Gdy użytkownik mówi "opublikuj nową wersję", "release", "zbuduj i zainstaluj" itp., wykonaj poniższe kroki automatycznie, w podanej kolejności.

### Kroki

1. **Zamknij wszystkie instancje Quick Note**
   ```bash
   pkill -f "Quick Note" 2>/dev/null; pkill -f "electron" 2>/dev/null
   ```

2. **Commituj zmiany i wypchnij na remote**
   ```bash
   git add -A
   git commit -m "opis zmian"
   git push
   ```

3. **Zbuduj paczkę**
   ```bash
   npm run pack
   ```
   Wynik: `build/Quick Note-darwin-arm64/Quick Note.app`

4. **Zainstaluj w /Applications (podmień istniejącą wersję)**
   ```bash
   sudo rm -rf "/Applications/Quick Note.app"
   sudo cp -R "./build/Quick Note-darwin-arm64/Quick Note.app" "/Applications/Quick Note.app"
   ```

### Skrót: `npm run release`

Cały proces (build + instalacja) jest dostępny jako jeden skrypt:
```bash
npm run release
```
> **Uwaga:** Skrypt wymaga `sudo` — poprosi o hasło przy kopiowaniu do `/Applications`.
> Git commit i push trzeba wykonać osobno przed uruchomieniem tego skryptu.

## 🧪 Testowanie

Jest jest już w devDependencies, ale brak testów. Przykładowa struktura:

```
tests/
  ├── unit/
  │   ├── store.test.js
  │   └── formatting.test.js
  └── e2e/
      ├── main-window.test.js
      └── settings.test.js
```

Przydatne biblioteki:
- **spectron** - E2E testing dla Electron (deprecated, ale działa)
- **playwright** - nowoczesna alternatywa
- **@testing-library/electron** - testing utilities

## 🎨 UI/UX Improvements

Możliwe ulepszenia:
1. Animacje (fade in/out)
2. Lepsze ikony (zamiast emoji)
3. Tooltips dla przycisków
4. Keyboard shortcuts cheatsheet
5. Onboarding dla nowych użytkowników
6. Customizowalne kolory/theme
7. Przeciąganie okna za całą powierzchnię (obecnie działa)

## 📚 Przydatne zasoby

- [Electron Documentation](https://www.electronjs.org/docs/latest/)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [electron-store Documentation](https://github.com/sindresorhus/electron-store)
- [Awesome Electron](https://github.com/sindresorhus/awesome-electron)

## 🐛 Znane ograniczenia

1. Brak walidacji ścieżki do pliku notatek - może crashować przy nieprawidłowej ścieżce
2. Brak obsługi błędów przy zapisie do pliku (pełen dysk, brak uprawnień)
3. Globalny shortcut może konflikować z innymi aplikacjami
4. Brak backupu notatek
5. Format notatki nie jest walidowany przy zapisie

## 🔄 Migration to ESM (opcjonalne)

Jeśli chcesz w przyszłości migrować na ESM:

1. Dodaj do package.json: `"type": "module"`
2. Zmień `require()` na `import`
3. Zmień `module.exports` na `export`
4. Zaktualizuj electron-store na 10.x
5. Użyj `import.meta.url` zamiast `__dirname`

Przykład:
```javascript
import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```
