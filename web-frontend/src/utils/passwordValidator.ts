/**
 * Reusable utility for password validation and strength estimation.
 * Separates validation logic from UI components.
 */

export interface PasswordRequirements {
  hasMinMaxLen: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export type StrengthLevel = 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';

export interface PasswordStrength {
  score: number; // 0 to 4
  level: StrengthLevel;
  colorClass: string; // Tailwind/CSS color representations
  barCount: number; // number of bars to fill
}

const COMMON_PASSWORDS = [
  'password',
  'password123',
  'qwerty',
  'admin123',
  '12345678',
  'welcome123',
];

// Special characters list: ! @ # $ % ^ & * ( ) _ + - = [ ] { } ; : ' " , . < > ? / \ | ` ~
const SPECIAL_CHARS_REGEX = /[!@#$%^&*()_+=\-[\]{};:',.<>?/\\|`~]/;

/**
 * Validates a password against individual requirements
 */
export function checkRequirements(password: string): PasswordRequirements {
  return {
    hasMinMaxLen: password.length >= 8 && password.length <= 64,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: SPECIAL_CHARS_REGEX.test(password),
  };
}

/**
 * Checks if the password is valid overall (satisfies all criteria and is not blocklisted)
 */
export function isPasswordValid(password: string): boolean {
  if (!password) return false;

  // Reject spaces only
  if (password.trim().length === 0) return false;

  // Reject common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) return false;

  const reqs = checkRequirements(password);
  return (
    reqs.hasMinMaxLen &&
    reqs.hasUppercase &&
    reqs.hasLowercase &&
    reqs.hasNumber &&
    reqs.hasSpecialChar
  );
}

/**
 * Returns specific custom error message if password is invalid
 */
export function getPasswordValidationError(password: string): string | null {
  if (!password) {
    return 'Please enter your password.';
  }
  if (password.trim().length === 0) {
    return 'Password cannot consist only of spaces.';
  }
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return 'This password is too common and insecure. Please choose a different one.';
  }
  const reqs = checkRequirements(password);
  if (!reqs.hasMinMaxLen) {
    return 'Password must be between 8 and 64 characters.';
  }
  if (!reqs.hasUppercase) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!reqs.hasLowercase) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!reqs.hasNumber) {
    return 'Password must contain at least one number.';
  }
  if (!reqs.hasSpecialChar) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

/**
 * Computes password strength details
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, level: 'Very Weak', colorClass: 'bg-zinc-200 dark:bg-zinc-800', barCount: 0 };
  }

  // If password consists only of spaces or is in the blocklist, it's immediately Very Weak
  if (password.trim().length === 0 || COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return { score: 0, level: 'Very Weak', colorClass: 'bg-red-500', barCount: 1 };
  }

  const reqs = checkRequirements(password);
  let score = 0;

  // 1. Length contributions
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1; // Extra credit for longer pass

  // 2. Character variety contributions
  if (reqs.hasLowercase) score += 1;
  if (reqs.hasUppercase) score += 1;
  if (reqs.hasNumber) score += 1;
  if (reqs.hasSpecialChar) score += 1;

  // 3. Penalty checks
  // Check for repeated sequences (e.g. aaaaa, 11111)
  const repeats = /(.)\1{3,}/.test(password); // 4 or more repeats
  if (repeats) {
    score = Math.max(1, score - 1);
  }

  // Map final score (0-6) to a 0-4 scale for strength meter levels
  // Max possible raw score is 6 (length >= 12, lowercase, uppercase, digit, special, and length >= 8)
  let finalScore = 0;
  if (score >= 6) {
    finalScore = 4; // Very Strong
  } else if (score === 5) {
    finalScore = 3; // Strong
  } else if (score === 4) {
    finalScore = 2; // Medium
  } else if (score >= 2) {
    finalScore = 1; // Weak
  } else {
    finalScore = 0; // Very Weak
  }

  const levels: Record<number, { level: StrengthLevel; colorClass: string; barCount: number }> = {
    0: { level: 'Very Weak', colorClass: 'bg-red-500', barCount: 1 },
    1: { level: 'Weak', colorClass: 'bg-orange-500', barCount: 2 },
    2: { level: 'Medium', colorClass: 'bg-yellow-500', barCount: 3 },
    3: { level: 'Strong', colorClass: 'bg-green-500', barCount: 4 },
    4: { level: 'Very Strong', colorClass: 'bg-emerald-600', barCount: 5 },
  };

  return {
    score: finalScore,
    ...levels[finalScore],
  };
}
