import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  ArrowsRightLeftIcon,
  PencilIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';
import inventoryAlertsService from '../../services/InventoryAlertsService';

const LocationInventoryModal = ({ location, onClose, onStockUpdate, onTransfer, onAllocateToJob }) => {
  const { user } = useUser();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (location && user?.company_id) {
      loadLocationStock();
    }
  }, [location, user?.company_id]);

  const loadLocationStock = async () => {
    try {
      setLoading(true);
      const stockData = await inventoryService.getStock(user.company_id, {
        locationId: location.id
      });
      setStock(stockData);
    } catch (error) {
      console.error('Error loading location stock:', error);
      alert('Failed to load location inventory');
    } finally {
      setLoading(false);
    }
  };

  const filteredStock = stock.filter(item => {
    const itemName = item.inventory_items?.name?.toLowerCase() || '';
    const itemSku = item.inventory_items?.sku?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return itemName.includes(search) || itemSku.includes(search);
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handleStockAdjustment = (stockItem) => {
    onStockUpdate(stockItem.inventory_items, location);
  };

  const handleTransfer = (stockItem) => {
    onTransfer(stockItem.inventory_items, location);
  };

  const handleAllocateToJob = (stockItem) => {
    onAllocateToJob(stockItem.inventory_items, location, stockItem.quantity);
  };

  if (!location) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {location.name} - Inventory
            </h3>
            <p className="text-sm text-gray-500">
              {location.address && `${location.address} • `}
              {filteredStock.length} items in stock
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading inventory...</div>
            </div>
          ) : filteredStock.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                {searchTerm ? 'No items match your search.' : 'No items in this location.'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStock.map((stockItem) => {
                const item = stockItem.inventory_items;
                const status = inventoryAlertsService.getStockStatus(
                  stockItem.quantity, 
                  item?.reorder_point || 0
                );

                return (
                  <div key={stockItem.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      {/* Item Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {item?.name || 'Unknown Item'}
                            </h4>
                            {item?.sku && (
                              <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            <strong>{stockItem.quantity}</strong> {item?.unit_of_measure || 'each'}
                          </span>
                          {item?.cost && (
                            <span>Cost: {formatCurrency(item.cost)}</span>
                          )}
                          {item?.sell_price && (
                            <span>Sell: {formatCurrency(item.sell_price)}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStockAdjustment(stockItem)}
                          className="inline-flex items-center px-3 py-1.5 border border-primary-300 text-xs font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          title="Adjust Stock"
                        >
                          <PlusIcon className="h-3 w-3 mr-1" />
                          Adjust
                        </button>
                        
                        <button
                          onClick={() => handleTransfer(stockItem)}
                          className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Transfer to Another Location"
                        >
                          <ArrowsRightLeftIcon className="h-3 w-3 mr-1" />
                          Transfer
                        </button>

                        <button
                          onClick={() => handleAllocateToJob(stockItem)}
                          className="inline-flex items-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                          title="Allocate to Job"
                        >
                          <ClipboardDocumentListIcon className="h-3 w-3 mr-1" />
                          Allocate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationInventoryModal;
