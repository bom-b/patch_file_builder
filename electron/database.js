const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 파일 경로 설정
const dbPath = path.join(__dirname, 'database.db');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

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