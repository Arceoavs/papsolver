<template lang="pug">
v-img(src="../assets/background.jpg"
  gradient="0.5turn, rgba(0,0,0,1) 33%, rgba(0,0,0,0)"
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
                  :rules="[rules.required]")
            v-col(cols=12 md=10)
              v-select(outlined
                prepend-inner-icon="mdi-earth"
                label="Your country"
                :items="countries"
                item-text="name"
                v-model="country"
                :rules="[rules.required]")
            v-col(cols=10 md=10 align="start")
              v-select(outlined
                prepend-inner-icon="mdi-tag-multiple"
                multiple
                chips
                :items="tiers"
                item-text="price.full"
                item-value="desc"
                v-model="selectedTiers"
                label="Pricing tiers (€)")            

          v-row(justify="start" align="center")
            v-col(cols=5 align="start")
              v-btn(large
                  color="info"
                  @click="selectAllTiers")
                  | All pricing tiers!
            v-col(cols=5 align="end")
              v-btn(large
                color="primary"
                type="submit"
                :disabled="!valid")
                | Solve!

      v-col#resultPane(sm=6 cols=12)
        v-row(justify="space-between" no-gutters)
          v-col
            h2.display-1
              | Required purchases
        v-row
          v-col
            #noResultYet(v-if="!solution")
            p.title.font-weight-light
              | Please enter your balance first!
</template>

<script>
import regExpRules from "@/utils/rules";
import { mapGetters } from "vuex";

export default {
  name: "Itunes",
  data() {
    return {
      valid: false,
      rules: regExpRules,

      solution: null
    };
  },
  computed: {
    ...mapGetters(["countries", "tiers"]),
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
        this.$store.commit("updateCurrentCountry", value);
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
  methods: {
    selectAllTiers() {
      this.$store.commit("updateSelectedTiers", this.tiers);
    },
    submit() {
      this.$http.post("/solve", {});
    }
  }
};
</script>
