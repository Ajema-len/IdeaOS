import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, formatDuration } from "@/lib/utils";
import type { WorkSession } from "@prisma/client";

type Props = {
  activeSession?: WorkSession | null;
  sessions: WorkSession[];
  onStart: () => void;
  onEnd: () => void;
};

export function SessionTracker({ activeSession, sessions, onStart, onEnd }: Props) {
  const lastSessions = useMemo(() => sessions.slice(0, 3), [sessions]);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Session tracker</h2>
          <p className="mt-2 text-sm text-gray-600">Track progress and close work sessions efficiently.</p>
        </div>
        {activeSession ? (
          <Button onClick={onEnd}>End session</Button>
        ) : (
          <Button onClick={onStart}>Start session</Button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {activeSession ? (
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-blue-700">Active session started {formatRelativeTime(activeSession.startedAt)}</p>
            <p className="mt-2 text-sm text-blue-900">Goal: {activeSession.goalForSession || "No goal set"}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No active session. Start one to capture progress as you work.</p>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-900">Recent sessions</h3>
          <div className="mt-3 space-y-3">
            {lastSessions.length === 0 ? (
              <p className="text-sm text-gray-500">No sessions yet.</p>
            ) : (
              lastSessions.map((session) => (
                <div key={session.id} className="rounded-3xl border border-gray-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>{formatRelativeTime(session.startedAt)}</span>
                    <span>{session.durationMin ? formatDuration(session.durationMin) : "In progress"}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{session.goalForSession || "No goal recorded"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
