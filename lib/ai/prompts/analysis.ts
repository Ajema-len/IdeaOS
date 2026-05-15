import type { Idea } from "@prisma/client";

export const ANALYSIS_SYSTEM_PROMPT = `You are an expert technical advisor and product strategist. You analyze ideas for a senior machine learning engineer and software developer. Give direct, opinionated, technically grounded analysis. Always return valid JSON only — no markdown, no preamble.`;

export function buildAnalysisPrompt(idea: Idea): string {
  return `Analyze this idea and return a JSON object with exactly these fields:

{
  "complexity": <number 1-10, where 1=weekend project, 10=requires a team and years>,
  "complexityReason": <string, 1 sentence>,
  "feasibility": <"low" | "medium" | "high" | "very_high">,
  "feasibilityReason": <string, 1 sentence>,
  "marketPotential": <"niche" | "moderate" | "large" | "massive">,
  "marketPotentialReason": <string, 1 sentence>,
  "timeToMVP": <string, e.g. "2-4 weeks">,
  "primaryRisks": [<string>, <string>, <string>],
  "suggestedStack": {
    "frontend": [<string>],
    "backend": [<string>],
    "ai": [<string>],
    "infra": [<string>]
  },
  "ideaScore": <number 1-100, weighted composite>,
  "analysisVersion": "1.0.0"
}

IDEA:
Title: ${idea.title}
Description: ${idea.description || "Not provided"}
Category: ${idea.category}
Tags: ${idea.tags.join(", ") || "None"}

Scoring weights: feasibility 40%, marketPotential 30%, complexity-inverse 30%.`;
}
