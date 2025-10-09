// Subcontractor List - Admin view of all subcontractors
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const SubcontractorList = () => {
  const { user } = useUser();
  const [subcontractors, setSubcontractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    trade: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadSubcontractors();
  }, [filters]);

  const loadSubcontractors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.trade) params.append('trade', filters.trade);
      
      const response = await fetch(`/api/subcontractors?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubcontractors(data);
      }
    } catch (error) {
      console.error('Error loading subcontractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id) => {
    if (!confirm('Are you sure you want to archive this subcontractor?')) return;
    
    try {
      const response = await fetch(`/api/subcontractors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        loadSubcontractors();
      }
    } catch (error) {
      console.error('Error archiving subcontractor:', error);
    }
  };

  const getComplianceStatus = (subcontractor) => {
    const issues = [];
    
    if (subcontractor.insurance_expired) {
      issues.push('Insurance expired');
    }
    if (subcontractor.license_expired) {
      issues.push('License expired');
    }
    
    return issues;
  };

  const trades = [...new Set(subcontractors.map(s => s.trade).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcontractors</h1>
          <p className="text-gray-600">Manage your subcontractor network</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Subcontractor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trade</label>
            <select
              value={filters.trade}
              onChange={(e) => setFilters(prev => ({ ...prev, trade: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Trades</option>
              {trades.map(trade => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subcontractor List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {subcontractors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No subcontractors found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {subcontractors.map((subcontractor) => {
              const complianceIssues = getComplianceStatus(subcontractor);
              
              return (
                <div key={subcontractor.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {subcontractor.name?.charAt(0) || 'S'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {subcontractor.name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subcontractor.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {subcontractor.status}
                          </span>
                          {complianceIssues.length > 0 && (
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                          <span>{subcontractor.email}</span>
                          <span>•</span>
                          <span>{subcontractor.phone || 'No phone'}</span>
                          <span>•</span>
                          <span>{subcontractor.trade || 'No trade specified'}</span>
                        </div>
                        
                        {complianceIssues.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {complianceIssues.map((issue, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                >
                                  {issue}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.location.href = `/subcontractors/${subcontractor.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {/* Coming soon - edit functionality */}}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleArchive(subcontractor.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Form Modal - Coming soon */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Subcontractor</h3>
            <p className="text-gray-600 mb-4">Coming soon - Create subcontractor form</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcontractorList;
