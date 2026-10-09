// @ts-check
import { defineConfig } from "astro/config";

// Static mirror build for Vercel. The mirrored pages carry their own
// canonical/og URLs (www.harborviewlaw.com), matching the live site.
export default defineConfig({
  output: "static",
});
