export interface Project {
	name: string;
	tagline: string;
	category: Category;
	status: Status;
	repo: string;
	url?: string;
	stack: string[];
}

export type Category = "apps" | "infrastructure" | "security" | "developer-tools" | "systems";

export type Status = "active" | "shipped" | "phase-0" | "legacy";

export const categoryLabels: Record<Category, string> = {
	apps: "Apps",
	infrastructure: "Infrastructure",
	security: "Security",
	"developer-tools": "Developer Tools",
	systems: "Systems",
};

export const categoryOrder: Category[] = [
	"apps",
	"infrastructure",
	"security",
	"developer-tools",
	"systems",
];

export const statusLabels: Record<Status, string> = {
	active: "Active",
	shipped: "Shipped",
	"phase-0": "Phase 0",
	legacy: "Legacy",
};

export const projects: Project[] = [
	{
		name: "Scrybase",
		tagline:
			"Local-first Commander intelligence for decks, collection tracking, and real pod meta.",
		category: "apps",
		status: "active",
		repo: "https://github.com/dunamismax/scrybase",
		stack: ["Go", "Astro", "Alpine.js", "SQLite"],
	},
	{
		name: "0xvane",
		tagline: "Local-first algorithmic trading workbench for signals, risk control, and execution.",
		category: "apps",
		status: "active",
		repo: "https://github.com/dunamismax/0xvane",
		stack: ["Go", "Astro", "Alpine.js", "SQLite"],
	},
	{
		name: "bore",
		tagline: "Privacy-first file transfer with a payload-blind relay.",
		category: "infrastructure",
		status: "active",
		repo: "https://github.com/dunamismax/bore",
		stack: ["Go", "Astro", "Alpine.js", "Noise", "ChaCha20-Poly1305"],
	},
	{
		name: "wirescope",
		tagline: "Terminal-first network observability with durable metadata and raw PCAP retention.",
		category: "infrastructure",
		status: "active",
		repo: "https://github.com/dunamismax/wirescope",
		stack: ["Go", "C", "SQLite", "PCAP"],
	},
	{
		name: "vaultd",
		tagline: "Local HSM-style daemon with a C core and a Go control plane.",
		category: "security",
		status: "active",
		repo: "https://github.com/dunamismax/vaultd",
		stack: ["C", "Go", "Astro", "Alpine.js"],
	},
	{
		name: "repokeeper",
		tagline:
			"Self-hosted repo health daemon for doc verification, remote validation, and drift detection.",
		category: "developer-tools",
		status: "active",
		repo: "https://github.com/dunamismax/repokeeper",
		stack: ["Go", "Astro", "Alpine.js", "SQLite"],
	},
	{
		name: "gitpulse",
		tagline:
			"Local-first git activity analytics with separate ledgers for live work, commits, and pushes.",
		category: "developer-tools",
		status: "active",
		repo: "https://github.com/dunamismax/gitpulse",
		stack: ["Go", "Astro", "Alpine.js", "SQLite"],
	},
];
