import React from 'react';
import {
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export const CustomerStats = ({ customers }) => {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const avgRating = customers.length > 0 
    ? (customers.reduce((sum, c) => sum + (c.rating || 0), 0) / customers.length).toFixed(1)
    : '0.0';
  const totalRevenue = customers.reduce((sum, c) => sum + (parseFloat(c.lifetime_revenue) || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <UserGroupIcon className="w-8 h-8 text-blue-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
            <div className="text-sm text-gray-500">Total Customers</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <StarIcon className="w-8 h-8 text-yellow-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{avgRating}</div>
            <div className="text-sm text-gray-500">Avg Rating</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <UserGroupIcon className="w-8 h-8 text-purple-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{activeCustomers}</div>
            <div className="text-sm text-gray-500">Active Customers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CustomerSearchFilter = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => (
  <div className="card mb-6">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <FunnelIcon className="w-4 h-4 text-gray-500" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Customers</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="prospect">Prospects</option>
        </select>
      </div>
    </div>
  </div>
);

export const CustomerTable = ({ customers, loading, openEditForm, openDetailsModal, deleteCustomer }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-gray-500">Loading customers...</div>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 mb-2">No customers found</div>
          <div className="text-sm text-gray-400">Add your first customer to get started</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-auto max-h-[calc(100vh-300px)]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.city && customer.state
                          ? `${customer.city}, ${customer.state} ${customer.zip_code || ''}`.trim()
                          : customer.street_address || 'No address'
                        }
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {customer.phone && (
                      <div className="flex items-center gap-1">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        {customer.phone}
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-1 mt-1">
                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                        {customer.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.status === 'active' ? 'bg-green-100 text-green-800' :
                    customer.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {customer.status || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-900">{customer.rating || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${(customer.lifetime_revenue || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.last_service_date ? new Date(customer.last_service_date).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDetailsModal(customer)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View details"
                    >
                      <UserGroupIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditForm(customer)}
                      className="text-primary-600 hover:text-primary-900"
                      title="Edit customer"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCustomer(customer.id, customer.name)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete customer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Alert = ({ alert }) => {
  if (!alert.show) return null;

  return (
    <div className={`alert mb-6 ${alert.type === 'error' ? 'alert-error' : 'alert-success'}`}>
      {alert.message}
    </div>
  );
};
