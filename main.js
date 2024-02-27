import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import store from './store'
//挂载vuex
Vue.prototype.$store = store
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
    ...App
})
import uView from '@/uni_modules/uview-ui'
import api from "@/common/api"
import {
  request,
  checkAuth,
} from './common/index';
Vue.use(uView)
Vue.prototype.$request = request;
Vue.prototype.$checkAuth = checkAuth;
Vue.prototype.$api = api;

Vue.prototype.$failToast = function (tip = '请求失败,请稍后再试~', icon = 'none') {
  uni.showToast({
    title: tip,
    icon
  })
}
uni.getSystemInfo({
	success(e) {
		Vue.prototype.statusBarHeight = e.statusBarHeight;
		Vue.prototype.platform = e.platform;
	}
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif
