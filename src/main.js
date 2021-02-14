import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'

import ('./assets/css/global.css')
import ('./assets/fonts/iconfont.css')
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css' 
import 'quill/dist/quill.bubble.css'

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

// 将富文本编辑器注册为全局组件
Vue.use(VueQuillEditor)

// 处理时间过滤器
Vue.filter('dateFormat',function(origin) {
  const date = new Date(origin)

  let y = date.getFullYear()
  let m = (date.getMonth() + 1 + '').padStart(2,'0')
  let d = (date.getDay() + '').padStart(2,'0')

  let hh = (date.getHours() + '').padStart(2,'0')
  let mm = (date.getMinutes() + '').padStart(2,'0')
  let ss = (date.getSeconds() + '').padStart(2,'0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
