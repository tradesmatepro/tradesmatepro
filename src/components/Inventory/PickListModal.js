import React, { useEffect, useState } from 'react';
import { XMarkIcon, ClipboardDocumentCheckIcon, ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';

const PickListModal = ({ workOrder, onClose, onPicked }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickList, setPickList] = useState(null);
  const [lines, setLines] = useState([]);
  const [error, setError] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState('');

  useEffect(() => {
    if (workOrder && user?.company_id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workOrder, user?.company_id]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const pl = await inventoryService.getPickListForWorkOrder(user.company_id, workOrder.id);
      if (!pl) {
        setPickList(null);
        setLines([]);
        return;
      }
      setPickList(pl);
      const ln = await inventoryService.getPickListLines(pl.id);
      setLines(ln);
    } catch (e) {
      setError(e?.message || 'Failed to load pick list');
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    try {
      setSaving(true);
      setError('');
      const res = await inventoryService.generatePickList(user.company_id, workOrder.id);
      if (!res?.created) {
        setError('No reservations to generate a pick list.');
      }
      await load();
    } catch (e) {
      setError(e?.message || 'Failed to generate pick list');
    } finally {
      setSaving(false);
    }
  };

  const handleScan = (value) => {
    const v = (value || '').trim();
    setScanInput(v);
    if (!v) { setScanFeedback(''); return; }
    // Find by exact SKU first, then case-insensitive name contains
    const bySku = lines.find(l => (l.inventory_items?.sku || '').toLowerCase() === v.toLowerCase());
    const candidates = bySku ? [bySku] : lines.filter(l => (l.inventory_items?.name || '').toLowerCase().includes(v.toLowerCase()));
    if (!candidates.length) {
      setScanFeedback('No matching line');
      return;
    }
    const ln = candidates[0];
    const requested = Number(ln.quantity_requested || 0);
    const picked = Number(ln.quantity_picked || 0);
    if (picked >= requested) {
      setScanFeedback('Already fulfilled');
      return;
    }
    const next = picked + 1;
    updatePickedQty(ln.id, next, requested);
    setScanFeedback(`${ln.inventory_items?.sku || ''} +1 (${next}/${requested})`);
    setScanInput('');
  };

  const updatePickedQty = async (lineId, newQty, maxQty) => {
    const clamped = Math.max(0, Math.min(Number(newQty) || 0, Number(maxQty) || 0));
    setLines(prev => prev.map(l => l.id === lineId ? { ...l, quantity_picked: clamped } : l));
  };

  const savePicked = async () => {
    try {
      setSaving(true);
      // Persist each edited line
      for (const ln of lines) {
        await inventoryService.updatePickListLineQuantity(ln.id, ln.quantity_picked || 0);
      }
      // Mark header picked and create ALLOCATION movements
      await inventoryService.markPickListPicked(user.company_id, pickList.id);
      onPicked && onPicked();
      onClose();
    } catch (e) {
      setError(e?.message || 'Failed to mark as picked');
    } finally {
      setSaving(false);
    }
  };
  const totals = {
    requested: (lines || []).reduce((a,l)=>a + (Number(l?.quantity_requested||0)||0), 0),
    picked: (lines || []).reduce((a,l)=>a + (Number(l?.quantity_picked||0)||0), 0)
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Pick List{workOrder?.job_number ? ` · ${workOrder.job_number}` : ''}</h2>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center gap-2 text-neutral-500"><ArrowPathIcon className="w-4 h-4 animate-spin" /> Loading…</div>
          ) : (
            <>
              {!pickList ? (
                <div className="space-y-3">
                  <p className="text-neutral-600 dark:text-neutral-300">No pick list exists yet for this job.</p>
                  <button onClick={generate} disabled={saving} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                    <PlusIcon className="w-4 h-4" /> Generate from reservations
                  </button>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-center gap-2">
                      <div>Status: <span className="font-medium">{pickList.status}</span></div>
                      {totals.picked === totals.requested && totals.requested > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">All fulfilled</span>
                      )}
                    </div>
                    <div>Picked <span className="font-semibold">{totals.picked}</span> / <span className="font-semibold">{totals.requested}</span></div>
                  </div>
                  {/* Scan box */}
                  <div className="flex items-center gap-2">
                    <input
                      value={scanInput}
                      onChange={(e) => handleScan(e.target.value)}
                      placeholder="Scan or type SKU/Name…"
                      className="w-full max-w-xs px-3 py-2 border rounded bg-white dark:bg-neutral-900"
                    />
                    <span className="text-xs text-neutral-500">{scanFeedback}</span>
                  </div>

                  <div className="max-h-80 overflow-auto border border-neutral-200 dark:border-neutral-800 rounded">
                    <table className="min-w-full text-sm">
                      <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        <tr>
                          <th className="text-left p-2">Item</th>
                          <th className="text-right p-2">Requested</th>
                          <th className="text-right p-2">Picked</th>
                          <th className="text-right p-2">Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lines.map(ln => (
                          <tr key={ln.id} className={`border-t border-neutral-200 dark:border-neutral-800 ${Number(ln.quantity_picked||0) >= Number(ln.quantity_requested||0) ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
                            <td className="p-2">
                              <div className="font-medium flex items-center gap-2">
                                <span>{ln.inventory_items?.name || 'Item'}</span>
                                {Number(ln.quantity_picked||0) >= Number(ln.quantity_requested||0) && (
                                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Fulfilled</span>
                                )}
                              </div>
                              <div className="text-xs text-neutral-500">{ln.inventory_items?.sku}</div>
                              <div className="mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">{Number(ln.quantity_picked||0)} / {Number(ln.quantity_requested||0)}</div>
                            </td>
                            <td className="p-2 text-right">{Number(ln.quantity_requested || 0)}</td>
                            <td className="p-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => updatePickedQty(ln.id, Number(ln.quantity_picked||0) - 1, Number(ln.quantity_requested||0))}
                                  className="px-2 py-1 text-xs border rounded hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                >-</button>
                                <input
                                  type="number"
                                  min={0}
                                  max={Number(ln.quantity_requested || 0)}
                                  value={Number(ln.quantity_picked || 0)}
                                  onChange={(e) => updatePickedQty(ln.id, e.target.value, Number(ln.quantity_requested || 0))}
                                  className="w-24 text-right px-2 py-1 border rounded bg-white dark:bg-neutral-900"
                                />
                                <button
                                  type="button"
                                  onClick={() => updatePickedQty(ln.id, Number(ln.quantity_picked||0) + 1, Number(ln.quantity_requested||0))}
                                  className="px-2 py-1 text-xs border rounded hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                >+</button>
                              </div>
                            </td>
                            <td className="p-2 text-right text-xs text-neutral-600">
                              {Math.max(0, Number(ln.quantity_requested || 0) - Number(ln.quantity_picked || 0))}
                            </td>
                          </tr>
                        ))}
                        {lines.length === 0 && (
                          <tr><td colSpan={4} className="p-4 text-center text-neutral-500">No lines</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="text-sm text-neutral-500">Pick from your chosen source location when starting the job. This will allocate items to the job.</div>
          <div className="flex items-center gap-2">
            {!pickList ? (
              <button onClick={generate} disabled={saving} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                <PlusIcon className="w-4 h-4" /> Generate
              </button>
            ) : (
              <>
                <button onClick={() => {
                  // Auto-fill remaining for all lines (local state only)
                  setLines(prev => prev.map(l => ({
                    ...l,
                    quantity_picked: Math.max(Number(l.quantity_picked||0), Number(l.quantity_requested||0))
                  })));
                }} disabled={saving} className="inline-flex items-center gap-2 px-3 py-2 border rounded hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  Auto-fill remaining
                </button>
                <button onClick={savePicked} disabled={saving} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                  <ClipboardDocumentCheckIcon className="w-4 h-4" /> Mark as Picked
                </button>
              </>
            )}
            <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickListModal;

