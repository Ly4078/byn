
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './cell.vue'

import router from './router'
import Vuex from 'vuex'
Vue.use(Vuex)
import store from './store/store'

import AxiosPlugin from '../../assets/js/AxiosPlugin'
Vue.use(AxiosPlugin)

import GLOBAL from '../../assets/js/config';
Vue.prototype.$GLOBAL = GLOBAL;

import 'lib-flexible'

import md5 from 'js-md5';
Vue.prototype.$md5 = md5;

import 'mint-ui/lib/style.css'

import "../../assets/css/reset.css";
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
