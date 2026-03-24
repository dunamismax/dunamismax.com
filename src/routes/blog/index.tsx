import { createFileRoute, Link } from "@tanstack/react-router";
import { Head } from "@/components/Head";
import { getPublishedPosts } from "@/lib/blog";
import { getReadingTime } from "@/lib/reading-time";
import "./blog.css";

export const Route = createFileRoute("/blog/")({
	component: BlogIndex,
});

function BlogIndex() {
	const posts = getPublishedPosts();

	return (
		<>
			<Head
				title="Blog — Stephen Sawyer"
				description="Technical writing on systems design, self-hosting, Go, Rust, and operational discipline."
			/>
			<div className="blog-index">
				<h1>Blog</h1>
				<p className="lead">Build logs, systems thinking, craft, and stack philosophy.</p>

				{posts.length === 0 ? (
					<p className="empty">No posts yet. Check back soon.</p>
				) : (
					<ul className="post-list">
						{posts.map((post) => {
							const date = new Date(post.date);
							return (
								<li key={post.slug} className="post-row">
									<div className="post-meta">
										<time dateTime={date.toISOString().split("T")[0]}>
											{date.toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</time>
										<span className="reading-time">{getReadingTime(post.content)}</span>
									</div>
									<Link to="/blog/$slug" params={{ slug: post.slug }} className="post-title">
										{post.title}
									</Link>
									<p className="post-excerpt">{post.description}</p>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</>
	);
}
