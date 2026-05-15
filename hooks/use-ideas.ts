import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { IdeaFilters } from "@/types/api";

async function fetchIdeas(filters: IdeaFilters) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);
  if (filters.page) params.set("page", String(filters.page));
  const res = await fetch(`/api/ideas?${params}`);
  if (!res.ok) throw new Error("Failed to fetch ideas");
  return res.json();
}

export function useIdeas(filters: IdeaFilters = {}) {
  return useQuery({
    queryKey: ["ideas", filters],
    queryFn: () => fetchIdeas(filters),
  });
}

export function useIdea(id: string) {
  return useQuery({
    queryKey: ["idea", id],
    queryFn: async () => {
      const res = await fetch(`/api/ideas/${id}`);
      if (!res.ok) throw new Error("Failed to fetch idea");
      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; category?: string; tags?: string[] }) => {
      const res = await fetch("/api/ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to create idea");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ideas"] }),
  });
}

export function useUpdateIdea(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<{ title: string; description: string; status: string; category: string; tags: string[]; priority: number; isPinned: boolean }>) => {
      const res = await fetch(`/api/ideas/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to update idea");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["idea", id] });
      qc.invalidateQueries({ queryKey: ["ideas"] });
    },
  });
}

export function useDeleteIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete idea");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ideas"] }),
  });
}
