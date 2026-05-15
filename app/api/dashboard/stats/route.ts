import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [byStatus, totals, recentSessions] = await Promise.all([
    prisma.idea.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.idea.aggregate({
      where: { userId },
      _sum: { totalTimeHours: true, sessionCount: true },
      _count: { _all: true },
    }),
    prisma.workSession.count({
      where: {
        userId,
        startedAt: { gte: new Date(Date.now() - 7 * 86400000) },
      },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    byStatus.map((b) => [b.status, b._count._all])
  );

  return NextResponse.json({
    data: {
      totalIdeas: totals._count._all,
      byStatus: statusCounts,
      totalTimeHours: totals._sum.totalTimeHours ?? 0,
      totalSessions: totals._sum.sessionCount ?? 0,
      sessionsThisWeek: recentSessions,
    },
  });
}
