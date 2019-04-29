import Vue from 'vue'
import Router from 'vue-router'
// import Hello from '@/components/Hello'


import replenish from '@/components/replenish/replenish_list'
import Lack from '@/components/replenish/lack'
import Addto from '@/components/replenish/addto'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'replenish',
      component: replenish
    },{
      path: '/lack',
      name: 'lack',
      component: Lack
    },{
      path: '/addto',
      name: 'addto',
      component: Addto
    }
  ]
})
