import React, { useMemo, useState } from 'react';
import { XMarkIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const PartialInvoiceModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount = 0,
  alreadyInvoiced = 0,
  depositAmount = 0
}) => {
  const [mode, setMode] = useState('percent'); // 'percent' | 'amount'
  const [percent, setPercent] = useState(50);
  const [amount, setAmount] = useState(0);

  const remainingBefore = Math.max(0, Number(totalAmount) - Number(alreadyInvoiced));
  const deposit = Math.max(0, Number(depositAmount) || 0);

  const computed = useMemo(() => {
    let nextAmount = 0;
    if (mode === 'percent') {
      nextAmount = (clamp(Number(percent) || 0, 0, 100) / 100) * remainingBefore;
    } else {
      nextAmount = clamp(Number(amount) || 0, 0, remainingBefore);
    }
    // Subtract deposit if this is the first partial and a deposit exists
    const firstPartial = alreadyInvoiced <= 0 && deposit > 0;
    const appliedDeposit = firstPartial ? Math.min(deposit, nextAmount) : 0;
    const actualInvoiceAmount = Math.max(0, nextAmount - appliedDeposit);
    const newRemaining = Math.max(0, remainingBefore - nextAmount);
    return { nextAmount, appliedDeposit, actualInvoiceAmount, newRemaining };
  }, [mode, percent, amount, remainingBefore, alreadyInvoiced, deposit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      basis: mode,
      percent: mode === 'percent' ? clamp(Number(percent) || 0, 0, 100) : null,
      amount: mode === 'amount' ? clamp(Number(amount) || 0, 0, remainingBefore) : computed.actualInvoiceAmount,
      raw_amount_before_deposit: computed.nextAmount,
      applied_deposit: computed.appliedDeposit,
      remaining_after: computed.newRemaining
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold">Create Partial/Progress Invoice</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="bg-gray-50 rounded p-3 text-sm">
            <div className="flex justify-between"><span>Total</span><span>${Number(totalAmount).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Already invoiced</span><span>${Number(alreadyInvoiced).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Deposit recorded</span><span>${Number(deposit).toFixed(2)}</span></div>
            <div className="flex justify-between font-medium mt-1"><span>Remaining (before this)</span><span>${remainingBefore.toFixed(2)}</span></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Basis</label>
            <select value={mode} onChange={e=>setMode(e.target.value)} className="w-full border rounded px-2 py-1">
              <option value="percent">Percent of remaining</option>
              <option value="amount">Fixed amount</option>
            </select>
          </div>

          {mode === 'percent' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Percent (%)</label>
              <input type="number" min="0" max="100" step="0.01" value={percent} onChange={e=>setPercent(e.target.value)} className="w-full border rounded px-2 py-1" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full border rounded px-2 py-1" />
            </div>
          )}

          <div className="bg-blue-50 rounded p-3 text-sm">
            <div className="flex justify-between"><span>Calculated this invoice</span><span>${computed.nextAmount.toFixed(2)}</span></div>
            {computed.appliedDeposit > 0 && (
              <div className="flex justify-between text-blue-700"><span>Less deposit applied</span><span>- ${computed.appliedDeposit.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between font-medium mt-1"><span>Invoice amount</span><span>${computed.actualInvoiceAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Remaining after</span><span>${computed.newRemaining.toFixed(2)}</span></div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4" /> Create Partial
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartialInvoiceModal;

