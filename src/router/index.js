import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 使用路由懒加载
const login = () => import('../components/login/login')
const Home = () => import('../components/home/Home')
const Welcome = () => import('../components/welcome/Welcome')
const Users = () => import('../components/home/user/Users')
const Rights = () => import('../components/home/rights/Rights')
const Roles = () => import('../components/home/rights/Roles')
const Cate = () => import('../components/home/goods_cate/Cate')
const Params = () => import('../components/home/goods_params/Params')

const routes = [
  {
    path : '',
    redirect : '/login'
  },
  {
    path : '/login',
    component : login
  },
  {
    path : '/home',
    component : Home,
    redirect : '/welcome',
    children : [
      {
        path : '/welcome',
        component : Welcome
      },
      {
        path : '/users',
        component : Users
      },
      {
        path : '/rights',
        component : Rights
      },
      {
        path : '/roles',
        component : Roles
      },
      {
        path : '/categories',
        component : Cate
      },
      {
        path : '/params',
        component : Params
      }
    ]
  },
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to,form,next) => {
  /*
    to 表示的是 访问的路径
    form 表示的是 从哪个路径而来
    next 放行  
    有两种调用方式  next() 放行   next('/login') 强制跳转
  */
  // 如果访问的是 登录页面直接放行
 if (to.path === '/login') return next()
  // 获取 token
  const tokenStr = window.sessionStorage.getItem('token')
  // 判断 token 是否存在
  // 当 token 不存在时，直接 return 强制跳转到登录页
  if (!tokenStr) return next('/login')
  // 当 token 存在 放行
  next()
})

export default router
