<script setup>
import Title from './components/Header.vue'
import Menu from './components/menu.vue'
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from 'vue-router';

// 도움말 컴포넌트
import MainHelp from './components/help/Main.vue'
import SettingHelp from './components/help/Setting.vue'

const router = useRouter();
const route = useRoute();

onMounted(() => {
  router.push('/');
});

// 도움말 띄우기
const showHelp = ref(false);
const openHelpPage = () => {
  showHelp.value = !showHelp.value;
};

// 도움말 컴포넌트 설정
const getHelpComponent = () => {
  switch (route.path) {
    case '/':
      return MainHelp;
    case '/setting':
      return SettingHelp;
  }
}

</script>

<template>
  <header>
    <Title @open-help="openHelpPage"/>
  </header >
  <Menu/>
  <div id="helpPage" v-if="showHelp">
    <h3 style="margin-bottom: 30px; color: rgba(246, 246, 246, 0.64);">도움말</h3>
    <component :is="getHelpComponent()"/>
  </div>
  <main>
    <router-view/>
  </main>
</template>

<style scoped>
main {
  padding: 20px;
  height: calc(100vh - 80px);
}

#helpPage {
  position: fixed;
  top: 40px;
  left: 0;
  width: 100%;
  height: calc(100vh - 40px);
  z-index: 9999;
  background-color: rgba(30, 31, 34, 0.9);
  backdrop-filter: blur(5px);
  padding: 20px;
  overflow: auto;
}
</style>
