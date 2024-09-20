<script setup>
import Title from './components/Header.vue'
import Menu from './components/menu.vue'
import {onMounted} from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();
onMounted(() => {
  router.push('/');
});

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
