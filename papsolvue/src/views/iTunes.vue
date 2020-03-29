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

    v-form(v-model="valid", 
      @submit.prevent="submit")
      v-row(justify="space-between" align="start")
        v-col(cols=2)
          v-text-field(outlined
              dense
              label="Balance"
              placeholder="0.00"
              v-model="amount"
              :rules="[rules.required]")
        v-spacer
        v-col(cols=1)
          v-btn(color="primary"
            type="submit"
            :disabled="!valid")
            | Solve!
    
    v-row(justify="space-between" no-gutters)
      v-col
        h2.display-1
          | Required purchases
      v-col(cols=3)
        v-select(outlined
          dense
          label="Your country")

    v-row
      v-col
        v-data-table(v-model="selected"
          :headers="headers"
          :items="tiers"
          item-key="tier"
          show-select)

</template>

<script>
import regExpRules from "@/utils/rules";

export default {
  name: "ITunes",
  data() {
    return {
      valid: false,
      amount: null,
      rules: regExpRules,

      selected: [],
      headers: [
        {
          text: "Tier",
          align: "center",
          sortable: false,
          value: "tier"
        },
        { text: "Price", value: "price", align: "center" },
        { text: "Amount", value: "amount", align: "center" },
        { text: "Where to buy?", value: "link", align: "center" }
      ],
      tiers: [
        {
          desc: "tier0",
          price: 99,
          active: true
        },
        {
          desc: "tier1",
          price: 109,
          active: true
        },
        {
          desc: "tier2",
          price: 129,
          active: true
        },
        {
          desc: "tier3",
          price: 229,
          active: true
        }
      ]
    };
  },
  methods: {
    submit() {
      this.$http.post("/solve", {});
    }
  }
};
</script>
