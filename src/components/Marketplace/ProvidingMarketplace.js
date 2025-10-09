import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { getBrowseRequests } from '../../services/MarketplaceService';
import RequestCard from './RequestCard';
import ExpandableRequestCard from './ExpandableRequestCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ProvidingMarketplace = ({ onSubmitResponse, userResponses = {} }) => {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    loadAvailableRequests();
  }, [filter, selectedTags]);

  const loadAvailableRequests = async () => {
    setLoading(true);
    try {
      // Prepare filters
      const tagNames = selectedTags.map(tag => tag.name);
      const pricingFilters = [];
      const requestTypeFilters = [];

      if (filter === 'emergency') {
        requestTypeFilters.push('EMERGENCY');
      }

      console.log('🔍 ProvidingMarketplace: Loading requests with filters:', {
        companyId: user.company_id,
        tagNames,
        pricingFilters,
        requestTypeFilters,
        filter
      });

      // For Providing mode: show requests posted by OTHER companies (not current user's company)
      // This ensures contractors only see requests they can respond to, not their own
      const data = await getBrowseRequests(
        user.company_id,
        tagNames,
        pricingFilters,
        requestTypeFilters
      );

      console.log('✅ ProvidingMarketplace: Received data:', data);
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading available requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'available', name: 'Available', count: requests.filter(r => r.status === 'open').length },
    { id: 'emergency', name: 'Emergency', count: requests.filter(r => r.is_emergency).length },
    { id: 'all', name: 'All', count: requests.length }
  ];

  const filteredRequests = requests.filter(request => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.title?.toLowerCase().includes(searchLower) ||
        request.description?.toLowerCase().includes(searchLower) ||
        request.service_type?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-6 text-lg font-medium">🔄 Loading marketplace requests...</p>
        <p className="text-gray-500 mt-2">Finding the perfect opportunities for you</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">🏪 Service Marketplace</h2>
        <p className="text-lg text-gray-600">Discover opportunities and grow your business</p>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-2">
          {filters.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filter === filterOption.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200'
              }`}
            >
              {filterOption.name} <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">{filterOption.count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="🔍 Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 border-0 bg-white rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:shadow-xl transition-all duration-200 text-gray-900 placeholder-gray-500 w-80"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
          <div className="bg-white rounded-full p-6 w-24 h-24 mx-auto mb-6 shadow-lg">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {searchTerm ? '🔍 No matching requests' : '📭 No requests available'}
          </h3>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            {searchTerm
              ? 'Try adjusting your search criteria or browse all available requests.'
              : 'New opportunities are posted regularly. Check back soon for fresh service requests!'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRequests.map((request) => (
            <ExpandableRequestCard
              key={request.id}
              request={request}
              onResponseSubmitted={(response) => {
                // Refresh the requests list to show updated progress
                loadAvailableRequests();
                // Don't call onSubmitResponse here since InlineResponseForm handles its own submission
                // onSubmitResponse is for the old ResponseModal workflow
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProvidingMarketplace;
