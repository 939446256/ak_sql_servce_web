import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  server: {
    // 配置前端服务地址和端口
    //服务器主机名
    host: '0.0.0.0',
    //端口号
    port: 8820,
  }
})
