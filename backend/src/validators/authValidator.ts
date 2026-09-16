import { body } from 'express-validator';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';
import { isValidMobileNumber } from '../utils/mobileValidator';
import { isValidEmail } from '../utils/emailValidator';

// Naya user register (signup) karte waqt frontend se aaye hue data ko check karne ke rules
export const registerValidation = [
  body('email')
    .trim()
    .toLowerCase()
    .custom((value) => {
      if (!isValidEmail(value)) {
        throw new Error(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID);
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8, max: 64 })
    .withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_LENGTH_RANGE)
    .matches(/[A-Z]/)
    .withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_UPPERCASE)
    .matches(/[a-z]/)
    .withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_LOWERCASE)
    .matches(/[0-9]/)
    .withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_NUMBER)
    .matches(/[!@#$%^&*()_+=\-[\]{};:',.<>?/\\|`~]/)
    .withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_SPECIAL_CHAR)
    .custom((value) => {
      if (value.trim().length === 0) {
        throw new Error(VALIDATION_MESSAGES.AUTH.PASSWORD_SPACES_ONLY);
      }
      const commonPasswords = ['password', 'password123', 'qwerty', 'admin123', '12345678', 'welcome123'];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error(VALIDATION_MESSAGES.AUTH.PASSWORD_TOO_COMMON);
      }
      const allowedRegex = /^[a-zA-Z0-9!@#$%^&*()_+=\-[\]{};:',.<>?/\\|`~\s]*$/;
      if (!allowedRegex.test(value)) {
        throw new Error(VALIDATION_MESSAGES.AUTH.PASSWORD_INVALID_CHARS);
      }
      return true;
    }),
  body('firstName')
    .custom((value) => {
      const trimmed = (value || '').trim();
      if (!trimmed) throw new Error('First Name is required');
      if (trimmed.length < 2) throw new Error('First Name must be at least 2 characters long');
      if (trimmed.length > 50) throw new Error('First Name must be at most 50 characters long');
      if (!/^[A-Z]/.test(trimmed)) throw new Error('First Name must start with a capital letter');
      if (/[0-9]/.test(trimmed)) throw new Error('First Name should only contain letters');
      if (/\s/.test(trimmed)) throw new Error('First Name cannot contain spaces');
      if (!/^[A-Z][a-zA-Z]*(?:['-][a-zA-Z]+)*$/.test(trimmed)) throw new Error('First Name has invalid characters or consecutive symbols');
      return true;
    }),
  body('lastName')
    .custom((value) => {
      const trimmed = (value || '').trim();
      if (!trimmed) throw new Error('Last Name is required');
      if (trimmed.length < 2) throw new Error('Last Name must be at least 2 characters long');
      if (trimmed.length > 50) throw new Error('Last Name must be at most 50 characters long');
      if (!/^[A-Z]/.test(trimmed)) throw new Error('Last Name must start with a capital letter');
      if (/[0-9]/.test(trimmed)) throw new Error('Last Name should only contain letters');
      if (!/^[A-Z][a-zA-Z]*(?:[\s'-][a-zA-Z]+)*$/.test(trimmed)) throw new Error('Last Name has invalid characters or consecutive spaces/symbols');
      return true;
    }),
  body('mobileNumber')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .escape()
    .custom((value, { req }) => {
      const countryCode = req.body.countryCode || '+91';
      if (!isValidMobileNumber(value, countryCode)) {
        if (countryCode === '+91') {
          throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
        } else {
          throw new Error('Please enter a valid mobile number for the selected country.');
        }
      }
      return true;
    }),
  body('countryCode')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.AUTH.COUNTRY_CODE_REQUIRED),
  body('gender')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.AUTH.GENDER_REQUIRED),
  body('qualification')
    .trim()
    .optional(),
];

export const loginValidation = [
  body('password')
    .isLength({ max: 128 }).withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_TOO_LONG),
  body().custom((value) => {
    if (!value.email && !value.mobileNumber) {
      throw new Error(VALIDATION_MESSAGES.AUTH.LOGIN_CREDENTIALS_REQUIRED);
    }
    if (value.email) {
      if (!isValidEmail(value.email.trim().toLowerCase())) {
        throw new Error(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID);
      }
    } else {
      if (!value.countryCode) {
        throw new Error(VALIDATION_MESSAGES.AUTH.COUNTRY_CODE_REQUIRED);
      }
      if (!value.mobileNumber || !isValidMobileNumber(value.mobileNumber, value.countryCode)) {
        if (value.countryCode === '+91') {
          throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
        } else {
          throw new Error('Please enter a valid mobile number for the selected country.');
        }
      }
    }
    return true;
  }),
];

export const forgotPasswordValidation = [
  body('email').optional().trim().toLowerCase(),
  body().custom((value) => {
    if (!value.email && !value.mobileNumber) {
      throw new Error('Email or Mobile Number is required');
    }
    if (value.email) {
      if (!isValidEmail(value.email)) {
        throw new Error(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID);
      }
    } else {
      if (!value.countryCode) {
        throw new Error(VALIDATION_MESSAGES.AUTH.COUNTRY_CODE_REQUIRED);
      }
      if (!value.mobileNumber || !isValidMobileNumber(value.mobileNumber, value.countryCode)) {
        if (value.countryCode === '+91') {
          throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
        } else {
          throw new Error('Please enter a valid mobile number for the selected country.');
        }
      }
    }
    return true;
  }),
];

export const resetPasswordValidation = [
  body('email').optional().trim().toLowerCase(),
  body().custom((value) => {
    if (!value.email && !value.mobileNumber) {
      throw new Error('Email or Mobile Number is required');
    }
    if (value.email) {
      if (!isValidEmail(value.email)) {
        throw new Error(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID);
      }
    } else {
      if (!value.countryCode) {
        throw new Error(VALIDATION_MESSAGES.AUTH.COUNTRY_CODE_REQUIRED);
      }
      if (!value.mobileNumber || !isValidMobileNumber(value.mobileNumber, value.countryCode)) {
        if (value.countryCode === '+91') {
          throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
        } else {
          throw new Error('Please enter a valid mobile number for the selected country.');
        }
      }
    }
    return true;
  }),
  body('otp').notEmpty().withMessage(VALIDATION_MESSAGES.AUTH.OTP_REQUIRED),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage(VALIDATION_MESSAGES.AUTH.PASSWORD_RESET_LENGTH_RANGE),
];
