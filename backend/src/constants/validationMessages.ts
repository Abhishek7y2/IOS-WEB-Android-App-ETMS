/**
 * Centralized Validation Messages for backend request validation.
 * Grouped by domain (AUTH, TASK) to maintain single responsibility and clean architecture.
 * Yahan saare error aur validation messages ek jagah store kiye gaye hain taaki 
 * pure code mein ek jaisa message system use ho aur messages easily change kiye ja sakein.
 */

export const VALIDATION_MESSAGES = {
  // Authentication se related saare validation messages ka group
  AUTH: {
    // Email validation errors
    EMAIL_REQUIRED: 'Valid email is required', // Jab email ki field khali ho
    EMAIL_INVALID: 'Please enter a valid email address', // Jab email ka format galat ho (jaise bina @ ke)
    EMAIL_TOO_LONG: 'Email cannot exceed 254 characters', // Jab email maximum limit se zyada lamba ho

    // Password rules validation errors
    PASSWORD_LENGTH_RANGE: 'Password must be between 8 and 64 characters', // Password ki length limit
    PASSWORD_UPPERCASE: 'Password must contain at least one uppercase letter', // Ek bada letter zaroori hai
    PASSWORD_LOWERCASE: 'Password must contain at least one lowercase letter', // Ek chhota letter zaroori hai
    PASSWORD_NUMBER: 'Password must contain at least one number', // Ek number (digit) zaroori hai
    PASSWORD_SPECIAL_CHAR: 'Password must contain at least one special character', // Ek special character (!@#) zaroori hai
    PASSWORD_SPACES_ONLY: 'Password cannot consist only of spaces', // Password sirf space nahi ho sakta
    PASSWORD_TOO_COMMON: 'This password is too common and insecure', // Aam aur weak passwords ko rokne ke liye
    PASSWORD_INVALID_CHARS: 'Password contains invalid characters', // Unwanted characters ke liye
    PASSWORD_TOO_LONG: 'Password cannot exceed 128 characters', // Maximum password size
    PASSWORD_RESET_LENGTH_RANGE: 'Password must be between 8 and 128 characters', // Reset ke dauran password length check

    // Profile aur Personal details ki validation
    FIRST_NAME_REQUIRED: 'First name is required', // First name lazmi hai
    FIRST_NAME_MIN_LENGTH: 'First name must be at least 2 characters', // Kam se kam 2 alphabet zaroori hain
    FIRST_NAME_INVALID: 'First name must start with a letter and contain only letters, dots, quotes, and hyphens', // Sahi format

    LAST_NAME_REQUIRED: 'Last name is required', // Last name lazmi hai
    LAST_NAME_INVALID: 'Last name must start with a letter and contain only letters, spaces, dots, quotes, and hyphens', // Sahi format check

    // Mobile Number Validation
    MOBILE_NUMBER_INVALID: 'Mobile number must be exactly 10 digits', // Sahi format for mobile number
    COUNTRY_CODE_REQUIRED: 'Country code is required', // Country code check jaise +91
    GENDER_REQUIRED: 'Gender is required', // Gender ki field check

    // OTP aur Login se related checks
    LOGIN_CREDENTIALS_REQUIRED: 'Email or Mobile Number is required', // Agar user kuch na dale to ye message
    OTP_REQUIRED: 'Verification code is required', // Agar OTP submit karte waqt khali field ho
  },

  // Task creation aur assignment se related validation messages ka group
  TASK: {
    // Title fields validation
    TITLE_REQUIRED: 'Please enter a task title.', // Title na dene par
    TITLE_EMPTY: 'Please enter a task title.', // Title sirf space dene par
    TITLE_TOO_LONG: 'Please keep the task title under 150 characters.', // Maximum title length

    // Description fields validation
    DESCRIPTION_REQUIRED: 'Please enter a task description.', // Description zaroori hai
    DESCRIPTION_EMPTY: 'Please enter a task description.', // Description me sirf space nahi allowed
    DESCRIPTION_TOO_LONG: 'Please keep the task description under 500 characters.', // Description ki maximum limit

    // Dynamic validation messages jo array/lists se values lete hain
    STATUS_INVALID: (statusValues: string[]) => `Please select a valid task status from: ${statusValues.join(', ')}.`, // Allowed status options jaise (To Do, Done)
    PRIORITY_INVALID: (priorityValues: string[]) => `Please select a valid task priority from: ${priorityValues.join(', ')}.`, // Allowed priorities jaise (High, Low)

    // Date fields validation
    DUE_DATE_REQUIRED: 'Please select a due date.', // Date submit na karne par
    DUE_DATE_INVALID: 'Please select a valid due date.', // Agar di gayi date galat ho (purani ya galat format me)

    // Assignment fields validation
    ASSIGNED_TO_REQUIRED: 'Please assign this task to an employee.', // Kisko task dia hai uski details
    ASSIGNED_TO_INVALID: 'Please select a valid employee for task assignment.', // Agar wo employee database me na ho
  },
};
