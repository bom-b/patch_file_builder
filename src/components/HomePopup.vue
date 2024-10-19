<script setup>
import {ref, defineExpose, defineEmits} from 'vue';
import Swal from "sweetalert2";

const emit = defineEmits(['update-file-path']);

const isVisible = ref(false);
const filePaths = ref('');

function showPopUp() {
  isVisible.value = true;
}

function hidePopUp() {
  isVisible.value = false;
}

//경로 추가후 경로 탐색
function submit(){
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
  const paths = filePaths.value.split('\n').map(path => path.trim()).filter(path => path);
  window.fileAPI.findClassFile(paths).then((result) => {
    if (result === "err1") {
      Swal.fire({
        //showConfirmButton: false,
        showClass: {
          popup: ''
        },
        hideClass: {
          popup: ''
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        text: '설정하신 class 파일 경로가 실제로 존재하지 않습니다.',
        confirmButtonText: '확인'
      });
    } else {
      filePaths.value = '';
      emit('update-file-path', result);
      isVisible.value = false;
      Swal.close();
    }
  });
}

defineExpose({showPopUp});
</script>

<template>
  <div class="overlay" @click="hidePopUp()" v-if="isVisible">
  </div>
  <transition name="fade">
    <div id="popup" v-if="isVisible">
      <div>
        <p style="margin-bottom: 20px; font-weight: bold;">파일 경로 추가</p>
        <p style="color: rgba(246, 246, 246, 0.64);">줄바꿈으로 복사할 파일의 경로를 추가할 수 있습니다.</p>
        <p style="color: rgba(246, 246, 246, 0.64);">경로구분자는 <span style="color: #ff7f27;">/</span>, <span style="color: #ff7f27;">\</span> 모두 사용 가능합니다.</p>
      </div>
      <textarea class="form-control" id="path-input" name="text" spellcheck="false" v-model="filePaths"
                style="flex: 1; resize: none; width: 100%; height: 100%; margin-top: 20px;"></textarea>
      <div style="display: flex; justify-content: end; margin-top: 10px;">
        <button class="btn-signature" @click="submit">추가</button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
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
  width: 70%;
  height: 60%;
  display: flex;
  flex-direction: column;
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

/* 애니메이션 효과 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>