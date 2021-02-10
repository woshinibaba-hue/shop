import Vue from 'vue'
import { Button ,Form, FormItem, Input, Row, Message} from 'element-ui'

Vue.use(Button)
Vue.use(Input)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Row)
// 弹窗提示需要挂载到 vue 的 prototype  原型对象上
Vue.prototype.$message = Message
