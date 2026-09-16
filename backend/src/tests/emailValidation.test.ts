import { isValidEmail } from '../utils/emailValidator';

// Email validation logic ki poori testing yahan likhi hai (Jest testing framework use karke)
describe('isValidEmail Enterprise Utility', () => {
  describe('Valid Emails (should return true)', () => {
    it('accepts standard emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('admin+filter@my-company.org')).toBe(true);
    });

    it('accepts modern TLDs', () => {
      expect(isValidEmail('info@photography.agency')).toBe(true);
      expect(isValidEmail('developer@startup.io')).toBe(true);
    });

    it('accepts numerical domains and local parts', () => {
      expect(isValidEmail('12345@123.com')).toBe(true);
      expect(isValidEmail('user123@domain123.net')).toBe(true);
    });

    it('accepts valid special characters in local part', () => {
      expect(isValidEmail('user_name@domain.com')).toBe(true);
      expect(isValidEmail('user-name@domain.com')).toBe(true);
      expect(isValidEmail('user!name@domain.com')).toBe(true);
      expect(isValidEmail('user#name@domain.com')).toBe(true);
      expect(isValidEmail('user$name@domain.com')).toBe(true);
    });
  });

  // Galat format wale emails ki testing, in par hamesha false aana chahiye
  describe('Invalid Emails (should return false)', () => {
    it('rejects missing or multiple @ symbols', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
      expect(isValidEmail('test@@example.com')).toBe(false);
      expect(isValidEmail('test@test@example.com')).toBe(false);
    });

    it('rejects consecutive dots', () => {
      expect(isValidEmail('test..name@example.com')).toBe(false);
      expect(isValidEmail('test@example..com')).toBe(false);
    });

    it('rejects dots at the start or end of local part', () => {
      expect(isValidEmail('.test@example.com')).toBe(false);
      expect(isValidEmail('test.@example.com')).toBe(false);
    });

    it('rejects hyphens at the start or end of domain', () => {
      expect(isValidEmail('test@-example.com')).toBe(false);
      expect(isValidEmail('test@example-.com')).toBe(false);
    });

    it('rejects missing TLD or domain parts', () => {
      expect(isValidEmail('test@example')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
    });
  });

  // Hackers wale (malicious, XSS ya SQLi) emails ki testing, jisse app secure rahe
  describe('Malicious Payloads & Injection Protection (should return false)', () => {
    it('rejects spaces in the email', () => {
      expect(isValidEmail('test name@example.com')).toBe(false);
      expect(isValidEmail('test@example com')).toBe(false);
    });

    it('rejects emojis and Unicode characters', () => {
      expect(isValidEmail('test😀@example.com')).toBe(false);
      expect(isValidEmail('test@😀example.com')).toBe(false);
    });

    it('rejects SQL injection payloads', () => {
      expect(isValidEmail("test' OR 1=1--@example.com")).toBe(false);
      expect(isValidEmail('admin" --@example.com')).toBe(false);
    });

    it('rejects XSS payloads', () => {
      expect(isValidEmail('<script>alert(1)</script>@example.com')).toBe(false);
      expect(isValidEmail('test@<script>alert(1)</script>.com')).toBe(false);
    });

    it('rejects control characters', () => {
      expect(isValidEmail('test\n@example.com')).toBe(false);
      expect(isValidEmail('test\t@example.com')).toBe(false);
    });
  });

  describe('Length Boundary Restrictions', () => {
    it('accepts local part exactly 64 characters', () => {
      const local = 'a'.repeat(64);
      expect(isValidEmail(`${local}@example.com`)).toBe(true);
    });

    it('rejects local part greater than 64 characters', () => {
      const local = 'a'.repeat(65);
      expect(isValidEmail(`${local}@example.com`)).toBe(false);
    });

    it('accepts total length up to 254 characters', () => {
      const local = 'a'.repeat(64);
      const domainPrefix = 'b'.repeat(185); // 64 + 1 (@) + 185 + 4 (.com) = 254
      expect(isValidEmail(`${local}@${domainPrefix}.com`)).toBe(true);
    });

    it('rejects total length greater than 254 characters', () => {
      const local = 'a'.repeat(64);
      const domainPrefix = 'b'.repeat(186); // 64 + 1 (@) + 186 + 4 (.com) = 255
      expect(isValidEmail(`${local}@${domainPrefix}.com`)).toBe(false);
    });
  });
});
