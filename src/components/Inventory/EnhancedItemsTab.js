import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
  ChartBarIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';
import InventoryStats from './InventoryStats';
import ItemModal from './ItemModal';
import ItemDetailModal from './ItemDetailModal';

const EnhancedItemsTab = () => {
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    stockFilter: 'all' // all, low, out
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (user?.company_id) {
      loadItems();
    }
  }, [user?.company_id, filters]);

  const loadItems = async () => {
    try {
      setLoading(true);

      // Step 1: Get all items (the catalog)
      const itemsData = await inventoryService.getItems(user.company_id, filters);

      // Step 2: Get all stock balances
      const stockData = await inventoryService.getStock(user.company_id);

      // Step 3: Create item summaries (1 row per item, totals across locations)
      const itemSummaries = itemsData.map(item => {
        // Find all stock records for this item across all locations
        const itemStocks = stockData.filter(s => s.item_id === item.id);

        // Aggregate totals across all locations
        let totalOnHand = 0;
        let totalReserved = 0; // TODO: Calculate from allocations when needed

        itemStocks.forEach(stock => {
          totalOnHand += stock.quantity || 0;
          // totalReserved += reserved quantity when allocation system is active
        });

        const totalAvailable = totalOnHand - totalReserved;
        const reorderPoint = item.reorder_point || 5;

        // Determine stock status based on totals
        let stockStatus = 'IN_STOCK';
        if (totalAvailable === 0) {
          stockStatus = 'OUT_OF_STOCK';
        } else if (totalAvailable <= reorderPoint) {
          stockStatus = 'LOW_STOCK';
        }

        return {
          // Item info from inventory_items
          item_id: item.id,
          item_name: item.name,
          sku: item.sku,
          description: item.description,
          category: item.category,
          unit_of_measure: item.unit_of_measure,
          cost: item.cost,
          sell_price: item.sell_price,
          reorder_point: item.reorder_point,

          // Aggregated stock info
          total_on_hand: totalOnHand,
          total_reserved: totalReserved,
          total_available: totalAvailable,
          stock_status: stockStatus
        };
      });

      setItems(itemSummaries);

      // Generate notifications for low/out-of-stock items (best effort)
      try {
        const { default: NotificationGenerator } = await import('../../services/NotificationGenerator');
        const lowOrOut = itemSummaries.filter(s => s.stock_status === 'LOW_STOCK' || s.stock_status === 'OUT_OF_STOCK');
        for (const s of lowOrOut) {
          await NotificationGenerator.lowInventory(user.company_id, { id: s.id, name: s.name, reorder_point: s.reorder_point }, { total_available: s.total_available });
        }
      } catch (e) { console.warn('inventory notifications failed', e); }
    } catch (error) {
      console.error('Error loading items:', error);
      alert('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    // Convert summary item to regular item format for editing
    const itemForEdit = {
      id: item.item_id,
      name: item.item_name,
      sku: item.sku,
      description: item.description,
      category: item.category,
      unit_of_measure: item.unit_of_measure,
      cost: item.cost,
      sell_price: item.sell_price,
      reorder_point: item.reorder_point
    };
    setEditingItem(itemForEdit);
    setShowModal(true);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.item_name}"?`)) {
      try {
        await inventoryService.deleteItem(user.company_id, item.item_id);
        loadItems();
      } catch (error) {
        console.error('Error deleting item:', error);

        // If delete failed due to dependencies, offer force delete option
        if (error.message.includes('Cannot delete item because it has:')) {
          const forceDelete = window.confirm(
            `${error.message}\n\nWould you like to FORCE DELETE this item and remove ALL its data?\n\n⚠️ WARNING: This will permanently delete:\n• All stock records\n• All movement history\n• All work order references\n\nThis action cannot be undone!`
          );

          if (forceDelete) {
            try {
              await inventoryService.forceDeleteItem(user.company_id, item.item_id);
              alert('Item and all related data successfully deleted.');
              loadItems();
            } catch (forceError) {
              console.error('Error force deleting item:', forceError);
              alert(`Force delete failed: ${forceError.message}`);
            }
          }
        } else {
          alert(`Failed to delete item: ${error.message}`);
        }
      }
    }
  };

  const getStockStatusBadge = (stockStatus, totalAvailable, reorderPoint) => {
    if (stockStatus === 'OUT_OF_STOCK' || totalAvailable === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-300', icon: '🚫' };
    } else if (stockStatus === 'LOW_STOCK' || totalAvailable <= reorderPoint) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⚠️' };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800 border-green-300', icon: '✅' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const stockFilterOptions = [
    { value: 'all', label: 'Show All', count: items.length },
    { value: 'low', label: 'Low Stock', count: items.filter(item => item.stock_status === 'LOW_STOCK').length },
    { value: 'out', label: 'Out of Stock', count: items.filter(item => item.stock_status === 'OUT_OF_STOCK').length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <InventoryStats />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inventory Items</h2>
          <p className="text-sm text-gray-600">Manage your inventory with real-time stock status</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items by name or SKU..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              {stockFilterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters(prev => ({ ...prev, stockFilter: option.value }))}
                  className={`px-3 py-2 text-xs font-medium border-r border-gray-300 last:border-r-0 ${
                    filters.stockFilter === option.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Card View"
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
              title="Table View"
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Items Display */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-500 mb-4">
            {filters.search || filters.stockFilter !== 'all'
              ? 'No items match your filters'
              : 'No inventory items found'
            }
          </div>
          {!filters.search && filters.stockFilter === 'all' && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Item
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
          {items.map((item) => {
            const stockStatus = getStockStatusBadge(item.stock_status, item.total_available, item.reorder_point);

            return (
              <div key={item.item_id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-200 transform hover:-translate-y-1">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.item_name || 'Unknown Item'}
                      </h3>
                      {item.sku && (
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      )}
                      {item.category && (
                        <p className="text-xs text-gray-400 mt-1">
                          📂 {item.category}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                      <span className="mr-1">{stockStatus.icon}</span>
                      {stockStatus.label}
                    </span>
                  </div>

                  {/* Stock Totals */}
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">📦 Total On Hand</span>
                      <span className="font-semibold text-gray-900">{item.total_on_hand || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-600">🔒 Total Reserved</span>
                      <span className="font-semibold text-orange-600">{item.total_reserved || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600">✅ Total Available</span>
                      <span className="font-semibold text-green-600">{item.total_available || 0}</span>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {item.unit_of_measure || 'each'}
                    </div>
                  </div>

                  {/* Pricing */}
                  {(item.cost || item.sell_price) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500 block">Cost</span>
                          <div className="font-medium text-gray-900">{formatCurrency(item.cost)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Sell</span>
                          <div className="font-medium text-gray-900">{formatCurrency(item.sell_price)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions - Fixed Layout */}
                  <div className="space-y-2">
                    {/* Primary Actions Row */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex items-center justify-center px-3 py-2 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                        title="Edit Item"
                      >
                        <PencilIcon className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="flex items-center justify-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        title="View Details"
                      >
                        <InformationCircleIcon className="h-3 w-3 mr-1" />
                        Details
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="flex items-center justify-center px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                        title="Delete Item"
                      >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    On Hand
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reserved
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => {
                  const stockStatus = getStockStatusBadge(item.stock_status, item.total_available, item.reorder_point);

                  return (
                    <tr key={item.item_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.item_name}
                            </div>
                            {item.sku && (
                              <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                            )}
                            {item.category && (
                              <div className="text-xs text-gray-400">{item.category}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.total_on_hand || 0}
                        </span>
                        <div className="text-xs text-gray-500">{item.unit_of_measure || 'each'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-orange-600">
                          {item.total_reserved || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-green-600">
                          {item.total_available || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                          <span className="mr-1">{stockStatus.icon}</span>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.cost)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit Item"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <InformationCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Item"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <ItemModal
          item={editingItem}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingItem(null);
            loadItems();
          }}
        />
      )}

      {showDetailModal && selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedItem(null);
          }}
          onRefresh={() => {
            loadItems();
          }}
        />
      )}
    </div>
  );
};

export default EnhancedItemsTab;
