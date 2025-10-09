import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext';
import inventoryService from '../services/InventoryService';
import inventoryAlertsService from '../services/InventoryAlertsService';

const InventoryItemsModal = ({ open, onClose, onAdd }) => {
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (open && user?.company_id) {
      loadInventoryData();
    }
  }, [open, user?.company_id]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [itemsData, stockArray, categoriesData] = await Promise.all([
        inventoryService.getItems(user.company_id),
        inventoryService.getStock(user.company_id),
        inventoryService.getCategories(user.company_id)
      ]);

      setItems(itemsData);
      setCategories(categoriesData);

      // Convert stock array to map
      const stockMap = {};
      stockArray.forEach(stock => {
        if (!stockMap[stock.item_id]) {
          stockMap[stock.item_id] = { quantity: 0, locations: [] };
        }
        stockMap[stock.item_id].quantity += stock.quantity;
        stockMap[stock.item_id].locations.push({
          location_id: stock.location_id,
          location_name: stock.inventory_locations?.name,
          quantity: stock.quantity
        });
      });
      setStockData(stockMap);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handleAddItem = (item) => {
    onAdd(item);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ArchiveBoxIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Add from Inventory</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search items by name, SKU, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No inventory items available. Add items in the Inventory module first.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const stock = stockData[item.id];
                const totalQuantity = stock?.quantity || 0;
                const status = inventoryAlertsService.getStockStatus(totalQuantity, item.reorder_point || 0);
                
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          {item.sku && (
                            <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                          )}
                          {item.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="ml-4 text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {item.sell_price ? formatCurrency(item.sell_price) : formatCurrency(item.cost)}
                          </div>
                          <div className="text-xs text-gray-500">
                            per {item.unit_of_measure || 'each'}
                          </div>
                        </div>

                        <div className="ml-4 text-center">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                            <div className={`w-2 h-2 rounded-full ${status.badgeColor} mr-1`}></div>
                            {totalQuantity} {item.unit_of_measure || 'each'}
                          </div>
                          {status.status !== 'good' && (
                            <div className="flex items-center justify-center mt-1">
                              <ExclamationTriangleIcon className="h-3 w-3 text-yellow-500 mr-1" />
                              <span className="text-xs text-yellow-600">
                                {status.status === 'out' ? 'Out of stock' : 'Low stock'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={() => handleAddItem(item)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        disabled={totalQuantity <= 0}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} available
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryItemsModal;
