<script setup>
import {onMounted, onBeforeUnmount, ref} from 'vue';
import PopUp from '../components/HomePopup.vue'
import AutoComplete from '../components/AutoComplete.vue'
import Swal from 'sweetalert2';
import {
  extractVal,
  appendInputHistory,
  getLastValueFromInputHistory,
  getAllValueFromInputHistory
} from "@/assets/js/common";

let userSettings = [];

const projectPath = ref('');
const projectPathHistory = ref([]);
const copyPath = ref('');
const copyPathHistory = ref([]);

const refs = {
  projectPath,
  copyPath
};

// 파일경로들
const filePaths = ref(JSON.parse(localStorage.getItem('filePaths')) || {});
// 존재하지 않는 파일들
const notExistsPaths = ref([]);

// 경로 보기 모드
const selectedPathMode = ref('original');

const popupRef = ref(null);
const autoCompleteRef = ref(null);

onMounted(() => {
  getAllSettings();
});

// 컴포넌트가 해제될 때 localStorage에 저장
onBeforeUnmount(() => {
  localStorage.setItem('filePaths', JSON.stringify(filePaths.value));
  appendInputHistory('project_path', projectPath.value);
  appendInputHistory('copy_path', copyPath.value);
});

// 파일 경로 추가 팝업 열기
function openPopup() {
  if (projectPath.value.length < 1) {
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
  window.sqlAPI.getAllSettings().then(settings => {
    userSettings = settings;

    projectPath.value = getSettingsValue(userSettings, 'project_path');
    copyPath.value = getSettingsValue(userSettings, 'copy_path');

    projectPathHistory.value = getAllValueFromInputHistory('project_path');
    copyPathHistory.value = getAllValueFromInputHistory('copy_path');
  });
}

function getSettingsValue(userSettings, settingsKey) {
  const dbValue = extractVal(userSettings, 'id', settingsKey);
  const localstorageValue = getLastValueFromInputHistory(settingsKey);
  return localstorageValue === null ? dbValue : localstorageValue;
}

function setProjectPath() {
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

// 파일 업로드 팝업으로부터 받은 경로들을 통해 GUI 업데이트
async function updateFilePath(filePathList) {

  // 경로변경설정 가져오기
  const usersPreset = await window.sqlAPI.getUsersPreset();

  // 존재하지 않는 파일 목록 초기화
  notExistsPaths.value = [];

  filePathList.sort();
  filePathList.forEach((path) => {

    // 작업 프로젝트 경로와 파일 경로를 비교하기 위해 경로 구분자 통일
    const replacedProjectPath = projectPath.value.replace(/\\/g, '/');
    path = path.replace(/\\/g, '/');

    // 전체경로와 작업프로젝트 경로를 제외한 경로 구하기
    let subPath;
    let fullPath;
    if (path.includes(replacedProjectPath)) {
      subPath = path.replace(replacedProjectPath, '');
      fullPath = path;
    } else {
      subPath = path;
      fullPath = replacedProjectPath + path;
    }

    // 확장자 구하기
    const extName = subPath.substring(subPath.lastIndexOf('.') + 1);

    // 경로변경설정대로 변환된 경로 구하기
    let convertPath = subPath;
    usersPreset.forEach((preset) => {
      convertPath = convertPath.replace(preset.before_val, preset.after_val);
    })

    // 필요시 설명 추가
    let description = getDescription(path);

    // 경로 하나에 대한 정보
    const newElement = {use: true, path: subPath, convertPath: convertPath, fullPath: fullPath, desc: description};

    if (filePaths.value[extName]) {
      filePaths.value[extName].forEach((element) => {
        if (element.fullPath === newElement.fullPath) { // 중복된 파일이면 추가하지 않음
          return;
        }
        filePaths.value[extName].push(newElement);
      });
    } else {
      filePaths.value[extName] = [newElement];
    }
  });
  localStorage.setItem('filePaths', JSON.stringify(filePaths.value));
}

// 파일 경로에서 파일명만 추출
function getFileName(filePath) {
  return filePath.split(/[/\\]/).pop();
}

// 파일에 대한 설명 추가
function getDescription(path) {
  let description = null;
  const fileName = getFileName(path);
  if (fileName.endsWith('.class') && fileName.includes('$')) {
    description = '[ 내부 클래스 ]';
  }
  return description;
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
  if (copyPath.value.length < 1) {
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

  if (Object.keys(filePaths.value).length < 1) {
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
  window.sqlAPI.updateSettings(params).then((result) => {
    console.log("변경완료! : " + result);
  });
  appendInputHistory('project_path', projectPath.value);
  appendInputHistory('copy_path', copyPath.value);
}

function showAutoComplete(element, target, items) {
    const rect = element.getBoundingClientRect();
    const coordinates = {
      left: rect.left,   // 왼쪽 좌표
      bottom: rect.bottom // 아래쪽 좌표
    };
    autoCompleteRef.value.show(coordinates, target, items);
}

function updateInput(target, item) {
  refs[target].value = item;
}

</script>

<template>
  <div style="display: block; height: 100%;">

    <div>
      <h4 style="margin-bottom: 10px; color: rgba(246, 246, 246, 0.64);">경로 설정</h4>
      <div class="form-wrapper">
        <label for="project-path" style="">작업 프로젝트 경로 : </label>
        <input id="project-path"
               @focus="(event) => showAutoComplete(event.target, 'projectPath', projectPathHistory)"
               v-model="projectPath"
               class="form-control2" style="margin-left: 20px; width: 600px;"/>
        <button class="btn-setting" style="margin-left: 5px;" @click="setProjectPath()">폴더 선택</button>
        <!-- <div class="help-icon">
          <p>?</p>
        </div> -->
      </div>
      <div class="form-wrapper">
        <label for="copy-path" style="">파일을 복사할 경로 : </label>
        <input id="copy-path"
               @focus="(event) => showAutoComplete(event.target, 'copyPath', copyPathHistory)"
               v-model="copyPath" class="form-control2"
               style="margin-left: 20px; width: 600px;">
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
          <div class="folder-container">
            <!--<i class="fa-solid fa-chevron-down"></i>-->
            <input class="file-use" type="checkbox" checked style="margin-right: 5px;"
                   @click="fileUseToggle(fileType, $event)">
            <i class="fa-regular fa-folder fa-lg"></i>
            <p class="folder-name">{{ fileType }}</p>
          </div>
          <div :id="fileType + '-folder'">
            <div class="file" v-for="file in files" :key="file.path">
              <input class="file-use" type="checkbox" v-model="file.use" style="margin-right: 10px;">
              <span class="path-text" v-if="selectedPathMode === 'original'" :class="file.use? '' : 'not-use-file'">
                {{ file.path }}</span>
              <span class="path-text" v-if="selectedPathMode === 'changed'" :class="file.use? '' : 'not-use-file'">
                {{ file.convertPath }}</span>
              <span class="path-desc" v-if="file.desc !== null">
                {{ file.desc }}
              </span>
            </div>
          </div>
        </div>

        <div class="files-container" v-if="notExistsPaths.length > 0">
          <div class="folder-container">
            <i class="fa-regular fa-folder fa-lg darkred"></i>
            <p class="folder-name darkred">존재하지 않는 파일이 있습니다. 목록을 확인해 주세요.</p>
          </div>
          <div>
            <div class="file" v-for="path in notExistsPaths" :key="path">
              <p class="path-text darkred">{{ path }}</p>
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
  <AutoComplete ref="autoCompleteRef" @update-input="updateInput" />
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

#list-menu1 div {
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

.file {
  display: flex;
  height: 27px;
  padding-left: 30px;
}

.file:hover {
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

.path-text {
  white-space: nowrap;
  -webkit-user-select: text;
}

.path-desc {
  color: rgba(246, 246, 246, 0.64);
  margin-left: 15px;
}

</style>