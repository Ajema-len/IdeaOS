"use client";

import { formatDateTime, formatDuration } from "@/lib/utils";
import type { WorkSession } from "@prisma/client";

type Props = {
  sessions: WorkSession[];
};

export function SessionHistory({ sessions }: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Session history</h2>
      <div className="mt-4 space-y-4">
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500">No sessions recorded yet.</p>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="border-l-2 border-blue-500 pl-4 py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{formatDateTime(session.startedAt)}</p>
                <p className="text-sm text-gray-600">{session.durationMin ? formatDuration(session.durationMin) : "In progress"}</p>
              </div>
              {session.goalForSession ? <p className="mt-1 text-sm text-gray-600">Goal: {session.goalForSession}</p> : null}
              {session.whatAccomplished ? <p className="mt-1 text-sm text-gray-600">Done: {session.whatAccomplished}</p> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
