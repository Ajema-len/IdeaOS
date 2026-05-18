"use client";

import { useSession } from "next-auth/react";
import { DailyFocusCard } from "@/components/dashboard/daily-focus-card";
import { SessionHistory } from "@/components/sessions/session-history";
import { StatCard } from "@/components/dashboard/stat-card";
import { Spinner } from "@/components/ui/spinner";
import { useDailyFocus, useDashboardActivity, useDashboardStats } from "@/hooks/use-dashboard";
import { useStartSession } from "@/hooks/use-sessions";

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const statsQuery = useDashboardStats();
  const activityQuery = useDashboardActivity();
  const dailyFocusQuery = useDailyFocus();
  const startSession = useStartSession(dailyFocusQuery.data?.ideaId || "");

  const isLoading = status === "loading" || statsQuery.isLoading || activityQuery.isLoading || dailyFocusQuery.isLoading;

  const handleStartSession = () => {
    if (dailyFocusQuery.data?.ideaId) {
      startSession.mutate(undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  const name = session?.user?.name || "creator";
  const stats = statsQuery.data;
  const activity = activityQuery.data || [];
  const dailyFocus = dailyFocusQuery.data ?? null;

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {name}!</h1>
        <p className="mt-2 text-gray-600">Your ideas are waiting. Let&apos;s make progress today.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total ideas" value={stats?.totalIdeas ?? 0} subtext="Across all statuses" />
        <StatCard label="Active now" value={stats?.byStatus?.ACTIVE ?? 0} subtext="Ideas in progress" />
        <StatCard label="Hours invested" value={`${stats?.totalTimeHours?.toFixed(1) ?? 0}h`} subtext="Total work time" />
        <StatCard label="Sessions this week" value={stats?.sessionsThisWeek ?? 0} subtext="Recent momentum" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Daily focus</p>
                <p className="text-sm text-gray-500">AI recommends your top work priority for today.</p>
              </div>
            </div>
            <DailyFocusCard focus={dailyFocus} onStartSession={handleStartSession} />
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Recent activity</p>
              <p className="text-sm text-gray-500">Latest completed sessions and progress.</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {activity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity yet. Start a session to log progress.</p>
            ) : (
              activity.map((sessionItem: any) => (
                <div key={sessionItem.id} className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-sm font-medium text-gray-900">{sessionItem.idea?.title || "Untitled idea"}</p>
                  <p className="mt-1 text-sm text-gray-600">{sessionItem.whatAccomplished || "Session complete"}</p>
                  <p className="mt-2 text-xs text-gray-500">{new Date(sessionItem.endedAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div>
        <SessionHistory sessions={activity.map((sessionItem: any) => ({
          ...sessionItem,
          durationMin: sessionItem.durationMin ?? 0,
          goalForSession: sessionItem.goalForSession ?? undefined,
          whatAccomplished: sessionItem.whatAccomplished ?? undefined,
          notes: sessionItem.notes ?? undefined,
          ideaId: sessionItem.ideaId,
          userId: sessionItem.userId,
          startedAt: sessionItem.startedAt,
          endedAt: sessionItem.endedAt,
          id: sessionItem.id,
        }))}
      />
      </div>
    </div>
  );
}
