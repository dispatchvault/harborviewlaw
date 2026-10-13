// Sitemap generated at build time: static mirror pages + the news
// collection, so new markdown posts appear automatically.
import fs from "node:fs";
import path from "node:path";
import { allPosts, BASE } from "../lib/news";

export async function GET() {
  const pages: string[] = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "src/raw/_pages.json"), "utf8")
  );
  const urls = pages
    .filter((p) => p !== "/__404__")
    .map((p) => BASE + (p === "/" ? "" : p));
  for (const post of await allPosts()) {
    urls.push(`${BASE}/news/${post.id}`);
  }
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls
      .sort()
      .map((u) => `<url><loc>${u}</loc></url>`)
      .join("") +
    "</urlset>\n";
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
