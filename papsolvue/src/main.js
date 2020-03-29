import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import API from "./services/http";

Vue.config.productionTip = false;
Vue.prototype.$http = API;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
