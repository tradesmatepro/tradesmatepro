// Customer Leads - Marketplace-style service requests management
import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import {
  InboxIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const CustomerLeads = ({ serviceRequests, onRefresh }) => {
  const { user } = useUser();
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, open, accepted, emergency

  const handleAcceptLead = async (leadId) => {
    try {
      setLoading(true);
      
      // Accept the service request
      const response = await supaFetch(`service_requests?id=eq.${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          company_id: user.company_id,
          accepted_at: new Date().toISOString(),
          accepted_by: user.id
        })
      }, user.company_id);

      if (response.ok) {
        // Optionally create a work order from the service request
        // This would be implemented based on your workflow
        onRefresh();
        setSelectedLead(null);
      } else {
        throw new Error('Failed to accept lead');
      }
    } catch (error) {
      console.error('Error accepting lead:', error);
      alert('Failed to accept lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineLead = async (leadId) => {
    try {
      setLoading(true);
      
      const response = await supaFetch(`service_requests?id=eq.${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'declined'
        })
      }, user.company_id);

      if (response.ok) {
        onRefresh();
        setSelectedLead(null);
      } else {
        throw new Error('Failed to decline lead');
      }
    } catch (error) {
      console.error('Error declining lead:', error);
      alert('Failed to decline lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = serviceRequests.filter(lead => {
    switch (filter) {
      case 'open':
        return lead.status === 'open';
      case 'accepted':
        return lead.status === 'accepted' && lead.company_id === user.company_id;
      case 'emergency':
        return lead.emergency && lead.status === 'open';
      default:
        return true;
    }
  });

  const getStatusColor = (status, emergency = false) => {
    if (emergency && status === 'open') return 'bg-red-100 text-red-800';
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'declined': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const LeadCard = ({ lead }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-medium text-gray-900">{lead.title || lead.service_type}</h3>
            {lead.emergency && (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-4 w-4" />
              <span>{lead.service_location || 'Location not specified'}</span>
            </div>
            
            {lead.budget_range && (
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-4 w-4" />
                <span>Budget: {lead.budget_range}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4" />
              <span>
                {lead.preferred_date 
                  ? `Preferred: ${new Date(lead.preferred_date).toLocaleDateString()}`
                  : `Posted: ${new Date(lead.created_at).toLocaleDateString()}`
                }
              </span>
            </div>
          </div>

          {lead.description && (
            <p className="mt-3 text-sm text-gray-700 line-clamp-2">{lead.description}</p>
          )}
        </div>

        <div className="ml-4 flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status, lead.emergency)}`}>
            {lead.emergency && lead.status === 'open' ? 'EMERGENCY' : lead.status.toUpperCase()}
          </span>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedLead(lead)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              title="View Details"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Action buttons for open leads */}
      {lead.status === 'open' && !lead.company_id && (
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => handleAcceptLead(lead.id)}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            Accept Lead
          </button>
          <button
            onClick={() => handleDeclineLead(lead.id)}
            disabled={loading}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );

  const LeadDetailModal = ({ lead, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Lead Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{lead.title || lead.service_type}</h4>
            {lead.emergency && (
              <div className="flex items-center space-x-2 text-red-600 mb-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span className="font-medium">EMERGENCY REQUEST</span>
              </div>
            )}
          </div>

          {lead.description && (
            <div>
              <h5 className="font-medium text-gray-700 mb-1">Description</h5>
              <p className="text-gray-600">{lead.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-700 mb-1">Service Location</h5>
              <p className="text-gray-600">{lead.service_location || 'Not specified'}</p>
            </div>

            {lead.budget_range && (
              <div>
                <h5 className="font-medium text-gray-700 mb-1">Budget Range</h5>
                <p className="text-gray-600">{lead.budget_range}</p>
              </div>
            )}

            {lead.preferred_date && (
              <div>
                <h5 className="font-medium text-gray-700 mb-1">Preferred Date</h5>
                <p className="text-gray-600">{new Date(lead.preferred_date).toLocaleDateString()}</p>
              </div>
            )}

            <div>
              <h5 className="font-medium text-gray-700 mb-1">Posted</h5>
              <p className="text-gray-600">{new Date(lead.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Customer Info */}
          {lead.customers && (
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Customer Information</h5>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium">{lead.customers.name}</p>
                {lead.customers.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>{lead.customers.email}</span>
                  </div>
                )}
                {lead.customers.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{lead.customers.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {lead.status === 'open' && !lead.company_id && (
          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => handleAcceptLead(lead.id)}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              Accept Lead
            </button>
            <button
              onClick={() => handleDeclineLead(lead.id)}
              disabled={loading}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Service Request Leads</h2>
          <p className="text-sm text-gray-600 mt-1">
            Marketplace-style leads from customers looking for services
          </p>
        </div>
        
        <div className="flex space-x-2">
          {['all', 'open', 'emergency', 'accepted'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === filterOption
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Leads grid */}
      {filteredLeads.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <InboxIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No service requests available at the moment.'
              : `No ${filter} leads found. Try adjusting your filter.`
            }
          </p>
        </div>
      )}

      {/* Lead detail modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
};

export default CustomerLeads;
