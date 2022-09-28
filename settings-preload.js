const configuration = require('./configuration.json');
const Store = require('electron-store');
const { contextBridge, ipcRenderer } = require('electron');

const store = new Store({ defaults: configuration });

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("OBSIDIAN_VAULT_FILE").value = store.get("OBSIDIAN_VAULT_FILE");
    document.getElementById("GLOBAL_FOCUS_SHORTCUT").value = store.get("GLOBAL_FOCUS_SHORTCUT");
    document.getElementById("NOTE_FORMAT").value = store.get("NOTE_FORMAT");
});

contextBridge.exposeInMainWorld('api', {
    saveSettings: configuration => ipcRenderer.invoke('save-settings', configuration),
    hideSettings: () => ipcRenderer.invoke('hide-settings')
});

