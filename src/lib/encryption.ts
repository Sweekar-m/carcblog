import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for AES-GCM

/**
 * Retrieves the encryption key from process.env or import.meta.env.
 * STRIKING REQUIREMENT: Strictly NO hardcoded fallback values.
 * Throws a descriptive error if ENCRYPTION_SECRET is missing.
 */
function getEncryptionSecret(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || (import.meta.env && import.meta.env.ENCRYPTION_SECRET);
  
  if (!secret || typeof secret !== 'string' || secret.trim() === '') {
    throw new Error('SECURITY CRITICAL: ENCRYPTION_SECRET environment variable is missing. All encryption/decryption operations are blocked.');
  }

  // Derive a 32-byte key using sha256 so any arbitrary secret string produces a valid 256-bit key
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a plaintext API key using AES-256-GCM.
 * Output format: `ivHex:authTagHex:encryptedHex`
 */
export function encryptApiKey(plaintext: string): string {
  if (!plaintext || plaintext.trim() === '') {
    throw new Error('Cannot encrypt an empty key.');
  }

  const key = getEncryptionSecret();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts an AES-256-GCM encrypted API key.
 */
export function decryptApiKey(encryptedPayload: string): string {
  if (!encryptedPayload || !encryptedPayload.includes(':')) {
    throw new Error('Invalid encrypted payload format.');
  }

  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Corrupted encryption payload structure.');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionSecret();

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Formats an API key for safe UI display (e.g. `sk-o••••••••1234`).
 * Plaintext keys are never sent to the client after initial entry.
 */
export function maskApiKey(key: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) {
    return '••••••••';
  }
  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-4);
  return `${prefix}••••••••${suffix}`;
}
