<script setup>
import Title from './components/Header.vue'
import Menu from './components/menu.vue'
import {onMounted, ref} from "vue";
import { useRouter } from 'vue-router';
import Swal from "sweetalert2";

const router = useRouter();

const updateAvailable = ref(false);
const updateDownloaded = ref(false);

onMounted(() => {
  router.push('/');

  checkForUpdate();

  window.winAPI.updateAvailable(() => {
    updateAvailable.value = true;
    showUpdateAlert();
  });
  window.winAPI.updateNotAvailable(() => {
    updateAvailable.value = false;

  });
  window.winAPI.updateDownloaded(() => {
    updateDownloaded.value = true;
  });
});

function checkForUpdate() {
  window.winAPI.checkForUpdate();
}

function installUpdate(){
  window.winAPI.quitAndInstall();
}

function showUpdateAlert() {
  Swal.fire({
    showClass: {
      popup: ''
    },
    hideClass: {
      popup: ''
    },
    allowOutsideClick: false,
    allowEscapeKey: false,
    text: '새 업데이트가 있습니다.',
    confirmButtonText: '업데이트 설치',
    preConfirm: () => {
      installUpdate();
    }
  });
}

</script>

<template>
  <header>
    <Title/>
  </header>
  <Menu/>
  <main>
    <router-view/>
  </main>
</template>

<style scoped>
main {
  padding: 20px;
  height: calc(100vh - 80px);
}
</style>
