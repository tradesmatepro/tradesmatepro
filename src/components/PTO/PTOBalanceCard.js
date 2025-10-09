// PTO Balance Card - Visual representation of PTO balances with progress bars
import React from 'react';
import PTOServiceProduction from '../../services/PTOServiceProduction';
import {
  CalendarDaysIcon,
  HeartIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const PTOBalanceCard = ({ 
  title, 
  balance, 
  maxBalance, 
  accrualRate, 
  accrualPeriod, 
  type,
  subtitle 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'vacation':
        return <CalendarDaysIcon className="h-6 w-6 text-blue-600" />;
      case 'sick':
        return <HeartIcon className="h-6 w-6 text-red-600" />;
      case 'total':
        return <ClockIcon className="h-6 w-6 text-green-600" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'vacation':
        return 'bg-blue-600';
      case 'sick':
        return 'bg-red-600';
      case 'total':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getProgressPercentage = () => {
    if (!maxBalance || maxBalance === 0) return 0;
    return Math.min((balance / maxBalance) * 100, 100);
  };

  const formatBalance = (hours) => {
    return PTOServiceProduction.formatBalance(hours);
  };

  const getAccrualInfo = () => {
    if (!accrualRate || !accrualPeriod) return null;
    
    return (
      <div className="mt-2 text-xs text-gray-500">
        Accrues {formatBalance(accrualRate)} hrs {accrualPeriod}
      </div>
    );
  };

  const getBalanceStatus = () => {
    if (!maxBalance) return null;
    
    const percentage = getProgressPercentage();
    if (percentage >= 90) {
      return (
        <div className="mt-2 text-xs text-amber-600 font-medium">
          Near maximum balance
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {getIcon()}
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Balance Display */}
      <div className="mb-4">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">
            {formatBalance(balance)}
          </span>
          <span className="ml-2 text-lg text-gray-500">hours</span>
        </div>
        
        {maxBalance && (
          <div className="text-sm text-gray-500 mt-1">
            of {formatBalance(maxBalance)} hours maximum
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {maxBalance && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Available</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="space-y-1">
        {getAccrualInfo()}
        {getBalanceStatus()}
      </div>

      {/* Days Equivalent */}
      {balance > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              {Math.floor(balance / 8)} days
            </span>
            {balance % 8 !== 0 && (
              <span>, {balance % 8} hours</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PTOBalanceCard;
