import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { SessionHistory } from "@/components/sessions/session-history";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [stats, recentSessions] = await Promise.all([
    prisma.idea.aggregate({
      where: { userId },
      _count: { _all: true },
      _sum: { totalTimeHours: true, sessionCount: true },
    }),
    prisma.workSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
  ]);

  const statusCounts = await prisma.idea.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });

  const activeIdeas = statusCounts.find((s) => s.status === "ACTIVE")?._count._all ?? 0;

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user.name || "creator"}!</h1>
        <p className="mt-2 text-gray-600">Your ideas are waiting. Let's ship something today.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total ideas" value={stats._count._all} subtext="Across all statuses" />
        <StatCard label="Active now" value={activeIdeas} subtext="Ideas in progress" />
        <StatCard label="Hours invested" value={`${(stats._sum.totalTimeHours ?? 0).toFixed(1)}h`} subtext="Total work time" />
        <StatCard label="Sessions" value={stats._sum.sessionCount ?? 0} subtext="Total sessions" />
      </div>

      <SessionHistory sessions={recentSessions} />
    </div>
  );
}
