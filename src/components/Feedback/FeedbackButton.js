import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../contexts/UserContext';

const FloatingButton = ({ onClick, title, icon, className='' }) => (
  <button
    onClick={onClick}
    title={title}
    className={`fixed z-40 right-4 ${className} shadow-lg rounded-full px-4 py-3 text-white flex items-center gap-2 focus:outline-none`}
    style={{ bottom: '90px', background: 'linear-gradient(135deg,#9333ea,#3b82f6)' }}
  >
    <span style={{ fontSize: 18 }}>💬</span>
    <span className="hidden sm:block text-sm font-medium">Feedback</span>
  </button>
);

export default function FeedbackButton() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = async () => {
    if (!message.trim()) { alert('Please enter feedback'); return; }
    try {
      setSubmitting(true);
      const page_path = window.location.pathname + window.location.search;
      const user_agent = navigator.userAgent;
      const payload = {
        company_id: user?.company_id || null,
        user_id: user?.id || null,
        page_path,
        user_agent,
        message: message.trim(),
        metadata: { href: window.location.href }
      };
      const { error } = await supabase.from('beta_feedback').insert(payload);
      if (error) throw error;
      setMessage('');
      setOpen(false);
      alert('Thanks for your feedback!');
    } catch (e) {
      console.error('Feedback submit failed', e);
      alert(e.message || 'Could not submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <> 
      <FloatingButton onClick={() => setOpen(true)} title="Send Beta Feedback" />
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 w-full sm:w-[480px] rounded-t-xl sm:rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Send Feedback</h3>
              <button onClick={()=>setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mb-3 text-xs text-gray-500">Page: {typeof window!== 'undefined' ? window.location.pathname : ''}</div>
            <textarea
              rows={5}
              className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
              placeholder="Tell us what’s working, what’s confusing, and what you need..."
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={()=>setOpen(false)} className="px-3 py-2 text-sm border rounded-md">Cancel</button>
              <button disabled={submitting} onClick={submitFeedback} className="px-4 py-2 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

