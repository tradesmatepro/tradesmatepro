import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supaFetch, SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/supaFetch';
import settingsService from '../services/SettingsService';
import { supabaseAdmin as supabase } from '../utils/supabaseClient';

// Tiny signature pad using canvas (simple v1)
function SignaturePad({ onChange }){
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    const start = (e) => { drawing.current = true; draw(e); };
    const end = () => { drawing.current = false; ctx.beginPath(); onChange && onChange(canvas.toDataURL('image/png')); };
    const draw = (e) => {
      if (!drawing.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseout', end);
    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('touchstart', start);
    canvas.addEventListener('touchend', end);
    canvas.addEventListener('touchcancel', end);
    canvas.addEventListener('touchmove', draw);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mouseup', end);
      canvas.removeEventListener('mouseout', end);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchend', end);
      canvas.removeEventListener('touchcancel', end);
      canvas.removeEventListener('touchmove', draw);
    };
  }, [onChange]);

  return (
    <canvas ref={canvasRef} width={500} height={160} className="border rounded bg-white w-full" />
  );
}

export default function PortalQuote(){
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sigDataUrl, setSigDataUrl] = useState('');

  const fmt = useMemo(() => (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n || 0)), []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // No auth user here; rely on PostgREST RLS disabled for public portal or a signed link approach
        // We expect this route to be used with a secure tokenized URL in production; v1 just fetches by id for testing
        const woRes = await supaFetch(`work_orders?id=eq.${id}&select=*`, { method: 'GET' }, null);
        if (!woRes.ok) throw new Error('Failed to load quote');
        const [wo] = await woRes.json();
        setQuote(wo);
        const itRes = await supaFetch(`work_order_items?work_order_id=eq.${id}&select=*`, { method: 'GET' }, null);
        setItems(itRes.ok ? await itRes.json() : []);
      } catch (e) {
        setError('Unable to load quote.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      const res = await supaFetch(`work_orders?id=eq.${id}`, { method: 'PATCH', body: { status: newStatus } }, null);
      if (res.ok) {
        setQuote({ ...quote, status: newStatus });
      }
    } catch (_) {}
  };

  const dataUrlToFile = async (dataUrl, filename = 'signature.png') => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/png' });
  };

  const submitSignature = async () => {
    try {
      const file = await dataUrlToFile(sigDataUrl, `signature-${id}.png`);
      const fileExt = 'png';
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}-${randomId}.${fileExt}`;
      const filePath = `company-${quote.company_id}/quotes/${id}/signatures/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      // Insert into attachments table for tracking
      const attachment = {
        company_id: quote.company_id,
        related_type: 'work_order',
        related_id: id,
        file_url: urlData.publicUrl,
        file_type: 'signature'
      };
      await supaFetch('attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: attachment
      }, quote.company_id);

      await supaFetch(`work_orders?id=eq.${id}`, { method: 'PATCH', body: { status: 'ACCEPTED' } }, null);
      alert('Signature uploaded and quote accepted.');
    } catch (e) {
      alert('Failed to save signature.');
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!quote) return <div className="p-6 text-gray-600">Quote not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quote #{quote.id}</h1>
        <div className="text-gray-600">{quote.title}</div>
        <div className="text-gray-500 text-sm">Status: {quote.status || 'QUOTE'}</div>
      </div>

      <div className="bg-white rounded border p-4">
        <div className="text-gray-800 mb-2">{quote.description}</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Item</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.item_name}</td>
                <td className="text-right">{it.quantity}</td>
                <td className="text-right">{fmt(it.rate)}</td>
                <td className="text-right">{fmt((it.quantity || 0) * (it.rate || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 space-y-1 float-right text-sm">
          <div className="flex justify-between gap-12"><span>Subtotal</span><span>{fmt(quote.subtotal)}</span></div>
          <div className="flex justify-between gap-12"><span>Tax ({quote.tax_rate || 0}%)</span><span>{fmt(quote.tax_amount)}</span></div>
          <div className="flex justify-between gap-12 font-semibold"><span>Total</span><span>{fmt(quote.total_amount)}</span></div>
        </div>
        <div className="clear-both" />
      </div>

      <div className="flex gap-3">
        <button className="btn-primary" onClick={() => updateStatus('ACCEPTED')}>Accept</button>
        <button className="btn-secondary" onClick={() => updateStatus('REJECTED')}>Decline</button>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-700">Sign below to confirm:</div>
        <SignaturePad onChange={setSigDataUrl} />
        <div className="flex gap-3">
          <button className="btn-primary" onClick={submitSignature} disabled={!sigDataUrl}>Save Signature</button>
          {!sigDataUrl && <div className="text-xs text-gray-500 self-center">Sign first</div>}
        </div>
      </div>
    </div>
  );
}

