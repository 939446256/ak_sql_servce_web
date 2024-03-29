import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'

// 静态路由表
const routes = [
    {
        // 路由重定向配置npm install pdfjs-dist@3.4.120npm install pdfjs-dist@3.4.120
        path: '/',
        component: () => import('../../pages/home.vue')
    }, {
        path: '/saveTable',
        component: () => import('../../pages/saveTable.vue')
    }, {
        path: '/associative',
        component: () => import('../../pages/associative.vue')
    }
]

// 路由对象
const router = createRouter({
    history: createWebHashHistory("/"),
    routes
})

export default router