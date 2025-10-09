import React, { useState, useEffect, useContext } from 'react';
import { CustomerContext } from '../contexts/CustomerContext';
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const ScheduledServices = () => {
  const { customer, supabase } = useContext(CustomerContext);
  const [scheduledServices, setScheduledServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer?.customer_id) {
      loadScheduledServices();
    }
  }, [customer]);

  const loadScheduledServices = async () => {
    try {
      setLoading(true);
      
      // Load marketplace requests that are booked or in progress
      const { data, error } = await supabase
        .from('marketplace_requests')
        .select(`
          *,
          marketplace_request_tags (
            service_tags (
              name
            )
          ),
          marketplace_responses!inner (
            id,
            counter_offer,
            available_start,
            available_end,
            message,
            companies (
              name,
              phone,
              email,
              street_address,
              city,
              state,
              zip_code
            )
          )
        `)
        .eq('customer_id', customer.customer_id)
        .in('status', ['booked', 'in_progress'])
        .eq('marketplace_responses.response_status', 'accepted')
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Transform data to include service info
      const transformedServices = data?.map(request => ({
        ...request,
        service_tags: request.marketplace_request_tags?.map(rt => rt.service_tags?.name) || [],
        contractor: request.marketplace_responses?.[0]?.companies,
        quote_amount: request.marketplace_responses?.[0]?.counter_offer,
        scheduled_start: request.marketplace_responses?.[0]?.available_start || request.start_time,
        scheduled_end: request.marketplace_responses?.[0]?.available_end || request.end_time,
        contractor_message: request.marketplace_responses?.[0]?.message
      })) || [];

      setScheduledServices(transformedServices);
    } catch (error) {
      console.error('Error loading scheduled services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'booked':
        return <CalendarDaysIcon className="w-5 h-5 text-blue-500" />;
      case 'in_progress':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your scheduled services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Services</h1>
          <p className="text-gray-600 mt-2">
            View your confirmed and in-progress service appointments
          </p>
        </div>

        {scheduledServices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Services</h3>
            <p className="text-gray-600 mb-6">
              You don't have any scheduled services yet. Submit a service request to get started!
            </p>
            <button
              onClick={() => window.location.href = '/request-service'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Request Service
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {scheduledServices.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  {/* Service Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                          {service.status.charAt(0).toUpperCase() + service.status.slice(1).replace('_', ' ')}
                        </span>
                        {service.request_type === 'emergency' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Emergency
                          </span>
                        )}
                      </div>
                      
                      {/* Service Tags */}
                      {service.service_tags && service.service_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {service.service_tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-gray-600 mb-3">{service.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusIcon(service.status)}
                    </div>
                  </div>

                  {/* Contractor Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                          <h4 className="font-medium text-gray-900">{service.contractor?.name}</h4>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {service.contractor?.phone && (
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="w-4 h-4" />
                              <span>{service.contractor.phone}</span>
                            </div>
                          )}
                          {service.contractor?.email && (
                            <div className="flex items-center gap-2">
                              <EnvelopeIcon className="w-4 h-4" />
                              <span>{service.contractor.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Service Amount */}
                      {service.quote_amount && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ${service.quote_amount}
                          </div>
                          <div className="text-sm text-gray-500">Service Cost</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Schedule */}
                    {(service.scheduled_start || service.scheduled_end) && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Scheduled Time:</h5>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span>
                            {service.scheduled_start && formatDateTime(service.scheduled_start)}
                            {service.scheduled_start && service.scheduled_end && ' - '}
                            {service.scheduled_end && !service.scheduled_start && 'Until '}
                            {service.scheduled_end && formatDateTime(service.scheduled_end)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {service.service_mode !== 'remote' && service.location_city && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Service Location:</h5>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPinIcon className="w-4 h-4" />
                          <span>
                            {service.location_address && `${service.location_address}, `}
                            {service.location_city}, {service.location_state} {service.location_postal_code}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contractor Message */}
                  {service.contractor_message && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Contractor Notes:</h5>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{service.contractor_message}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Service booked {formatDate(service.created_at)}
                    </div>
                    
                    <div className="flex gap-2">
                      {service.contractor?.phone && (
                        <a
                          href={`tel:${service.contractor.phone}`}
                          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Call Contractor
                        </a>
                      )}
                      {service.status === 'completed' && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledServices;
