import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  MinusIcon,
  ArchiveBoxIcon 
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';

const StockAdjustmentModal = ({ item, location, onClose, onSave }) => {
  const { user } = useUser();
  const [locations, setLocations] = useState([]);
  const [currentStock, setCurrentStock] = useState({});
  const [adjustments, setAdjustments] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (item && user?.company_id) {
      loadData();
    }
  }, [item, location, user?.company_id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      let [locationsData, stockData] = await Promise.all([
        inventoryService.getLocations(user.company_id),
        inventoryService.getStock(user.company_id, { itemId: item.id })
      ]);

      console.log('Locations loaded:', locationsData);
      console.log('Stock data loaded:', stockData);

      // If no locations exist, create a default one
      if (!locationsData || locationsData.length === 0) {
        console.log('No locations found, creating default location...');
        try {
          const defaultLocationData = await inventoryService.createLocation(user.company_id, {
            name: 'Main Warehouse',
            address: '',
            is_default: true
          });

          // Handle the response - it might be an array or single object
          if (Array.isArray(defaultLocationData) && defaultLocationData.length > 0) {
            locationsData = defaultLocationData;
          } else if (defaultLocationData && defaultLocationData.id) {
            locationsData = [defaultLocationData];
          } else {
            // If creation didn't return the location, fetch locations again
            locationsData = await inventoryService.getLocations(user.company_id);
          }

          console.log('Default location created:', locationsData);
        } catch (createError) {
          console.error('Error creating default location:', createError);
          // Instead of failing, create a temporary location for this session
          locationsData = [{
            id: 'temp-default',
            name: 'Main Warehouse',
            address: '',
            is_default: true
          }];
          console.log('Using temporary default location');
        }
      }

      // Filter to specific location if provided
      const filteredLocations = location ? [location] : locationsData;
      setLocations(filteredLocations);

      // Convert stock data to map by location
      const stockMap = {};
      stockData.forEach(stock => {
        stockMap[stock.location_id] = stock.quantity;
      });
      setCurrentStock(stockMap);

      // Initialize adjustments for filtered locations
      const initialAdjustments = {};
      filteredLocations.forEach(loc => {
        initialAdjustments[loc.id] = 0;
      });
      setAdjustments(initialAdjustments);
    } catch (error) {
      console.error('Error loading stock data:', error);
      alert('Failed to load stock data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdjustmentChange = (locationId, value) => {
    setAdjustments(prev => ({
      ...prev,
      [locationId]: parseInt(value) || 0
    }));
  };

  const handleQuickAdjust = (locationId, amount) => {
    setAdjustments(prev => ({
      ...prev,
      [locationId]: (prev[locationId] || 0) + amount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('=== STOCK ADJUSTMENT SUBMIT ===');
    console.log('Current adjustments:', adjustments);
    console.log('Locations:', locations);
    console.log('Item:', item);

    // Check if any adjustments were made
    const hasAdjustments = Object.values(adjustments).some(adj => adj !== 0);
    console.log('Has adjustments:', hasAdjustments);

    if (!hasAdjustments) {
      alert('No adjustments to save');
      return;
    }

    setLoading(true);
    try {
      // Create movement records for each non-zero adjustment
      const promises = [];

      for (const [locationId, adjustment] of Object.entries(adjustments)) {
        if (adjustment !== 0) {
          let actualLocationId = locationId;

          // If using temporary location, create a real location first
          if (locationId === 'temp-default') {
            try {
              const realLocation = await inventoryService.createLocation(user.company_id, {
                name: 'Main Warehouse',
                address: '',
                is_default: true
              });
              actualLocationId = Array.isArray(realLocation) ? realLocation[0].id : realLocation.id;
            } catch (error) {
              console.error('Error creating real location:', error);
              throw new Error('Failed to create location for stock adjustment');
            }
          }

          const movementData = {
            item_id: item.id,
            location_id: actualLocationId,
            movement_type: 'ADJUSTMENT',
            quantity: adjustment, // Can be positive or negative
            notes: `Stock adjustment: ${adjustment > 0 ? '+' : ''}${adjustment} ${item.unit_of_measure || 'each'}`
          };

          promises.push(
            inventoryService.createMovement(user.company_id, movementData, user.id)
          );
        }
      }

      await Promise.all(promises);
      onSave();
    } catch (error) {
      console.error('Error saving stock adjustments:', error);
      alert('Failed to save stock adjustments');
    } finally {
      setLoading(false);
    }
  };

  const getTotalAdjustment = () => {
    return Object.values(adjustments).reduce((sum, adj) => sum + adj, 0);
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ArchiveBoxIcon className="h-6 w-6 text-primary-600 mr-2" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Adjust Stock{location ? ` - ${location.name}` : ''}
              </h3>
              <p className="text-sm text-gray-600">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {loadingData ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12">
            <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Locations Found</h3>
            <p className="text-gray-500 mb-4">
              You need to create at least one location before adjusting stock.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              {locations.map(location => {
                const currentQty = currentStock[location.id] || 0;
                const adjustment = adjustments[location.id] || 0;
                const newQty = currentQty + adjustment;
                
                return (
                  <div key={location.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{location.name}</h4>
                        <p className="text-sm text-gray-600">
                          Current: {currentQty} {item.unit_of_measure || 'each'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          New: {newQty} {item.unit_of_measure || 'each'}
                        </div>
                        {adjustment !== 0 && (
                          <div className={`text-sm font-medium ${
                            adjustment > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {adjustment > 0 ? '+' : ''}{adjustment}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(location.id, -10)}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        title="Remove 10"
                      >
                        <MinusIcon className="h-4 w-4" />
                        10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(location.id, -1)}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        title="Remove 1"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      
                      <input
                        type="number"
                        value={adjustment}
                        onChange={(e) => handleAdjustmentChange(location.id, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-center"
                        placeholder="0"
                      />
                      
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(location.id, 1)}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        title="Add 1"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(location.id, 10)}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        title="Add 10"
                      >
                        <PlusIcon className="h-4 w-4" />
                        10
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Adjustment:</span>
                <span className={`text-lg font-semibold ${
                  getTotalAdjustment() > 0 ? 'text-green-600' : 
                  getTotalAdjustment() < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {getTotalAdjustment() > 0 ? '+' : ''}{getTotalAdjustment()} {item.unit_of_measure || 'each'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                disabled={loading || getTotalAdjustment() === 0}
              >
                {loading ? 'Saving...' : 'Save Adjustments'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
