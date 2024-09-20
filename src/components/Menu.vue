<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const isActive = (path) => {
  return route.path === path;
};
</script>

<template>
  <div id="menu">
    <router-link to="/">
      <div :class="['tab', { deactivate: !isActive('/') }]">
        <p>시작</p>
      </div>
    </router-link>
    <router-link to="/setting">
      <div :class="['tab', { deactivate: !isActive('/setting') }]">
        <p>환경설정</p>
      </div>
    </router-link>
  </div>
</template>

<style scoped>
#menu {
  height: 40px;
  background-color: #1e1f22;
  display: flex;
  align-items: end;
  padding-left: 5px;
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
</style>