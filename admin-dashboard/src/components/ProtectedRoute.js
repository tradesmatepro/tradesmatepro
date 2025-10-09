import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('🔒 ProtectedRoute - User:', user, 'Loading:', loading);

  if (loading) {
    console.log('🔒 ProtectedRoute - Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Checking authentication...</span>
      </div>
    );
  }

  if (!user) {
    console.log('🔒 ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔒 ProtectedRoute - User authenticated, showing content');
  return children;
};

export default ProtectedRoute;
