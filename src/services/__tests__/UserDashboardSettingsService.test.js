import UserDashboardSettingsService from '../UserDashboardSettingsService';

// Mocks
jest.mock('../../utils/supaFetch', () => ({
  supaFetch: jest.fn()
}));
jest.mock('../../utils/supabaseClient', () => ({
  getSupabaseClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: { user: { id: 'auth-uid-123' } } } })
    }
  })
}));

import { supaFetch } from '../../utils/supaFetch';

const companyId = 'company-abc';

describe('UserDashboardSettingsService (RLS via auth.uid)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('get() fetches using auth.uid filter', async () => {
    supaFetch.mockResolvedValueOnce({ ok: true, json: async () => ([{ id: 'row-1', notification_preferences: { preferred_dashboard: 'admin' } }]) });

    const row = await UserDashboardSettingsService.get(companyId, 'ignored-user-id');

    expect(supaFetch).toHaveBeenCalledWith(
      expect.stringContaining('user_dashboard_settings?user_id=eq.auth-uid-123'),
      { method: 'GET' },
      companyId
    );
    expect(row).toEqual({ id: 'row-1', notification_preferences: { preferred_dashboard: 'admin' } });
  });

  test('upsert() PATCH success path (no INSERT)', async () => {
    // PATCH by user_id succeeds on first try
    supaFetch.mockResolvedValueOnce({ ok: true });

    const ok = await UserDashboardSettingsService.upsert(companyId, 'ignored', { notification_preferences: { preferred_dashboard: 'admin' } });

    // First call is PATCH by user_id
    expect(supaFetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('user_dashboard_settings?user_id=eq.auth-uid-123'),
      expect.objectContaining({ method: 'PATCH' }),
      companyId
    );
    // Only one call (no INSERT)
    expect(supaFetch).toHaveBeenCalledTimes(1);
    expect(ok).toBe(true);
  });

  test('upsert() PATCH-by-user_id fallback then INSERT (PATCH fails, INSERT ok)', async () => {
    supaFetch
      // PATCH by user_id (should be attempted and fail)
      .mockResolvedValueOnce({ ok: false, status: 404 })
      // INSERT
      .mockResolvedValueOnce({ ok: true });

    const ok = await UserDashboardSettingsService.upsert(companyId, 'ignored', { notification_preferences: { preferred_dashboard: 'my' } });

    // 1) PATCH by user_id
    expect(supaFetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('user_dashboard_settings?user_id=eq.auth-uid-123'),
      expect.objectContaining({ method: 'PATCH' }),
      companyId
    );
    // 2) INSERT
    expect(supaFetch).toHaveBeenNthCalledWith(
      2,
      'user_dashboard_settings',
      expect.objectContaining({ method: 'POST' }),
      companyId
    );

    expect(ok).toBe(true);
  });

  test('upsert() treats INSERT 409 conflict as success (row already exists due to trigger)', async () => {
    supaFetch
      // PATCH by user_id fails
      .mockResolvedValueOnce({ ok: false, status: 404 })
      // INSERT returns 409 conflict
      .mockResolvedValueOnce({ ok: false, status: 409 });

    const ok = await UserDashboardSettingsService.upsert(companyId, 'ignored', { notification_preferences: { preferred_dashboard: 'admin' } });
    expect(ok).toBe(true);
  });
});

