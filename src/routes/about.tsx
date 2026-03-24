import { createFileRoute } from "@tanstack/react-router";
import { Head } from "@/components/Head";
import "./about.css";

export const Route = createFileRoute("/about")({
	component: About,
});

function About() {
	return (
		<>
			<Head
				title="About — Stephen Sawyer"
				description="Who I am, what I care about, and the stack philosophy behind everything I build."
			/>
			<article className="about">
				<h1>About</h1>

				<p>
					I'm Stephen Sawyer. I build self-hostable systems software — the kind of tools that run on
					your hardware, store data you can actually inspect, and don't phone home.
				</p>

				<p>
					Most of my work is in <strong>Go</strong> and <strong>Rust</strong>. Browser-facing
					surfaces use <strong>React</strong> and <strong>Vite</strong>. I reach for{" "}
					<strong>SQLite</strong> by default and move to PostgreSQL only when the product clearly
					earns it.
				</p>

				<h2>What I care about</h2>

				<p>
					<strong>Ownership.</strong> If you can't run it yourself, you don't own it. Every product
					I build is designed to run on a single machine under your control.
				</p>

				<p>
					<strong>Boring infrastructure.</strong> Novel architecture is a liability until proven
					otherwise. I want the system that wakes nobody up at 3am, not the one that looks
					impressive on a whiteboard.
				</p>

				<p>
					<strong>The data layer is the truth layer.</strong> Relational data, explicit schema,
					query paths you can inspect. If you can't trace a value through the system, it's too
					clever.
				</p>

				<p>
					<strong>Shipping beats planning.</strong> A working system you iterate on outranks a
					perfect design doc. Complexity must be earned — every abstraction needs justification
					beyond "might be useful someday."
				</p>

				<h2>The stack</h2>

				<p>
					Go for services, daemons, CLIs, APIs, and most application logic. Rust for native
					runtimes, auditable boundary work, capture paths, custody code, and shared-core systems
					tools.
				</p>

				<p>
					On the browser side: React with Vite, TanStack Router, TanStack Query, shadcn/ui, and Zod.
					TypeScript in strict mode, Biome for formatting and lint.
				</p>

				<p>
					This site runs on the same React + Vite stack — TanStack Router for type-safe routing,
					Tailwind CSS for styling, and the same dark, minimal aesthetic across everything I ship.
				</p>
			</article>
		</>
	);
}
