import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { vectorStore } from '@/rag/vectorstore';
import { buildRAGPrompt } from '@/rag/prompt';
import { loadMarkdownDocs } from '@/rag/loader';
import { chunkText } from '@/rag/chunker';
import { buildVocabulary, generateEmbeddings } from '@/rag/embeddings';
import type { VectorEntry } from '@/rag/vectorstore';

// Lazy-initialise so the constructor doesn't run at build time
// (OPENROUTER_API_KEY isn't available during `next build` page-data collection)
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'InfluConnect RAG Chatbot',
      },
    });
  }
  return _openai;
}

/**
 * Auto-ingest knowledge base if the vector store is empty.
 * On Vercel, each serverless function has its own memory,
 * so we must ingest within the same process that handles chat.
 */
async function ensureIngested(): Promise<void> {
  if (vectorStore.isReady()) return;

  const docs = loadMarkdownDocs();
  const allChunks = docs.flatMap((doc) =>
    chunkText(doc.content, { filename: doc.metadata.filename })
  );
  const texts = allChunks.map((chunk) => chunk.text);
  buildVocabulary(texts);
  const embeddings = await generateEmbeddings(texts);

  const entries: VectorEntry[] = allChunks.map((chunk, i) => ({
    text: chunk.text,
    embedding: embeddings[i],
    metadata: chunk.metadata,
  }));

  vectorStore.setEntries(entries);
  console.log(`[RAG] Auto-ingested ${docs.length} docs, ${entries.length} chunks`);
}

/**
 * POST /api/rag/chat
 *
 * Accepts a user question, performs semantic search over ingested
 * documents, builds a context-aware prompt, and returns an LLM response.
 *
 * Request body: { "question": "How do I create a campaign?" }
 * Response:     { "answer": "...", "sources": [...] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "question" in request body.' },
        { status: 400 }
      );
    }

    // Step 1: Auto-ingest if vector store is empty (handles serverless cold starts)
    await ensureIngested();

    // Step 2: Semantic search — find top-K relevant chunks
    const topK = 5;
    const results = await vectorStore.search(question, topK);

    // Step 3: Build context string from retrieved chunks
    const context = results
      .map((r, i) => `[Source ${i + 1}: ${r.metadata.filename}]\n${r.text}`)
      .join('\n\n---\n\n');

    // Step 4: Build the RAG prompt
    const prompt = buildRAGPrompt(context, question);

    // Step 5: Call the LLM with the context-augmented prompt
    // Try multiple free models in order of preference
    const freeModels = [
      'google/gemma-3-1b-it:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'openai/gpt-oss-120b:free',
    ];

    let completion = null;
    let lastError: Error | null = null;

    for (const model of freeModels) {
      try {
        completion = await getOpenAI().chat.completions.create({
          model,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: question },
          ],
          temperature: 0.3,
          max_tokens: 1024,
        });
        break; // success — stop trying
      } catch (err) {
        lastError = err as Error;
        console.warn(`Model ${model} failed, trying next...`);
      }
    }

    if (!completion) {
      throw lastError || new Error('All free models failed.');
    }

    const answer = completion.choices[0]?.message?.content ?? 'No response generated.';

    // Step 6: Return the answer along with source references
    return NextResponse.json({
      answer,
      sources: results.map((r) => ({
        filename: r.metadata.filename,
        chunkIndex: r.metadata.chunkIndex,
        score: Math.round(r.score * 1000) / 1000,
        excerpt: r.text.slice(0, 150) + '...',
      })),
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Chat request failed.', details: (error as Error).message },
      { status: 500 }
    );
  }
}
