/**
 * Network Status Indicator - Shows offline warning banner
 * 
 * This is a NEW component that doesn't modify any existing code.
 * Just displays a warning when user goes offline.
 */

import React, { useState, useEffect } from 'react';

const NetworkStatusIndicator = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowReconnected(true);
      
      // Hide "reconnected" message after 3 seconds
      setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show anything when online (unless just reconnected)
  if (online && !showReconnected) {
    return null;
  }

  return (
    <>
      {/* Offline Warning */}
      {!online && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center z-50 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <span className="font-medium">
              You are offline. Some features may not work until you reconnect.
            </span>
          </div>
        </div>
      )}

      {/* Reconnected Success */}
      {online && showReconnected && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white px-4 py-2 text-center z-50 shadow-lg animate-slide-down">
          <div className="flex items-center justify-center gap-2">
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span className="font-medium">
              Back online! All features are now available.
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkStatusIndicator;

