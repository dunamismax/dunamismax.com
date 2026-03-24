const WORDS_PER_MINUTE = 230;

export function getReadingTime(content: string): string {
	const text = content.replace(/<[^>]*>/g, "").replace(/```[\s\S]*?```/g, "");
	const words = text.split(/\s+/).filter((w) => w.length > 0).length;
	const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
	return `${minutes} min read`;
}
