@echo off
REM 이 스크립트는 Java 애플리케이션을 실행합니다.

REM 스크립트의 디렉토리 경로를 기준으로 JAR 파일 경로 설정
SET SCRIPT_DIR=%~dp0

REM 경로의 끝에 \가 없을 경우 추가
IF NOT "%SCRIPT_DIR:~-1%" == "\" SET SCRIPT_DIR=%SCRIPT_DIR%\

REM JAR 파일 실행
java -jar "%SCRIPT_DIR%jar\filecopy_util.jar" %SCRIPT_DIR%