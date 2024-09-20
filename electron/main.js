// main.js
const { app, BrowserWindow, dialog } = require('electron');
const path  = require('path');
const { fileURLToPath }  = require('url');
const { autoUpdater } = require('electron-updater');

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

app.whenReady().then(() => {
    createWindow();

    // 자동 업데이트 체크
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('update-available', (info) => {
        console.log('업데이트가 가능합니다.');
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            buttons: ['업데이트', '취소'],
            title: '업데이트 알림',
            message: '새로운 업데이트가 있습니다.'
        }).then((result) => {
            if (result.response === 0) {
                autoUpdater.downloadUpdate();
            }
        });
    });

    autoUpdater.on('update-not-available', () => {
        console.log('최신 버전 입니다.');
    });

    autoUpdater.on('error', (error) => {
       console.log('업데이트 오류 : ' + error);
    });

    autoUpdater.on('update-downloaded', (info) => {
        console.log('업데이트 다운로드 완료', info);
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            buttons: ['재시작', '나중에'],
            title: '업데이트 다운로드 완료',
            message: '업데이트가 다운로드 되었습니다. 지금 설치하시겠습니까?'
        }).then((result) => {
            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }
        })
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        closeDatabase();
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

