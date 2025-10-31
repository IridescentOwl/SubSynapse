const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'encryption_key'];

/**
 * Recursively masks sensitive data in an object.
 * @param data The data to mask.
 * @returns The masked data.
 */
const maskData = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(maskData);
  }

  if (typeof data === 'object') {
    const maskedObject: { [key: string]: any } = {};
    for (const key in data) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        maskedObject[key] = '[REDACTED]';
      } else {
        maskedObject[key] = maskData(data[key]);
      }
    }
    return maskedObject;
  }

  return data;
};

/**
 * Logs a message with sensitive data masked.
 * @param level The log level (e.g., 'info', 'error').
 * @param message The message to log.
 * @param data Additional data to log.
 */
export const log = (level: 'info' | 'error', message: string, data?: any): void => {
  const maskedData = data ? maskData(data) : '';
  console[level](`${new Date().toISOString()} [${level.toUpperCase()}] ${message}`, maskedData);
};
