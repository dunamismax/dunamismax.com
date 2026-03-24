import { describe, expect, it } from "vitest";
import { getPostBySlug, getPublishedPosts } from "../src/lib/blog";
import { categoryLabels, categoryOrder, projects } from "../src/lib/projects";
import { getReadingTime } from "../src/lib/reading-time";

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

describe("blog data", () => {
	it("has at least one published post", () => {
		expect(getPublishedPosts().length).toBeGreaterThan(0);
	});

	it("can retrieve a post by slug", () => {
		const post = getPostBySlug("hello-world");
		expect(post).toBeDefined();
		expect(post?.title).toBe("Building this site");
	});

	it("returns undefined for unknown slug", () => {
		expect(getPostBySlug("nonexistent")).toBeUndefined();
	});
});

describe("reading time", () => {
	it("returns at least 1 min for short content", () => {
		expect(getReadingTime("Hello world")).toBe("1 min read");
	});

	it("calculates reasonable reading time for longer content", () => {
		const longText = "word ".repeat(460);
		expect(getReadingTime(longText)).toBe("2 min read");
	});
});
