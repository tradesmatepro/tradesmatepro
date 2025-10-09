import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, PencilSquareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { quoteSendingService } from '../services/QuoteSendingService';

/**
 * PublicQuoteView - Customer-facing quote view page
 * Industry Standard: Jobber Client Hub, ServiceTitan Online Estimates
 * 
 * Features:
 * - No login required (magic link with token)
 * - Mobile-responsive
 * - One-click approve with e-signature
 * - Request changes
 * - Download PDF
 */

const PublicQuoteView = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [company, setCompany] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  
  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [signatureType, setSignatureType] = useState('draw'); // 'draw' or 'type'
  const [typedSignature, setTypedSignature] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const [approving, setApproving] = useState(false);
  
  // Request changes modal state
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [changeTypes, setChangeTypes] = useState([]);
  const [changeDetails, setChangeDetails] = useState('');
  const [submittingChanges, setSubmittingChanges] = useState(false);

  useEffect(() => {
    loadQuote();
  }, [token]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      setError(null);

      // Track view
      await quoteSendingService.trackQuoteView(token, window.location.hostname);

      // Fetch quote data
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_orders?portal_token=eq.${token}&select=*,customers(*)`,
        {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (!data || data.length === 0) {
        setError('Quote not found or link has expired. Please contact the company for a new link.');
        setLoading(false);
        return;
      }

      const quoteData = data[0];
      setQuote(quoteData);
      setCustomer(quoteData.customers);

      // Fetch company info
      const companyResponse = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/profiles?id=eq.${quoteData.company_id}`,
        {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      const companyData = await companyResponse.json();
      if (companyData && companyData.length > 0) {
        setCompany(companyData[0]);
      }

      // Fetch line items
      const lineItemsResponse = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_order_line_items?work_order_id=eq.${quoteData.id}&order=sort_order.asc`,
        {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      const lineItemsData = await lineItemsResponse.json();
      setLineItems(lineItemsData || []);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load quote:', err);
      setError('Failed to load quote. Please try again or contact the company.');
      setLoading(false);
    }
  };

  // Canvas drawing functions
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleApprove = async () => {
    try {
      setApproving(true);

      let signatureData = '';
      if (signatureType === 'draw') {
        const canvas = canvasRef.current;
        signatureData = canvas.toDataURL();
      } else {
        signatureData = typedSignature;
      }

      if (!signatureData) {
        alert('Please provide a signature');
        setApproving(false);
        return;
      }

      // Submit approval
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_orders?portal_token=eq.${token}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: customer?.name || 'Customer',
            approval_signature: signatureData,
            approval_method: 'online',
            updated_at: new Date().toISOString()
          })
        }
      );

      if (response.ok) {
        alert('✅ Quote approved successfully! The company will be notified.');
        loadQuote(); // Reload to show approved status
        setShowApprovalModal(false);
      } else {
        throw new Error('Failed to approve quote');
      }
    } catch (err) {
      console.error('Failed to approve quote:', err);
      alert('Failed to approve quote. Please try again or contact the company.');
    } finally {
      setApproving(false);
    }
  };

  const handleRequestChanges = async () => {
    try {
      setSubmittingChanges(true);

      if (changeTypes.length === 0 || !changeDetails.trim()) {
        alert('Please select change types and provide details');
        setSubmittingChanges(false);
        return;
      }

      // Submit change request
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_orders?portal_token=eq.${token}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'changes_requested',
            change_types: changeTypes,
            change_details: changeDetails,
            updated_at: new Date().toISOString()
          })
        }
      );

      if (response.ok) {
        alert('✅ Change request submitted! The company will review and send you an updated quote.');
        loadQuote();
        setShowChangesModal(false);
      } else {
        throw new Error('Failed to submit change request');
      }
    } catch (err) {
      console.error('Failed to submit change request:', err);
      alert('Failed to submit change request. Please try again or contact the company.');
    } finally {
      setSubmittingChanges(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Quote</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const isApproved = quote?.status === 'approved';
  const isChangesRequested = quote?.status === 'changes_requested';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {company?.logo_url && (
            <img src={company.logo_url} alt={company.company_name} className="h-16 mb-4" />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{company?.company_name || 'Quote'}</h1>
          <p className="text-gray-600">{company?.address}</p>
          <p className="text-gray-600">{company?.phone}</p>
        </div>

        {/* Status Banner */}
        {isApproved && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
              <p className="text-green-800 font-semibold">This quote has been approved!</p>
            </div>
          </div>
        )}

        {isChangesRequested && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <PencilSquareIcon className="h-6 w-6 text-yellow-500 mr-3" />
              <p className="text-yellow-800 font-semibold">Changes requested - waiting for updated quote</p>
            </div>
          </div>
        )}

        {/* Quote Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{quote?.title}</h2>
          <p className="text-gray-600 mb-6">{quote?.description}</p>

          {/* Line Items */}
          {lineItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">${(item.unit_price || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">${(item.total_price || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">${(quote?.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tax ({((quote?.tax_rate || 0) * 100).toFixed(1)}%):</span>
              <span className="font-semibold">${(quote?.tax_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total:</span>
              <span className="text-blue-600">${(quote?.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isApproved && !isChangesRequested && (
          <div className="flex gap-4">
            <button
              onClick={() => setShowApprovalModal(true)}
              className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="h-6 w-6" />
              Approve Quote
            </button>
            <button
              onClick={() => setShowChangesModal(true)}
              className="flex-1 bg-gray-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              <PencilSquareIcon className="h-6 w-6" />
              Request Changes
            </button>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Approve Quote</h3>

                <p className="text-gray-600 mb-6">
                  By signing below, you approve this quote and authorize {company?.company_name} to proceed with the work.
                </p>

                {/* Signature Type Toggle */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setSignatureType('draw')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
                      signatureType === 'draw'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Draw Signature
                  </button>
                  <button
                    onClick={() => setSignatureType('type')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
                      signatureType === 'type'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Type Signature
                  </button>
                </div>

                {/* Draw Signature */}
                {signatureType === 'draw' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Draw your signature below:
                    </label>
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className="border-2 border-gray-300 rounded-lg w-full cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <button
                      onClick={clearCanvas}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Type Signature */}
                {signatureType === 'type' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type your full name:
                    </label>
                    <input
                      type="text"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl font-signature"
                      style={{ fontFamily: 'Brush Script MT, cursive' }}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                    disabled={approving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                    disabled={approving}
                  >
                    {approving ? 'Approving...' : 'Confirm Approval'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Changes Modal */}
        {showChangesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Request Changes</h3>

                <p className="text-gray-600 mb-6">
                  Let us know what changes you'd like to see in this quote.
                </p>

                {/* Change Types */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What would you like to change?
                  </label>
                  <div className="space-y-2">
                    {['reduce_price', 'add_items', 'remove_items', 'change_scope', 'adjust_timeline', 'other'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={changeTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setChangeTypes([...changeTypes, type]);
                            } else {
                              setChangeTypes(changeTypes.filter(t => t !== type));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">
                          {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Change Details */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please provide details:
                  </label>
                  <textarea
                    value={changeDetails}
                    onChange={(e) => setChangeDetails(e.target.value)}
                    placeholder="Describe the changes you'd like..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowChangesModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                    disabled={submittingChanges}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestChanges}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={submittingChanges}
                  >
                    {submittingChanges ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PublicQuoteView;

