import { prisma } from "@/lib/prisma";

export async function getIdeaFullContext(ideaId: string) {
  const [idea, sessions, milestones, chatMessages, notes, latestAnalysis] =
    await Promise.all([
      prisma.idea.findUniqueOrThrow({ where: { id: ideaId } }),
      prisma.workSession.findMany({
        where: { ideaId },
        orderBy: { startedAt: "desc" },
        take: 10,
      }),
      prisma.milestone.findMany({
        where: { ideaId },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.chatMessage.findMany({
        where: { ideaId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.note.findMany({
        where: { ideaId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.aIAnalysis.findFirst({
        where: { ideaId, analysisType: "FULL_ANALYSIS" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return {
    idea,
    sessions,
    milestones,
    chatMessages: [...chatMessages].reverse(),
    notes,
    latestAnalysis,
  };
}
