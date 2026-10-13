import rss from "@astrojs/rss";
import { getPosts, profile } from "../lib/data";

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: `${profile.name}: Writing`,
    description: profile.tagline,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/writing/${post.id}/`,
    })),
  });
}
