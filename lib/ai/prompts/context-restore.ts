export const CONTEXT_RESTORE_SYSTEM_PROMPT = `You are an AI assistant helping an engineer pick up work on an idea after a gap. Be specific and practical. Return valid JSON only — no markdown, no preamble.`;

export function buildContextRestorePrompt(params: {
  title: string;
  description: string | null;
  sessions: Array<{ startedAt: Date; durationMin: number | null; whatAccomplished: string | null; notes: string | null }>;
  milestones: Array<{ title: string; status: string }>;
  chatMessages: Array<{ role: string; content: string }>;
  gapDays: number;
}): string {
  const { title, description, sessions, milestones, chatMessages, gapDays } = params;

  const sessionText = sessions.slice(0, 5).map(s =>
    `- ${new Date(s.startedAt).toLocaleDateString()} (${s.durationMin ?? "?"}min): ${s.whatAccomplished ?? s.notes ?? "(no notes)"}`
  ).join("\n");

  const milestoneText = milestones.map(m => `[${m.status}] ${m.title}`).join("\n");

  const chatText = chatMessages.slice(-6).map(m => `${m.role}: ${m.content.slice(0, 200)}`).join("\n");

  return `Generate a context restore brief for this idea. Return JSON with exactly these fields:

{
  "summary": <string, 2-3 sentences describing the idea>,
  "lastSessionSummary": <string, what happened in the most recent session>,
  "lastAccomplished": [<string>, <string>],
  "whereYouLeftOff": <string, specific stopping point>,
  "suggestedNextStep": <string, concrete actionable next step>,
  "openQuestions": [<string>, <string>]
}

IDEA: ${title}
DESCRIPTION: ${description ?? "Not provided"}
GAP: ${gapDays} days since last session

RECENT SESSIONS:
${sessionText || "No sessions yet"}

MILESTONES:
${milestoneText || "No milestones yet"}

RECENT CHAT:
${chatText || "No chat history"}`;
}
