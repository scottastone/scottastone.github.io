import { parse } from "yaml";
import { z } from "astro/zod";
import { getCollection } from "astro:content";
import profileSource from "../data/profile.yaml?raw";
import siteSource from "../data/site.yaml?raw";

// The shapes of src/data/profile.yaml and src/data/site.yaml. If an edit
// breaks one of these files, the build stops with a message naming the file
// and the field, instead of a confusing error from deep inside a page.

const link = z.object({ label: z.string(), url: z.string() });

const profileSchema = z.object({
  name: z.string(),
  credentials: z.string().nullish(),
  title: z.string(),
  role: z.string().nullish(),
  location: z.string().nullish(),
  email: z.string(),
  tagline: z.string(),
  about: z.string().nullish(),
  experience: z.array(z.object({ role: z.string(), org: z.string(), current: z.boolean().optional() })).default([]),
  links: z.array(link).default([]),
  documents: z.array(link).default([]),
  focus: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
  skills: z.array(z.object({ category: z.string(), items: z.array(z.coerce.string()) })).default([]),
  education: z.array(z.object({ degree: z.string(), school: z.string() })).default([]),
});

const siteSchema = z.object({
  home: z.object({
    publications_shown: z.number().int().min(0).default(4),
    posts_shown: z.number().int().min(0).default(3),
    headings: z
      .object({
        about: z.string().default("About"),
        focus: z.string().default("What I do"),
        publications: z.string().default("Research publications"),
        writing: z.string().default("Writing"),
        background: z.string().default("Background"),
      })
      .default({}),
    contact_button: z.string().default("Get in touch"),
  }).default({}),
  publications: z.object({
    title: z.string().default("Publications"),
    intro: z.string().nullish(),
    description: z.string().nullish(),
  }).default({}),
  writing: z.object({
    title: z.string().default("Writing"),
    intro: z.string().nullish(),
    description: z.string().nullish(),
    empty: z.string().default("Nothing published yet."),
  }).default({}),
});

function load<T extends z.ZodTypeAny>(file: string, source: string, schema: T): z.output<T> {
  let raw: unknown;
  try {
    raw = parse(source);
  } catch (e) {
    throw new Error(`${file} is not valid YAML. ${(e as Error).message}`);
  }
  const result = schema.safeParse(raw ?? {});
  if (!result.success) {
    const problems = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(top level)"}: ${i.message}`)
      .join("\n");
    throw new Error(`${file} has a problem:\n${problems}`);
  }
  return result.data;
}

export const profile = load("src/data/profile.yaml", profileSource, profileSchema);
export const site = load("src/data/site.yaml", siteSource, siteSchema);
export type Profile = typeof profile;

export async function getPublications() {
  const pubs = await getCollection("publications");
  return pubs.sort((a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title));
}

export async function getPosts() {
  const posts = await getCollection("writing", ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
