// ─── HOW TO ADD A NEW AI MODEL ──────────────────────────────────────────────────
// 1. Add the model definition to MODEL_REGISTRY below.
//    - id: exact string the API expects
//    - provider: "anthropic" | "openai" | "google"
//    - fill in context window, cost per 1M tokens
//
// 2. Assign it to one or more tasks in TASK_MODEL_MAP.
//    Change the value to the new model's id.
//
// 3. If it's a new provider (not Anthropic):
//    a. Add the API key to .env.example and .env.local
//    b. Add the client in lib/ai/router.ts
//    c. Add a new branch in the API route that calls it
//       (each provider has a different SDK call signature)
//
// 4. Run: npx tsc --noEmit
//    TypeScript will catch any missing task assignments.
//
// EXAMPLE — swapping chat to a new Sonnet version:
//   TASK_MODEL_MAP.chat = "claude-sonnet-4-7";   // one line change
//
// EXAMPLE — adding Gemini for daily focus:
//   MODEL_REGISTRY["gemini-2.0-flash"] = { ... };
//   TASK_MODEL_MAP.daily_focus = "gemini-2.0-flash";

export type Provider = "anthropic" | "openai" | "google";

export type ModelDefinition = {
  id: string;
  provider: Provider;
  displayName: string;
  tier: "fast" | "balanced" | "powerful";
  contextWindow: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
  description: string;
};

export const MODEL_REGISTRY: Record<string, ModelDefinition> = {
  "claude-haiku-4-5-20251001": {
    id: "claude-haiku-4-5-20251001",
    provider: "anthropic",
    displayName: "Claude Haiku 4.5",
    tier: "fast",
    contextWindow: 200_000,
    inputCostPer1M: 1.0,
    outputCostPer1M: 5.0,
    supportsStreaming: true,
    supportsTools: true,
    description: "Fastest model. Use for real-time suggestions, tag autocomplete, quick summaries.",
  },

  "claude-sonnet-4-6": {
    id: "claude-sonnet-4-6",
    provider: "anthropic",
    displayName: "Claude Sonnet 4.6",
    tier: "balanced",
    contextWindow: 200_000,
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    supportsStreaming: true,
    supportsTools: true,
    description: "Best balance of speed and quality. Use for analysis, chat, milestone generation.",
  },

  "claude-opus-4-6": {
    id: "claude-opus-4-6",
    provider: "anthropic",
    displayName: "Claude Opus 4.6",
    tier: "powerful",
    contextWindow: 200_000,
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    supportsStreaming: true,
    supportsTools: true,
    description: "Most capable. Use for strategic review, deep research, cross-idea synthesis.",
  },
};

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
  | "relationship_detection"
  | "embedding";

export const TASK_MODEL_MAP: Record<TaskType, string> = {
  tag_autocomplete: "claude-haiku-4-5-20251001",
  title_polish: "claude-haiku-4-5-20251001",
  voice_transcription: "claude-haiku-4-5-20251001",
  note_summary: "claude-haiku-4-5-20251001",

  full_analysis: "claude-sonnet-4-6",
  milestone_generation: "claude-sonnet-4-6",
  chat: "claude-sonnet-4-6",
  context_restore: "claude-sonnet-4-6",
  relationship_detection: "claude-sonnet-4-6",

  market_research: "claude-opus-4-6",
  daily_focus: "claude-opus-4-6",
  weekly_review: "claude-opus-4-6",

  embedding: "claude-haiku-4-5-20251001",
};

export const TASK_MAX_TOKENS: Record<TaskType, number> = {
  tag_autocomplete: 150,
  title_polish: 60,
  voice_transcription: 600,
  note_summary: 300,
  full_analysis: 2000,
  milestone_generation: 2500,
  chat: 2000,
  context_restore: 1200,
  relationship_detection: 1200,
  market_research: 4000,
  daily_focus: 600,
  weekly_review: 5000,
  embedding: 0,
};

export const WEB_SEARCH_TASKS = new Set<TaskType>(["market_research", "weekly_review"]);

export function getModelForTask(task: TaskType): ModelDefinition {
  const modelId = TASK_MODEL_MAP[task];
  const model = MODEL_REGISTRY[modelId];
  if (!model) throw new Error(`Unknown model "${modelId}" assigned to task "${task}"`);
  return model;
}

export function estimateCostUsd(modelId: string, inputTokens: number, outputTokens: number): number {
  const model = MODEL_REGISTRY[modelId];
  if (!model) return 0;
  const cost =
    (model.inputCostPer1M / 1_000_000) * inputTokens +
    (model.outputCostPer1M / 1_000_000) * outputTokens;
  return parseFloat(cost.toFixed(6));
}

export function getAvailableModels(): ModelDefinition[] {
  return Object.values(MODEL_REGISTRY);
}

export function getModelsByTier(tier: ModelDefinition["tier"]): ModelDefinition[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.tier === tier);
}
