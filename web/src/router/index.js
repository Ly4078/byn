import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/ready/login'
import Home from '@/components/system/homepage'
import Welcome from '@/components/system/welcome'
import role_list from '@/components/system/role/role_list'
import per_list from '@/components/system/permission/per_list'
import user_list from '@/components/system/user/user_list'
import area_list from '@/components/system/hotel/area/area_list'
import goods_list from '@/components/system/goods/goods_list'
import store_list from '@/components/system/goods/store/store_list'
import storelog_list from '@/components/system/goods/storelog/storelog_list'
import supplier_list from '@/components/system/goods/supplier/supplier_list'
import equip_list from '@/components/system/goods/equip/equip_list'
import FirstEquipList from '@/components/system/goods/equip/FirstEquipList'
import room_list from '@/components/system/hotel/room/room_list'
import hotel_list from '@/components/system/hotel/hotel_list'
import stock_list from '@/components/system/order/stock/stock_list'
import replenish_list from '@/components/system/apply/replenish/replenish_list'
import queryOrderSummary from '@/components/system/order/goods/queryOrderSummary'
import supply_list from '@/components/system/order/supply/supply_list'
import goods_lsit from '@/components/system/order/stock/goods_list'
import order_list from '@/components/system/order/goods/order_list'
import opendoor from '@/components/system/order/door/openDoor'
import getActivityList from '@/components/system/activity/getActivityList'
import apply_list from '@/components/system/apply/apply_list'
import apply_part from '@/components/system/apply/apply_part'
import apply_log from '@/components/system/apply/apply_log'
import apply_warning from '@/components/system/apply/apply_warning'
import operation from '@/components/system/operation/operation_list'
import operation_part from '@/components/system/operation/operation_part'
import operation_log from '@/components/system/operation/operation_log'
import SuperLog from '@/components/system/operation/superLog'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/', //登录页面
      name: 'Login',
      component: Login
    },{
      path: '/Home',  //系统页面
      name: 'Home',
      component: Home,
      children: [
        {
          path:"/",   
          component:Welcome
        },
        {
          path:"/role/list",   
          component:role_list
        },{
          path:"/permission/list",
          component:per_list
        },{
          path:"/user/list",
          component:user_list
        },{
          path:"/hotel/area/list",
          component:area_list
        },{
          path:"/goods/list",
          component:goods_list
        },{
          path:"/goods/store/list",
          component:store_list
        },{
          path:"/goods/storelog/list",
          component:storelog_list
        },{
          path:"/goods/supplier/list",
          component:supplier_list
        },{
          path:"/goods/equip/list",
          component:equip_list
        },{
          path:"/goods/equip/FirstEquipList",
          component:FirstEquipList
        },{
          path:"/hotel/room/list",
          component:room_list
        },{
          path:"/hotel/list",
          component:hotel_list
        },{
          path:"/order/stock/list",
          component:stock_list
        },{
          path:"/apply/replenish/list",
          component:replenish_list
        },{
          path:"/order/door",
          component:opendoor
        },{
          path:"/order/goods/queryOrderSummary",
          component:queryOrderSummary
        },{
          path:"/order/supply/list",
          component:supply_list
        },{
          path:"/order/stock/goods",
          component:goods_lsit
        },{
          path:"/order/goods/list",
          component:order_list
        },{
          path:"/activity/getActivityList",
          component:getActivityList
        },{
          path:"/apply/list",
          component:apply_list
        },{
          path:"/apply/part",
          component:apply_part
        },{
          path:"/apply/log",
          component:apply_log
        },{
          path:"/apply/warning",
          component:apply_warning
        },{
          path:"/operation/list",
          component:operation
        },{
          path:"/operation/part",
          component:operation_part
        },{
          path:"/operation/log",
          component:operation_log
        },{
          path:"/operation/superLog",
          component:SuperLog
        }
      ]
    }
  ]
})
