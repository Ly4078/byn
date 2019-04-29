import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const state = {
    count: 0,
    hotelId: "",
    openid: "",
    actgoodslist: []
}

const mutations = {
    actgoodslist(state, data) {
        state.actgoodslist = data;
    },
    sethotelId(state, data) {
        state.hotelId = data;
    },
    setcount(state, data) {
        state.count = data;
    },
    setopenid(state, data) {
        state.openid = data;
    }
}

export default new Vuex.Store({
    state,
    mutations
})