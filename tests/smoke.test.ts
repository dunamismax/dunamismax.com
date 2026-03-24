import { describe, expect, it } from "vitest";
import { categoryLabels, categoryOrder, projects } from "../src/lib/projects";

describe("projects data", () => {
	it("has at least one project", () => {
		expect(projects.length).toBeGreaterThan(0);
	});

	it("every project has required fields", () => {
		for (const p of projects) {
			expect(p.name).toBeTruthy();
			expect(p.tagline).toBeTruthy();
			expect(p.category).toBeTruthy();
			expect(p.status).toBeTruthy();
			expect(p.repo).toMatch(/^https:\/\/github\.com\//);
			expect(p.stack.length).toBeGreaterThan(0);
		}
	});

	it("every category in categoryOrder has a label", () => {
		for (const cat of categoryOrder) {
			expect(categoryLabels[cat]).toBeTruthy();
		}
	});
});
