const noteField = document.getElementById('note');

noteField.addEventListener('keyup', async (e) => {
    console.log(e.key);
    if (e.key === 'Enter') {
        await window.api.createNote(e.target.value).then(() => {
            noteField.value = '';
            return window.api.hideWindow();
      });
    }
});

document.body.addEventListener('dblclick', async () => {
    await window.api.centerWindow();
});

document.body.addEventListener('keyup', async (e) => {
    if (e.key === 'Escape') {
        if (noteField.value.length > 0) {
            noteField.value = '';
        } else {
            await window.api.hideWindow();
        }
    }
});

document.getElementById('settings').addEventListener('click', async () => {
    await window.api.showSettings();
});
