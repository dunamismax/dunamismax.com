import { Link } from "@tanstack/react-router";
import "./Layout.css";

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<a href="#main-content" className="skip-link">
				Skip to content
			</a>

			<nav className="site-nav" aria-label="Main navigation">
				<div className="nav-inner">
					<Link to="/" className="nav-logo">
						dunamismax
					</Link>
					<ul className="nav-links">
						<li>
							<Link to="/">Home</Link>
						</li>
						<li>
							<Link to="/projects">Projects</Link>
						</li>
						<li>
							<Link to="/blog">Blog</Link>
						</li>
						<li>
							<Link to="/about">About</Link>
						</li>
					</ul>
				</div>
			</nav>

			<main id="main-content">{children}</main>

			<footer className="site-footer">
				<div className="footer-inner">
					<p className="footer-text">Stephen Sawyer · Building self-hostable systems software.</p>
					<ul className="footer-links">
						<li>
							<a href="mailto:dunamismax@tutamail.com" rel="me">
								Email
							</a>
						</li>
						<li>
							<a href="https://github.com/dunamismax" target="_blank" rel="noopener noreferrer me">
								GitHub
							</a>
						</li>
						<li>
							<a href="https://x.com/DunamisMax" target="_blank" rel="noopener noreferrer me">
								Twitter
							</a>
						</li>
						<li>
							<Link to="/contact">Contact</Link>
						</li>
						<li>
							<a href="/feed.xml">RSS</a>
						</li>
					</ul>
				</div>
			</footer>
		</>
	);
}
