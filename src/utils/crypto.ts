/**
 * Synchronously encrypts a string using an XOR cipher and base-64 encoding.
 */
export function encryptToken(text: string): string {
  const key = 'iet_secure_key_2026';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

/**
 * Synchronously decrypts a string encrypted with encryptToken.
 */
export function decryptToken(encoded: string): string {
  try {
    const text = atob(encoded);
    const key = 'iet_secure_key_2026';
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return '';
  }
}
