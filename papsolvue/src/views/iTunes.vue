<template lang="pug">
v-img(src="../assets/ios.jpg"
  gradient="0.25turn, rgba(0,0,0,1) 15%, rgba(0,0,0,0)"
  height="100%")

  v-container
    v-row
      v-col
        h1.display-2.font-weight-bold
          | iTunes balance
        p.mt-1.font-weight-light.title
          | How much do you want to bring down?
    
    v-row(justify="start")
      v-col#inputPane(cols=12 sm=6)
        v-form(v-model="valid", 
          @submit.prevent="submit")
          v-row(justify="start" align="start" no-gutters)
            v-col(cols=12 md=10)
              v-text-field(outlined
                  prepend-inner-icon="mdi-cash"
                  label="Balance"
                  placeholder="0.00"
                  v-model="balance"
                  :rules="[rules.required, rules.decimal]")
            v-col(cols=12 md=10)
              v-autocomplete(outlined
                prepend-inner-icon="mdi-earth"
                label="Your country"
                :items="countries"
                item-text="name"
                item-value="id"
                v-model="country"
                :rules="[rules.required]")
            v-col(cols=12 md=10 align="start")
              v-select(outlined
                prepend-inner-icon="mdi-tag-multiple"
                multiple
                small-chips
                :items="tiers"
                item-text="price.full"
                item-value="desc"
                v-model="selectedTiers"
                label="Pricing tiers (€)"
                :rules="[rules.required]")          

          v-row(justify="start" align="center")
            v-col(cols=6 md=5 align="start")
              v-btn(large
                  color="info"
                  @click="selectAllTiers")
                  | All pricing tiers!
            v-col(cols=6 md=5 align="end")
              v-btn(large
                color="success"
                type="submit"
                :disabled="!valid || !selectedTiers.length")
                | Solve!

      v-col#resultPane(sm=6 cols=12)
        v-row(justify="space-between" no-gutters)
          v-col
            h2.display-1.font-weight-bold
              | Required purchases
        v-row
          v-col
            #noResultYet(v-if="!iTunesSolution")
              p.title.font-weight-light
                | Please enter your balance first!
            #showResults(v-else)
              p.title.font-weight-light 
                | You have to buy:
              v-chip.ma-1(v-for="solution in iTunesSolution"
                color="primary"
                outlined)
                v-avatar.primary.darken-4(left)
                  | {{solution.value}}
                | {{solution.price.full}}€
                
</template>

<script>
import regExpRules from "@/utils/rules";
import { mapGetters } from "vuex";

export default {
  name: "Itunes",
  data() {
    return {
      valid: false,
      rules: regExpRules
    };
  },
  computed: {
    ...mapGetters(["countries", "tiers", "iTunesSolution"]),
    balance: {
      get() {
        return this.$store.getters.balance;
      },
      set(value) {
        return this.$store.commit("updateBalance", value);
      }
    },
    country: {
      get() {
        return this.$store.getters.currentCountry;
      },
      set(value) {
        this.$store.dispatch("updateCurrentCountryById", value);
      }
    },
    selectedTiers: {
      get() {
        return this.$store.getters.selectedTiers;
      },
      set(value) {
        this.$store.dispatch("matchDescriptionsOfSelectedTiers", value);
      }
    }
  },
  async mounted() {
    console.log();
  },
  methods: {
    selectAllTiers() {
      this.$store.commit("updateSelectedTiers", this.tiers);
    },
    submit() {
      this.$store.dispatch("solveItunes");
    }
  }
};
</script>
