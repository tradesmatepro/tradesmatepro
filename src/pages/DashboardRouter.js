import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { isAdmin, isOwner } from '../utils/roleUtils';
import UserDashboardSettingsService from '../services/UserDashboardSettingsService';
import MyDashboard from './MyDashboard';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';

export default function DashboardRouter(){
  const { user, loading } = useUser();
  const [pref, setPref] = useState(null); // 'my' | 'admin' | null
  const [settingsRow, setSettingsRow] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!user?.company_id || !user?.id) { if (isMounted) setFetching(false); return; }
      try {
        const row = await UserDashboardSettingsService.get(user.company_id, user.id);
        setSettingsRow(row);
        const pd = row?.notification_preferences?.preferred_dashboard || null;
        if (isMounted) setPref(pd);
      } finally {
        if (isMounted) setFetching(false);
      }
    })();
    return () => { isMounted = false; };
  }, [user?.company_id, user?.id]);

  const canAdmin = isAdmin(user) || isOwner(user);

  const setPreferred = async (which) => {
    if (!canAdmin) return;
    try {
      setSaving(true);
      const nextPrefs = { ...(settingsRow?.notification_preferences || {}), preferred_dashboard: which };
      await UserDashboardSettingsService.upsert(user.company_id, user.id, { notification_preferences: nextPrefs });
      setPref(which);
      setSettingsRow((prev) => ({ ...(prev || {}), notification_preferences: nextPrefs }));
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const content = (() => {
    if (pref === 'my' || !canAdmin) return <MyDashboard />;
    if (pref === 'customer') return <CustomerDashboard />;
    return <AdminDashboard />;
  })();

  return (
    <div>
      {canAdmin && (
        <div className="mb-4 flex items-center justify-end">
          <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => setPreferred('my')}
              className={`px-3 py-1 text-sm rounded ${pref==='my' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            >My Dashboard</button>
            <button
              onClick={() => setPreferred('customer')}
              className={`px-3 py-1 text-sm rounded ${pref==='customer' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            >Customer Dashboard</button>
            <button
              onClick={() => setPreferred('admin')}
              className={`px-3 py-1 text-sm rounded ${pref==='admin' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            >Admin Dashboard</button>
          </div>
          {saving && <span className="ml-2 text-xs text-gray-500">Saving…</span>}
        </div>
      )}
      {content}
    </div>
  );
}
