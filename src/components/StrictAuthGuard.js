import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../utils/supabaseClient';

const StrictAuthGuard = ({ children }) => {
  const { user, isAuthenticated, loading } = useUser();
  const [sessionValid, setSessionValid] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session validation error:', error);
          setSessionValid(false);
          setChecking(false);
          return;
        }

        if (!session || !session.user) {
          console.log('❌ No valid session found');
          setSessionValid(false);
          setChecking(false);
          return;
        }

        // Check if session is expired
        if (session.expires_at && session.expires_at < Date.now() / 1000) {
          console.log('❌ Session expired');
          setSessionValid(false);
          setChecking(false);
          return;
        }

        console.log('✅ Session validation passed');
        setSessionValid(true);
        setChecking(false);
      } catch (error) {
        console.error('❌ Session validation failed:', error);
        setSessionValid(false);
        setChecking(false);
      }
    };

    if (!loading) {
      validateSession();
    }
  }, [loading, isAuthenticated]);

  // Show loading while checking
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Checking Authentication</h2>
          <p className="text-gray-600">Validating your session...</p>
        </div>
      </div>
    );
  }

  // Show authentication required if no valid session
  if (!sessionValid || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You must be logged in with a valid session to access this application.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Login
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Refresh Page
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-left">
            <h3 className="font-medium text-yellow-800 mb-2">Debug Information:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• User Context: {user ? '✅ Present' : '❌ Missing'}</li>
              <li>• Authenticated: {isAuthenticated ? '✅ True' : '❌ False'}</li>
              <li>• Session Valid: {sessionValid ? '✅ True' : '❌ False'}</li>
              <li>• Loading: {loading ? '⏳ True' : '✅ False'}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Render children if authentication is valid
  return children;
};

export default StrictAuthGuard;
