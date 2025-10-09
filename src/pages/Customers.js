import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import { supabase } from '../utils/supabaseClient';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernTable from '../components/Common/ModernTable';
import AddressManager from '../components/AddressManager';

import '../styles/modern-enhancements.css';

import {
  PlusIcon,
  UserGroupIcon,
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
  MapPinIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  BanknotesIcon,
  ClockIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

// Customer Table Component
const CustomerTable = ({ filteredCustomers, getStatusBadge, getInitials, formatPhoneNumber, openProfileModal, openEditForm, handleDeleteCustomer, handleInviteToPortal, navigate, selectedCustomers, setSelectedCustomers }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3">
              <input type="checkbox" onChange={(e)=>{
                if (e.target.checked) {
                  const all = {}; filteredCustomers.forEach(c=> all[c.id]=true); setSelectedCustomers(all);
                } else { setSelectedCustomers({}); }
              }} />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Revenue
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
          {filteredCustomers.map((customer) => {
            const statusBadge = getStatusBadge(customer);

            return (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <input type="checkbox" checked={!!selectedCustomers[customer.id]} onChange={(e)=>{
                    const next = { ...selectedCustomers };
                    if (e.target.checked) next[customer.id] = true; else delete next[customer.id];
                    setSelectedCustomers(next);
                  }} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {getInitials(customer.name)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">
                        {customer.totalJobs} jobs • Last: {customer.daysSinceLastService ? `${customer.daysSinceLastService} days ago` : 'Never'}
                      </div>
                      {customer.autoTags && customer.autoTags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {customer.autoTags.map(tag => (
                            <span key={tag} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.customer_type === 'RESIDENTIAL' ? 'bg-green-100 text-green-800' :
                    customer.customer_type === 'COMMERCIAL' ? 'bg-blue-100 text-blue-800' :
                    customer.customer_type === 'PROPERTY_MANAGEMENT' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.customer_type === 'RESIDENTIAL' ? 'Residential' :
                     customer.customer_type === 'COMMERCIAL' ? 'Commercial' :
                     customer.customer_type === 'PROPERTY_MANAGEMENT' ? 'Property Mgmt' :
                     customer.customer_type || 'Residential'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {customer.phone && (
                      <div className="flex items-center text-sm text-gray-900">
                        <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <a href={`tel:${customer.phone}`} className="hover:text-primary-600">
                          {formatPhoneNumber(customer.phone)}
                        </a>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center text-sm text-gray-900">
                        <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <a href={`mailto:${customer.email}`} className="hover:text-primary-600">
                          {customer.email}
                        </a>
                      </div>
                    )}
                    {customer.street_address && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(`${customer.street_address}, ${customer.city}, ${customer.state} ${customer.zip_code}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary-600"
                        >
                          {customer.street_address}
                        </a>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                    {statusBadge.label}
                  </span>
                  {customer.outstandingBalance > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      Outstanding: ${customer.outstandingBalance.toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${customer.totalRevenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    Avg: ${customer.avgJobValue.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(customer.rating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{customer.rating.toFixed(1)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openProfileModal(customer)}
                      className="text-primary-600 hover:text-primary-900"
                      title="View Profile"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditForm(customer)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/quotes?new=quote&customer=${customer.id}`)}
                      className="text-green-600 hover:text-green-900"
                      title="Create Quote"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                    </button>
                    {customer.email && !customer.has_portal_account && (
                      <button
                        onClick={() => handleInviteToPortal(customer)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Invite to Portal"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
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

// Customer Cards Component
const CustomerCards = ({ filteredCustomers, getStatusBadge, getInitials, formatPhoneNumber, openProfileModal, navigate }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredCustomers.map((customer) => {
      const statusBadge = getStatusBadge(customer);

      return (
        <div key={customer.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-lg font-medium text-primary-600">
                  {getInitials(customer.name)}
                </span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </div>

          {/* AI Summary Card */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-blue-800">
              <strong>{customer.totalJobs}</strong> jobs • <strong>${customer.totalRevenue.toLocaleString()}</strong> revenue
              {customer.daysSinceLastService && (
                <> • Last serviced <strong>{customer.daysSinceLastService} days ago</strong></>
              )}
              <br />
              Average job value: <strong>${customer.avgJobValue.toLocaleString()}</strong>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            {customer.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                <a href={`tel:${customer.phone}`} className="hover:text-primary-600">
                  {formatPhoneNumber(customer.phone)}
                </a>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                <a href={`mailto:${customer.email}`} className="hover:text-primary-600 truncate">
                  {customer.email}
                </a>
              </div>
            )}
            {customer.street_address && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 text-gray-400 mr-2" />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${customer.street_address}, ${customer.city}, ${customer.state} ${customer.zip_code}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 truncate"
                >
                  {customer.street_address}
                </a>
              </div>
            )}
          </div>

          {/* Tags */}
          {customer.autoTags && customer.autoTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {customer.autoTags.map(tag => (
                <span key={tag} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIconSolid
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(customer.rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">{customer.rating.toFixed(1)}</span>
            </div>
            {customer.outstandingBalance > 0 && (
              <div className="text-sm text-red-600 font-medium">
                Outstanding: ${customer.outstandingBalance.toLocaleString()}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => openProfileModal(customer)}
              className="flex-1 btn-secondary text-sm"
            >
              View Profile
            </button>
            <button
              onClick={() => navigate(`/quotes?new=quote&customer=${customer.id}`)}
              className="flex-1 btn-primary text-sm"
            >
              Create Quote
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

// Customer Map Component
const CustomerMap = ({ filteredCustomers, getInitials }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
    <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Map View</h3>
    <p className="text-gray-600 mb-4">Interactive map showing customer locations</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCustomers.map((customer) => (
        <div key={customer.id} className="bg-gray-50 rounded-lg p-4 text-left">
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">
                {getInitials(customer.name)}
              </span>
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
            </div>
          </div>
          {customer.street_address && (
            <div className="text-xs text-gray-600">
              {customer.street_address}, {customer.city}, {customer.state}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Customer Form Component
const CustomerForm = ({ formData, setFormData, handleCreateCustomer, setShowCreateForm, resetForm, onStatusChange, customerTags }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Add New Customer</h3>
        <button
          onClick={() => {
            setShowCreateForm(false);
            resetForm();
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleCreateCustomer} className="space-y-4">
        {/* Customer Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Type *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['residential', 'commercial', 'industrial'].map((type) => (
              <label key={type} className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                formData.type === type
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={formData.type === type}
                  onChange={(e) => setFormData({
                    ...formData,
                    type: e.target.value,
                    // Clear name fields when switching types
                    first_name: '',
                    last_name: '',
                    company_name: ''
                  })}
                  className="text-primary-600"
                />
                <span className="text-sm font-medium capitalize">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Conditional Name Fields Based on Customer Type */}
        {formData.type === 'residential' ? (
          // RESIDENTIAL: First Name + Last Name
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        ) : (
          // COMMERCIAL/INDUSTRIAL: Company Name
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="ABC Plumbing Inc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <div className="flex">
              <select
                className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                onChange={(e) => {
                  const countryCode = e.target.value;
                  const currentPhone = formData.phone || '';
                  // Remove existing country code if present
                  const phoneWithoutCode = currentPhone.replace(/^\+\d{1,4}\s?/, '');
                  setFormData({ ...formData, phone: countryCode + phoneWithoutCode });
                }}
              >
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+39">🇮🇹 +39</option>
                <option value="+34">🇪🇸 +34</option>
                <option value="+31">🇳🇱 +31</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+81">🇯🇵 +81</option>
                <option value="+86">🇨🇳 +86</option>
                <option value="+91">🇮🇳 +91</option>
                <option value="+55">🇧🇷 +55</option>
                <option value="+52">🇲🇽 +52</option>
              </select>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="541 978 9236"
                className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select country code and enter phone number
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => {
                const prev = formData.status;
                const next = e.target.value;
                if (onStatusChange) onStatusChange('create', prev, next);
                setFormData({ ...formData, status: next });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Billing Address Section */}
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Billing Address</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.billing_address_line_1 || formData.street_address || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  billing_address_line_1: e.target.value,
                  street_address: e.target.value // Keep legacy field in sync
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                value={formData.billing_address_line_2 || ''}
                onChange={(e) => setFormData({ ...formData, billing_address_line_2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Apt, Suite, Unit, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.billing_city || formData.city || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    billing_city: e.target.value,
                    city: e.target.value // Keep legacy field in sync
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.billing_state || formData.state || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    billing_state: e.target.value,
                    state: e.target.value // Keep legacy field in sync
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.billing_zip_code || formData.zip_code || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    billing_zip_code: e.target.value,
                    zip_code: e.target.value // Keep legacy field in sync
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Tags Section */}
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Customer Tags</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {customerTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      const currentTags = formData.tags || [];
                      const isSelected = currentTags.includes(tag.name);
                      const newTags = isSelected
                        ? currentTags.filter(t => t !== tag.name)
                        : [...currentTags, tag.name];
                      setFormData({ ...formData, tags: newTags });
                    }}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      (formData.tags || []).includes(tag.name)
                        ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                    style={{ backgroundColor: (formData.tags || []).includes(tag.name) ? tag.color + '20' : undefined }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {(formData.tags || []).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).map(tagName => {
                    const tag = customerTags.find(t => t.name === tagName);
                    return (
                      <span
                        key={tagName}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                        style={{ backgroundColor: tag?.color + '20' || '#e5e7eb' }}
                      >
                        {tagName}
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = (formData.tags || []).filter(t => t !== tagName);
                            setFormData({ ...formData, tags: newTags });
                          }}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portal Invitation Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="invite-to-portal"
            checked={formData.invite_to_portal}
            onChange={(e) => setFormData({ ...formData, invite_to_portal: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="invite-to-portal" className="ml-2 block text-sm text-gray-900">
            Invite to Customer Portal
            {formData.email ? (
              <span className="text-gray-500 text-xs block">
                Will send magic link to {formData.email}
              </span>
            ) : (
              <span className="text-gray-500 text-xs block">
                Email address required for portal invitation
              </span>
            )}
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setShowCreateForm(false);
              resetForm();
            }}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Create Customer
          </button>
        </div>
      </form>
    </div>
  </div>
);

// Customer Edit Form Component
const CustomerEditForm = ({ formData, setFormData, handleUpdateCustomer, setShowEditForm, resetForm, onStatusChange, selectedCustomer, customerTags }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Edit Customer</h3>
        <button
          onClick={() => {
            setShowEditForm(false);
            resetForm();
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleUpdateCustomer} className="space-y-4">
        {/* Customer Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Type *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['RESIDENTIAL', 'COMMERCIAL', 'PROPERTY_MANAGEMENT'].map((type) => (
              <label key={type} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="customer_type"
                  value={type}
                  checked={formData.customer_type === type}
                  onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                  className="text-primary-600"
                />
                <span className="text-sm font-medium">
                  {type === 'RESIDENTIAL' ? 'Residential' :
                   type === 'COMMERCIAL' ? 'Commercial' :
                   'Property Management'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => {
                const prev = formData.status;
                const next = e.target.value;
                if (onStatusChange) onStatusChange('edit', prev, next);
                setFormData({ ...formData, status: next });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Billing Address Section */}
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Billing Address</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.billing_address_line_1 || formData.street_address || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  billing_address_line_1: e.target.value,
                  street_address: e.target.value // Keep legacy field in sync
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                value={formData.billing_address_line_2 || ''}
                onChange={(e) => setFormData({ ...formData, billing_address_line_2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Apt, Suite, Unit, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.billing_city || formData.city || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    billing_city: e.target.value,
                    city: e.target.value // Keep legacy field in sync
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.billing_state || formData.state || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    billing_state: e.target.value,
                    state: e.target.value // Keep legacy field in sync
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.billing_zip_code || formData.zip_code || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    billing_zip_code: e.target.value,
                    zip_code: e.target.value // Keep legacy field in sync
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Tags Section */}
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Customer Tags</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {customerTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      const currentTags = formData.tags || [];
                      const isSelected = currentTags.includes(tag.name);
                      const newTags = isSelected
                        ? currentTags.filter(t => t !== tag.name)
                        : [...currentTags, tag.name];
                      setFormData({ ...formData, tags: newTags });
                    }}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      (formData.tags || []).includes(tag.name)
                        ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                    style={{ backgroundColor: (formData.tags || []).includes(tag.name) ? tag.color + '20' : undefined }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {(formData.tags || []).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).map(tagName => {
                    const tag = customerTags.find(t => t.name === tagName);
                    return (
                      <span
                        key={tagName}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                        style={{ backgroundColor: tag?.color + '20' || '#e5e7eb' }}
                      >
                        {tagName}
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = (formData.tags || []).filter(t => t !== tagName);
                            setFormData({ ...formData, tags: newTags });
                          }}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Service Addresses Section */}
        <div className="border-t pt-4">
          <AddressManager
            customer={selectedCustomer}
            onAddressesChange={(addresses) => {
              // Optional: Handle address changes if needed
              console.log('Service addresses updated:', addresses);
            }}
          />
        </div>

        {/* Portal Invitation Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="edit-invite-to-portal"
            checked={formData.invite_to_portal}
            onChange={(e) => setFormData({ ...formData, invite_to_portal: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="edit-invite-to-portal" className="ml-2 block text-sm text-gray-900">
            {selectedCustomer?.portal_account_id ? 'Has Customer Portal Access' : 'Invite to Customer Portal'}
            {formData.email ? (
              <span className="text-gray-500 text-xs block">
                {selectedCustomer?.portal_account_id
                  ? `Portal account linked to ${formData.email}`
                  : `Will send magic link to ${formData.email}`
                }
              </span>
            ) : (
              <span className="text-gray-500 text-xs block">
                Email address required for portal invitation
              </span>
            )}
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setShowEditForm(false);
              resetForm();
            }}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Update Customer
          </button>
        </div>
      </form>
    </div>
  </div>
);

// Customer Profile Modal Component
const CustomerProfileModal = ({ selectedCustomer, setShowProfileModal, jobs, quotes, invoices, communications, serviceAgreements, getInitials, formatPhoneNumber, navigate, openEditForm, user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCommunicationForm, setShowCommunicationForm] = useState(false);
  const [communicationForm, setCommunicationForm] = useState({
    type: 'call',
    direction: 'outbound',
    subject: '',
    content: '',
    outcome: ''
  });

  if (!selectedCustomer) return null;

  const customerJobs = jobs.filter(job => job.customer_id === selectedCustomer.id);
  const customerQuotes = quotes.filter(quote => quote.customer_id === selectedCustomer.id);
  const customerInvoices = invoices.filter(invoice => invoice.customer_id === selectedCustomer.id);
  const customerCommunications = communications.filter(comm => comm.customer_id === selectedCustomer.id);
  const customerAgreements = serviceAgreements.filter(agreement => agreement.customer_id === selectedCustomer.id);

  // Communication logging function
  const logCommunication = async () => {
    try {
      const response = await supaFetch('customer_communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: user.company_id,
          customer_id: selectedCustomer.id,
          communication_type: (communicationForm.type || 'note').toString().toLowerCase(),
          direction: communicationForm.direction || 'outbound',
          subject: communicationForm.subject || null,
          content: communicationForm.content || '',
          status: 'completed',
          completed_at: new Date().toISOString(),
          created_by: user.id
        })
      }, user.company_id);

      if (response.ok) {
        setShowCommunicationForm(false);
        setCommunicationForm({
          type: 'call',
          direction: 'outbound',
          subject: '',
          content: '',
          outcome: ''
        });
        // Reload communications
        window.location.reload(); // Simple reload for now
      }
    } catch (error) {
      console.error('Error logging communication:', error);
    }
  };

  // Enhanced activity timeline with communications
  const activities = [
    ...customerQuotes.map(q => ({ type: 'quote', data: q, date: new Date(q.created_at) })),
    ...customerJobs.map(j => ({ type: 'job', data: j, date: new Date(j.created_at) })),
    ...customerInvoices.map(i => ({ type: 'invoice', data: i, date: new Date(i.created_at) })),
    ...customerCommunications.map(c => ({ type: 'communication', data: c, date: new Date(c.completed_at || c.created_at) }))
  ].sort((a, b) => b.date - a.date);

  // Calculate enhanced analytics
  const totalRevenue = customerInvoices
    .filter(inv => inv.invoice_status === 'PAID')
    .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);

  const lastCommunication = customerCommunications.length > 0
    ? customerCommunications.reduce((latest, comm) =>
        new Date(comm.completed_at || comm.created_at) > new Date(latest.completed_at || latest.created_at)
          ? comm : latest
      )
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Enhanced Header with Quick Actions */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xl font-medium text-primary-600">
                {getInitials(selectedCustomer.name)}
              </span>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {selectedCustomer.autoTags && selectedCustomer.autoTags.map(tag => (
                  <span key={tag} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {tag}
                  </span>
                ))}
                {selectedCustomer.customer_type && (
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedCustomer.customer_type === 'COMMERCIAL'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedCustomer.customer_type}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>Customer since: {selectedCustomer.customer_since || 'Unknown'}</span>
                {lastCommunication && (
                  <span>Last contact: {new Date(lastCommunication.completed_at || lastCommunication.created_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick Communication Actions */}
            <button
              onClick={() => setShowCommunicationForm(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PhoneIcon className="w-4 h-4 mr-2" />
              Log Call
            </button>
            <button
              onClick={() => openEditForm(selectedCustomer)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setShowProfileModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: EyeIcon },
              { id: 'communications', name: 'Communications', icon: PhoneIcon, count: customerCommunications.length },
              { id: 'services', name: 'Service History', icon: BriefcaseIcon, count: customerJobs.length },
              { id: 'agreements', name: 'Agreements', icon: DocumentTextIcon, count: customerAgreements.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Communication Form Modal */}
        {showCommunicationForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Log Communication</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={communicationForm.type}
                    onChange={(e) => setCommunicationForm(prev => ({ ...prev, type: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="CALL">Phone Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">Meeting</option>
                    <option value="NOTE">Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Direction</label>
                  <select
                    value={communicationForm.direction}
                    onChange={(e) => setCommunicationForm(prev => ({ ...prev, direction: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="outbound">Outbound (We contacted them)</option>
                    <option value="inbound">Inbound (They contacted us)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={communicationForm.subject}
                    onChange={(e) => setCommunicationForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Brief subject or reason for contact"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={communicationForm.content}
                    onChange={(e) => setCommunicationForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Details of the communication..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Outcome</label>
                  <select
                    value={communicationForm.outcome}
                    onChange={(e) => setCommunicationForm(prev => ({ ...prev, outcome: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select outcome...</option>
                    <option value="interested">Customer Interested</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="callback_requested">Callback Requested</option>
                    <option value="quote_requested">Quote Requested</option>
                    <option value="scheduled_service">Service Scheduled</option>
                    <option value="complaint">Complaint/Issue</option>
                    <option value="compliment">Compliment/Praise</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowCommunicationForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={logCommunication}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                >
                  Save Communication
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex h-[calc(90vh-180px)]">
          {/* Left Panel - Contact & Summary */}
          <div className="w-1/3 border-r p-6 overflow-y-auto">
            {/* Contact Info */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {selectedCustomer.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <a href={`tel:${selectedCustomer.phone}`} className="text-primary-600 hover:text-primary-800">
                      {formatPhoneNumber(selectedCustomer.phone)}
                    </a>
                  </div>
                )}
                {selectedCustomer.email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <a href={`mailto:${selectedCustomer.email}`} className="text-primary-600 hover:text-primary-800">
                      {selectedCustomer.email}
                    </a>
                  </div>
                )}
                {selectedCustomer.street_address && (
                  <div className="flex items-start">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(`${selectedCustomer.street_address}, ${selectedCustomer.city}, ${selectedCustomer.state} ${selectedCustomer.zip_code}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800"
                    >
                      {selectedCustomer.street_address}<br />
                      {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zip_code}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Customer Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div><strong>{selectedCustomer.totalJobs || 0}</strong> jobs completed</div>
                <div><strong>${(selectedCustomer.totalRevenue || 0).toLocaleString()}</strong> total revenue</div>
                {selectedCustomer.daysSinceLastService && (
                  <div>Last serviced <strong>{selectedCustomer.daysSinceLastService} days ago</strong></div>
                )}
                <div>Average job value: <strong>${(selectedCustomer.avgJobValue || 0).toLocaleString()}</strong></div>
                {selectedCustomer.outstandingBalance > 0 && (
                  <div className="text-red-600">Outstanding balance: <strong>${selectedCustomer.outstandingBalance.toLocaleString()}</strong></div>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Customer Rating</h4>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(selectedCustomer.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-lg font-medium text-gray-900">{(selectedCustomer.rating || 0).toFixed(1)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  navigate(`/quotes?new=quote&customer=${selectedCustomer.id}`);
                }}
                className="w-full btn-primary text-sm"
              >
                Create Quote
              </button>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  navigate(`/jobs?customer=${selectedCustomer.id}`);
                }}
                className="w-full btn-secondary text-sm"
              >
                Schedule Job
              </button>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  openEditForm(selectedCustomer);
                }}
                className="w-full btn-secondary text-sm"
              >
                Edit Customer
              </button>
              {selectedCustomer.email && !selectedCustomer.has_portal_account && (
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    // eslint-disable-next-line no-undef
                    handleInviteToPortal(selectedCustomer);
                  }}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm"
                >
                  Invite to Portal
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Tabbed Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enhanced Summary Stats */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Analytics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-900">{customerJobs.length}</div>
                      <div className="text-sm text-blue-600">Total Jobs</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-900">${totalRevenue.toLocaleString()}</div>
                      <div className="text-sm text-green-600">Total Revenue</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-900">{customerCommunications.length}</div>
                      <div className="text-sm text-purple-600">Communications</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-900">{customerAgreements.filter(a => a.status === 'active').length}</div>
                      <div className="text-sm text-orange-600">Active Agreements</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Timeline */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {activities.slice(0, 8).map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'communication' ? 'bg-blue-100' :
                          activity.type === 'job' ? 'bg-green-100' :
                          activity.type === 'quote' ? 'bg-yellow-100' : 'bg-purple-100'
                        }`}>
                          {activity.type === 'communication' && <PhoneIcon className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'job' && <BriefcaseIcon className="w-4 h-4 text-green-600" />}
                          {activity.type === 'quote' && <DocumentTextIcon className="w-4 h-4 text-yellow-600" />}
                          {activity.type === 'invoice' && <BanknotesIcon className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.type === 'communication' && `${activity.data.communication_type} - ${activity.data.subject}`}
                            {activity.type === 'job' && activity.data.title}
                            {activity.type === 'quote' && `Quote: ${activity.data.title}`}
                            {activity.type === 'invoice' && `Invoice: ${activity.data.invoice_number}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.date.toLocaleDateString()}
                            {activity.type === 'communication' && activity.data.outcome && ` • ${activity.data.outcome}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'communications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Communication History</h3>
                  <button
                    onClick={() => setShowCommunicationForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Log Communication
                  </button>
                </div>

                {customerCommunications.length > 0 ? (
                  <div className="space-y-4">
                    {customerCommunications.map((comm) => (
                      <div key={comm.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              comm.communication_type === 'call' ? 'bg-blue-100' :
                              comm.communication_type === 'email' ? 'bg-green-100' :
                              comm.communication_type === 'sms' ? 'bg-yellow-100' : 'bg-purple-100'
                            }`}>
                              {comm.communication_type === 'call' && <PhoneIcon className="w-5 h-5 text-blue-600" />}
                              {comm.communication_type === 'email' && <EnvelopeIcon className="w-5 h-5 text-green-600" />}
                              {comm.communication_type === 'sms' && <PhoneIcon className="w-5 h-5 text-yellow-600" />}
                              {comm.communication_type === 'meeting' && <CalendarIcon className="w-5 h-5 text-purple-600" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium text-gray-900">{comm.subject}</h4>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  comm.direction === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {comm.direction}
                                </span>
                                {comm.outcome && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                    {comm.outcome.replace('_', ' ')}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{comm.content}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>{new Date(comm.completed_at || comm.created_at).toLocaleString()}</span>
                                {comm.created_by_profile && (
                                  <span>by {comm.created_by_profile.first_name} {comm.created_by_profile.last_name}</span>
                                )}
                                {comm.duration_minutes > 0 && (
                                  <span>{comm.duration_minutes} minutes</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PhoneIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No communications yet</h3>
                    <p className="text-gray-600 mb-4">Start tracking communications with this customer</p>
                    <button
                      onClick={() => setShowCommunicationForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Log First Communication
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Service History</h3>
                {customerJobs.length > 0 ? (
                  <div className="space-y-4">
                    {customerJobs.map(job => (
                      <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{job.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{new Date(job.created_at).toLocaleDateString()}</span>
                              <span>${(job.total_amount || 0).toLocaleString()}</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                job.job_status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                job.job_status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {job.job_status}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No service history</h3>
                    <p className="text-gray-600 mb-4">This customer hasn't had any services yet</p>
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        navigate(`/quotes?new=quote&customer=${selectedCustomer.id}`);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Create First Quote
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'agreements' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Service Agreements</h3>
                  <button
                    onClick={() => alert('COMING SOON: Service agreement creation')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Agreement
                  </button>
                </div>

                {customerAgreements.length > 0 ? (
                  <div className="space-y-4">
                    {customerAgreements.map((agreement) => (
                      <div key={agreement.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{agreement.agreement_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{agreement.agreement_type.replace('_', ' ').toUpperCase()}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{new Date(agreement.start_date).toLocaleDateString()} - {agreement.end_date ? new Date(agreement.end_date).toLocaleDateString() : 'Ongoing'}</span>
                              {agreement.monthly_fee > 0 && <span>${agreement.monthly_fee}/month</span>}
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                agreement.status === 'active' ? 'bg-green-100 text-green-800' :
                                agreement.status === 'expired' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {agreement.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No service agreements</h3>
                    <p className="text-gray-600 mb-4">Create maintenance contracts and service agreements</p>
                    <button
                      onClick={() => alert('COMING SOON: Service agreement creation')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create First Agreement
                    </button>
                  </div>
                )}
              </div>
            )}

              {/* Quotes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Quotes ({customerQuotes.length})
                </h3>
                <div className="space-y-3">
                  {customerQuotes.slice(0, 5).map(quote => (
                    <div key={quote.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900">{quote.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(quote.created_at).toLocaleDateString()} • ${(quote.total_amount || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">{quote.status}</div>
                    </div>
                  ))}
                  {customerQuotes.length > 5 && (
                    <button
                      onClick={() => navigate(`/quotes?customer=${selectedCustomer.id}`)}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      View all {customerQuotes.length} quotes →
                    </button>
                  )}
                </div>
              </div>

              {/* Invoices */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <BanknotesIcon className="w-5 h-5 mr-2" />
                  Invoices ({customerInvoices.length})
                </h3>
                <div className="space-y-3">
                  {customerInvoices.slice(0, 5).map(invoice => (
                    <div key={invoice.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900">{invoice.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(invoice.created_at).toLocaleDateString()} • ${(invoice.total_amount || 0).toLocaleString()}
                      </div>
                      <div className={`text-xs ${invoice.invoice_status === 'PAID' ? 'text-green-600' : 'text-red-600'}`}>
                        {invoice.invoice_status}
                      </div>
                    </div>
                  ))}
                  {customerInvoices.length > 5 && (
                    <button
                      onClick={() => navigate(`/invoices?customer=${selectedCustomer.id}`)}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      View all {customerInvoices.length} invoices →
                    </button>
                  )}
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {activities.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                      <div className="ml-3">
                        <div className="text-sm text-gray-900">
                          {activity.type === 'quote' && `Quote "${activity.data.title}" created`}
                          {activity.type === 'job' && `Job "${activity.data.title}" scheduled`}
                          {activity.type === 'invoice' && `Invoice "${activity.data.title}" ${activity.data.invoice_status?.toLowerCase()}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {activity.date.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const Customers = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  // Core data
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [customerTags, setCustomerTags] = useState([]);
  const [serviceAgreements, setServiceAgreements] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive, vip
  const [viewMode, setViewMode] = useState(() => {
    try { return localStorage.getItem('customersViewMode') || 'table'; } catch { return 'table'; }
  }); // table, cards, map
  useEffect(() => { try { localStorage.setItem('customersViewMode', viewMode); } catch {} }, [viewMode]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [noEmailOnly, setNoEmailOnly] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({ city: '', state: '', tag: '' });
  // Manage Views modal
  const [showManageViews, setShowManageViews] = useState(false);
  const [renameDraft, setRenameDraft] = useState({ name: '', newName: '' });

  // Status modal + history state
  // Debounced search (moved earlier to avoid temporal dead zone)
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);
  // Reset pagination when filters/search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);


  const [showStatusReasonModal, setShowStatusReasonModal] = useState(false);
  // Load status history for selected
  const loadStatusHistory = async (customerId) => {

    try {
      const res = await supaFetch(`customers_status_history?select=*&customer_id=eq.${customerId}&order=changed_at.desc`, { method: 'GET' }, user.company_id);
      if (res.ok) {
        const data = await res.json();
        setStatusHistory(data || []);
      }
    } catch (e) {
      console.error('Failed to load status history', e);

    }
  };

  const [pendingStatus, setPendingStatus] = useState(null); // 'suspended' | 'do_not_service' | null
  const [pendingFormContext, setPendingFormContext] = useState(null); // 'create' | 'edit'
  const [prevStatus, setPrevStatus] = useState('active');
  const [statusReason, setStatusReason] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);

  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Form data
  const [formData, setFormData] = useState({
    // Customer type determines which name fields to show
    type: 'residential', // Industry standard: lowercase in DB (residential, commercial, industrial)

    // Name fields - conditional based on type
    first_name: '', // For residential customers
    last_name: '', // For residential customers
    company_name: '', // For commercial customers

    // Contact info
    email: '',
    phone: '',

    // Portal invitation
    invite_to_portal: false,

    // Legacy address fields (for backward compatibility)
    street_address: '',
    city: '',
    state: '',
    zip_code: '',

    // New billing address fields
    billing_address_line_1: '',
    billing_address_line_2: '',
    billing_city: '',
    billing_state: '',
    billing_zip_code: '',

    // Status
    status: 'active', // Industry standard: lowercase in DB

    // Tags and notes
    tags: [],
    notes: ''
  });

  useEffect(() => {
    if (user?.company_id) {
      loadAllData();
    }
  }, [user?.company_id]);

  useEffect(() => {
    // Handle URL parameters
    const params = new URLSearchParams(routerLocation.search);
    const q = params.get('q');
    const isNew = params.get('new') === 'customer';
    if (q && q !== searchTerm) setSearchTerm(q);
    if (isNew && !showCreateForm) setShowCreateForm(true);
  }, [routerLocation.search]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCustomers(),
        loadJobs(),
        loadQuotes(),
        loadInvoices(),
        loadCommunications(),
        loadCustomerTags(),
        loadServiceAgreements()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('error', 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      // ✅ INDUSTRY STANDARD: Load customers with proper tag relationships
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          customer_tag_assignments(
            tag_id,
            customer_tags(
              id,
              name,
              color,
              description
            )
          )
        `)
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading customers:', error);
        setCustomers([]);
      } else {
        const normalized = (data || []).map(c => {
          // Extract tags from the proper relationship
          const tags = (c.customer_tag_assignments || [])
            .map(assignment => assignment.customer_tags?.name)
            .filter(Boolean);

          // Determine customer type from tags
          const customerType = tags.find(tag =>
            ['residential', 'commercial', 'industrial', 'government'].includes(tag.toLowerCase())
          ) || c.customer_type || 'residential';

          // Create unified name field for display
          const displayName = c.display_name ||
            (c.company_name && c.company_name.trim()) ||
            (c.first_name && c.last_name ? `${c.first_name} ${c.last_name}`.trim() : null) ||
            (c.first_name && c.first_name.trim()) ||
            (c.last_name && c.last_name.trim()) ||
            'Unnamed Customer';

          return {
            ...c,
            name: displayName, // Add unified name field for compatibility
            status: (c.status || 'active').toString().toLowerCase(),
            tags: tags,
            customer_type: customerType.toUpperCase(),
            // Set default relationship info for compatibility
            relationship_type: 'client',
            relationship_status: 'active',
            has_portal_account: false
          };
        });
        console.log('✅ Customers loaded successfully:', normalized.length, 'records');
        setCustomers(normalized);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    }
  };

  const loadJobs = async () => {
    try {
      // ✅ FIXED: Use lowercase enum values matching database schema
      const response = await supaFetch('work_orders?select=*&status=in.(scheduled,in_progress,completed,cancelled,invoiced)&order=created_at.desc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setJobs(data || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    }
  };

  const loadQuotes = async () => {
    try {
      // ✅ FIXED: Use lowercase enum values matching database schema
      const response = await supaFetch('work_orders?select=*&status=in.(draft,sent,approved,rejected)&order=created_at.desc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setQuotes(data || []);
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      // Use separate invoices table for the unified pipeline
      const response = await supaFetch('invoices?select=*&order=created_at.desc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data || []);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    }
  };

  const loadCommunications = async () => {
    try {
      // ✅ FIXED: Use newly created customer_communications table with proper joins
      const { data, error} = await supabase
        .from('customer_communications')
        .select('*, created_by_user:users!created_by(first_name,last_name)')
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading communications:', error);
        setCommunications([]);
      } else {
        console.log('✅ Communications loaded successfully:', data?.length || 0, 'records');
        setCommunications(data || []);
      }
    } catch (error) {
      console.error('Error loading communications:', error);
      setCommunications([]);
    }
  };

  const loadCustomerTags = async () => {
    try {
      // ✅ INDUSTRY STANDARD: Load customer tag definitions for the company
      const response = await supaFetch(`customer_tags?company_id=eq.${user.company_id}&select=*&order=name.asc`, { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setCustomerTags(data || []);
        console.log('✅ Customer tags loaded successfully:', data?.length || 0, 'tags');
      }
    } catch (error) {
      console.error('Error loading customer tags:', error);
      setCustomerTags([]);
    }
  };

  const loadServiceAgreements = async () => {
    try {
      // ✅ FIXED: Use newly created service_agreements table
      const response = await supaFetch('service_agreements?select=*&order=created_at.desc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setServiceAgreements(data || []);
      }
    } catch (error) {
      console.error('Error loading service agreements:', error);
      setServiceAgreements([]);
    }
  };

  // Calculate customer analytics with competitive features
  const getCustomerAnalytics = (customerId) => {
    const customerJobs = jobs.filter(job => job.customer_id === customerId);
    const customerQuotes = quotes.filter(quote => quote.customer_id === customerId);
    const customerInvoices = invoices.filter(invoice => invoice.customer_id === customerId);
    const customerCommunications = communications.filter(comm => comm.customer_id === customerId);
    const customerAgreements = serviceAgreements.filter(agreement => agreement.customer_id === customerId);

    const totalRevenue = customerInvoices
      .filter(inv => inv.invoice_status === 'PAID')
      .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);

    const outstandingBalance = customerInvoices
      .filter(inv => inv.invoice_status !== 'PAID')
      .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);

    const avgJobValue = customerJobs.length > 0
      ? totalRevenue / customerJobs.length
      : 0;

    const lastServiceDate = customerJobs.length > 0
      ? new Date(Math.max(...customerJobs.map(job => new Date(job.created_at))))
      : null;

    const daysSinceLastService = lastServiceDate
      ? Math.floor((new Date() - lastServiceDate) / (1000 * 60 * 60 * 24))
      : null;

    // Communication analytics
    const lastCommunication = customerCommunications.length > 0
      ? customerCommunications.reduce((latest, comm) =>
          new Date(comm.completed_at || comm.created_at) > new Date(latest.completed_at || latest.created_at)
            ? comm : latest
        )
      : null;

    const communicationStats = {
      totalCommunications: customerCommunications.length,
      callsCount: customerCommunications.filter(c => c.communication_type === 'call').length,
      emailsCount: customerCommunications.filter(c => c.communication_type === 'email').length,
      lastCommunicationType: lastCommunication?.communication_type,
      lastCommunicationDate: lastCommunication?.completed_at || lastCommunication?.created_at,
      daysSinceLastCommunication: lastCommunication
        ? Math.floor((new Date() - new Date(lastCommunication.completed_at || lastCommunication.created_at)) / (1000 * 60 * 60 * 24))
        : null
    };

    // Service agreement analytics
    const activeAgreements = customerAgreements.filter(a => a.status === 'active');
    const agreementStats = {
      totalAgreements: customerAgreements.length,
      activeAgreements: activeAgreements.length,
      agreementTypes: activeAgreements.map(a => a.agreement_type),
      monthlyRecurringRevenue: activeAgreements.reduce((sum, a) => sum + (parseFloat(a.monthly_fee) || 0), 0)
    };

    return {
      totalJobs: customerJobs.length,
      totalQuotes: customerQuotes.length,
      totalInvoices: customerInvoices.length,
      totalRevenue,
      outstandingBalance,
      avgJobValue,
      lastServiceDate,
      daysSinceLastService,
      ...communicationStats,
      ...agreementStats
    };
  };

  // Enhanced customer data with analytics
  const enhancedCustomers = customers.map(customer => {
    const analytics = getCustomerAnalytics(customer.id);
    return {
      ...customer,
      ...analytics,
      // Calculate rating based on job completion and feedback
      rating: customer.rating || (analytics.totalJobs > 0 ? 4.5 : 0),
      // Determine VIP status
      isVIP: analytics.totalRevenue > 10000 || analytics.totalJobs > 10,
      // Auto-assign tags
      autoTags: [
        analytics.totalRevenue > 10000 ? 'VIP' : null,
        analytics.totalJobs > 5 ? 'Repeat' : null,
        analytics.totalJobs === 0 ? 'New' : null,
        customer.tags?.includes('Commercial') ? 'Commercial' : 'Residential'
      ].filter(Boolean)
    };
  });

  // Filter customers
  const filteredCustomers = enhancedCustomers.filter(customer => {
    const term = debouncedSearch?.trim();
    const matchesSearch = !term ||
      customer.name?.toLowerCase().includes(term.toLowerCase()) ||
      customer.email?.toLowerCase().includes(term.toLowerCase()) ||
      customer.phone?.includes(term) ||
      customer.street_address?.toLowerCase().includes(term.toLowerCase()) ||
      customer.autoTags?.some(tag => tag.toLowerCase().includes(term.toLowerCase()));

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && customer.status.toLowerCase() === 'active') ||
      (statusFilter === 'inactive' && customer.status.toLowerCase() === 'inactive') ||
      (statusFilter === 'vip' && customer.isVIP);

    const matchesQuick = !noEmailOnly || !customer.email;

    const af = advancedFilters;
    const matchesAdvanced = (!af.city || (customer.city||'').toLowerCase().includes(af.city.toLowerCase())) &&
      (!af.state || (customer.state||'').toLowerCase().startsWith(af.state.toLowerCase())) &&
      (!af.tag || (customer.autoTags||[]).some(t => (t||'').toLowerCase().includes(af.tag.toLowerCase())));

    return matchesSearch && matchesStatus && matchesQuick && matchesAdvanced;
  });

  // Calculate summary statistics
  const summaryStats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status.toLowerCase() === 'active').length,
    avgRating: customers.length > 0
      ? customers.reduce((sum, c) => sum + (c.rating || 0), 0) / customers.length
      : 0,
    totalRevenue: enhancedCustomers.reduce((sum, c) => sum + c.totalRevenue, 0)
  };

  // Utility functions
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const resetForm = () => {
    setFormData({
      // Customer type
      type: 'residential',

      // Name fields
      first_name: '',
      last_name: '',
      company_name: '',

      // Contact info
      email: '',
      phone: '',

      // Portal invitation
      invite_to_portal: false,

      // Legacy address fields (for backward compatibility)
      street_address: '',
      city: '',
      state: '',
      zip_code: '',

      // New billing address fields
      billing_address_line_1: '',
      billing_address_line_2: '',
      billing_city: '',
      billing_state: '',
      billing_zip_code: '',

      // Status
      status: 'active',

      // Tags and notes
      tags: [],
      notes: ''
    });
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Bulk selection state and keyboard shortcut (placed after formData for hooks order)
  const [selectedCustomers, setSelectedCustomers] = useState({});
  const searchRef = useRef(null);
  useEffect(()=>{
    const onKey = (e)=>{ if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[]);

  // Global shortcuts
  // Close Manage Views with Escape
  useEffect(()=>{
    const onEsc = (e)=>{
      if (e.key === 'Escape') setShowManageViews(false);
    };
    window.addEventListener('keydown', onEsc);
    return ()=> window.removeEventListener('keydown', onEsc);
  }, [setShowManageViews]);

  useEffect(()=>{
    const onKey = (e)=>{
      if (e.target && ['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'n') { e.preventDefault(); setShowCreateForm(true); }
      if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setViewMode(m => m==='table' ? 'cards' : m==='cards' ? 'map' : 'table');
      }
      if (e.key === ',' ) { e.preventDefault(); setPage(p=>Math.max(1, p-1)); }
      if (e.key === '.' ) { e.preventDefault(); setPage(p=>p+1); }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[]);



  const getStatusBadge = (customer) => {
    if (customer.isVIP) {
      return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'VIP' };
    }
    switch ((customer.status || 'inactive').toString().toLowerCase()) {
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' };
      case 'inactive':
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' };
    }
  };

  // Pagination and saved views
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    try { return Number(localStorage.getItem('customersPageSize')) || 25; } catch { return 25; }
  });
  useEffect(() => { try { localStorage.setItem('customersPageSize', String(pageSize)); } catch {} }, [pageSize]);
  const [totalCustomersCount, setTotalCustomersCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil((totalCustomersCount || customers.length || 1) / pageSize));

  // Debounced search moved earlier to avoid temporal dead zone

  // Saved views
  const [savedViews, setSavedViews] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customerSavedViews') || '[]'); } catch { return []; }
  });

  const saveCurrentView = useCallback((name) => {
    if (!name) return;
    const meta = { name, statusFilter, search: searchTerm, pageSize, viewMode, advancedFilters, noEmailOnly };
    const next = [...savedViews.filter(v=>v.name!==name), meta];
    setSavedViews(next);
    try { localStorage.setItem('customerSavedViews', JSON.stringify(next)); } catch {}
  }, [savedViews, statusFilter, searchTerm, pageSize, viewMode, advancedFilters, noEmailOnly]);

  const applyView = useCallback((name) => {
    const v = savedViews.find(v=>v.name===name);
    if (!v) return;
    setStatusFilter(v.statusFilter ?? 'all');
    setSearchTerm(v.search ?? '');
    if (v.viewMode) setViewMode(v.viewMode);
    if (v.pageSize) setPageSize(v.pageSize);
    if (typeof v.noEmailOnly === 'boolean') setNoEmailOnly(v.noEmailOnly);
    if (v.advancedFilters) setAdvancedFilters({ city: '', state: '', tag: '', ...v.advancedFilters });
    try { localStorage.setItem('customerLastView', name); } catch {}
    setPage(1);
  }, [savedViews, setStatusFilter, setSearchTerm, setViewMode, setPageSize, setNoEmailOnly, setAdvancedFilters, setPage]);

  const deleteView = useCallback((name) => {
    const next = savedViews.filter(v=>v.name!==name);
    setSavedViews(next);
    try { localStorage.setItem('customerSavedViews', JSON.stringify(next)); } catch {}
    try {
      const last = localStorage.getItem('customerLastView');
      if (last === name) localStorage.removeItem('customerLastView');
    } catch {}
  }, [savedViews]);

  useEffect(()=>{
    try {
      const last = localStorage.getItem('customerLastView');
      if (last) applyView(last);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const clearCurrentView = useCallback(() => {
    setStatusFilter('all');
    setSearchTerm('');
    setPage(1);
    try { localStorage.removeItem('customerLastView'); } catch {}
  }, []);

  const [saveViewName, setSaveViewName] = useState('');

  // Form handlers
  // Quick-save current view with timestamp (Shift+S) and Saved Views focus (Shift+V)
  useEffect(()=>{
    const onKey = (e)=>{
      if (e.shiftKey && (e.key === 'S' || e.key === 's')){
        e.preventDefault();
        const stamp = new Date().toLocaleString();
        const meta = { name: `View ${stamp}`, statusFilter, search: searchTerm, pageSize, viewMode, advancedFilters, noEmailOnly };
        const next = [...savedViews.filter(v=>v.name!==meta.name), meta];
        setSavedViews(next);
        try { localStorage.setItem('customerSavedViews', JSON.stringify(next)); } catch {}
      }
      if (e.shiftKey && (e.key === 'V' || e.key === 'v')){
        e.preventDefault();
        setShowManageViews(true);
      }
      // Guard: ignore when typing in form fields
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (['input','textarea','select'].includes(tag)) return;

      if (e.altKey && (e.key === 'V' || e.key === 'v')){
        e.preventDefault();
        const el = document.querySelector('select[aria-label="Saved Views"]');
        el?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [savedViews, statusFilter, searchTerm, pageSize, viewMode, advancedFilters, noEmailOnly]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      // ✅ SIMPLIFIED: Database now handles phone formatting automatically

      // ✅ INDUSTRY STANDARD: lowercase values in DB, conditional name fields
      const payload = {
        company_id: user.company_id,
        type: (formData.type || 'residential').toLowerCase(), // Industry standard: lowercase

        // Conditional name fields based on customer type
        first_name: formData.type === 'residential' ? (formData.first_name || null) : null,
        last_name: formData.type === 'residential' ? (formData.last_name || null) : null,
        company_name: (formData.type === 'commercial' || formData.type === 'industrial') ? (formData.company_name || null) : null,

        email: formData.email || null,
        phone: formData.phone || null, // Database trigger will format automatically
        mobile_phone: formData.mobile_phone || null,
        preferred_contact: formData.preferred_contact || 'phone',
        source: formData.source || 'manual_entry',
        notes: formData.notes || null,
        credit_limit: parseFloat(formData.credit_limit) || 0.00,
        payment_terms: formData.payment_terms || 'NET30',
        tax_exempt: Boolean(formData.tax_exempt),
        is_active: true, // Industry standard: new customers are active by default

        // Billing address fields (industry standard)
        billing_address_line_1: formData.billing_address_line_1 || null,
        billing_address_line_2: formData.billing_address_line_2 || null,
        billing_city: formData.billing_city || null,
        billing_state: formData.billing_state || null,
        billing_zip_code: formData.billing_zip_code || null,
        billing_country: formData.billing_country || 'United States'
      };

      // Create customer
      const customerResponse = await supaFetch('customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
      }, user.company_id);

      if (!customerResponse.ok) {
        const errText = await customerResponse.text().catch(()=> '');
        throw new Error(errText || 'Failed to create customer');
      }

      const created = await customerResponse.json();
      const customer = Array.isArray(created) ? created[0] : created;

      // Add customer tags (industry standard: proper tag assignment system)
      if (customer && (formData.type || (formData.tags && formData.tags.length > 0))) {
        try {
          const tagsToAssign = [];

          // Always add customer type as a tag
          if (formData.type) {
            tagsToAssign.push(formData.type.toLowerCase());
          }

          // Add any additional selected tags
          if (formData.tags && formData.tags.length > 0) {
            tagsToAssign.push(...formData.tags.map(tag => tag.toLowerCase()));
          }

          // Remove duplicates
          const uniqueTags = [...new Set(tagsToAssign)];

          for (const tagName of uniqueTags) {
            // Step 1: Find or create the tag
            let tagResponse = await supaFetch(`customer_tags?name=eq.${tagName}&company_id=eq.${user.company_id}`, {
              method: 'GET'
            }, user.company_id);

            let tagData = await tagResponse.json();
            let tagId;

            if (!tagData || tagData.length === 0) {
              // Create the tag if it doesn't exist
              const createTagResponse = await supaFetch('customer_tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  company_id: user.company_id,
                  name: tagName,
                  description: `${tagName.charAt(0).toUpperCase() + tagName.slice(1)} customer tag`,
                  color: tagName === 'commercial' ? '#3b82f6' :
                         tagName === 'industrial' ? '#f59e0b' :
                         tagName === 'vip' ? '#ef4444' : '#10b981'
                })
              }, user.company_id);

              const createdTag = await createTagResponse.json();
              tagId = Array.isArray(createdTag) ? createdTag[0].id : createdTag.id;
            } else {
              tagId = tagData[0].id;
            }

            // Step 2: Create the customer-tag assignment
            if (tagId) {
              await supaFetch('customer_tag_assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  customer_id: customer.id,
                  tag_id: tagId,
                  assigned_by: user.id
                })
              }, user.company_id);
            }
          }
        } catch (tagError) {
          console.warn('Failed to add customer tags (non-blocking):', tagError);
        }
      }

      // Optional: send portal invite via magic link if requested and email present
      if (formData.invite_to_portal && payload.email) {
        try {
          const { CustomerAuthService } = await import('../services/CustomerAuthService');
          await CustomerAuthService.sendMagicLink(payload.email);
        } catch (e) {
          console.warn('Portal invite failed (non-blocking):', e);
        }
      }

      showAlert('success', 'Customer created successfully!');
      setShowCreateForm(false);
      resetForm();
      await loadCustomers();

      const params = new URLSearchParams(routerLocation.search);
      const returnTo = params.get('return');
      if (returnTo === 'quotes') {
        navigate('/quotes?new=quote');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      showAlert('error', error.message || 'Failed to create customer');
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      // ✅ INDUSTRY STANDARD: Full customer update payload matching actual database schema
      const payload = {
        type: (formData.type || 'residential').toLowerCase(),

        // Conditional name fields based on customer type
        first_name: formData.type === 'residential' ? (formData.first_name || null) : null,
        last_name: formData.type === 'residential' ? (formData.last_name || null) : null,
        company_name: (formData.type === 'commercial' || formData.type === 'industrial') ? (formData.company_name || null) : null,

        email: formData.email || null,
        phone: formData.phone || null,
        mobile_phone: formData.mobile_phone || null,
        preferred_contact: formData.preferred_contact || 'phone',
        source: formData.source || selectedCustomer.source || 'manual_entry',
        notes: formData.notes || null,
        credit_limit: parseFloat(formData.credit_limit) || 0.00,
        payment_terms: formData.payment_terms || 'NET30',
        tax_exempt: Boolean(formData.tax_exempt),
        is_active: formData.status === 'active' || formData.is_active !== false,

        // Billing address fields
        billing_address_line_1: formData.billing_address_line_1 || null,
        billing_address_line_2: formData.billing_address_line_2 || null,
        billing_city: formData.billing_city || null,
        billing_state: formData.billing_state || null,
        billing_zip_code: formData.billing_zip_code || null,
        billing_country: formData.billing_country || 'United States'

        // Note: updated_by column doesn't exist in customers table
      };

      // Handle portal invitation for existing customers
      if (formData.invite_to_portal && !selectedCustomer.portal_account_id && formData.email) {
        try {
          const { CustomerAuthService } = await import('../services/CustomerAuthService');

          // Create portal account for existing customer
          const portalResult = await CustomerAuthService.addCustomerWithPortalAccount({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.billing_address_line_1 || formData.street_address
          }, user.company_id);

          if (portalResult.portalAccount) {
            // Update the customer record to link to portal account
            payload.portal_account_id = portalResult.portalAccount.id;
          }
        } catch (portalError) {
          console.error('Failed to create portal account:', portalError);
          showAlert('warning', 'Customer updated but portal invitation failed');
        }
      }

      console.log('🔄 Updating customer with payload:', payload);

      // Update customer record
      const response = await supaFetch(`customers?id=eq.${selectedCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, user.company_id);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('Customer update failed', { status: response.status, text, payload });
        showAlert('error', 'Failed to update customer');
        return;
      }

      // Update customer tags if customer_type changed (industry standard approach)
      if (formData.customer_type && formData.customer_type !== selectedCustomer.customer_type) {
        try {
          // Remove existing type tag assignments
          const typeTagNames = ['residential', 'commercial', 'industrial'];
          const existingTagsResponse = await supaFetch(`customer_tags?name=in.(${typeTagNames.join(',')})&company_id=eq.${user.company_id}`, {
            method: 'GET'
          }, user.company_id);

          const existingTags = await existingTagsResponse.json();
          const existingTagIds = existingTags.map(tag => tag.id);

          if (existingTagIds.length > 0) {
            await supaFetch(`customer_tag_assignments?customer_id=eq.${selectedCustomer.id}&tag_id=in.(${existingTagIds.join(',')})`, {
              method: 'DELETE'
            }, user.company_id);
          }

          // Add new type tag assignment (same logic as create)
          const tagName = formData.customer_type.toLowerCase();
          let tagResponse = await supaFetch(`customer_tags?name=eq.${tagName}&company_id=eq.${user.company_id}`, {
            method: 'GET'
          }, user.company_id);

          let tagData = await tagResponse.json();
          let tagId;

          if (!tagData || tagData.length === 0) {
            const createTagResponse = await supaFetch('customer_tags', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                company_id: user.company_id,
                name: tagName,
                description: `${formData.customer_type} customer type`,
                color: formData.customer_type === 'COMMERCIAL' ? '#3b82f6' :
                       formData.customer_type === 'INDUSTRIAL' ? '#f59e0b' : '#10b981'
              })
            }, user.company_id);

            const createdTag = await createTagResponse.json();
            tagId = Array.isArray(createdTag) ? createdTag[0].id : createdTag.id;
          } else {
            tagId = tagData[0].id;
          }

          if (tagId) {
            await supaFetch('customer_tag_assignments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer_id: selectedCustomer.id,
                tag_id: tagId,
                assigned_by: user.id
              })
            }, user.company_id);
          }
        } catch (tagError) {
          console.warn('Failed to update customer tags (non-blocking):', tagError);
        }
      }

      // Fetch refreshed row to confirm status persisted
      const checkRes = await supaFetch(`customers?id=eq.${selectedCustomer.id}&select=*`, { method: 'GET' }, user.company_id);
      const checkData = checkRes.ok ? await checkRes.json() : [];
      const refreshed = Array.isArray(checkData) ? checkData[0] : checkData;
      console.log('Customer updated OK. Refreshed row:', refreshed?.status, refreshed);

      showAlert('success', 'Customer updated successfully!');
      setShowEditForm(false);
      resetForm();
      await loadCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      showAlert('error', 'Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      const response = await supaFetch(`customers?id=eq.${customerId}`, {
        method: 'DELETE'
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Customer deleted successfully!');
        await loadCustomers();
      } else {
        const text = await response.text().catch(() => '');
        console.error('Delete customer failed:', response.status, text);
        showAlert('error', `Failed to delete customer (${response.status}). Check console for details.`);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      showAlert('error', 'Failed to delete customer');
    }
  };

  const handleInviteToPortal = async (customer) => {
    if (!customer.email) {
      showAlert('error', 'Customer must have an email address to be invited to the portal');
      return;
    }

    try {
      // Import CustomerAuthService dynamically
      const { CustomerAuthService } = await import('../services/CustomerAuthService');

      // Create portal account and send invitation
      const result = await CustomerAuthService.addCustomerWithPortalAccount(
        {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          street_address: customer.street_address,
          city: customer.city,
          state: customer.state,
          zip_code: customer.zip_code
        },
        user.company_id,
        user.id
      );

      if (result.portalAccount) {
        if (result.isExisting) {
          showAlert('success', 'Customer linked to existing portal account. Magic link sent!');
        } else {
          showAlert('success', 'Portal invitation sent! Customer can now access their portal via magic link.');
        }
        await loadCustomers(); // Refresh to show portal status
      } else {
        showAlert('error', 'Failed to create portal account');
      }
    } catch (error) {
      console.error('Error inviting customer to portal:', error);
      showAlert('error', error.message || 'Failed to invite customer to portal');
    }
  };

  const openEditForm = async (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      // Customer type
      type: customer.type || 'residential',

      // Name fields (conditional based on type)
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      company_name: customer.company_name || '',

      // Contact info
      email: customer.email || '',
      phone: customer.phone || '',
      mobile_phone: customer.mobile_phone || '',
      preferred_contact: customer.preferred_contact || 'phone',

      // Portal invitation
      invite_to_portal: !!customer.portal_account_id,

      // Billing address fields
      billing_address_line_1: customer.billing_address_line_1 || '',
      billing_address_line_2: customer.billing_address_line_2 || '',
      billing_city: customer.billing_city || '',
      billing_state: customer.billing_state || '',
      billing_zip_code: customer.billing_zip_code || '',
      billing_country: customer.billing_country || 'United States',

      // Financial fields
      credit_limit: customer.credit_limit || 0.00,
      payment_terms: customer.payment_terms || 'NET30',
      tax_exempt: customer.tax_exempt || false,

      // Other fields
      source: customer.source || 'manual_entry',
      status: customer.is_active ? 'active' : 'inactive',
      is_active: customer.is_active !== false,
      tags: customer.tags || [],
      notes: customer.notes || ''
    });
    await loadStatusHistory(customer.id);
    setShowEditForm(true);
  };

  const openProfileModal = (customer) => {
    setSelectedCustomer(customer);
    setShowProfileModal(true);
  };
  // Pagination slice derived from current filter (Phase 1 - Part 1)
  const displayTotalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.min(Math.max(1, page), displayTotalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, filteredCustomers.length);
  const pageCustomers = filteredCustomers.slice(pageStart, pageEnd);


  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Customers"
        subtitle="Manage customer relationships and service history with advanced analytics"
        icon={UserGroupIcon}
        gradient="blue"
        stats={[
          { label: 'Total', value: summaryStats.totalCustomers },
          { label: 'Active', value: summaryStats.activeCustomers },
          { label: 'Avg Rating', value: summaryStats.avgRating.toFixed(1) }
        ]}
        actions={[
          {
            label: 'Add Customer',
            icon: PlusIcon,
            onClick: () => setShowCreateForm(true)
          }
        ]}
      />

      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-md ${
          alert.type === 'success' ? 'bg-green-100 text-green-700' :
          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {alert.message}
        </div>
      )}




      {/* Modern Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernStatCard
          title="Total Customers"
          value={summaryStats.totalCustomers}
          icon={UserGroupIcon}
          gradient="blue"
          onClick={() => navigate('/customers')}

        />
        <ModernStatCard
          title="Active Customers"
          value={summaryStats.activeCustomers}
          icon={CheckCircleIcon}
          gradient="green"
          onClick={() => setStatusFilter('active')}
        />
        <ModernStatCard
          title="Average Rating"
          value={summaryStats.avgRating.toFixed(1)}
          icon={StarIcon}
          gradient="orange"
          onClick={() => navigate('/reports')}
        />
        <ModernStatCard
          title="Total Revenue"
          value={`$${summaryStats.totalRevenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          gradient="purple"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search by name, email, phone, address, tags... (press / to focus)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <button className={`btn-chip ${noEmailOnly ? 'chip-active' : ''}`} onClick={()=>setNoEmailOnly(v=>!v)}>No Email</button>
            <button className="btn-chip" onClick={()=>{ setStatusFilter('vip'); setPage(1); }}>VIP</button>
            <button className="btn-chip" onClick={()=>{ setStatusFilter('active'); setPage(1); }}>Active</button>
            <button className="btn-chip" onClick={()=>{ setStatusFilter('inactive'); setPage(1); }}>Inactive</button>
            <button className="btn-chip" onClick={()=>setShowAdvancedFilters(s=>!s)}>{showAdvancedFilters?'Hide':'More'} Filters</button>
          </div>

              {/* Saved Views dropdown + Clear */}
              <div className="flex items-center gap-2 ml-auto">
                <div className="relative">
                  <select
                    aria-label="Saved Views"
                    className="px-2 py-1 border rounded pr-8"
                    value=""
                    onChange={(e)=>{ const n=e.target.value; if (n) applyView(n); e.target.value=''; }}
                  >
                    <option value="">Saved Views…</option>
                    {savedViews.map(v=> (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <button className="btn-outline btn-xs" onClick={clearCurrentView}>Clear View</button>

	          <button className="btn-outline btn-xs" onClick={()=>setShowManageViews(true)}>Manage Views</button>

              </div>


            </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <input value={advancedFilters.city} onChange={e=>setAdvancedFilters(s=>({...s, city: e.target.value}))} placeholder="City" className="px-2 py-1 border rounded" />
              <input value={advancedFilters.state} onChange={e=>setAdvancedFilters(s=>({...s, state: e.target.value}))} placeholder="State" className="px-2 py-1 border rounded" />
              <input value={advancedFilters.tag} onChange={e=>setAdvancedFilters(s=>({...s, tag: e.target.value}))} placeholder="Tag contains" className="px-2 py-1 border rounded" />
            </div>
          )}

          </div>

          {/* Status Filter */}
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
              <option value="vip">VIP</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <TableCellsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded ${viewMode === 'cards' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <UserGroupIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}

              className={`p-2 rounded ${viewMode === 'map' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {Object.keys(selectedCustomers).length>0 && (
              <div className="flex items-center gap-2">
                <button className="btn-outline btn-xs" onClick={clearCurrentView}>Clear View</button>
                <button className="btn-outline btn-xs" onClick={()=>{
                  const ids = Object.keys(selectedCustomers);
                  const emails = filteredCustomers.filter(c=>ids.includes(c.id) && c.email).map(c=>c.email).join(',');
                  window.location.href = `mailto:${emails}`;
                }}>Email</button>
                <div className="hidden sm:flex items-center gap-2">
                  <input
                    value={saveViewName}
                    onChange={(e)=>setSaveViewName(e.target.value)}
                    placeholder="Save view name"
                    className="px-2 py-1 border rounded"
                  />
                  <button
                    className="btn-outline btn-xs"
                    onClick={()=>{ saveCurrentView(saveViewName||'My View'); setSaveViewName(''); }}
                  >Save View</button>
                </div>
                <button className="btn-outline btn-xs" onClick={()=>{
                  const rows = filteredCustomers.filter(c=>selectedCustomers[c.id]);
                  const header = ['Name','Email','Phone','Status'];
                  const csv = [header.join(',')].concat(rows.map(c=>[c.name,c.email||'',c.phone||'',c.status||''].map(x=>`"${(x||'').replaceAll('"','""')}"`).join(','))).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href=url; a.download='customers.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
                }}>Export CSV</button>
                <button className="btn-outline btn-xs" onClick={async ()=>{
                  const tag = prompt('Add tag to selected customers:');
                  if (!tag) return;
                  // Minimal batch update; patch one-by-one respecting RLS
                  for (const id of Object.keys(selectedCustomers)) {
                    const c = filteredCustomers.find(x=>x.id===id); if (!c) continue;
                    const nextTags = Array.from(new Set([...(c.tags||[]), tag]));
                    await supaFetch(`customers?id=eq.${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tags: nextTags }) }, user.company_id);
                  }
                  await loadCustomers();
                }}>Add Tag</button>
                <button className="btn-outline btn-xs" onClick={async ()=>{
                  const tag = prompt('Remove tag from selected customers:');
                  if (!tag) return;
                  for (const id of Object.keys(selectedCustomers)) {
                    const c = filteredCustomers.find(x=>x.id===id); if (!c) continue;
                    const nextTags = (c.tags||[]).filter(t=>t!==tag);
                    await supaFetch(`customers?id=eq.${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tags: nextTags }) }, user.company_id);
                  }
                  await loadCustomers();
                }}>Remove Tag</button>
              </div>
            )}
      {showStatusReasonModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Provide a reason</h3>
            <p className="text-sm text-gray-600 mb-3">Status will change to <strong>{pendingStatus}</strong>. Please provide a brief reason for audit.</p>
            <textarea
              className="w-full border rounded px-3 py-2 h-28"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Reason for status change"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn-secondary" onClick={() => {
                setShowStatusReasonModal(false);
                setStatusReason('');
                // revert selection
                setFormData(prev => ({ ...prev, status: prevStatus }));
              }}>Cancel</button>
              <button
                className="btn-primary"
                onClick={async () => {
                  // Apply reason to formData and persist if editing existing


                  const next = pendingStatus;
                  setShowStatusReasonModal(false);
                  const reason = statusReason;
                  setStatusReason('');

                  if (pendingFormContext === 'edit' && selectedCustomer) {
                    // Persist immediately
                    const allowed = {
                      name: formData.name,
                      phone: formData.phone || null,
                      email: formData.email || null,
                      address: formData.address || formData.street_address || null,
                      street_address: formData.street_address || formData.address || null,
                      city: formData.city || null,
                      state: formData.state || null,
                      zip_code: formData.zip_code || formData.postal_code || null,
                      notes: formData.notes || null,
                      status: next,
                      status_reason: reason,
                    };

                    const response = await supaFetch(`customers?id=eq.${selectedCustomer.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(allowed)
                    }, user.company_id);

                    if (!response.ok) {
                      const text = await response.text().catch(() => '');
                      console.error('Customer status change failed', { status: response.status, text, payload: allowed });
                      showAlert('error', 'Failed to update status');
                      setFormData(prev => ({ ...prev, status: prevStatus }));
                      return;
                    }

                    await loadCustomers();
                    await loadStatusHistory(selectedCustomer.id);
                    showAlert('success', 'Status updated');
                  } else {
                    // create form context: just set the reason and leave status as chosen
                    setFormData(prev => ({ ...prev, status: next }));
                  }
                }}
              >Confirm</button>
            </div>
          </div>
        </div>
      )}

            {filteredCustomers.length} customers found
          </div>
        </div>
      </div>

      {/* Customer Display */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <div className="mt-2 text-gray-600">Loading customers...</div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first customer</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Add Customer
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <CustomerTable
          filteredCustomers={pageCustomers}
          getStatusBadge={getStatusBadge}
          getInitials={getInitials}
          formatPhoneNumber={formatPhoneNumber}
          openProfileModal={openProfileModal}
          openEditForm={openEditForm}
          handleDeleteCustomer={handleDeleteCustomer}
          handleInviteToPortal={handleInviteToPortal}
          navigate={navigate}
          selectedCustomers={selectedCustomers}
          setSelectedCustomers={setSelectedCustomers}
        />
      ) : viewMode === 'cards' ? (
        <CustomerCards
          filteredCustomers={pageCustomers}
          getStatusBadge={getStatusBadge}
          getInitials={getInitials}
          formatPhoneNumber={formatPhoneNumber}
          openProfileModal={openProfileModal}
          navigate={navigate}
        />
      ) : (
        <CustomerMap
          filteredCustomers={pageCustomers}
          getInitials={getInitials}
        />
      )}

      {/* Pagination controls (all views) */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing {pageStart+1}-{Math.min(pageEnd, filteredCustomers.length)} of {filteredCustomers.length}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-xs" disabled={safePage===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
          <span className="text-sm">Page {safePage} / {displayTotalPages}</span>
          <button className="btn-secondary btn-xs" disabled={safePage===displayTotalPages} onClick={()=>setPage(p=>Math.min(displayTotalPages,p+1))}>Next</button>
          <select className="ml-2 border rounded px-2 py-1 text-sm" value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }}>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Modals */}
      {showCreateForm && (
        <CustomerForm
          formData={formData}
          setFormData={setFormData}
          handleCreateCustomer={handleCreateCustomer}
          setShowCreateForm={setShowCreateForm}
          resetForm={resetForm}
          customerTags={customerTags}
        />
      )}
      {showEditForm && (
        <CustomerEditForm
          formData={formData}
          setFormData={setFormData}
          handleUpdateCustomer={handleUpdateCustomer}
          setShowEditForm={setShowEditForm}
          resetForm={resetForm}
          selectedCustomer={selectedCustomer}
          customerTags={customerTags}
        />
      )}

      {showManageViews && (
        <>


      {/* Manage Views Modal */}

              <p className="text-xs text-gray-500">Press Esc to close</p>

        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={()=>setShowManageViews(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Manage Saved Views</h3>
              <button className="text-gray-400 hover:text-gray-600" onClick={()=>setShowManageViews(false)}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {savedViews.length === 0 ? (
              <div className="text-sm text-gray-600">No saved views yet.</div>
            ) : (
              <div className="divide-y">
                {savedViews.map(v => (
                  <div key={v.name} className="py-3 flex items-center gap-2">
                    <button className="underline" onClick={()=>applyView(v.name)}>{v.name}</button>
                    <span className="text-xs text-gray-400 ml-auto">{v.viewMode || 'table'} • {v.pageSize || 25}/page</span>
                    <button className="btn-outline btn-xs" onClick={()=>setRenameDraft({ name: v.name, newName: v.name })}>Rename</button>
                    <button className="btn-outline btn-xs text-red-600" onClick={()=>deleteView(v.name)}>Delete</button>
                  </div>
                ))}
              </div>
            )}

            {renameDraft.name && (
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <div className="text-sm font-medium mb-1">Rename View</div>
                <input
                  value={renameDraft.newName}
                  onChange={e=>setRenameDraft(s=>({ ...s, newName: e.target.value }))}
                  className="w-full px-2 py-1 border rounded"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button className="btn-secondary btn-xs" onClick={()=>setRenameDraft({ name: '', newName: '' })}>Cancel</button>
                  <button className="btn-primary btn-xs" onClick={() => {
                    if (!renameDraft.newName || renameDraft.newName === renameDraft.name) return;
                    const exists = savedViews.find(v => v.name === renameDraft.newName);
                    if (exists) { alert('A view with that name already exists'); return; }
                    const next = savedViews.map(v => v.name === renameDraft.name ? { ...v, name: renameDraft.newName } : v);
                    setSavedViews(next);
                    try { localStorage.setItem('customerSavedViews', JSON.stringify(next)); } catch {}
                    try {
                      const last = localStorage.getItem('customerLastView');
                      if (last === renameDraft.name) localStorage.setItem('customerLastView', renameDraft.newName);
                    } catch {}
                    setRenameDraft({ name: '', newName: '' });
                  }}>Save</button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button className="btn-secondary" onClick={()=>setShowManageViews(false)}>Close</button>
            </div>
          </div>
        </div>
        </>
      )}
      {showProfileModal && (
        <CustomerProfileModal
          selectedCustomer={selectedCustomer}
          setShowProfileModal={setShowProfileModal}
          jobs={jobs}
          quotes={quotes}
          invoices={invoices}
          communications={communications}
          serviceAgreements={serviceAgreements}
          getInitials={getInitials}
          formatPhoneNumber={formatPhoneNumber}
          navigate={navigate}
          openEditForm={openEditForm}
          user={user}
        />
      )}
    </div>
  );
};

export default Customers;
