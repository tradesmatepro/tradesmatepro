import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { PurchaseOrdersService } from '../services/PurchaseOrdersService';
import {
  CheckCircleIcon,
  XMarkIcon,
  TruckIcon,
  CameraIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

const MobileReceivingInterface = ({ poId, isOpen, onClose, onReceived }) => {
  const { user } = useUser();
  const [po, setPo] = useState(null);
  const [items, setItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [receivingData, setReceivingData] = useState({});
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState({});

  useEffect(() => {
    if (isOpen && poId) {
      loadPOData();
    }
  }, [isOpen, poId]);

  const loadPOData = async () => {
    try {
      setLoading(true);
      const { po: poData, items: itemsData } = await PurchaseOrdersService.getWithItems(user.company_id, poId);
      setPo(poData);
      setItems(itemsData);
      
      // Initialize receiving data
      const initialReceiving = {};
      itemsData.forEach(item => {
        initialReceiving[item.id] = {
          received_quantity: 0,
          expected_quantity: item.quantity || 0,
          damage_notes: '',
          quality_check: 'GOOD'
        };
      });
      setReceivingData(initialReceiving);
    } catch (error) {
      console.error('Error loading PO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentItem = items[currentItemIndex];
  const isLastItem = currentItemIndex === items.length - 1;
  const isFirstItem = currentItemIndex === 0;

  const handleNext = () => {
    if (!isLastItem) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstItem) {
      setCurrentItemIndex(currentItemIndex - 1);
    }
  };

  const updateCurrentItem = (field, value) => {
    if (!currentItem) return;
    
    setReceivingData(prev => ({
      ...prev,
      [currentItem.id]: {
        ...prev[currentItem.id],
        [field]: value
      }
    }));
  };

  const handlePhotoCapture = (itemId) => {
    // Placeholder for camera integration
    console.log('📸 Camera Integration - Coming Soon');
    console.log('Would capture photo for item:', itemId);
    
    // Simulate photo capture
    const photoUrl = `photo_${itemId}_${Date.now()}.jpg`;
    setPhotos(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), photoUrl]
    }));
    
    alert('Photo capture functionality - Coming Soon\n\nIn full implementation, this would:\n• Open device camera\n• Capture photos of received items\n• Attach to receiving record\n• Support barcode/QR scanning');
  };

  const handleBarcodeScanning = (itemId) => {
    // Placeholder for barcode scanning
    console.log('📱 Barcode Scanning - Coming Soon');
    console.log('Would scan barcode for item:', itemId);
    
    alert('Barcode scanning functionality - Coming Soon\n\nIn full implementation, this would:\n• Open camera for barcode scanning\n• Auto-populate item details\n• Verify against expected items\n• Support QR codes and various barcode formats');
  };

  const handleSubmitReceiving = async () => {
    try {
      setLoading(true);
      
      // Prepare receiving items
      const receivedItems = Object.entries(receivingData)
        .filter(([itemId, data]) => data.received_quantity > 0)
        .map(([itemId, data]) => ({
          po_item_id: itemId,
          received_quantity: data.received_quantity,
          photos: photos[itemId] || []
        }));

      if (receivedItems.length === 0) {
        alert('Please specify quantities to receive');
        return;
      }

      // Process receiving
      const newStatus = await PurchaseOrdersService.receiveItems(user.company_id, poId, receivedItems);
      
      onReceived?.(newStatus);
      onClose();
      
    } catch (error) {
      console.error('Error processing receiving:', error);
      alert('Error processing receiving: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TruckIcon className="h-6 w-6 mr-2" />
            <div>
              <h1 className="text-lg font-semibold">Receiving</h1>
              <p className="text-sm opacity-90">PO #{po?.po_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : currentItem ? (
        <div className="flex flex-col h-full">
          {/* Progress Indicator */}
          <div className="bg-gray-100 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Item {currentItemIndex + 1} of {items.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentItemIndex + 1) / items.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentItemIndex + 1) / items.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Item Details */}
          <div className="flex-1 p-4 space-y-6">
            <div className="bg-white border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {currentItem.item_name}
              </h2>
              {currentItem.item_sku && (
                <p className="text-sm text-gray-600 mb-2">SKU: {currentItem.item_sku}</p>
              )}
              {currentItem.description && (
                <p className="text-sm text-gray-600">{currentItem.description}</p>
              )}
            </div>

            {/* Quantity Input */}
            <div className="bg-white border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Received
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max={currentItem.quantity}
                    step="0.01"
                    value={receivingData[currentItem.id]?.received_quantity || 0}
                    onChange={(e) => updateCurrentItem('received_quantity', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-lg text-center"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Expected: {Number(currentItem.quantity || 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => updateCurrentItem('received_quantity', currentItem.quantity)}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded"
                  >
                    Full
                  </button>
                  <button
                    onClick={() => updateCurrentItem('received_quantity', 0)}
                    className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded"
                  >
                    None
                  </button>
                </div>
              </div>
            </div>

            {/* Quality Check */}
            <div className="bg-white border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['GOOD', 'DAMAGED', 'REJECTED'].map(condition => (
                  <button
                    key={condition}
                    onClick={() => updateCurrentItem('quality_check', condition)}
                    className={`py-2 px-3 rounded text-sm font-medium ${
                      receivingData[currentItem.id]?.quality_check === condition
                        ? condition === 'GOOD' ? 'bg-green-100 text-green-800 border-green-300'
                          : condition === 'DAMAGED' ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    } border`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePhotoCapture(currentItem.id)}
                  className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <CameraIcon className="h-5 w-5 mr-2" />
                  Photo
                </button>
                <button
                  onClick={() => handleBarcodeScanning(currentItem.id)}
                  className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                  Scan
                </button>
              </div>
              {photos[currentItem.id]?.length > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  {photos[currentItem.id].length} photo(s) captured
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={3}
                value={receivingData[currentItem.id]?.damage_notes || ''}
                onChange={(e) => updateCurrentItem('damage_notes', e.target.value)}
                placeholder="Any notes about condition, discrepancies, etc..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="bg-white border-t p-4 space-y-3">
            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={isFirstItem}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={isLastItem}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            {/* Complete Button */}
            <button
              onClick={handleSubmitReceiving}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Complete Receiving'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No items to receive</p>
        </div>
      )}

      {/* Coming Soon Notice */}
      <div className="absolute bottom-20 left-4 right-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <DevicePhoneMobileIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Mobile Features</p>
              <p className="text-yellow-700">Camera, barcode scanning, offline sync - Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileReceivingInterface;
