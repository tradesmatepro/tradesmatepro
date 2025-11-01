import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  WrenchScrewdriverIcon,
  QrCodeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

/**
 * EquipmentModal Component
 * Add/Edit customer equipment with serial numbers and warranty info
 */
const EquipmentModal = ({ isOpen, onClose, onSave, equipment, employees, customerId }) => {
  const [formData, setFormData] = useState({
    equipment_type: '',
    manufacturer: '',
    model_number: '',
    serial_number: '',
    install_date: '',
    installed_by: '',
    warranty_start_date: '',
    warranty_end_date: '',
    warranty_provider: '',
    location_description: '',
    status: 'active',
    notes: '',
    photos: [],
    documents: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (equipment) {
      setFormData({
        equipment_type: equipment.equipment_type || '',
        manufacturer: equipment.manufacturer || '',
        model_number: equipment.model_number || '',
        serial_number: equipment.serial_number || '',
        install_date: equipment.install_date || '',
        installed_by: equipment.installed_by || '',
        warranty_start_date: equipment.warranty_start_date || '',
        warranty_end_date: equipment.warranty_end_date || '',
        warranty_provider: equipment.warranty_provider || '',
        location_description: equipment.location_description || '',
        status: equipment.status || 'active',
        notes: equipment.notes || '',
        photos: equipment.photos || [],
        documents: equipment.documents || []
      });
    } else {
      // Reset form for new equipment
      setFormData({
        equipment_type: '',
        manufacturer: '',
        model_number: '',
        serial_number: '',
        install_date: new Date().toISOString().split('T')[0], // Default to today
        installed_by: '',
        warranty_start_date: '',
        warranty_end_date: '',
        warranty_provider: '',
        location_description: '',
        status: 'active',
        notes: '',
        photos: [],
        documents: []
      });
    }
    setErrors({});
  }, [equipment, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!formData.equipment_type?.trim()) {
      newErrors.equipment_type = 'Equipment type is required';
    }

    if (!formData.manufacturer?.trim()) {
      newErrors.manufacturer = 'Manufacturer is required';
    }

    if (formData.warranty_end_date && formData.warranty_start_date) {
      if (new Date(formData.warranty_end_date) < new Date(formData.warranty_start_date)) {
        newErrors.warranty_end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        customer_id: customerId,
        id: equipment?.id
      });
      onClose();
    } catch (error) {
      console.error('Error saving equipment:', error);
      setErrors({ submit: 'Failed to save equipment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleScanBarcode = () => {
    // TODO: Integrate barcode scanner
    alert('Barcode scanner integration coming soon!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <WrenchScrewdriverIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {equipment ? 'Edit Equipment' : 'Add Equipment'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {errors.submit}
            </div>
          )}

          <div className="space-y-6">
            {/* Equipment Details Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Equipment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Type / Description *
                  </label>
                  <input
                    type="text"
                    value={formData.equipment_type}
                    onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.equipment_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., HVAC Air Conditioner, Water Heater, Furnace, etc."
                  />
                  {errors.equipment_type && (
                    <p className="text-xs text-red-500 mt-1">{errors.equipment_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.manufacturer ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Carrier, Rheem, Kohler"
                  />
                  {errors.manufacturer && (
                    <p className="text-xs text-red-500 mt-1">{errors.manufacturer}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Number
                  </label>
                  <input
                    type="text"
                    value={formData.model_number}
                    onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 24ACC636A003"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.serial_number}
                      onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter or scan serial number"
                    />
                    <button
                      type="button"
                      onClick={handleScanBarcode}
                      className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-2"
                    >
                      <QrCodeIcon className="w-5 h-5" />
                      Scan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Installation Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Installation Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Install Date
                  </label>
                  <input
                    type="date"
                    value={formData.install_date}
                    onChange={(e) => setFormData({ ...formData, install_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Installed By
                  </label>
                  <select
                    value={formData.installed_by}
                    onChange={(e) => setFormData({ ...formData, installed_by: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select technician</option>
                    {employees?.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Description
                  </label>
                  <input
                    type="text"
                    value={formData.location_description}
                    onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Basement, Roof, Unit 2A"
                  />
                </div>
              </div>
            </div>

            {/* Warranty Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Warranty Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.warranty_start_date}
                    onChange={(e) => setFormData({ ...formData, warranty_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty End Date
                  </label>
                  <input
                    type="date"
                    value={formData.warranty_end_date}
                    onChange={(e) => setFormData({ ...formData, warranty_end_date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.warranty_end_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.warranty_end_date && (
                    <p className="text-xs text-red-500 mt-1">{errors.warranty_end_date}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty Provider
                  </label>
                  <input
                    type="text"
                    value={formData.warranty_provider}
                    onChange={(e) => setFormData({ ...formData, warranty_provider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Manufacturer, Extended Warranty Co."
                  />
                </div>
              </div>
            </div>

            {/* Status & Notes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Additional Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="retired">Retired</option>
                    <option value="replaced">Replaced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Additional notes about this equipment..."
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : equipment ? 'Update Equipment' : 'Add Equipment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentModal;

