export const DAILY_FOCUS_SYSTEM_PROMPT = `You are a strategic advisor recommending which idea to focus on today. Consider: momentum (recent activity should continue), nearly-complete ideas (ship them), and ideas that have stalled too long. Be direct and specific. Return valid JSON only.`;

export function buildDailyFocusPrompt(ideas: Array<{
  id: string;
  title: string;
  status: string;
  momentumScore: number;
  lastWorkedAt: Date | null;
  sessionCount: number;
  totalTimeHours: number;
  milestonesDone: number;
  milestonesTotal: number;
}>): string {
  const ideaText = ideas.map(i => `
ID: ${i.id}
Title: ${i.title}
Status: ${i.status}
Momentum: ${i.momentumScore.toFixed(0)}/100
Last worked: ${i.lastWorkedAt ? `${Math.round((Date.now() - i.lastWorkedAt.getTime()) / 86400000)} days ago` : "never"}
Sessions: ${i.sessionCount} | Time: ${i.totalTimeHours.toFixed(1)}h
Milestones: ${i.milestonesDone}/${i.milestonesTotal} done`).join("\n---");

  return `Recommend one idea to focus on today. Return JSON:

{
  "recommendedIdeaId": <string>,
  "reason": <string, 1-2 sentences why this idea today>,
  "suggestedGoal": <string, specific goal for today's session>,
  "estimatedMinutes": <number>,
  "alternativeIdeaId": <string>,
  "alternativeReason": <string, 1 sentence>
}

TODAY: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

IDEAS:
${ideaText}`;
}
