import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";
import { parse } from "yaml";

// Publications don't need an "id": one is made from the title if it's missing.
const slug = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

function parsePublications(text: string) {
  const list = parse(text);
  if (!Array.isArray(list)) throw new Error("src/data/publications.yaml should be a list of entries, each starting with \"- title:\"");
  const seen = new Set<string>();
  return list.map((entry, i) => {
    let id = String(entry?.id ?? slug(`${entry?.title ?? "publication"}-${entry?.year ?? i}`));
    while (seen.has(id)) id += "-2";
    seen.add(id);
    return { ...entry, id };
  });
}

const writing = defineCollection({
  // Files starting with "_" (like _template.md) are ignored.
  loader: glob({ pattern: ["**/*.md", "!**/_*.md"], base: "./src/content/writing" }),
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
  loader: file("src/data/publications.yaml", { parser: parsePublications }),
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
