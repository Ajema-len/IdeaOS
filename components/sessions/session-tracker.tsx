"use client";

import { useMemo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, formatDuration } from "@/lib/utils";
import { toast } from "sonner";
import type { WorkSession } from "@prisma/client";

type Props = {
  activeSession?: WorkSession | null;
  sessions: WorkSession[];
  onStart: () => void;
  onEnd: (whatAccomplished: string) => void;
};

export function SessionTracker({ activeSession, sessions, onStart, onEnd }: Props) {
  const lastSessions = useMemo(() => sessions.slice(0, 3), [sessions]);
  const [elapsed, setElapsed] = useState(0);
  const [showEndForm, setShowEndForm] = useState(false);
  const [accomplishment, setAccomplishment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!activeSession?.startedAt) return;

    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(activeSession.startedAt);
      const diff = Math.round((now.getTime() - start.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession?.startedAt]);

  const formatElapsed = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const handleEndSession = async () => {
    if (!accomplishment.trim()) {
      toast.error("Please describe what you accomplished");
      return;
    }

    setIsSubmitting(true);
    try {
      onEnd(accomplishment);
      setShowEndForm(false);
      setAccomplishment("");
      const durationMin = Math.round(elapsed / 60);
      toast.success(`Session ended — ${durationMin} min logged`);
    } catch (error) {
      toast.error("Failed to end session");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Session tracker</h2>
          <p className="mt-2 text-sm text-gray-600">Track progress and close work sessions efficiently.</p>
        </div>
        {activeSession && !showEndForm ? (
          <Button onClick={() => setShowEndForm(true)}>End session</Button>
        ) : !activeSession ? (
          <Button onClick={onStart}>Start session</Button>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
        {activeSession ? (
          <>
            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-baseline gap-2">
                <p className="text-sm text-blue-700">Active session</p>
                <p className="text-2xl font-bold text-blue-900">{formatElapsed(elapsed)}</p>
              </div>
              <p className="mt-2 text-sm text-blue-900">Goal: {activeSession.goalForSession || "No goal set"}</p>
            </div>

            {showEndForm && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                <p className="text-sm font-medium text-amber-900">What did you accomplish?</p>
                <textarea
                  value={accomplishment}
                  onChange={(e) => setAccomplishment(e.target.value)}
                  placeholder="Describe your progress..."
                  className="w-full rounded-2xl border border-amber-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={handleEndSession} disabled={isSubmitting || !accomplishment.trim()}>
                    {isSubmitting ? "Saving..." : "Save & end"}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowEndForm(false); setAccomplishment(""); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
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
                  <p className="mt-2 text-sm text-gray-600">{session.whatAccomplished || session.goalForSession || "No notes recorded"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
