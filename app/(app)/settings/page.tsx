"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/use-user-preferences";

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
    dailyFocusEnabled: true,
    weeklyReviewEnabled: true,
    weeklyReviewDay: 0,
    notificationsEnabled: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (prefs) {
      setPreferences({
        dailyFocusEnabled: prefs.dailyFocusEnabled,
        weeklyReviewEnabled: prefs.weeklyReviewEnabled,
        weeklyReviewDay: prefs.weeklyReviewDay,
        notificationsEnabled: prefs.notificationsEnabled,
      });
    }
  }, [prefs]);

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
            <Input label="Name" value={session?.user?.name || ""} disabled />
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
              <div className="ml-7">
                <select
                  value={preferences.weeklyReviewDay}
                  onChange={(e) => setPreferences({ ...preferences, weeklyReviewDay: Number(e.target.value) })}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                >
                  {weekdays.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 flex gap-3">
            <Button variant="outline" onClick={() => prefs && setPreferences({
              dailyFocusEnabled: prefs.dailyFocusEnabled,
              weeklyReviewEnabled: prefs.weeklyReviewEnabled,
              weeklyReviewDay: prefs.weeklyReviewDay,
              notificationsEnabled: prefs.notificationsEnabled,
            })}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save preferences"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
