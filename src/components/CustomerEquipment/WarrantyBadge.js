import React from 'react';
import { ShieldCheckIcon, ShieldExclamationIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * WarrantyBadge Component
 * Displays warranty status with color-coded badge
 * 
 * Status:
 * - Active: Green (warranty is valid)
 * - Expiring Soon: Yellow (< 90 days remaining)
 * - Expired: Red (warranty has ended)
 * - No Warranty: Gray (no warranty info)
 */
const WarrantyBadge = ({ warrantyStartDate, warrantyEndDate, size = 'md' }) => {
  const getWarrantyStatus = () => {
    if (!warrantyEndDate) {
      return {
        status: 'none',
        label: 'No Warranty',
        color: 'bg-gray-100 text-gray-800',
        icon: ShieldExclamationIcon,
        daysRemaining: null
      };
    }

    const today = new Date();
    const endDate = new Date(warrantyEndDate);
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return {
        status: 'expired',
        label: 'Expired',
        color: 'bg-red-100 text-red-800',
        icon: ExclamationTriangleIcon,
        daysRemaining: Math.abs(daysRemaining)
      };
    }

    if (daysRemaining <= 90) {
      return {
        status: 'expiring',
        label: 'Expiring Soon',
        color: 'bg-yellow-100 text-yellow-800',
        icon: ShieldExclamationIcon,
        daysRemaining
      };
    }

    return {
      status: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: ShieldCheckIcon,
      daysRemaining
    };
  };

  const warranty = getWarrantyStatus();
  const Icon = warranty.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 rounded-full font-medium ${warranty.color} ${sizeClasses[size]}`}>
        <Icon className={iconSizes[size]} />
        {warranty.label}
      </span>
      
      {warranty.daysRemaining !== null && warranty.status !== 'none' && (
        <span className="text-xs text-gray-600">
          {warranty.status === 'expired' 
            ? `${warranty.daysRemaining} days ago`
            : `${warranty.daysRemaining} days left`
          }
        </span>
      )}
    </div>
  );
};

export default WarrantyBadge;

