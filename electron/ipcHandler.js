const { ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { utilExport } = require('./fileCopyUtilExport')

// sql
const { getAllSettings, getOneSettingById, updateSettings } = require('./sql/userInput');
const { getUsersPreset, getAllPreset, insertPreset } = require('./sql/preset');

function registerIpcHandlers(mainWindow) {
    // 최소화, 최대화, 종료 이벤트 처리
    ipcMain.on('minimize-window', () => {
        mainWindow.minimize();
    });

    ipcMain.on('maximize-window', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('close-window', () => {
        mainWindow.close();
    });

    // 파일 핸들링 관련
    ipcMain.handle('dialog:openFolder', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'] // 폴더만 선택 가능
        });
        return result.filePaths[0]; // 선택한 폴더의 경로 반환
    });

    // 기본 브라우저로 링크 열기
    ipcMain.on('open-browser', (event, link) => {
        shell.openExternal(link);
    });

    // 클래스 파일 찾기
    ipcMain.handle('find-classFile', async (event, paths) => {

        // 클래스 파일을 찾지 않으면 더 이상 진행할 필요가 없음
        const isFindClassFile = await getOneSettingById('is_find_class');
        if (isFindClassFile === '0') {
            return paths;
        }

        // 클래스패스가 실제 존재하는 경로인지 확인
        const classPath = await getOneSettingById('class_path');
        if (!fs.existsSync(classPath)) {
            console.error(`디렉토리가 존재하지 않습니다: ${classPath}`);
            return "err1"; // 경로가 없으면 종료
        }

        let result = [];

        // 프로젝트 내에서 .class 파일을 찾는 함수
        function findClassFilesInProject(javaFilePath) {
            const classFileName = path.basename(javaFilePath, '.java') + '.class'; // .java에서 .class로 변경
            const classFilePaths = []; // 모든 .class 파일 경로를 저장할 배열

            // 재귀적으로 디렉토리를 탐색하는 함수
            function searchDirectory(directory) {
                const items = fs.readdirSync(directory); // 디렉토리의 모든 항목을 읽어옴

                items.forEach(item => {
                    const currentPath = path.join(directory, item);
                    const stats = fs.statSync(currentPath); // 현재 항목의 상태를 가져옴

                    if (stats.isDirectory()) {
                        // 디렉토리인 경우 재귀 호출
                        searchDirectory(currentPath);
                    } else if (stats.isFile() && item === classFileName) {
                        // .class 파일인 경우
                        classFilePaths.push(currentPath); // 경로 추가
                    }
                });
            }

            // projectPath에서 검색 시작
            searchDirectory(classPath);
            return classFilePaths; // 발견된 모든 .class 파일 경로 반환
        }

        // javaFilePath과 경로가 가장 가까운 classFilePath 찾기
        function findClosestFile(javaFilePath, classFilePaths) {
            const javaDirPath = path.dirname(javaFilePath);
            const javaDirParts = javaDirPath.split(path.sep).reverse();

            let closestMatch = null;
            let maxMatchingParts = 0;

            classFilePaths.forEach((classFilePath) => {
                const classDirPath = path.dirname(classFilePath);
                const classDirParts = classDirPath.split(path.sep).reverse();

                let matchingParts = 0;

                for(let i = 0; i < Math.min(javaDirParts.length, classDirParts.length); i++) {
                    if(javaDirParts[i] === classDirParts[i]) {
                        matchingParts++;
                    } else {
                        break;
                    }
                }

                if (matchingParts > maxMatchingParts) {
                    maxMatchingParts = matchingParts;
                    closestMatch = classFilePath;
                }
            });

            return closestMatch;
        }

        paths.forEach((path) => {
            if (path.endsWith('.java')) { // .java로 끝나는 파일인지 확인

                const classFilePaths = findClassFilesInProject(path);
                let classFile = null;
                if (classFilePaths) {
                    if (classFilePaths.length > 1) { // 같은 이름으로 발견되는 클래스파일이 여러개일때,
                        classFile = findClosestFile(path, classFilePaths);
                        console.log(classFile);
                    } else {
                        classFile = classFilePaths[0]
                    }
                    result.push(classFile);
                }
                result.push(path);

            } else { // .java 파일 아니면 그냥 푸쉬
                result.push(path);
            }
        });
        return result;
    });

    ipcMain.handle('make-patchFile', async (event,copyPath ,paths) => {
        paths = JSON.parse(paths);
        const targetPath = await getOneSettingById('target_path');
        let notExistsPaths = [];

        let totalFileCount = 0;
        Object.keys(paths).forEach((fileType) => {
            const items = paths[fileType];
            items.forEach((pathInfo) => {
                if(pathInfo.use) {
                    const sourcePath = pathInfo.fullPath;
                    const destinationPath = path.join(copyPath, '/SourceFile/', pathInfo.convertPath);

                    // 경로에 해당하는 폴더가 없으면 생성
                    const dir = path.dirname(destinationPath);
                    if (!fs.existsSync(dir)) {
                        try {
                            fs.mkdirSync(dir, {recursive: true});
                        } catch (error) {
                            notExistsPaths.push(pathInfo.path);
                        }
                    }

                    if (fs.existsSync(sourcePath)) {
                        // 파일 복사
                        fs.copyFileSync(sourcePath, destinationPath);
                        totalFileCount++;
                    } else {
                        notExistsPaths.push(pathInfo.path);
                    }
                }
            });
        });

        // fileCopyUtil 내보내기
        utilExport(totalFileCount, paths, copyPath, targetPath);

        exec(`start "" "${copyPath}"`, (err) => {
            if (err) {
                console.error('폴더 열기 오류:', err);
            }
        });

        return notExistsPaths;
    });
}

function sqlHandlers(mainWindow) {
    ipcMain.handle('sql:getAllSettings', async () => {
        try {
            return await getAllSettings();
        } catch (error) {
            throw error;
        }
    });

    ipcMain.handle('sql:updateSettings', async (event,params) => {
        try {
            return await updateSettings(params);
        } catch (error) {
            throw error;
        }
    });

    //preset
    ipcMain.handle('sql:insertPreset', async (event,presets) => {
        try {
            return await insertPreset(presets);
        } catch (error) {
            throw error;
        }
    });

    ipcMain.handle('sql:getAllPreset', async () => {
        try {
            return await getAllPreset();
        } catch (error) {
            throw error;
        }
    });

    ipcMain.handle('sql:getUsersPreset', async () => {
        try {
            return await getUsersPreset();
        } catch (error) {
            throw error;
        }
    });
}

module.exports = {registerIpcHandlers, sqlHandlers};