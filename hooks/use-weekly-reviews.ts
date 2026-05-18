import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useGenerateWeeklyReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/weekly-review", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate review");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-reviews"] });
    },
  });
}

export function useWeeklyReviews() {
  return useQuery({
    queryKey: ["weekly-reviews"],
    queryFn: async () => {
      const res = await fetch("/api/weekly-reviews");
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
  });
}
