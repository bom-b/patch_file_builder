
const { db } = require('./../database'); // database.js에서 db 가져오기

function getUsersPreset() {
    const sql1 = `SELECT value FROM settings WHERE id = 'active_preset'`
    const sql2 = `SELECT i.id, p.before_val, p.after_val FROM preset_info i LEFT JOIN preset p ON i.id = p.id WHERE i.id = ?`;

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
    const sql = `SELECT i.id, i.name, p.before_val, p.after_val FROM preset_info i LEFT JOIN preset p ON i.id = p.id ORDER BY i.id, p.before_val`;
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

// 특정 인덱스의 프리셋 이름 가져오기
function getPresetNameByIndex(index) {
    const sql = `SELECT name FROM preset_info WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.get(sql, [index], (err, row) => {
            if (err) {
                console.error('Could not get preset name:', err.message);
                return reject(err);
            }
            resolve(row);
        })
    })
}

// 프리셋 이름 및 내용 업데이트
function insertPreset(presetNames, presets) {

    const deleteSql = `DELETE FROM preset`; // DELETE 쿼리 수정
    const insertSql = `INSERT INTO preset (id, before_val, after_val) VALUES (?, ?, ?)`;
    const updateSql = `UPDATE preset_info SET name = ? WHERE id = ?`;

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
                        if (preset.id !== '' && preset.before_val !== '' && preset.before_val != null) {
                            const id = preset.id;
                            const beforeVal = preset.before_val.trim();
                            const afterVal = (preset.after_val != null) ? preset.after_val.trim() : "";
                            db.run(insertSql, [id, beforeVal, afterVal], function (err) {
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

            const promises2 = presetNames.map((presetName, index) => {
                return new Promise((resolve, reject) => {
                    db.run(updateSql, [presetName, index], function (err) {
                        if (err) {
                            console.error('Could not update preset name:', err.message);
                            return reject(err);
                        }
                        resolve();
                    });
                });
            });

            // 모든 Promise가 완료될 때까지 기다림
            Promise.all([...promises, ...promises2])
                .then(() => resolve())
                .catch(reject);
        });
    });
}
// 내보내기
module.exports = { getUsersPreset, getAllPreset, getPresetNameByIndex, insertPreset };