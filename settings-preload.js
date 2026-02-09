const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', async () => {
    const settings = await ipcRenderer.invoke('get-settings');
    document.getElementById("NOTES_FILE").value = settings.NOTES_FILE;
    document.getElementById("GLOBAL_FOCUS_SHORTCUT").value = settings.GLOBAL_FOCUS_SHORTCUT;
    document.getElementById("NOTE_FORMAT").value = settings.NOTE_FORMAT;
});

contextBridge.exposeInMainWorld('api', {
    saveSettings: configuration => ipcRenderer.invoke('save-settings', configuration),
    hideSettings: () => ipcRenderer.invoke('hide-settings')
});

