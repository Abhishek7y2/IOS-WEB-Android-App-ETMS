import { isValidMobileNumber } from '../utils/mobileValidator';

// Mobile number check karne wale logic ki saari testing yahan hoti hai
describe('Indian Mobile Number Validation', () => {
  it('should accept valid 10-digit Indian numbers starting with 6-9', () => {
    expect(isValidMobileNumber('9876543210')).toBe(true);
    expect(isValidMobileNumber('8123456789')).toBe(true);
    expect(isValidMobileNumber('7123456789')).toBe(true);
    expect(isValidMobileNumber('6123456789')).toBe(true);
  });

  it('should reject numbers not starting with 6, 7, 8, or 9', () => {
    expect(isValidMobileNumber('5123456789')).toBe(false);
    expect(isValidMobileNumber('0123456789')).toBe(false);
    expect(isValidMobileNumber('1234567890')).toBe(false);
  });

  // 10 digits se chote (kam length wale) numbers allow nahi hone chahiye
  it('should reject numbers less than 10 digits', () => {
    expect(isValidMobileNumber('987654321')).toBe(false);
    expect(isValidMobileNumber('9876')).toBe(false);
  });

  it('should reject numbers more than 10 digits', () => {
    expect(isValidMobileNumber('98765432101')).toBe(false);
    expect(isValidMobileNumber('919876543210')).toBe(false);
  });

  it('should reject numbers containing alphabets or special characters', () => {
    expect(isValidMobileNumber('98765abcde')).toBe(false);
    expect(isValidMobileNumber('98765!@#$0')).toBe(false);
    expect(isValidMobileNumber('98765 4321')).toBe(false);
    expect(isValidMobileNumber('+9198765432')).toBe(false);
  });

  it('should handle whitespace appropriately (should reject if internal, accept if trimmed correctly before passing)', () => {
    // The utility strips leading/trailing space for safety, but internal spaces are rejected
    expect(isValidMobileNumber(' 9876543210 ')).toBe(true); 
    expect(isValidMobileNumber('98 76543210')).toBe(false); 
  });
});
