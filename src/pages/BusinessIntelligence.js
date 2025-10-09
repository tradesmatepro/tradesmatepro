// Business Intelligence - Coming Soon Placeholder
import React from 'react';
import PageHeader from '../components/Common/PageHeader';
import { ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';

const BusinessIntelligence = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Intelligence"
        subtitle="Advanced analytics and reporting - Coming Soon"
      />

      {/* Coming Soon Banner */}
      <div className="max-w-2xl mx-auto text-center py-16">
        <ChartBarIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Intelligence</h2>
        <p className="text-gray-600 mb-8">
          Advanced analytics and business intelligence features are in development.
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

export default BusinessIntelligence;
