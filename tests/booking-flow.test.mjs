import assert from 'node:assert/strict';
import test from 'node:test';
import { transitionBooking, validateDraft } from '../src/lib/bookingFlow.ts';

const now = new Date('2026-09-11T10:00:00');
const draft = { serviceId: 'plumber', description: 'Leaking kitchen sink pipe', address: '42, MG Road, Bengaluru', date: '2026-09-12', time: '09:00' };
const booking = { ...draft, id: 'LF-TEST', customerName: 'Test', serviceName: 'Plumber', startingPrice: 199, visitFee: 60, status: 'requested', quote: null, paid: false, rating: 0, createdAt: now.toISOString() };

test('validates complete, future appointments', () => {
  assert.equal(validateDraft(draft, now), null);
  for (const change of [{ description: ' ' }, { address: ' ' }, { date: '2026-09-10' }, { date: '2026-09-11', time: '09:00' }, { date: '2026-11-01' }, { time: 'not-a-time' }, { date: '2026-02-31' }]) {
    assert.ok(validateDraft({ ...draft, ...change }, now));
  }
});

test('follows the full request, quote, work, payment and rating lifecycle', () => {
  let current = booking;
  for (const action of ['accept', 'travel', 'arrive', 'quote', 'approve', 'complete', 'pay', 'rate']) {
    current = transitionBooking(current, action, action === 'rate' ? 5 : 350);
  }
  assert.equal(current.status, 'completed');
  assert.equal(current.quote, 350);
  assert.equal(current.paid, true);
  assert.equal(current.rating, 5);
  assert.equal(booking.status, 'requested');
});

test('prevents skipped stages and duplicate payments', () => {
  assert.throws(() => transitionBooking(booking, 'complete'));
  assert.throws(() => transitionBooking(booking, 'pay'));
  assert.throws(() => transitionBooking(booking, 'approve'));
  assert.throws(() => transitionBooking({ ...booking, status: 'completed', quote: 350, paid: true }, 'pay'));
});

test('validates quotes and ratings', () => {
  for (const amount of [0.01, 19.99, 350.55, 100000]) {
    assert.equal(transitionBooking({ ...booking, status: 'arrived' }, 'quote', amount).quote, amount);
  }
  for (const amount of [NaN, Infinity, -1, 0, 100001, 1.234]) {
    assert.throws(() => transitionBooking({ ...booking, status: 'arrived' }, 'quote', amount));
  }
  assert.throws(() => transitionBooking(booking, 'rate', 5));
  for (const amount of [0, 6, 2.5, NaN]) {
    assert.throws(() => transitionBooking({ ...booking, paid: true }, 'rate', amount));
  }
});

test('cancellation is terminal and disallowed after work starts', () => {
  const cancelled = transitionBooking(booking, 'cancel');
  assert.equal(cancelled.status, 'cancelled');
  assert.throws(() => transitionBooking(cancelled, 'accept'));
  for (const status of ['in_progress', 'completed', 'cancelled']) {
    assert.throws(() => transitionBooking({ ...booking, status }, 'cancel'));
  }
});