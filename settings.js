const { ipcRenderer } = require('electron')

console.log('settings.js');

document.getElementById('save').addEventListener('click', (e) => {
    const OBSIDIAN_VAULT_FILE = document.getElementById("OBSIDIAN_VAULT_FILE").value;
    const GLOBAL_FOCUS_SHORTCUT = document.getElementById("GLOBAL_FOCUS_SHORTCUT").value;
    const NOTE_FORMAT = document.getElementById("NOTE_FORMAT").value;

    const configuration = { OBSIDIAN_VAULT_FILE, GLOBAL_FOCUS_SHORTCUT, NOTE_FORMAT }
    ipcRenderer.invoke('save-settings', configuration).then(() => ipcRenderer.invoke('hide-settings'));
});

document.getElementById('cancel').addEventListener('click', (e) => {
    ipcRenderer.invoke('hide-settings');
});