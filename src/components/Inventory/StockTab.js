import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';

const StockTab = () => {
  const { user } = useUser();
  const [stock, setStock] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    itemId: '',
    locationId: ''
  });

  useEffect(() => {
    if (user?.company_id) {
      loadData();
    }
  }, [user?.company_id, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stockData, itemsData, locationsData] = await Promise.all([
        inventoryService.getStock(user.company_id, filters),
        inventoryService.getItems(user.company_id),
        inventoryService.getLocations(user.company_id)
      ]);
      
      setStock(stockData);
      setItems(itemsData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading stock data:', error);
      alert('Failed to load stock information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStockStatus = (quantity, reorderPoint) => {
    if (quantity <= 0) {
      return { status: 'out', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (quantity <= reorderPoint) {
      return { status: 'low', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else {
      return { status: 'good', color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'out' || status === 'low') {
      return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
    return <ChartBarIcon className="h-4 w-4" />;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'out': return 'Out of Stock';
      case 'low': return 'Low Stock';
      default: return 'In Stock';
    }
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
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Stock Overview</h2>
        <p className="text-sm text-gray-600">Current inventory levels across all locations</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FunnelIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <select
              value={filters.itemId}
              onChange={(e) => setFilters({ ...filters, itemId: e.target.value })}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Items</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.sku && `(${item.sku})`}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <FunnelIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <select
              value={filters.locationId}
              onChange={(e) => setFilters({ ...filters, locationId: e.target.value })}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stock.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No stock records found. Stock levels are updated automatically when inventory movements are recorded.
                  </td>
                </tr>
              ) : (
                stock.map((stockItem) => {
                  const item = stockItem.inventory_items;
                  const location = stockItem.inventory_locations;
                  const stockStatus = getStockStatus(stockItem.quantity, item?.reorder_point || 0);
                  
                  return (
                    <tr key={`${stockItem.item_id}-${stockItem.location_id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item?.name || 'Unknown Item'}
                          </div>
                          {item?.sku && (
                            <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {location?.name || 'Unknown Location'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {stockItem.quantity} {item?.unit_of_measure || 'each'}
                        </div>
                        {item?.reorder_point > 0 && (
                          <div className="text-xs text-gray-500">
                            Reorder at: {item.reorder_point}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                          {getStatusIcon(stockStatus.status)}
                          <span className="ml-1">{getStatusText(stockStatus.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(stockItem.updated_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      {stock.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Items</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stock.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Low Stock</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stock.filter(s => {
                    const item = s.inventory_items;
                    return s.quantity > 0 && s.quantity <= (item?.reorder_point || 0);
                  }).length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Out of Stock</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stock.filter(s => s.quantity <= 0).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTab;
