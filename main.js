const { app, globalShortcut, BrowserWindow, ipcMain } = require('electron')
const configuration = require('./configuration.json');
const fs = require('fs');
const path = require('path');
const Store = require('electron-store');

const DEBUG_MODE = process.env.DEBUG;

const store = new Store({ defaults: configuration });

const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: DEBUG_MODE ? 300 : 40,
    frame: false,
    resizable: DEBUG_MODE,
    minimizable: false,
    maximizable: false,
    closable: false,
    center: true,
    fullscreenable: false,
    show: false,
    transparent: true,
    opacity: 0.95,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('blur', () => {
    const areChildWindowsFocused = mainWindow.getChildWindows().reduce((prev, win) => prev || win.isFocused(), false);
    !areChildWindowsFocused && mainWindow.hide()
  });
  DEBUG_MODE && mainWindow.webContents.openDevTools();
  return mainWindow;
};

const createSettingsWindow = (mainWindow) => {
  const settingsWindow = new BrowserWindow({
    parent: mainWindow,
    modal: !DEBUG_MODE,
    show: false,
    width: 320,
    height: 150,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'settings-preload.js')
    }
  });
  settingsWindow.loadFile('settings.html');
  DEBUG_MODE && settingsWindow.webContents.openDevTools();
  return settingsWindow;
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

app.whenReady().then(() => {
  const mainWindow = createMainWindow();
  const settingsWindow = createSettingsWindow(mainWindow);
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
  registerGlobalFocusShortcut(mainWindow);

  ipcMain.handle('create-note', (event, noteContent) => {
    console.log('create-note', noteContent);
    const date = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())
    const note = store.get('NOTE_FORMAT')
        .replaceAll("{{date}}", date)
        .replaceAll("{{note}}", noteContent)
        .replaceAll("{{newLine}}", `\n`);
    fs.appendFileSync(store.get('OBSIDIAN_VAULT_FILE'), note);
  });

  ipcMain.handle('hide-window', () => {
    console.log('hide-window');
    mainWindow.hide();
  });

  ipcMain.handle('center-window', () => {
    console.log('center-window');
    mainWindow.center();
  });

  ipcMain.handle('show-settings', () => {
    console.log('show-settings');
    settingsWindow.show();
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
    store.set('OBSIDIAN_VAULT_FILE', settings.OBSIDIAN_VAULT_FILE);
    store.set('NOTE_FORMAT', settings.NOTE_FORMAT);
  });

  ipcMain.handle('hide-settings', () => {
    console.log('hide-settings');
    settingsWindow.hide();
    mainWindow.show();
  });
});

app.on('window-all-closed', function () {
  globalShortcut.unregister('GLOBAL_FOCUS_SHORTCUT');
  globalShortcut.unregisterAll()

  if (process.platform !== 'darwin') app.quit()
});