import { countries } from '../constants/countries';

export const validateMobileNumber = (mobileNumber: string, countryIso: string): string | null => {
  const digitsOnly = mobileNumber.replace(/\D/g, '');
  if (!digitsOnly) return 'Please enter your mobile number.';

  const country = countries.find((c) => c.iso === countryIso) || countries[0];

  if (country.code === '+91') {
    if (!/^[6-9]/.test(digitsOnly)) {
      return 'Indian mobile numbers must start with 6, 7, 8, or 9.';
    }
    if (digitsOnly.length !== 10) {
      return 'Please enter a valid 10-digit mobile number.';
    }
  } else {
    if (digitsOnly.length < 7 || digitsOnly.length > country.maxLength) {
      return `Mobile number must be between 7 and ${country.maxLength} digits for ${country.name}.`;
    }
  }

  return null;
};
