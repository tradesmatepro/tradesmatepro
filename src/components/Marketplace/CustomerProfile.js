import React from 'react';
import { useUser } from '../../contexts/UserContext';

const CustomerProfile = () => {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Profile</h2>
        <p className="text-gray-600 mb-6">
          This is where you would manage your profile when acting as a customer.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Coming Soon</h3>
          <p className="text-blue-700">
            Full Customer Portal profile management functionality will be integrated here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
