import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

const writing = defineCollection({
  loader: glob({ pattern: ["**/*.md"], base: "./src/content/writing" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

const publications = defineCollection({
  loader: file("src/data/publications.yaml"),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    venue: z.string(),
    url: z.string().url().optional(),
    pdf: z.string().optional(),
    authors: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = { writing, publications };
