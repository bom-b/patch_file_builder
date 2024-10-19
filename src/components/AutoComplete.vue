<script setup>
import {defineEmits, defineExpose, ref, onMounted, onBeforeUnmount} from "vue";

const emit = defineEmits(['update-input']);

const isVisible = ref(false);
const hoveredItem = ref(null);

const targetInput = ref(null);
const coordinates = ref({left: 0, bottom: 0});
const historyList = ref([]);

function show(coords, target, items) {
  hoveredItem.value = null;
  isVisible.value = true;

  coordinates.value = coords;
  targetInput.value = target;
  historyList.value = items;
}

function sendSelectedItem(item) {
  emit('update-input', targetInput.value, item);
  isVisible.value = false;
}

// 외부 클릭 감지
function handleClickOutside(event) {
  const container = document.querySelector('.item-container');
  if (container && !container.contains(event.target)) {
    isVisible.value = false;
  }
}

// 이벤트 리스너 등록 및 해제
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});



defineExpose({show});
</script>

<template>
  <transition name="fade">
    <div class="item-container" v-if="isVisible"
         :style="{ top: coordinates.bottom + 3 + 'px', left: coordinates.left + 'px' }">
      <div class="item" v-for="item in historyList" :key="item"
           @click="sendSelectedItem(item)"
           @mouseenter="hoveredItem = item"
           @mouseleave="hoveredItem = null">
        <i class="fa-regular fa-clock"></i>
        <p :class="{ 'hovered' : hoveredItem === item }">{{ item }}</p>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.item-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 600px;
  background-color: #35373c;
  cursor: pointer;
  padding: 0;
  border-radius: 5px;
}

.item {
  display: flex;
  align-items: center;
  justify-content: left;
  color: #767676;
  padding: 7px 15px;
}

.item:hover {
  background-color: rgba(10, 83, 190, 0.07);
}

.item i {
  font-size: 14px;
  margin-right: 15px;
}

.item p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: max-width 0.3s ease;
}

.item p.hovered {
  white-space: pre-wrap;
  word-break: break-word;
}

/* 애니메이션 효과 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.05s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>