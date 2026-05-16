

// Placeholder — real embedding generation requires Anthropic Embeddings API
// or text-embedding-3-small from OpenAI. Wire up in Phase 5.
export async function generateEmbedding(_text: string): Promise<number[]> {
  // TODO Phase 5: call embedding API
  return new Array(1536).fill(0);
}

export async function findSimilarIdeas(
  ideaId: string,
  userId: string,
  limit = 5
): Promise<Array<{ ideaId: string; similarity: number }>> {
  // TODO Phase 5: implement pgvector ANN search
  // Raw query:
  // SELECT ie.idea_id, 1 - (ie.embedding <=> $1::vector) AS similarity
  // FROM idea_embeddings ie JOIN ideas i ON i.id = ie.idea_id
  // WHERE i.user_id = $2 AND ie.idea_id != $3 AND i.status != 'ABANDONED'
  // ORDER BY ie.embedding <=> $1::vector LIMIT $4
  void ideaId; void userId; void limit;
  return [];
}
