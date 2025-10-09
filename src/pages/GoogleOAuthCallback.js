import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GoogleCalendarService from '../services/GoogleCalendarService';

const GoogleOAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing Google Calendar authorization...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing authorization code or state parameter');
        return;
      }

      setMessage('Exchanging authorization code for access tokens...');
      
      // Exchange code for tokens
      const result = await GoogleCalendarService.exchangeCodeForTokens(code, state);
      
      if (result.success) {
        setStatus('success');
        setMessage('Google Calendar connected successfully!');
        
        // Redirect back to settings after 2 seconds
        setTimeout(() => {
          navigate('/settings?tab=integrations&success=google_calendar');
        }, 2000);
      } else {
        setStatus('error');
        setMessage('Failed to complete Google Calendar setup');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(`Setup failed: ${error.message}`);
    }
  };

  const handleRetry = () => {
    navigate('/settings?tab=integrations');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Status Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4">
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status === 'processing' && 'Setting up Google Calendar'}
            {status === 'success' && 'Integration Complete!'}
            {status === 'error' && 'Setup Failed'}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Actions */}
          {status === 'success' && (
            <div className="space-y-3">
              <p className="text-sm text-green-600">
                Redirecting to settings in a moment...
              </p>
              <button
                onClick={() => navigate('/settings?tab=integrations')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Settings Now
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Settings
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {status === 'processing' && (
            <p className="text-sm text-gray-500">
              Please wait while we complete the setup...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
