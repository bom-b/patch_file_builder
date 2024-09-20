<script setup>
import {onMounted, ref} from "vue";
import PopUp from '../components/PresetEditPopup.vue'

// 설정값들
let userSettings = [];
const targetPath = ref('');
const classPath = ref('');
const isMakeProgram = ref(true)
const isFindClass = ref(true);
const usersIndex = ref('0');

const popupRef = ref(null);

onMounted(() => {
  getAllSettings();
});

function getAllSettings() {
  window.slqAPI.getAllSettings().then(settings => {
    userSettings = settings;
    targetPath.value = extractVal(userSettings, 'id', 'target_path');
    classPath.value = extractVal(userSettings, 'id', 'class_path');
    isFindClass.value = extractVal(userSettings, 'id', 'is_find_class') == '1' ? true : false;
    usersIndex.value = extractVal(userSettings, 'id', 'active_preset');
  });
}

// SQL로 가져온 데이터에서 키로 값 추출하는 함수
function extractVal(dataList, key, keyVal) {
  const found = dataList.find(data => data[key] === keyVal);
  return found ? found.value : null;
}

// 설정값 받기
function changeIsMakeProgram() {
  isMakeProgram.value = !isMakeProgram.value;
}

function changeIsFindClass() {
  isFindClass.value = !isFindClass.value;
}

function setClassPath() {
  window.fileAPI.openFolder().then((path) => {
    if (path) {
      classPath.value = path; // 선택한 경로를 입력 필드에 설정
    }
  });
}

function saveSetting() {
  const message = document.getElementById('message');
  if(isFindClass.value === true && classPath.value.length < 1) {
    message.textContent = "class파일이 생성되는 경로를 입력해주세요.";
    message.className = '';
    message.classList.add('darkred');
  } else {
    const params = [
      {id: 'target_path', value: targetPath.value},
      {id: 'is_find_class', value: isFindClass.value},
      {id: 'class_path', value: classPath.value},
      {id: 'active_preset', value: usersIndex.value},
    ];
    window.slqAPI.updateSettings(params).then((result) => {
      console.log("변경완료! : " + result);
    });
    message.textContent = "설정을 저장하였습니다.";
    message.className = '';
    message.classList.add('darkgreen');
  }
}

// 프리셋 수정 팝업 열기
function editPreset() {
  if (popupRef.value) {
    popupRef.value.showPopUp();
  }
}

// 선택된 프리셋 수정
function updatePresetIndex(choiceIndex){
  usersIndex.value = choiceIndex.toString();
}

// 선택된 프리셋 텍스트
function usersPresetText() {
  let text = '';
  switch (usersIndex.value){
    case '0': text = '프리셋1'
          break;
    case '1': text = '프리셋2'
          break;
    case '2': text = '프리셋3'
          break;
  }
  return text;
}
</script>

<template>
  <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
    <div style="display: flex; flex-direction: column; flex:1;">
      <h4 style="margin-bottom: 10px; color: rgba(246, 246, 246, 0.64);">환경 설정</h4>
<!--      <div class="form-wrapper" style="margin-top: 20px;">-->
<!--        <p class="">파일 반영 프로그램과 함께 생성</p>-->
<!--        <button :class="isMakeProgram ? 'btn-signature2' : 'btn-gray'" style="margin-left: 10px;" @click="changeIsMakeProgram()">-->
<!--          {{isMakeProgram ? 'ON' : 'OFF'}}-->
<!--        </button>-->
<!--      </div>-->
      <div class="form-wrapper" style="margin-top: 20px;">
        <label for="target-path" style="width: 190px;">반영 대상 프로젝트 경로 : </label>
        <input id="target-path" v-model="targetPath" class="form-control2" style="margin-left: 20px; width: 600px;">
      </div>
      <div class="form-wrapper" style="margin-top: 40px;">
        <p class="">class파일 자동 탐색</p>
        <button :class="isFindClass ? 'btn-signature2' : 'btn-gray'" style="margin-left: 10px;" @click="changeIsFindClass()">
          {{isFindClass ? 'ON' : 'OFF'}}
        </button>
      </div>
      <div class="form-wrapper">
        <label for="class-path" style="width: 190px;">class파일이 생성되는 경로 : </label>
        <input id="class-path" v-model="classPath" class="form-control2" :class="{ 'disabled-form-control2': !isFindClass }" style="margin-left: 20px; width: 600px;" :disabled="!isFindClass">
        <button v-if="isFindClass" class="btn-setting" style="margin-left: 5px;" @click="setClassPath()">폴더 선택</button>
      </div>
      <div id="setting-container" style=" margin-top: 100px;">
        <div style="display: flex; align-items: center;">
          <h4 style="margin-bottom: 10px; color: rgba(246, 246, 246, 0.64);">경로 변경 설정</h4>
        </div>
        <div style="display: flex; align-items: center; margin-top: 20px;">
          <p style="">선택된 설정 : </p>
          <p style="margin-left: 10px; color:#ff7f27;">{{usersPresetText()}}</p>
        </div>
        <div style="display: flex; align-items: center; justify-content: end; margin-top: 20px; padding-right: 10px;">
          <button class="btn-setting" style="margin-left: 5px;" @click="editPreset()">프리셋 편집</button>
        </div>
      </div>
    </div>
    <div class="mt-2" style="display: flex; align-items: flex-end; justify-content: space-between;">
      <div>
        <p id="message"></p>
      </div>
      <div>
        <button class="btn-signature" @click="saveSetting()">저장</button>
      </div>
    </div>
  </div>

  <PopUp ref="popupRef" @update-preset-index="updatePresetIndex"/>
</template>

<style scoped>
#setting-container {
  padding: 40px 10px 20px 10px;
  border: 1px solid #1e1f22;
}
</style>