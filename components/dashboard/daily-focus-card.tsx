import { Button } from "@/components/ui/button";

import type { DailyFocusResult } from "@/types/idea";

type Props = {
  focus: DailyFocusResult | null;
  onStartSession?: () => void;
};

export function DailyFocusCard({ focus, onStartSession }: Props) {
  if (!focus) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">No focus recommendation available yet. Complete your first few ideas and sessions.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-2 border-blue-500 bg-blue-50 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">Today's focus</p>
          <h3 className="mt-2 text-lg font-bold text-blue-900">{focus.reason}</h3>
          <p className="mt-3 text-sm text-blue-800">{focus.suggestedGoal}</p>
          <p className="mt-2 text-xs text-blue-700">Est. {focus.estimatedMinutes} min</p>
        </div>
        {onStartSession ? <Button onClick={onStartSession}>Start session</Button> : null}
      </div>
    </div>
  );
}
