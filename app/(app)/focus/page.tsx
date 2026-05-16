"use client";

import { useDailyFocus } from "@/hooks/use-dashboard";
import { useStartSession } from "@/hooks/use-sessions";
import { Spinner } from "@/components/ui/spinner";
import { DailyFocusCard } from "@/components/dashboard/daily-focus-card";

export default function DailyFocusPage() {
  const { data: dailyFocus, isLoading } = useDailyFocus();
  const startSession = useStartSession(dailyFocus?.ideaId || "");

  const handleStartSession = () => {
    if (dailyFocus?.ideaId) {
      startSession.mutate("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (!dailyFocus) {
    return (
      <div className="flex flex-col gap-8 p-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily focus</h1>
          <p className="mt-2 text-gray-600">No ideas to focus on yet. Create one to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Today's focus</h1>
        <p className="mt-2 text-gray-600">AI picked your top priority based on momentum and urgency.</p>
      </div>

      <DailyFocusCard focus={dailyFocus} onStartSession={handleStartSession} />
    </div>
  );
}
