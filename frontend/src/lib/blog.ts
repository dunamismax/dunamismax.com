export const WORDS_PER_MINUTE = 230

export function getReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))

  return `${minutes} min read`
}
