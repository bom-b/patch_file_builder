const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('winAPI', {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),
    openBrowser: (link) => ipcRenderer.send('open-browser', link)
});

contextBridge.exposeInMainWorld('fileAPI', {
    openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
    savePresetFile: (defaultFileName) => ipcRenderer.invoke('dialog:savePresetFile', defaultFileName),
    openPresetFile: () => ipcRenderer.invoke('dialog:openPresetFile'),
    findClassFile: (paths) =>  ipcRenderer.invoke('find-classFile', paths),
    makePatchFile: (copyPath, paths) =>  ipcRenderer.invoke('make-patchFile', copyPath, paths)
});

contextBridge.exposeInMainWorld('sqlAPI', {
    getAllSettings: () => ipcRenderer.invoke('sql:getAllSettings'),
    updateSettings: (param) => ipcRenderer.invoke('sql:updateSettings', param),

    //preset
    getAllPreset: () => ipcRenderer.invoke('sql:getAllPreset'),
    getUsersPreset: () => ipcRenderer.invoke('sql:getUsersPreset'),
    getPresetNameByIndex: (index) => ipcRenderer.invoke('sql:getPresetNameByIndex', index),
    insertPreset: (presetNames, presets) => ipcRenderer.invoke('sql:insertPreset', presetNames, presets),
});