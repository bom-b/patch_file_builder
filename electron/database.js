const { app } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 데이터베이스 파일 경로 설정
const dbPath = path.join(app.getPath('userData'), 'database.db');

// 테이블 목록
const tableList = ["settings", "preset_info", "preset"];

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath,  async (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // 테이블들이 존재하는지 체크
        await checkTable();
    }
});

// 데이터 베이스에 테이블이 있는지 조회하기
async function checkTable() {
    const promises = tableList.map(tableName => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`, (err, row) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    const isExist = !!row;
                    if (!isExist) {
                        initializeDb(tableName);
                    }
                    resolve();
                }
            });
        });
    });

    await Promise.all(promises);
}

// 데이터 베이스 초기화
function initializeDb(tableName) {
    switch (tableName) {
        case "settings":
            initializeSettingsTable();
            break;
        case "preset":
            initializePresetTable();
            break;
        case "preset_info":
            initializePresetInfoTable();
            break;
    }
}

function initializeSettingsTable() {
    db.run("CREATE TABLE settings (id TEXT NOT NULL CONSTRAINT settings_pk PRIMARY KEY, value TEXT)", (err) => {
        if (err) {
            console.error(err);
        } else {
            const stmt = db.prepare("INSERT INTO settings (id, value) VALUES (?, ?);");
            const settings = [
                { id: "project_path", value: "" },
                { id: "copy_path", value: "" },
                { id: "target_path", value: "" },
                { id: "class_path", value: "" },
                { id: "is_make_program", value: "1" },
                { id: "is_find_class", value: "0" },
                { id: "active_preset", value: "0" }
            ];

            settings.forEach(setting => {
                stmt.run(setting.id, setting.value, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            });

            stmt.finalize();
        }
    });
}

function initializePresetTable() {
    db.run("CREATE TABLE preset (id INTEGER, before_val TEXT, after_val TEXT, CONSTRAINT preset_pk PRIMARY KEY (id, before_val))", (err) => {
        if (err) {
            console.error(err);
        } else {
            const stmt = db.prepare("INSERT INTO preset (id, before_val, after_val) VALUES (?, ?, ?);");
            const presets = [
                { id: 0, before_val: "/src/main/resources/egovframework/mapper", after_val: "/WEB-INF/classes/egovframework/mapper" },
                { id: 0, before_val: "/src/main/webapp/WEB-INF/jsp", after_val: "/WEB-INF/jsp" },
                { id: 0, before_val: "/src/main/webapp/css", after_val: "/css" },
                { id: 0, before_val: "/src/main/webapp/js", after_val: "/js" },
                { id: 0, before_val: "/target/classes", after_val: "/WEB-INF/classes" }
            ];

            presets.forEach(preset => {
                stmt.run(preset.id, preset.before_val, preset.after_val, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            });

            stmt.finalize();
        }
    });
}

function initializePresetInfoTable() {
    db.run("CREATE TABLE preset_info (id INTEGER CONSTRAINT preset_info_pk PRIMARY KEY, name TEXT)", (err) => {
        if (err) {
            console.error(err);
        } else {
            const stmt = db.prepare("INSERT INTO preset_info (id, name) VALUES (?, ?);");
            const presets = [
                { id: 0, name: "프리셋1" },
                { id: 1, name: "프리셋2" },
                { id: 2, name: "프리셋3" }
            ];

            presets.forEach(preset => {
                stmt.run(preset.id, preset.name, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            });

            stmt.finalize();
        }
    });
}
// 데이터베이스를 닫는 함수
function closeDatabase() {
    db.close((err) => {
        if (err) {
            console.error('Could not close database:', err.message);
        } else {
            console.log('Closed the database connection.');
        }
    });
}

// 데이터베이스 객체와 닫기 함수 내보내기
module.exports = { db, closeDatabase };