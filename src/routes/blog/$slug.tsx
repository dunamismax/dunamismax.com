import { createFileRoute, Link } from "@tanstack/react-router";
import Markdown from "react-markdown";
import { Head } from "@/components/Head";
import { getPostBySlug } from "@/lib/blog";
import { getReadingTime } from "@/lib/reading-time";
import "./$slug.css";

export const Route = createFileRoute("/blog/$slug")({
	component: BlogPost,
});

function BlogPost() {
	const { slug } = Route.useParams();
	const post = getPostBySlug(slug);

	if (!post) {
		return (
			<div className="not-found">
				<h1>404</h1>
				<p>Post not found.</p>
				<Link to="/blog">← All posts</Link>
			</div>
		);
	}

	const date = new Date(post.date);
	const dateFormatted = date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const readingTime = getReadingTime(post.content);

	return (
		<>
			<Head title={`${post.title} — Stephen Sawyer`} description={post.description} />
			<article className="blog-post">
				<header className="post-header">
					<h1>{post.title}</h1>
					<div className="post-meta">
						<time dateTime={date.toISOString().split("T")[0]}>{dateFormatted}</time>
						<span className="separator">·</span>
						<span className="reading-time">{readingTime}</span>
					</div>
					{post.tags.length > 0 && (
						<div className="post-tags">
							{post.tags.map((tag) => (
								<span key={tag} className="tag">
									{tag}
								</span>
							))}
						</div>
					)}
				</header>

				<div className="post-content">
					<Markdown>{post.content}</Markdown>
				</div>

				<footer className="post-footer">
					<Link to="/blog">← All posts</Link>
				</footer>
			</article>
		</>
	);
}
