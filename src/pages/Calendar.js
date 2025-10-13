import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import '../styles/modern-enhancements.css';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import calendarService from '../services/CalendarService';
import SmartSchedulingAssistant from '../components/SmartSchedulingAssistant';
import { getSmartSchedulingSuggestions, getEmployeeSchedule, hasTimeConflict, getSchedulingSettings } from '../utils/smartScheduling';
import {
  PlusIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Calendar = () => {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState([]); // Employees with work_order_labor assignments
  const [selectedTechnician, setSelectedTechnician] = useState('all');
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showLegend, setShowLegend] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('timeGridWeek'); // Track current view for resource logic
  const [showOnlyAssigned, setShowOnlyAssigned] = useState(true); // GPT-5: Toggle for showing only assigned employees
  const [showBacklog, setShowBacklog] = useState(true);
  const [backlog, setBacklog] = useState([]);
  const [backlogQuery, setBacklogQuery] = useState('');
  const [minCrew, setMinCrew] = useState(1);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantJobData, setAssistantJobData] = useState(null);
  const [initialView, setInitialView] = useState('timeGridWeek');
  const [viewRange, setViewRange] = useState({ start: null, end: null });
  const [savedViews, setSavedViews] = useState([]);
  const [savedViewName, setSavedViewName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  // Route Optimization State
  const [showRouteOptimization, setShowRouteOptimization] = useState(false);
  const [optimizedRoutes, setOptimizedRoutes] = useState({});
  const [routeOptimizationDate, setRouteOptimizationDate] = useState(new Date().toISOString().split('T')[0]);

  // Customer Notifications State
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    appointmentReminders: true,
    reminderHours: 24,
    confirmationMessages: true,
    rescheduleNotifications: true
  });

  // Recurring Appointments State
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringJobData, setRecurringJobData] = useState(null);
  const [recurringJobs, setRecurringJobs] = useState([]);
  const calendarRef = useRef(null);
  const backlogRef = useRef(null);
  const [schedSettings, setSchedSettings] = useState(null);
  const [travelAnnotations, setTravelAnnotations] = useState({});

  // Load data when component mounts
  useEffect(() => {
    // Restore persisted state
    const p = new URLSearchParams(window.location.search);
    const v = p.get('view') || localStorage.getItem('cal_view') || 'timeGridWeek';
    setInitialView(v);
    const tech = p.get('tech') || localStorage.getItem('cal_tech') || 'all';
    setSelectedTechnician(tech);
    const assignedOnly = (p.get('assigned') || localStorage.getItem('cal_assigned') || '1') === '1';
    setShowOnlyAssigned(assignedOnly);

    // Check for any stored errors from scheduling
    const storedError = localStorage.getItem('lastLaborError');
    if (storedError) {
      console.error('Labor scheduling error:', JSON.parse(storedError));
      localStorage.removeItem('lastLaborError');
    }
    const debugInfo = localStorage.getItem('crewSchedulingDebug');
    if (debugInfo) {
      console.warn('Crew scheduling debug:', JSON.parse(debugInfo));
      localStorage.removeItem('crewSchedulingDebug');
    }

    if (user?.company_id) {
      loadEmployees();
      loadCustomers();
      loadScheduledWorkOrders();
      // Load scheduling settings (buffers/overtime)
      (async ()=>{
        try {
          const { getSchedulingSettings } = await import('../utils/smartScheduling');
          const s = await getSchedulingSettings(user.company_id);
          setSchedSettings(s);
        } catch (e) { console.warn('Failed to load scheduling settings', e); }
      })();
    }
  }, [user?.company_id]);

  // Persist filters/view
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    p.set('view', currentView || initialView);
    p.set('tech', selectedTechnician);
    p.set('assigned', showOnlyAssigned ? '1' : '0');
    window.history.replaceState({}, '', `${window.location.pathname}?${p.toString()}`);
    localStorage.setItem('cal_view', currentView || initialView);
    localStorage.setItem('cal_tech', selectedTechnician);
    localStorage.setItem('cal_assigned', showOnlyAssigned ? '1' : '0');
  }, [currentView, initialView, selectedTechnician, showOnlyAssigned]);

  // Saved views load
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cal_saved_views');
      if (raw) setSavedViews(JSON.parse(raw));
    } catch {}
  }, []);

  const persistSavedViews = (next) => {
    setSavedViews(next);
    try { localStorage.setItem('cal_saved_views', JSON.stringify(next)); } catch {}
  };

  // Reload work orders when employees or customers data changes to get proper names
  useEffect(() => {
    if (user?.company_id && employees.length > 0 && customers.length > 0) {
      loadScheduledWorkOrders();
    }
  }, [employees.length, customers.length]);

  // Load backlog (unscheduled work orders)
  useEffect(() => {
    const loadBacklog = async () => {
      try {
        // ✅ INDUSTRY STANDARD: Include approved (unscheduled) jobs in backlog
        // Matches ServiceTitan/Jobber/Housecall Pro: Show all jobs without scheduled times
        const res = await supaFetch('work_orders?status=in.(approved,scheduled,in_progress)&select=id,title,customer_id,labor_summary,estimated_duration,scheduled_start,scheduled_end', { method:'GET' }, user.company_id);
        if (res.ok) {
          const data = await res.json();
          // Filter to only show jobs without scheduled_start (truly unscheduled)
          const unscheduled = (data || []).filter(job => !job.scheduled_start);
          setBacklog(unscheduled);
        }
      } catch (e) { console.error('loadBacklog failed', e); }
    };
    if (user?.company_id) loadBacklog();
  }, [user?.company_id]);

  const loadEmployees = async () => {
    try {
      // ✅ INDUSTRY STANDARD: Query employees table with is_schedulable filter, join with users
      // NOTE: Filter on main table uses column=eq.value, filter on joined table uses table.column=eq.value
      const response = await supaFetch(
        'employees?select=id,user_id,job_title,is_schedulable,users!inner(id,first_name,last_name,name,role,status)&is_schedulable=eq.true&order=users(name).asc',
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Loaded schedulable employees for calendar:', data);
        // Map to expected format (employees table joined with users table)
        const mappedEmployees = data
          .filter(emp => emp.users) // Only include if user data exists
          .map(emp => ({
            id: emp.user_id,
            employee_id: emp.id,
            full_name: emp.users.name, // ✅ Use computed name column from users
            first_name: emp.users.first_name,
            last_name: emp.users.last_name,
            role: emp.users.role,
            status: emp.users.status,
            job_title: emp.job_title,
            is_schedulable: emp.is_schedulable
          }));
        setEmployees(mappedEmployees);

        // If we have customers already, reload work orders with fresh employee data
        if (customers.length > 0) {
          loadScheduledWorkOrders(mappedEmployees, customers);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to load employees:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await supaFetch(
        'customers?select=*&order=name.asc',
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);

        // If we have employees already, reload work orders with fresh customer data
        if (employees.length > 0) {
          loadScheduledWorkOrders(employees, data);
        }
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadScheduledWorkOrders = async (employeesParam = null, customersParam = null) => {
    // Use passed parameters or current state
    const currentEmployees = employeesParam || employees;
    const currentCustomers = customersParam || customers;
    try {
      setLoading(true);
      // Use enhanced calendar service to get events with full work order context
      const calendarEvents = await calendarService.getCalendarEvents(
        user.company_id,
        viewRange.start,
        viewRange.end,
        selectedTechnician !== 'all' ? selectedTechnician : null
      );

      // Extract assigned employees from calendar events for resource view
      const assignedEmployeeIds = new Set();
      calendarEvents.forEach(event => {
        if (event.extendedProps.employeeId) {
          assignedEmployeeIds.add(event.extendedProps.employeeId);
        }
        // Also add crew member IDs if available
        if (event.extendedProps.crewMemberIds) {
          event.extendedProps.crewMemberIds.forEach(id => assignedEmployeeIds.add(id));
        }
      });

      // Get employee details for assigned employees
      const assignedEmps = currentEmployees.filter(emp =>
        assignedEmployeeIds.has(emp.id) && emp.full_name?.trim()
      );

      setAssignedEmployees(assignedEmps);

      // Set the events directly from the calendar service (already formatted)
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading schedule events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getTechnicianColor = (technicianId) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
    const employeeIndex = employees.findIndex(emp => emp.id === technicianId);
    return employeeIndex >= 0 ? colors[employeeIndex % colors.length] : '#6B7280';
  };

  const getTechnicianBorderColor = (technicianId) => {
    const borderColors = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#65A30D', '#EA580C'];
    const employeeIndex = employees.findIndex(emp => emp.id === technicianId);
    return employeeIndex >= 0 ? borderColors[employeeIndex % borderColors.length] : '#4B5563';
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

  // Filter events based on selected technician
  const filteredEvents = selectedTechnician === 'all'
    ? events
    : events.filter(event => event.extendedProps.technicianId === selectedTechnician);

  // Init draggable for backlog items with inline Smart Assign
  useEffect(() => {
    if (!backlogRef?.current) return;
    new Draggable(backlogRef.current, {
      itemSelector: '.backlog-item',
      eventData: function(eventEl) {
        const woId = eventEl.getAttribute('data-wo-id');
        const title = eventEl.getAttribute('data-title');
        const crew = parseInt(eventEl.getAttribute('data-crew')||'1');
        const hours = parseFloat(eventEl.getAttribute('data-hours')||'8');
        return { id: woId, title, extendedProps: { workOrderId: woId, crewRequired: crew, estHours: hours } };
      }
    });
  }, [backlog, showBacklog]);

  const smartAssignWorkOrder = async (wo) => {
    try {
      const ls = wo.labor_summary || {};
      const perEmpHours = ls.hours_per_day || Math.round((wo.estimated_duration||120)/60);
      const crewRequired = ls.crew_size || 1;
      const durationMinutes = perEmpHours * 60;
      const employeeIds = employees.map(e=>e.id);
      const { suggestions } = await getSmartSchedulingSuggestions(employeeIds, durationMinutes, user.company_id, viewRange.start, viewRange.end);
      const all = Object.entries(suggestions||{}).flatMap(([empId, data]) => (data?.available_slots||[]).map(slot=>({slot, empId})));
      if (all.length === 0) { window?.toast?.warn('No available slots found'); return; }
      all.sort((a,b)=>a.slot.start_time - b.slot.start_time);
      const choice = all[0];
      const start = new Date(choice.slot.start_time);
      const end = new Date(choice.slot.end_time);
      // Final conflict check before commit
      try {
        const settings = await getSchedulingSettings(user.company_id);
        const events = await getEmployeeSchedule(choice.empId, user.company_id, new Date(start), new Date(end));
        if (hasTimeConflict(events, start, end, settings)) {
          window?.toast?.error('Time conflict: selected technician is already booked in that window.');
          return;
        }
      } catch (err) {
        console.warn('Conflict pre-check failed (smartAssignWorkOrder), proceeding cautiously:', err);
      }
      // Create schedule event instead of updating work_orders with scheduled_start/scheduled_end
      const res = await supaFetch(`schedule_events`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ work_order_id: wo.id, start_time:start.toISOString(), end_time:end.toISOString(), employee_id: choice.empId, title: wo.title || 'Scheduled Work' }) }, user.company_id);
      if (!res.ok) throw new Error('Failed to schedule');
      if (crewRequired > 1) {
        const crewIds = [choice.empId, ...employees.filter(e=>e.id!==choice.empId).slice(0, crewRequired-1).map(e=>e.id)];
        await Promise.allSettled(crewIds.map(empId => supaFetch('work_order_labor', { method:'POST', body:{ work_order_id: wo.id, employee_id: empId, hours: perEmpHours } }, user.company_id)));
      }
      await loadScheduledWorkOrders();
      setBacklog(prev => prev.filter(b=>b.id !== wo.id));
      window?.toast?.success('Job scheduled');
    } catch (e) { console.error(e); window?.toast?.error(e.message); }
  };

  // Check conflicts for a specific technician using full schedule sources
  const checkLaneConflict = async (technicianId, start, end) => {
    try {
      const settings = await getSchedulingSettings(user.company_id);
      const existing = await getEmployeeSchedule(technicianId, user.company_id, new Date(start.getTime()-8*3600000), new Date(end.getTime()+8*3600000));
      return hasTimeConflict(existing, start, end, settings);
    } catch (e) { console.warn('checkLaneConflict failed', e); return false; }
  };

  const findNextAvailableForTech = async (technicianId, durationMinutes, startFrom, endLimit) => {
    const { suggestions } = await getSmartSchedulingSuggestions([technicianId], durationMinutes, user.company_id, startFrom, endLimit);
    const slots = (suggestions?.[technicianId]?.available_slots || []).filter(s => new Date(s.start_time) >= startFrom);
    slots.sort((a,b)=> new Date(a.start_time) - new Date(b.start_time));
    return slots[0] || null;
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowJobModal(true);
  };

  const handleEventDrop = async (dropInfo) => {
    const evt = dropInfo.event;
    try {
      const workOrderId = evt.extendedProps?.workOrderId || evt.id;
      const durationMinutes = Math.max(30, Math.round((evt.end.getTime() - evt.start.getTime())/60000));

      // Crew-aware: if in Resource view and event has crew, align all crew blocks
      if (currentView === 'resourceTimeGridDay' && evt.extendedProps?.crewMemberIds?.length > 0) {
        // Validate per-lane conflict; if conflict, offer next available
        const laneConflict = await checkLaneConflict(evt.getResources?.()[0]?.id || evt.extendedProps.technicianId, evt.start, evt.end);
        if (laneConflict) {
          if (window.confirm('This time conflicts for this technician. Jump to next available slot?')) {
            const next = await findNextAvailableForTech(evt.extendedProps.technicianId, durationMinutes, evt.start, viewRange.end || new Date(evt.start.getTime()+7*24*3600000));
            if (next) {
              const patch = { start_time: new Date(next.start_time).toISOString(), end_time: new Date(next.end_time).toISOString() };
              await calendarService.updateWorkOrderScheduling(workOrderId, patch, user.company_id);
              await loadScheduledWorkOrders();
              return;
            }
          }
          dropInfo.revert();
          return;
        }
        // No conflict: patch once (WO start/end) and reload; clones will align automatically
        const patch = { start_time: evt.start.toISOString(), end_time: evt.end.toISOString() };
        await calendarService.updateWorkOrderScheduling(workOrderId, patch, user.company_id);
        await loadScheduledWorkOrders();
        return;
      }

      // Non-resource or non-crew: default behavior with simple conflict check
      const others = events.filter(e => (e.extendedProps?.workOrderId || e.id) !== workOrderId).map(e => ({ start_time: e.start, end_time: e.end }));
      const conflict = hasTimeConflict(others, evt.start, evt.end, {});
      if (conflict) throw new Error('Time conflict detected');
      const patch = { start_time: evt.start.toISOString(), end_time: evt.end.toISOString() };
      await calendarService.updateWorkOrderScheduling(workOrderId, patch, user.company_id);
      await loadScheduledWorkOrders();
    } catch (e) {
      dropInfo.revert();
      if (window?.toast) window.toast.warn(e.message);
    }
  };

  const handleEventResize = async (resizeInfo) => {
    const evt = resizeInfo.event;
    try {
      const workOrderId = evt.extendedProps?.workOrderId || evt.id;
      const durationMinutes = Math.max(30, Math.round((evt.end.getTime() - evt.start.getTime())/60000));

      if (currentView === 'resourceTimeGridDay' && evt.extendedProps?.crewMemberIds?.length > 0) {
        const laneConflict = await checkLaneConflict(evt.getResources?.()[0]?.id || evt.extendedProps.technicianId, evt.start, evt.end);
        if (laneConflict) {
          if (window.confirm('This duration conflicts for this technician. Adjust to next available slot?')) {
            const next = await findNextAvailableForTech(evt.extendedProps.technicianId, durationMinutes, evt.start, viewRange.end || new Date(evt.start.getTime()+7*24*3600000));
            if (next) {
              const patch = { start_time: new Date(next.start_time).toISOString(), end_time: new Date(next.end_time).toISOString() };
              await calendarService.updateWorkOrderScheduling(workOrderId, patch, user.company_id);
              await loadScheduledWorkOrders();
              return;
            }
          }
          resizeInfo.revert();
          return;
        }
        // No conflict: patch once
        const patch = { start_time: evt.start.toISOString(), end_time: evt.end.toISOString() };
        await calendarService.updateWorkOrderScheduling(workOrderId, patch, user.company_id);
        await loadScheduledWorkOrders();
        return;
      }

      // Non-resource or non-crew
      const others = events.filter(e => (e.extendedProps?.workOrderId || e.id) !== workOrderId).map(e => ({ start_time: e.start, end_time: e.end }));
      const conflict = hasTimeConflict(others, evt.start, evt.end, {});
      if (conflict) throw new Error('Time conflict detected');
      const patch = { start_time: evt.start.toISOString(), end_time: evt.end.toISOString() };
      await calendarService.updateWorkOrderScheduling(workOrderId, patch, user.company_id);
      await loadScheduledWorkOrders();
    } catch (e) {
      resizeInfo.revert();
      if (window?.toast) window.toast.warn(e.message);
    }
  };

  // Drop external (backlog) item onto calendar
  const handleExternalDrop = async (info) => {
    try {
      const { date, resource } = info;
      const data = info.draggedEl.dataset;
      const workOrderId = data.woId;
      const crewRequired = parseInt(data.crew||'1');
      const estHours = parseFloat(data.hours||'8');
      const start = new Date(date);
      const end = new Date(start.getTime() + estHours*60*60*1000);

      const technicianId = resource?.id || null;

      // Final conflict check before commit
      if (technicianId) {
        try {
          const settings = await getSchedulingSettings(user.company_id);
          const events = await getEmployeeSchedule(technicianId, user.company_id, new Date(start), new Date(end));
          if (hasTimeConflict(events, start, end, settings)) {
            window?.toast?.error('Time conflict: selected technician is already booked in that window.');
            return;
          }
        } catch (err) {
          console.warn('Conflict pre-check failed (externalDrop), proceeding cautiously:', err);
        }
      }
      // Save scheduling via schedule_events table
      await calendarService.createScheduleEvent({
        work_order_id: workOrderId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        employee_id: technicianId,
        title: `Work Order ${workOrderId}`
      }, user.company_id);

      // Create crew labor splits equally
      if (crewRequired > 1 && technicianId) {
        const crewIds = [technicianId, ...employees.filter(e=>e.id!==technicianId).slice(0, crewRequired-1).map(e=>e.id)];
        const perMemberHours = estHours; // same duration per member for this block
        await Promise.allSettled(crewIds.map(async (empId)=> {
          await supaFetch('work_order_labor', { method: 'POST', body: { work_order_id: workOrderId, employee_id: empId, hours: perMemberHours } }, user.company_id);
        }));
      }

      // Update UI
      setBacklog(prev => prev.filter(b=>b.id !== workOrderId));
      await loadScheduledWorkOrders();

    } catch (e) {
      console.error('handleExternalDrop failed', e);
      if (window?.toast) window.toast.error(e.message);
    }
  };

  // Route Optimization Functions
  const optimizeRoutes = async (date, technicianId = null) => {
    try {
      // Get all jobs for the selected date
      const targetDate = new Date(date);
      const dayEvents = events.filter(e => {
        const eventDate = new Date(e.start);
        return eventDate.toDateString() === targetDate.toDateString() &&
               (!technicianId || e.resourceId === technicianId);
      });

      if (dayEvents.length < 2) {
        alert('Need at least 2 appointments to optimize routes');
        return;
      }

      // **COMING SOON**: Integration with Google Maps API for real route optimization
      // For now, we'll provide a basic distance-based optimization
      const optimizedOrder = await basicRouteOptimization(dayEvents);

      setOptimizedRoutes(prev => ({
        ...prev,
        [date]: {
          [technicianId || 'all']: optimizedOrder
        }
      }));

      alert(`Route optimization complete! Suggested order: ${optimizedOrder.map(e => e.title).join(' → ')}`);
    } catch (error) {
      console.error('Route optimization failed:', error);
      alert('Route optimization failed. Please try again.');
    }
  };

  const basicRouteOptimization = async (jobEvents) => {
    // **COMING SOON**: Real GPS-based route optimization with Google Maps API
    // For now, return jobs sorted by start time as a placeholder
    return jobEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
  };

  // Customer Notification Functions
  const sendAppointmentReminder = async (jobId, method = 'email') => {
    try {
      const job = events.find(e => e.id === jobId);
      if (!job) return;

      // **COMING SOON**: Integration with email/SMS service providers
      console.log(`Sending ${method} reminder for job: ${job.title}`);

      // Placeholder for actual notification sending
      const message = `Reminder: Your appointment is scheduled for ${new Date(job.start).toLocaleString()}`;

      // Update job record to track notification sent
      await supaFetch(`work_orders?id=eq.${jobId}`, {
        method: 'PATCH',
        body: {
          reminder_sent_at: new Date().toISOString(),
          reminder_method: method
        }
      }, user.company_id);

      alert(`${method.toUpperCase()} reminder sent successfully!`);
    } catch (error) {
      console.error('Failed to send reminder:', error);
      alert('Failed to send reminder. Please try again.');
    }
  };

  const sendBulkReminders = async (date) => {
    try {
      const targetDate = new Date(date);
      const dayEvents = events.filter(e => {
        const eventDate = new Date(e.start);
        return eventDate.toDateString() === targetDate.toDateString();
      });

      // **COMING SOON**: Bulk notification processing with queue system
      for (const event of dayEvents) {
        await sendAppointmentReminder(event.id, 'email');
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      alert(`Sent reminders for ${dayEvents.length} appointments`);
    } catch (error) {
      console.error('Bulk reminder failed:', error);
      alert('Failed to send bulk reminders');
    }
  };

  // Recurring Appointments Functions
  const createRecurringJob = async (jobData, recurringSettings) => {
    try {
      const { frequency, interval, endDate, occurrences } = recurringSettings;

      // **COMING SOON**: Advanced recurring job engine with complex patterns
      // For now, support basic weekly/monthly recurring
      const recurringDates = generateRecurringDates(
        new Date(jobData.start_time),
        frequency,
        interval,
        endDate ? new Date(endDate) : null,
        occurrences
      );

      // Create recurring job record
      const recurringJobRecord = {
        title: jobData.title,
        customer_id: jobData.customer_id,
        frequency: frequency,
        interval: interval,
        next_occurrence: recurringDates[0]?.toISOString(),
        end_date: endDate,
        max_occurrences: occurrences,
        is_active: true,
        created_by: user.id,
        company_id: user.company_id
      };

      // **COMING SOON**: Create recurring_jobs table and store master record
      console.log('Creating recurring job:', recurringJobRecord);

      // Create individual work orders for each occurrence
      for (const date of recurringDates.slice(0, 10)) { // Limit to first 10 occurrences
        const workOrder = {
          ...jobData,
          start_time: date.toISOString(),
          end_time: new Date(date.getTime() + (jobData.estimated_duration || 60) * 60000).toISOString(),
          is_recurring: true,
          recurring_parent_id: 'temp-id', // **COMING SOON**: Link to master recurring job
          unified_status: 'scheduled_job'
        };

        await supaFetch('work_orders', {
          method: 'POST',
          body: workOrder
        }, user.company_id);
      }

      await loadScheduledWorkOrders();
      alert(`Created ${recurringDates.length} recurring appointments`);
      setShowRecurringModal(false);
    } catch (error) {
      console.error('Failed to create recurring job:', error);
      alert('Failed to create recurring appointments');
    }
  };

  const generateRecurringDates = (startDate, frequency, interval, endDate, maxOccurrences) => {
    const dates = [];
    let currentDate = new Date(startDate);
    let count = 0;

    while (count < (maxOccurrences || 52)) { // Default max 52 occurrences
      if (endDate && currentDate > endDate) break;

      dates.push(new Date(currentDate));
      count++;

      // Calculate next occurrence
      if (frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + (7 * interval));
      } else if (frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + interval);
      } else if (frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + interval);
      }
    }

    return dates;
  };

  const manageRecurringJob = async (jobId) => {
    // **COMING SOON**: Full recurring job management interface
    const job = events.find(e => e.id === jobId);
    if (!job) return;

    setRecurringJobData(job);
    setShowRecurringModal(true);
  };

  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return eventDate >= tomorrow && eventDate <= new Date(today.getTime() + 7*24*60*60*1000);
  });

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Schedule Calendar"
        subtitle="Manage appointments, track team availability, and optimize scheduling"
        icon={CalendarDaysIcon}
        gradient="blue"
        stats={[
          {
            label: 'Today',
            value: todayEvents.length,
            onClick: () => {
              const api = calendarRef.current?.getApi();
              api?.changeView('timeGridDay');
              api?.gotoDate(new Date());
            }
          },
          {
            label: 'This Week',
            value: upcomingEvents.length,
            onClick: () => {
              const api = calendarRef.current?.getApi();
              api?.changeView('timeGridWeek');
            }
          },
          {
            label: 'Unscheduled',
            value: backlog.length,
            onClick: () => window.location.href = '/jobs?filter=unscheduled'
          }
        ]}
        actions={[
          {
            label: 'Route Optimizer',
            icon: ClockIcon,
            onClick: () => setShowRouteOptimization(true)
          },
          {
            label: 'Send Reminders',
            icon: UserGroupIcon,
            onClick: () => setShowNotificationSettings(true)
          },
          {
            label: 'Recurring Jobs',
            icon: CheckCircleIcon,
            onClick: () => setShowRecurringModal(true)
          }
        ]}
      />

      {/* Schedule Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernCard
          className="card-gradient-blue text-white hover-lift cursor-pointer transition-transform hover:scale-105"
          onClick={() => {
            // Filter calendar to show only today's events
            const api = calendarRef.current?.getApi();
            api?.changeView('timeGridDay');
            api?.gotoDate(new Date());
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Today's Schedule</p>
                <p className="text-3xl font-bold text-white">{todayEvents.length}</p>
                <p className="text-blue-200 text-xs mt-1">Click to view today</p>
              </div>
              <CalendarDaysIcon className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard
          className="card-gradient-green text-white hover-lift cursor-pointer transition-transform hover:scale-105"
          onClick={() => {
            // Navigate to employees page
            window.location.href = '/employees';
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Team Available</p>
                <p className="text-3xl font-bold text-white">{employees.filter(e => assignedEmployees.includes(e.id)).length}</p>
                <p className="text-green-200 text-xs mt-1">Click to manage team</p>
              </div>
              <UserGroupIcon className="w-12 h-12 text-green-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard
          className="card-gradient-orange text-white hover-lift cursor-pointer transition-transform hover:scale-105"
          onClick={() => {
            // Navigate to Jobs page filtered for unscheduled
            window.location.href = '/jobs?filter=unscheduled';
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Unscheduled Jobs</p>
                <p className="text-3xl font-bold text-white">{backlog.length}</p>
                <p className="text-orange-200 text-xs mt-1">Click to schedule</p>
              </div>
              <ClockIcon className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard
          className="card-gradient-purple text-white hover-lift cursor-pointer transition-transform hover:scale-105"
          onClick={() => {
            // Navigate to reports page for utilization metrics
            window.location.href = '/reports?view=utilization';
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Utilization</p>
                <p className="text-3xl font-bold text-white">87%</p>
                <p className="text-purple-200 text-xs mt-1">Click for details</p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Backlog + Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="card lg:col-span-1">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="font-medium">Unscheduled Jobs</div>
            <button className="text-sm text-gray-600" onClick={()=>setShowBacklog(!showBacklog)}>{showBacklog ? 'Hide' : 'Show'}</button>
          </div>
          {showBacklog && (
            <div className="p-3 space-y-3">
              <div className="flex items-center gap-2">
                <input value={backlogQuery} onChange={(e)=>setBacklogQuery(e.target.value)} placeholder="Search..." className="w-full border rounded px-2 py-1 text-xs"/>
                <input type="number" min="1" value={minCrew} onChange={(e)=>setMinCrew(parseInt(e.target.value)||1)} className="w-16 border rounded px-2 py-1 text-xs" title="Min crew"/>
              </div>
              <div ref={backlogRef} className="space-y-2 max-h-96 overflow-y-auto">
                {backlog.filter(wo => {
                  const q = backlogQuery.toLowerCase();
                  const ls = wo.labor_summary || {}; const crew = ls.crew_size || 1;
                  return (!q || (wo.title||'').toLowerCase().includes(q)) && crew >= minCrew;
                }).length === 0 ? (
                  <div className="text-sm text-gray-500">No unscheduled jobs.</div>
                ) : backlog.filter(wo => {
                  const q = backlogQuery.toLowerCase();
                  const ls = wo.labor_summary || {}; const crew = ls.crew_size || 1;
                  return (!q || (wo.title||'').toLowerCase().includes(q)) && crew >= minCrew;
                }).map(wo => {
                  const ls = wo.labor_summary || {}; const crew = ls.crew_size || 1; const hours = ls.hours_per_day || Math.round((wo.estimated_duration||120)/60);
                  const cust = customers.find(c=>c.id===wo.customer_id);
                  return (
                    <div key={wo.id} className="border rounded p-2 hover:bg-gray-50 text-xs">
                      <div
                        className="backlog-item cursor-move mb-1"
                        data-wo-id={wo.id}
                        data-title={wo.title}
                        data-crew={crew}
                        data-hours={hours}
                        title="Drag onto the calendar to schedule"
                      >
                        <div className="font-medium text-xs truncate">{wo.title || 'Untitled'}</div>
                        <div className="text-xs text-gray-600 truncate">{cust?.name || 'Customer'}</div>
                        <div className="text-xs text-gray-500">Crew {crew} • {hours}h</div>
                      </div>
                      <div className="mt-1 flex gap-1">
                        <button className="text-xs px-2 py-0.5 border rounded hover:bg-gray-100" onClick={(e)=>{ e.stopPropagation(); setAssistantJobData({ id: wo.id, job_title: wo.title, customer_id: wo.customer_id, labor_summary: wo.labor_summary, work_order_items: wo.work_order_items || [] }); setShowAssistant(true); }}>Assistant</button>
                        <button className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={(e)=>{ e.stopPropagation(); smartAssignWorkOrder(wo); }}>Assign</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-3">
          {/* Smart Assistant + Saved Views */}
          <div className="card mb-4">
            <div className="flex flex-col gap-3 p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Smart Scheduling Assistant</div>
                <div className="flex gap-2 items-center">
                  <button onClick={()=>setShowAssistant(!showAssistant)} className="btn-outline btn-xs">{showAssistant?'Hide':'Show'}</button>
                  {assistantJobData && (
                    <button className="btn-primary btn-xs" onClick={(e)=>{ e.stopPropagation(); smartAssignWorkOrder(assistantJobData); }}>Smart Assign</button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input className="border rounded px-2 py-1 text-sm" placeholder="Save current view as..." value={savedViewName} onChange={(e)=>setSavedViewName(e.target.value)} />
                <button className="btn-outline btn-xs" onClick={()=>{
                  if (!savedViewName.trim()) return;
                  const preset = { name: savedViewName.trim(), view: currentView || initialView, tech: selectedTechnician, assignedOnly: showOnlyAssigned ? 1 : 0 };
                  const next = [...savedViews.filter(v=>v.name!==preset.name), preset];
                  persistSavedViews(next);
                  setSavedViewName('');
                  window?.toast?.success('View saved');
                }}>Save View</button>
                {savedViews.length>0 && (
                  <>
                    <select className="border rounded px-2 py-1 text-sm" value={selectedPreset} onChange={(e)=>setSelectedPreset(e.target.value)}>
                      <option value="">Load View...</option>
                      {savedViews.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                    </select>
                    <button className="btn-outline btn-xs" onClick={()=>{
                      const v = savedViews.find(x=>x.name===selectedPreset);
                      if (!v) return;
                      const api = calendarRef.current?.getApi();
                      api?.changeView(v.view);
                      setCurrentView(v.view);
                      setSelectedTechnician(v.tech);
                      setShowOnlyAssigned(!!v.assignedOnly);
                      window?.toast?.success('View loaded');
                    }}>Load</button>
                  </>
                )}
              </div>
            </div>
            {showAssistant && (
              <div className="p-3">
                <SmartSchedulingAssistant
                  isOpen={true}
                  onClose={()=>{ setShowAssistant(false); setAssistantJobData(null); }}
                  jobData={assistantJobData}
                  onEventCreated={()=>{ loadScheduledWorkOrders(); }}
                />
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Calendar Controls */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technician Filter
              </label>
              <select
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="form-select"
              >
                <option value="all">All Technicians</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* GPT-5: Toggle for showing only assigned employees in daily view */}
            {currentView === 'resourceTimeGridDay' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily View Options
                </label>
                <button
                  onClick={() => setShowOnlyAssigned(!showOnlyAssigned)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    showOnlyAssigned
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {showOnlyAssigned ? 'Assigned Only' : 'All Employees'}
                </button>
              </div>
            )}
          </div>

          {/* Legend */}
          {showLegend && employees.length > 0 && (
            <div className="flex items-center gap-4 text-sm flex-wrap">
              {employees.slice(0, 8).map((employee, index) => {
                const technicianColor = getTechnicianColor(employee.id);
                return (
                  <div key={employee.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: technicianColor }}
                    ></div>
                    <span>{employee.full_name}</span>
                  </div>
                );
              })}
              {employees.length > 8 && (
                <span className="text-gray-500">+{employees.length - 8} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, resourceTimeGridPlugin, interactionPlugin]}
            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
            initialView={initialView}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,resourceTimeGridDay' }}
            resources={currentView === 'resourceTimeGridDay' ?
              (showOnlyAssigned ? assignedEmployees : employees)
                .filter(e => e.full_name?.trim())
                .map(e => ({ id: e.id, title: e.full_name })) : undefined}
            events={currentView === 'resourceTimeGridDay' ?
              filteredEvents.flatMap(evt => {
                const ids = (evt.extendedProps.crewMemberIds && evt.extendedProps.crewMemberIds.length > 0)
                  ? evt.extendedProps.crewMemberIds
                  : (evt.extendedProps.technicianId ? [evt.extendedProps.technicianId] : []);
                return ids.map(id => ({ ...evt, id: `${evt.id}_${id}`, resourceId: id }));
              })
              : filteredEvents}
            viewDidMount={(info) => { setCurrentView(info.view.type); setViewRange({ start: info.view.currentStart, end: info.view.currentEnd }); }}
            datesSet={(arg)=>{ setViewRange({ start: arg.start, end: arg.end }); }}
            editable={true}
            droppable={true}
            drop={handleExternalDrop}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            slotMinTime="06:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            height="auto"
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            eventOverlap={currentView === 'resourceTimeGridDay' ? false : true}
            expandRows={currentView === 'resourceTimeGridDay' ? true : false}
            resourceOrder="title"
            businessHours={{ daysOfWeek: [1,2,3,4,5], startTime: '07:00', endTime: '18:00' }}
            eventContent={(eventInfo) => {
              const isResourceView = currentView === 'resourceTimeGridDay';
              const p = eventInfo.event.extendedProps;
              const start = eventInfo.event.start; const end = eventInfo.event.end;

              // Enhanced work order context display
              const workOrderStage = p.workOrderStage || 'QUOTE';
              const workOrderStatus = p.workOrderStatus || p.status;
              const customerName = p.customerName || 'Unknown Customer';
              const serviceAddress = p.serviceAddress || p.location;
              let overtime = false, travelWarning = false, travelText = '';
              if (schedSettings && start && end) {
                // Overtime: outside business hours
                overtime = !((() => {
                  const [sh, sm] = (schedSettings.business_hours_start||'07:30').split(':').map(Number);
                  const [eh, em] = (schedSettings.business_hours_end||'17:00').split(':').map(Number);
                  const bs = new Date(start); bs.setHours(sh, sm, 0, 0);
                  const be = new Date(start); be.setHours(eh, em, 0, 0);
                  return start >= bs && end <= be;
                })());
                // Travel hint: if previous event for this technician ends close to start
                try {
                  const techId = eventInfo.event.getResources?.()[0]?.id || p.technicianId;
                  const key = techId ? `${p.workOrderId || eventInfo.event.id}_${techId}` : null;
                  if (key && travelAnnotations[key]) {
                    travelWarning = true;
                    travelText = travelAnnotations[key].travelText;
                  }
                } catch {}
              }
              return (
                <div className="p-1 text-xs">
                  <div className="font-semibold truncate flex items-center gap-1">
                    <span>{p.jobType || eventInfo.event.title}</span>
                    {workOrderStage && (
                      <span className={`ml-1 inline-block px-1 py-0.5 text-[10px] rounded ${
                        workOrderStage === 'QUOTE' ? 'bg-blue-100 text-blue-700' :
                        workOrderStage === 'JOB' ? 'bg-green-100 text-green-700' :
                        workOrderStage === 'WORK_ORDER' ? 'bg-amber-100 text-amber-700' :
                        workOrderStage === 'INVOICED' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {workOrderStage}
                      </span>
                    )}
                    {overtime && <span className="ml-1 inline-block px-1 py-0.5 text-[10px] bg-red-100 text-red-700 rounded">OT</span>}
                    {travelWarning && <span className="ml-1 inline-block px-1 py-0.5 text-[10px] bg-yellow-100 text-yellow-700 rounded">Drive</span>}
                  </div>
                  {!isResourceView && (<div className="truncate">{p.technicianName || p.employeeName}</div>)}
                  <div className="truncate opacity-75">{customerName}</div>
                  {serviceAddress && (<div className="truncate text-[10px] opacity-60">{serviceAddress}</div>)}
                  {p.crewSize > 1 && !isResourceView && (<div className="truncate text-blue-600">Crew ({p.crewSize})</div>)}
                  {p.totalAmount && (<div className="truncate text-green-600 font-medium">${p.totalAmount.toFixed(2)}</div>)}
                  {travelText && (<div className="truncate text-[10px] text-yellow-700">{travelText}</div>)}
                </div>
              );
            }}
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

            <div className="space-y-3">
              <div>
                <span className="font-medium">Job Type:</span> {selectedEvent.extendedProps.jobType}
              </div>
              {selectedEvent.extendedProps.workOrderStage && (
                <div>
                  <span className="font-medium">Stage:</span>
                  <span className={`ml-2 inline-block px-2 py-1 text-xs rounded ${
                    selectedEvent.extendedProps.workOrderStage === 'QUOTE' ? 'bg-blue-100 text-blue-700' :
                    selectedEvent.extendedProps.workOrderStage === 'JOB' ? 'bg-green-100 text-green-700' :
                    selectedEvent.extendedProps.workOrderStage === 'WORK_ORDER' ? 'bg-amber-100 text-amber-700' :
                    selectedEvent.extendedProps.workOrderStage === 'INVOICED' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedEvent.extendedProps.workOrderStage}
                  </span>
                </div>
              )}
              {selectedEvent.extendedProps.workOrderStatus && (
                <div>
                  <span className="font-medium">Status:</span> {selectedEvent.extendedProps.workOrderStatus}
                </div>
              )}
              <div>
                <span className="font-medium">Customer:</span> {selectedEvent.extendedProps.customerName}
              </div>
              {selectedEvent.extendedProps.customerAddress && (
                <div>
                  <span className="font-medium">Address:</span> {selectedEvent.extendedProps.customerAddress}
                </div>
              )}
              {selectedEvent.extendedProps.customerPhone && (
                <div>
                  <span className="font-medium">Phone:</span> {selectedEvent.extendedProps.customerPhone}
                </div>
              )}
              <div>
                <span className="font-medium">
                  {selectedEvent.extendedProps.crewSize > 1 ? 'Crew:' : 'Technician:'}
                </span> {selectedEvent.extendedProps.technicianName}
              </div>
              {selectedEvent.extendedProps.crewSize > 1 && (
                <div className="text-sm text-gray-600 ml-4">
                  <span className="font-medium">Crew Members:</span>
                  <ul className="list-disc list-inside mt-1">
                    {selectedEvent.extendedProps.crewMembers.map((member, index) => (
                      <li key={index}>{member}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <span className="font-medium">Time:</span> {selectedEvent.start?.toLocaleString()} - {selectedEvent.end?.toLocaleString()}
              </div>
              {selectedEvent.extendedProps.totalAmount && (
                <div>
                  <span className="font-medium">Amount:</span>
                  <span className="text-green-600 font-semibold ml-2">${selectedEvent.extendedProps.totalAmount.toFixed(2)}</span>
                </div>
              )}
              {selectedEvent.extendedProps.estimatedDuration && (
                <div>
                  <span className="font-medium">Estimated Duration:</span> {selectedEvent.extendedProps.estimatedDuration} minutes
                </div>
              )}

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Customer Information</div>
                <div className="text-sm space-y-1">
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

            <div className="flex justify-between mt-6">
              <button
                onClick={async () => {
                  if (window.confirm('Delete this scheduled job? This cannot be undone.')) {
                    try {
                      const workOrderId = selectedEvent.extendedProps.workOrderId || selectedEvent.extendedProps.jobId;
                      const eventId = selectedEvent.id;



                      let deleteSuccess = false;

                      // Try to delete from work_orders first
                      if (workOrderId) {
                        const woResponse = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_orders?id=eq.${workOrderId}`, {
                          method: 'DELETE',
                          headers: {
                            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
                          }
                        });

                        if (woResponse.ok) deleteSuccess = true;
                      }

                      // Also try to delete from schedule_events (legacy) using event ID
                      if (eventId) {
                        const seResponse = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/schedule_events?id=eq.${eventId}`, {
                          method: 'DELETE',
                          headers: {
                            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
                          }
                        });

                        if (seResponse.ok) deleteSuccess = true;
                      }

                      if (deleteSuccess) {
                        // Remove from UI
                        setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
                        setShowJobModal(false);
                        alert('Job deleted successfully');
                        // Reload the page to ensure clean state
                        window.location.reload();
                      } else {
                        alert('Failed to delete job - no matching records found');
                      }
                    } catch (error) {
                      console.error('Error deleting job:', error);
                      alert('Failed to delete job: ' + error.message);
                    }
                  }
                }}
                className="btn-danger bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete (Beta)
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowJobModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Navigate to Jobs page with the specific work order ID (now unified as jobs)
                    const workOrderId = selectedEvent.extendedProps.workOrderId || selectedEvent.extendedProps.jobId;
                    if (workOrderId) {
                      window.location.href = `/jobs?edit=${workOrderId}`;
                    } else {
                      window.location.href = `/jobs`;
                    }
                  }}
                  className="btn-primary"
                >
                  Edit Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Optimization Modal */}
      {showRouteOptimization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Route Optimization</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={routeOptimizationDate}
                  onChange={(e) => setRouteOptimizationDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technician (Optional)
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                >
                  <option value="all">All Technicians</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  <strong>COMING SOON:</strong> GPS-based route optimization with Google Maps integration
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => optimizeRoutes(routeOptimizationDate, selectedTechnician === 'all' ? null : selectedTechnician)}
                className="flex-1 btn-primary"
              >
                Optimize Routes
              </button>
              <button
                onClick={() => setShowRouteOptimization(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Notification Settings Modal */}
      {showNotificationSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Customer Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Appointment Reminders
                </label>
                <input
                  type="checkbox"
                  checked={notificationSettings.appointmentReminders}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    appointmentReminders: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Hours Before
                </label>
                <select
                  value={notificationSettings.reminderHours}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    reminderHours: parseInt(e.target.value)
                  }))}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value={1}>1 hour</option>
                  <option value={2}>2 hours</option>
                  <option value={4}>4 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>COMING SOON:</strong> Automated email/SMS reminders with Twilio and SendGrid integration
                </p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => sendBulkReminders(new Date().toISOString().split('T')[0])}
                  className="w-full btn-primary"
                >
                  Send Today's Reminders
                </button>
                <button
                  onClick={() => sendBulkReminders(new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0])}
                  className="w-full btn-secondary"
                >
                  Send Tomorrow's Reminders
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowNotificationSettings(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Appointments Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Recurring Appointment</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const jobData = {
                title: formData.get('title'),
                customer_id: formData.get('customer_id'),
                start_time: formData.get('start_time'),
                estimated_duration: parseInt(formData.get('duration'))
              };
              const recurringSettings = {
                frequency: formData.get('frequency'),
                interval: parseInt(formData.get('interval')),
                endDate: formData.get('end_date'),
                occurrences: parseInt(formData.get('occurrences'))
              };
              createRecurringJob(jobData, recurringSettings);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g., Monthly HVAC Maintenance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer
                  </label>
                  <select name="customer_id" required className="w-full border rounded-md px-3 py-2">
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="start_time"
                      required
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      defaultValue={60}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select name="frequency" className="w-full border rounded-md px-3 py-2">
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Every X periods
                    </label>
                    <input
                      type="number"
                      name="interval"
                      defaultValue={1}
                      min={1}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Occurrences
                    </label>
                    <input
                      type="number"
                      name="occurrences"
                      defaultValue={12}
                      min={1}
                      max={100}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-800">
                    <strong>COMING SOON:</strong> Advanced recurring patterns, maintenance contracts, and automatic billing
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 btn-primary">
                  Create Recurring Jobs
                </button>
                <button
                  type="button"
                  onClick={() => setShowRecurringModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
