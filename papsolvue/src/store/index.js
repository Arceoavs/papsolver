import Vue from "vue";
import Vuex from "vuex";

// Modules
import countries from "./countryData/index.js";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    balance: null
  },
  mutations: {
    updateBalance(state, newBalance) {
      state.balance = newBalance;
    }
  },
  actions: {},
  getters: {
    balance: state => state.balance
  },
  modules: {
    countries
  }
});
