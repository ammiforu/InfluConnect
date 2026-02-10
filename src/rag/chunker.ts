export interface Chunk {
  text: string;
  metadata: {
    filename: string;
    chunkIndex: number;
  };
}

/**
 * Splits text into overlapping chunks of roughly `chunkSize` characters,
 * with `overlap` characters shared between consecutive chunks.
 * Splits on paragraph boundaries when possible to keep context intact.
 */
export function chunkText(
  text: string,
  metadata: { filename: string },
  chunkSize = 500,
  overlap = 100
): Chunk[] {
  const chunks: Chunk[] = [];

  // Split on double-newlines (paragraphs) to keep natural boundaries
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    // If adding this paragraph exceeds the chunk size, flush
    if (currentChunk.length > 0 && currentChunk.length + paragraph.length > chunkSize) {
      chunks.push({
        text: currentChunk.trim(),
        metadata: { filename: metadata.filename, chunkIndex },
      });
      chunkIndex++;

      // Keep the overlap from the end of the current chunk
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + '\n\n' + paragraph;
    } else {
      currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + paragraph;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      metadata: { filename: metadata.filename, chunkIndex },
    });
  }

  return chunks;
}
