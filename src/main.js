import './assets/css/bootstrap.min.css'
import './assets/css/all.min.css'
import './assets/css/global-style.css'
import router from './router'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App);
app.use(router);

/*app.config.warnHandler = (msg, vm, trace) => {
    // 아무것도 하지 않음으로써 경고 메시지를 무시
};*/

app.mount('#app');


