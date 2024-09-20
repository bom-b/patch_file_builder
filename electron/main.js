// main.js
const { app, BrowserWindow } = require('electron');
const path  = require('path');
const { fileURLToPath }  = require('url');
const {registerIpcHandlers,sqlHandlers} = require('./ipcHandler');
const { closeDatabase } = require('./database');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        minWidth: 1000,
        minHeight: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: false
        },
        frame: false
    });

    mainWindow.setTitle('PatchFile Builder');

    // 개발 모드인지 확인
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173'); // Vue 앱의 기본 URL
        mainWindow.webContents.openDevTools();
    } else {
        // 빌드된 파일 경로를 사용
        mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
    }

    // IPC 핸들러 등록
    registerIpcHandlers(mainWindow);
    sqlHandlers(mainWindow);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        closeDatabase();
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

