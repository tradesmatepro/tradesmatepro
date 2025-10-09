import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import '../styles/modern-enhancements.css';
import SmartSchedulingAssistant from '../components/SmartSchedulingAssistant';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import {
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';

const Scheduling = () => {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('all');
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showSmartAssistant, setShowSmartAssistant] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Load data when component mounts
  useEffect(() => {
    if (user?.company_id) {
      loadEmployees();
      loadCustomers();
      // Also load work orders immediately, but they'll be enhanced when employee/customer data arrives
      loadScheduledWorkOrders();
    }
  }, [user?.company_id]);

  // Reload work orders when employees or customers data changes to get proper names
  useEffect(() => {
    if (user?.company_id && (employees.length > 0 || customers.length > 0)) {
      loadScheduledWorkOrders();
    }
  }, [employees.length, customers.length]);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isNewJob = params.get('new') === 'job';
    if (isNewJob && !showAddJobModal) setShowAddJobModal(true);
  }, [location.search]);

  const loadScheduledWorkOrders = async () => {
    try {
      setLoading(true);
      console.log('Loading scheduled work orders from work_orders table...');

      // Load work orders from the unified view - include all scheduled work orders
      const response = await supaFetch(
        `work_orders_v?select=*&start_time=not.is.null&order=start_time.asc`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const workOrders = await response.json();
        console.log('Loaded work orders:', workOrders);

        // Load labor assignments for each work order to get crew information
        const workOrderIds = workOrders.filter(wo => wo.start_time).map(wo => wo.id);
        let laborAssignments = {};

        if (workOrderIds.length > 0) {
          try {
            // Direct query now works since work_order_labor has company_id column
            const laborResponse = await supaFetch(
              `work_order_labor?work_order_id=in.(${workOrderIds.join(',')})&select=work_order_id,employee_id,hours`,
              { method: 'GET' },
              user.company_id
            );

            if (laborResponse.ok) {
              const laborData = await laborResponse.json();
              // Group by work_order_id
              laborAssignments = laborData.reduce((acc, labor) => {
                if (!acc[labor.work_order_id]) acc[labor.work_order_id] = [];
                acc[labor.work_order_id].push(labor);
                return acc;
              }, {});
            }
          } catch (error) {
            console.error('Error loading labor assignments:', error);
          }
        }

        // Convert work orders to calendar events
        const calendarEvents = workOrders.filter(wo => wo.start_time).map(wo => {
          const employee = employees.find(e => e.id === wo.assigned_technician_id);
          const customer = customers.find(c => c.id === wo.customer_id);

          // Debug logging for missing technicians
          if (wo.assigned_technician_id && !employee) {
            console.log(`⚠️ Work order ${wo.id} has assigned_technician_id "${wo.assigned_technician_id}" but no matching employee found`);
            console.log('Available employees:', employees.map(e => ({ id: e.id, name: e.full_name })));
          }

          // Check if this work order has multiple crew members
          const crewAssignments = laborAssignments[wo.id] || [];
          const crewMembers = crewAssignments.map(labor => {
            const emp = employees.find(e => e.id === labor.employee_id);
            return emp?.full_name || 'Unknown';
          }).filter(name => name !== 'Unknown');

          const technicianName = crewMembers.length > 1
            ? `Crew (${crewMembers.length}): ${crewMembers.join(', ')}`
            : employee?.full_name || (wo.assigned_technician_id ? `Unknown Technician (${wo.assigned_technician_id.substring(0, 8)}...)` : 'Unassigned');

          return {
            id: wo.id,
            title: wo.title || 'Untitled Work Order',
            start: wo.scheduled_start,
            end: wo.scheduled_end || wo.scheduled_start,
            extendedProps: {
              workOrderId: wo.id,
              jobId: wo.id, // For backward compatibility
              customerId: wo.customer_id,
              customerName: customer?.name || 'Customer',
              customerAddress: formatCustomerAddress(customer),
              customerPhone: customer?.phone || '',
              customerEmail: customer?.email || '',
              technicianId: wo.assigned_technician_id,
              technicianName: technicianName,
              crewMembers: crewMembers,
              crewSize: crewMembers.length,
              jobType: wo.title,
              description: wo.description || '',
              location: wo.work_location || formatCustomerAddress(customer),
              status: wo.status,
              totalCost: (wo.total_cents || 0) / 100, // Convert cents to dollars
              workOrderNumber: wo.job_number || wo.quote_number
            },
            backgroundColor: getStatusColor(wo.work_status),
            borderColor: getStatusBorderColor(wo.work_status)
          };
        });

        setEvents(calendarEvents);
        console.log('Calendar events created:', calendarEvents);
      } else {
        console.error('Failed to load work orders:', response.status);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error loading scheduled work orders:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      // ✅ INDUSTRY STANDARD: Query employees table, filter by is_schedulable
      // JOIN with users table to get name, role, status
      // NOTE: Filter on main table uses column=eq.value, filter on joined table uses table.column=eq.value
      const response = await supaFetch(
        'employees?select=id,user_id,job_title,is_schedulable,users!inner(id,first_name,last_name,name,role,status)&is_schedulable=eq.true&order=users(name).asc',
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        // Map to expected format (employees table joined with users table)
        const mappedEmployees = data
          .filter(emp => emp.users) // Only include if user data exists
          .map(emp => ({
            id: emp.user_id, // Use user_id for consistency
            employee_id: emp.id, // Employee record ID
            full_name: emp.users.name, // ✅ Use computed name column from users
            first_name: emp.users.first_name,
            last_name: emp.users.last_name,
            role: emp.users.role,
            status: emp.users.status,
            job_title: emp.job_title,
            is_schedulable: emp.is_schedulable
          }));
        console.log('📋 Loaded schedulable employees:', mappedEmployees);
        setEmployees(mappedEmployees);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await supaFetch(
        'customers?select=id,name,street_address,city,state,zip_code,phone,email',
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const getStatusColor = (workStatus) => {
    switch (workStatus) {
      case 'ASSIGNED': return '#3B82F6'; // Blue
      case 'IN_PROGRESS': return '#F59E0B'; // Yellow
      case 'COMPLETED': return '#10B981'; // Green
      case 'PENDING': return '#8B5CF6'; // Purple
      default: return '#6B7280'; // Gray
    }
  };

  const getStatusBorderColor = (workStatus) => {
    switch (workStatus) {
      case 'ASSIGNED': return '#2563EB';
      case 'IN_PROGRESS': return '#D97706';
      case 'COMPLETED': return '#059669';
      case 'PENDING': return '#7C3AED';
      default: return '#4B5563';
    }
  };

  const formatCustomerAddress = (customer) => {
    if (!customer) return '';

    const parts = [];
    if (customer.street_address) parts.push(customer.street_address);

    const cityStateZip = [];
    if (customer.city) cityStateZip.push(customer.city);
    if (customer.state) cityStateZip.push(customer.state);
    if (customer.zip_code) cityStateZip.push(customer.zip_code);

    if (cityStateZip.length > 0) {
      parts.push(cityStateZip.join(', '));
    }

    return parts.join(', ') || customer.address || '';
  };

  const closeAddJob = () => {
    setShowAddJobModal(false);
    const params = new URLSearchParams(location.search);
    params.delete('new');
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };



  // Handle new event creation from Smart Assistant
  const handleEventCreated = (newEvent) => {
    // Reload the calendar data to get the updated work orders with proper employee names
    loadScheduledWorkOrders();
  };
  const calendarRef = useRef(null);

  // Filter events based on selected technician
  const filteredEvents = selectedTechnician === 'all'
    ? events
    : events.filter(event => event.extendedProps.technicianId === selectedTechnician);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowJobModal(true);
  };

  const handleEventDrop = (dropInfo) => {
    const updatedEvents = events.map(event => {
      if (event.id === dropInfo.event.id) {
        return {
          ...event,
          start: dropInfo.event.start.toISOString(),
          end: dropInfo.event.end.toISOString()
        };
      }
      return event;
    });
    setEvents(updatedEvents);

    // Show success message (you can replace with proper toast notification)
    console.log(`Job "${dropInfo.event.title}" rescheduled successfully`);
  };

  const handleEventResize = (resizeInfo) => {
    const updatedEvents = events.map(event => {
      if (event.id === resizeInfo.event.id) {
        return {
          ...event,
          start: resizeInfo.event.start.toISOString(),
          end: resizeInfo.event.end.toISOString()
        };
      }
      return event;
    });
    setEvents(updatedEvents);

    console.log(`Job "${resizeInfo.event.title}" duration updated successfully`);
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Scheduling"
        subtitle="Manage jobs, appointments, and employee schedules with smart AI assistance"
        icon={CalendarDaysIcon}
        gradient="indigo"
        stats={[
          { label: 'Total Jobs', value: filteredEvents.length },
          { label: 'Upcoming', value: filteredEvents.filter(e => new Date(e.start) >= new Date()).length },
          { label: 'Technicians', value: employees.length }
        ]}
        actions={[
          {
            label: 'Smart Assistant',
            icon: SparklesIcon,
            onClick: () => setShowSmartAssistant(true)
          },
          {
            label: 'Add Job',
            icon: PlusIcon,
            onClick: () => setShowAddJobModal(true)
          }
        ]}
      />

      {/* Modern Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernStatCard
          title={selectedTechnician === 'all' ? 'Total Jobs' : 'Jobs for Selected Tech'}
          value={filteredEvents.length}
          icon={CalendarDaysIcon}
          gradient="blue"
          onClick={() => setSelectedTechnician('all')}

        />
        <ModernStatCard
          title="Upcoming Jobs"
          value={filteredEvents.filter(e => new Date(e.start) >= new Date()).length}
          icon={CheckCircleIcon}
          gradient="green"
          onClick={() => {/* Filter to upcoming */}}
        />
        <ModernStatCard
          title="Active Technicians"
          value={employees.length}
          icon={UserIcon}
          gradient="purple"
          onClick={() => navigate('/employees')}

        />
        <ModernStatCard
          title="Today"
          value={new Date().toLocaleDateString('en-US', { weekday: 'short' })}
          icon={ClockIcon}
          gradient="orange"
          onClick={() => {/* Navigate to today */}}

        />
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          {/* Today Button */}
          <button
            onClick={() => {/* Navigate to today - implement later */}}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Today
          </button>

          {/* Technician Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Technicians</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Technician Legend */}
      {showLegend && employees.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Technician Color Legend</h3>
            <button
              onClick={() => setShowLegend(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            {employees.map((emp, index) => {
              // Generate consistent colors for employees
              const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
              const color = colors[index % colors.length];
              return (
                <div key={emp.id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm text-gray-600">{emp.full_name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="card">
        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={filteredEvents}
            editable={true}
            droppable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            slotMinTime="07:00:00"
            slotMaxTime="18:00:00"
            allDaySlot={false}
            height="auto"
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
              startTime: '07:00',
              endTime: '18:00'
            }}
            eventContent={(eventInfo) => (
              <div className="p-1 text-xs">
                <div className="font-semibold truncate">{eventInfo.event.extendedProps.jobType}</div>
                <div className="truncate">{eventInfo.event.extendedProps.technicianName}</div>
                <div className="truncate opacity-75">{eventInfo.event.extendedProps.customerName}</div>
              </div>
            )}
            eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Job Details</h3>
              <button
                onClick={() => setShowJobModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium">{selectedEvent.extendedProps.jobType}</div>
                  <div className="text-sm text-gray-500">Job Type</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium">{selectedEvent.extendedProps.technicianName}</div>
                  <div className="text-sm text-gray-500">
                    {selectedEvent.extendedProps.crewSize > 1 ? 'Assigned Crew' : 'Assigned Technician'}
                  </div>
                  {selectedEvent.extendedProps.crewSize > 1 && (
                    <div className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Crew Members:</span>
                      <ul className="list-disc list-inside mt-1">
                        {selectedEvent.extendedProps.crewMembers.map((member, index) => (
                          <li key={index}>{member}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium">
                    {selectedEvent.start.toLocaleDateString()} • {selectedEvent.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {selectedEvent.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="text-sm text-gray-500">Schedule</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Customer Information</div>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Name:</span> {selectedEvent.extendedProps.customerName}</div>
                  {selectedEvent.extendedProps.customerAddress && (
                    <div><span className="font-medium">Address:</span> {selectedEvent.extendedProps.customerAddress}</div>
                  )}
                  {selectedEvent.extendedProps.customerPhone && (
                    <div><span className="font-medium">Phone:</span> {selectedEvent.extendedProps.customerPhone}</div>
                  )}
                  {selectedEvent.extendedProps.customerEmail && (
                    <div><span className="font-medium">Email:</span> {selectedEvent.extendedProps.customerEmail}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowJobModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => alert('Edit functionality coming soon')}
                className="btn-primary"
              >
                Edit Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Job</h3>
              <button
                onClick={() => setShowAddJobModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-8">
              <PlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-2">Add Job Form</div>
              <div className="text-sm text-gray-400">Job creation form will be implemented here</div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeAddJob}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  closeAddJob();
                  alert('Job creation will be implemented when Jobs database is ready');
                }}
                className="btn-primary"
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Scheduling Assistant */}
      <SmartSchedulingAssistant
        isOpen={showSmartAssistant}
        onClose={() => setShowSmartAssistant(false)}
        jobData={null}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default Scheduling;
