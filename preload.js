const {
  ipcRenderer,
  contextBridge
} = require("electron");


contextBridge.exposeInMainWorld('api', {
  createNote: value => ipcRenderer.invoke('create-note', value),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  centerWindow: () => ipcRenderer.invoke('center-window'),
  showSettings: () => ipcRenderer.invoke('show-settings'),
});
