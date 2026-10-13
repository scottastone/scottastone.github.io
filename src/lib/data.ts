import { parse } from "yaml";
import { getCollection } from "astro:content";
import profileSource from "../data/profile.yaml?raw";

export interface Profile {
  name: string;
  credentials?: string;
  title: string;
  role?: string;
  location?: string;
  email: string;
  tagline: string;
  about?: string;
  links: { label: string; url: string }[];
  documents: { label: string; url: string }[];
  focus: { title: string; text: string }[];
  skills: { category: string; items: string[] }[];
  education: { degree: string; school: string }[];
  experience?: { role: string; org: string; current?: boolean }[];
}

export const profile = parse(profileSource) as Profile;

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
