import crypto from 'crypto';

export const generateSecureToken = (length = 48): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generates a cryptographically secure random OTP of a given length.
 * @param length The length of the OTP. Defaults to 6.
 * @returns A string representing the OTP.
 */
export const generateOtp = (length = 6): string => {
  // crypto.randomInt is cryptographically secure
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString().padStart(length, '0');
};
