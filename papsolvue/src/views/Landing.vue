<template lang="pug">
v-img(src="../assets/landing.jpg"
  gradient="0.25turn, rgba(0,0,0,1) 40%, rgba(0,0,0,0)"
  height="100%")
  v-container
    v-row
      v-col(sm="6" cols="10")
        v-row.mt-10(justify="start")
          v-col
            //- md and up
            .hidden-sm-and-down.glow-text
              h1.display-2
                span.font-weight-black P
                | ap
                span.font-weight-black S
                | olver

            //- sm
            h1.display-1.hidden-md-and-up.hidden-xs-only
              span.font-weight-black P
              | ap
              span.font-weight-black S
              | olver
             
            //- xs
            h1.headline.hidden-sm-and-up
              span.font-weight-black P
              | ap
              span.font-weight-black S
              | olver

        v-row(justify="start")
          v-col
            p.font-weight-light.text-justify
              | This highly sophisticated piece of software leverages 
              | linear optimization methods and cloud-native technologies 
              | (just AWS, really!) to calculate what you have to buy in order 
              | to eliminate any remaining prepaid balance!
            p.font-weight-light.text-justify
              | Originally used to let my dad change the country in the iTunes store.

        v-row.pt-4(justify="start")
          v-col
            VueTypedJs(:strings="moneyStrings")
              span.typing.display-1.font-weight-light
        

        v-row.pt-2(justify="start")
          v-col
            p.title What do you want to eliminate?

        v-row.pa-3(justify="start")
          v-col(cols=6 align="center")
            v-btn.glow-yellow(x-large 
              color="primary"
              outlined
              :to="{name: 'iTunes'}")
              | iTunes balance

        v-row.pa-3(justify="start")
          v-col(cols=6 align="center")
            v-btn.glow-white(x-large 
            color="white"
              outlined
              :to="{name: 'General'}")
              | Prepaid Balance

</template>

<script>
import { VueTypedJs } from "vue-typed-js";

export default {
  name: "Landing",
  components: { VueTypedJs },
  props: {
    showLogin: { type: Boolean, default: false },
    showRegister: { type: Boolean, default: false }
  },
  data() {
    return {
      moneyStrings: [
        "Balance: 6,85€",
        "Balance: 4,56€",
        "Balance: 3,27€",
        "Balance: 1,98€",
        "Balance: 0,99€",
        "Balance: 0,00€"
      ]
    };
  }
};
</script>

<style>
.glow-text {
  -webkit-animation: glow 5s ease-in-out infinite alternate;
  -moz-animation: glow 5s ease-in-out infinite alternate;
  animation: glow 5s ease-in-out infinite alternate;
}

@-webkit-keyframes glow {
  from {
    text-shadow: 0 0 5px #fff, 0 0 3px #fff, 0 0 5px #64d2ff;
  }

  to {
    text-shadow: 0 0 5px #fff, 0 0 3px #effc41, 0 0 5px #64d2ff;
  }
}

.glow-yellow {
  /* make it glow! */
  box-shadow: 0px 0px 15px #effc41 !important; /* some variation of blue for the shadow */
}
.glow-white {
  /* make it glow! */
  box-shadow: 0px 0px 15px #64d2ff !important; /* some variation of blue for the shadow */
}
</style>
