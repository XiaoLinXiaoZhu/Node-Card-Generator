import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index';

import './scripts/lib/SketchPad.test';


createApp(App)
    .use(router)
    .mount('#app');
