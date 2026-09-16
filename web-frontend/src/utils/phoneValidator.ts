import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js/max';

/**
 * Validates a mobile number dynamically against a specific country's rules.
 * @param phoneNumber The phone number string (digits only or with country code).
 * @param countryIso The 2-letter ISO country code (e.g., 'IN', 'US', 'AL').
 * @returns An error message if invalid, or null if valid.
 */
export const validateMobileNumber = (phoneNumber: string, countryIso: string): string | null => {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  if (!digitsOnly) {
    return 'Please enter your Mobile number.';
  }

  // Parse the ISO string to CountryCode type that libphonenumber-js expects
  const isoCode = (countryIso || 'IN').toUpperCase() as CountryCode;

  try {
    // libphonenumber-js isValidPhoneNumber requires the number and the country code
    // The number can be passed without the +countrycode if the ISO is provided.
    if (!isValidPhoneNumber(digitsOnly, isoCode)) {
      return `Please enter the valid Phone number`;
    }
  } catch {
    return 'Invalid phone number format for the selected country.';
  }

  // Additional explicit rule for India (must start with 6, 7, 8, or 9 and be exactly 10 digits)
  // libphonenumber-js handles most of this, but it's good to be explicit for known strict locales
  if (isoCode === 'IN') {
    if (digitsOnly.length !== 10) {
      return 'Please enter the valid Phone number';
    }
    if (!/^[6-9]/.test(digitsOnly)) {
      return 'Indian mobile numbers must start with 6, 7, 8, or 9.';
    }
  }

  return null;
};
