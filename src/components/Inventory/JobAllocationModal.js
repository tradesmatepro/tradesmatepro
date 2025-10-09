import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';
import { supaFetch } from '../../utils/supabaseClient';

const JobAllocationModal = ({ workOrder, onClose, onSave }) => {
  const { user } = useUser();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [stockData, setStockData] = useState({});
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (workOrder && user?.company_id) {
      loadData();
    }
  }, [workOrder, user?.company_id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load inventory items
      const itemsData = await inventoryService.getItems(user.company_id);
      setInventoryItems(itemsData);

      // Load stock data
      const stockResponse = await inventoryService.getStock(user.company_id);
      const stockMap = {};
      stockResponse.forEach(stock => {
        if (!stockMap[stock.item_id]) {
          stockMap[stock.item_id] = { total: 0, locations: {} };
        }
        stockMap[stock.item_id].total += stock.quantity;
        stockMap[stock.item_id].locations[stock.location_id] = {
          quantity: stock.quantity,
          location_name: stock.inventory_locations?.name || 'Unknown Location'
        };
      });
      setStockData(stockMap);

      // Load locations
      const locationsData = await inventoryService.getLocations(user.company_id);
      setLocations(locationsData);

      // Set default location
      const defaultLocation = locationsData.find(loc => loc.is_default);
      if (defaultLocation) {
        setSelectedLocation(defaultLocation.id);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocationChange = (itemId, quantity) => {
    setAllocations(prev => ({
      ...prev,
      [itemId]: Math.max(0, parseFloat(quantity) || 0)
    }));
  };

  const getAvailableQuantity = (itemId) => {
    const stock = stockData[itemId];
    if (!stock || !selectedLocation) return 0;
    return stock.locations[selectedLocation]?.quantity || 0;
  };

  const getReservedQuantity = async (itemId) => {
    // TODO: Calculate reserved quantity from existing allocations
    // For now, return 0
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      alert('Please select a location');
      return;
    }

    const allocationsToCreate = Object.entries(allocations).filter(([itemId, quantity]) => quantity > 0);

    if (allocationsToCreate.length === 0) {
      alert('Please allocate at least one item');
      return;
    }

    // Validate quantities
    for (const [itemId, quantity] of allocationsToCreate) {
      const available = getAvailableQuantity(itemId);
      if (quantity > available) {
        const item = inventoryItems.find(i => i.id === itemId);
        alert(`Cannot allocate ${quantity} of ${item?.name}. Only ${available} available.`);
        return;
      }
    }

    try {
      setSaving(true);

      // Create allocation movements
      for (const [itemId, quantity] of allocationsToCreate) {
        const item = inventoryItems.find(i => i.id === itemId);
        const movementData = {
          item_id: itemId,
          location_id: selectedLocation,
          related_work_order_id: workOrder.id,
          movement_type: 'ALLOCATION',
          quantity: quantity,
          unit_cost: item?.cost || 0,
          notes: `Allocated to job: ${workOrder.title || workOrder.job_number || 'Untitled Job'}`
        };

        await inventoryService.createMovement(user.company_id, movementData, user.id);
      }

      onSave();
    } catch (error) {
      console.error('Error creating allocations:', error);
      alert('Failed to allocate items to job');
    } finally {
      setSaving(false);
    }
  };

  if (!workOrder) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Allocate Inventory to Job
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Job Info */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-gray-900">{workOrder.title}</div>
          {workOrder.job_number && (
            <div className="text-xs text-gray-500">Job #: {workOrder.job_number}</div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            Stage: {workOrder.stage} • Status: {workOrder.job_status}
          </div>
        </div>

        {/* Location Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allocate From Location *
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Choose location...</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        {/* Inventory Items */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Select Items to Allocate</h4>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading inventory...</div>
            ) : inventoryItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No inventory items found</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {inventoryItems.map(item => {
                  const available = getAvailableQuantity(item.id);
                  const allocated = allocations[item.id] || 0;

                  return (
                    <div key={item.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.sku && (
                            <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                          )}
                          <div className="text-xs text-gray-600 mt-1">
                            Available: {available} {item.unit_of_measure || 'each'}
                            {item.cost && ` • Cost: $${item.cost}`}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max={available}
                            step="0.01"
                            value={allocated}
                            onChange={(e) => handleAllocationChange(item.id, e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-500">{item.unit_of_measure || 'each'}</span>
                        </div>
                      </div>

                      {allocated > available && (
                        <div className="mt-2 flex items-center text-red-600 text-xs">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          Cannot allocate more than available stock
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {Object.values(allocations).some(qty => qty > 0) && (
          <div className="mb-6 p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-900 mb-2">Allocation Summary</div>
            {Object.entries(allocations).filter(([_, qty]) => qty > 0).map(([itemId, quantity]) => {
              const item = inventoryItems.find(i => i.id === itemId);
              const cost = (item?.cost || 0) * quantity;
              return (
                <div key={itemId} className="flex justify-between text-xs text-green-800">
                  <span>{item?.name}: {quantity} {item?.unit_of_measure || 'each'}</span>
                  <span>${cost.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !selectedLocation || Object.values(allocations).every(qty => qty === 0)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {saving ? 'Allocating...' : 'Allocate Items'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobAllocationModal;
