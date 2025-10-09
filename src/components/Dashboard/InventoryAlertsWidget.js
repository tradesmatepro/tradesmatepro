import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import inventoryAlertsService from '../../services/InventoryAlertsService';

const InventoryAlertsWidget = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [alertsSummary, setAlertsSummary] = useState({
    outOfStockCount: 0,
    lowStockCount: 0,
    totalAlertsCount: 0,
    inStockCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.company_id) {
      loadAlertsSummary();
      // Check for new alerts and create notifications
      checkForNewAlerts();
    }
  }, [user?.company_id]);

  const loadAlertsSummary = async () => {
    try {
      setLoading(true);
      const summary = await inventoryAlertsService.getAlertsSummary(user.company_id);
      setAlertsSummary(summary);
    } catch (error) {
      console.error('Error loading inventory alerts summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewAlerts = async () => {
    try {
      await inventoryAlertsService.checkAndCreateAlerts(user.company_id, user.id);
    } catch (error) {
      console.error('Error checking for new inventory alerts:', error);
    }
  };

  const handleViewInventory = () => {
    // Navigate to inventory with filter for low/out of stock items
    navigate('/operations/inventory?tab=items&filter=alerts');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const hasAlerts = alertsSummary.totalAlertsCount > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 border-b border-gray-100 ${
        hasAlerts ? 'bg-gradient-to-r from-yellow-50 to-red-50' : 'bg-gradient-to-r from-green-50 to-blue-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${hasAlerts ? 'bg-white bg-opacity-50' : 'bg-white bg-opacity-50'}`}>
              <ArchiveBoxIcon className={`h-6 w-6 ${hasAlerts ? 'text-yellow-600' : 'text-green-600'}`} />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
              <p className="text-sm text-gray-600">
                {hasAlerts ? 'Attention Required' : 'All Systems Good'}
              </p>
            </div>
          </div>
          {hasAlerts ? (
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
          ) : (
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {hasAlerts ? (
          <div className="space-y-6">
            {/* Alert Cards */}
            <div className="grid grid-cols-1 gap-4">
              {alertsSummary.outOfStockCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <XCircleIcon className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-semibold text-red-800">
                          Out of Stock Items
                        </h4>
                        <p className="text-xs text-red-600">
                          Immediate attention required
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-700">
                        {alertsSummary.outOfStockCount}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {alertsSummary.lowStockCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-semibold text-yellow-800">
                          Low Stock Items
                        </h4>
                        <p className="text-xs text-yellow-600">
                          Consider reordering soon
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-700">
                        {alertsSummary.lowStockCount}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {alertsSummary.totalAlertsCount}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {alertsSummary.totalAlertsCount === 1 ? 'Item needs attention' : 'Items need attention'}
                </div>
                <div className="text-xs text-gray-500">
                  {alertsSummary.inStockCount} items in good condition
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleViewInventory}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm transition-all duration-200"
            >
              <ArchiveBoxIcon className="h-4 w-4 mr-2" />
              View Inventory Details
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                All Stock Levels Good
              </h4>
              <p className="text-sm text-gray-600">
                {alertsSummary.inStockCount > 0
                  ? `${alertsSummary.inStockCount} items properly stocked`
                  : 'No inventory items found'
                }
              </p>
            </div>

            <button
              onClick={handleViewInventory}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <ArchiveBoxIcon className="h-4 w-4 mr-2" />
              View Inventory
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryAlertsWidget;
