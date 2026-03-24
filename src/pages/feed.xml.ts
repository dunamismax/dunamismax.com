import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
	const posts = (await getCollection("blog"))
		.filter((post) => !post.data.draft)
		.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

	const siteUrl = context.site?.toString() ?? "https://dunamismax.com";

	return rss({
		title: "Stephen Sawyer — dunamismax",
		description:
			"Technical writing on systems design, self-hosting, Go, Zig, C, and operational discipline.",
		site: siteUrl,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			link: `/blog/${post.id}`,
		})),
	});
}
