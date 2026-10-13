// llms.txt generated at build time from a base template plus the news
// collection, so new markdown posts are listed automatically.
import { allPosts, template, BASE } from "../lib/news";

export async function GET() {
  const posts = await allPosts();
  const news = posts
    .map((p) => `- [${p.data.title}](${BASE}/news/${p.id})`)
    .join("\n");
  const body = template("llms-base.txt").replace("{{NEWS}}", news);
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
