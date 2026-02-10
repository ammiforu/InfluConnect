/**
 * Local TF-IDF-based embeddings — no API key required.
 * Builds a vocabulary from all texts, then represents each text
 * as a TF-IDF weighted vector for cosine similarity search.
 */

// Shared vocabulary built during ingestion
let vocabulary: string[] = [];
let idfValues: Map<string, number> = new Map();

/** Simple tokenizer: lowercase, remove punctuation, split on whitespace */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/** Compute term frequency for a list of tokens */
function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  // Normalize by total tokens
  for (const [key, val] of tf) {
    tf.set(key, val / tokens.length);
  }
  return tf;
}

/**
 * Build the vocabulary and IDF values from all document texts.
 * Must be called once during ingestion before generating embeddings.
 */
export function buildVocabulary(texts: string[]): void {
  const tokenizedDocs = texts.map(tokenize);
  const docCount = tokenizedDocs.length;

  // Collect all unique terms and their document frequencies
  const dfMap = new Map<string, number>();
  for (const tokens of tokenizedDocs) {
    const unique = new Set(tokens);
    for (const token of unique) {
      dfMap.set(token, (dfMap.get(token) || 0) + 1);
    }
  }

  // Keep top 5000 most common terms as vocabulary for manageable vector size
  vocabulary = Array.from(dfMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5000)
    .map(([term]) => term);

  // Compute IDF: log(N / df)
  idfValues = new Map();
  for (const term of vocabulary) {
    const df = dfMap.get(term) || 1;
    idfValues.set(term, Math.log(docCount / df) + 1);
  }
}

/** Convert a single text to a TF-IDF vector using the shared vocabulary */
function toTfIdfVector(text: string): number[] {
  const tokens = tokenize(text);
  const tf = termFrequency(tokens);

  return vocabulary.map((term) => {
    const tfVal = tf.get(term) || 0;
    const idfVal = idfValues.get(term) || 1;
    return tfVal * idfVal;
  });
}

/**
 * Generate an embedding for a single text string.
 * Uses the pre-built TF-IDF vocabulary (runs locally, no API call).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  return toTfIdfVector(text);
}

/**
 * Generate embeddings for multiple texts in batch.
 * Uses the pre-built TF-IDF vocabulary (runs locally, no API call).
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  return texts.map(toTfIdfVector);
}
