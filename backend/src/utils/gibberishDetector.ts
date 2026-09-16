/**
 * Gibberish Detector Utility
 * Evaluates whether a user's input string is meaningless gibberish (e.g., keyboard mashing, repeated characters, pure punctuation)
 * while preserving typos, technical terms, and emojis.
 */
export function isGibberish(text: string): boolean {
  if (!text) return false;
  
  const trimmed = text.trim();

  // 1. Check for excessive repeated characters anywhere in the string (e.g., "aaaaaaa", "kkkkkk", "111111")
  // Using 5 repeats (6 total identical consecutive characters) as a safe threshold
  if (/(.)\1{5,}/.test(trimmed)) {
    return true;
  }

  // 2. Check for common keyboard mashing sequences
  const mashingRegex = /asdf|qwer|zxcv|hjkl|uiop|tyui|ghjk|vbnm|lkjh|mnbv|poiu|qwpo|qaz|wsx|edc|fdsa|rewq|vcxz|qwerty|poiuy|zxcvb|lkjhg|mnbvc|1234|2345|3456|4567|5678|6789|7890|0987|9876|8765|7654|6543|5432|4321|abcde|bcdef|testtest|dummy|blah|ajsd|laks|kjas|skld/i;
  // If the message is relatively short and contains a mash pattern, it's likely gibberish
  if (trimmed.length < 20 && mashingRegex.test(trimmed)) {
    return true;
  }

  // 3. Check for pure standard punctuation overload (length >= 3)
  // This explicitly avoids matching Emojis, because Emojis are outside standard ASCII ranges.
  const onlyAsciiSymbols = /^[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\.\<\>\/\?\\\|]{3,}$/;
  if (onlyAsciiSymbols.test(trimmed)) {
    return true;
  }

  // 4. Check for high consonant ratio (random typing like 'lkjhgf')
  // We check words over 5 characters to see if they lack vowels
  const words = trimmed.split(/\s+/);
  for (const word of words) {
    if (word.length > 5) {
      // Ignore if it looks like a URL or a technical ID
      if (word.startsWith('http') || /^[0-9a-fA-F-]+$/.test(word)) continue;
      
      const vowels = word.match(/[aeiouyAEIOUY]/g);
      const vowelCount = vowels ? vowels.length : 0;
      if (vowelCount === 0 || (word.length >= 8 && vowelCount <= 1)) {
        return true; // No vowels in a 6+ letter word, or 1 vowel in an 8+ letter word = probably gibberish
      }
    }
  }

  // If none of the gibberish rules matched, assume it's valid input, a typo, an acronym, or an emoji.
  return false;
}
