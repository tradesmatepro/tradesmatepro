import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ArchiveBoxIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';
import LocationModal from './LocationModal';
import LocationInventoryModal from './LocationInventoryModal';
import StockAdjustmentModal from './StockAdjustmentModal';
import TransferModal from './TransferModal';
import JobAllocationModal from './JobAllocationModal';

const LocationsTab = () => {
  const { user } = useUser();
  const [locations, setLocations] = useState([]);
  const [locationStats, setLocationStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  // New modal states
  const [showLocationInventory, setShowLocationInventory] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showJobAllocationModal, setShowJobAllocationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemLocation, setSelectedItemLocation] = useState(null);
  const [availableQuantity, setAvailableQuantity] = useState(0);

  useEffect(() => {
    if (user?.company_id) {
      loadLocations();
      loadLocationStats();
    }
  }, [user?.company_id]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getLocations(user.company_id);
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
      alert('Failed to load inventory locations');
    } finally {
      setLoading(false);
    }
  };

  const loadLocationStats = async () => {
    try {
      const stockData = await inventoryService.getStock(user.company_id);
      const stats = {};

      stockData.forEach(stock => {
        const locationId = stock.location_id;
        if (!stats[locationId]) {
          stats[locationId] = {
            totalItems: 0,
            totalQuantity: 0,
            lowStockItems: 0,
            outOfStockItems: 0
          };
        }

        stats[locationId].totalItems += 1;
        stats[locationId].totalQuantity += stock.quantity;

        if (stock.quantity <= 0) {
          stats[locationId].outOfStockItems += 1;
        } else if (stock.inventory_items?.reorder_point && stock.quantity <= stock.inventory_items.reorder_point) {
          stats[locationId].lowStockItems += 1;
        }
      });

      setLocationStats(stats);
    } catch (error) {
      console.error('Error loading location stats:', error);
    }
  };

  const handleCreate = () => {
    setEditingLocation(null);
    setShowModal(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setShowModal(true);
  };

  const handleDelete = async (location) => {
    if (!window.confirm(`Are you sure you want to delete "${location.name}"?`)) {
      return;
    }

    try {
      await inventoryService.deleteLocation(location.id);
      loadLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Failed to delete location');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingLocation(null);
  };

  const handleModalSave = () => {
    setShowModal(false);
    setEditingLocation(null);
    loadLocations();
    loadLocationStats();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLocationType = (locationName, address) => {
    const name = locationName.toLowerCase();
    const addr = (address || '').toLowerCase();

    if (name.includes('truck') || name.includes('van') || name.includes('vehicle')) {
      return { type: 'Truck', icon: TruckIcon, color: 'text-blue-600 bg-blue-100' };
    } else if (name.includes('job') || name.includes('site') || name.includes('project')) {
      return { type: 'Job Site', icon: WrenchScrewdriverIcon, color: 'text-green-600 bg-green-100' };
    } else {
      return { type: 'Warehouse', icon: BuildingOfficeIcon, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const handleViewInventory = (location) => {
    setSelectedLocation(location);
    setShowLocationInventory(true);
  };

  // New modal handlers
  const handleStockUpdate = (item, location) => {
    setSelectedItem(item);
    setSelectedItemLocation(location);
    setShowLocationInventory(false);
    setShowStockModal(true);
  };

  const handleTransferItem = (item, location) => {
    setSelectedItem(item);
    setSelectedItemLocation(location);
    setShowLocationInventory(false);
    setShowTransferModal(true);
  };

  const handleAllocateToJob = (item, location, quantity) => {
    setSelectedItem(item);
    setSelectedItemLocation(location);
    setAvailableQuantity(quantity);
    setShowLocationInventory(false);
    setShowJobAllocationModal(true);
  };

  const handleInventoryModalClose = () => {
    setShowLocationInventory(false);
    setShowStockModal(false);
    setShowTransferModal(false);
    setShowJobAllocationModal(false);
    setSelectedItem(null);
    setSelectedItemLocation(null);
    setAvailableQuantity(0);
  };

  const handleInventoryModalSave = () => {
    handleInventoryModalClose();
    loadLocationStats(); // Refresh stats
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
          <h2 className="text-lg font-semibold text-gray-900">Inventory Locations</h2>
          <p className="text-sm text-gray-600">Manage warehouses, trucks, and storage locations</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Location
        </button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12">
              <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No locations</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first inventory location.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Location
                </button>
              </div>
            </div>
          </div>
        ) : (
          locations.map((location) => {
            const locationType = getLocationType(location.name, location.address);
            const stats = locationStats[location.id] || { totalItems: 0, totalQuantity: 0, lowStockItems: 0, outOfStockItems: 0 };

            return (
              <div
                key={location.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Header with location type */}
                <div className={`px-6 py-4 ${locationType.color} border-b border-gray-100`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <locationType.icon className="h-6 w-6 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {location.name}
                        </h3>
                        <p className="text-sm opacity-75">
                          {locationType.type}
                        </p>
                      </div>
                    </div>
                    {location.is_default && (
                      <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Default</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Address */}
                  {location.address && (
                    <div className="flex items-start mb-4">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {location.address}
                      </p>
                    </div>
                  )}

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.totalItems}
                      </div>
                      <div className="text-xs text-gray-600">
                        Items Stored
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.totalQuantity}
                      </div>
                      <div className="text-xs text-gray-600">
                        Total Quantity
                      </div>
                    </div>
                  </div>

                  {/* Alert indicators */}
                  {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
                    <div className="flex items-center justify-center space-x-4 mb-4 p-3 bg-yellow-50 rounded-lg">
                      {stats.outOfStockItems > 0 && (
                        <div className="flex items-center text-red-600">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium">
                            {stats.outOfStockItems} Out of Stock
                          </span>
                        </div>
                      )}
                      {stats.lowStockItems > 0 && (
                        <div className="flex items-center text-yellow-600">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium">
                            {stats.lowStockItems} Low Stock
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100">
                    {/* Primary Action */}
                    <div className="flex items-center justify-center mb-3">
                      <button
                        onClick={() => handleViewInventory(location)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Inventory
                      </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleEdit(location)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        title="Edit Location"
                      >
                        <PencilIcon className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(location)}
                        className="inline-flex items-center p-1.5 rounded-md text-red-600 hover:text-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Delete Location"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Created date */}
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">
                      Created {formatDate(location.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Location Modal */}
      {showModal && (
        <LocationModal
          location={editingLocation}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            setEditingLocation(null);
            loadLocations();
          }}
        />
      )}

      {/* Location Inventory Modal */}
      {showLocationInventory && (
        <LocationInventoryModal
          location={selectedLocation}
          onClose={handleInventoryModalClose}
          onStockUpdate={handleStockUpdate}
          onTransfer={handleTransferItem}
          onAllocateToJob={handleAllocateToJob}
        />
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && (
        <StockAdjustmentModal
          item={selectedItem}
          location={selectedItemLocation}
          onClose={handleInventoryModalClose}
          onSave={handleInventoryModalSave}
        />
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <TransferModal
          item={selectedItem}
          fromLocation={selectedItemLocation}
          onClose={handleInventoryModalClose}
          onSave={handleInventoryModalSave}
        />
      )}

      {/* Job Allocation Modal */}
      {showJobAllocationModal && (
        <JobAllocationModal
          item={selectedItem}
          location={selectedItemLocation}
          availableQuantity={availableQuantity}
          onClose={handleInventoryModalClose}
          onSave={handleInventoryModalSave}
        />
      )}
    </div>
  );
};

export default LocationsTab;
