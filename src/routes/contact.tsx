import { createFileRoute } from "@tanstack/react-router";
import { Head } from "@/components/Head";
import "./contact.css";

export const Route = createFileRoute("/contact")({
	component: Contact,
});

const channels = [
	{
		label: "Email",
		href: "mailto:dunamismax@tutamail.com",
		display: "dunamismax@tutamail.com",
	},
	{
		label: "Signal",
		href: "https://signal.me/#eu/ohSycFRzUEPZzCEifM1UVelp9pdBfmOPoSHItfUsK1PqosRCQSBBEIsqRq2krmph",
		display: "Signal",
	},
	{
		label: "GitHub",
		href: "https://github.com/dunamismax",
		display: "dunamismax",
	},
	{
		label: "Twitter",
		href: "https://x.com/DunamisMax",
		display: "@DunamisMax",
	},
	{
		label: "Reddit",
		href: "https://www.reddit.com/user/DunamisMax/",
		display: "u/DunamisMax",
	},
];

function Contact() {
	return (
		<>
			<Head
				title="Contact — Stephen Sawyer"
				description="How to reach Stephen Sawyer. Email, Signal, GitHub, Twitter, Reddit."
			/>
			<div className="contact">
				<h1>Contact</h1>
				<p className="lead">Best way to reach me is email or Signal. I read everything.</p>

				<ul className="channels">
					{channels.map((ch) => (
						<li key={ch.label} className="channel">
							<span className="channel-label">{ch.label}</span>
							<a
								href={ch.href}
								target={ch.label === "Email" ? undefined : "_blank"}
								rel={ch.label === "Email" ? undefined : "noopener noreferrer"}
							>
								{ch.display}
							</a>
						</li>
					))}
				</ul>
			</div>
		</>
	);
}
