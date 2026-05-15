import type { WorkSession, Milestone } from "@prisma/client";

type IdeaWithRelations = {
  sessions: WorkSession[];
  milestones: Milestone[];
  lastWorkedAt: Date | null;
};

export function computeMomentum(idea: IdeaWithRelations): number {
  const now = Date.now();
  const DAY_MS = 86400000;
  const WINDOW_DAYS = 14;
  const windowMs = WINDOW_DAYS * DAY_MS;

  // Recency score (0–40): full 40 if worked on today, 0 if 30+ days ago
  const daysSinceLast = idea.lastWorkedAt
    ? (now - idea.lastWorkedAt.getTime()) / DAY_MS
    : 999;
  const recencyScore = Math.max(0, 40 - (daysSinceLast * (40 / 30)));

  // Frequency score (0–30): sessions in last 14 days × 5, capped at 30
  const recentSessions = idea.sessions.filter(
    (s) => s.startedAt.getTime() > now - windowMs
  ).length;
  const frequencyScore = Math.min(30, recentSessions * 5);

  // Milestone velocity (0–30): milestones completed in last 14 days × 10, capped at 30
  const recentMilestones = idea.milestones.filter(
    (m) => m.completedAt && m.completedAt.getTime() > now - windowMs
  ).length;
  const velocityScore = Math.min(30, recentMilestones * 10);

  return Math.round(recencyScore + frequencyScore + velocityScore);
}
