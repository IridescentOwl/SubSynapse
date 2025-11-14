import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY is not set in the environment variables');
}

/**
 * Derives a key from the master key and a salt.
 * @param salt The salt to use for key derivation.
 * @returns The derived key.
 */
const getKey = (salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512');
};

/**
 * Encrypts a plaintext string.
 * @param text The plaintext to encrypt.
 * @returns The encrypted string in the format "salt:iv:encrypted:tag".
 */
export const encrypt = (text: string): string => {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = getKey(salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [salt.toString('hex'), iv.toString('hex'), encrypted.toString('hex'), tag.toString('hex')].join(':');
};

/**
 * Decrypts an encrypted string.
 * @param encryptedText The encrypted string in the format "salt:iv:encrypted:tag".
 * @returns The decrypted plaintext.
 */
export const decrypt = (encryptedText: string): string => {
  const [salt, iv, encrypted, tag] = encryptedText.split(':').map((part) => Buffer.from(part, 'hex'));
  const key = getKey(salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};
