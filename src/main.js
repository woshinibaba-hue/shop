import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

import ('./assets/css/global.css')
import ('./assets/fonts/iconfont.css')

// 配置 axios
import axios from 'axios'
// 将axios挂载到vue原型对象当中，在所有组件就可以进行访问了
Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
