import type { Idea, WorkSession, Milestone } from "@prisma/client";

export function buildChatSystemPrompt(
  idea: Idea,
  sessions: WorkSession[],
  milestones: Milestone[]
): string {
  const recentSessions = sessions.slice(0, 5).map(s =>
    `• ${new Date(s.startedAt).toLocaleDateString()}: ${s.whatAccomplished ?? s.notes ?? "(no notes)"}`
  ).join("\n");

  const milestoneText = milestones.map(m =>
    `[${m.status}] ${m.title}`
  ).join("\n");

  return `You are the dedicated AI assistant for this idea: "${idea.title}".

IDEA OVERVIEW:
${idea.description ?? "No description yet."}

Category: ${idea.category} | Status: ${idea.status}
Time invested: ${idea.totalTimeHours.toFixed(1)}h across ${idea.sessionCount} sessions
Momentum: ${idea.momentumScore.toFixed(0)}/100

MILESTONES:
${milestoneText || "No milestones yet"}

RECENT SESSIONS:
${recentSessions || "No sessions yet"}

Be direct, technical, and specific. You know this idea deeply. Help the engineer move forward.`;
}
