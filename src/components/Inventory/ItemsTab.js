import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
  Squares2X2Icon,
  TableCellsIcon,
  FunnelIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';
import inventoryAlertsService from '../../services/InventoryAlertsService';
import ItemModal from './ItemModal';
import StockAdjustmentModal from './StockAdjustmentModal';
import TransferModal from './TransferModal';

const ItemsTab = () => {
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    alertsOnly: false
  });
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAdjustmentItem, setStockAdjustmentItem] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferItem, setTransferItem] = useState(null);

  useEffect(() => {
    if (user?.company_id) {
      loadItems();
      loadCategories();
      loadStockData();
    }
  }, [user?.company_id, filters]);

  useEffect(() => {
    // Check URL parameters for alert filter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('filter') === 'alerts') {
      setFilters(prev => ({ ...prev, alertsOnly: true }));
    }
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      let data = await inventoryService.getItems(user.company_id, {
        search: filters.search,
        category: filters.category
      });

      // Filter for alerts if requested
      if (filters.alertsOnly && Object.keys(stockData).length > 0) {
        data = data.filter(item => {
          const stock = stockData[item.id];
          if (!stock) return false;
          return stock.quantity <= 0 || stock.quantity <= (item.reorder_point || 0);
        });
      }

      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
      alert('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const loadStockData = async () => {
    try {
      const stockArray = await inventoryService.getStock(user.company_id);
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
      console.error('Error loading stock data:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await inventoryService.getCategories(user.company_id);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await inventoryService.deleteItem(item.id);
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleModalSave = () => {
    setShowModal(false);
    setEditingItem(null);
    loadItems();
    loadCategories(); // Refresh categories in case new one was added
  };

  const handleStockAdjustment = (item) => {
    setStockAdjustmentItem(item);
    setShowStockModal(true);
  };

  const handleStockModalClose = () => {
    setShowStockModal(false);
    setStockAdjustmentItem(null);
  };

  const handleStockModalSave = () => {
    setShowStockModal(false);
    setStockAdjustmentItem(null);
    loadStockData();
  };

  const handleTransfer = (item) => {
    setTransferItem(item);
    setShowTransferModal(true);
  };

  const handleTransferModalClose = () => {
    setShowTransferModal(false);
    setTransferItem(null);
  };

  const handleTransferModalSave = () => {
    setShowTransferModal(false);
    setTransferItem(null);
    loadStockData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Inventory Items</h2>
          <p className="text-sm text-gray-600">Manage your inventory items and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle - Hidden on mobile since it's responsive */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Card View (Mobile)"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Table View (Desktop)"
            >
              <TableCellsIcon className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or category..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="alertsOnly"
              checked={filters.alertsOnly}
              onChange={(e) => setFilters({ ...filters, alertsOnly: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="alertsOnly" className="ml-2 block text-sm text-gray-900">
              Show alerts only
            </label>
          </div>
        </div>
      </div>

      {/* Items Display */}
      {viewMode === 'cards' ? (
        /* Card View - Mobile Responsive */
        <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  No inventory items found. Click "Add Item" to get started.
                </div>
              </div>
            ) : (
              items.map((item) => {
                const stock = stockData[item.id];
                const totalQuantity = stock?.quantity || 0;
                const status = inventoryAlertsService.getStockStatus(totalQuantity, item.reorder_point || 0);

                return (
                  <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    {/* Mobile Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        {item.sku && (
                          <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Stock Info */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-1">Current Stock</div>
                      <div className="text-lg font-semibold text-gray-900 mb-2">
                        {totalQuantity} {item.unit_of_measure || 'each'}
                      </div>

                      {/* Location Breakdown */}
                      {stock?.locations && stock.locations.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 mb-1">By Location:</div>
                          {stock.locations.map((location, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="text-gray-600">{location.location_name || 'Unknown Location'}</span>
                              <span className="font-medium text-gray-900">
                                {location.quantity} {item.unit_of_measure || 'each'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Cost</span>
                        <div className="font-medium text-gray-900">
                          {formatCurrency(item.cost)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Sell Price</span>
                        <div className="font-medium text-gray-900">
                          {item.sell_price ? formatCurrency(item.sell_price) : '-'}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Actions - Consistent Button Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleStockAdjustment(item)}
                        className="flex items-center justify-center px-3 py-2 border border-primary-300 text-xs font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        title="Adjust Stock"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Stock
                      </button>
                      <button
                        onClick={() => handleTransfer(item)}
                        className="flex items-center justify-center px-3 py-2 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Transfer Stock"
                      >
                        <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
                        Transfer
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex items-center justify-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        title="Edit Item"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>

                    {/* Delete Button - Separate Row */}
                    <div className="mt-2">
                      <button
                        onClick={() => handleDelete(item)}
                        className="w-full flex items-center justify-center px-3 py-2 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Delete Item"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete Item
                      </button>
                    </div>
                  </div>
                );
              })
            )}
        </div>
      ) : (
        /* Table View - Desktop */
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No inventory items found. Click "Add Item" to get started.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const stock = stockData[item.id];
                    const totalQuantity = stock?.quantity || 0;
                    const status = inventoryAlertsService.getStockStatus(totalQuantity, item.reorder_point || 0);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        {/* Item Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                              {item.sku && (
                                <div className="text-sm text-gray-500">
                                  SKU: {item.sku}
                                </div>
                              )}
                              {item.description && (
                                <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Stock Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-start">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                {totalQuantity} {item.unit_of_measure || 'each'}
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color} mb-2`}>
                                <div className={`w-2 h-2 rounded-full ${status.badgeColor} mr-1`}></div>
                                {status.label}
                              </span>

                              {/* Location Breakdown */}
                              {stock?.locations && stock.locations.length > 1 && (
                                <div className="space-y-1">
                                  {stock.locations.map((location, index) => (
                                    <div key={index} className="flex justify-between text-xs text-gray-600">
                                      <span className="truncate max-w-20">{location.location_name || 'Unknown'}</span>
                                      <span className="font-medium ml-2">
                                        {location.quantity}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Pricing Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>Cost: {formatCurrency(item.cost)}</div>
                            <div className="text-gray-500">
                              Sell: {item.sell_price ? formatCurrency(item.sell_price) : '-'}
                            </div>
                          </div>
                        </td>

                        {/* Category Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.category ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item.category}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleStockAdjustment(item)}
                              className="inline-flex items-center px-3 py-1.5 border border-primary-300 text-xs font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                              title="Adjust Stock"
                            >
                              <PlusIcon className="h-3 w-3 mr-1" />
                              Stock
                            </button>
                            <button
                              onClick={() => handleTransfer(item)}
                              className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              title="Transfer Stock"
                            >
                              <ArrowsRightLeftIcon className="h-3 w-3 mr-1" />
                              Transfer
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                              title="Edit Item"
                            >
                              <PencilIcon className="h-3 w-3 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                              title="Delete Item"
                            >
                              <TrashIcon className="h-3 w-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      )}

      {/* Modal */}
      {showModal && (
        <ItemModal
          item={editingItem}
          onClose={() => setShowModal(false)}
          onSave={handleModalSave}
        />
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && (
        <StockAdjustmentModal
          item={stockAdjustmentItem}
          onClose={handleStockModalClose}
          onSave={handleStockModalSave}
        />
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <TransferModal
          item={transferItem}
          onClose={handleTransferModalClose}
          onSave={handleTransferModalSave}
        />
      )}
    </div>
  );
};

export default ItemsTab;
