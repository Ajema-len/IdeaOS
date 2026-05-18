import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAnalysis(ideaId: string) {
  return useQuery({
    queryKey: ["analysis", ideaId],
    queryFn: async () => {
      const res = await fetch(`/api/ideas/${ideaId}`);
      const json = await res.json();
      const analyses: any[] = json.data?.analysis ?? [];
      return {
        fullAnalysis: analyses.find((a: any) => a.analysisType === "FULL_ANALYSIS")?.result ?? null,
        milestoneAnalysis: analyses.find((a: any) => a.analysisType === "MILESTONE_PLAN")?.result ?? null,
        contextRestore: analyses.find((a: any) => a.analysisType === "CONTEXT_RESTORE")?.result ?? null,
      };
    },
    enabled: !!ideaId,
    meta: { refetchAttempts: 0 },
  });
}

export function useRunAnalysis(ideaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/ai/analyze/${ideaId}`, { method: "POST" });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["analysis", ideaId] }),
  });
}

export function useContextRestore(ideaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/ai/context-restore/${ideaId}`, { method: "POST" });
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["analysis", ideaId] }),
  });
}
