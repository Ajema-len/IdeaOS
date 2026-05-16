import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMomentum } from "@/lib/ideas/momentum";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { z } from "zod";

const endSessionSchema = z.object({
  whatAccomplished: z.string().max(2000).optional(),
  notes: z.string().max(5000).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workSession = await prisma.workSession.findUnique({
    where: { id: resolvedParams.id },
    include: {
      idea: {
        include: {
          sessions: true,
          milestones: true,
        },
      },
    },
  });

  if (!workSession || workSession.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = endSessionSchema.safeParse(body);

  const endedAt = new Date();
  const durationMin = Math.round((endedAt.getTime() - workSession.startedAt.getTime()) / 60000);

  const momentumScore = computeMomentum({
    ...workSession.idea,
    sessions: workSession.idea.sessions.map((s) =>
      s.id === resolvedParams.id ? { ...s, endedAt } : s
    ),
  });

  await prisma.$transaction([
    prisma.workSession.update({
      where: { id: resolvedParams.id },
      data: {
        endedAt,
        durationMin,
        whatAccomplished: parsed.success ? parsed.data.whatAccomplished : undefined,
        notes: parsed.success ? parsed.data.notes : undefined,
      },
    }),
    prisma.idea.update({
      where: { id: workSession.ideaId },
      data: {
        lastWorkedAt: endedAt,
        totalTimeHours: { increment: durationMin / 60 },
        sessionCount: { increment: 1 },
        momentumScore,
      },
    }),
  ]);

  // Invalidate context restore cache
  await redis.del(CACHE_KEYS.contextRestore(workSession.ideaId)).catch(() => null);

  return NextResponse.json({ data: { ok: true, durationMin, momentumScore } });
}
