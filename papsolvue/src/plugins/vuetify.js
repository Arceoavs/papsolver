import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    options: {
      customProperties: true
    },
    themes: {
      light: {},
      dark: {
        primary: "#ffd60a",
        accent: "#64d2ff",
        error: "#ff453a",
        info: "#2196F3",
        success: "#8fd158",
        warning: "#ff9f10",
        background: "#1c1c1e",
        dp1: "#1D1D1D",
        dp2: "#222222",
        dp3: "#252525",
        dp4: "#272727",
        dp6: "#2C2C2C",
        dp8: "#2E2E2E",
        dp12: "#323232",
        dp16: "#363636",
        dp24: "#373737",
        high: "#E2E2E2",
        medium: "#A0A0A0",
        low: "#6A6A6A"
      }
    }
  }
});
