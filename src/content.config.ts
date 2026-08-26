import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    image: z.string(),
  }),
});

const practiceAreas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/practice-areas" }),
  schema: z.object({
    title: z.string(),
    lede: z.string(),
    heading: z.string(),
    overview: z.string(),
    pageTitle: z.string(),
    image: z.string(),
    newsCategory: z.string(),
    order: z.number(),
    services: z.array(z.object({ title: z.string(), description: z.string() })),
  }),
});

const policies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/policies" }),
  schema: z.object({
    title: z.string(),
    lede: z.string(),
  }),
});

export const collections = { news, practiceAreas, policies };
