const fs = require('fs');
const path = require('path');

function utilExport(totalFileCount, paths, copyPath, targetPath) {
    const files = [
        { source: './fileCopyUtil/Config.txt', destination: 'Config.txt' },
        { source: './fileCopyUtil/run.bat', destination: 'run.bat' },
        { source: './fileCopyUtil/run.sh', destination: 'run.sh' },
        { source: './fileCopyUtil/jar/filecopy_util.jar', destination: '/jar/filecopy_util.jar' },
    ];

    files.forEach(file => {
        const sourcePath = path.resolve(__dirname, file.source);
        const destPath = path.join(copyPath, file.destination);

        // 디렉토리 생성
        const dir = path.dirname(destPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // 파일 복사
        fs.copyFileSync(sourcePath, destPath);
    });

    const pathOfTargetPath = path.join(copyPath, 'TargetPath.txt');
    fs.writeFileSync(pathOfTargetPath, targetPath, 'utf8');

    const pathOfFileList = path.join(copyPath, '파일 목록.txt');
    let fileListText = '';
    fileListText += '총 파일 개수 : ' + totalFileCount + '\n\n\n';

    Object.keys(paths).forEach((fileType) => {
        const items = paths[fileType];
        let fileCnt = 0;
        let filesText = '';
        items.forEach((pathInfo) => {
            if(pathInfo.use && fs.existsSync(pathInfo.fullPath)) {
                fileCnt++;
                filesText += '    ' + pathInfo.convertPath + '\n';
            }
        });
        if(fileCnt> 0) {
            fileListText += '확장자 [' + fileType + ']  (파일 개수 : ' + fileCnt + ')\n';
            fileListText += filesText;
            fileListText += '\n\n'
        }
    });

    fs.writeFileSync(pathOfFileList, fileListText, 'utf8');
}

module.exports = { utilExport };
