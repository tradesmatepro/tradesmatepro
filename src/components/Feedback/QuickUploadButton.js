import React, { useRef, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import DocumentsService from '../../services/DocumentsService';

const FloatingUpload = ({ onClick }) => (
  <button
    onClick={onClick}
    title="Quick Upload"
    className="fixed z-40 right-4 shadow-lg rounded-full px-4 py-3 text-white flex items-center gap-2 focus:outline-none"
    style={{ bottom: '30px', background: 'linear-gradient(135deg,#0ea5e9,#22c55e)' }}
  >
    <span style={{ fontSize: 18 }}>4f7</span>
    <span className="hidden sm:block text-sm font-medium">Upload</span>
  </button>
);

export default function QuickUploadButton() {
  const { user } = useUser();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const startUpload = () => {
    inputRef.current?.click();
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      setBusy(true);
      // Default to "general attachment" when not linked to a specific job
      const res = await DocumentsService.uploadAttachment(user?.company_id, null, file, user?.id, [], '');
      if (!res?.success) throw new Error(res?.message || 'Upload failed');
      alert('Upload successful');
    } catch (e) {
      console.error('Quick upload failed', e);
      alert(e.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <FloatingUpload onClick={startUpload} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        className="hidden"
        disabled={busy}
        onChange={(e)=>{ const f=e.target.files; handleFiles(f); e.target.value=''; }}
      />
    </>
  );
}

