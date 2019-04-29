import Vue from 'vue'
import Router from 'vue-router'
import cell from '@/components/cell'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'cell',
      component: cell
    }
  ]
})
