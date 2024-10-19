// SQL로 가져온 데이터에서 키로 값 추출하는 함수
export function extractVal(dataList, key, keyVal) {
    const found = dataList.find(data => data[key] === keyVal);
    return found ? found.value : null;
}

// localStorage에 input history를 추가
export function appendInputHistory(settingsKey, value) {
    const val = localStorage.getItem(settingsKey);
    let inputHistory;

    try {
        inputHistory = JSON.parse(val);
        if (!Array.isArray(inputHistory)) {
            throw new Error("Parsed value is not an array");
        }
    } catch (err) {
        inputHistory = [];
    }

    if (value) {
        inputHistory = inputHistory.filter(item => item !== value);
        inputHistory.unshift(value);
        inputHistory = inputHistory.slice(0, 3);
        localStorage.setItem(settingsKey, JSON.stringify(inputHistory));
    }
}

// localStorage의 input history에서 가장 최근의 값을 가져옴
export function getLastValueFromInputHistory(settingsKey) {
    const val = localStorage.getItem(settingsKey);

    try {
        const inputHistory = JSON.parse(val);
        if (!Array.isArray(inputHistory)) {
            throw new Error("Parsed value is not an array");
        }
        return inputHistory.length > 0 ? inputHistory[0] : null; // 배열이 비어있는 경우 처리
    } catch (err) {
        localStorage.removeItem(settingsKey);
        return null;
    }
}

// localStorage의 input history의 모든 값을 가져옴
export function getAllValueFromInputHistory(settingsKey) {
    const val = localStorage.getItem(settingsKey);

    try {
        const inputHistory = JSON.parse(val);
        if (!Array.isArray(inputHistory)) {
            throw new Error("Parsed value is not an array");
        }
        return inputHistory.length > 0 ? inputHistory : null;
    } catch (err) {
        localStorage.removeItem(settingsKey);
        return null;
    }
}