import React, { useEffect, useState } from 'react';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';

export default function ItemLibraryModal({ open, onClose, onAdd }){
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (!open) return;
    (async () => {
      const res = await supaFetch(`items_catalog?select=*&order=created_at.desc`, { method: 'GET' }, user?.company_id);
      if (res.ok) setItems(await res.json());
    })();
  }, [open, user?.company_id]);

  const filtered = items.filter(it => it.item_name.toLowerCase().includes(search.toLowerCase()));

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Item Library</h3>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>
        <div className="mt-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="mt-4 max-h-80 overflow-auto divide-y">
          {filtered.map(it => (
            <div key={it.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{it.item_name}</div>
                <div className="text-xs text-gray-500">{it.item_type} • ${Number(it.default_rate || 0).toFixed(2)}</div>
                {it.sku && <div className="text-xs text-gray-400">SKU {it.sku}</div>}
              </div>
              <button
                className="btn-secondary"
                onClick={() => onAdd({
                  item_name: it.item_name,
                  description: it.description || '',
                  item_type: it.item_type || 'material',
                  quantity: 1,
                  rate: Number(it.default_rate || 0),
                  photo_url: ''
                })}
              >Add</button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-gray-500 py-6 text-center">No items found</div>
          )}
        </div>
      </div>
    </div>
  );
}

