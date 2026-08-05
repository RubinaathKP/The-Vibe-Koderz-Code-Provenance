import test from 'node:test';
import assert from 'node:assert';
import { encryptToken, decryptToken } from '../src/utils/crypto';

// Test suite for validation of security token cookies
test('Crypto Utils: encryptToken & decryptToken integrity', () => {
  const original = 'usr_demo_178590';

  // 1. Verify encryption output
  const encrypted = encryptToken(original);
  assert.ok(encrypted, 'Encrypted token should not be empty');
  assert.notStrictEqual(encrypted, original, 'Encrypted token should be successfully obfuscated');

  // 2. Verify decryption output matches original payload
  const decrypted = decryptToken(encrypted);
  assert.strictEqual(decrypted, original, 'Decrypted token must match the original string exactly');
});

test('Crypto Utils: handles corrupt/invalid decryption values', () => {
  const corruptValue = '!!!not_base_64!!!';
  const decrypted = decryptToken(corruptValue);
  assert.strictEqual(decrypted, '', 'Invalid base64 strings should decrypt to an empty string safely');
});
