<script setup>
import {onMounted, onBeforeUnmount, ref} from 'vue';
import PopUp from '../components/HomePopup.vue'
import Swal from 'sweetalert2';

let userSettings = [];

const projectPath = ref('');
const copyPath = ref('');

// 파일경로들
const filePaths = ref(JSON.parse(localStorage.getItem('filePaths')) || {});
// 존재하지 않는 파일들
const notExistsPaths = ref([]);

// 경로 보기 모드
const selectedPathMode = ref('original');

const popupRef = ref(null);

onMounted(() => {
  getAllSettings();
});

// 컴포넌트가 해제될 때 localStorage에 저장
onBeforeUnmount(() => {
  localStorage.setItem('filePaths', JSON.stringify(filePaths.value));
});

// 파일 경로 추가 팝업 열기
function openPopup() {
  if(projectPath.value.length < 1) {
    Swal.fire({
      showClass: {
        popup: ''
      },
      hideClass: {
        popup: ''
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      text: '작업 프로젝트 경로를 입력해 주세요.',
      confirmButtonText: '확인'
    });
    return;
  }
  if (popupRef.value) {
    popupRef.value.showPopUp();
  }
}

function getAllSettings() {
  window.slqAPI.getAllSettings().then(settings => {
    userSettings = settings;
    projectPath.value = extractVal(userSettings, 'id', 'project_path');
    copyPath.value = extractVal(userSettings, 'id', 'copy_path');
  })
}

// SQL로 가져온 데이터에서 키로 값 추출하는 함수
function extractVal(dataList, key, keyVal) {
  const found = dataList.find(data => data[key] === keyVal);
  return found? found.value : null;
}

function setprojectPath() {
  window.fileAPI.openFolder().then((path) => {
    if (path) {
      projectPath.value = path; // 선택한 경로를 입력 필드에 설정
    }
  });
}

function setCopyPath() {
  window.fileAPI.openFolder().then((path) => {
    if (path) {
      copyPath.value = path; // 선택한 경로를 입력 필드에 설정
    }
  });
}

async function updateFilePath(filePathList) {
  // 경로변경설정 가져오기
  const usersPreset = await window.slqAPI.getUsersPreset();
  // 존재하지 않는 파일 목록 초기화
  notExistsPaths.value = [];
  filePathList.sort();
  filePathList.forEach((path) => {
    const subPath = path.replace(projectPath.value, '').replace(/\\/g, '/');
    const extName = subPath.substring(subPath.lastIndexOf('.') + 1);

    // 경로변경설정대로 변환
    let convertPath = subPath;
    usersPreset.forEach((preset) => {
      convertPath = convertPath.replace(preset.before_val, preset.after_val);
    })

    const newElement = {use: true, path: subPath, convertPath: convertPath, fullPath: path};

    if (filePaths.value[extName]) {
      filePaths.value[extName].push(newElement);
    } else {
      filePaths.value[extName] = [newElement];
    }
  });
  localStorage.setItem('filePaths', JSON.stringify(filePaths.value));
}

function filePathsClear() {
  filePaths.value = {};
  notExistsPaths.value = [];
}

function fileUseToggle(fileType, event) {
  const isChecked = event.target.checked;
  filePaths.value[fileType].forEach(javaPath => {
    javaPath.use = isChecked;
  });
}

function makePatchFile() {
  if(copyPath.value.length < 1) {
    Swal.fire({
      showClass: {
        popup: ''
      },
      hideClass: {
        popup: ''
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      text: '파일을 복사할 경로를 입력해 주세요.',
      confirmButtonText: '확인'
    });
    return;
  }

  if(Object.keys(filePaths.value).length < 1) {
    Swal.fire({
      showClass: {
        popup: ''
      },
      hideClass: {
        popup: ''
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      text: '파일 경로를 한 개 이상 추가해 주세요.',
      confirmButtonText: '확인'
    });
    return;
  }

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

  window.fileAPI.makePatchFile(copyPath.value, JSON.stringify(filePaths.value)).then((newNotExistsPaths) => {
    filePaths.value = {};
    localStorage.removeItem('filePaths');
    notExistsPaths.value = newNotExistsPaths;
    Swal.close();
  });

  // 경로설정 저장
  const params = [
    {id: 'project_path', value: projectPath.value},
    {id: 'copy_path', value: copyPath.value}
  ];
  window.slqAPI.updateSettings(params).then((result) => {
    console.log("변경완료! : " + result);
  });
}
</script>

<template>
  <div style="display: block; height: 100%;">

    <div>
      <h4 style="margin-bottom: 10px; color: rgba(246, 246, 246, 0.64);">경로 설정~~</h4>
      <div class="form-wrapper">
        <label for="project-path" style="">작업 프로젝트 경로 : </label>
        <input id="project-path" v-model="projectPath" class="form-control2" style="margin-left: 20px; width: 600px;">
        <button class="btn-setting" style="margin-left: 5px;" @click="setprojectPath()">폴더 선택</button>
      </div>
      <div class="form-wrapper">
        <label for="copy-path" style="">파일을 복사할 경로 : </label>
        <input id="copy-path" v-model="copyPath" class="form-control2" style="margin-left: 20px; width: 600px;">
        <button class="btn-setting" style="margin-left: 5px;" @click="setCopyPath()">폴더 선택</button>
      </div>
      <div class="form-wrapper" style="margin-top: 40px;">
        <button class="btn-setting" style="margin-left: 0;" @click="openPopup()">파일 경로 추가</button>
        <button class="btn-setting" style="margin-left: 10px;" @click="filePathsClear()">파일 경로 초기화</button>
      </div>
    </div>

    <div id="list">

      <div id="list-menu1">
        <div>
          <input type="radio" value="original" v-model="selectedPathMode" style="margin-right: 5px;">
          <p>원본 경로 보기</p>
        </div>
        <div>
          <input type="radio" value="changed" v-model="selectedPathMode" style="margin-right: 5px;">
          <p>변경될 경로 보기</p>
        </div>
      </div>

      <div id="file-list">

        <div class="files-container" v-for="(files, fileType) in filePaths" :key="fileType">
          <div class="folder-container" >
            <!--<i class="fa-solid fa-chevron-down"></i>-->
            <input class="file-use" type="checkbox" checked style="margin-right: 5px;" @click="fileUseToggle(fileType, $event)">
            <i class="fa-regular fa-folder fa-lg"></i>
            <p class="folder-name">{{ fileType }}</p>
          </div>
          <div :id="fileType + '-folder'">
            <div class="file" v-for="file in files" :key="file.path">
              <input class="file-use" type="checkbox" v-model="file.use" style="margin-right: 10px;">
              <p v-if="selectedPathMode === 'original'" :class="file.use? '' : 'not-use-file'">{{ file.path }}</p>
              <p v-if="selectedPathMode === 'changed'" :class="file.use? '' : 'not-use-file'">{{ file.convertPath }}</p>
            </div>
          </div>
        </div>

        <div class="files-container" v-if="notExistsPaths.length > 0">
          <div class="folder-container" >
            <i class="fa-regular fa-folder fa-lg darkred"></i>
            <p class="folder-name darkred">존재하지 않는 파일이 있습니다. 목록을 확인해 주세요.</p>
          </div>
          <div>
            <div class="file" v-for="path in notExistsPaths" :key="path">
              <p class="darkred">{{ path }}</p>
            </div>
          </div>
        </div>

      </div>


    </div>

    <div class="mt-2" style="display: flex; align-items: flex-end; justify-content: space-between;">
      <div>
        <p id="message"></p>
      </div>
      <div>
        <button class="btn-signature" @click="makePatchFile">반영파일 생성</button>
      </div>
    </div>
  </div>
  <PopUp ref="popupRef" @update-file-path="updateFilePath"/>
</template>

<style scoped>

#list {
  height: calc(100% - 240px);
  max-height: 100%;
  background-color: #1e1f22;
}

#file-list {
  height: calc(100% - 30px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
}

#list-menu1 {
  display: flex;
  background-color: rgba(0, 0, 0, 0.13);
  height: 30px;
  align-items: center;
  justify-content: end;
}

#list-menu1 div{
  display: flex;
  padding: 0 10px;
  color: rgba(246, 246, 246, 0.64);
}

#list-menu2 {
  display: flex;
  background-color: rgba(0, 0, 0, 0.13);
  height: 30px;
  align-items: center;
  padding: 0 10px;
}

.files-container {
  margin-bottom: 20px;
}

.folder-container {
  display: flex;
  align-items: center;
  justify-content: start;
}

.file{
  display: flex;
  height: 27px;
  padding-left: 30px;
}

.file:hover{
  background-color: rgba(10, 83, 190, 0.07);
}

.file-use {
  accent-color: #3f48cc;
}

.fa-folder {
  color: #ff7f27;
  margin-left: 10px;
}

.folder-name {
  color: #ff7f27;
  margin-left: 10px;
}

#no-file {
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(246, 246, 246, 0.64);
}

.not-use-file {
  color: rgba(246, 246, 246, 0.45);
}

</style>