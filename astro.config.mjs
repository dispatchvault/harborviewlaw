// @ts-check
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";

// Staging domain until the production-domain cutover — set PUBLIC_SITE_URL then.
const SITE = process.env.PUBLIC_SITE_URL ?? "https://harborview-law.netlify.app";

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: "static",
  adapter: netlify(),
  integrations: [sitemap()],
});
