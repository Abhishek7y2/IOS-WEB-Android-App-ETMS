/**
 * mobileValidator.ts
 * 
 * Reusable enterprise-grade utility for strict Indian mobile number validation.
 * Complies with OWASP validation standards.
 */

/**
 * Validates a mobile number dynamically based on country code.
 * Rejects emojis, letters, symbols, whitespace, and validates length/prefixes.
 */
// Mobile number check karna (sirf numbers hone chahiye aur India ke hisaab se exactly 10 digits hone chahiye)
export const isValidMobileNumber = (mobileNumber: string, countryCode: string = '+91'): boolean => {
  if (!mobileNumber || typeof mobileNumber !== 'string') return false;

  // Trim to ensure we're only looking at the raw characters
  const trimmed = mobileNumber.trim();

  // It must contain ONLY digits (no spaces in between, no +, no -, no letters)
  const isDigitsOnly = /^\d+$/.test(trimmed);
  if (!isDigitsOnly) return false;

  if (countryCode === '+91') {
    // Exact 10 digits, starts with 6, 7, 8, or 9
    return /^[6-9]\d{9}$/.test(trimmed);
  } else {
    // For other countries, ITU standard allows 6 to 15 digits
    return trimmed.length >= 6 && trimmed.length <= 15;
  }
};
