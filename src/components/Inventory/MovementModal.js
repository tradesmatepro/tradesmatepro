import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';

const MovementModal = ({ onClose, onSave, items, locations }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    item_id: '',
    location_id: '',
    movement_type: 'PURCHASE',
    quantity: '',
    unit_cost: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const movementTypes = [
    { value: 'PURCHASE', label: 'Purchase', description: 'Items purchased/received' },
    { value: 'USAGE', label: 'Usage', description: 'Items used on jobs' },
    { value: 'TRANSFER', label: 'Transfer', description: 'Items moved between locations' },
    { value: 'RETURN', label: 'Return', description: 'Items returned to inventory' },
    { value: 'ADJUSTMENT', label: 'Adjustment', description: 'Inventory count adjustments' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.item_id) {
      newErrors.item_id = 'Item is required';
    }

    if (!formData.location_id) {
      newErrors.location_id = 'Location is required';
    }

    if (!formData.movement_type) {
      newErrors.movement_type = 'Movement type is required';
    }

    if (!formData.quantity || isNaN(parseFloat(formData.quantity))) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (formData.unit_cost && isNaN(parseFloat(formData.unit_cost))) {
      newErrors.unit_cost = 'Unit cost must be a valid number';
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
      const movementData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
        notes: formData.notes.trim() || null
      };

      await inventoryService.createMovement(user.company_id, movementData, user.id);
      onSave();
    } catch (error) {
      console.error('Error saving movement:', error);
      alert('Failed to save movement');
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Record Inventory Movement
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item *
              </label>
              <select
                name="item_id"
                value={formData.item_id}
                onChange={handleChange}
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.item_id 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                }`}
              >
                <option value="">Select an item</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.sku && `(${item.sku})`}
                  </option>
                ))}
              </select>
              {errors.item_id && (
                <p className="mt-1 text-sm text-red-600">{errors.item_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <select
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.location_id 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                }`}
              >
                <option value="">Select a location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              {errors.location_id && (
                <p className="mt-1 text-sm text-red-600">{errors.location_id}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Movement Type *
            </label>
            <select
              name="movement_type"
              value={formData.movement_type}
              onChange={handleChange}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.movement_type 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
            >
              {movementTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
            {errors.movement_type && (
              <p className="mt-1 text-sm text-red-600">{errors.movement_type}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                step="0.01"
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.quantity 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                }`}
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost
              </label>
              <input
                type="number"
                name="unit_cost"
                value={formData.unit_cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.unit_cost 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                }`}
                placeholder="0.00"
              />
              {errors.unit_cost && (
                <p className="mt-1 text-sm text-red-600">{errors.unit_cost}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Optional notes about this movement"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Record Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovementModal;
