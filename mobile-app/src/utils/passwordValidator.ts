export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const checkRequirements = (password: string): PasswordRequirements => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
});

export const isPasswordValid = (password: string): boolean => {
  const reqs = checkRequirements(password);
  return Object.values(reqs).every(Boolean);
};

export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  const reqs = checkRequirements(password);
  const passed = Object.values(reqs).filter(Boolean).length;
  if (passed <= 2) return 1; // Weak
  if (passed <= 4) return 2; // Medium
  return 3; // Strong
};

export const getPasswordValidationError = (password: string): string | null => {
  if (!password) return 'Please enter your password.';
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter (A-Z).';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter (a-z).';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number (0-9).';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character (e.g., !@#$%^&*).';
  }
  return null;
};
