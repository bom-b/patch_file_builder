const { ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { utilExport } = require('./fileCopyUtilExport')

// sql
const { getAllSettings, getOneSettingById, updateSettings } = require('./sql/userInput');
const { getUsersPreset, getAllPreset, getPresetNameByIndex, insertPreset } = require('./sql/preset');

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

    // 프리셋 파일 저장
    ipcMain.handle('dialog:savePresetFile', async (event, presetObj) => {
        const defaultFileName = presetObj.presetName;
        const result = await dialog.showSaveDialog(mainWindow, {
            title: '프리셋 파일 저장',
            defaultPath: `${defaultFileName}`, // 디폴트 파일명
            filters: [
                { name: 'Preset Files', extensions: ['preset'] } // 확장자 필터
            ]
        });

        if (!result.canceled && result.filePath) {
            const filePath = result.filePath.endsWith('.preset') ? result.filePath : `${result.filePath}.preset`;
            fs.writeFileSync(filePath, JSON.stringify(presetObj, null, 2), 'utf-8');
            return filePath; // 저장된 파일 경로 반환
        } else {
            return null; // 사용자가 취소한 경우
        }
    });

    // 프리셋 파일 불러오기
    ipcMain.handle('dialog:openPresetFile', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: '프리셋 파일 불러오기',
            filters: [
                { name: 'Preset Files', extensions: ['preset'] } // 확장자 필터
            ],
            properties: ['openFile'] // 파일만 선택 가능
        });

        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(fileContent); // 파일 내용을 JSON 객체로 반환
        } else {
            return null; // 사용자가 취소한 경우
        }
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

        // 최종적으로 반환할 경로들 (class파일 포함)
        let result = [];

        // 프로젝트 내에서 .class 파일을 찾는 함수
        // 내부 클래스로 인해 생성된 .class 파일도 함께 찾음
        function findClassFilesInProject(javaFilePath) {
            const classFileName = path.basename(javaFilePath, '.java');
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
                    } else if (stats.isFile() && (item === classFileName + '.class' || (item.startsWith(classFileName + '$') && item.endsWith('.class')))) {
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
        // classFilePath 내부에 있는 모든 클래스 파일의 경로 (내부클래스로 인한 클래스파일까지) 반환
        function findCorrectClassFile(javaFilePath, classFilePaths) {

            // 경로 중에 중복되는 파일명이 있는지 확인
            // 중복되는 파일명이 없다면 그대로 반환
            let hasDuplicateFileName = false;
            let classFileNamesSet = new Set();
            classFilePaths.forEach((classFilePath) => {
                const fileName = path.basename(classFilePath);
                if (classFileNamesSet.has(fileName)) {
                    hasDuplicateFileName = true;
                } else {
                    classFileNamesSet.add(fileName);
                }
            });
            if (!hasDuplicateFileName) {
                return classFilePaths;
            }
            
            const javaDirPath = path.dirname(javaFilePath);
            const javaDirParts = javaDirPath.split(/[/\\]/).reverse();

            let closestMatch = null; // javaFilePath와 가장 가까운 경로
            let maxMatchingParts = 0;

            classFilePaths.forEach((classFilePath) => {
                const classDirPath = path.dirname(classFilePath);
                const classDirParts = classDirPath.split(/[/\\]/).reverse();

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
                    closestMatch = classDirPath;
                }
            });

            return classFilePaths.filter((classFilePath) => path.dirname(classFilePath) === closestMatch);
        }

        paths.forEach((path) => {
            if (path.endsWith('.java')) { // .java로 끝나는 파일인지 확인
                const classFilePaths = findClassFilesInProject(path);
                let classFile = null;

                if (classFilePaths) {
                    if (classFilePaths.length > 1) { // 같은 이름으로 발견되는 클래스파일이 여러개일때,
                        const correctClassFiles = findCorrectClassFile(path, classFilePaths);
                        correctClassFiles.forEach((correctClassFile) => {
                           result.push(correctClassFile);
                        });
                    } else {
                        classFile = classFilePaths[0]
                    }
                    result.push(classFile); // 찾은 클래스 파일 경로 추가
                }
                result.push(path); // 자바 파일 경로 추가

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


    /*
    * preset
    */

    ipcMain.handle('sql:getUsersPreset', async () => {
        try {
            return await getUsersPreset();
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

    ipcMain.handle('sql:getPresetNameByIndex', async (event, index) => {
        try {
            return await getPresetNameByIndex(index);
        } catch (error) {
            throw error;
        }
    });

    ipcMain.handle('sql:insertPreset', async (event,presetNames, presets) => {
        try {
            return await insertPreset(presetNames, presets);
        } catch (error) {
            throw error;
        }
    });
}

module.exports = {registerIpcHandlers, sqlHandlers};