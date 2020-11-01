const { ipcRenderer } = require('electron')

const noteField = document.getElementById('note');

noteField.addEventListener('keyup', (e) => {
    console.log(e.key);
    if (e.key === 'Enter') {
        ipcRenderer.invoke('create-note', e.target.value)
            .then(() => ipcRenderer.invoke('hide-window'));

    }
});

noteField.addEventListener('blur', (e) => {
    e.target.value = '';
});

document.body.addEventListener('dblclick', (e) => {
    ipcRenderer.invoke('center-window');
})

document.body.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
        ipcRenderer.invoke('hide-window');
    }
})

document.getElementById('settings').addEventListener('click', (e) => {
    ipcRenderer.invoke('show-settings');
})
