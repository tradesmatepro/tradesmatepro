import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import {
  MapPinIcon,
  PlusIcon,
  BuildingOfficeIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { formatAddressSafe } from '../utils/formatAddress';


const ServiceAddressSelector = ({ customer, selectedAddress, onAddressChange }) => {
  const { user } = useUser();
  const [serviceAddresses, setServiceAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    access_instructions: ''
  });

  // Load service addresses for the customer
  useEffect(() => {
    if (customer?.id && user?.company_id) {
      loadServiceAddresses();
    }
  }, [customer?.id, user?.company_id]);

  const loadServiceAddresses = async () => {
    setLoading(true);
    try {
      // For residential: use billing address from customers table (industry standard)
      if (customer?.customer_type === 'RESIDENTIAL' || customer?.type === 'residential') {
        // Auto-select billing address if customer has one
        if (!selectedAddress && customer.billing_address_line_1) {
          onAddressChange({
            type: 'billing',
            label: 'Same as Billing Address',
            address_line_1: customer.billing_address_line_1,
            address_line_2: customer.billing_address_line_2,
            city: customer.billing_city,
            state: customer.billing_state,
            zip_code: customer.billing_zip_code,
            country: customer.billing_country || 'United States'
          });
        }
        setLoading(false);
        return;
      }

      // For commercial/property management: load from customer_addresses table
      const response = await supaFetch(
        `customer_addresses?customer_id=eq.${customer.id}&address_type=eq.SERVICE&order=is_primary.desc,address_name.asc`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const addresses = await response.json();
        setServiceAddresses(addresses);

        // Auto-select primary service address
        if (!selectedAddress && addresses.length > 0) {
          const primaryAddress = addresses.find(addr => addr.is_primary) || addresses[0];
          onAddressChange(primaryAddress);
        }
      }
    } catch (error) {
      console.error('Error loading service addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.address_line_1 || !newAddress.city || !newAddress.state || !newAddress.zip_code) {
      alert('Please fill in all required address fields');
      return;
    }

    try {
      console.log('🏠 Adding service address:', {
        customer_id: customer.id,
        company_id: user.company_id,
        address_type: 'SERVICE',
        ...newAddress,
        is_primary: serviceAddresses.length === 0
      });

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
          is_primary: serviceAddresses.length === 0 // First address is primary
        })
      }, user.company_id);

      console.log('🏠 Response status:', response.status, response.statusText);

      if (response.ok) {
        const responseText = await response.text();
        console.log('🏠 Response text:', responseText);

        let createdAddress;
        if (responseText) {
          try {
            createdAddress = JSON.parse(responseText);
            console.log('🏠 Created address:', createdAddress);
          } catch (parseError) {
            console.error('🏠 JSON parse error:', parseError);
            alert('Failed to parse server response');
            return;
          }
        } else {
          console.error('🏠 Empty response from server');
          alert('Server returned empty response');
          return;
        }

        await loadServiceAddresses();
        onAddressChange(Array.isArray(createdAddress) ? createdAddress[0] : createdAddress);
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
        alert('Service address added successfully!');
      } else {
        const errorText = await response.text();
        console.error('🏠 Server error:', response.status, response.statusText, errorText);
        alert(`Failed to add service address: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('🏠 Error adding service address:', error);
      alert(`Failed to add service address: ${error.message}`);
    }
  };

  const getCustomerTypeIcon = () => {
    switch (customer?.customer_type) {
      case 'COMMERCIAL':
        return <BuildingOfficeIcon className="w-4 h-4" />;
      case 'PROPERTY_MANAGEMENT':
        return <BuildingStorefrontIcon className="w-4 h-4" />;
      default:
        return <HomeIcon className="w-4 h-4" />;
    }
  };

  const getCustomerTypeLabel = () => {
    switch (customer?.customer_type) {
      case 'COMMERCIAL':
        return 'Commercial';
      case 'PROPERTY_MANAGEMENT':
        return 'Property Management';
      default:
        return 'Residential';
    }
  };

  const formatAddress = (address) => formatAddressSafe(address);

  // For residential customers, show simple address card
  if (customer?.customer_type === 'RESIDENTIAL' || customer?.type === 'residential') {
    // Get billing address from customers table (industry standard for residential)
    const hasBillingAddress = customer.billing_address_line_1 && customer.billing_city && customer.billing_state && customer.billing_zip_code;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          {getCustomerTypeIcon()}
          <h4 className="font-medium text-gray-900">Service Address</h4>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {getCustomerTypeLabel()}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Location *
            </label>
            <select
              value={selectedAddress?.type || (hasBillingAddress ? 'billing' : 'none')}
              onChange={(e) => {
                const value = e.target.value;

                if (value === 'none') {
                  onAddressChange({ type: 'none', label: 'No Service Address' });
                } else if (value === 'tbd') {
                  onAddressChange({ type: 'tbd', label: 'TBD (To Be Determined)' });
                } else if (value === 'billing' && hasBillingAddress) {
                  onAddressChange({
                    type: 'billing',
                    label: 'Same as Billing Address',
                    address_line_1: customer.billing_address_line_1,
                    address_line_2: customer.billing_address_line_2,
                    city: customer.billing_city,
                    state: customer.billing_state,
                    zip_code: customer.billing_zip_code,
                    country: customer.billing_country || 'United States'
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {hasBillingAddress && <option value="billing">Same as Billing Address</option>}
              <option value="none">No Service Address (Photo Estimate)</option>
              <option value="tbd">TBD (To Be Determined)</option>
            </select>
          </div>

          {(!selectedAddress || selectedAddress?.type === 'billing') && hasBillingAddress && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-800">
                <div className="font-medium">✅ Using Billing Address:</div>
                <div className="mt-1">
                  {customer.billing_address_line_1}
                  {customer.billing_address_line_2 && <>, {customer.billing_address_line_2}</>}
                  <br />
                  {customer.billing_city}, {customer.billing_state} {customer.billing_zip_code}
                </div>
              </div>
            </div>
          )}

          {(!selectedAddress || selectedAddress?.type === 'billing') && !hasBillingAddress && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm text-yellow-800">
                <div className="font-medium">⚠️ No Address on File</div>
                <div className="mt-1">Add a billing address in the customer profile first, or select "No Service Address" for photo estimates.</div>
              </div>
            </div>
          )}

          {selectedAddress?.type === 'none' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <div className="font-medium">📷 Photo Estimate</div>
                <div className="mt-1">No service address required - working from photos/description</div>
              </div>
            </div>
          )}

          {selectedAddress?.type === 'tbd' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-sm text-purple-800">
                <div className="font-medium">📋 Address TBD</div>
                <div className="mt-1">Service address will be determined later</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For commercial/property management customers, show service address selector
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getCustomerTypeIcon()}
          <h4 className="font-medium text-gray-900">Service Address</h4>
          <span className={`text-xs px-2 py-1 rounded-full ${
            customer?.customer_type === 'COMMERCIAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {getCustomerTypeLabel()}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
        >
          <PlusIcon className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* Customer Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="font-medium text-gray-900">{customer.name}</div>
        <div className="text-sm text-gray-600">
          <strong>Billing:</strong> {formatAddress({
            address_line_1: customer.billing_address_line_1 || customer.street_address,
            city: customer.billing_city || customer.city,
            state: customer.billing_state || customer.state,
            zip_code: customer.billing_zip_code || customer.zip_code
          })}
        </div>
      </div>

      {/* Service Address Selection */}
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading service addresses...</div>
      ) : serviceAddresses.length > 0 ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Service Location *
          </label>
          <div className="relative">
            <select
              value={selectedAddress?.id || selectedAddress?.type || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'none') {
                  onAddressChange({ type: 'none', label: 'No Service Address' });
                } else if (value === 'tbd') {
                  onAddressChange({ type: 'tbd', label: 'TBD (To Be Determined)' });
                } else {
                  const address = serviceAddresses.find(addr => addr.id === value);
                  onAddressChange(address);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
            >
              <option value="">Select a service location...</option>
              <option value="none">No Service Address (Photo Estimate)</option>
              <option value="tbd">TBD (To Be Determined)</option>
              <optgroup label="Service Locations">
                {serviceAddresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.address_name || 'Unnamed Location'} - {formatAddress(address)}
                    {address.is_primary ? ' (Primary)' : ''}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDownIcon className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {selectedAddress && selectedAddress.type === 'none' && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📷</span>
                <span className="font-medium text-blue-900">Photo Estimate</span>
              </div>
              <div className="text-sm text-blue-700">
                No service address required - working from photos/description
              </div>
            </div>
          )}

          {selectedAddress && selectedAddress.type === 'tbd' && (
            <div className="mt-2 p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📋</span>
                <span className="font-medium text-purple-900">Address TBD</span>
              </div>
              <div className="text-sm text-purple-700">
                Service address will be determined later
              </div>
            </div>
          )}

          {selectedAddress && selectedAddress.id && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MapPinIcon className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedAddress.address_name || 'Service Location'}
                </span>
                {selectedAddress.is_primary && (
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Primary</span>
                )}
              </div>
              <div className="text-sm text-blue-800">
                {formatAddress(selectedAddress)}
              </div>
              {selectedAddress.access_instructions && (
                <div className="text-xs text-blue-700 mt-1">
                  <strong>Access:</strong> {selectedAddress.access_instructions}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No service addresses found. Add one below.
        </div>
      )}

      {/* Add New Address Form */}
      {showAddForm && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h5 className="font-medium text-gray-900 mb-3">Add New Service Location</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Name
              </label>
              <input
                type="text"
                value={newAddress.address_name}
                onChange={(e) => setNewAddress({ ...newAddress, address_name: e.target.value })}
                placeholder="e.g., Main Office, Warehouse, Building A"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={newAddress.address_line_1}
                onChange={(e) => setNewAddress({ ...newAddress, address_line_1: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={newAddress.address_line_2}
                onChange={(e) => setNewAddress({ ...newAddress, address_line_2: e.target.value })}
                placeholder="Apt, Suite, Unit, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                value={newAddress.zip_code}
                onChange={(e) => setNewAddress({ ...newAddress, zip_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Instructions
              </label>
              <textarea
                value={newAddress.access_instructions}
                onChange={(e) => setNewAddress({ ...newAddress, access_instructions: e.target.value })}
                placeholder="Gate codes, parking instructions, contact person, etc."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleAddAddress}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Add Location
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceAddressSelector;
