// Customer Portal Main Page - Entry point for customer portal
import React from 'react';
import { CustomerPortalProvider, useCustomerPortal } from '../contexts/CustomerPortalContext';
import PortalLogin from '../components/CustomerPortal/PortalLogin';
import PortalDashboard from '../components/CustomerPortal/PortalDashboard';

const CustomerPortalContent = () => {
  const { customer, loading } = useCustomerPortal();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return <PortalLogin />;
  }

  return <PortalDashboard />;
};

const CustomerPortal = () => {
  return (
    <CustomerPortalProvider>
      <CustomerPortalContent />
    </CustomerPortalProvider>
  );
};

export default CustomerPortal;
