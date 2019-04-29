import Vue from 'vue'
import Router from 'vue-router'
import Example from '@/components/example'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Example',
      component: Example
    }
  ]
})
