import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const state = {
    actgoodslist:[]
}

const mutations={
    actgoodslist(state, data) {
        state.actgoodslist = data;
    }
}

export default new Vuex.Store({
    state,
    mutations
})