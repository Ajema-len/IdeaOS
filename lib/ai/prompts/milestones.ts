import type { Idea } from "@prisma/client";

export const MILESTONE_SYSTEM_PROMPT = `You are a project planning expert. Create practical, actionable milestone plans for software projects. Return valid JSON only — no markdown, no preamble.`;

export function buildMilestonePrompt(idea: Idea): string {
  return `Create a milestone plan for this idea. Return JSON with exactly these fields:

{
  "milestones": [
    {
      "title": <string, action-oriented, max 60 chars>,
      "description": <string, 1-2 sentences of what specifically gets done>,
      "estimatedDays": <number>,
      "phase": <"foundation" | "core" | "polish" | "launch">
    }
  ],
  "totalEstimatedDays": <number>,
  "criticalPath": <string, one sentence summary>
}

Rules:
- 4 to 8 milestones, never more
- Each milestone is completable independently
- Start with the smallest possible working thing
- phases: foundation (setup/infra) → core (main features) → polish (UX/edge cases) → launch (deploy/ship)

IDEA:
Title: ${idea.title}
Description: ${idea.description || "Not provided"}
Category: ${idea.category}`;
}
