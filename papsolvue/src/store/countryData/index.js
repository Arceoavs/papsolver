import dataDE from "./de.json";

export default {
  state: {
    currentCountry: { id: "de", name: "Germany", tier_data: dataDE },
    countries: [
      { id: "de", name: "Germany", tier_data: dataDE },
      { id: "us", name: "USA", tier_data: null },
      { id: "gb", name: "Great Britain", tier_data: null }
    ],
    selectedTiers: []
  },
  mutations: {
    updateSelectedTiers(state, newTiers) {
      state.selectedTiers = newTiers;
    },
    updateCurrentCountry(state, newCountry) {
      state.currentCountry = newCountry;
    }
  },
  actions: {
    matchDescriptionsOfSelectedTiers({ commit, state }, newTierDescriptions) {
      // The multiple select only returns the descriptions
      // Thus we have to find the mathching object to keep the state consistent
      let selected = [];
      newTierDescriptions.forEach(desc => {
        const matches = state.currentCountry.tier_data.find(
          tier => tier.desc === desc
        );
        selected.push(matches);
      });
      commit("updateSelectedTiers", selected);
    }
  },
  getters: {
    countries: state => state.countries,
    currentCountry: state => state.currentCountry,
    tiers: state => state.currentCountry.tier_data,
    selectedTiers: state => state.selectedTiers
  }
};
