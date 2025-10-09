import { supaFetch } from '../utils/supaFetch';
import { getSupabaseClient } from '../utils/supabaseClient';

// Aligns with schema: user_dashboard_settings has JSONB fields like
// notification_preferences, dashboard_config, widget_preferences, etc.
const UserDashboardSettingsService = {
  async get(companyId, _userId) {
    // Use auth.uid() to satisfy RLS policies
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const authUid = session?.user?.id;
    if (!authUid) return null;

    const res = await supaFetch(`user_dashboard_settings?user_id=eq.${authUid}`, { method: 'GET' }, companyId);
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0] || null;
  },

  async upsert(companyId, _userId, patch) {
    // Use auth.uid() for RLS compliance
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const authUid = session?.user?.id;
    if (!authUid) return false;

    const bodyPrefs = (patch.notification_prefs || patch.notification_preferences || patch) || {};

    // First try PATCH by user_id filter (safe under RLS)
    const patchRes = await supaFetch(`user_dashboard_settings?user_id=eq.${authUid}`, {
      method: 'PATCH',
      body: {
        notification_preferences: bodyPrefs,
        updated_at: new Date().toISOString()
      }
    }, companyId);
    if (patchRes.ok) return true;

    // If PATCH failed (no row or RLS mismatch), try INSERT; ignore conflict by returning true
    const insertRes = await supaFetch('user_dashboard_settings', {
      method: 'POST',
      body: {
        user_id: authUid,
        notification_preferences: bodyPrefs,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }, companyId);
    return insertRes.ok || insertRes.status === 409;
  }
};

export default UserDashboardSettingsService;
