import { supaFetch } from '../utils/supaFetch';

/**
 * Enhanced Calendar Service with Work Order Integration
 * Provides comprehensive calendar functionality with proper work order linkage
 */
class CalendarService {
  
  /**
   * Get calendar events with full work order context
   * @param {string} companyId - Company ID
   * @param {Date} startDate - Start date for filtering
   * @param {Date} endDate - End date for filtering
   * @param {string} employeeId - Optional employee filter
   * @returns {Promise<Array>} Calendar events with work order context
   */
  async getCalendarEvents(companyId, startDate = null, endDate = null, employeeId = null) {
    try {
      console.log('🔄 Loading calendar events - trying simple approach...');

      // Start with just schedule_events, no joins first
      let query = `schedule_events?company_id=eq.${companyId}`;

      // Add date filtering
      if (startDate) {
        query += `&start_time=gte.${startDate.toISOString()}`;
      }
      if (endDate) {
        query += `&end_time=lte.${endDate.toISOString()}`;
      }

      // Add employee filtering
      if (employeeId) {
        query += `&employee_id=eq.${employeeId}`;
      }

      query += `&order=start_time.asc`;

      console.log('📡 Query:', query);
      const response = await supaFetch(query, { method: 'GET' }, companyId);

      if (response.ok) {
        const events = await response.json();
        console.log('✅ Raw schedule_events:', events);

        // If we have events, try to enrich them
        if (events.length > 0) {
          const enrichedEvents = await this.enrichEvents(events, companyId);
          console.log('✅ Enriched events:', enrichedEvents.length);
          return enrichedEvents;
        }

        // If no schedule_events, try work_orders directly
        console.log('⚠️ No schedule_events found, trying work_orders...');
        const workOrderEvents = await this.getSimpleWorkOrderEvents(companyId, startDate, endDate, employeeId);
        console.log('✅ Work order events:', workOrderEvents.length);

        return workOrderEvents;
      } else {
        console.error('❌ Failed to load schedule_events:', response.status, response.statusText);

        // Fallback to work_orders
        console.log('🔄 Falling back to work_orders...');
        const workOrderEvents = await this.getSimpleWorkOrderEvents(companyId, startDate, endDate, employeeId);
        return workOrderEvents;
      }
    } catch (error) {
      console.error('❌ Error loading calendar events:', error);
      return [];
    }
  }

  /**
   * Enrich schedule_events with related data
   * @param {Array} events - Raw schedule_events
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Enriched events
   */
  async enrichEvents(events, companyId) {
    try {
      const enrichedEvents = [];

      for (const event of events) {
        let enrichedEvent = { ...event };

        // Get work order details if linked
        if (event.work_order_id) {
          try {
            const woResponse = await supaFetch(`work_orders?id=eq.${event.work_order_id}`, { method: 'GET' }, companyId);
            if (woResponse.ok) {
              const workOrders = await woResponse.json();
              if (workOrders.length > 0) {
                enrichedEvent.work_order = workOrders[0];
              }
            }
          } catch (error) {
            console.warn('Failed to load work order:', event.work_order_id, error);
          }
        }

        // Get customer details if linked
        if (event.customer_id) {
          try {
            const customerResponse = await supaFetch(`customers?id=eq.${event.customer_id}`, { method: 'GET' }, companyId);
            if (customerResponse.ok) {
              const customers = await customerResponse.json();
              if (customers.length > 0) {
                enrichedEvent.customer = customers[0];
              }
            }
          } catch (error) {
            console.warn('Failed to load customer:', event.customer_id, error);
          }
        }

        // Get employee details if linked
        if (event.employee_id) {
          try {
            const userResponse = await supaFetch(`users?id=eq.${event.employee_id}`, { method: 'GET' }, companyId);
            if (userResponse.ok) {
              const users = await userResponse.json();
              if (users.length > 0) {
                enrichedEvent.user = users[0];
              }
            }
          } catch (error) {
            console.warn('Failed to load user:', event.employee_id, error);
          }
        }

        enrichedEvents.push(this.formatEnrichedEvent(enrichedEvent));
      }

      return enrichedEvents;
    } catch (error) {
      console.error('Error enriching events:', error);
      return events.map(event => this.formatBasicEvent(event));
    }
  }

  /**
   * Get simple work order events without complex joins
   * @param {string} companyId - Company ID
   * @param {Date} startDate - Start date for filtering
   * @param {Date} endDate - End date for filtering
   * @param {string} employeeId - Optional employee filter
   * @returns {Promise<Array>} Work order events
   */
  async getSimpleWorkOrderEvents(companyId, startDate = null, endDate = null, employeeId = null) {
    try {
      // ✅ FIX: Use scheduled_start/scheduled_end (actual column names in work_orders table)
      let query = `work_orders?company_id=eq.${companyId}&scheduled_start=not.is.null&scheduled_end=not.is.null`;

      // Add date filtering
      if (startDate) {
        query += `&scheduled_start=gte.${startDate.toISOString()}`;
      }
      if (endDate) {
        query += `&scheduled_end=lte.${endDate.toISOString()}`;
      }

      // Add employee filtering (unified: assigned_to)
      if (employeeId) {
        query += `&assigned_to=eq.${employeeId}`;
      }

      query += `&order=scheduled_start.asc`;

      console.log('📡 Work orders query:', query);
      const response = await supaFetch(query, { method: 'GET' }, companyId);

      if (response.ok) {
        const workOrders = await response.json();
        console.log('✅ Raw work orders:', workOrders);
        return workOrders.map(wo => this.formatWorkOrderAsBasicEvent(wo));
      } else {
        console.error('❌ Failed to load work orders:', response.status, response.statusText);
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading work order events:', error);
      return [];
    }
  }

  /**
   * Get work orders that have scheduling but no schedule_events
   * @param {string} companyId - Company ID
   * @param {Date} startDate - Start date for filtering
   * @param {Date} endDate - End date for filtering
   * @param {string} employeeId - Optional employee filter
   * @returns {Promise<Array>} Work order events
   */
  async getWorkOrderEvents(companyId, startDate = null, endDate = null, employeeId = null) {
    try {
      // ✅ FIX: Use scheduled_start/scheduled_end (actual column names in work_orders table)
      let query = `work_orders?select=*,customers(company_name,first_name,last_name),users!work_orders_assigned_technician_id_fkey(first_name,last_name,email)&company_id=eq.${companyId}&scheduled_start=not.is.null&scheduled_end=not.is.null`;

      // Add date filtering
      if (startDate) {
        query += `&scheduled_start=gte.${startDate.toISOString()}`;
      }
      if (endDate) {
        query += `&scheduled_end=lte.${endDate.toISOString()}`;
      }

      // Add employee filtering (unified: assigned_to)
      if (employeeId) {
        query += `&assigned_to=eq.${employeeId}`;
      }

      query += `&order=scheduled_start.asc`;

      const response = await supaFetch(query, { method: 'GET' }, companyId);

      if (response.ok) {
        const workOrders = await response.json();
        return workOrders.map(wo => this.formatWorkOrderAsEvent(wo));
      } else {
        console.error('Failed to load work order events:', response.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error loading work order events:', error);
      return [];
    }
  }

  /**
   * Format work order as calendar event
   * @param {Object} workOrder - Work order data
   * @returns {Object} Formatted event
   */
  formatWorkOrderAsEvent(workOrder) {
    const customer = workOrder.customers;
    const user = workOrder.users;

    const customerName = customer ?
      (customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown Customer') :
      'Unknown Customer';

    const employeeName = user ?
      (`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unassigned') :
      'Unassigned';

    const serviceAddress = [workOrder.service_address_line_1, workOrder.service_city, workOrder.service_state]
      .filter(Boolean).join(', ');

    const title = workOrder.title || `Work Order: ${workOrder.job_number || workOrder.quote_number || 'Untitled'}`;

    return {
      id: `wo_${workOrder.id}`, // Prefix to avoid conflicts with schedule_events
      title: title,
      // ✅ FIX: Use scheduled_start/scheduled_end (actual column names)
      start: workOrder.scheduled_start || workOrder.start_time,
      end: workOrder.scheduled_end || workOrder.end_time,
      backgroundColor: this.getEventColor('work_order', workOrder.status),
      borderColor: this.getEventBorderColor('work_order', workOrder.status),
      textColor: '#ffffff',
      extendedProps: {
        workOrderId: workOrder.id,
        workOrderStage: workOrder.stage,
        workOrderStatus: workOrder.work_status || workOrder.job_status || workOrder.quote_status || workOrder.status,
        customerId: workOrder.customer_id,
        customerName: customerName,
        employeeId: workOrder.assigned_to,
        employeeName: employeeName,
        serviceAddress: serviceAddress,
        estimatedDuration: workOrder.estimated_duration,
        totalAmount: workOrder.total_amount,
        eventType: 'work_order',
        status: workOrder.status || 'scheduled',
        description: workOrder.description
      }
    };
  }

  /**
   * Create a new schedule event
   * @param {Object} eventData - Event data
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Created event
   */
  async createScheduleEvent(eventData, companyId) {
    try {
      const response = await supaFetch('schedule_events', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: {
          ...eventData,
          company_id: companyId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }, companyId);
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to create schedule event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating schedule event:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing schedule event
   * @param {string} eventId - Event ID
   * @param {Object} updates - Updates to apply
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Updated event
   */
  async updateScheduleEvent(eventId, updates, companyId) {
    try {
      const response = await supaFetch(`schedule_events?id=eq.${eventId}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: {
          ...updates,
          updated_at: new Date().toISOString()
        }
      }, companyId);
      
      if (response.ok) {
        const result = await response.json();
        return result[0];
      } else {
        throw new Error(`Failed to update schedule event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating schedule event:', error);
      throw error;
    }
  }
  
  /**
   * Delete a schedule event
   * @param {string} eventId - Event ID
   * @param {string} companyId - Company ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteScheduleEvent(eventId, companyId) {
    try {
      const response = await supaFetch(`schedule_events?id=eq.${eventId}`, {
        method: 'DELETE'
      }, companyId);
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting schedule event:', error);
      return false;
    }
  }
  
  /**
   * Update work order scheduling (this will automatically sync to schedule_events via trigger)
   * @param {string} workOrderId - Work Order ID
   * @param {Object} schedulingData - Scheduling data
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Updated work order
   */
  async updateWorkOrderScheduling(workOrderId, schedulingData, companyId) {
    try {
      // Map legacy keys to unified columns
      const body = { ...schedulingData };
      if (body.start_time) { body.scheduled_start = body.start_time; delete body.start_time; }
      if (body.end_time) { body.scheduled_end = body.end_time; delete body.end_time; }
      if (body.assigned_technician_id) { body.assigned_to = body.assigned_technician_id; delete body.assigned_technician_id; }

      const response = await supaFetch(`work_orders?id=eq.${workOrderId}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body
      }, companyId);

      if (response.ok) {
        const result = await response.json();
        return result[0];
      } else {
        throw new Error(`Failed to update work order scheduling: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating work order scheduling:', error);
      throw error;
    }
  }

  /**
   * Format enriched event for calendar
   * @param {Object} event - Enriched event data
   * @returns {Object} Formatted event
   */
  formatEnrichedEvent(event) {
    const workOrder = event.work_order;
    const customer = event.customer;
    const user = event.user;

    const customerName = customer ?
      (customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown Customer') :
      'Unknown Customer';

    const employeeName = user ?
      (`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unassigned') :
      'Unassigned';

    const serviceAddress = workOrder ?
      [workOrder.service_address_line_1, workOrder.service_city, workOrder.service_state]
        .filter(Boolean).join(', ') : null;

    return {
      id: event.id,
      title: event.title || 'Untitled Event',
      start: event.start_time,
      end: event.end_time,
      backgroundColor: this.getEventColor(event.event_type, event.status),
      borderColor: this.getEventBorderColor(event.event_type, event.status),
      textColor: '#ffffff',
      extendedProps: {
        workOrderId: event.work_order_id,
        workOrderStage: workOrder?.stage,
        workOrderStatus: workOrder?.work_status || workOrder?.job_status || workOrder?.quote_status || workOrder?.status,
        customerId: event.customer_id,
        customerName: customerName,
        employeeId: event.employee_id,
        employeeName: employeeName,
        serviceAddress: serviceAddress,
        estimatedDuration: workOrder?.estimated_duration,
        totalAmount: workOrder?.total_amount,
        eventType: event.event_type || 'appointment',
        status: event.status || 'scheduled',
        description: event.description
      }
    };
  }

  /**
   * Format basic event for calendar (no enrichment)
   * @param {Object} event - Basic event data
   * @returns {Object} Formatted event
   */
  formatBasicEvent(event) {
    return {
      id: event.id,
      title: event.title || 'Untitled Event',
      start: event.start_time,
      end: event.end_time,
      backgroundColor: this.getEventColor(event.event_type, event.status),
      borderColor: this.getEventBorderColor(event.event_type, event.status),
      textColor: '#ffffff',
      extendedProps: {
        workOrderId: event.work_order_id,
        customerId: event.customer_id,
        employeeId: event.employee_id,
        eventType: event.event_type || 'appointment',
        status: event.status || 'scheduled',
        description: event.description
      }
    };
  }

  /**
   * Format work order as basic calendar event
   * @param {Object} workOrder - Work order data
   * @returns {Object} Formatted event
   */
  formatWorkOrderAsBasicEvent(workOrder) {
    const title = workOrder.title || `Work Order: ${workOrder.job_number || workOrder.quote_number || 'Untitled'}`;

    return {
      id: `wo_${workOrder.id}`, // Prefix to avoid conflicts
      title: title,
      // ✅ FIX: Use scheduled_start/scheduled_end (actual column names)
      start: workOrder.scheduled_start || workOrder.start_time,
      end: workOrder.scheduled_end || workOrder.end_time,
      backgroundColor: this.getEventColor('work_order', workOrder.status),
      borderColor: this.getEventBorderColor('work_order', workOrder.status),
      textColor: '#ffffff',
      extendedProps: {
        workOrderId: workOrder.id,
        workOrderStage: workOrder.stage,
        workOrderStatus: workOrder.work_status || workOrder.job_status || workOrder.quote_status || workOrder.status,
        customerId: workOrder.customer_id,
        customerName: 'Loading...', // Will be loaded separately if needed
        employeeId: workOrder.assigned_to,
        employeeName: 'Loading...', // Will be loaded separately if needed
        serviceAddress: [workOrder.service_address_line_1, workOrder.service_city, workOrder.service_state]
          .filter(Boolean).join(', ') || null,
        estimatedDuration: workOrder.estimated_duration,
        totalAmount: workOrder.total_amount,
        eventType: 'work_order',
        status: workOrder.status || 'scheduled',
        description: workOrder.description
      }
    };
  }

  /**
   * Get employee availability for scheduling
   * @param {string} employeeId - Employee ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Availability slots
   */
  async getEmployeeAvailability(employeeId, startDate, endDate, companyId) {
    try {
      const response = await supaFetch(
        `schedule_events?employee_id=eq.${employeeId}&start_time=gte.${startDate.toISOString()}&end_time=lte.${endDate.toISOString()}&select=start_time,end_time,title,status`,
        { method: 'GET' },
        companyId
      );
      
      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to load employee availability:', response.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error loading employee availability:', error);
      return [];
    }
  }
  
  /**
   * Check for scheduling conflicts
   * @param {string} employeeId - Employee ID
   * @param {Date} startTime - Proposed start time
   * @param {Date} endTime - Proposed end time
   * @param {string} companyId - Company ID
   * @param {string} excludeEventId - Event ID to exclude from conflict check
   * @returns {Promise<boolean>} True if conflict exists
   */
  async hasSchedulingConflict(employeeId, startTime, endTime, companyId, excludeEventId = null) {
    try {
      let query = `schedule_events?employee_id=eq.${employeeId}&start_time=lt.${endTime.toISOString()}&end_time=gt.${startTime.toISOString()}&select=id`;
      
      if (excludeEventId) {
        query += `&id=neq.${excludeEventId}`;
      }
      
      const response = await supaFetch(query, { method: 'GET' }, companyId);
      
      if (response.ok) {
        const conflicts = await response.json();
        return conflicts.length > 0;
      } else {
        console.error('Failed to check scheduling conflicts:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error checking scheduling conflicts:', error);
      return false;
    }
  }
  
  /**
   * Format calendar event for FullCalendar (from direct query)
   * @param {Object} event - Raw event data from direct query
   * @returns {Object} Formatted event
   */
  formatDirectCalendarEvent(event) {
    const workOrder = event.work_orders;
    const customer = event.customers;
    const user = event.users;

    const customerName = customer ?
      (customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown Customer') :
      'Unknown Customer';

    const employeeName = user ?
      (`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unassigned') :
      'Unassigned';

    const serviceAddress = workOrder ?
      [workOrder.service_address_line_1, workOrder.service_city, workOrder.service_state]
        .filter(Boolean).join(', ') : null;

    return {
      id: event.id,
      title: event.title || 'Untitled Event',
      start: event.start_time,
      end: event.end_time,
      backgroundColor: this.getEventColor(event.event_type, event.status),
      borderColor: this.getEventBorderColor(event.event_type, event.status),
      textColor: '#ffffff',
      extendedProps: {
        workOrderId: event.work_order_id,
        workOrderStage: workOrder?.stage,
        workOrderStatus: workOrder?.work_status || workOrder?.job_status || workOrder?.quote_status || workOrder?.status,
        customerId: event.customer_id,
        customerName: customerName,
        employeeId: event.employee_id,
        employeeName: employeeName,
        serviceAddress: serviceAddress,
        estimatedDuration: workOrder?.estimated_duration,
        totalAmount: workOrder?.total_amount,
        eventType: event.event_type || 'appointment',
        status: event.status || 'scheduled',
        description: event.description
      }
    };
  }

  /**
   * Format calendar event for FullCalendar (legacy function format)
   * @param {Object} event - Raw event data
   * @returns {Object} Formatted event
   */
  formatCalendarEvent(event) {
    return {
      id: event.id,
      title: event.title,
      start: event.start_time,
      end: event.end_time,
      backgroundColor: this.getEventColor(event.event_type, event.status),
      borderColor: this.getEventBorderColor(event.event_type, event.status),
      textColor: '#ffffff',
      extendedProps: {
        workOrderId: event.work_order_id,
        workOrderStage: event.work_order_stage,
        workOrderStatus: event.work_order_status,
        customerId: event.customer_id,
        customerName: event.customer_name,
        employeeId: event.employee_id,
        employeeName: event.employee_name,
        serviceAddress: event.service_address,
        estimatedDuration: event.estimated_duration,
        totalAmount: event.total_amount,
        eventType: event.event_type,
        status: event.status,
        description: event.description
      }
    };
  }
  
  /**
   * Get event color based on type and status
   * @param {string} eventType - Event type
   * @param {string} status - Event status
   * @returns {string} Color code
   */
  getEventColor(eventType, status) {
    if (eventType === 'work_order') {
      switch (status) {
        case 'scheduled': return '#3b82f6'; // Blue
        case 'confirmed': return '#10b981'; // Green
        case 'in_progress': return '#f59e0b'; // Amber
        case 'completed': return '#6b7280'; // Gray
        case 'cancelled': return '#ef4444'; // Red
        default: return '#6366f1'; // Indigo
      }
    } else {
      switch (status) {
        case 'scheduled': return '#8b5cf6'; // Purple
        case 'confirmed': return '#06b6d4'; // Cyan
        case 'cancelled': return '#ef4444'; // Red
        default: return '#6366f1'; // Indigo
      }
    }
  }
  
  /**
   * Get event border color based on type and status
   * @param {string} eventType - Event type
   * @param {string} status - Event status
   * @returns {string} Border color code
   */
  getEventBorderColor(eventType, status) {
    const baseColor = this.getEventColor(eventType, status);
    // Return a slightly darker version for border
    return baseColor;
  }
}

// Export singleton instance
const calendarService = new CalendarService();
export default calendarService;
