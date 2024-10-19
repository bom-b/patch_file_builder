<script setup>
import {defineEmits} from 'vue';

const emit = defineEmits(['openHelpPage']);

function minimize() {
  window.winAPI.minimize();
}

function maximize() {
  window.winAPI.maximize();
}

function close() {
  window.winAPI.close();
}

function openHelpPage() {
  emit('openHelpPage');
}
</script>

<template>
  <div id="title-div">
    <div class="drag-region">
      <div style="display: flex; align-items: center; justify-content: start;">
        <img src="./../assets/img/icon.png" width="25" style="margin-top: 4px"/>
        <p style="margin-left: 10px; font-size: 14px; color: #949ba4;">반영파일 생성 도우미</p>
      </div>
    </div>
    <div>
      <button class="header-btn" @click="$emit('open-help')"><i class="fa-solid fa-question"></i></button>
      <button class="header-btn" @click="minimize"><i class="fas fa-minus"></i></button>
      <button class="header-btn" @click="maximize"><i class="far fa-square"></i></button>
      <button class="header-btn2" @click="close"><i class="fas fa-x"></i></button>
    </div>
  </div>
</template>

<style scoped>
#title-div {
  background-color: #1e1f22;
  color: white;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 10px;
}

.drag-region {
  -webkit-app-region: drag;
  flex-grow: 1;
}

.header-btn, .header-btn2{
  border: none;
  width: 40px;
  height: 40px;
  background: #1e1f22;
  transition: background-color 0.3s ease;
}

.header-btn:hover {
  background: #2c2e32;
}

.header-btn2:hover {
  background: #f23f42;
}

.header-btn i, .header-btn2 i {
  color: #b5bac1;
}
</style>