import React, { useEffect, useState } from 'react';
import { XMarkIcon, PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';

const CloseoutDataModal = ({ isOpen, onClose, workOrderId }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [signatures, setSignatures] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!isOpen || !workOrderId) return;
      setLoading(true);
      try {
        // Fetch checklist items via 2-step
        const clRes = await supaFetch(`work_order_checklists?work_order_id=eq.${workOrderId}&select=id`, { method: 'GET' }, user.company_id);
        const cls = clRes.ok ? await clRes.json() : [];
        let checklistItems = [];
        if (cls.length) {
          const ids = cls.map(c => c.id).join(',');
          const itRes = await supaFetch(`work_order_checklist_items?checklist_id=in.(${ids})&select=description,required,completed,completed_at`, { method: 'GET' }, user.company_id);
          checklistItems = itRes.ok ? await itRes.json() : [];
        }

        // Photos
        const phRes = await supaFetch(`work_order_photos?work_order_id=eq.${workOrderId}&select=photo_url,created_at`, { method: 'GET' }, user.company_id);
        const ph = phRes.ok ? await phRes.json() : [];

        // Signatures
        const sgRes = await supaFetch(`work_order_signatures?work_order_id=eq.${workOrderId}&select=signer_name,signature_type,signed_at`, { method: 'GET' }, user.company_id);
        const sg = sgRes.ok ? await sgRes.json() : [];

        setItems(checklistItems);
        setPhotos(ph);
        setSignatures(sg);
      } catch (e) {
        console.warn('Failed to load closeout data', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, workOrderId, user?.company_id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Closeout Data</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="w-5 h-5"/></button>
        </div>

        <div className="p-4 space-y-6">
          {loading && <div className="text-sm text-gray-500">Loading...</div>}

          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-2"><CheckCircleIcon className="w-4 h-4"/> Checklist</div>
            {items.length === 0 ? (
              <div className="text-xs text-gray-500">No checklist items saved</div>
            ) : (
              <ul className="list-disc list-inside text-sm text-gray-700">
                {items.map((it, idx) => (
                  <li key={idx} className={it.completed ? 'text-green-700' : 'text-gray-700'}>
                    {it.description} {it.required ? <span className="text-red-500">*</span> : null} {it.completed ? '— Completed' : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-2"><PhotoIcon className="w-4 h-4"/> Photos</div>
            {photos.length === 0 ? (
              <div className="text-xs text-gray-500">No photos uploaded</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {photos.map((p, idx) => (
                  <a key={idx} href={p.photo_url} target="_blank" rel="noreferrer" className="block border rounded overflow-hidden">
                    <img src={p.photo_url} alt="Job" className="w-full h-24 object-cover"/>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Signatures</div>
            {signatures.length === 0 ? (
              <div className="text-xs text-gray-500">No signature captured</div>
            ) : (
              <ul className="text-sm text-gray-700">
                {signatures.map((s, idx) => (
                  <li key={idx}>{s.signer_name} ({s.signature_type}) — {s.signed_at ? new Date(s.signed_at).toLocaleString() : ''}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white border rounded hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CloseoutDataModal;

