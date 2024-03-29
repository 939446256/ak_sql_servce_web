import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/index.css';

import router from './router/router.js'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import { getRequest, postRequest} from "./request.js";

import { ElMessage, ElMessageBox } from 'element-plus'

window.getRequest = getRequest
window.postRequest = postRequest
window.$message = ElMessage
window.ElMessage = ElMessage
window.ElMessageBox = ElMessageBox


// 启用路由
const app = createApp(App)

app.use(router)
    .use(ElementPlus)
    .mount('#app')

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

