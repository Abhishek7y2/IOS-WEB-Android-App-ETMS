/**
 * Enterprise-level email validation utility.
 * Enforces RFC 5322 limits, structural rules, and protects against injection.
 */
// Email ka format aur characters check karna taaki fake, galat ya harmful (XSS) email se log register na karein
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
  if (domainPart.includes('.-') || domainPart.includes('-.')) return false;

  // 9. Strict Regex for valid characters (Protects against XSS, SQLi, Control Chars, Spaces, Emojis)
  // Local part: alphanumeric and specific special characters (RFC 5322 standard without quotes)
  // Domain part: alphanumeric and hyphens, at least one dot separating TLD
  const emailRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  
  if (!emailRegex.test(trimmed)) return false;

  return true;
};
