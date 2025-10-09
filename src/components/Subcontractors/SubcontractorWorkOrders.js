// Subcontractor Work Orders - View assigned jobs
import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const SubcontractorWorkOrders = ({ subcontractorId }) => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadWorkOrders();
  }, [subcontractorId]);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subcontractors/${subcontractorId}/work-orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data);
      }
    } catch (error) {
      console.error('Error loading work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkOrderStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    if (filter === 'all') return true;
    if (filter === 'active') return wo.status !== 'COMPLETED';
    return wo.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Work Orders</h2>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Work Orders</option>
            <option value="active">Active</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Work Orders List */}
      {filteredWorkOrders.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No work orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? "You haven't been assigned any work orders yet."
              : `No ${filter} work orders found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorkOrders.map((assignment) => {
            const workOrder = assignment.work_orders;
            const customer = workOrder?.customers;
            
            return (
              <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {workOrder?.title || 'Work Order'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWorkOrderStatusColor(workOrder?.status)}`}>
                        {workOrder?.status || 'Unknown'}
                      </span>
                    </div>
                    
                    {workOrder?.description && (
                      <p className="text-gray-600 mb-3">{workOrder.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {workOrder?.start_time && (
                        <div className="flex items-center text-gray-600">
                          <CalendarDaysIcon className="h-4 w-4 mr-2" />
                          <span>
                            Scheduled: {new Date(workOrder.start_time).toLocaleDateString()} 
                            {workOrder.end_time && ` - ${new Date(workOrder.end_time).toLocaleDateString()}`}
                          </span>
                        </div>
                      )}
                      
                      {customer && (
                        <div className="flex items-center text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          <span>Customer: {customer.name}</span>
                        </div>
                      )}
                      
                      {customer?.phone && (
                        <div className="flex items-center text-gray-600">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      
                      {customer?.email && (
                        <div className="flex items-center text-gray-600">
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                    </div>
                    
                    {assignment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {assignment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex-shrink-0">
                    <div className="text-right text-sm text-gray-500">
                      <p>Assigned</p>
                      <p>{new Date(assignment.assigned_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    {assignment.status === 'ASSIGNED' && (
                      <button
                        onClick={() => {/* Coming soon - start work functionality */}}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Start Work
                      </button>
                    )}
                    
                    {assignment.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => {/* Coming soon - complete work functionality */}}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Mark Complete
                      </button>
                    )}
                    
                    <button
                      onClick={() => {/* Coming soon - view details functionality */}}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubcontractorWorkOrders;
