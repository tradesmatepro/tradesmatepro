/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const PublicQuote = () => {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuote();
    }
  }, [id]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      
      // Query work_orders by ID (public access for magic links)
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_orders?id=eq.${id}&select=id,quote_number,created_at,total_amount,status,title,description,attachments,customer_id`, {
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setQuote(data[0]);
        } else {
          setError('Quote not found');
        }
      } else {
        setError('Failed to load quote');
      }
    } catch (error) {
      console.error('Error loading quote:', error);
      setError('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  // Accept quote
  const handleAcceptQuote = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_orders?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'ACCEPTED'
        })
      });

      if (response.ok) {
        setQuote(prev => ({ ...prev, status: 'ACCEPTED' }));
        setShowSignupPrompt(true);
      } else {
        alert('Failed to accept quote');
      }
    } catch (error) {
      console.error('Error accepting quote:', error);
      alert('Failed to accept quote');
    }
  };

  // Decline quote
  const handleDeclineQuote = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_orders?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'REJECTED'
        })
      });

      if (response.ok) {
        setQuote(prev => ({ ...prev, quote_status: 'DECLINED' }));
      } else {
        alert('Failed to decline quote');
      }
    } catch (error) {
      console.error('Error declining quote:', error);
      alert('Failed to decline quote');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XMarkIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Quote Not Found</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Quote</h1>
          <p className="text-gray-600 mt-2">Quote #{quote.quote_number || quote.id}</p>
        </div>

        {/* Quote Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Project Details */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Project Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{quote.title}</h3>
                {quote.description && (
                  <p className="text-gray-600 mt-2">{quote.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-3">
                  Quote Date: {formatDate(quote.created_at)}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Quote Total</h2>
              <div className="bg-primary-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {formatCurrency(quote.total_amount)}
                </div>
              </div>
            </div>

            {/* PDF Download */}
            {quote.attachments && quote.attachments.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Documents</h2>
                <div className="space-y-2">
                  {quote.attachments.map((attachment, index) => (
                    <button
                      key={index}
                      onClick={() => window.open(attachment.url, '_blank')}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 w-full text-left transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-6 h-6 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{attachment.name || 'Quote PDF'}</p>
                        <p className="text-sm text-gray-500">Click to download</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {['QUOTE','SENT'].includes(quote.status) && (
              <div className="flex gap-4">
                <button
                  onClick={handleDeclineQuote}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Decline Quote
                </button>
                <button
                  onClick={handleAcceptQuote}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Accept Quote
                </button>
              </div>
            )}

            {quote.status === 'ACCEPTED' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <span className="font-medium text-green-900">Quote Accepted</span>
                </div>
                <p className="text-green-700 mt-1">
                  Thank you for accepting this quote! Your service will be scheduled soon.
                </p>
              </div>
            )}

            {quote.status === 'REJECTED' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <XMarkIcon className="w-6 h-6 text-red-600" />
                  <span className="font-medium text-red-900">Quote Declined</span>
                </div>
                <p className="text-red-700 mt-1">
                  This quote has been declined.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Signup Prompt Modal */}
        {showSignupPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Create Your Account</h3>
              <p className="text-gray-600 mb-4">
                Would you like to create a customer portal account to track your project progress?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignupPrompt(false)}
                  className="flex-1 btn-secondary"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    // Redirect to signup with customer_id
                    window.location.href = `/signup?customer_id=${quote.customer_id}`;
                  }}
                  className="flex-1 btn-primary"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicQuote;
