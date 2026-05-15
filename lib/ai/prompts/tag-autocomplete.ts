export const TAG_SYSTEM_PROMPT = `You suggest relevant tags for ideas. Return a JSON array of strings only. No explanation. Tags should be lowercase, single words or short hyphenated phrases. Max 5 tags.`;

export function buildTagPrompt(partialTitle: string): string {
  return `Suggest up to 5 tags for an idea with this title: "${partialTitle}"

Return JSON array only, e.g.: ["machine-learning", "nlp", "api", "saas", "python"]`;
}
