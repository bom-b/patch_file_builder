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
