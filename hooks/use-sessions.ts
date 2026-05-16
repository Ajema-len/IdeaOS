import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { WorkSession } from "@prisma/client";

export function useSessions(ideaId: string) {
  return useQuery<WorkSession[]>({
    queryKey: ["sessions", ideaId],
    queryFn: async () => {
      const res = await fetch(`/api/ideas/${ideaId}/sessions`);
      const json = await res.json();
      return json.data as WorkSession[];
    },
    enabled: !!ideaId,
  });
}

export function useStartSession(ideaId: string) {
  const qc = useQueryClient();
  return useMutation<any, Error, string | undefined>({
    mutationFn: async (goal?: string) => {
      const res = await fetch(`/api/ideas/${ideaId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalForSession: goal }),
      });
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions", ideaId] });
      qc.invalidateQueries({ queryKey: ["idea", ideaId] });
    },
  });
}

export function useEndSession(ideaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, whatAccomplished, notes }: { sessionId: string; whatAccomplished?: string; notes?: string }) => {
      const res = await fetch(`/api/sessions/${sessionId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatAccomplished, notes }),
      });
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions", ideaId] });
      qc.invalidateQueries({ queryKey: ["idea", ideaId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
