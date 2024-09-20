
const { db } = require('./../database'); // database.js에서 db 가져오기

function getUsersPreset() {
    const sql1 = `SELECT value FROM settings WHERE id = 'active_preset'`
    const sql2 = `SELECT before_val, after_val FROM preset WHERE id = ?`;

    return new Promise((resolve, reject) => {
        db.get(sql1, [], (err, row) => {
            if (err) {
                console.error('Could not get active preset:', err.message);
                return reject(err);
            }

            const value = row ? row.value : null;
            if (!value) {
                return reject(new Error('No active preset found.'));
            }

            db.all(sql2, [value], (err, rows) => {
                if (err) {
                    console.error('Could not get preset values:', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    });
}

function getAllPreset() {
    const sql = `SELECT id, before_val, after_val FROM preset ORDER BY before_val`;
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

function insertPreset(presets) {

    const deleteSql = `DELETE FROM preset`; // DELETE 쿼리 수정
    const insertSql = `INSERT INTO preset (id, before_val, after_val) VALUES (?, ?, ?)`;

    return new Promise((resolve, reject) => {
        // DELETE 작업 수행
        db.run(deleteSql, function (err) {
            if (err) {
                console.error('Could not delete presets:', err.message);
                return reject(err);
            }

            // 모든 업데이트 작업을 Promise 배열로 변환
            const promises = presets.flatMap(container =>  // 중첩 배열을 평탄화
                container.map(preset => {
                    return new Promise((resolve, reject) => {
                        // id값과 before_val값이 있을 때만 insert
                        if (preset.id !== '' && preset.before_val !== '') {
                            db.run(insertSql, [preset.id, preset.before_val.trim(), preset.after_val.trim()], function (err) {
                                if (err) {
                                    console.error('Could not insert preset:', err.message);
                                    return reject(err);
                                }
                                resolve();
                            });
                        } else {
                            resolve(); // 조건을 만족하지 않으면 resolve
                        }
                    });
                })
            );

            // 모든 Promise가 완료될 때까지 기다림
            Promise.all(promises)
                .then(() => resolve())
                .catch(reject);
        });
    });
}
// 내보내기
module.exports = { getUsersPreset, getAllPreset, insertPreset };