import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../utils/supabaseClient';

const AuthStatusIndicator = () => {
  const { user, isAuthenticated } = useUser();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSessionInfo({
        hasSession: !!session,
        userEmail: session?.user?.email,
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : null,
        isExpired: session?.expires_at ? session.expires_at < Date.now() / 1000 : true,
        error: error?.message
      });
    };
    
    checkSession();
    
    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!sessionInfo?.hasSession || sessionInfo?.isExpired || !isAuthenticated) {
      return 'bg-red-500';
    }
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!sessionInfo?.hasSession) return 'No Session';
    if (sessionInfo?.isExpired) return 'Session Expired';
    if (!isAuthenticated) return 'Not Authenticated';
    return 'Authenticated';
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <div 
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg cursor-pointer transition-all ${
          expanded ? 'bg-white border border-gray-200' : 'bg-gray-800 text-white'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <span className="text-sm font-medium">
          {expanded ? 'Auth Status' : getStatusText()}
        </span>
        {expanded && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      {expanded && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-80">
          <h3 className="font-bold text-gray-900 mb-3">Authentication Status</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">User Context:</span>
              <span className={user ? 'text-green-600' : 'text-red-600'}>
                {user ? '✅ Present' : '❌ Missing'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Authenticated:</span>
              <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                {isAuthenticated ? '✅ True' : '❌ False'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Supabase Session:</span>
              <span className={sessionInfo?.hasSession ? 'text-green-600' : 'text-red-600'}>
                {sessionInfo?.hasSession ? '✅ Present' : '❌ Missing'}
              </span>
            </div>
            
            {sessionInfo?.hasSession && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Valid:</span>
                  <span className={!sessionInfo?.isExpired ? 'text-green-600' : 'text-red-600'}>
                    {!sessionInfo?.isExpired ? '✅ Valid' : '❌ Expired'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">User Email:</span>
                  <span className="text-gray-900 font-mono text-xs">
                    {sessionInfo?.userEmail || 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className="text-gray-900 text-xs">
                    {sessionInfo?.expiresAt?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </>
            )}
            
            {sessionInfo?.error && (
              <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-xs">
                <strong>Error:</strong> {sessionInfo.error}
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <strong>Expected Behavior:</strong><br/>
              • All indicators should be ✅ Green<br/>
              • Session should persist on page refresh<br/>
              • No "Authentication Required" screens
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthStatusIndicator;
