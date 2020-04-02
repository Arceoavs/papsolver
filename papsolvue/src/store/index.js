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
  actions: {
    async solveItunes({ commit, getters }) {
      const http = Vue.prototype.$http;

      const tiers = getters.selectedTiers;
      const target = getters.target;
      try {
        const res = await http.post("/solve", { tiers, target });
        commit("setiTunesSolution", res.data);
      } catch (err) {
        // TODO error handling
        console.log(err);
      }
    }
  },
  getters: {
    balance: state => state.balance,
    // ensuring the correct target format
    target: state => parseFloat(state.balance) * 100
  },
  modules: {
    countries
  }
});
