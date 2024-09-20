#!/bin/bash
# 이 스크립트는 Java 애플리케이션을 실행합니다.

# 스크립트의 디렉토리 경로를 기준으로 JAR 파일 경로 설정
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
java -jar "$SCRIPT_DIR/jar/filecopy_util.jar" "$SCRIPT_DIR"