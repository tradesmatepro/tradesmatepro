import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';

const InventoryDiagnostic = ({ onClose }) => {
  const { user } = useUser();
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.company_id) {
      loadDiagnostic();
    }
  }, [user?.company_id]);

  const loadDiagnostic = async () => {
    try {
      setLoading(true);
      const info = await inventoryService.getDiagnosticInfo(user.company_id);
      setDiagnostic(info);
    } catch (error) {
      console.error('Error loading diagnostic info:', error);
      setDiagnostic({
        error: error.message,
        recommendations: ['Unable to perform diagnostic check']
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === true) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else if (status === false) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    } else {
      return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    if (status === true) return 'Available';
    if (status === false) return 'Not Available';
    return 'Unknown';
  };

  const getStatusColor = (status) => {
    if (status === true) return 'text-green-700 bg-green-50 border-green-200';
    if (status === false) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Running diagnostic...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Inventory System Diagnostic</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {diagnostic?.error ? (
            <div className="text-red-600 mb-4">
              <p className="font-medium">Diagnostic Error:</p>
              <p className="text-sm">{diagnostic.error}</p>
            </div>
          ) : (
            <>
              {/* Database Views Status */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Database Views</h4>
                <div className="space-y-2">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(diagnostic?.views?.inventory_stock_status_named_v)}`}>
                    <div className="flex items-center">
                      {getStatusIcon(diagnostic?.views?.inventory_stock_status_named_v)}
                      <span className="ml-2 text-sm font-medium">inventory_stock_status_named_v</span>
                    </div>
                    <span className="text-sm">{getStatusText(diagnostic?.views?.inventory_stock_status_named_v)}</span>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(diagnostic?.views?.inventory_item_summary)}`}>
                    <div className="flex items-center">
                      {getStatusIcon(diagnostic?.views?.inventory_item_summary)}
                      <span className="ml-2 text-sm font-medium">inventory_item_summary</span>
                    </div>
                    <span className="text-sm">{getStatusText(diagnostic?.views?.inventory_item_summary)}</span>
                  </div>
                </div>
              </div>

              {/* Database Tables Status */}
              {diagnostic?.tables && !diagnostic.tables.error && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Database Tables</h4>
                  <div className="space-y-2">
                    {Object.entries(diagnostic.tables).map(([table, status]) => (
                      <div key={table} className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(status)}`}>
                        <div className="flex items-center">
                          {getStatusIcon(status)}
                          <span className="ml-2 text-sm font-medium">{table}</span>
                        </div>
                        <span className="text-sm">{getStatusText(status)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {diagnostic?.recommendations && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {diagnostic.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-blue-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={loadDiagnostic}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh Diagnostic
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDiagnostic;
