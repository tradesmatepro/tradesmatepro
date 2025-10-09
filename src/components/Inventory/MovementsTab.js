import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  UserIcon,
  Squares2X2Icon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';
import MovementModal from './MovementModal';

const MovementsTab = () => {
  const { user } = useUser();
  const [movements, setMovements] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    itemId: '',
    locationId: '',
    movementType: '',
    startDate: '',
    endDate: ''
  });
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'table'

  const movementTypes = [
    'PURCHASE',
    'USAGE', 
    'TRANSFER',
    'RETURN',
    'ADJUSTMENT'
  ];

  useEffect(() => {
    if (user?.company_id) {
      loadData();
    }
  }, [user?.company_id, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movementsData, itemsData, locationsData] = await Promise.all([
        inventoryService.getMovements(user.company_id, filters),
        inventoryService.getItems(user.company_id),
        inventoryService.getLocations(user.company_id)
      ]);
      
      setMovements(movementsData);
      setItems(itemsData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading movements data:', error);
      alert('Failed to load movements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalSave = () => {
    setShowModal(false);
    loadData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatTimelineText = (movement) => {
    const item = movement.inventory_items;
    const location = movement.inventory_locations;
    const isIncoming = ['PURCHASE', 'RETURN', 'ADJUSTMENT'].includes(movement.movement_type) && movement.quantity > 0;
    const symbol = isIncoming ? '+' : '-';
    const action = isIncoming ? '→' : '←';

    return `${symbol}${Math.abs(movement.quantity)} ${item?.name || 'Unknown Item'} ${action} ${location?.name || 'Unknown Location'}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'PURCHASE':
      case 'RETURN':
        return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
      case 'USAGE':
        return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
      case 'TRANSFER':
        return <ArrowsRightLeftIcon className="h-4 w-4 text-blue-600" />;
      case 'ADJUSTMENT':
        return <ArrowsRightLeftIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return <ArrowsRightLeftIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'PURCHASE':
      case 'RETURN':
        return 'text-green-600 bg-green-100';
      case 'USAGE':
        return 'text-red-600 bg-red-100';
      case 'TRANSFER':
        return 'text-blue-600 bg-blue-100';
      case 'ADJUSTMENT':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Inventory Movements</h2>
          <p className="text-sm text-gray-600">Track all inventory transactions and changes</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Timeline View"
            >
              <ClockIcon className="h-4 w-4" />
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
              <TableCellsIcon className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Record Movement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

          <div className="relative">
            <FunnelIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <select
              value={filters.movementType}
              onChange={(e) => setFilters({ ...filters, movementType: e.target.value })}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Types</option>
              {movementTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Start Date"
            />
          </div>

          <div>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Movements Display */}
      {viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            {movements.length === 0 ? (
              <div className="text-center py-12">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No movements found</h3>
                <p className="text-gray-500 mb-6">
                  No inventory movements found. Click "Record Movement" to get started.
                </p>
              </div>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {movements.map((movement, movementIdx) => {
                    const item = movement.inventory_items;
                    const location = movement.inventory_locations;
                    const isIncoming = ['PURCHASE', 'RETURN'].includes(movement.movement_type) ||
                                     (movement.movement_type === 'ADJUSTMENT' && movement.quantity > 0);
                    const dateTime = formatDateTime(movement.created_at);

                    return (
                      <li key={movement.id}>
                        <div className="relative pb-8">
                          {movementIdx !== movements.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                isIncoming ? 'bg-green-500' : 'bg-red-500'
                              }`}>
                                {isIncoming ? (
                                  <ArrowUpIcon className="h-4 w-4 text-white" />
                                ) : (
                                  <ArrowDownIcon className="h-4 w-4 text-white" />
                                )}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {formatTimelineText(movement)}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementColor(movement.movement_type)}`}>
                                      {getMovementIcon(movement.movement_type)}
                                      <span className="ml-1">{movement.movement_type}</span>
                                    </span>
                                    {movement.unit_cost && (
                                      <span className="text-xs text-gray-500">
                                        @ {formatCurrency(movement.unit_cost)} each
                                      </span>
                                    )}
                                  </div>
                                  {movement.notes && (
                                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-md p-2">
                                      {movement.notes}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                  <div className="font-medium">{dateTime.date}</div>
                                  <div className="text-xs">{dateTime.time}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No inventory movements found. Click "Record Movement" to get started.
                  </td>
                </tr>
              ) : (
                movements.map((movement) => {
                  const item = movement.inventory_items;
                  const location = movement.inventory_locations;
                  
                  return (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(movement.created_at)}
                      </td>
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementColor(movement.movement_type)}`}>
                          {getMovementIcon(movement.movement_type)}
                          <span className="ml-1">{movement.movement_type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.quantity} {item?.unit_of_measure || 'each'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.unit_cost ? formatCurrency(movement.unit_cost) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {movement.notes || '-'}
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
        <MovementModal
          onClose={handleModalClose}
          onSave={handleModalSave}
          items={items}
          locations={locations}
        />
      )}
    </div>
  );
};

export default MovementsTab;
