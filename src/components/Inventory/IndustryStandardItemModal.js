import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  QrCodeIcon,
  TagIcon,
  CubeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import BarcodeScannerModal from './BarcodeScannerModal';

const IndustryStandardItemModal = ({ isOpen, onClose, onSave, item = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    sku: '',
    description: '',
    category: '',
    unit_of_measure: 'each',
    
    // Pricing
    cost: '',
    sell_price: '',
    
    // Stock Management
    reorder_point: '',
    reorder_quantity: '',
    
    // Industry Standard Fields
    barcode: '',
    qr_code: '',
    upc_code: '',
    manufacturer_part_number: '',
    brand: '',
    model: '',
    
    // Physical Properties
    weight: '',
    dimensions: '',
    
    // Tracking Options
    requires_serial_tracking: false,
    requires_batch_tracking: false,
    is_serialized: false,
    is_consumable: true,
    
    // Advanced Properties
    shelf_life_days: '',
    storage_requirements: '',
    hazmat_class: '',
    abc_classification: '',
    supplier_lead_time_days: '',
    warranty_months: '',
    
    // Media
    image_url: '',
    notes: ''
  });

  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scanTarget, setScanTarget] = useState(''); // Which field to populate with scan result
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        description: item.description || '',
        category: item.category || '',
        unit_of_measure: item.unit_of_measure || 'each',
        cost: item.cost || '',
        sell_price: item.sell_price || '',
        reorder_point: item.reorder_point || '',
        reorder_quantity: item.reorder_quantity || '',
        barcode: item.barcode || '',
        qr_code: item.qr_code || '',
        upc_code: item.upc_code || '',
        manufacturer_part_number: item.manufacturer_part_number || '',
        brand: item.brand || '',
        model: item.model || '',
        weight: item.weight || '',
        dimensions: item.dimensions || '',
        requires_serial_tracking: item.requires_serial_tracking || false,
        requires_batch_tracking: item.requires_batch_tracking || false,
        is_serialized: item.is_serialized || false,
        is_consumable: item.is_consumable !== false, // Default to true
        shelf_life_days: item.shelf_life_days || '',
        storage_requirements: item.storage_requirements || '',
        hazmat_class: item.hazmat_class || '',
        abc_classification: item.abc_classification || '',
        supplier_lead_time_days: item.supplier_lead_time_days || '',
        warranty_months: item.warranty_months || '',
        image_url: item.image_url || '',
        notes: item.notes || ''
      });
    }
  }, [item, mode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleScanClick = (targetField) => {
    setScanTarget(targetField);
    setShowBarcodeScanner(true);
  };

  const handleScanResult = (result) => {
    if (scanTarget && result.value) {
      handleInputChange(scanTarget, result.value);
    }
    setShowBarcodeScanner(false);
    setScanTarget('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }
    
    if (formData.cost && isNaN(parseFloat(formData.cost))) {
      newErrors.cost = 'Cost must be a valid number';
    }
    
    if (formData.sell_price && isNaN(parseFloat(formData.sell_price))) {
      newErrors.sell_price = 'Sell price must be a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Convert string numbers to actual numbers
    const processedData = {
      ...formData,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      sell_price: formData.sell_price ? parseFloat(formData.sell_price) : null,
      reorder_point: formData.reorder_point ? parseInt(formData.reorder_point) : null,
      reorder_quantity: formData.reorder_quantity ? parseInt(formData.reorder_quantity) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      shelf_life_days: formData.shelf_life_days ? parseInt(formData.shelf_life_days) : null,
      supplier_lead_time_days: formData.supplier_lead_time_days ? parseInt(formData.supplier_lead_time_days) : null,
      warranty_months: formData.warranty_months ? parseInt(formData.warranty_months) : null
    };
    
    onSave(processedData);
  };

  if (!isOpen) return null;

  const ScanButton = ({ targetField, label }) => (
    <button
      type="button"
      onClick={() => handleScanClick(targetField)}
      className="ml-2 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
      title={`Scan ${label}`}
    >
      <QrCodeIcon className="h-4 w-4" />
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-40">
        <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <CubeIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {mode === 'edit' ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter item name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.sku ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter SKU"
                    />
                    <ScanButton targetField="sku" label="SKU" />
                  </div>
                  {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter item description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Electrical, Plumbing, HVAC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit of Measure
                  </label>
                  <select
                    value={formData.unit_of_measure}
                    onChange={(e) => handleInputChange('unit_of_measure', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="each">Each</option>
                    <option value="box">Box</option>
                    <option value="case">Case</option>
                    <option value="ft">Feet</option>
                    <option value="lb">Pounds</option>
                    <option value="gal">Gallons</option>
                    <option value="roll">Roll</option>
                    <option value="pkg">Package</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Identification Codes */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                Identification Codes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Standard barcode"
                    />
                    <ScanButton targetField="barcode" label="Barcode" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    QR Code
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formData.qr_code}
                      onChange={(e) => handleInputChange('qr_code', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="QR code data"
                    />
                    <ScanButton targetField="qr_code" label="QR Code" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPC Code
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formData.upc_code}
                      onChange={(e) => handleInputChange('upc_code', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Universal Product Code"
                    />
                    <ScanButton targetField="upc_code" label="UPC" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer Part Number
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formData.manufacturer_part_number}
                      onChange={(e) => handleInputChange('manufacturer_part_number', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MPN"
                    />
                    <ScanButton targetField="manufacturer_part_number" label="MPN" />
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    Advanced Features Coming Soon
                  </h4>
                  <p className="text-xs text-yellow-700">
                    Serial number tracking, batch/lot management, cycle counting, wireless scanner integration, and mobile app support are in development.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {mode === 'edit' ? 'Update Item' : 'Create Item'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScanResult={handleScanResult}
        scanMode="lookup"
      />
    </>
  );
};

export default IndustryStandardItemModal;
