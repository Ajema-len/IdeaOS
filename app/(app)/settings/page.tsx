"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState({
    dailyFocusEnabled: true,
    weeklyReviewEnabled: true,
    weeklyReviewDay: "SUNDAY",
    notificationsEnabled: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/users/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error("Failed to save preferences");
      toast.success("Preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
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
              <select
                value={preferences.weeklyReviewDay}
                onChange={(e) => setPreferences({ ...preferences, weeklyReviewDay: e.target.value })}
                className="ml-7 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              >
                <option value="SUNDAY">Sunday</option>
                <option value="MONDAY">Monday</option>
                <option value="SATURDAY">Saturday</option>
              </select>
            )}

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.notificationsEnabled}
                onChange={(e) => setPreferences({ ...preferences, notificationsEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-900">Email notifications</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex gap-3">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
}
