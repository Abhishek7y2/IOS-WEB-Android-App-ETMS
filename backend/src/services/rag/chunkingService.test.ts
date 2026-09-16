import { chunkText } from './chunkingService';

describe('chunkingService', () => {
  beforeEach(() => {
    // Set environment variables for testing
    process.env.CHUNK_SIZE = '100';
    process.env.CHUNK_OVERLAP = '20';
  });

  afterEach(() => {
    delete process.env.CHUNK_SIZE;
    delete process.env.CHUNK_OVERLAP;
  });

  it('should handle very short documents (smaller than chunk size)', () => {
    const text = 'This is a very short document.';
    const chunks = chunkText(text);
    
    expect(chunks.length).toBe(1);
    expect(chunks[0]).toBe('This is a very short document.');
  });

  it('should handle documents with no clear paragraph breaks (fallback to sentences/characters)', () => {
    // Generate a long text without paragraph breaks
    const sentence = 'This is a long sentence that just keeps going on and on. ';
    const text = sentence.repeat(5); // ~285 chars
    
    const chunks = chunkText(text);
    
    expect(chunks.length).toBeGreaterThan(1);
    // Ensure no chunk exceeds the 100 char limit (plus a small margin for overlap safety)
    chunks.forEach(chunk => {
      expect(chunk.length).toBeLessThanOrEqual(120);
    });
  });

  it('should handle normal paragraph breaks properly', () => {
    const p1 = 'This is paragraph one. It has some text.';
    const p2 = 'This is paragraph two. It is also quite short.';
    const p3 = 'This is paragraph three. It should be in the next chunk if it exceeds the limit.';
    
    const text = `${p1}\n\n${p2}\n\n${p3}`;
    
    // Chunk size is 100. p1 + p2 = 40 + 46 = 86 chars. They should fit in one chunk.
    const chunks = chunkText(text);
    
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toContain(p1);
    expect(chunks[0]).toContain(p2);
    expect(chunks[0]).not.toContain(p3); // P3 should be pushed to next chunk
  });
});
