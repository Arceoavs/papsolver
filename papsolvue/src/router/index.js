import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () =>
      import(/* webpackChunkName: "landing" */ "../views/Landing.vue"),
    meta: {
      title: "Papsolver - Welcome!"
    }
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
    meta: {
      title: "Papsolver - About"
    }
  },
  {
    path: "/imprint",
    name: "Imprint",
    component: () =>
      import(/* webpackChunkName: "imprint" */ "../views/legal/Imprint.vue"),
    meta: {
      title: "Papsolver - Imprint"
    }
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () =>
      import(/* webpackChunkName: "privacy" */ "../views/legal/Privacy.vue"),
    meta: {
      title: "Papsolver - Privacy"
    }
  },
  {
    path: "/terms",
    name: "Terms",
    component: () =>
      import(/* webpackChunkName: "terms" */ "../views/legal/Terms.vue"),
    meta: {
      title: "Papsolver - Terms"
    }
  },
  {
    path: "/iTunes",
    name: "iTunes",
    component: () =>
      import(/* webpackChunkName: "itunes" */ "../views/iTunes.vue"),
    meta: {
      title: "iTunes Balance"
    }
  },
  {
    path: "/general",
    name: "General",
    component: () =>
      import(/* webpackChunkName: "general" */ "../views/Prepaid.vue"),
    meta: {
      title: "Generic Prepaid"
    }
  },
  {
    path: "*",
    name: "404",
    component: () =>
      import(/* webpackChunkName: "error" */ "../views/errors/404.vue"),
    meta: {
      title: "Page not found!"
    }
  }
];

const router = new VueRouter({
  mode: "history",
  routes
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || process.env.VUE_APP_TITLE;
  next();
});

export default router;
