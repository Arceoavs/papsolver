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
      light: {
        primary: "#ee44aa",
        secondary: "#424242",
        accent: "#82B1FF",
        error: "#FF5252",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FFC107"
      },
      dark: {
        primary: "#FFC107",
        accent: "#82B1FF",
        error: "#FF5252",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FFC107",
        background: "#121212",
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
