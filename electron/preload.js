const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('winAPI', {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),
    openBrowser: (link) => ipcRenderer.send('open-browser', link)
});

contextBridge.exposeInMainWorld('fileAPI', {
    openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
    findClassFile: (paths) =>  ipcRenderer.invoke('find-classFile', paths),
    makePatchFile: (copyPath, paths) =>  ipcRenderer.invoke('make-patchFile', copyPath, paths)
});

contextBridge.exposeInMainWorld('sqlAPI', {
    getAllSettings: () => ipcRenderer.invoke('sql:getAllSettings'),
    updateSettings: (param) => ipcRenderer.invoke('sql:updateSettings', param),

    //preset
    getAllPreset: () => ipcRenderer.invoke('sql:getAllPreset'),
    getUsersPreset: () => ipcRenderer.invoke('sql:getUsersPreset'),
    insertPreset: (presets) => ipcRenderer.invoke('sql:insertPreset', presets),
});