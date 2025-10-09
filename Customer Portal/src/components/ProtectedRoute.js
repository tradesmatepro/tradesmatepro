import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCustomer } from '../contexts/CustomerContext';
import LoadingSpinner from './Common/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useCustomer();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
