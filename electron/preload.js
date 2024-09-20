const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('winAPI', {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window')
});

contextBridge.exposeInMainWorld('fileAPI', {
    openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
    findClassFile: (paths) =>  ipcRenderer.invoke('find-classFile', paths),
    makePatchFile: (copyPath, paths) =>  ipcRenderer.invoke('make-patchFile', copyPath, paths)
});

contextBridge.exposeInMainWorld('slqAPI', {
    getAllSettings: () => ipcRenderer.invoke('sql:getAllSettings'),
    updateSettings: (param) => ipcRenderer.invoke('sql:updateSettings', param),

    //preset
    getAllPreset: () => ipcRenderer.invoke('sql:getAllPreset'),
    getUsersPreset: () => ipcRenderer.invoke('sql:getUsersPreset'),
    insertPreset: (presets) => ipcRenderer.invoke('sql:insertPreset', presets),
});