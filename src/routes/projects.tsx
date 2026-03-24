import { createFileRoute } from "@tanstack/react-router";
import { Head } from "@/components/Head";
import {
	type Category,
	categoryLabels,
	categoryOrder,
	type Project,
	projects,
	statusLabels,
} from "@/lib/projects";
import "./projects.css";

export const Route = createFileRoute("/projects")({
	component: Projects,
});

function Projects() {
	const grouped = categoryOrder.reduce<{ category: Category; label: string; items: Project[] }[]>(
		(acc, cat) => {
			const items = projects.filter((p) => p.category === cat);
			if (items.length > 0) {
				acc.push({ category: cat, label: categoryLabels[cat], items });
			}
			return acc;
		},
		[],
	);

	return (
		<>
			<Head
				title="Projects — Stephen Sawyer"
				description="Active project roster. Self-hostable systems software in Go, Rust, Zig, and the web."
			/>
			<div className="projects-page">
				<h1>Projects</h1>
				<p className="lead">
					Everything is self-hostable, local-first, and designed to run on hardware you control.
				</p>

				{grouped.map((group) => (
					<section key={group.category} className="category-group">
						<h2>{group.label}</h2>
						<ul className="project-list">
							{group.items.map((project) => (
								<li key={project.name} className="project-card">
									<div className="project-header">
										<h3 className="project-name">{project.name}</h3>
										<span className={`status-badge status-${project.status}`}>
											{statusLabels[project.status]}
										</span>
									</div>
									<p className="project-tagline">{project.tagline}</p>
									<div className="project-meta">
										<div className="project-stack">
											{project.stack.map((tech) => (
												<span key={tech} className="tech-tag">
													{tech}
												</span>
											))}
										</div>
										<a
											href={project.repo}
											target="_blank"
											rel="noopener noreferrer"
											className="repo-link"
										>
											repo →
										</a>
									</div>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</>
	);
}
