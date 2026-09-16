/**
 * Splits a given text into overlapping chunks using semantic boundaries (paragraphs, sentences).
 * @param text - The full text to split.
 * @returns Array of text chunks.
 */
export const chunkText = (text: string): string[] => {
  const chunkSize = parseInt(process.env.CHUNK_SIZE || '800', 10);
  const overlap = parseInt(process.env.CHUNK_OVERLAP || '150', 10);

  if (!text || text.trim() === '') return [];

  // Normalize excessive whitespace but preserve paragraph breaks
  const cleanText = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  // 1. Split by Paragraphs
  const paragraphs = cleanText.split('\n\n');
  const chunks: string[] = [];
  
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // If adding this paragraph keeps us under the limit, append it.
    if ((currentChunk.length + paragraph.length + 2) <= chunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph.trim();
    } else {
      // Current paragraph makes it too big.
      // Push the existing chunk if it's not empty.
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        // Start new chunk with overlap from previous chunk
        // We take the last `overlap` characters of the previous chunk as prefix
        const overlapText = currentChunk.length > overlap ? currentChunk.slice(-overlap) : currentChunk;
        currentChunk = overlapText;
      }
      
      // 2. If the single paragraph itself is larger than chunkSize, we must split by sentences
      if (paragraph.length > chunkSize) {
        // Split by sentences roughly (using dot followed by space)
        const sentences = paragraph.split(/(?<=\.)\s+/);
        
        for (const sentence of sentences) {
          if ((currentChunk.length + sentence.length + 1) <= chunkSize) {
            currentChunk += (currentChunk && !currentChunk.endsWith(' ') && !currentChunk.endsWith('\n') ? ' ' : '') + sentence.trim();
          } else {
            if (currentChunk && currentChunk.length > overlap) {
              chunks.push(currentChunk.trim());
              const overlapText = currentChunk.slice(-overlap);
              currentChunk = overlapText;
            }
            
            // 3. If a SINGLE sentence is STILL larger than chunkSize, fallback to character split
            if (sentence.length > chunkSize) {
              let sentenceStart = 0;
              while (sentenceStart < sentence.length) {
                const spaceLeft = chunkSize - currentChunk.length;
                const part = sentence.slice(sentenceStart, sentenceStart + spaceLeft);
                currentChunk += (currentChunk ? ' ' : '') + part;
                sentenceStart += spaceLeft;
                
                if (currentChunk.length >= chunkSize) {
                  chunks.push(currentChunk.trim());
                  currentChunk = currentChunk.slice(-overlap);
                }
              }
            } else {
              currentChunk += (currentChunk ? ' ' : '') + sentence.trim();
            }
          }
        }
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph.trim();
      }
    }
  }

  if (currentChunk && currentChunk.trim().length > overlap) { // Avoid pushing tiny trailing chunks
    chunks.push(currentChunk.trim());
  }

  return chunks;
};
