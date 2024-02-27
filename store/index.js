import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    userInfo: {},
    token: '',
    config: {
      site_title: ''
    },
    num: 0,
    main_model: {},
    models: []
  },
  mutations: {
    login(state, userInfo) {
      state.userInfo = userInfo;
      state.num = userInfo.num;
      state.token = userInfo.token;
    },
    syncUserInfo(state, userInfo) {
      state.userInfo = userInfo;
      state.num = userInfo.num;
    },
    syncUserNum(state, num) {
      state.num = num;
    },
    useNum(state, num) {
      state.num = state.num - num;
    },
    logout(state) {
      state.userInfo = {}
      state.token = ''
      state.num = 0
    },
    setConfig(state, config) {
      state.config = config.data
      state.main_model = config.main_model
      state.models = config.models
    },
    wxH5SetToken(state, token) {
      state.token = token
    }
  }
})

export default store
