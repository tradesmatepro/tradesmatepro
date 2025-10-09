import React, { useState, useEffect } from 'react';

const AddressCard = ({
  customer,
  workAddress = null,
  onAddressChange = null,
  editable = true,
  title = "Service Address",
  showCustomerInfo = true,
  showBillingOption = true
}) => {

  const [editingAddress, setEditingAddress] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [tempAddress, setTempAddress] = useState({
    street_address: workAddress?.street_address || workAddress?.service_address_line_1 || '',
    city: workAddress?.city || workAddress?.service_city || '',
    state: workAddress?.state || workAddress?.service_state || '',
    zip_code: workAddress?.zip_code || workAddress?.service_zip_code || ''
  });

  // Get billing address from customer
  const billingAddress = {
    street_address: customer?.billing_address_line_1 || customer?.street_address || '',
    city: customer?.billing_city || customer?.city || '',
    state: customer?.billing_state || customer?.state || '',
    zip_code: customer?.billing_zip_code || customer?.zip_code || ''
  };

  // Check if current service address matches billing address
  useEffect(() => {
    if (customer && tempAddress.street_address && billingAddress.street_address) {
      const addressesMatch =
        tempAddress.street_address === billingAddress.street_address &&
        tempAddress.city === billingAddress.city &&
        tempAddress.state === billingAddress.state &&
        tempAddress.zip_code === billingAddress.zip_code;
      setSameAsBilling(addressesMatch);
    }
  }, [customer, tempAddress, billingAddress]);

  // Check if workAddress has actual data, otherwise fall back to customer address
  const workAddressHasData = workAddress && (
    workAddress.street_address || workAddress.service_address_line_1 ||
    workAddress.city || workAddress.service_city ||
    workAddress.state || workAddress.service_state ||
    workAddress.zip_code || workAddress.service_zip_code
  );
  const currentAddress = workAddressHasData ? {
    street_address: workAddress.street_address || workAddress.service_address_line_1 || '',
    city: workAddress.city || workAddress.service_city || '',
    state: workAddress.state || workAddress.service_state || '',
    zip_code: workAddress.zip_code || workAddress.service_zip_code || ''
  } : billingAddress;

  const hasAddress = currentAddress.street_address || currentAddress.city || currentAddress.state || currentAddress.zip_code;


  const handleSameAsBillingChange = (checked) => {
    setSameAsBilling(checked);
    if (checked) {
      // Copy billing address to service address
      const newAddress = { ...billingAddress };
      setTempAddress(newAddress);
      if (onAddressChange) {
        onAddressChange(newAddress);
      }
    }
  };

  const handleAddressFieldChange = (field, value) => {
    const newAddress = { ...tempAddress, [field]: value };
    setTempAddress(newAddress);

    // If user manually changes address, uncheck "same as billing"
    if (sameAsBilling) {
      setSameAsBilling(false);
    }
  };

  const handleSaveAddress = () => {
    if (onAddressChange) {
      onAddressChange(tempAddress);
    }
    setEditingAddress(false);
  };

  const handleCancelEdit = () => {
    setTempAddress({
      street_address: currentAddress.street_address || '',
      city: currentAddress.city || '',
      state: currentAddress.state || '',
      zip_code: currentAddress.zip_code || ''
    });
    setEditingAddress(false);
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      {showCustomerInfo && customer && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-900">Customer Information</h4>
            {editable && (
              <button
                type="button"
                onClick={() => setEditingAddress(!editingAddress)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {editingAddress ? 'Cancel' : 'Edit Address'}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <div className="font-medium text-gray-900">{customer.name}</div>
              {customer.phone && (
                <div className="text-gray-600">📞 {customer.phone}</div>
              )}
              {customer.email && (
                <div className="text-gray-600">✉️ {customer.email}</div>
              )}
            </div>
            
            <div>
              <div className="font-medium text-gray-900 mb-1">{title}:</div>
              {!editingAddress ? (
                // Display Mode
                hasAddress ? (
                  <div className="text-gray-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                    {currentAddress.street_address && (
                      <div>{currentAddress.street_address}</div>
                    )}
                    <div>
                      {[currentAddress.city, currentAddress.state, currentAddress.zip_code]
                        .filter(Boolean).join(', ')}
                    </div>
                    <div className="text-xs text-yellow-700 mt-1">
                      ⚠️ Verify this address is current
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2">
                    <div className="text-xs">❌ No address on file</div>
                    <div className="text-xs mt-1">Add address before dispatching</div>
                  </div>
                )
              ) : (
                // Edit Mode
                <div className="space-y-2">
                  {/* Same as Billing Address Checkbox */}
                  {showBillingOption && billingAddress.street_address && (
                    <label className="flex items-center space-x-2 text-xs">
                      <input
                        type="checkbox"
                        checked={sameAsBilling}
                        onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-gray-700">Same as billing address</span>
                    </label>
                  )}

                  <input
                    type="text"
                    placeholder="Street Address"
                    value={tempAddress.street_address}
                    onChange={(e) => handleAddressFieldChange('street_address', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    disabled={sameAsBilling}
                  />
                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="text"
                      placeholder="City"
                      value={tempAddress.city}
                      onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      disabled={sameAsBilling}
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={tempAddress.state}
                      onChange={(e) => handleAddressFieldChange('state', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      disabled={sameAsBilling}
                    />
                    <input
                      type="text"
                      placeholder="ZIP"
                      value={tempAddress.zip_code}
                      onChange={(e) => handleAddressFieldChange('zip_code', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      disabled={sameAsBilling}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="text-xs text-blue-600">
                    💡 Changes here are for this job only. To permanently update customer address, go to Customers page.
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {!showCustomerInfo && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-gray-900">{title}:</div>
            {editable && (
              <button
                type="button"
                onClick={() => setEditingAddress(!editingAddress)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {editingAddress ? 'Cancel' : 'Edit Address'}
              </button>
            )}
          </div>
          
          {!editingAddress ? (
            hasAddress ? (
              <div className="text-gray-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                {currentAddress.street_address && (
                  <div>{currentAddress.street_address}</div>
                )}
                <div>
                  {[currentAddress.city, currentAddress.state, currentAddress.zip_code]
                    .filter(Boolean).join(', ')}
                </div>
                <div className="text-xs text-yellow-700 mt-1">
                  ⚠️ Verify this address is current
                </div>
              </div>
            ) : (
              <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2">
                <div className="text-xs">❌ No address on file</div>
                <div className="text-xs mt-1">Add address before dispatching</div>
              </div>
            )
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Street Address"
                value={tempAddress.street_address}
                onChange={(e) => setTempAddress({...tempAddress, street_address: e.target.value})}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <div className="grid grid-cols-3 gap-1">
                <input
                  type="text"
                  placeholder="City"
                  value={tempAddress.city}
                  onChange={(e) => setTempAddress({...tempAddress, city: e.target.value})}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={tempAddress.state}
                  onChange={(e) => setTempAddress({...tempAddress, state: e.target.value})}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
                <input
                  type="text"
                  placeholder="ZIP"
                  value={tempAddress.zip_code}
                  onChange={(e) => setTempAddress({...tempAddress, zip_code: e.target.value})}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
              <div className="text-xs text-blue-600">
                💡 Changes here are for this job only. To permanently update customer address, go to Customers page.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressCard;
