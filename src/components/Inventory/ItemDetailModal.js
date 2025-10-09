import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  InformationCircleIcon,
  ClipboardDocumentListIcon,
  ArrowsRightLeftIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';
import { formatCurrency as fmtCurrency } from '../../utils/formatters';
import { StockStatusTooltip } from '../Common/Tooltip';
import StockAdjustmentModal from './StockAdjustmentModal';
import TransferModal from './TransferModal';
import ItemAllocationModal from './ItemAllocationModal';

const ItemDetailModal = ({ item, onClose, onRefresh }) => {
  const { user } = useUser();
  const [locationDetails, setLocationDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sub-modal states
  const [showStockModal, setShowStockModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (item && user?.company_id) {
      loadLocationDetails();
    }
  }, [item, user?.company_id]);

  const loadLocationDetails = async () => {
    try {
      setLoading(true);

      // Use service to get per-location breakdown via view (with graceful fallback)
      const rows = await inventoryService.getItemLocationDetails(user.company_id, item.item_id);

      // Transform to the format expected by the modal
      const locationData = rows.map(row => ({
        location_id: row.location_id,
        on_hand: row.on_hand ?? row.available ?? 0,
        reserved: row.reserved ?? 0,
        available: row.available ?? row.on_hand ?? 0,
        inventory_locations: {
          id: row.location_id,
          name: row.location_name || 'Unknown Location',
          type: row.location_type || 'Location'
        },
        inventory_items: {
          id: row.item_id,
          name: row.item_name || item.item_name,
          sku: row.sku || item.sku,
          cost: item.cost,
          unit_of_measure: item.unit_of_measure
        }
      }));

      setLocationDetails(locationData);
    } catch (error) {
      console.error('Error loading location details:', error);
      // More graceful error handling - don't show alert for expected fallbacks
      // The service already handles fallbacks internally, so if we get here it's a real error
      if (error.message && !error.message.includes('view not available')) {
        alert('Failed to load location details: ' + error.message);
      } else {
        // For view availability issues, just log and continue with empty data
        console.warn('Location details not available, continuing with empty data');
        setLocationDetails([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = (location) => {
    setSelectedLocation(location);
    setShowStockModal(true);
  };

  const handleTransfer = (location) => {
    setSelectedLocation(location);
    setShowTransferModal(true);
  };

  const handleAllocateToJob = (location) => {
    setSelectedLocation(location);
    setShowAllocationModal(true);
  };

  const getStockStatusBadge = (available, reorderPoint = 5) => {
    if (available === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-300', icon: '🚫' };
    } else if (available <= reorderPoint) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⚠️' };
    } else {
      return { label: 'Available', color: 'bg-green-100 text-green-800 border-green-300', icon: '✅' };
    }
  };

  const formatCurrency = (amount) => fmtCurrency(amount);

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-lg bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <InformationCircleIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {item.item_name}
              </h3>
              {item.sku && (
                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Item Summary */}
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-700">{item.total_on_hand}</div>
              <div className="text-sm text-primary-600">Total On Hand</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{item.total_reserved}</div>
              <div className="text-sm text-orange-600">Total Reserved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{item.total_available}</div>
              <div className="text-sm text-green-600">Total Available</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700">{formatCurrency(item.cost)}</div>
              <div className="text-sm text-gray-600">Unit Cost</div>
            </div>
          </div>
        </div>

        {/* Location Breakdown */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Stock by Location</h4>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <div className="text-gray-500">Loading inventory...</div>
              </div>
            </div>
          ) : locationDetails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No stock found for this item
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <StockStatusTooltip type="onHand">
                        On Hand
                      </StockStatusTooltip>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <StockStatusTooltip type="reserved">
                        Reserved
                      </StockStatusTooltip>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <StockStatusTooltip type="available">
                        Available
                      </StockStatusTooltip>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locationDetails.map((location, index) => {
                    const statusBadge = getStockStatusBadge(location.available, item.reorder_point);

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {location.inventory_locations?.name || 'Unknown Location'}
                            </div>
                            <div className="text-xs text-gray-500 ml-2">
                              ({location.inventory_locations?.type || 'Unknown'})
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-semibold text-gray-900">
                            {location.on_hand || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-semibold text-orange-600">
                            {location.reserved || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-semibold text-green-600">
                            {location.available || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                            <span className="mr-1">{statusBadge.icon}</span>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleStockAdjustment(location)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              title="Adjust Stock"
                            >
                              <WrenchScrewdriverIcon className="h-3 w-3 mr-1" />
                              Adjust
                            </button>
                            <button
                              onClick={() => handleTransfer(location)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              title="Transfer Stock"
                            >
                              <ArrowsRightLeftIcon className="h-3 w-3 mr-1" />
                              Transfer
                            </button>
                            <button
                              onClick={() => handleAllocateToJob(location)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                              title="Allocate to Job"
                            >
                              <ClipboardDocumentListIcon className="h-3 w-3 mr-1" />
                              Allocate
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Close
          </button>
        </div>

        {/* Sub-modals */}
        {showStockModal && selectedLocation && (
          <StockAdjustmentModal
            item={selectedLocation.inventory_items}
            location={selectedLocation.inventory_locations}
            onClose={() => {
              setShowStockModal(false);
              setSelectedLocation(null);
            }}
            onSave={() => {
              setShowStockModal(false);
              setSelectedLocation(null);
              loadLocationDetails();
              onRefresh?.();
            }}
          />
        )}

        {showTransferModal && selectedLocation && (
          <TransferModal
            item={selectedLocation.inventory_items}
            fromLocation={selectedLocation.inventory_locations}
            onClose={() => {
              setShowTransferModal(false);
              setSelectedLocation(null);
            }}
            onSave={() => {
              setShowTransferModal(false);
              setSelectedLocation(null);
              loadLocationDetails();
              onRefresh?.();
            }}
          />
        )}

        {showAllocationModal && selectedLocation && (
          <ItemAllocationModal
            item={selectedLocation.inventory_items}
            location={selectedLocation.inventory_locations}
            availableQuantity={selectedLocation.available}
            onClose={() => {
              setShowAllocationModal(false);
              setSelectedLocation(null);
            }}
            onSave={() => {
              setShowAllocationModal(false);
              setSelectedLocation(null);
              loadLocationDetails();
              onRefresh?.();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ItemDetailModal;
