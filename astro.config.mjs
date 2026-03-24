import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://dunamismax.com",
	output: "static",
	integrations: [sitemap()],
	markdown: {
		shikiConfig: {
			theme: "github-dark-default",
			wrap: true,
		},
	},
});
