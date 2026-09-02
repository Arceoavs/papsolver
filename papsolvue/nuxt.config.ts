export default defineNuxtConfig({
  compatibilityDate: "2026-09-02",
  devtools: { enabled: false },
  ssr: true,

  css: ["~/styles.css"],

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "CentMatch",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Find the smallest combination of available prices that exactly matches a remaining balance.",
        },
        { name: "theme-color", content: "#071216" },
      ],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },

  nitro: {
    preset: "static",
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: ["/", "/solve", "/about", "/imprint", "/privacy"],
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
