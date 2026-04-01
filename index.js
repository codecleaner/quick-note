const { app, globalShortcut, BrowserWindow, ipcMain, dialog } = require('electron');
const configuration = require('./configuration.json');
const fs = require('fs');
const path = require('path');
const Store = require('electron-store');

const DEBUG_MODE = process.env.DEBUG;

const store = new Store({ defaults: configuration });

// Migracja: stary klucz NOTES_FILE → DEFAULT_NOTES_FILE
if (store.has('NOTES_FILE')) {
  const oldFile = store.get('NOTES_FILE');
  if (!store.get('DEFAULT_NOTES_FILE') && oldFile) {
    store.set('DEFAULT_NOTES_FILE', oldFile);
  }
  store.delete('NOTES_FILE');
}
if (!store.has('TAG_FILE_MAPPINGS')) {
  store.set('TAG_FILE_MAPPINGS', []);
}

const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: DEBUG_MODE ? 300 : 52,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    closable: false,
    center: true,
    fullscreenable: false,
    show: false,
    transparent: true,
    opacity: 0.95,
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    }
  });
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  return mainWindow.loadFile('index.html').then(() => {
    DEBUG_MODE && mainWindow.webContents.openDevTools();
    return mainWindow;
  });
};

const createSettingsWindow = (mainWindow) => {
  const settingsWindow = new BrowserWindow({
    show: false,
    width: 540,
    height: 460,
    minHeight: 300,
    minWidth: 400,
    title: 'Quick Note Settings',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 14, y: 14 },
    resizable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'settings-preload.js')
    }
  });
  settingsWindow.on('close', (e) => {
    e.preventDefault();
    settingsWindow.hide();
    mainWindow.setAlwaysOnTop(true);
  });
  return settingsWindow.loadFile('settings.html').then(() => {
    DEBUG_MODE && settingsWindow.webContents.openDevTools();
    return settingsWindow;
  });
};

const registerGlobalFocusShortcut = mainWindow => {
  const GLOBAL_FOCUS_SHORTCUT = store.get('GLOBAL_FOCUS_SHORTCUT');
  const ret = globalShortcut.register(GLOBAL_FOCUS_SHORTCUT, () => {
    console.log(GLOBAL_FOCUS_SHORTCUT + ' is pressed')
    mainWindow.show();
    mainWindow.focus();
  });

  console.log(`Global focus shortcut (${GLOBAL_FOCUS_SHORTCUT}) registration ${ret && globalShortcut.isRegistered(GLOBAL_FOCUS_SHORTCUT) ? 'succeeded.' : 'failed!'}`);
};

app.whenReady().then(async () => {
  // Deklaracja zmiennych dla okien (będą dostępne w handlerach)
  let mainWindow, settingsWindow;

  // Rejestracja IPC handlerów przed utworzeniem okien
  ipcMain.handle('get-settings', () => {
    console.log('get-settings');
    return {
      DEFAULT_NOTES_FILE: store.get('DEFAULT_NOTES_FILE'),
      TAG_FILE_MAPPINGS: store.get('TAG_FILE_MAPPINGS'),
      GLOBAL_FOCUS_SHORTCUT: store.get('GLOBAL_FOCUS_SHORTCUT'),
      NOTE_FORMAT: store.get('NOTE_FORMAT')
    };
  });

  ipcMain.handle('get-tag-mappings', () => {
    return store.get('TAG_FILE_MAPPINGS') || [];
  });

  ipcMain.handle('create-note', (event, noteContent) => {
    console.log('create-note', noteContent);

    // Routing po tagach: wyciągnij hashtagi z treści
    const tagRegex = /(?:^|\s)#(\S+)/g;
    const foundTags = [];
    let match;
    while ((match = tagRegex.exec(noteContent)) !== null) {
      foundTags.push(match[1].toLowerCase());
    }

    const mappings = store.get('TAG_FILE_MAPPINGS') || [];
    const targetFiles = new Set();
    const matchedTagNames = new Set();

    // Dopasuj tagi do mapowań
    for (const tag of foundTags) {
      for (const mapping of mappings) {
        if (mapping.tag && mapping.file && mapping.tag.toLowerCase() === tag) {
          targetFiles.add(mapping.file);
          matchedTagNames.add(tag);
        }
      }
    }

    // Jeśli brak dopasowań — zapisz do domyślnego pliku
    if (targetFiles.size === 0) {
      const defaultFile = store.get('DEFAULT_NOTES_FILE');
      if (defaultFile) {
        targetFiles.add(defaultFile);
      }
    }

    // Usuń dopasowane tagi z treści notatki
    let cleanContent = noteContent;
    for (const tag of matchedTagNames) {
      const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      cleanContent = cleanContent.replace(new RegExp(`\\s*#${escaped}(?=\\s|$)`, 'gi'), '');
    }
    cleanContent = cleanContent.trim();

    // Nie zapisuj jeśli treść jest pusta po usunięciu tagów
    if (!cleanContent) return;

    const date = new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date());
    const note = store.get('NOTE_FORMAT')
      .replaceAll("{{date}}", date)
      .replaceAll("{{note}}", cleanContent)
      .replaceAll("{{newLine}}", `\n`);

    // Zapisz do każdego dopasowanego pliku
    for (const file of targetFiles) {
      fs.appendFileSync(file, note);
    }
  });

  ipcMain.handle('hide-window', () => {
    console.log('hide-window');
    mainWindow.hide();
  });

  ipcMain.handle('center-window', () => {
    console.log('center-window');
    mainWindow.center();
  });

  ipcMain.handle('resize-window', (event, height) => {
    console.log('resize-window', height);
    if (mainWindow) {
      const [width] = mainWindow.getSize();
      mainWindow.setSize(width, height, true);
    }
  });

  ipcMain.handle('show-settings', () => {
    console.log('show-settings');
    mainWindow.setAlwaysOnTop(false);
    settingsWindow.show();
    settingsWindow.focus();
  });

  ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog(settingsWindow, {
      properties: ['openFile', 'createDirectory'],
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: 'Text', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  const saveNewGlobalFocusShortcut = newGlobalFocusShortcut => {
    const oldGlobalFocusShortcut = store.get('GLOBAL_FOCUS_SHORTCUT');
    if (newGlobalFocusShortcut !== oldGlobalFocusShortcut) {
      store.set('GLOBAL_FOCUS_SHORTCUT', newGlobalFocusShortcut);
      globalShortcut.unregister(oldGlobalFocusShortcut);
      registerGlobalFocusShortcut(mainWindow);
    }
  };

  ipcMain.handle('save-settings', (event, settings) => {
    console.log('save-settings');
    console.log(settings);
    saveNewGlobalFocusShortcut(settings.GLOBAL_FOCUS_SHORTCUT);
    store.set('DEFAULT_NOTES_FILE', settings.DEFAULT_NOTES_FILE);
    store.set('TAG_FILE_MAPPINGS', settings.TAG_FILE_MAPPINGS);
    store.set('NOTE_FORMAT', settings.NOTE_FORMAT);
  });

  ipcMain.handle('hide-settings', () => {
    console.log('hide-settings');
    settingsWindow.hide();
    mainWindow.setAlwaysOnTop(true);
  });

  // Tworzenie okien po zarejestrowaniu handlerów
  mainWindow = await createMainWindow();
  settingsWindow = await createSettingsWindow(mainWindow);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
  registerGlobalFocusShortcut(mainWindow);
});

app.on('window-all-closed', function () {
  globalShortcut.unregister('GLOBAL_FOCUS_SHORTCUT');
  globalShortcut.unregisterAll()

  if (process.platform !== 'darwin') app.quit()
});
