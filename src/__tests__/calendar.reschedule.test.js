import { hasTimeConflict } from '../utils/smartScheduling';

const canReschedule = (evs, id, start, end) => !hasTimeConflict(evs.filter(e=>e.id!==id), start, end, {});

test('reject reschedule on overlap', () => {
  const evs = [
    { id:'1', start_time:'2025-08-11T10:00:00Z', end_time:'2025-08-11T12:00:00Z' },
    { id:'2', start_time:'2025-08-11T12:30:00Z', end_time:'2025-08-11T13:30:00Z' }
  ];
  expect(canReschedule(evs, '2', '2025-08-11T11:45:00Z', '2025-08-11T13:45:00Z')).toBe(false);
});

test('accept reschedule when no conflict', () => {
  const evs = [
    { id:'1', start_time:'2025-08-11T10:00:00Z', end_time:'2025-08-11T12:00:00Z' },
    { id:'2', start_time:'2025-08-11T12:30:00Z', end_time:'2025-08-11T13:30:00Z' }
  ];
  expect(canReschedule(evs, '2', '2025-08-11T13:30:00Z', '2025-08-11T14:30:00Z')).toBe(true);
});

