import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { vectorStore } from '@/rag/vectorstore';
import { buildRAGPrompt } from '@/rag/prompt';

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

    // Step 1: Check that the vector store has been populated
    if (!vectorStore.isReady()) {
      return NextResponse.json(
        { error: 'Knowledge base not loaded. Call POST /api/rag/ingest first.' },
        { status: 503 }
      );
    }

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
