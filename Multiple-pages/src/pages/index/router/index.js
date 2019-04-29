import Vue from 'vue'
import Router from 'vue-router'
// import Hello from '@/components/Hello'

import goods_list from '@/components/goods/goods_list'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: goods_list
    }
  ]
})
