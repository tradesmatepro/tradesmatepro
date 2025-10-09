import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  ShieldExclamationIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    // Route based on user role
    if (user?.role === 'CUSTOMER') {
      navigate('/customer-portal');
    } else if (user?.role === 'EMPLOYEE') {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto h-24 w-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-8">
          <ShieldExclamationIcon className="w-12 h-12 text-white" />
        </div>

        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          You don't have permission to access this page
        </p>
        <p className="text-sm text-gray-500 mb-8">
          {user?.role ? (
            <>Your current role (<span className="font-medium">{user.role}</span>) doesn't have access to the admin dashboard.</>
          ) : (
            'Please contact your administrator for access.'
          )}
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <HomeIcon className="w-5 h-5" />
            Go to Dashboard
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Need access?</h3>
          <p className="text-sm text-blue-700">
            Contact your system administrator to request access to the admin dashboard.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            TradeMate Pro • Secure Access Control
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
