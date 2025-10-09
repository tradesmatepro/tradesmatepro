import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { VendorsService, VENDOR_STATUS, VENDOR_TYPES, PAYMENT_TERMS, getVendorStatusBadge, getVendorTypeLabel, getPaymentTermsLabel } from '../services/VendorsService';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import '../styles/modern-enhancements.css';
import VendorPerformanceScorecard from '../components/VendorPerformanceScorecard';

import {
  PlusIcon,
  BuildingOfficeIcon,
  StarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  MapIcon,
  TableCellsIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChartBarIcon,
  UserGroupIcon,
  MapPinIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  BanknotesIcon,
  ClockIcon,
  XMarkIcon,
  UserIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

// Vendor Form Modal Component
const VendorFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, title, submitLabel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={onSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Basic Information</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vendor Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vendor Type</label>
                      <select
                        value={formData.vendor_type}
                        onChange={(e) => setFormData({ ...formData, vendor_type: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {Object.entries(VENDOR_TYPES).map(([key, value]) => (
                          <option key={key} value={value}>{getVendorTypeLabel(value)}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {Object.entries(VENDOR_STATUS).map(([key, value]) => (
                          <option key={key} value={value}>{getVendorStatusBadge({ status: value }).label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Address & Business Details */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Address & Business Details</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input
                      type="text"
                      value={formData.street_address}
                      onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                      <input
                        type="text"
                        value={formData.zip_code}
                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                      <select
                        value={formData.payment_terms}
                        onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {Object.entries(PAYMENT_TERMS).map(([key, value]) => (
                          <option key={key} value={value}>{getPaymentTermsLabel(value)}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.credit_limit}
                        onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                    <input
                      type="text"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {submitLabel}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Vendor Profile Modal Component
const VendorProfileModal = ({ vendor, isOpen, onClose, onEdit }) => {
  if (!isOpen || !vendor) return null;

  const statusBadge = getVendorStatusBadge(vendor);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Vendor Details</h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-medium text-gray-700">
                  {vendor.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{vendor.name}</h4>
                  {vendor.company_name && (
                    <p className="text-gray-600">{vendor.company_name}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                      {statusBadge.label}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getVendorTypeLabel(vendor.vendor_type)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">${Number(vendor.lifetime_spend || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Total Spend</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">{vendor.total_orders || 0}</div>
                  <div className="text-sm text-gray-500">Orders</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${i < (vendor.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h5>
                <div className="space-y-2">
                  {vendor.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{vendor.email}</span>
                    </div>
                  )}
                  {vendor.website && (
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-500">
                        {vendor.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              {(vendor.street_address || vendor.city || vendor.state) && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Address</h5>
                  <div className="flex items-start">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <div className="text-sm text-gray-900">
                      {vendor.street_address && <div>{vendor.street_address}</div>}
                      {(vendor.city || vendor.state || vendor.zip_code) && (
                        <div>
                          {vendor.city}{vendor.city && vendor.state ? ', ' : ''}{vendor.state} {vendor.zip_code}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Business Details */}
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Business Details</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Payment Terms:</span>
                    <span className="ml-2 text-gray-900">{getPaymentTermsLabel(vendor.payment_terms)}</span>
                  </div>
                  {vendor.credit_limit > 0 && (
                    <div>
                      <span className="text-gray-500">Credit Limit:</span>
                      <span className="ml-2 text-gray-900">${Number(vendor.credit_limit).toLocaleString()}</span>
                    </div>
                  )}
                  {vendor.tax_id && (
                    <div>
                      <span className="text-gray-500">Tax ID:</span>
                      <span className="ml-2 text-gray-900">{vendor.tax_id}</span>
                    </div>
                  )}
                  {vendor.last_order_date && (
                    <div>
                      <span className="text-gray-500">Last Order:</span>
                      <span className="ml-2 text-gray-900">{new Date(vendor.last_order_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {vendor.notes && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Notes</h5>
                  <p className="text-sm text-gray-700">{vendor.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onEdit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Edit Vendor
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vendor Table Component
const VendorTable = ({ filteredVendors, getStatusBadge, getInitials, formatPhoneNumber, openProfileModal, openEditForm, handleDeleteVendor, navigate, selectedVendors, setSelectedVendors }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3">
              <input type="checkbox" onChange={(e)=>{
                if (e.target.checked) {
                  const all = {}; filteredVendors.forEach(v=> all[v.id]=true); setSelectedVendors(all);
                } else { setSelectedVendors({}); }
              }} />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Spend
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Orders
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredVendors.map((vendor) => {
            const statusBadge = getStatusBadge(vendor);
            return (
              <tr key={vendor.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <input 
                    type="checkbox" 
                    checked={!!selectedVendors[vendor.id]}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVendors(prev => ({ ...prev, [vendor.id]: true }));
                      } else {
                        setSelectedVendors(prev => {
                          const next = { ...prev };
                          delete next[vendor.id];
                          return next;
                        });
                      }
                    }}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                        {getInitials(vendor.name)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                      {vendor.company_name && (
                        <div className="text-sm text-gray-500">{vendor.company_name}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {vendor.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {formatPhoneNumber(vendor.phone)}
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center mt-1">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {vendor.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getVendorTypeLabel(vendor.vendor_type)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                    {statusBadge.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  ${Number(vendor.lifetime_spend || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {vendor.total_orders || 0}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${i < (vendor.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-1 text-sm text-gray-600">({vendor.rating || 0})</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openProfileModal(vendor)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditForm(vendor)}
                      className="text-green-600 hover:text-green-900"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
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
);

// Vendor Stats Cards
const VendorStatsCards = ({ vendors }) => {
  const activeVendors = vendors.filter(v => v.status === VENDOR_STATUS.ACTIVE).length;
  const totalSpend = vendors.reduce((sum, v) => sum + Number(v.lifetime_spend || 0), 0);
  const avgRating = vendors.length > 0 
    ? vendors.reduce((sum, v) => sum + Number(v.rating || 0), 0) / vendors.length 
    : 0;
  const totalOrders = vendors.reduce((sum, v) => sum + Number(v.total_orders || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Vendors</dt>
                <dd className="text-lg font-medium text-gray-900">{activeVendors}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Spend</dt>
                <dd className="text-lg font-medium text-gray-900">${totalSpend.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                <dd className="text-lg font-medium text-gray-900">{totalOrders}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Avg Rating</dt>
                <dd className="text-lg font-medium text-gray-900">{avgRating.toFixed(1)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Vendors = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  
  // State management
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    vendor_type: VENDOR_TYPES.SUPPLIER,
    payment_terms: PAYMENT_TERMS.NET_30,
    status: VENDOR_STATUS.ACTIVE,
    notes: '',
    website: '',
    tax_id: '',
    credit_limit: 0,
    primary_contact_name: '',
    primary_contact_phone: '',
    primary_contact_email: ''
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  // Load vendors
  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await VendorsService.list(user.company_id);
      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.company_id) {
      loadVendors();
    }
  }, [user?.company_id]);

  // Filter vendors
  useEffect(() => {
    let filtered = vendors;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(vendor =>
        vendor.name?.toLowerCase().includes(term) ||
        vendor.company_name?.toLowerCase().includes(term) ||
        vendor.email?.toLowerCase().includes(term) ||
        vendor.phone?.includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.vendor_type === typeFilter);
    }

    setFilteredVendors(filtered);
    setPage(1); // Reset to first page when filters change
  }, [vendors, searchTerm, statusFilter, typeFilter]);

  // Helper functions
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getStatusBadge = getVendorStatusBadge;

  // Modal handlers
  const openProfileModal = (vendor) => {
    setSelectedVendor(vendor);
    setShowProfileModal(true);
  };

  const openPerformanceModal = (vendor) => {
    setSelectedVendor(vendor);
    setShowPerformanceModal(true);
  };

  const openEditForm = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name || '',
      company_name: vendor.company_name || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      street_address: vendor.street_address || '',
      city: vendor.city || '',
      state: vendor.state || '',
      zip_code: vendor.zip_code || '',
      country: vendor.country || 'United States',
      vendor_type: vendor.vendor_type || VENDOR_TYPES.SUPPLIER,
      payment_terms: vendor.payment_terms || PAYMENT_TERMS.NET_30,
      status: vendor.status || VENDOR_STATUS.ACTIVE,
      notes: vendor.notes || '',
      website: vendor.website || '',
      tax_id: vendor.tax_id || '',
      credit_limit: vendor.credit_limit || 0,
      primary_contact_name: vendor.primary_contact_name || '',
      primary_contact_phone: vendor.primary_contact_phone || '',
      primary_contact_email: vendor.primary_contact_email || ''
    });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company_name: '',
      phone: '',
      email: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'United States',
      vendor_type: VENDOR_TYPES.SUPPLIER,
      payment_terms: PAYMENT_TERMS.NET_30,
      status: VENDOR_STATUS.ACTIVE,
      notes: '',
      website: '',
      tax_id: '',
      credit_limit: 0,
      primary_contact_name: '',
      primary_contact_phone: '',
      primary_contact_email: ''
    });
    setSelectedVendor(null);
  };

  // CRUD operations
  const handleCreateVendor = async (e) => {
    e.preventDefault();
    try {
      await VendorsService.create(user.company_id, formData);
      setShowCreateForm(false);
      resetForm();
      await loadVendors();
      // Show success message
    } catch (error) {
      console.error('Error creating vendor:', error);
      // Show error message
    }
  };

  const handleUpdateVendor = async (e) => {
    e.preventDefault();
    try {
      await VendorsService.update(user.company_id, selectedVendor.id, formData);
      setShowEditForm(false);
      resetForm();
      await loadVendors();
      // Show success message
    } catch (error) {
      console.error('Error updating vendor:', error);
      // Show error message
    }
  };

  const handleDeleteVendor = async (vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.name}?`)) {
      try {
        await VendorsService.delete(user.company_id, vendor.id);
        await loadVendors();
        // Show success message
      } catch (error) {
        console.error('Error deleting vendor:', error);
        // Show error message
      }
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredVendors.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredVendors.length);
  const currentVendors = filteredVendors.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const activeVendors = vendors.filter(v => v.status === 'ACTIVE').length;
  const avgRating = vendors.length > 0
    ? vendors.reduce((sum, v) => sum + Number(v.rating || 0), 0) / vendors.length
    : 0;
  const totalOrders = vendors.reduce((sum, v) => sum + Number(v.total_orders || 0), 0);

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Vendor Management"
        subtitle="Manage suppliers, track performance, and maintain vendor relationships"
        icon={BuildingOfficeIcon}
        gradient="blue"
        stats={[
          { label: 'Active Vendors', value: activeVendors },
          { label: 'Avg Rating', value: avgRating.toFixed(1) },
          { label: 'Total Orders', value: totalOrders }
        ]}
        actions={[
          {
            label: 'Add Vendor',
            icon: PlusIcon,
            onClick: () => setShowCreateModal(true)
          }
        ]}
      />

      {/* Vendor Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernCard className="card-gradient-blue text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Vendors</p>
                <p className="text-3xl font-bold text-white">{activeVendors}</p>
                <p className="text-blue-200 text-xs mt-1">Supplier network</p>
              </div>
              <BuildingOfficeIcon className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-green text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-white">{avgRating.toFixed(1)}</p>
                <p className="text-green-200 text-xs mt-1">Performance score</p>
              </div>
              <StarIcon className="w-12 h-12 text-green-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-purple text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-white">{totalOrders}</p>
                <p className="text-purple-200 text-xs mt-1">Purchase history</p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-orange text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Relationships</p>
                <p className="text-3xl font-bold text-white">{vendors.length}</p>
                <p className="text-orange-200 text-xs mt-1">Total vendors</p>
              </div>
              <UserGroupIcon className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                {Object.values(VENDOR_STATUS).map(status => (
                  <option key={status} value={status}>
                    {getVendorStatusBadge({ status }).label}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Types</option>
                {Object.values(VENDOR_TYPES).map(type => (
                  <option key={type} value={type}>
                    {getVendorTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <VendorTable
        filteredVendors={currentVendors}
        getStatusBadge={getStatusBadge}
        getInitials={getInitials}
        formatPhoneNumber={formatPhoneNumber}
        openProfileModal={openProfileModal}
        openEditForm={openEditForm}
        handleDeleteVendor={handleDeleteVendor}
        navigate={navigate}
        selectedVendors={selectedVendors}
        setSelectedVendors={setSelectedVendors}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{endIndex}</span> of{' '}
                <span className="font-medium">{filteredVendors.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === i + 1
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Create Vendor Modal */}
      {showCreateForm && (
        <VendorFormModal
          isOpen={showCreateForm}
          onClose={() => {
            setShowCreateForm(false);
            resetForm();
          }}
          onSubmit={handleCreateVendor}
          formData={formData}
          setFormData={setFormData}
          title="Add New Vendor"
          submitLabel="Create Vendor"
        />
      )}

      {/* Edit Vendor Modal */}
      {showEditForm && (
        <VendorFormModal
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            resetForm();
          }}
          onSubmit={handleUpdateVendor}
          formData={formData}
          setFormData={setFormData}
          title="Edit Vendor"
          submitLabel="Update Vendor"
        />
      )}

      {/* Vendor Profile Modal */}
      {showProfileModal && selectedVendor && (
        <VendorProfileModal
          vendor={selectedVendor}
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedVendor(null);
          }}
          onEdit={() => {
            setShowProfileModal(false);
            openEditForm(selectedVendor);
          }}
        />
      )}

      {/* Vendor Performance Scorecard */}
      {showPerformanceModal && selectedVendor && (
        <VendorPerformanceScorecard
          vendorId={selectedVendor.id}
          isOpen={showPerformanceModal}
          onClose={() => {
            setShowPerformanceModal(false);
            setSelectedVendor(null);
          }}
        />
      )}
    </div>
  );
};

export default Vendors;
