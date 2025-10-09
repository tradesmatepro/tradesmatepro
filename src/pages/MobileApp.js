// Mobile Field App - Coming Soon Placeholder
import React from 'react';
import PageHeader from '../components/Common/PageHeader';
import { DevicePhoneMobileIcon, ClockIcon } from '@heroicons/react/24/outline';

const MobileApp = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mobile Field App"
        subtitle="Native mobile application - Coming Soon"
      />

      {/* Coming Soon Banner */}
      <div className="max-w-2xl mx-auto text-center py-16">
        <DevicePhoneMobileIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mobile Field App</h2>
        <p className="text-gray-600 mb-8">
          Native mobile application for field technicians is in development.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-center">
            <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileApp;
