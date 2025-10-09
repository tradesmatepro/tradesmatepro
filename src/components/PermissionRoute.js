import React from 'react';
import { useUser } from '../contexts/UserContext';
import { hasPermission, getRoleDisplayName } from '../utils/roleUtils';

const PermissionRoute = ({ children, permission, fallbackMessage }) => {
  const { user, loading } = useUser();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check if user has the required permission
  if (!hasPermission(user, permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            {fallbackMessage || 'You don\'t have permission to access this resource.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            Current Role: <span className="font-medium">{getRoleDisplayName(user?.role)}</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Required Permission: <span className="font-mono">{permission}</span>
          </div>
        </div>
      </div>
    );
  }

  // Render the protected component if user has permission
  return children;
};

export default PermissionRoute;
