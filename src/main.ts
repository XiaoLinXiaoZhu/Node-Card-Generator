import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index';

import { ElementTree } from './scripts/nodes/elementTree';


createApp(App)
    .use(router)
    .mount('#app');
