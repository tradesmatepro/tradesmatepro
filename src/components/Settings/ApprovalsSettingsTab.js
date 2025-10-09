import React, { useEffect, useMemo, useState } from 'react';
import { supaFetch } from '../../utils/supaFetch';
import { useUser } from '../../contexts/UserContext';

export default function ApprovalsSettingsTab() {
  const { user } = useUser();
  const companyId = user?.company_id;
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    level2_threshold: 500,
    level3_threshold: 2000,
    finance_required_card: true,
    auto_escalate_days: 3,
    allow_delegate: true,
  });
  const [employees, setEmployees] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [sRes, eRes] = await Promise.all([
        supaFetch(`approval_settings?company_id=eq.${companyId}`, { method: 'GET' }, companyId),
        supaFetch('employees', { method: 'GET' }, companyId)
      ]);
      if (sRes.ok) {
        const data = await sRes.json();
        if (data?.[0]) setSettings({ ...settings, ...data[0] });
      }
      if (eRes.ok) {
        const data = await eRes.json();
        setEmployees(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, [companyId]);

  const save = async () => {
    if (!companyId) return;
    setSaving(true);
    try {
      // upsert by unique(company_id)
      const res = await supaFetch('approval_settings', {
        method: 'POST',
        body: [{ ...settings, company_id: companyId }],
        headers: { Prefer: 'return=representation,resolution=merge-duplicates' }
      }, companyId);
      if (!res.ok) throw new Error(await res.text());
      alert('Approval settings saved');
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const setManager = async (employeeId, managerId) => {
    try {
      const res = await supaFetch(`employees?id=eq.${employeeId}`, {
        method: 'PATCH',
        body: { manager_id: managerId || null }
      }, companyId);
      if (!res.ok) throw new Error(await res.text());
      setEmployees((prev) => prev.map(e => e.id === employeeId ? { ...e, manager_id: managerId || null } : e));
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to update manager');
    }
  };

  const employeeName = (e) => e.display_name || [e.first_name, e.last_name].filter(Boolean).join(' ') || e.email || e.id?.slice(0,8);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Approval Rules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Level 2 Threshold</label>
            <input type="number" min="0" step="0.01" value={settings.level2_threshold}
              onChange={(e)=>setSettings(s=>({...s, level2_threshold: parseFloat(e.target.value||0)}))}
              className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Level 3 Threshold</label>
            <input type="number" min="0" step="0.01" value={settings.level3_threshold}
              onChange={(e)=>setSettings(s=>({...s, level3_threshold: parseFloat(e.target.value||0)}))}
              className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Finance required for Corporate Card</label>
            <select value={settings.finance_required_card? 'yes':'no'}
              onChange={(e)=>setSettings(s=>({...s, finance_required_card: e.target.value==='yes'}))}
              className="w-full border rounded-md px-3 py-2">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Auto-escalate after (days)</label>
            <input type="number" min="0" step="1" value={settings.auto_escalate_days}
              onChange={(e)=>setSettings(s=>({...s, auto_escalate_days: parseInt(e.target.value||0)}))}
              className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Allow delegate approver</label>
            <select value={settings.allow_delegate? 'yes':'no'}
              onChange={(e)=>setSettings(s=>({...s, allow_delegate: e.target.value==='yes'}))}
              className="w-full border rounded-md px-3 py-2">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Org Tree (Assign Managers)</h3>
        <div className="overflow-auto">
          <table className="min-w-[600px] w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Employee</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Manager</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="border-t">
                  <td className="py-2 pr-4">{employeeName(emp)}</td>
                  <td className="py-2 pr-4">{emp.role || '-'}</td>
                  <td className="py-2 pr-4">
                    <select value={emp.manager_id || ''} onChange={(e)=>setManager(emp.id, e.target.value || null)} className="border rounded-md px-2 py-1">
                      <option value="">(none)</option>
                      {employees.filter(m => m.id !== emp.id).map(m => (
                        <option key={m.id} value={m.id}>{employeeName(m)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

