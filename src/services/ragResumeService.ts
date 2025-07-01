import { AIEvaluationService } from './ai/aiEvaluationService';

export interface ResumeChunk {
  id: string;
  text: string;
  embedding: number[];
}

export class RAGResumeService {
  static CHUNK_SIZE = 500; // characters per chunk
  static STORAGE_KEY = 'resume_rag_chunks';

  // Split resume into chunks (by paragraph or fixed size)
  static chunkResume(text: string): string[] {
    // Split by double newlines (paragraphs), fallback to fixed size
    const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    if (paras.length > 1) return paras;
    // Fallback: split by fixed size
    const chunks = [];
    for (let i = 0; i < text.length; i += this.CHUNK_SIZE) {
      chunks.push(text.slice(i, i + this.CHUNK_SIZE));
    }
    return chunks;
  }

  // Generate embeddings for all chunks and store in localStorage
  static async embedAndStoreChunks(text: string): Promise<ResumeChunk[]> {
    const chunks = this.chunkResume(text);
    const embeddedChunks: ResumeChunk[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.getEmbedding(chunk);
      embeddedChunks.push({ id: `chunk_${i}`, text: chunk, embedding });
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(embeddedChunks));
    return embeddedChunks;
  }

  // Get embedding for a string using the best available provider
  static async getEmbedding(text: string): Promise<number[]> {
    // Use a special prompt to get embedding from the AI provider
    // We'll use a hidden API in AIEvaluationService (or add one if needed)
    if (typeof (window as any).getTextEmbedding === 'function') {
      // For testing: allow a global override
      return await (window as any).getTextEmbedding(text);
    }
    if ((AIEvaluationService as any).getEmbeddingWithBestAvailable) {
      return await (AIEvaluationService as any).getEmbeddingWithBestAvailable(text);
    }
    // Fallback: fake embedding (not recommended for production)
    return Array(384).fill(0).map((_, i) => text.charCodeAt(i % text.length) / 255);
  }

  // Retrieve all stored chunks
  static getStoredChunks(): ResumeChunk[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Given a query, retrieve the top N most similar chunks
  static async retrieveRelevantChunks(query: string, topN = 4): Promise<ResumeChunk[]> {
    const chunks = this.getStoredChunks();
    if (!chunks.length) return [];
    const queryEmbedding = await this.getEmbedding(query);
    // Compute cosine similarity
    const scored = chunks.map(chunk => ({
      chunk,
      score: this.cosineSimilarity(queryEmbedding, chunk.embedding)
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topN).map(s => s.chunk);
  }

  // Cosine similarity between two vectors
  static cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
  }

  // Clear stored chunks
  static clearChunks() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
} 