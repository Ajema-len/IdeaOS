import { useQuery } from "@tanstack/react-query";

export function useChatHistory(ideaId: string) {
  return useQuery({
    queryKey: ["chat", ideaId],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/chat`);
      if (!response.ok) throw new Error("Failed to fetch chat history");
      return response.json();
    },
  });
}
