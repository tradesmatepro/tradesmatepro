// Portal Quotes Component - Quote viewing and e-signature functionality
import React, { useState } from 'react';
import { useCustomerPortal } from '../../contexts/CustomerPortalContext';
import CustomerPortalService from '../../services/CustomerPortalService';
import ESignatureModal from './ESignatureModal';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilSquareIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const PortalQuotes = ({ quotes, onRefresh }) => {
  const { customer, sessionToken } = useCustomerPortal();
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
  };

  const handleSignQuote = (quote) => {
    setSelectedQuote(quote);
    setShowSignatureModal(true);
  };

  const handleSignatureComplete = async (signatureData) => {
    try {
      setLoading(true);
      await CustomerPortalService.signQuote(
        selectedQuote.id,
        signatureData,
        sessionToken
      );
      setShowSignatureModal(false);
      setSelectedQuote(null);
      onRefresh();
    } catch (error) {
      console.error('Error signing quote:', error);
      alert('Failed to sign quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, signedAt) => {
    if (signedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Approved
        </span>
      );
    }

    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            Pending Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const QuoteCard = ({ quote }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Quote #{quote.quote_number}
            </h3>
            <p className="text-sm text-gray-600">{quote.title}</p>
          </div>
        </div>
        {getStatusBadge(quote.status, quote.signed_at)}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 line-clamp-2">{quote.description}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
            <span className="font-medium text-gray-900">
              ${quote.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {new Date(quote.created_at).toLocaleDateString()}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {quote.company_name}
        </div>
      </div>

      {quote.signed_at && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <CheckCircleIcon className="h-4 w-4 inline mr-1" />
            Signed by {quote.signed_by} on {new Date(quote.signed_at).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => handleViewQuote(quote)}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          View Details
        </button>
        
        {!quote.signed_at && quote.status === 'PENDING' && (
          <button
            onClick={() => handleSignQuote(quote)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PencilSquareIcon className="h-4 w-4 mr-2" />
            Sign & Approve
          </button>
        )}
      </div>
    </div>
  );

  const QuoteDetailModal = ({ quote, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Quote #{quote.quote_number}</h2>
            <p className="text-sm text-gray-600">{quote.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700">{quote.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Quote Details</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Subtotal:</dt>
                    <dd className="text-sm font-medium">${quote.subtotal?.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Total:</dt>
                    <dd className="text-lg font-bold">${quote.total_amount?.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Created:</dt>
                    <dd className="text-sm">{new Date(quote.created_at).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Company Details</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-600">Company:</dt>
                    <dd className="text-sm font-medium">{quote.company_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Phone:</dt>
                    <dd className="text-sm">{quote.company_phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Email:</dt>
                    <dd className="text-sm">{quote.company_email}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
            {!quote.signed_at && quote.status === 'PENDING' && (
              <button
                onClick={() => {
                  onClose();
                  handleSignQuote(quote);
                }}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign & Approve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Quotes</h2>
        <p className="text-sm text-gray-600">{quotes.length} total quotes</p>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No quotes yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your quotes will appear here once they're created.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      )}

      {/* Quote Detail Modal */}
      {selectedQuote && !showSignatureModal && (
        <QuoteDetailModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
        />
      )}

      {/* E-Signature Modal */}
      {showSignatureModal && selectedQuote && (
        <ESignatureModal
          quote={selectedQuote}
          onSignatureComplete={handleSignatureComplete}
          onClose={() => {
            setShowSignatureModal(false);
            setSelectedQuote(null);
          }}
          loading={loading}
        />
      )}
    </div>
  );
};

export default PortalQuotes;
