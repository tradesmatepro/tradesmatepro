// Vendor Catalog Modal - Advanced vendor item selection with pricing intelligence
import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import {
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  TagIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const VendorCatalogModal = ({ isOpen, onClose, vendorId, onSelectItems }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [catalogItems, setCatalogItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [priceFilter, setPriceFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    if (isOpen && vendorId) {
      loadVendorCatalog();
    }
  }, [isOpen, vendorId]);

  const loadVendorCatalog = async () => {
    try {
      setLoading(true);
      
      // Load vendor catalog with inventory details and pricing history
      const response = await supaFetch(
        `vendor_catalog_v?vendor_id=eq.${vendorId}&company_id=eq.${user.company_id}&order=supplier_part_number.asc`,
        { method: 'GET' }
      );
      
      if (response.ok) {
        const items = await response.json();
        setCatalogItems(items);
      }
    } catch (error) {
      console.error('Error loading vendor catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = catalogItems;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        (item.supplier_part_number || '').toLowerCase().includes(query) ||
        (item.supplier_description || '').toLowerCase().includes(query) ||
        (item.item_name || '').toLowerCase().includes(query) ||
        (item.internal_sku || '').toLowerCase().includes(query)
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      if (priceFilter === 'under_50') {
        filtered = filtered.filter(item => (item.unit_cost || 0) < 50);
      } else if (priceFilter === '50_200') {
        filtered = filtered.filter(item => (item.unit_cost || 0) >= 50 && (item.unit_cost || 0) <= 200);
      } else if (priceFilter === 'over_200') {
        filtered = filtered.filter(item => (item.unit_cost || 0) > 200);
      }
    }

    // Stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(item => item.stock_status === stockFilter);
    }

    return filtered;
  }, [catalogItems, searchQuery, priceFilter, stockFilter]);

  const handleItemToggle = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(selected => selected.id === item.id);
      if (exists) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, { ...item, quantity: item.minimum_order_qty || 1 }];
      }
    });
  };

  const handleQuantityChange = (itemId, quantity) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, parseInt(quantity) || 1) } : item
      )
    );
  };

  const handleAddSelected = () => {
    const itemsToAdd = selectedItems.map(item => ({
      item_sku: item.internal_sku || item.supplier_part_number,
      item_name: item.item_name || item.supplier_description,
      description: item.supplier_description || item.internal_description || '',
      quantity: item.quantity,
      unit_cost: item.unit_cost || 0,
      supplier_part_number: item.supplier_part_number,
      inventory_item_id: item.inventory_item_id
    }));
    
    onSelectItems(itemsToAdd);
    onClose();
  };

  const getStockStatusBadge = (status, onHand) => {
    const badges = {
      'IN_STOCK': { color: 'bg-green-100 text-green-800', text: `${onHand} in stock` },
      'LOW_STOCK': { color: 'bg-yellow-100 text-yellow-800', text: `${onHand} low stock` },
      'OUT_OF_STOCK': { color: 'bg-red-100 text-red-800', text: 'Out of stock' },
      'NOT_STOCKED': { color: 'bg-gray-100 text-gray-800', text: 'Not stocked' }
    };
    
    const badge = badges[status] || badges['NOT_STOCKED'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const CatalogItem = ({ item }) => {
    const isSelected = selectedItems.find(selected => selected.id === item.id);
    const selectedItem = selectedItems.find(selected => selected.id === item.id);

    return (
      <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={!!isSelected}
                onChange={() => handleItemToggle(item)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <h3 className="font-medium text-gray-900">
                {item.item_name || item.supplier_description}
              </h3>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <TagIcon className="w-4 h-4" />
                <span>Vendor: {item.supplier_part_number}</span>
              </div>
              {item.internal_sku && (
                <div className="flex items-center gap-1">
                  <span>Internal: {item.internal_sku}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
                <CurrencyDollarIcon className="w-5 h-5" />
                {(item.unit_cost || 0).toFixed(2)}
              </div>
              
              {item.lead_time_days > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4" />
                  {item.lead_time_days} days
                </div>
              )}
              
              {item.minimum_order_qty > 1 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TruckIcon className="w-4 h-4" />
                  Min: {item.minimum_order_qty}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              {getStockStatusBadge(item.stock_status, item.stock_on_hand)}
              
              {isSelected && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Qty:</label>
                  <input
                    type="number"
                    min={item.minimum_order_qty || 1}
                    value={selectedItem?.quantity || 1}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {item.supplier_description && item.supplier_description !== item.item_name && (
          <p className="text-sm text-gray-600 mt-2">{item.supplier_description}</p>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Vendor Catalog</h2>
            <p className="text-sm text-gray-600">Select items from vendor catalog</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by part number, description, or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="under_50">Under $50</option>
              <option value="50_200">$50 - $200</option>
              <option value="over_200">Over $200</option>
            </select>
            
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stock Levels</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="NOT_STOCKED">Not Stocked</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading catalog...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No items found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <CatalogItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSelected}
                disabled={selectedItems.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Add Selected Items
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCatalogModal;
