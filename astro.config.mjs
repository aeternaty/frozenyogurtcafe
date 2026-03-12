import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://frozenyogurtcafe.com",
  build: {
    inlineStylesheets: "always",
  },
  integrations: [sitemap(), tailwind()],
});
