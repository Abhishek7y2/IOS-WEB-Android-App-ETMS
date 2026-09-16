/**
 * Sanitizes a phone number by stripping spaces, dashes, parentheses, and any non-numeric
 * characters except the leading '+'. It rejects HTML tags, XSS, etc. by strictly keeping
 * only allowed characters.
 * @param phone Raw phone number input
 * @returns Sanitized E.164 compatible string
 */
import User from '../models/User';

export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  let sanitized = String(phone).trim();
  const hasPlus = sanitized.startsWith('+');
  sanitized = sanitized.replace(/\D/g, '');
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

  const e164Regex = /^\+[1-9]\d{4,14}$/;
  if (!e164Regex.test(phone)) {
    return { isValid: false, error: 'Invalid phone number format or length.' };
  }

  const digits = phone.slice(1);

  if (/^(\d)\1+$/.test(digits)) {
    return { isValid: false, error: 'Phone number cannot contain only repeated digits.' };
  }

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
    if (digits.length > 13) {
      return { isValid: false, error: 'Mobile number cannot exceed 10 local digits.' };
    }
  }

  return { isValid: true };
};

/**
 * Performs a comprehensive database lookup against the User collection to check if a mobile number
 * is already registered by another verified user account. Handles variations in formatting (+91, spaces, raw digits, etc.)
 */
export async function findUserByMobileNumber(mobileNumber: string, countryCode?: string, excludeUserId?: string) {
  if (!mobileNumber) return null;

  const rawCleanDigits = mobileNumber.replace(/\D/g, '');
  if (!rawCleanDigits) return null;

  const last10Digits = rawCleanDigits.slice(-10);
  const sanitized = sanitizePhoneNumber(mobileNumber);

  const orConditions: any[] = [
    { mobileNumber: mobileNumber },
    { mobileNumber: sanitized },
    { mobileNumber: rawCleanDigits },
    { mobileNumber: `+${rawCleanDigits}` },
  ];

  if (countryCode) {
    const ccClean = countryCode.replace(/\D/g, '');
    if (ccClean) {
      orConditions.push({ mobileNumber: `+${ccClean}${last10Digits}` });
      orConditions.push({ mobileNumber: `${ccClean}${last10Digits}` });
    }
  }

  if (last10Digits.length === 10) {
    orConditions.push({ mobileNumber: new RegExp(last10Digits + '$') });
  }

  const query: any = {
    isVerified: { $ne: false },
    $or: orConditions,
  };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  return await User.findOne(query);
}

