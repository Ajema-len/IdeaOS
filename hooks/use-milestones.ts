import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useMilestones(ideaId: string) {
  return useQuery({
    queryKey: ["milestones", ideaId],
    queryFn: async () => {
      const res = await fetch(`/api/ideas/${ideaId}/milestones`);
      const json = await res.json();
      return json.data;
    },
    enabled: !!ideaId,
  });
}

export function useUpdateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ideaId, ...data }: { id: string; ideaId: string; status?: string; title?: string; dueDate?: string | null }) => {
      const res = await fetch(`/api/milestones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["milestones", vars.ideaId] }),
  });
}

export function useDeleteMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { id: string; ideaId: string }) => {
      await fetch(`/api/milestones/${variables.id}`, { method: "DELETE" });
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["milestones", vars.ideaId] }),
  });
}
