import { createRouter, createWebHistory } from 'vue-router';
import Home from './../views/Home.vue';
import Setting from './../views/Setting.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/setting',
        name: 'About',
        component: Setting
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 초기 경로를 /로 설정
router.beforeEach((to, from, next) => {
    if (to.path === '/') {
        next();
    } else {
        next(); // 다른 경로로 이동할 경우
    }
});

export default router;