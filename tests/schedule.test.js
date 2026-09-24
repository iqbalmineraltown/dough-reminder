import test from 'node:test';
import assert from 'node:assert/strict';
import { steps, nextDeadline, formatTime } from '../schedule.js';

test('the preset schedules four folds 30 minutes apart and bulk for two hours', () => {
  const start = new Date(2026, 0, 12, 9).getTime();
  let due = start;
  const deadlines = steps.slice(0, 6).map(step => (due = nextDeadline(step, due)));
  assert.deepEqual(deadlines.map(time => (time - start) / 60_000), [30, 60, 90, 120, 150, 270]);
});

test('overnight proof uses 8 AM on the following local calendar day, not a fixed duration', () => {
  const start = new Date(2026, 2, 7, 23, 45);
  const end = new Date(nextDeadline(steps[6], start.getTime()));
  const expected = new Date(2026, 2, 8, 8);
  assert.equal(end.getTime(), expected.getTime());
  assert.equal(end.getHours(), 8);
  assert.equal(end.getMinutes(), 0);
  assert.equal(nextDeadline(steps[7], end.getTime()), null);
});

test('countdown rounds remaining seconds up and clamps overdue time', () => {
  assert.equal(formatTime(1), '00:01');
  assert.equal(formatTime(60_001), '01:01');
  assert.equal(formatTime(3_600_000), '1h 00m');
  assert.equal(formatTime(-500), '00:00');
});
