export default defineNuxtConfig({
  compatibilityDate: "2026-09-02",
  devtools: { enabled: false },
  ssr: true,

  css: ["~/styles.css"],

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "PapSolver",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Find an exact combination of purchases for a remaining prepaid balance.",
        },
      ],
      link: [{ rel: "icon", href: "/favicon.ico" }],
    },
  },

  nitro: {
    preset: "static",
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: ["/", "/itunes", "/general", "/about", "/imprint", "/privacy"],
    },
  },

  typescript: {
    strict: true,
  },

  vite: {
    server: {
      proxy: {
        "/api": {
          target: process.env.NUXT_API_PROXY_TARGET ?? "http://localhost:8000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  },
});
