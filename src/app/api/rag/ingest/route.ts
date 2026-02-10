import { NextResponse } from 'next/server';
import { loadMarkdownDocs } from '@/rag/loader';
import { chunkText } from '@/rag/chunker';
import { buildVocabulary, generateEmbeddings } from '@/rag/embeddings';
import { vectorStore, type VectorEntry } from '@/rag/vectorstore';

/**
 * POST /api/rag/ingest
 *
 * Loads all markdown documents from src/rag/docs/,
 * chunks them, generates embeddings, and stores them
 * in the in-memory vector store.
 */
export async function POST() {
  try {
    // Step 1: Load markdown documents
    const docs = loadMarkdownDocs();

    if (docs.length === 0) {
      return NextResponse.json(
        { error: 'No markdown documents found in src/rag/docs/' },
        { status: 404 }
      );
    }

    // Step 2: Chunk all documents
    const allChunks = docs.flatMap((doc) =>
      chunkText(doc.content, { filename: doc.metadata.filename })
    );

    // Step 3: Build vocabulary from all chunks, then generate embeddings
    const texts = allChunks.map((chunk) => chunk.text);
    buildVocabulary(texts);
    const embeddings = await generateEmbeddings(texts);

    // Step 4: Build vector entries and store them
    const entries: VectorEntry[] = allChunks.map((chunk, i) => ({
      text: chunk.text,
      embedding: embeddings[i],
      metadata: chunk.metadata,
    }));

    vectorStore.setEntries(entries);

    return NextResponse.json({
      success: true,
      message: 'Documents ingested successfully.',
      stats: {
        documentsLoaded: docs.length,
        chunksCreated: allChunks.length,
        embeddingsGenerated: embeddings.length,
      },
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    return NextResponse.json(
      { error: 'Ingestion failed.', details: (error as Error).message },
      { status: 500 }
    );
  }
}
