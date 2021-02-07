const { ipcRenderer } = require('electron');

const noteField = document.getElementById('note');

noteField.addEventListener('keyup', (e) => {
    console.log(e.key);
    if (e.key === 'Enter') {
        ipcRenderer.invoke('create-note', e.target.value)
            .then(() => ipcRenderer.invoke('hide-window'));

    }
});

document.body.addEventListener('dblclick', () => {
    ipcRenderer.invoke('center-window');
});

document.body.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
        if (e.target.value.length > 0) {
            e.target.value = '';
        } else {
            ipcRenderer.invoke('hide-window');
        }
    }
});

document.getElementById('settings').addEventListener('click', () => {
    ipcRenderer.invoke('show-settings');
});
