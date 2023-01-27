document.getElementById('save').addEventListener('click', async () => {
    const OBSIDIAN_VAULT_FILE = document.getElementById("OBSIDIAN_VAULT_FILE").value;
    const GLOBAL_FOCUS_SHORTCUT = document.getElementById("GLOBAL_FOCUS_SHORTCUT").value;
    const NOTE_FORMAT = document.getElementById("NOTE_FORMAT").value;

    const configuration = { OBSIDIAN_VAULT_FILE, GLOBAL_FOCUS_SHORTCUT, NOTE_FORMAT }
    await window.api.saveSettings(configuration).then(() => window.api.hideSettings());
});

document.getElementById('cancel').addEventListener('click', async () => {
    await window.api.hideSettings();
});

document.body.addEventListener('keyup', async (e) => {
    if (e.key === 'Escape') {
        await window.api.hideSettings();
    }
});

