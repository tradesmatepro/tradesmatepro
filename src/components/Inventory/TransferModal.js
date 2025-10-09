import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';

const TransferModal = ({ item, fromLocation, onClose, onSave }) => {
  const { user } = useUser();
  const [locations, setLocations] = useState([]);
  const [stockData, setStockData] = useState({});
  const [formData, setFormData] = useState({
    fromLocationId: '',
    toLocationId: '',
    quantity: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item && user?.company_id) {
      loadData();
    }
  }, [item, fromLocation, user?.company_id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [locationsData, stockArray] = await Promise.all([
        inventoryService.getLocations(user.company_id),
        inventoryService.getStock(user.company_id, { itemId: item.id })
      ]);

      setLocations(locationsData);

      // Convert stock data to map by location
      const stockMap = {};
      stockArray.forEach(stock => {
        stockMap[stock.location_id] = stock.quantity;
      });
      setStockData(stockMap);

      // Auto-select the current location as "from" if provided and has stock
      if (fromLocation && stockMap[fromLocation.id] > 0) {
        setFormData(prev => ({
          ...prev,
          fromLocationId: fromLocation.id
        }));
      } else {
        // Fallback to default location if current location not provided or has no stock
        const defaultLocation = locationsData.find(loc => loc.is_default);
        if (defaultLocation && stockMap[defaultLocation.id] > 0) {
          setFormData(prev => ({
            ...prev,
            fromLocationId: defaultLocation.id
          }));
        }
      }
    } catch (error) {
      console.error('Error loading transfer data:', error);
      alert('Failed to load transfer data');
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fromLocationId) {
      newErrors.fromLocationId = 'Please select a source location';
    }

    if (!formData.toLocationId) {
      newErrors.toLocationId = 'Please select a destination location';
    }

    if (formData.fromLocationId === formData.toLocationId) {
      newErrors.toLocationId = 'Destination must be different from source';
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }

    const availableQuantity = stockData[formData.fromLocationId] || 0;
    if (formData.quantity > availableQuantity) {
      newErrors.quantity = `Cannot transfer more than available (${availableQuantity} ${item.unit_of_measure || 'each'})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create two movements: one outgoing from source, one incoming to destination
      const fromLocationName = getLocationName(formData.fromLocationId);
      const toLocationName = getLocationName(formData.toLocationId);
      const transferNote = formData.notes.trim() || `Transfer: ${item.name} from ${fromLocationName} to ${toLocationName}`;

      // Movement 1: Remove from source location
      const outgoingMovement = {
        item_id: item.id,
        location_id: formData.fromLocationId,
        movement_type: 'USAGE',
        quantity: parseFloat(formData.quantity),
        notes: `${transferNote} (Outgoing)`
      };

      // Movement 2: Add to destination location
      const incomingMovement = {
        item_id: item.id,
        location_id: formData.toLocationId,
        movement_type: 'RETURN',
        quantity: parseFloat(formData.quantity),
        notes: `${transferNote} (Incoming)`
      };

      console.log('Creating transfer movements:', { outgoingMovement, incomingMovement });

      // Create both movements
      await Promise.all([
        inventoryService.createMovement(user.company_id, outgoingMovement, user.id),
        inventoryService.createMovement(user.company_id, incomingMovement, user.id)
      ]);

      onSave();
    } catch (error) {
      console.error('Error creating transfer:', error);
      alert('Failed to create transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : 'Unknown';
  };

  const getAvailableQuantity = (locationId) => {
    return stockData[locationId] || 0;
  };

  const getAvailableLocations = (excludeLocationId = null) => {
    return locations.filter(loc => loc.id !== excludeLocationId);
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ArrowsRightLeftIcon className="h-6 w-6 text-primary-600 mr-2" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Transfer Stock</h3>
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
        ) : (
          <form onSubmit={handleSubmit}>
            {/* From Location */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Location *
              </label>
              <select
                name="fromLocationId"
                value={formData.fromLocationId}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.fromLocationId
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                }`}
              >
                <option value="">Select source location</option>
                {locations.map(location => {
                  const available = getAvailableQuantity(location.id);
                  return (
                    <option key={location.id} value={location.id} disabled={available <= 0}>
                      {location.name} ({available} {item.unit_of_measure || 'each'} available)
                    </option>
                  );
                })}
              </select>
              {errors.fromLocationId && (
                <p className="mt-1 text-sm text-red-600">{errors.fromLocationId}</p>
              )}
            </div>

            {/* To Location */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Location *
              </label>
              <select
                name="toLocationId"
                value={formData.toLocationId}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.toLocationId
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                }`}
              >
                <option value="">Select destination location</option>
                {getAvailableLocations(formData.fromLocationId).map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              {errors.toLocationId && (
                <p className="mt-1 text-sm text-red-600">{errors.toLocationId}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity to Transfer *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.quantity
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                }`}
                placeholder={`Enter quantity (${item.unit_of_measure || 'each'})`}
              />
              {formData.fromLocationId && (
                <p className="mt-1 text-sm text-gray-500">
                  Available: {getAvailableQuantity(formData.fromLocationId)} {item.unit_of_measure || 'each'}
                </p>
              )}
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add any notes about this transfer..."
              />
            </div>

            {/* Transfer Summary */}
            {formData.fromLocationId && formData.toLocationId && formData.quantity && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <ArrowsRightLeftIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Transfer Summary</span>
                </div>
                <p className="text-sm text-blue-700">
                  Moving <strong>{formData.quantity} {item.unit_of_measure || 'each'}</strong> of <strong>{item.name}</strong>
                  <br />
                  From: <strong>{getLocationName(formData.fromLocationId)}</strong>
                  <br />
                  To: <strong>{getLocationName(formData.toLocationId)}</strong>
                </p>
              </div>
            )}

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
                disabled={loading || !formData.fromLocationId || !formData.toLocationId || !formData.quantity}
              >
                {loading ? 'Transferring...' : 'Transfer Stock'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TransferModal;
