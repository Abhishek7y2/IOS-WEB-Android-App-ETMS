// Yeh file sensitive data (jaise messages) ko encrypt aur decrypt karne ke kaam aati hai
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;      // 96-bit IV — recommended for GCM
const TAG_LENGTH = 16;     // 128-bit auth tag

function getKey(): Buffer {
  const keyHex = process.env.AES_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error(
      'AES_ENCRYPTION_KEY must be set in .env and must be exactly 64 hex characters (32 bytes).'
    );
  }
  return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypts a plain-text string using AES-256-GCM.
 * Returns a single colon-delimited string: `iv:authTag:ciphertext` (all hex-encoded).
 * A fresh random IV is generated per call, so identical inputs produce different ciphertext.
 */
// Data ko safe (encrypt) karna taaki koi aur ise padh na sake
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
}

/**
 * Decrypts a string previously produced by `encrypt()`.
 * Verifies the GCM auth tag — throws if the ciphertext has been tampered with.
 */
// Encrypted data ko wapas normal text me badalna (decrypt karna)
export function decrypt(ciphertext: string): string {
  const key = getKey();
  const parts = ciphertext.split(':');

  if (parts.length !== 3) {
    throw new Error('crypto.ts: Invalid encrypted value format — expected iv:authTag:ciphertext.');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encryptedData = Buffer.from(encryptedHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
