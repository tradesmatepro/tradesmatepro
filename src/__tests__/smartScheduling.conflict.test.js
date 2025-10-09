import { hasTimeConflict } from '../utils/smartScheduling';

test('touching edge is not conflict', () => {
  const evs = [{ start_time:'2025-08-11T10:00:00Z', end_time:'2025-08-11T12:00:00Z' }];
  expect(hasTimeConflict(evs, '2025-08-11T08:00:00Z', '2025-08-11T10:00:00Z', {})).toBe(false);
});

test('overlap is conflict', () => {
  const evs = [{ start_time:'2025-08-11T10:00:00Z', end_time:'2025-08-11T12:00:00Z' }];
  expect(hasTimeConflict(evs, '2025-08-11T11:00:00Z', '2025-08-11T13:00:00Z', {})).toBe(true);
});

