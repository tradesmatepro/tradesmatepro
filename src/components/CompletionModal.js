import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon, DocumentTextIcon, CameraIcon, PencilSquareIcon, CurrencyDollarIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

/**
 * CompletionModal - Capture job completion data
 * 
 * COMPETITIVE ADVANTAGE over ServiceTitan/Jobber/Housecall Pro:
 * - Single modal captures ALL completion data (competitors require multiple screens)
 * - "Create Invoice Now?" option (competitors force separate navigation)
 * - Materials tracking built-in (ServiceTitan charges extra for this)
 * - Customer signature placeholder (ready for Phase 5)
 * - Photos placeholder (ready for Phase 5)
 * 
 * Addresses Pain Points:
 * - ServiceTitan: Too many clicks to complete job and create invoice
 * - Jobber: No materials tracking in completion flow
 * - Housecall Pro: Signature capture is clunky and slow
 */

const CompletionModal = ({
  isOpen,
  onClose,
  onConfirm,
  jobTitle,
  customerName,
  scheduledDuration,
  actualStartTime
}) => {
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [completionTime, setCompletionTime] = useState(new Date().toTimeString().slice(0, 5));
  const [workPerformed, setWorkPerformed] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [createInvoiceNow, setCreateInvoiceNow] = useState(true);
  const [errors, setErrors] = useState({});

  // Phase 2 minimal: checklist, photos, typed signature
  const [checklist, setChecklist] = useState([{ id: 1, description: 'Clean work area', required: false, completed: false }]);
  const [newItem, setNewItem] = useState('');
  const [photos, setPhotos] = useState([]); // local File objects
  const [signatureName, setSignatureName] = useState('');

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    
    if (!completionDate) newErrors.completionDate = 'Completion date is required';
    if (!completionTime) newErrors.completionTime = 'Completion time is required';
    if (!workPerformed || workPerformed.trim().length < 10) {
      newErrors.workPerformed = 'Please provide a detailed summary (at least 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    onConfirm({
      completionDate,
      completionTime,
      completionDateTime: new Date(`${completionDate}T${completionTime}`).toISOString(),
      workPerformed: workPerformed.trim(),
      materialsUsed: materialsUsed.trim(),
      completionNotes: completionNotes.trim(),
      createInvoiceNow,
      // Phase 2 additions
      checklist: checklist.map(({ id, description, required, completed }) => ({ id, description, required, completed })),
      photos, // NOTE: raw files; caller may upload to storage and save URLs
      signature: signatureName.trim() || null
    });
  };

  // Calculate actual duration if start time is available
  const calculateDuration = () => {
    if (!actualStartTime) return null;
    const start = new Date(actualStartTime);
    const end = new Date(`${completionDate}T${completionTime}`);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMins}m`;
  };

  const actualDuration = calculateDuration();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Complete Job</h2>
              <p className="text-sm text-green-100">{jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-green-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-semibold text-gray-900">{customerName}</p>
            {actualDuration && (
              <div className="mt-2 flex items-center space-x-4 text-sm">
                <span className="text-gray-600">
                  Scheduled: <span className="font-medium">{scheduledDuration || 'N/A'}</span>
                </span>
                <span className="text-gray-600">
                  Actual: <span className="font-medium text-green-600">{actualDuration}</span>
                </span>
              </div>
            )}
          </div>

          {/* Completion Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Date *
              </label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.completionDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.completionDate && (
                <p className="mt-1 text-sm text-red-600">{errors.completionDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Time *
              </label>
              <input
                type="time"
                value={completionTime}
                onChange={(e) => setCompletionTime(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.completionTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.completionTime && (
                <p className="mt-1 text-sm text-red-600">{errors.completionTime}</p>
              )}
            </div>
          </div>

          {/* Work Performed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DocumentTextIcon className="h-4 w-4 inline mr-1" />
              Work Performed Summary *
            </label>
            <textarea
              value={workPerformed}
              onChange={(e) => setWorkPerformed(e.target.value)}
              placeholder="Describe the work completed (e.g., 'Replaced water heater, installed new shut-off valve, tested system')"
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.workPerformed ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.workPerformed && (
              <p className="mt-1 text-sm text-red-600">{errors.workPerformed}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              This will appear on the invoice and customer portal
            </p>
          </div>

          {/* Materials Used */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materials Used (Optional)
            </label>
            <textarea
              value={materialsUsed}
              onChange={(e) => setMaterialsUsed(e.target.value)}
              placeholder="List materials used (e.g., '50-gallon water heater, 2x copper fittings, 10ft PEX tubing')"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              💡 TIP: This helps with inventory tracking and future quotes
            </p>
          </div>

          {/* Completion Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <PencilSquareIcon className="h-4 w-4 inline mr-1" />
              Internal Notes (Optional)
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Any internal notes (e.g., 'Customer requested annual maintenance reminder', 'Recommend replacing pipes next year')"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Internal only - not visible to customer
            </p>
          </div>

          {/* Phase 2: Checklist, Photos, Typed Signature */}
          <div className="space-y-3">
            {/* Checklist */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">Completion Checklist</span>
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  className="flex-1 border rounded px-2 py-1"
                  placeholder="Add checklist item"
                  value={newItem}
                  onChange={(e)=>setNewItem(e.target.value)}
                />
                <button type="button" className="btn-secondary" onClick={()=>{
                  const d = newItem.trim(); if(!d) return; const id = Math.random().toString(36).slice(2);
                  setChecklist(prev=>[...prev, { id, description: d, required: false, completed: false }]); setNewItem('');
                }} disabled={!newItem.trim()}>
                  <PlusIcon className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {checklist.length === 0 ? (
                  <div className="text-xs text-gray-500">No items yet</div>
                ) : checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={item.completed} onChange={(e)=>setChecklist(cs=>cs.map(c=>c.id===item.id?{...c,completed:e.target.checked}:c))} />
                    <input className="flex-1 border rounded px-2 py-1" value={item.description} onChange={(e)=>setChecklist(cs=>cs.map(c=>c.id===item.id?{...c,description:e.target.value}:c))} />
                    <label className="flex items-center gap-1 text-xs text-gray-600">
                      <input type="checkbox" checked={item.required} onChange={(e)=>setChecklist(cs=>cs.map(c=>c.id===item.id?{...c,required:e.target.checked}:c))} /> Required
                    </label>
                    <button type="button" className="p-1 text-red-600 hover:bg-red-50 rounded" onClick={()=>setChecklist(cs=>cs.filter(c=>c.id!==item.id))}>
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Photos */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CameraIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">Before/After Photos</span>
              </div>
              <input type="file" multiple accept="image/*" onChange={(e)=>setPhotos(Array.from(e.target.files||[]))} />
              {photos.length>0 && (
                <div className="text-xs text-gray-500 mt-1">{photos.length} file(s) selected</div>
              )}
            </div>

            {/* Signature (typed) */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <PencilSquareIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">Customer Signature (typed)</span>
              </div>
              <input
                className="w-full border rounded px-2 py-1"
                placeholder="Type customer's full name"
                value={signatureName}
                onChange={(e)=>setSignatureName(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Canvas signature pad to be added later; typed name stored for now.</p>
            </div>
          </div>

          {/* Create Invoice Now */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={createInvoiceNow}
                onChange={(e) => setCreateInvoiceNow(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Create Invoice Now</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Recommended</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {createInvoiceNow 
                    ? "✅ Invoice will be created automatically after completion"
                    : "⏸️ You can create the invoice later from the Jobs page"}
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              <span>Complete Job</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompletionModal;

