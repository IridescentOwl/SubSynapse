import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  // Set up proper test environment
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.ENCRYPTION_KEY = '12345678901234567890123456789012';
  });

  it('should encrypt and decrypt a string', () => {
    const text = 'my-secret-password';
    const encrypted = EncryptionService.encrypt(text);
    const decrypted = EncryptionService.decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it('should produce different encrypted values for same input', () => {
    const text = 'same-input';
    const encrypted1 = EncryptionService.encrypt(text);
    const encrypted2 = EncryptionService.encrypt(text);
    expect(encrypted1).not.toBe(encrypted2); // Different IV each time
    expect(EncryptionService.decrypt(encrypted1)).toBe(text);
    expect(EncryptionService.decrypt(encrypted2)).toBe(text);
  });
});
