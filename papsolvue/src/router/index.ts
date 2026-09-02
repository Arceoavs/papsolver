import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/Landing.vue"),
      meta: { title: "PapSolver — Welcome" },
    },
    {
      path: "/itunes",
      name: "itunes",
      component: () => import("../views/Itunes.vue"),
      meta: { title: "iTunes balance — PapSolver" },
    },
    {
      path: "/general",
      name: "general",
      component: () => import("../views/Prepaid.vue"),
      meta: { title: "Generic prepaid — PapSolver" },
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/About.vue"),
      meta: { title: "About — PapSolver" },
    },
    {
      path: "/imprint",
      name: "imprint",
      component: () => import("../views/legal/Imprint.vue"),
      meta: { title: "Imprint — PapSolver" },
    },
    {
      path: "/privacy",
      name: "privacy",
      component: () => import("../views/legal/Privacy.vue"),
      meta: { title: "Privacy — PapSolver" },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/errors/NotFound.vue"),
      meta: { title: "Page not found — PapSolver" },
    },
  ],
});

router.afterEach((to) => {
  document.title = (to.meta.title as string | undefined) ?? "PapSolver";
});

export default router;
