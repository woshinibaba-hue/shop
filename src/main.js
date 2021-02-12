import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'

import ('./assets/css/global.css')
import ('./assets/fonts/iconfont.css')

// 配置 axios
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 配置 axios 请求拦截器
axios.interceptors.request.use(config => {
  // 为请求头对象，添加 验证 token 的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在此必须返回 config 否则 服务器端接受不到请求
  return config
})

// 将axios挂载到vue原型对象当中，在所有组件就可以进行访问了
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table',TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
