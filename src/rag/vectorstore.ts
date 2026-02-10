import { generateEmbedding } from './embeddings';

export interface VectorEntry {
  text: string;
  embedding: number[];
  metadata: {
    filename: string;
    chunkIndex: number;
  };
}

export interface SearchResult {
  text: string;
  score: number;
  metadata: {
    filename: string;
    chunkIndex: number;
  };
}

/**
 * In-memory vector store.
 * Stores chunk embeddings and supports cosine similarity search.
 * For a production system, replace with pgvector, Pinecone, or Weaviate.
 */
class VectorStore {
  private entries: VectorEntry[] = [];

  /** Replace all stored entries (used during ingestion) */
  setEntries(entries: VectorEntry[]) {
    this.entries = entries;
  }

  /** Return the current number of stored entries */
  size(): number {
    return this.entries.length;
  }

  /** Check if the store has been populated */
  isReady(): boolean {
    return this.entries.length > 0;
  }

  /**
   * Search for the top-K most similar chunks to a query string.
   * Generates an embedding for the query, then ranks all stored
   * chunks by cosine similarity.
   */
  async search(query: string, topK = 5): Promise<SearchResult[]> {
    if (!this.isReady()) {
      throw new Error('Vector store is empty. Run ingestion first (POST /api/rag/ingest).');
    }

    const queryEmbedding = await generateEmbedding(query);

    const scored = this.entries.map((entry) => ({
      text: entry.text,
      metadata: entry.metadata,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    // Sort descending by similarity score and return top-K
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

/**
 * Cosine similarity between two vectors.
 * Returns a value between -1 and 1, where 1 means identical direction.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

// Singleton instance — shared across API routes within the same server process
export const vectorStore = new VectorStore();
