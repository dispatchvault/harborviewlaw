import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// The news collection is the publishing workflow: one markdown file per
// article in src/content/news/. The article page, every rail (home, news
// index, category pages, practice pages), the sitemap, and llms.txt are
// all generated from it at build time.
const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum([
      "commercial-contracts-and-transactions",
      "corporate-law",
      "general-counsel-news",
      "real-estate",
      "telecommunications",
    ]),
    readTime: z.string().default("3 min"),
    image: z.string(),
    summary: z.string().optional(),
    ogImage: z.string().optional(),
  }),
});

export const collections = { news };
