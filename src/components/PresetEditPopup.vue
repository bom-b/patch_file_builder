<script setup>
import {ref, defineExpose, defineEmits } from 'vue';
import Swal from "sweetalert2";

const emit = defineEmits(['update-preset-index']);

const isVisible = ref(false);
const isPresetNameEditing = ref([false, false, false]);
const filePaths = ref('');

const activeTabIndex = ref(0);
const inputContainers = ref([[],[],[]]);
const presetNames = ['프리셋 1', '프리셋 2', '프리셋 3'];

async function showPopUp() {

  // 기존에 유저가 선택한 프리셋을 액티브 탭으로
  const usersPreset = await window.sqlAPI.getUsersPreset();
  activeTabIndex.value =  usersPreset[0].id;

  // 프리셋에 대해 초기화
  inputContainers.value = [[],[],[]];
  window.sqlAPI.getAllPreset().then((result) => {
    // 프리셋 이름 초기화
    presetNames.forEach((_, index) => {
      const preset = result.find(p => p.id === index);
      if (preset) {
        presetNames[index] = preset.name;
      }
    });
    // 프리셋 값 초기화
    result.forEach((preset) => {
      inputContainers.value[preset.id].push({ id: preset.id, before_val: preset.before_val, after_val: preset.after_val });
    });
  });

  isVisible.value = true;
}

function hidePopUp() {
  isVisible.value = false;
}

function setActiveTab(index) {
  activeTabIndex.value = index;
  savePresetName();
}

const isActive = (index) => {
  return activeTabIndex.value === index;
};

// 현재 활성화된 프리셋의 인덱스에 맞는 배열에 새로운 inputContainer 추가
function addInputContainer() {
  inputContainers.value[activeTabIndex.value].push({ id: '', before_val: '', after_val: '' });
}

// 현재 활성화된 프리셋의 인덱스에 맞는 inputContainer 제거
function removeInputContainer(index) {
  inputContainers.value[activeTabIndex.value].splice(index, 1);
}

// 텍스트 입력 시 해당 컨테이너 업데이트
function updateInputValue(index, field, value) {
  inputContainers.value[activeTabIndex.value][index]['id'] = activeTabIndex.value;
  inputContainers.value[activeTabIndex.value][index][field] = value;
}

// 프리셋 이름 수정
function editPresetName(index) {
  isPresetNameEditing.value[index] = true;
  savePresetName();
}

// 프리셋 이름 저장
function savePresetName(index) {

  // 만약 빈 문자열로 저장한다면 프리셋으로 이름 초기화
  if (presetNames[activeTabIndex.value] === "") {
    presetNames[activeTabIndex.value] = "프리셋" + (activeTabIndex.value + 1);
  }

  if (index !== undefined) {
    isPresetNameEditing.value[index] = false;
  } else {
    isPresetNameEditing.value.forEach((_, index) => {
      if (index !== activeTabIndex.value) {
        isPresetNameEditing.value[index] = false;
      }
    });
  }
}

// 프리셋 내보내기
function exportPreset() {
  const presetName = presetNames[activeTabIndex.value];
  const presetObj = {
    "presetName" : presetName,
    "presets" : inputContainers.value[activeTabIndex.value].map(({ id, ...rest }) => rest)
  };
  window.fileAPI.savePresetFile(presetObj);
}

// 프리셋 가져오기
function importPreset() {
  window.fileAPI.openPresetFile().then((presets) => {
    if (presets) {
      if (presets.presetName && presets.presets) {
        presetNames[activeTabIndex.value] = presets.presetName;
        inputContainers.value[activeTabIndex.value] = [];
        presets.presets.forEach((preset) => {
          inputContainers.value[activeTabIndex.value].push({ id: activeTabIndex.value, before_val: preset.before_val, after_val: preset.after_val });
        })
      } else {
        Swal.fire({
          showConfirmButton: true,
          confirmButtonText: '확인',
          showClass: {
            popup: ''
          },
          hideClass: {
            popup: ''
          },
          allowOutsideClick: false,
          allowEscapeKey: false,
          text: '올바르지 않은 파일 형태입니다.'
        });
      }
    }
  });
}

function savePreset() {
  Swal.fire({
    showConfirmButton: false,
    showClass: {
      popup: ''
    },
    hideClass: {
      popup: ''
    },
    allowOutsideClick: false,
    allowEscapeKey: false,
    text: '요청을 처리중입니다.'
  });

  const presetNamesJson = JSON.parse(JSON.stringify(presetNames));
  const presets = JSON.parse(JSON.stringify(inputContainers.value));

  window.sqlAPI.insertPreset(presetNamesJson, presets).then((result) => {
    console.log("프리셋 저장완료!" );
    isVisible.value = false;
    emit('update-preset-index', activeTabIndex.value);
    Swal.close();
  });
}

defineExpose({showPopUp});
</script>

<template>
  <div class="overlay" @click="hidePopUp()" v-if="isVisible">
  </div>
  <transition name="fade">
    <div id="popup" v-if="isVisible">
      <div id="help-comment">
        <p style="margin-bottom: 20px; font-weight: bold;">프리셋 편집</p>
        <p style="color: rgba(246, 246, 246, 0.64);">경로구분자는 <span style="color: #ff7f27;">/</span> 를 사용해주세요.</p>
        <p style="color: rgba(246, 246, 246, 0.64);">적용을 원하는 프리셋을 선택 후 저장해주세요.</p>
      </div>
      <div class="preset-container">
        <div id="menu">
            <div :class="['tab', { deactivate: !isActive(index) }]" @click="setActiveTab(index)" v-for="(presetName, index) in presetNames" :key="index">
              <p v-if="!isPresetNameEditing[index]" @dblclick="editPresetName(index)">{{ presetNames[index] }}</p>
              <input class="preset-name-input" v-else v-model="presetNames[index]" @blur="savePresetName(index)" @keyup.enter="savePresetName(index)"/>
            </div>
        </div>

        <div v-for="presetIndex in [0, 1, 2]" :key="presetIndex" :id="'preset-' + presetIndex" v-show="isActive(presetIndex)" class="preset-content" @click="savePresetName(activeTabIndex)">
          <div class="preset-content-scroll-zone">
            <div v-for="(container, index) in inputContainers[presetIndex]" :key="index" class="input-container">
              <div class="mini-btn" @click="removeInputContainer(index)">
                <i class="fas fa-minus"/>
              </div>
              <div class="input-box">
                <input class="form-control2 before-val" style="flex: 1;" v-model="container.before_val" @input="updateInputValue(index, 'before_val', container.before_val)" >
                <i class="fas fa-arrow-right" style="margin: 0 10px;"/>
                <input class="form-control2 after-val" style="flex: 1;" v-model="container.after_val" @input="updateInputValue(index, 'after_val', container.after_val)" >
              </div>
            </div>
            <div class="plus-btn-container">
              <div class="mini-btn row-plus-btn" @click="addInputContainer">
                <i class="fas fa-plus"/>
              </div>
            </div>
          </div>
          <div class="export-and-import">
            <button class="btn-setting" @click="exportPreset" style="margin-right: 10px;">내보내기</button>
            <button class="btn-setting" @click="importPreset ">가져오기</button>
          </div>
        </div>

      </div>
      <div id="save-btn-container" >
        <button class="btn-signature" @click="savePreset()">저장</button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
i {
  color: #4fc1f4;
}

#popup {
  position: fixed; /* 화면에 고정 */
  top: 50%; /* 화면 중앙 */
  left: 50%; /* 화면 중앙 */
  transform: translate(-50%, -50%); /* 중앙 정렬 */
  background-color: #2b2d31; /* 배경색 */
  border: 0px solid #ccc; /* 테두리 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 그림자 */
  padding: 20px; /* 안쪽 여백 */
  z-index: 1000; /* 모든 요소 위에 표시 */
  width: 80%;
  height: 70%;
  display: block;
}

.overlay {
  position: fixed; /* 화면에 고정 */
  top: 40px;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 반투명 배경 */
  z-index: 999; /* 팝업 뒤에 배경 */
}

.preset-container {
  /* flex: 1; */
  resize: none;
  width: 100%;
  height: calc(100% - 140px);
  margin-top: 20px;
  background-color: #1e1f22;
  padding: 10px 5px 5px 5px;
  display: flex;
  flex-direction: column;
}

#menu {
  height: 40px;
  background-color: #1e1f22;
  display: flex;
  align-items: end;
}

.preset-content {
  background-color: #2b2d31;
  height: 100%;
  padding: 20px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preset-content-scroll-zone {
  height: calc(100% - 30px); /* export-and-import 높이를 제외한 나머지 높이 */
  overflow-y: auto;
  padding-right: 10px; /* 스크롤바와 내용 사이의 간격 */
}

.export-and-import {
  display: flex;
  padding-top: 25px;
  justify-content: flex-end;
}

.input-container {
  display: flex;
  justify-content: start;
  align-items: center;
  background-color: #2b2d31;
  height: 50px;
  transition: background-color 0.3s ease;
  padding: 0 10px;
}

.input-container:hover {
  background-color: #2e2f33;
}

.input-box {
  margin-left: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.plus-btn-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2b2d31;
  height: 50px;
}

.mini-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  height: 30px;
  width: 30px;
  background-color: rgba(37, 38, 42, 0.48);
}

.mini-btn:hover {
  background-color: rgba(48, 49, 53, 0.24);
}

.tab {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #2b2d31;
  height: 35px;
  width: 140px;
  border-radius: 0 0 0 0;
  margin-right: 1px;
  padding: 0 10px;
  transition: background-color 0.3s ease;
}

.tab p {
  min-width: 100px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preset-name-input {
  background-color: #1e1f22;
  color: #fff;
  width: 100%;
  border: none;
}

.preset-name-input:focus {
  outline: none;
  border-bottom: 1px solid #4fc1f4;
}

.deactivate {
  color: rgba(246, 246, 246, 0.64);
  background-color: #25262A;
}

.deactivate:hover {
  cursor: pointer;
  color: #fff;
}

#save-btn-container {
  display: flex;
  justify-content: end;
  margin-top: 10px;
}

/* 애니메이션 효과 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>