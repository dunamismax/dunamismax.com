export interface Project {
	name: string;
	tagline: string;
	category: Category;
	status: Status;
	repo: string;
	url?: string;
	stack: string[];
}

export type Category = "apps" | "infrastructure" | "developer-tools" | "reference";

export type Status = "active" | "shipped" | "phase-0" | "legacy";

export const categoryLabels: Record<Category, string> = {
	apps: "Apps",
	infrastructure: "Infrastructure",
	"developer-tools": "Developer Tools",
	reference: "Reference",
};

export const categoryOrder: Category[] = ["apps", "infrastructure", "developer-tools", "reference"];

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
			"Commander intelligence workbench. Decks, collection, pod tracking, matchup journal, and Scryfall integration.",
		category: "apps",
		status: "active",
		repo: "https://github.com/dunamismax/scrybase",
		stack: ["Go", "React", "Vite", "SQLite"],
	},
	{
		name: "Patchworks",
		tagline:
			"Git-style diffs for SQLite databases. Schema, rows, and the SQL to reconcile them. Native desktop app and headless CLI.",
		category: "apps",
		status: "active",
		repo: "https://github.com/dunamismax/patchworks",
		stack: ["Go", "SQLite"],
	},
	{
		name: "bore",
		tagline:
			"Peer-to-peer encrypted file transfer. Direct connections via STUN/hole-punching with Noise XXpsk0 E2E encryption, relay fallback when NAT wins. No accounts, no cloud.",
		category: "infrastructure",
		status: "shipped",
		repo: "https://github.com/dunamismax/bore",
		stack: ["Go", "Noise", "STUN"],
	},
	{
		name: "wirescope",
		tagline:
			"Terminal-first network observability. Live capture, top talkers, DNS context, connection tables, PCAP on disk. Go core with Rust capture backend.",
		category: "infrastructure",
		status: "shipped",
		repo: "https://github.com/dunamismax/wirescope",
		stack: ["Go", "Rust", "SQLite", "PCAP"],
	},
	{
		name: "repokeeper",
		tagline:
			"Self-hosted repo health daemon. Scheduled scans with jitter, doc verification, remote validation, drift detection. One binary, systemd/launchd service files included.",
		category: "developer-tools",
		status: "active",
		repo: "https://github.com/dunamismax/repokeeper",
		stack: ["Go", "SQLite"],
	},
	{
		name: "cargo-compatible",
		tagline:
			"Check whether your resolved dependency graph fits a target Rust version. Lockfile-first, fixes before manifest changes.",
		category: "developer-tools",
		status: "shipped",
		repo: "https://github.com/dunamismax/cargo-compatible",
		stack: ["Rust"],
	},
	{
		name: "cargo-async-doctor",
		tagline: "Catch async Rust bugs that compile fine and pass Clippy but deadlock at 2 AM.",
		category: "developer-tools",
		status: "shipped",
		repo: "https://github.com/dunamismax/cargo-async-doctor",
		stack: ["Rust"],
	},
	{
		name: "rust-async-field-guide",
		tagline:
			"Learn async Rust by breaking things first. Twelve chapters of real footguns, reproductions, and verified fixes.",
		category: "reference",
		status: "shipped",
		repo: "https://github.com/dunamismax/rust-async-field-guide",
		url: "https://dunamismax.github.io/rust-async-field-guide/",
		stack: ["Rust"],
	},
];
