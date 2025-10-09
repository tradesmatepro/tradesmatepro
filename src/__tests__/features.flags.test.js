import { FEATURES } from '../utils/features';

test('flags default values', () => {
  expect(FEATURES.MESSAGING).toBe(false);
  expect(FEATURES.INTEGRATIONS).toBe(false);
  expect(FEATURES.INVOICING).toBe(true);
  expect(FEATURES.REPORTS).toBe(true);
});

