import dataDE from "./de.json";

export default {
  state: {
    currentCountry: { id: "de", name: "Germany", tier_data: dataDE },
    countries: [
      { id: "de", name: "Germany", tier_data: dataDE },
      { id: "us", name: "USA", tier_data: null },
      { id: "gb", name: "Great Britain", tier_data: null }
    ],
    selectedTiers: [],
    iTunesSolution: null
  },
  mutations: {
    setiTunesSolution(state, sol) {
      state.iTunesSolution = sol;
      console.log(state.iTunesSolution);
    },
    updateSelectedTiers(state, newTiers) {
      state.selectedTiers = newTiers;
    },
    updateCurrentCountry(state, newCountry) {
      // reset pricing tiers of old country
      state.selectedTiers = [];
      state.currentCountry = newCountry;
    }
  },
  actions: {
    updateCurrentCountryById({ commit, getters }, newCountryId) {
      const newCountry = getters.countries.find(
        country => country.id === newCountryId
      );
      commit("updateCurrentCountry", newCountry);
    },
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
    selectedTiers: state => state.selectedTiers,
    /**
     * returns the solution from the backend
     * and adds the price field for display later
     */
    iTunesSolution: state => {
      if (!state.iTunesSolution) return null; // null case

      let solution = [];
      const assignment = state.iTunesSolution.assignment;
      assignment.forEach(sol => {
        if (sol.value) {
          const solutionTier = { ...sol };
          const matchingTier = state.selectedTiers.find(
            t => t.desc === sol.tier
          );
          solutionTier.price = matchingTier.price;
          solution.push(solutionTier);
        }
      });
      return solution;
    }
  }
};
