<script setup>
import {ref, defineExpose, defineEmits } from 'vue';
import Swal from "sweetalert2";

const emit = defineEmits(['update-preset-index']);

const isVisible = ref(false);
const filePaths = ref('');

const activeTabIndex = ref(0);
const inputContainers = ref([[],[],[]]);

function showPopUp() {
  isVisible.value = true;

  // 프리셋에 대해 초기화
  inputContainers.value = [[],[],[]];
  window.slqAPI.getAllPreset().then((result) => {
    result.forEach((preset) => {
      inputContainers.value[preset.id].push({ id: preset.id, before_val: preset.before_val, after_val: preset.after_val });
    })
  });
}

function hidePopUp() {
  isVisible.value = false;
}

function setActiveTab(index) {
  activeTabIndex.value = index;
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
  const presets = JSON.parse(JSON.stringify(inputContainers.value));
  window.slqAPI.insertPreset(presets).then((result) => {
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
          <div :class="['tab', { deactivate: !isActive(0) }]" @click="setActiveTab(0)">
            <p>프리셋1</p>
          </div>
          <div :class="['tab', { deactivate: !isActive(1) }]" @click="setActiveTab(1)">
            <p>프리셋2</p>
          </div>
          <div :class="['tab', { deactivate: !isActive(2) }]" @click="setActiveTab(2)">
            <p>프리셋3</p>
          </div>
        </div>

        <div id="preset-0" v-if="isActive(0)" class="preset-content">
          <div v-for="(container, index) in inputContainers[0]" :key="index" class="input-container">
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

        <div id="preset-1" v-if="isActive(1)" class="preset-content">
          <div v-for="(container, index) in inputContainers[1]" :key="index" class="input-container">
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

        <div id="preset-2" v-if="isActive(2)" class="preset-content">
          <div v-for="(container, index) in inputContainers[2]" :key="index" class="input-container">
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
  //flex: 1;
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
  overflow-y: auto;
  padding: 25px 15px 15px 15px;
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
  width: 100px;
  border-radius: 0 0 0 0;
  margin-right: 1px;
  transition: background-color 0.3s ease;
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