import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

// customFetch to ensure API key is strictly in URL (matching geminiService.ts pattern)
const customFetch = async (url: string | URL | Request, init?: RequestInit) => {
  const urlObj = new URL(url.toString());
  urlObj.searchParams.set('key', process.env.GEMINI_API_KEY || '');
  
  const headers = new Headers(init?.headers);
  headers.delete('Authorization');
  
  return fetch(urlObj.toString(), {
    ...init,
    headers
  });
};

const embeddingModel = genAI.getGenerativeModel(
  { model: 'gemini-embedding-2' },
  { customFetch } as any
);

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate text embedding');
  }
};

/**
 * Batches embedding calls to reduce Gemini API round trips.
 * Note: gemini-embedding-2 returns exactly 768-dimensional vectors.
 */
export const generateEmbeddingsBatch = async (texts: string[]): Promise<number[][]> => {
  try {
    const requests = texts.map(t => ({ content: { role: 'user', parts: [{ text: t }] } }));
    const result = await embeddingModel.batchEmbedContents({
      requests
    });
    return result.embeddings.map(e => e.values);
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw new Error('Failed to generate batch embeddings');
  }
};
