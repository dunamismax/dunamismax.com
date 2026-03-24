import { useEffect } from "react";

interface HeadProps {
	title: string;
	description: string;
	ogImage?: string;
}

const SITE_URL = "https://dunamismax.com";

export function Head({ title, description, ogImage }: HeadProps) {
	const ogImageUrl = ogImage ? `${SITE_URL}${ogImage}` : `${SITE_URL}/og/default.png`;

	useEffect(() => {
		document.title = title;

		const setMeta = (attr: string, key: string, content: string) => {
			let el = document.querySelector(`meta[${attr}="${key}"]`);
			if (!el) {
				el = document.createElement("meta");
				el.setAttribute(attr, key);
				document.head.appendChild(el);
			}
			el.setAttribute("content", content);
		};

		setMeta("name", "description", description);
		setMeta("property", "og:type", "website");
		setMeta("property", "og:title", title);
		setMeta("property", "og:description", description);
		setMeta("property", "og:url", window.location.href);
		setMeta("property", "og:image", ogImageUrl);
		setMeta("property", "og:site_name", "dunamismax.com");
		setMeta("name", "twitter:card", "summary_large_image");
		setMeta("name", "twitter:title", title);
		setMeta("name", "twitter:description", description);
		setMeta("name", "twitter:image", ogImageUrl);
		setMeta("name", "twitter:site", "@DunamisMax");
	}, [title, description, ogImageUrl]);

	return null;
}
