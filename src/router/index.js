import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
/** 导入组件路径**/
Vue.use(VueRouter)

const routes = [
  /** 路径映射**/
  { path: '/', component: Login },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{ path: '/welcome', component: Welcome }]
  }
]

const router = new VueRouter({
  routes
})

//  挂载路由守卫
router.beforeEach((to, from, next) => {
//  to代表要访问的路径
//  form代表从哪个路径来
//  next是一个函数表示放行
//  next() 放行 next('/login') 强制跳转
  if (to.path === '/login') return next()
  //  获取token
  const tokenStr = sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
