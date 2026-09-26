import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canStartJob, canViewJob, distanceKm, generateStartCode, normalizeMobile, validateIdentity, type Job, type Profile } from '../src/domain/marketplace';

const job: Job = { id: 'booking', customerId: 'customer', workerId: 'worker', customerName: 'Customer', workerName: 'Worker', category: 'Plumbing', title: 'Repair', description: '', address: '', scheduledAt: '', amount: 450, status: 'accepted', createdAt: '', escrowStatus: 'demo_held' };
test('only the assigned worker with the exact four-digit code can start a funded accepted job', () => {
  assert.equal(canStartJob(job, 'worker', '0427', '0427'), true);
  assert.equal(canStartJob(job, 'worker', '427', '0427'), false);
  assert.equal(canStartJob(job, 'worker', '1234', '0427'), false);
  assert.equal(canStartJob(job, 'someone-else', '0427', '0427'), false);
  for (const status of ['requested', 'in_progress', 'completed', 'cancelled'] as const) assert.equal(canStartJob({ ...job, status }, 'worker', '0427', '0427'), false);
  assert.equal(canStartJob({ ...job, escrowStatus: 'unfunded' }, 'worker', '0427', '0427'), false);
});
test('codes preserve leading zeros and reject biased random samples', () => {
  assert.equal(generateStartCode(array => { array[0] = 7; return array; }), '0007');
  let calls = 0;
  assert.equal(generateStartCode(array => { array[0] = calls++ === 0 ? 4294967295 : 1234; return array; }), '1234');
  assert.equal(calls, 2);
});
test('booking visibility is scoped to both role and identity', () => {
  const profile: Profile = { id: 'customer', name: '', phone: '', role: 'customer', verification: 'verified' };
  assert.equal(canViewJob(job, profile), true);
  assert.equal(canViewJob(job, { ...profile, id: 'other' }), false);
  assert.equal(canViewJob(job, { ...profile, role: 'worker' }), false);
});
test('geographic distance enforces a five-kilometer boundary', () => {
  assert.equal(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 }), 0);
  assert.ok(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0.04, longitude: 0 }) < 5);
  assert.ok(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0.05, longitude: 0 }) > 5);
});
test('verification requires both correctly formatted identifiers', () => {
  assert.equal(validateIdentity('234567890123', '123456789012'), null);
  assert.ok(validateIdentity('123456789012', '123456789012'));
  assert.ok(validateIdentity('234567890123', '123'));
});
test('mobile numbers normalize to Indian E.164 and reject invalid input', () => {
  for (const value of ['9876543210', '+91 98765 43210', '919876543210', '(98765) 43210']) {
    assert.equal(normalizeMobile(value), '+919876543210');
  }
  for (const value of ['', '1234567890', '987654321', '+449876543210', '9876543210extra', '98765432100']) {
    assert.equal(normalizeMobile(value), null);
  }
});