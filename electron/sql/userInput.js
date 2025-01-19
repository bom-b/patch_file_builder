
const { db } = require('./../database'); // database.js에서 db 가져오기

// 모든 설정값 가져오기
function getAllSettings() {
    const sql = `SELECT id, value FROM settings UNION SELECT 'active_preset_name' AS id, name AS value FROM preset_info WHERE id = (SELECT value FROM settings WHERE id = 'active_preset')`;
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Could not get all settings:', err.message);
                return reject(err);
            }
            resolve(rows);
        })
    })
}

// 설정값 하나만 가져오기
function getOneSettingById(id) {
    const sql = `SELECT value FROM settings WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.get(sql, [id], (err, row) => {
            if (err) {
                console.error('Could not get all settings:', err.message);
                return reject(err);
            }
            resolve(row.value);
        })
    })
}

// 설정값 업데이트
function updateSettings(params) {
    const sql = `UPDATE settings SET value = ? WHERE id = ?`;

    // 모든 업데이트 작업을 Promise 배열로 변환
    const promises = params.map(param => {
        return new Promise((resolve, reject) => {
            db.run(sql, [param.value, param.id], function (err) {
                if (err) {
                    console.error('Could not update setting:', err.message);
                    return reject(err);
                }
                resolve();
            });
        });
    });

    // 모든 Promise가 완료될 때까지 기다림
    return Promise.all(promises);

}

// 내보내기
module.exports = { getAllSettings, getOneSettingById, updateSettings };