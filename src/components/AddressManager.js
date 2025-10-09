import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';

const AddressManager = ({ customer, onAddressesChange }) => {
  const { user } = useUser();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    address_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    access_instructions: ''
  });

  useEffect(() => {
    if (customer?.id) {
      loadAddresses();
    }
  }, [customer?.id]);

  const loadAddresses = async () => {
    if (!customer?.id) return;

    setLoading(true);
    try {
      // Load both service addresses from customer_addresses table
      const serviceResponse = await supaFetch(
        `customer_addresses?customer_id=eq.${customer.id}&address_type=eq.SERVICE&order=is_primary.desc,address_name.asc`,
        { method: 'GET' },
        user.company_id
      );

      // Load legacy addresses from work_orders table
      const workOrderResponse = await supaFetch(
        `work_orders?customer_id=eq.${customer.id}&select=id,title,service_address_line_1,service_address_line_2,service_city,service_state,service_zip_code&order=created_at.desc`,
        { method: 'GET' },
        user.company_id
      );

      let allAddresses = [];

      // Add service addresses
      if (serviceResponse.ok) {
        const serviceData = await serviceResponse.json();
        allAddresses = [...(serviceData || [])];
      }

      // Add work order addresses (convert to same format)
      if (workOrderResponse.ok) {
        const workOrderData = await workOrderResponse.json();
        const workOrderAddresses = (workOrderData || [])
          .filter(wo => wo.service_address_line_1 && wo.service_address_line_1 !== '-') // Filter out empty/placeholder addresses
          .map(wo => ({
            id: `wo_${wo.id}`, // Prefix to distinguish from real addresses
            address_name: `Work Order: ${wo.title}`,
            address_line_1: wo.service_address_line_1,
            address_line_2: wo.service_address_line_2,
            city: wo.service_city,
            state: wo.service_state,
            zip_code: wo.service_zip_code,
            is_primary: false,
            isWorkOrderAddress: true, // Flag to handle differently
            work_order_id: wo.id
          }));

        allAddresses = [...allAddresses, ...workOrderAddresses];
      }

      setAddresses(allAddresses);
      if (onAddressesChange) {
        onAddressesChange(allAddresses);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAddressIcon = (addressName) => {
    const name = (addressName || '').toLowerCase();
    if (name.includes('office') || name.includes('main')) return BuildingOfficeIcon;
    if (name.includes('warehouse') || name.includes('storage')) return BuildingStorefrontIcon;
    return HomeIcon;
  };

  const formatAddress = (address) => {
    const parts = [address.city, address.state, address.zip_code].filter(Boolean);
    return `${address.address_line_1}${address.address_line_2 ? ', ' + address.address_line_2 : ''}, ${parts.join(', ')}`;
  };

  const handleAddAddress = async () => {
    if (!newAddress.address_line_1 || !newAddress.city || !newAddress.state || !newAddress.zip_code) {
      alert('Please fill in all required address fields');
      return;
    }

    try {
      const response = await supaFetch('customer_addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          customer_id: customer.id,
          company_id: user.company_id,
          address_type: 'SERVICE',
          ...newAddress,
          is_primary: addresses.length === 0 // First address is primary
        })
      }, user.company_id);

      if (response.ok) {
        setNewAddress({
          address_name: '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          zip_code: '',
          access_instructions: ''
        });
        setShowAddForm(false);
        await loadAddresses();
      } else {
        alert('Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const address = addresses.find(addr => addr.id === addressId);
    if (!address) return;

    const confirmMessage = address.isWorkOrderAddress
      ? 'This will clear the address from the work order. Are you sure?'
      : 'Are you sure you want to delete this address?';

    if (!window.confirm(confirmMessage)) return;

    try {
      if (address.isWorkOrderAddress) {
        // Clear address from work order
        const response = await supaFetch(`work_orders?id=eq.${address.work_order_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_address_line_1: null,
            service_address_line_2: null,
            service_city: null,
            service_state: null,
            service_zip_code: null
          })
        }, user.company_id);

        if (response.ok) {
          await loadAddresses();
        } else {
          alert('Failed to clear work order address');
        }
      } else {
        // Delete from customer_addresses table
        // First, clear any work order references to this address
        const clearReferencesResponse = await supaFetch(`work_orders?service_address_id=eq.${addressId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_address_id: null
          })
        }, user.company_id);

        if (!clearReferencesResponse.ok) {
          console.warn('Failed to clear work order references, but continuing with deletion');
        }

        // Now delete the address
        const response = await supaFetch(`customer_addresses?id=eq.${addressId}`, {
          method: 'DELETE'
        }, user.company_id);

        if (response.ok) {
          await loadAddresses();
        } else {
          alert('Failed to delete address');
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  const handleEditAddress = async (address) => {
    if (address.isWorkOrderAddress) {
      alert('Work order addresses should be edited in the Jobs page. You can delete this address here and add a proper service address instead.');
      return;
    }
    setEditingAddress({ ...address });
  };

  const handleSaveEdit = async () => {
    if (!editingAddress.address_line_1 || !editingAddress.city || !editingAddress.state || !editingAddress.zip_code) {
      alert('Please fill in all required address fields');
      return;
    }

    try {
      const response = await supaFetch(`customer_addresses?id=eq.${editingAddress.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          address_name: editingAddress.address_name,
          address_line_1: editingAddress.address_line_1,
          address_line_2: editingAddress.address_line_2,
          city: editingAddress.city,
          state: editingAddress.state,
          zip_code: editingAddress.zip_code,
          access_instructions: editingAddress.access_instructions
        })
      }, user.company_id);

      if (response.ok) {
        setEditingAddress(null);
        await loadAddresses();
      } else {
        alert('Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address');
    }
  };

  if (!customer) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-5 h-5 text-gray-500" />
          <h4 className="font-medium text-gray-900">
            Service Addresses ({addresses.length})
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <PlusIcon className="w-4 h-4" />
          Add Address
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          No service addresses on file
        </div>
      ) : (
        <div className="space-y-2">
          {addresses.map((address) => {
            const IconComponent = getAddressIcon(address.address_name);
            const isEditing = editingAddress?.id === address.id;
            
            return (
              <div key={address.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Address Name (e.g., Main Office)"
                        value={editingAddress.address_name || ''}
                        onChange={(e) => setEditingAddress({...editingAddress, address_name: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Street Address *"
                        value={editingAddress.address_line_1 || ''}
                        onChange={(e) => setEditingAddress({...editingAddress, address_line_1: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="City *"
                        value={editingAddress.city || ''}
                        onChange={(e) => setEditingAddress({...editingAddress, city: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={editingAddress.state || ''}
                        onChange={(e) => setEditingAddress({...editingAddress, state: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                      <input
                        type="text"
                        placeholder="ZIP *"
                        value={editingAddress.zip_code || ''}
                        onChange={(e) => setEditingAddress({...editingAddress, zip_code: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAddress(null)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {address.address_name || 'Unnamed Location'}
                          </span>
                          {address.is_primary && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatAddress(address)}
                        </div>
                        {address.access_instructions && (
                          <div className="text-xs text-gray-500 mt-1">
                            🔑 {address.access_instructions}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditAddress(address)}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="Edit Address"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete Address"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Address Form */}
      {showAddForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h5 className="font-medium text-gray-900 mb-3">Add New Service Address</h5>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Address Name (e.g., Main Office)"
                value={newAddress.address_name}
                onChange={(e) => setNewAddress({...newAddress, address_name: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="text"
                placeholder="Street Address *"
                value={newAddress.address_line_1}
                onChange={(e) => setNewAddress({...newAddress, address_line_1: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="City *"
                value={newAddress.city}
                onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
              <input
                type="text"
                placeholder="State *"
                value={newAddress.state}
                onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
              <input
                type="text"
                placeholder="ZIP *"
                value={newAddress.zip_code}
                onChange={(e) => setNewAddress({...newAddress, zip_code: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
              <input
                type="text"
                placeholder="Access Instructions"
                value={newAddress.access_instructions}
                onChange={(e) => setNewAddress({...newAddress, access_instructions: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add Address
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewAddress({
                    address_name: '',
                    address_line_1: '',
                    address_line_2: '',
                    city: '',
                    state: '',
                    zip_code: '',
                    access_instructions: ''
                  });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManager;
