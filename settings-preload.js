const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: configuration => ipcRenderer.invoke('save-settings', configuration),
    hideSettings: () => ipcRenderer.invoke('hide-settings'),
    selectFile: () => ipcRenderer.invoke('select-file')
});

