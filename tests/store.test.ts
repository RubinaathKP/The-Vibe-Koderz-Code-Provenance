import test from 'node:test';
import assert from 'node:assert';
import { initDb, saveDb } from '../server-store/store.js';

// Test suite for db filesystem robustness
test('Database Store: initDb and saveDb run without crashes', () => {
  // 1. Verify schema initialization structure
  const db = initDb();
  assert.ok(db, 'db schema should be populated');
  assert.ok(Array.isArray(db.users), 'db.users must be a list');
  assert.ok(Array.isArray(db.events), 'db.events must be a list');
  assert.ok(Array.isArray(db.projects), 'db.projects must be a list');

  // 2. Verify saving operations do not throw runtime exceptions
  assert.doesNotThrow(() => {
    saveDb(db);
  }, 'saveDb should capture read-only file exceptions without throwing crashes');
});
