# Quick Note

> Minimalistyczna aplikacja do szybkiego zapisywania notatek z globalnym skrótem klawiszowym

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![Electron](https://img.shields.io/badge/Electron-33.4.0-47848F.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Funkcje

- 🚀 **Globalny skrót klawiszowy** - Szybki dostęp z dowolnego miejsca (domyślnie: `Alt+Shift+Space`)
- 📝 **Minimalistyczny interfejs** - Jedno pole tekstowe, zero rozpraszaczy
- 💾 **Automatyczny zapis** - Notatki zapisują się do pliku po naciśnięciu Enter
- ⚙️ **Konfigurowalne** - Własny format notatek, ścieżka do pliku, skrót klawiszowy
- 🎨 **Przezroczyste okno** - Nie zasłania treści poniżej
- 🔒 **Bezpieczne** - Context isolation, brak Node integration w renderer

## 📦 Instalacja

### Z kodu źródłowego

```bash
# Klonowanie repozytorium
git clone <repository-url>
cd quick-note

# Instalacja zależności
npm install

# Uruchomienie
npm start
```

### Build

```bash
# Kompilacja aplikacji
npm run pack

# Aplikacja zostanie utworzona w folderze build/
```

## 🎮 Użycie

1. **Wywołanie okna**: Naciśnij `Alt+Shift+Space` (lub własny skrót)
2. **Zapisanie notatki**: Wpisz tekst i naciśnij `Enter`
3. **Anulowanie**: Naciśnij `Esc` (lub `Esc` dwa razy jeśli jest tekst)
4. **Ustawienia**: Kliknij ikonę 🛠 w prawym górnym rogu
5. **Przesuwanie okna**: Przeciągnij okno za dowolne miejsce (podwójne kliknięcie centruje)

## ⚙️ Konfiguracja

### Ustawienia dostępne w aplikacji:

- **Notes File** - Ścieżka do pliku, gdzie zapisują się notatki
- **Global Shortcut** - Własny skrót klawiszowy
- **Note Format** - Format zapisu notatki z placeholders:
  - `{{date}}` - data i czas
  - `{{note}}` - treść notatki
  - `{{newLine}}` - nowa linia

### Domyślny format:
```
- **{{date}}**: {{note}}{{newLine}}
```

### Przykładowy wynik:
```markdown
- **09.02.26, 11:30**: Kupić mleko
- **09.02.26, 14:15**: Zadzwonić do klienta
```

## 🛠️ Rozwój

### Tryb developerski

```bash
# Uruchomienie z DevTools
npm run start:debug
```

### Dokumentacja

- [CHANGELOG.md](./CHANGELOG.md) - Historia zmian i aktualizacji
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Przewodnik deweloperski, architektura, pomysły na rozwój

### Technologie

- **Electron 33.4.0** (LTS)
- **electron-store 8.2.0** - Zarządzanie konfiguracją
- **electron-packager 17.1.2** - Budowanie aplikacji

## 📋 Wymagania systemowe

- macOS 10.13 (High Sierra) lub nowszy
- 100 MB wolnego miejsca na dysku
- Uprawnienia do rejestrowania globalnych skrótów klawiszowych

## 🔄 Ostatnia aktualizacja

**Data**: 9 lutego 2026

Projekt został niedawno zaktualizowany:
- ⬆️ Electron z 22.1.0 → 33.4.0 (LTS)
- 🔒 Ulepszone security patterns
- 🐛 Naprawione błędy z IPC handlers i przyciskiem ustawień
- ✅ Zgodność z najnowszymi best practices Electron

Zobacz [CHANGELOG.md](./CHANGELOG.md) dla pełnej listy zmian.

## 🤝 Wkład w projekt

Pull requesty mile widziane! Przed dużymi zmianami, proszę najpierw otworzyć issue aby przedyskutować zmiany.

Pomysły na nowe funkcjonalności znajdziesz w [DEVELOPMENT.md](./DEVELOPMENT.md).

## 📄 Licencja

MIT License - Zobacz [LICENSE.md](./LICENSE.md) dla szczegółów.

## 🙏 Autor

Wojtek Zieliński

---

**Wskazówka**: Jeśli masz pomysły na nowe funkcjonalności, zajrzyj do [DEVELOPMENT.md](./DEVELOPMENT.md) gdzie znajdziesz ponad 20 pomysłów na rozwój aplikacji!
