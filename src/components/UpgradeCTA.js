import React from 'react';
import { useUser } from '../contexts/UserContext';
import { shouldShowUpgradeCTA, getUpgradeMessage, getTierConfig } from '../utils/planUtils';

const UpgradeCTA = ({ feature, children, className = '' }) => {
  const { user } = useUser();
  
  if (!user || !shouldShowUpgradeCTA(user.tier, feature)) {
    return children;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
        <div className="text-center p-4">
          <div className="text-sm font-medium text-gray-900 mb-2">
            {getTierConfig(user.tier).name} Plan
          </div>
          <div className="text-sm text-gray-600 mb-3">
            {getUpgradeMessage(user.tier, feature)}
          </div>
          <button
            onClick={() => {
              // Navigate to billing/upgrade page
              window.location.href = '/settings?tab=billing';
            }}
            className="btn-primary text-sm"
          >
            Upgrade Now
          </button>
        </div>
      </div>
      
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none">
        {children}
      </div>
    </div>
  );
};

export default UpgradeCTA;
