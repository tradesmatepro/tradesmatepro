import React, { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  PaperAirplaneIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { generateSignatureImage } from '../utils/SignatureGenerator';
import InvoicePDFService from '../services/InvoicePDFService';
import DocumentsService from '../services/DocumentsService';
import { useUser } from '../contexts/UserContext';



/**
 * CompletionAndInvoiceModal - UNIFIED workflow for completing job AND sending invoice
 *
 * Industry Standard: ONE modal with 3 clear steps
 * - Step 1: Complete Job (capture work performed, materials, signature)
 * - Step 2: Create Invoice (set dates, terms, payment)
 * - Step 3: Send Invoice (choose delivery method, add message)
 *
 * Replaces 3 separate modals (CompletionModal, InvoiceCreationModal, SendInvoiceModal)
 * Matches ServiceTitan/Jobber/Housecall Pro UX
 */

const CompletionAndInvoiceModal = ({
  isOpen,
  onClose,
  job,
  onConfirm,
  companySettings = {},
  companyId,
  uploadedBy
}) => {
  const { user } = useUser();
  const effCompanyId = companyId || user?.company_id;
  const effUploadedBy = uploadedBy || user?.id;
  const workOrderId = job?.id || job?.work_order_id || job?.wo_id || job?.workOrderId || null;


  const [step, setStep] = useState(1); // 1=Complete, 2=Invoice, 3=Send
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Step 1: Completion data
  const [workPerformed, setWorkPerformed] = useState(job?.work_performed || job?.description || job?.job_description || job?.scope || '');
  const [materialsUsed, setMaterialsUsed] = useState(job?.materials_used || job?.parts_used || job?.materials || '');
  const [completionNotes, setCompletionNotes] = useState(job?.completion_notes || job?.notes || '');
  const [employeeSignature, setEmployeeSignature] = useState('');
  const [signatureImage, setSignatureImage] = useState(null); // Generated signature image

  // Step 2: Invoice data
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [dueDate, setDueDate] = useState('');
  const [invoiceNotes, setInvoiceNotes] = useState(job?.work_performed || job?.description || '');
  const [recordPaymentNow, setRecordPaymentNow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');

  // Step 3: Send data
  const [deliveryMethod, setDeliveryMethod] = useState('email');
  const [customMessage, setCustomMessage] = useState('');
  const [includeAttachment, setIncludeAttachment] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);

  // Attachments for UI preview (email will include all job attachments automatically)
  // File input and upload state
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFilesSelected = async (e) => {
    try {
      const files = Array.from(e.target.files || []);
      console.log('📎 handleFilesSelected: files chosen =', files.map(f => `${f.name} (${f.type || 'unknown'})`));
      if (!files.length) {
        console.warn('📎 No files selected');
        return;
      }
      if (!effCompanyId || !workOrderId) {
        console.warn('📎 Missing companyId or workOrderId; aborting upload', { companyId: effCompanyId, workOrderId });
        window?.toast?.error?.('Unable to upload: missing company or job context');
        return;
      }
      setUploading(true);
      window?.toast?.info?.(`Uploading ${files.length} file(s)...`);

      let successCount = 0;
      for (const [idx, file] of files.entries()) {
        console.log(`📤 [${idx + 1}/${files.length}] Uploading`, file.name, file);
        const res = await DocumentsService.uploadAttachment(effCompanyId, workOrderId, file, effUploadedBy || null, []);
        if (res?.success) {
          successCount += 1;
          console.log(`✅ Uploaded: ${file.name}`, res?.attachment);
          window?.toast?.success?.(`Uploaded: ${file.name}`);
        } else {
          console.error('❌ Upload failed:', file.name, res?.message);
          window?.toast?.error?.(`Failed: ${file.name} — ${res?.message || 'Unknown error'}`);
        }
      }

      console.log('📎 Reloading attachments list after upload...');
      const fresh = await InvoicePDFService.getAttachments(effCompanyId, workOrderId);
      console.log('📎 Attachments loaded:', Array.isArray(fresh) ? fresh.length : 0, fresh);
      setAttachments(Array.isArray(fresh) ? fresh : []);
      if (fileInputRef.current) fileInputRef.current.value = '';
      window?.toast?.info?.(`${successCount}/${files.length} file(s) uploaded`);
    } catch (err) {
      console.error('❌ Add attachments failed:', err);
      window?.toast?.error?.(`Upload error: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  // Reinitialize all form state whenever a new job is opened or modal toggles open
  useEffect(() => {
    if (!isOpen || !job) return;
    setWorkPerformed(job?.work_performed || job?.description || job?.job_description || job?.scope || '');
    setMaterialsUsed(job?.materials_used || job?.parts_used || job?.materials || '');
    setCompletionNotes(job?.completion_notes || job?.notes || '');
    setEmployeeSignature('');
    setSignatureImage(null);

    const today = new Date().toISOString().split('T')[0];
    setInvoiceDate(today);

    const defaultTerms = job?.payment_terms || companySettings?.defaultPaymentTerms || 'Net 30';
    setPaymentTerms(defaultTerms);

    setInvoiceNotes(job?.work_performed || job?.description || '');
    setRecordPaymentNow(false);
    setPaymentMethod('cash');
    setPaymentAmount('');

    setDeliveryMethod('email');
    setCustomMessage('');
    setIncludeAttachment(false);
  }, [isOpen, job?.id]);

  // Initialize payment terms from job when modal opens
  useEffect(() => {
    if (job?.payment_terms) {
      setPaymentTerms(job.payment_terms);
      console.log('📋 Loaded payment terms from job:', job.payment_terms);
    }
  }, [job?.id, isOpen]);

  // Load job attachments for preview in Step 3
  useEffect(() => {
    const loadAttachments = async () => {
      if (!isOpen || !workOrderId || !effCompanyId) {
        console.log('\ud83d\udcce Skipping attachment load (modal closed or missing context)', { isOpen, workOrderId, companyId: effCompanyId });
        setAttachments([]);
        return;
      }
      try {
        console.log('\ud83d\udcce Loading attachments...', { workOrderId, companyId: effCompanyId });
        setAttachmentsLoading(true);
        const files = await InvoicePDFService.getAttachments(effCompanyId, workOrderId);
        console.log('\ud83d\udcce Loaded attachments count:', Array.isArray(files) ? files.length : 0);
        setAttachments(Array.isArray(files) ? files : []);
      } catch (err) {
        console.warn('Attachments load failed:', err);
        setAttachments([]);
      } finally {
        setAttachmentsLoading(false);
      }
    };
    loadAttachments();
  }, [isOpen, job?.id, companyId]);


  // Auto-calculate due date
  useEffect(() => {
    if (!invoiceDate) return;
    const date = new Date(invoiceDate);
    const daysMap = { 'Due on Receipt': 0, 'Net 15': 15, 'Net 30': 30, 'Net 60': 60, 'Net 90': 90 };
    date.setDate(date.getDate() + (daysMap[paymentTerms] || 30));
    setDueDate(date.toISOString().split('T')[0]);
  }, [invoiceDate, paymentTerms]);

  if (!isOpen || !job) return null;

  const customerName = job?.customers?.name || job?.customer_name || 'Customer';
  const customerEmail = job?.customers?.email || job?.customer_email || '';
  const jobTotal = job?.total_amount || 0;

  const validateStep = (stepNum) => {
    const newErrors = {};
    if (stepNum === 1) {
      if (!workPerformed?.trim() || workPerformed.trim().length < 5) {
        newErrors.workPerformed = 'Please describe work performed (at least 5 characters)';
      }
    } else if (stepNum === 2) {
      if (!invoiceDate) newErrors.invoiceDate = 'Invoice date required';
      if (!dueDate) newErrors.dueDate = 'Due date required';
      if (recordPaymentNow && (!paymentAmount || parseFloat(paymentAmount) <= 0)) {
        newErrors.paymentAmount = 'Payment amount required';
      }
    } else if (stepNum === 3) {
      if (deliveryMethod === 'email' && !customerEmail) {
        newErrors.deliveryMethod = 'Customer email required for email delivery';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  // Generate signature image when employee name changes
  const handleSignatureNameChange = (e) => {
    const name = e.target.value;
    setEmployeeSignature(name);

    // Generate signature image if name is not empty
    if (name.trim()) {
      const sigImage = generateSignatureImage(name);
      setSignatureImage(sigImage);
    } else {
      setSignatureImage(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      // Call parent handler with all data
      // Parent will handle: complete job → create invoice → send invoice
      const completionData = {
        workPerformed,
        materialsUsed,
        completionNotes,
        employeeSignature,
        employeeSignatureImage: signatureImage, // Include generated signature image
        invoiceDate,
        paymentTerms,
        dueDate,
        invoiceNotes,
        recordPaymentNow,
        paymentMethod,
        paymentAmount: parseFloat(paymentAmount) || 0,
        deliveryMethod,
        customMessage,
        includeAttachment
      };

      if (onConfirm) {
        await onConfirm(completionData);
      }
      window?.toast?.success?.('Job completed and invoice sent!');
      onClose();
    } catch (e) {
      window?.toast?.error?.(e.message || 'Failed to process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Complete & Invoice</h2>
              <p className="text-sm text-green-100">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-green-100">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full ${s <= step ? 'bg-green-600' : 'bg-gray-300'}`} />
              <p className="text-xs text-gray-600 mt-1 text-center">
                {s === 1 ? 'Complete' : s === 2 ? 'Invoice' : 'Send'}
              </p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Step 1: Complete Job</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-900">{job?.job_title || job?.title}</p>
                <p className="text-gray-600">{customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Performed *</label>
                <textarea
                  value={workPerformed}
                  onChange={(e) => setWorkPerformed(e.target.value)}
                  placeholder="Describe work completed..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.workPerformed ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.workPerformed && <p className="text-sm text-red-600 mt-1">{errors.workPerformed}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materials Used (Optional)</label>
                <textarea
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                  placeholder="List materials used..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Signature (Optional)</label>
                <input
                  type="text"
                  value={employeeSignature}
                  onChange={handleSignatureNameChange}
                  placeholder="Type employee name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                {/* Display generated signature image */}
                {signatureImage && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Generated Signature:</p>
                    <img
                      src={signatureImage}
                      alt="Employee Signature"
                      className="max-w-full h-auto border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Step 2: Create Invoice</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.invoiceDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.invoiceDate && <p className="text-sm text-red-600 mt-1">{errors.invoiceDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms *</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Due on Receipt</option>
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 60</option>
                    <option>Net 90</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input type="date" value={dueDate} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">Invoice Total: ${parseFloat(jobTotal).toFixed(2)}</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordPaymentNow}
                  onChange={(e) => setRecordPaymentNow(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-900">Record payment now</span>
              </label>
              {recordPaymentNow && (
                <div className="grid grid-cols-2 gap-3 bg-green-50 p-3 rounded-lg">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="card">Card</option>
                    <option value="ach">ACH</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Amount"
                    className={`px-2 py-1 border rounded text-sm ${errors.paymentAmount ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Step 3: Send Invoice</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600">Sending to:</p>
                <p className="font-medium text-gray-900">{customerName}</p>
                {customerEmail && <p className="text-sm text-gray-600">{customerEmail}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method *</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`p-3 border-2 rounded-lg cursor-pointer text-center ${deliveryMethod === 'email' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <input type="radio" value="email" checked={deliveryMethod === 'email'} onChange={(e) => setDeliveryMethod(e.target.value)} className="sr-only" />
                    <span className="text-sm font-medium">📧 Email</span>
                  </label>
                  <label className={`p-3 border-2 rounded-lg cursor-pointer text-center ${deliveryMethod === 'copy' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <input type="radio" value="copy" checked={deliveryMethod === 'copy'} onChange={(e) => setDeliveryMethod(e.target.value)} className="sr-only" />
                    <span className="text-sm font-medium">🔗 Copy Link</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAttachment}
                  onChange={(e) => setIncludeAttachment(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-900">Include PDF attachment</span>
              </label>

              {/* Attachments Preview */}
              <div className="pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Attachments</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{attachmentsLoading ? 'Loading...' : (uploading ? 'Uploading…' : `${attachments.length} files`)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('\ud83d\udcce [+ Add] clicked');
                        if (!effCompanyId || !workOrderId) {
                          console.warn('\ud83d\udcce Missing companyId or workOrderId; cannot open file picker', { companyId: effCompanyId, workOrderId });
                        }
                        fileInputRef.current && fileInputRef.current.click();
                      }}
                      disabled={attachmentsLoading || uploading || !effCompanyId || !workOrderId}
                      className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                      + Add
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFilesSelected}
                      className="hidden"
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
                    />
                  </div>
                </div>
                {attachmentsLoading ? (
                  <p className="text-xs text-gray-500 mt-1">Loading attachments...</p>
                ) : attachments && attachments.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                        <div className="text-lg">{['jpg','jpeg','png','gif','webp','svg'].includes(String(file.file_type || '').toLowerCase()) ? '📷' : '📄'}</div>
                        <div className="min-w-0">
                          <div className="text-xs text-gray-900 truncate">{file.file_name || 'Attachment'}</div>
                          {file.file_size ? (
                            <div className="text-[10px] text-gray-500">{(file.file_size/1024).toFixed(1)} KB</div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">No attachments on this job.</p>
                )}
                <p className="text-[11px] text-gray-500 mt-2">All job attachments will be included in the email automatically.</p>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                Next <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                {loading ? 'Processing...' : 'Complete & Send'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionAndInvoiceModal;

