"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/use-user-preferences";
import { MODEL_REGISTRY, TASK_MODEL_MAP } from "@/lib/ai/models";

const weekdays = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: prefs } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const [preferences, setPreferences] = useState({
    name: session?.user?.name || "",
    dailyFocusEnabled: true,
    weeklyReviewEnabled: true,
    weeklyReviewDay: 0,
    weeklyReviewHour: 9,
    notificationsEnabled: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (prefs) {
      setPreferences({
        name: session?.user?.name || "",
        dailyFocusEnabled: prefs.dailyFocusEnabled,
        weeklyReviewEnabled: prefs.weeklyReviewEnabled,
        weeklyReviewDay: prefs.weeklyReviewDay,
        weeklyReviewHour: prefs.weeklyReviewHour,
        notificationsEnabled: prefs.notificationsEnabled,
      });
    }
  }, [prefs, session?.user?.name]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences.mutateAsync(preferences);
      toast.success("Preferences saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Customize your IdeaOS experience.</p>
      </div>

      <div className="max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <div className="mt-4 space-y-4">
            <Input label="Email" value={session?.user?.email || ""} disabled />
            <Input
              label="Name"
              value={preferences.name}
              onChange={(e) => setPreferences({ ...preferences, name: e.target.value })}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">AI Features</h2>
          <div className="mt-4 space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.dailyFocusEnabled}
                onChange={(e) => setPreferences({ ...preferences, dailyFocusEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-900">Daily focus recommendations</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.weeklyReviewEnabled}
                onChange={(e) => setPreferences({ ...preferences, weeklyReviewEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-900">Weekly reviews</span>
            </label>

            {preferences.weeklyReviewEnabled && (
              <div className="ml-7 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Review day</label>
                  <select
                    value={preferences.weeklyReviewDay}
                    onChange={(e) => setPreferences({ ...preferences, weeklyReviewDay: Number(e.target.value) })}
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  >
                    {weekdays.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Review hour</label>
                  <select
                    value={preferences.weeklyReviewHour}
                    onChange={(e) => setPreferences({ ...preferences, weeklyReviewHour: Number(e.target.value) })}
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <option key={hour} value={hour}>
                        {hour.toString().padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() =>
                prefs &&
                setPreferences({
                  name: session?.user?.name || "",
                  dailyFocusEnabled: prefs.dailyFocusEnabled,
                  weeklyReviewEnabled: prefs.weeklyReviewEnabled,
                  weeklyReviewDay: prefs.weeklyReviewDay,
                  weeklyReviewHour: prefs.weeklyReviewHour,
                  notificationsEnabled: prefs.notificationsEnabled,
                })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save preferences"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 mt-4">
        <h2 className="text-lg font-semibold text-gray-900">AI models</h2>
        <p className="mt-2 text-sm text-gray-600">
          Configured in <code className="bg-gray-100 px-1 rounded">lib/ai/models.ts</code>. To swap a model, update TASK_MODEL_MAP in that file.
        </p>

        <div className="mt-6 space-y-2">
          {Object.values(MODEL_REGISTRY).map((model) => (
            <div key={model.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{model.displayName}</p>
                <p className="text-xs text-gray-400">{model.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  model.tier === "fast" ? "bg-green-100 text-green-700" :
                  model.tier === "balanced" ? "bg-blue-100 text-blue-700" :
                  "bg-purple-100 text-purple-700"
                }`}>
                  {model.tier}
                </span>
                <span className="text-xs text-gray-400">
                  ${model.inputCostPer1M}/1M in
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Task assignments</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {(Object.entries(TASK_MODEL_MAP) as [string, string][]).map(([task, modelId]) => (
              <div key={task} className="flex items-center justify-between py-0.5">
                <span className="text-xs text-gray-500">{task.replace(/_/g, " ")}</span>
                <span className="text-xs font-mono text-gray-700">
                  {MODEL_REGISTRY[modelId]?.displayName ?? modelId}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
