/**
 * Enterprise-level email validation utility.
 * Enforces RFC 5322 limits, structural rules, and protects against injection.
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;

  // 1. Trim whitespace
  const trimmed = email.trim();

  // 2. Limit maximum total length to 254 characters (RFC 5321/5322)
  if (trimmed.length > 254) return false;

  // 3. Reject multiple '@' symbols or missing '@'
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;

  const [localPart, domainPart] = parts;

  // 4. Validate Local Part length (max 64 characters)
  if (!localPart || localPart.length > 64) return false;

  // 5. Validate Domain Part length (max 255 but overall is 254, so it's implicitly bounded, must be > 0)
  if (!domainPart || domainPart.length === 0) return false;

  // 6. Reject consecutive dots (..) in local or domain part
  if (trimmed.includes('..')) return false;

  // 7. Reject emails starting or ending with a dot in local part
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;

  // 8. Reject domains starting or ending with a hyphen or dot
  if (domainPart.startsWith('-') || domainPart.endsWith('-')) return false;
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;

  // 9. Strict Regex for valid characters (Protects against XSS, SQLi, Control Chars, Spaces, Emojis)
  // Local part: alphanumeric and specific special characters (RFC 5322 standard without quotes)
  // Domain part: alphanumeric and hyphens, at least one dot separating TLD (2-4 characters)
  const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/;
  
  if (!emailRegex.test(trimmed)) return false;

  // Additional typo checks
  const lowerTrimmed = trimmed.toLowerCase();
  
  // Known invalid TLD typos
  const invalidTLDs = ['.cov', '.con', '.cm', '.cpm', '.co.n', '.comn', '.comm', '.co.uk.co', '.co.in.co'];
  if (invalidTLDs.some(tld => lowerTrimmed.endsWith(tld))) return false;

  // Domain specific strict checks
  const domain = lowerTrimmed.split('@')[1];
  if (domain) {
    // If it looks like gmail, ensure it's exactly gmail.com
    if (domain.startsWith('gmail.') && domain !== 'gmail.com') return false;
    if (domain.startsWith('googlemail.') && domain !== 'googlemail.com') return false;
    
    // Yahoo
    if (domain.startsWith('yahoo.') && !['yahoo.com', 'yahoo.co.in', 'yahoo.co.uk', 'yahoo.ca'].includes(domain)) return false;
    
    // Hotmail / Outlook
    if (domain.startsWith('hotmail.') && !['hotmail.com', 'hotmail.co.uk'].includes(domain)) return false;
    if (domain.startsWith('outlook.') && !['outlook.com', 'outlook.co.in'].includes(domain)) return false;
  }

  // Legacy hardcoded typos
  if (lowerTrimmed.endsWith('@gmail.co') || lowerTrimmed.endsWith('@yahoo.co') || lowerTrimmed.endsWith('@hotmail.co')) return false;

  return true;
};
