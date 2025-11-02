import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  it('should encrypt and decrypt a string', () => {
    const text = 'my-secret-password';
    const encrypted = EncryptionService.encrypt(text);
    const decrypted = EncryptionService.decrypt(encrypted);
    expect(decrypted).toBe(text);
  });
});
