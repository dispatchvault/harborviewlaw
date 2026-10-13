// Shared helpers for the markdown-driven news system.
import fs from "node:fs";
import path from "node:path";
import { getCollection, type CollectionEntry } from "astro:content";

export const BASE = "https://www.harborviewlaw.com";

export const CATEGORY_NAMES: Record<string, string> = {
  "commercial-contracts-and-transactions": "Commercial Contracts & Transactions",
  "corporate-law": "Corporate Law",
  "general-counsel-news": "General Counsel News",
  "real-estate": "Real Estate",
  "telecommunications": "Telecommunications",
};

export type Post = CollectionEntry<"news">;

export async function allPosts(): Promise<Post[]> {
  const posts = await getCollection("news");
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function template(name: string): string {
  return fs.readFileSync(
    path.resolve(process.cwd(), "src/templates", name),
    "utf8"
  );
}

export function escText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
export function escAttr(s: string): string {
  return escText(s).replace(/"/g, "&quot;");
}

export function dateDisplay(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function fillCard(tpl: string, p: Post): string {
  return tpl
    .replaceAll("{{URL}}", `/news/${p.id}`)
    .replaceAll("{{TITLE}}", escText(p.data.title))
    .replaceAll("{{TITLE_ATTR}}", escAttr(p.data.title))
    .replaceAll("{{IMG}}", p.data.image)
    .replaceAll("{{CAT}}", escText(CATEGORY_NAMES[p.data.category]))
    .replaceAll("{{RT}}", escText(p.data.readTime))
    .replaceAll("{{SUMMARY}}", escText(p.data.summary ?? p.data.description));
}

const RAIL_RE = /\{\{RAIL:([a-z-]+):([a-z]+)(?:=([a-z-]+))?:(\d+)\}\}/g;

/** Replace {{RAIL:template:mode[:param]:N}} markers with generated cards. */
export function fillRails(html: string, posts: Post[]): string {
  return html.replace(RAIL_RE, (_m, tplName, mode, param, n) => {
    let list = posts;
    if (mode === "cat") list = posts.filter((p) => p.data.category === param);
    list = list.slice(0, Number(n));
    const tpl = template(tplName + ".html");
    return list.map((p) => fillCard(tpl, p)).join("");
  });
}

/** Build-time footer year, applied to every emitted page. */
export function stampYear(html: string): string {
  return html.replace(
    /© \d{4} Harbor View Law/g,
    `© ${new Date().getFullYear()} Harbor View Law`
  );
}
