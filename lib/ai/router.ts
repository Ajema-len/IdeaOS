import Anthropic from "@anthropic-ai/sdk";
import {
  getModelForTask,
  estimateCostUsd,
  TASK_MAX_TOKENS,
  WEB_SEARCH_TASKS,
  type TaskType,
} from "./models";

export type { TaskType };

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export function getModel(task: TaskType): string {
  return getModelForTask(task).id;
}

export function getMaxTokens(task: TaskType): number {
  return TASK_MAX_TOKENS[task];
}

export function needsWebSearch(task: TaskType): boolean {
  return WEB_SEARCH_TASKS.has(task);
}

export function buildTools(task: TaskType): Anthropic.Tool[] {
  if (!needsWebSearch(task)) return [];
  return [{ type: "web_search_20250305", name: "web_search" } as unknown as Anthropic.Tool];
}

export function estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  return estimateCostUsd(modelId, inputTokens, outputTokens);
}

export function parseJsonResponse<T>(raw: string): T {
  const cleaned = raw.replace(/```json\n?|```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
}
