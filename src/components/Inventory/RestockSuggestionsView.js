import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import inventoryAlertsService from '../../services/InventoryAlertsService';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const RestockSuggestionsView = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alerts, setAlerts] = useState({ outOfStock: [], lowStock: [], inStock: [] });

  const reload = async () => {
    if (!user?.company_id) return;
    setLoading(true); setError('');
    try {
      const a = await inventoryAlertsService.getInventoryAlerts(user.company_id);
      setAlerts(a || { outOfStock: [], lowStock: [], inStock: [] });
    } catch (e) {
      console.error('Failed to load restock suggestions', e);
      setError('Failed to load restock suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [user?.company_id]);

  const suggestions = useMemo(() => {
    // Compute a simple suggestion per item+location based on reorder_point
    const rows = [];
    const consider = [...(alerts.outOfStock||[]), ...(alerts.lowStock||[])];
    for (const row of consider) {
      const minTarget = Number(row.min_target || row.reorder_point || 0) || 0;
      const maxTarget = Number(row.max_target || 0) || 0;
      const qty = Number(row.quantity || 0) || 0;
      const suggested = maxTarget > 0 ? Math.max(0, maxTarget - qty) : (minTarget > qty ? (minTarget - qty) : 0);
      rows.push({
        key: `${row.item_id}::${row.location_id}`,
        item_id: row.item_id,
        item_name: row.item_name,
        item_sku: row.item_sku,
        unit_of_measure: row.unit_of_measure || 'each',
        location_id: row.location_id,
        location_name: row.location_name || 'Unknown',
        current_qty: qty,
        reorder_point: minTarget,
        min_target: minTarget,
        max_target: maxTarget,
        suggested_qty: suggested,
        status: qty <= 0 ? 'out' : 'low'
      });
    }
    // Stable sort: out-of-stock first, then low stock, then by item name
    return rows.sort((a,b) => (a.status === b.status ? (a.item_name||'').localeCompare(b.item_name||'') : a.status === 'out' ? -1 : 1));
  }, [alerts]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Restock Suggestions</h2>
          <p className="text-sm text-gray-600">Based on per-location min/max targets (or item reorder point fallback) and current on-hand.</p>
        </div>
        <button onClick={reload} className="inline-flex items-center px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50">
          <ArrowPathIcon className="w-4 h-4 mr-2" /> Refresh
        </button>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">Loading suggestions…</div>
      )}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <div className="text-sm text-gray-500">No restock suggestions right now.</div>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">On Hand</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min Target</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Max Target</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Suggest</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suggestions.map((s) => (
                <tr key={s.key} className={s.status === 'out' ? 'bg-red-50' : 'bg-yellow-50'}>
                  <td className="px-4 py-2 text-sm text-gray-900">{s.item_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{s.item_sku || '—'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{s.location_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{s.current_qty} {s.unit_of_measure}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{s.min_target}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{s.max_target || '—'}</td>
                  <td className="px-4 py-2 text-sm font-semibold text-gray-900">{s.suggested_qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Suggestions use per-location min/max targets when set; otherwise they fall back to the item9s reorder_point.
      </div>
    </div>
  );
};

export default RestockSuggestionsView;

