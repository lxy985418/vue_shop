import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
/** 在这导入我们所写的css**/
import './assets/fonts/iconfont.css'
/** 导入字体样式**/
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
Vue.prototype.$http = axios
/** //配置请求根路径**/
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = sessionStorage.getItem('token')
  return config
})
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
