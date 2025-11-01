import React, { useEffect, useMemo, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import { getSupabaseClient } from '../../utils/supabaseClient';

const MinMaxTargetsModal = ({ location, onClose }) => {
  const { user } = useUser();
  const supabase = getSupabaseClient();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [buffer, setBuffer] = useState(0);

  const [selected, setSelected] = useState(new Set());


  const loadData = async () => {
    if (!user?.company_id || !location?.id) return;
    setLoading(true); setError('');
    try {
      // Load current stock at this location with item info
      const { data: stockData, error: sErr } = await supabase
        .from('inventory_stock')
        .select('id, item_id, location_id, quantity, inventory_items(id,name,sku,unit_of_measure,reorder_point)')
        .eq('company_id', user.company_id)
        .eq('location_id', location.id);
      if (sErr) throw sErr;
      const ids = (stockData || []).map(r => r.item_id);
      // Load existing targets for this location
      const { data: targets, error: tErr } = await supabase
        .from('inventory_location_item_targets')
        .select('item_id, min_quantity, max_quantity')
        .eq('company_id', user.company_id)
        .eq('location_id', location.id);
      if (tErr) throw tErr;
      const targByItem = new Map();
      for (const t of (targets || [])) targByItem.set(t.item_id, { min_quantity: Number(t.min_quantity||0)||0, max_quantity: Number(t.max_quantity||0)||0 });
      const merged = (stockData || []).map(s => ({
        key: s.item_id,
        item_id: s.item_id,
        name: s.inventory_items?.name || 'Unnamed',
        sku: s.inventory_items?.sku || '',
        uom: s.inventory_items?.unit_of_measure || 'each',
        on_hand: Number(s.quantity||0)||0,
        reorder_point: Number(s.inventory_items?.reorder_point||0)||0,
        min_quantity: targByItem.get(s.item_id)?.min_quantity ?? 0,
        max_quantity: targByItem.get(s.item_id)?.max_quantity ?? 0,
      }));
      setRows(merged);
    } catch (e) {
      console.error('Failed to load targets', e);
      setError('Failed to load targets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); /* eslint-disable-next-line */ }, [user?.company_id, location?.id]);

  const onChange = (idx, field, value) => {
    const v = Math.max(0, Number(value) || 0);
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: v } : r));
  };

  const saveAll = async () => {
    if (!user?.company_id || !location?.id) return;
    setSaving(true); setError('');
    try {
      const payload = rows.map(r => ({
        company_id: user.company_id,
        location_id: location.id,
        item_id: r.item_id,
        min_quantity: r.min_quantity || 0,
        max_quantity: r.max_quantity || 0,
      }));
      // Upsert targets
      const { error: upErr } = await supabase
        .from('inventory_location_item_targets')
        .upsert(payload, { onConflict: 'company_id,location_id,item_id' });
      if (upErr) throw upErr;
      onClose && onClose(true);
    } catch (e) {
      console.error('Failed to save targets', e);
      setError('Failed to save targets');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-16 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Min/Max Targets — {location?.name}</h3>
            <p className="text-xs text-gray-500">Set per-item targets for this location. Suggestions and alerts will use these.</p>
          </div>
          <button onClick={() => onClose && onClose(false)} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

            {/* Filters / Helpers */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or SKU…"
                className="px-3 py-1 text-sm border rounded"
              />
              <button
                onClick={() => setRows(prev => prev.map(r => {
                  const apply = selected && selected.size > 0 ? selected.has(r.key) : true;
                  if (!apply) return r;
                  return { ...r, min_quantity: r.min_quantity > 0 ? r.min_quantity : (Number(r.reorder_point||0)||0) };
                }))}
                className="px-3 py-1 text-xs rounded border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
              >Copy reorder_point to empty Mins</button>
              <div className="flex items-center gap-2 text-xs">
                <span>Buffer</span>
                <input type="number" className="w-20 px-2 py-1 border rounded" value={buffer}
                  onChange={(e)=>setBuffer(Math.max(0, Number(e.target.value)||0))} />
                <div className="flex items-center gap-1">
                  {[2,5,10].map(v => (
                    <button key={v} onClick={() => setBuffer(v)} className="px-2 py-0.5 border rounded hover:bg-neutral-50">+{v}</button>
                  ))}
                </div>
                <button
                  onClick={() => setRows(prev => prev.map(r => {
                    const apply = selected && selected.size > 0 ? selected.has(r.key) : true;
                    if (!apply) return r;
                    return { ...r, max_quantity: Math.max(0, Number(r.min_quantity||0) + Number(buffer||0)) };
                  }))}
                  className="px-3 py-1 rounded border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100"
                >Set Max = Min + buffer</button>
              </div>
              <button
                onClick={() => setRows(prev => prev.map(r => {
                  const apply = selected && selected.size > 0 ? selected.has(r.key) : true;
                  if (!apply) return r;
                  return { ...r, min_quantity: 0, max_quantity: 0 };
                }))}
                className="px-3 py-1 text-xs rounded border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100"
              >Clear all targets</button>
            </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2">
                    <input type="checkbox"
                      onChange={() => setSelected(prev => {
                        if (prev && prev.size > 0) return new Set();
                        const all = new Set((rows || []).map(r => r.key));
                        return all;
                      })}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">On Hand</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Max</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(rows || []).filter(r => {
                  const term = (q||'').toLowerCase();
                  if (!term) return true;
                  return (r.name||'').toLowerCase().includes(term) || (r.sku||'').toLowerCase().includes(term);
                }).map((r, idx) => (
                  <tr key={r.key}>
                    <td className="px-3 py-2">
                      <input type="checkbox"
                        checked={selected?.has(r.key) || false}
                        onChange={(e) => setSelected(prev => {
                          const next = new Set(prev || []);
                          if (next.has(r.key)) next.delete(r.key); else next.add(r.key);
                          return next;
                        })}
                        aria-label={`Select ${r.name}`}
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{r.name}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{r.sku || '—'}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{r.on_hand} {r.uom}</td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={r.min_quantity}
                        onChange={(e) => onChange(idx, 'min_quantity', e.target.value)}
                        className="w-28 px-2 py-1 border rounded-md text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={r.max_quantity}
                        onChange={(e) => onChange(idx, 'max_quantity', e.target.value)}
                        className="w-28 px-2 py-1 border rounded-md text-sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => onClose && onClose(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50">Cancel</button>
          <button onClick={saveAll} disabled={saving} className="px-4 py-2 rounded-md text-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving…' : 'Save Targets'}</button>
        </div>
      </div>
    </div>
  );
};

export default MinMaxTargetsModal;

