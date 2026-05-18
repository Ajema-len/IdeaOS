import { useQuery } from "@tanstack/react-query";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      return json.data;
    },
  });
}

export function useDailyFocus() {
  return useQuery({
    queryKey: ["daily-focus"],
    queryFn: async () => {
      const res = await fetch("/api/ai/daily-focus");
      const json = await res.json();
      return json.data;
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/activity");
      const json = await res.json();
      return json.data;
    },
  });
}
