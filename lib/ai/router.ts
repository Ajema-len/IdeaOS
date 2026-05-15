import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type TaskType =
  | "tag_autocomplete"
  | "title_polish"
  | "voice_transcription"
  | "note_summary"
  | "full_analysis"
  | "milestone_generation"
  | "chat"
  | "context_restore"
  | "market_research"
  | "daily_focus"
  | "weekly_review"
  | "relationship_detection";

const MODEL_MAP: Record<TaskType, string> = {
  tag_autocomplete:       "claude-3-5-haiku-20241022",
  title_polish:           "claude-3-5-haiku-20241022",
  voice_transcription:    "claude-3-5-haiku-20241022",
  note_summary:           "claude-3-5-haiku-20241022",
  full_analysis:          "claude-3-5-sonnet-20241022",
  milestone_generation:   "claude-3-5-sonnet-20241022",
  chat:                   "claude-3-5-sonnet-20241022",
  context_restore:        "claude-3-5-sonnet-20241022",
  relationship_detection: "claude-3-5-sonnet-20241022",
  market_research:        "claude-3-opus-20250219",
  daily_focus:            "claude-3-opus-20250219",
  weekly_review:          "claude-3-opus-20250219",
};

const MAX_TOKENS_MAP: Record<TaskType, number> = {
  tag_autocomplete:       150,
  title_polish:           60,
  voice_transcription:    600,
  note_summary:           300,
  full_analysis:          2000,
  milestone_generation:   2500,
  chat:                   2000,
  context_restore:        1200,
  relationship_detection: 1200,
  market_research:        4000,
  daily_focus:            600,
  weekly_review:          5000,
};

const WEB_SEARCH_TASKS = new Set<TaskType>(["market_research", "weekly_review"]);

const INPUT_COST_PER_TOKEN: Record<string, number> = {
  "claude-3-5-haiku-20241022":    0.00008,
  "claude-3-5-sonnet-20241022":   0.003,
  "claude-3-opus-20250219":       0.015,
};
const OUTPUT_COST_PER_TOKEN: Record<string, number> = {
  "claude-3-5-haiku-20241022":    0.0004,
  "claude-3-5-sonnet-20241022":   0.015,
  "claude-3-opus-20250219":       0.075,
};

export function getModel(task: TaskType): string {
  return MODEL_MAP[task];
}

export function getMaxTokens(task: TaskType): number {
  return MAX_TOKENS_MAP[task];
}

export function needsWebSearch(task: TaskType): boolean {
  return WEB_SEARCH_TASKS.has(task);
}

export function buildTools(task: TaskType): Anthropic.Tool[] {
  if (!needsWebSearch(task)) return [];
  return [{ type: "web_search_20250305", name: "web_search" } as unknown as Anthropic.Tool];
}

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const inCost = (INPUT_COST_PER_TOKEN[model] ?? 0) * inputTokens;
  const outCost = (OUTPUT_COST_PER_TOKEN[model] ?? 0) * outputTokens;
  return parseFloat((inCost + outCost).toFixed(6));
}

export function parseJsonResponse<T>(raw: string): T {
  const cleaned = raw.replace(/```json\n?|```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
}
