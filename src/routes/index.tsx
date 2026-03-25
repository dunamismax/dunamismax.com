import { createFileRoute, Link } from "@tanstack/react-router";
import { Head } from "@/components/Head";
import "./index.css";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<>
			<Head
				title="Stephen Sawyer — dunamismax"
				description="Building self-hostable systems software. Python, Go, Rust, and the web. Local-first, operator-friendly, relational data."
			/>
			<div className="home">
				<section className="hero">
					<h1>Stephen Sawyer</h1>
					<p className="tagline">I build self-hostable systems software.</p>
					<p className="stack">
						Most of it lives in <strong>Python</strong>, <strong>Go</strong>, and <strong>Rust</strong>
						, with <strong>React + Vite</strong> on the browser-facing side. Local-first,
						operator-friendly, relational data, single-binary where possible.
					</p>
				</section>

				<nav className="home-nav" aria-label="Quick navigation">
					<Link to="/projects" className="nav-card">
						<span className="nav-card-label">Projects</span>
						<span className="nav-card-desc">What I'm building</span>
					</Link>
					<Link to="/blog" className="nav-card">
						<span className="nav-card-label">Blog</span>
						<span className="nav-card-desc">How I think about it</span>
					</Link>
					<Link to="/about" className="nav-card">
						<span className="nav-card-label">About</span>
						<span className="nav-card-desc">Who I am</span>
					</Link>
					<Link to="/contact" className="nav-card">
						<span className="nav-card-label">Contact</span>
						<span className="nav-card-desc">Get in touch</span>
					</Link>
				</nav>
			</div>
		</>
	);
}
