import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type UserPreferences = {
  dailyFocusEnabled: boolean;
  weeklyReviewEnabled: boolean;
  weeklyReviewDay: number;
  notificationsEnabled: boolean;
};

export function useUserPreferences() {
  return useQuery<UserPreferences | null>({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/users/preferences");
      if (!res.ok) throw new Error("Failed to load preferences");
      const json = await res.json();
      return json.data;
    },
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<UserPreferences>) => {
      const res = await fetch("/api/users/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || "Failed to save preferences");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
  });
}
