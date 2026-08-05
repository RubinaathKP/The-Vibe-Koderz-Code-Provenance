import test from 'node:test';
import assert from 'node:assert';
import COUNTRY_CODES_JSON from '../src/components/countries.json';

// Test suite for phone validations registry
test('Phone Database: validation registry structures', () => {
  assert.ok(Array.isArray(COUNTRY_CODES_JSON), 'Countries config must be a list');
  assert.ok(COUNTRY_CODES_JSON.length >= 100, `Country database must contain at least 100 records (found: ${COUNTRY_CODES_JSON.length})`);

  // Target specific country validation indices
  const inRecord = COUNTRY_CODES_JSON.find(c => c.code === 'IN');
  assert.ok(inRecord, 'IN (India) should be a registered record');
  assert.strictEqual(inRecord?.dialCode, '+91', 'India dial code prefix should be +91');
  assert.strictEqual(inRecord?.length, 10, 'India phone validation length should be 10 digits');

  // Verify format parameters across all listings
  for (const record of COUNTRY_CODES_JSON) {
    assert.ok(record.code, 'Country entry must have an ISO code');
    assert.ok(record.dialCode.startsWith('+'), 'Dial code must begin with +');
    assert.ok(record.name, 'Country name must not be blank');
    assert.ok(record.length > 0, 'Required numeric length must be positive');
    assert.ok(record.flag, 'Flag emoji character must be set');
  }
});
