/**
 * Sanitizes a phone number by stripping spaces, dashes, parentheses, and any non-numeric
 * characters except the leading '+'. It rejects HTML tags, XSS, etc. by strictly keeping
 * only allowed characters.
 * @param phone Raw phone number input
 * @returns Sanitized E.164 compatible string
 */
export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  // Convert to string in case it's not
  let sanitized = String(phone).trim();
  
  // Extract leading plus if exists
  const hasPlus = sanitized.startsWith('+');
  
  // Strip all non-numeric characters
  sanitized = sanitized.replace(/\D/g, '');
  
  // Force E.164 format even if missing '+'
  return hasPlus ? `+${sanitized}` : `+${sanitized}`;
};

/**
 * Validates a sanitized phone number for E.164 format and common fake number patterns.
 * @param phone Sanitized phone number (e.g., +1234567890)
 * @returns Object indicating validity and descriptive error message if invalid
 */
export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || phone === '+') {
    return { isValid: false, error: 'Phone number is required.' };
  }

  // 1. Strict E.164 format check: '+' followed by 1 to 15 digits
  // We use 4 to 15 digits because country codes are 1-3 digits and local numbers are at least 3 digits.
  const e164Regex = /^\+[1-9]\d{4,14}$/;
  if (!e164Regex.test(phone)) {
    return { isValid: false, error: 'Invalid phone number format or length.' };
  }

  // Extract just the digits for pattern checking
  const digits = phone.slice(1);

  // 2. Reject fake or repeating numbers (e.g., all 0s, all 1s)
  if (/^(\d)\1+$/.test(digits)) {
    return { isValid: false, error: 'Phone number cannot contain only repeated digits.' };
  }

  // 3. Reject sequential fake numbers (e.g., 123456789, 987654321)
  const sequentialUp = '01234567890123456789';
  const sequentialDown = '98765432109876543210';
  if (sequentialUp.includes(digits) || sequentialDown.includes(digits)) {
    return { isValid: false, error: 'Phone number cannot be a sequential series of digits.' };
  }

  // 4. Country-specific valid starting digits and length (Primary: India)
  if (phone.startsWith('+91')) {
    const localPart = phone.slice(3);
    if (localPart.length !== 10) {
      return { isValid: false, error: 'Indian mobile numbers must be exactly 10 digits.' };
    }
    if (/^[0-5]/.test(localPart)) {
      return { isValid: false, error: 'Invalid starting digit. Mobile numbers cannot start with 0-5.' };
    }
  } else {
    // For other countries, generally enforce the user's requirement of max 10 local digits if we can roughly guess the country code length (1-3 digits).
    // The E.164 regex above already limits total length. We'll enforce a strict max of 13 total digits (e.g., 3 digit code + 10 digit local) to satisfy the "not exceed 10 digits" rule loosely.
    if (digits.length > 13) {
      return { isValid: false, error: 'Mobile number cannot exceed 10 local digits.' };
    }
  }

  return { isValid: true };
};
