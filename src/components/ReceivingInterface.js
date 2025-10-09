import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { PurchaseOrdersService } from '../services/PurchaseOrdersService';
import {
  CheckCircleIcon,
  XMarkIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ReceivingInterface = ({ poId, isOpen, onClose, onReceived }) => {
  const { user } = useUser();
  const [po, setPo] = useState(null);
  const [items, setItems] = useState([]);
  const [receivingData, setReceivingData] = useState({});
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

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
          received_quantity: item.received_quantity || 0,
          expected_quantity: item.quantity || 0,
          damage_notes: '',
          quality_check: 'GOOD' // GOOD, DAMAGED, REJECTED
        };
      });
      setReceivingData(initialReceiving);
    } catch (error) {
      console.error('Error loading PO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReceivingData = (itemId, field, value) => {
    setReceivingData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleReceiveAll = () => {
    const updated = { ...receivingData };
    items.forEach(item => {
      const remaining = item.quantity - (item.received_quantity || 0);
      if (remaining > 0) {
        updated[item.id] = {
          ...updated[item.id],
          received_quantity: item.quantity
        };
      }
    });
    setReceivingData(updated);
  };

  const handleSubmitReceiving = async () => {
    try {
      setLoading(true);
      
      // Prepare receiving items
      const receivedItems = Object.entries(receivingData)
        .filter(([itemId, data]) => data.received_quantity > 0)
        .map(([itemId, data]) => ({
          po_item_id: itemId,
          received_quantity: data.received_quantity
        }));

      if (receivedItems.length === 0) {
        alert('Please specify quantities to receive');
        return;
      }

      // Process receiving
      const newStatus = await PurchaseOrdersService.receiveItems(user.company_id, poId, receivedItems);
      
      // Log receiving activity
      await PurchaseOrdersService.setStatus(user.company_id, poId, newStatus, 
        `Items received: ${receivedItems.length} line items. ${notes ? `Notes: ${notes}` : ''}`);

      // Inventory integration placeholder
      await handleInventoryIntegration(receivedItems);

      onReceived?.(newStatus);
      onClose();
      
    } catch (error) {
      console.error('Error processing receiving:', error);
      alert('Error processing receiving: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryIntegration = async (receivedItems) => {
    // Placeholder for inventory integration
    console.log('🔄 Inventory Integration - Coming Soon');
    console.log('Would create inventory receipts for:', receivedItems);
    
    // In full implementation, this would:
    // 1. Create inventory_receipts record
    // 2. Update inventory_items quantities
    // 3. Create inventory_movements for tracking
    // 4. Update item costs and valuations
    // 5. Trigger reorder point checks
  };

  const getReceivingStatus = (item) => {
    const received = receivingData[item.id]?.received_quantity || item.received_quantity || 0;
    const expected = item.quantity || 0;
    
    if (received === 0) return { status: 'pending', color: 'text-gray-500', bg: 'bg-gray-100' };
    if (received < expected) return { status: 'partial', color: 'text-yellow-800', bg: 'bg-yellow-100' };
    if (received >= expected) return { status: 'complete', color: 'text-green-800', bg: 'bg-green-100' };
    return { status: 'pending', color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TruckIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Receive Items - PO #{po?.po_number}
                </h3>
              </div>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* PO Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Purchase Order Summary</h4>
                      <p className="text-sm text-blue-700">Vendor: {po?.vendor_name}</p>
                      <p className="text-sm text-blue-700">Expected: {po?.expected_date ? new Date(po.expected_date).toLocaleDateString() : 'Not specified'}</p>
                    </div>
                    <button
                      onClick={handleReceiveAll}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Receive All
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previously Received</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receiving Now</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => {
                        const status = getReceivingStatus(item);
                        const remaining = (item.quantity || 0) - (item.received_quantity || 0);
                        
                        return (
                          <tr key={item.id}>
                            <td className="px-4 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                                {item.item_sku && (
                                  <div className="text-sm text-gray-500">SKU: {item.item_sku}</div>
                                )}
                                {item.description && (
                                  <div className="text-sm text-gray-500">{item.description}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {Number(item.quantity || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {Number(item.received_quantity || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-4">
                              <input
                                type="number"
                                min="0"
                                max={remaining}
                                step="0.01"
                                value={receivingData[item.id]?.received_quantity || 0}
                                onChange={(e) => updateReceivingData(item.id, 'received_quantity', Number(e.target.value))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                Max: {remaining.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                {status.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <select
                                value={receivingData[item.id]?.quality_check || 'GOOD'}
                                onChange={(e) => updateReceivingData(item.id, 'quality_check', e.target.value)}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="GOOD">Good</option>
                                <option value="DAMAGED">Damaged</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receiving Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes about the delivery, condition, or discrepancies..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Integration Status */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Inventory Integration</p>
                      <p className="text-yellow-700">Automatic inventory updates - Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmitReceiving}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : 'Complete Receiving'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceivingInterface;
