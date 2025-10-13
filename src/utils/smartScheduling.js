// Smart Scheduling Assistant for TradeMate Pro
// Uses existing schedule_events table to find optimal time slots

// Supabase configuration
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

/**
 * Round time to next 15-minute interval for professional scheduling
 * @param {Date} date - Date to round
 * @returns {Date} - Rounded date
 */
export const roundToNext15Minutes = (date) => {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const remainder = minutes % 15;

  if (remainder !== 0) {
    // Round up to next 15-minute interval
    rounded.setMinutes(minutes + (15 - remainder));
    rounded.setSeconds(0);
    rounded.setMilliseconds(0);
  } else {
    // Already on 15-minute boundary, just clean up seconds/milliseconds
    rounded.setSeconds(0);
    rounded.setMilliseconds(0);
  }

  return rounded;
};

/**
 * Check if a time is on a 15-minute boundary
 * @param {Date} date - Date to check
 * @returns {boolean} - True if on 15-minute boundary
 */
export const isOn15MinuteBoundary = (date) => {
  return date.getMinutes() % 15 === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0;
};

/**
 * Generate clean 15-minute interval time slots
 * @param {Date} startTime - Start of time range
 * @param {Date} endTime - End of time range
 * @param {number} intervalMinutes - Interval between slots (default 15)
 * @returns {Array} - Array of time slots on 15-minute boundaries
 */
export const generateCleanTimeSlots = (startTime, endTime, intervalMinutes = 15) => {
  const slots = [];
  let currentTime = roundToNext15Minutes(new Date(startTime));

  while (currentTime < endTime) {
    slots.push(new Date(currentTime));
    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
  }

  return slots;
};

/**
 * Default scheduling settings
 */
export const DEFAULT_SCHEDULING_SETTINGS = {
  job_buffer_minutes: 30, // Legacy - for backward compatibility
  default_buffer_before_minutes: 30,
  default_buffer_after_minutes: 30,
  enable_customer_self_scheduling: false,
  auto_approve_customer_selections: false,
  business_hours_start: '07:30',
  business_hours_end: '17:00',
  working_days: [1, 2, 3, 4, 5], // Monday to Friday
  min_advance_booking_hours: 1,
  max_advance_booking_days: 30
};

/**
 * Get company scheduling settings
 * @param {string} companyId - Company ID
 * @returns {Object} - Scheduling settings
 */
export const getSchedulingSettings = async (companyId) => {
  try {
    // ✅ FIX: Use supaFetch instead of direct fetch to avoid RLS issues
    const { supaFetch } = await import('./supaFetch');
    const companyResp = await supaFetch(
      `companies?id=eq.${companyId}&select=job_buffer_minutes,default_buffer_before_minutes,default_buffer_after_minutes,enable_customer_self_scheduling,auto_approve_customer_selections,business_hours_start,business_hours_end,working_days,min_advance_booking_hours,max_advance_booking_days`,
      { method: 'GET' },
      companyId
    );

    if (companyResp.ok) {
      const rows = await companyResp.json();
      if (rows.length > 0) {
        const settings = { ...DEFAULT_SCHEDULING_SETTINGS, ...rows[0] };
        // Ensure buffer settings exist (backward compatibility)
        if (!settings.default_buffer_before_minutes) {
          settings.default_buffer_before_minutes = settings.job_buffer_minutes || 30;
        }
        if (!settings.default_buffer_after_minutes) {
          settings.default_buffer_after_minutes = settings.job_buffer_minutes || 30;
        }
        // Coerce working_days to array if stored as JSON string
        if (typeof settings.working_days === 'string') {
          try { settings.working_days = JSON.parse(settings.working_days); } catch {}
        }
        if (!Array.isArray(settings.working_days)) {
          settings.working_days = DEFAULT_SCHEDULING_SETTINGS.working_days;
        }
        settings.company_id = companyId;
        return settings;
      }
    }



    return { ...DEFAULT_SCHEDULING_SETTINGS, company_id: companyId };
  } catch (error) {
    console.error('Error fetching scheduling settings:', error);
    return { ...DEFAULT_SCHEDULING_SETTINGS, company_id: companyId };
  }
};

/**
 * Get employee's existing schedule events from both schedule_events and work_orders
 * @param {string} employeeId - Employee ID
 * @param {Date} startDate - Start date for search
 * @param {Date} endDate - End date for search
 * @returns {Array} - Array of schedule events
 */
export const getEmployeeSchedule = async (employeeId, companyId, startDate, endDate) => {
  try {
    console.log(`🔍 CONFLICT CHECK: Getting schedule for employee ${employeeId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Get schedule_events by user_id and employee_id for robustness
    const scheduleEventsUrlUser = `${SUPABASE_URL}/rest/v1/schedule_events?user_id=eq.${employeeId}&company_id=eq.${companyId}&start_time=lt.${endDate.toISOString()}&end_time=gt.${startDate.toISOString()}&select=*`;
    const scheduleEventsUrlEmp  = `${SUPABASE_URL}/rest/v1/schedule_events?employee_id=eq.${employeeId}&company_id=eq.${companyId}&start_time=lt.${endDate.toISOString()}&end_time=gt.${startDate.toISOString()}&select=*`;
    console.log('📅 Schedule events queries:', scheduleEventsUrlUser, scheduleEventsUrlEmp);

    const scheduleRespUser = await fetch(scheduleEventsUrlUser, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const scheduleRespEmp = await fetch(scheduleEventsUrlEmp, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    // Get scheduled work orders (unified system) - proper overlap query using correct columns
    const workOrdersUrl = `${SUPABASE_URL}/rest/v1/work_orders?assigned_to=eq.${employeeId}&company_id=eq.${companyId}&status=in.(scheduled,in_progress)&scheduled_start=lt.${endDate.toISOString()}&scheduled_end=gt.${startDate.toISOString()}&select=id,title,scheduled_start,scheduled_end,assigned_to`;
    console.log('🔧 Work orders query:', workOrdersUrl);

    // Note: crew assignments are handled via work_orders.assigned_to in unified pipeline.
    // Removed legacy work_order_labor lookup to avoid 404 noise in logs.

    let allEvents = [];
    if (scheduleRespUser.ok) {
      const arr = await scheduleRespUser.json();
      allEvents = allEvents.concat(arr);
    }
    if (scheduleRespEmp.ok) {
      const arr = await scheduleRespEmp.json();
      // merge distinct by id
      const existingIds = new Set(allEvents.map(e => e.id));
      allEvents = allEvents.concat(arr.filter(e => !existingIds.has(e.id)));
    }

    const workOrdersResponse = await fetch(workOrdersUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    // allEvents already contains merged schedule_events from user_id and employee_id queries

    if (workOrdersResponse.ok) {
      const workOrders = await workOrdersResponse.json();
      console.log(`🔧 Found ${workOrders.length} work_orders for employee ${employeeId}:`, workOrders);
      // Convert work orders to schedule event format
      const workOrderEvents = workOrders.map(wo => ({
        id: wo.id,
        title: wo.title,
        start_time: wo.scheduled_start,
        end_time: wo.scheduled_end,
        employee_id: wo.assigned_to,
        event_type: 'work_order'
      }));
      allEvents = [...allEvents, ...workOrderEvents];
    } else {
      console.log(`❌ Work orders query failed:`, workOrdersResponse.status, await workOrdersResponse.text());
    }

    // PTO (APPROVED) as blocking events
    try {
      const ptoUrl = `${SUPABASE_URL}/rest/v1/employee_time_off?employee_id=eq.${employeeId}&company_id=eq.${companyId}&status=eq.APPROVED&starts_at=lt.${endDate.toISOString()}&ends_at=gt.${startDate.toISOString()}&select=kind,starts_at,ends_at`;
      const ptoResp = await fetch(ptoUrl, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
      if (ptoResp.ok) {
        const ptoRecs = await ptoResp.json();
        const ptoEvents = ptoRecs.map(r => ({ title: r.kind || 'PTO', start_time: r.starts_at, end_time: r.ends_at, employee_id: employeeId, event_type: 'pto' }));
        allEvents = [...allEvents, ...ptoEvents];
      }
    } catch (e) {
      console.warn('PTO fetch failed', e);
    }

    console.log(`🎯 TOTAL EVENTS for conflict detection: ${allEvents.length}`, allEvents);
    return allEvents;
  } catch (error) {
    console.error('Error fetching employee schedule:', error);
    return [];
  }
};

/**
 * Check if a time slot conflicts with existing events
 * @param {Date} startTime - Proposed start time
 * @param {Date} endTime - Proposed end time
 * @param {Array} existingEvents - Array of existing schedule events
 * @param {Object} bufferSettings - Buffer settings object
 * @returns {boolean} - True if there's a conflict
 */
// GPT-5 fix: Correct conflict detection with proper numeric comparison
const toMs = (d) => new Date(d).getTime();

export const hasTimeConflict = (existingEvents, slotStart, slotEnd, bufferSettings = {}) => {
  const s = toMs(slotStart);
  const e = toMs(slotEnd);

  // Guard against invalid slots
  if (!(s < e)) return true;

  const bufferBefore = (bufferSettings.default_buffer_before_minutes ?? bufferSettings.job_buffer_minutes ?? 0) * 60 * 1000;
  const bufferAfter = (bufferSettings.default_buffer_after_minutes ?? bufferSettings.job_buffer_minutes ?? 0) * 60 * 1000;

  return existingEvents.some(event => {
    const es = toMs(event.start_time);
    const ee = toMs(event.end_time);

    // Add buffer time to existing events
    const bufferedStart = es - bufferBefore;
    const bufferedEnd = ee + bufferAfter;

    // Strict overlap check: slot overlaps with buffered event
    const hasOverlap = s < bufferedEnd && e > bufferedStart;

    if (hasOverlap) {
      // FIXED: Only log conflicts in debug mode to prevent console spam
      if (window.DEBUG_SCHEDULING) {
        console.log(`CONFLICT DETECTED:`, {
          proposedSlot: { start: new Date(s).toISOString(), end: new Date(e).toISOString() },
          existingEvent: {
            title: event.title,
            start: new Date(es).toISOString(),
            end: new Date(ee).toISOString(),
            bufferedStart: new Date(bufferedStart).toISOString(),
            bufferedEnd: new Date(bufferedEnd).toISOString()
          },
          bufferMinutes: { before: bufferBefore/60000, after: bufferAfter/60000 }
        });
      }
    }

    return hasOverlap;
  });
};

/**
 * Check if time slot is within business hours
 * @param {Date} startTime - Start time to check
 * @param {Date} endTime - End time to check
 * @param {Object} settings - Scheduling settings
 * @returns {boolean} - True if within business hours
 */
export const isWithinBusinessHours = (startTime, endTime, settings) => {
  const dayOfWeek = startTime.getDay();

  // Check if it's a working day
  if (!settings.working_days.includes(dayOfWeek)) {
    return false;
  }

  // Parse business hours
  const [startHour, startMinute] = settings.business_hours_start.split(':').map(Number);
  const [endHour, endMinute] = settings.business_hours_end.split(':').map(Number);

  const businessStart = new Date(startTime);
  businessStart.setHours(startHour, startMinute, 0, 0);

  const businessEnd = new Date(startTime);
  businessEnd.setHours(endHour, endMinute, 0, 0);

  return startTime >= businessStart && endTime <= businessEnd;
};

/**
 * Generate available time slots for an employee
 * @param {string} employeeId - Employee ID
 * @param {number} durationMinutes - Job duration in minutes
 * @param {Date} searchStartDate - Start date for search
 * @param {Date} searchEndDate - End date for search
 * @param {Object} settings - Scheduling settings
 * @returns {Array} - Array of available time slots
 */
export const findAvailableTimeSlots = async (employeeId, durationMinutes, searchStartDate, searchEndDate, settings) => {
  try {
    // Get existing schedule events
    const existingEvents = await getEmployeeSchedule(employeeId, settings.company_id, searchStartDate, searchEndDate);

    // Phase 1: capacity guard per employee (hours/day)
    let capacityHoursPerDay = 8;
    try {
      const empRes = await fetch(
        `${SUPABASE_URL}/rest/v1/employees?user_id=eq.${employeeId}&company_id=eq.${settings.company_id}&select=id,capacity_hours_per_day`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      if (empRes.ok) {
        const rows = await empRes.json();
        if (rows && rows.length > 0) {
          const v = parseFloat(rows[0].capacity_hours_per_day);
          if (!isNaN(v) && v > 0) capacityHoursPerDay = v;
        }
      }
    } catch (e) {
      console.warn('Capacity fetch failed, defaulting to 8h/day');
    }

    const availableSlots = [];
    const slotDurationMs = durationMinutes * 60 * 1000;

    // helper: compute already booked minutes for the slot's day
    const calcBookedMinutesForDay = (dayStart) => {
      const start = new Date(dayStart);
      start.setHours(0,0,0,0);
      const end = new Date(dayStart);
      end.setHours(23,59,59,999);
      let totalMs = 0;
      for (const ev of existingEvents) {
        const es = new Date(ev.start_time).getTime();
        const ee = new Date(ev.end_time).getTime();
        const overlapStart = Math.max(start.getTime(), es);
        const overlapEnd = Math.min(end.getTime(), ee);
        if (overlapEnd > overlapStart) {
          totalMs += (overlapEnd - overlapStart);
        }
      }
      return Math.round(totalMs / 60000);
    };

    // Ensure we don't schedule too far in advance or too soon
    const minBookingTime = new Date();
    minBookingTime.setHours(minBookingTime.getHours() + settings.min_advance_booking_hours);

    const maxBookingTime = new Date();
    maxBookingTime.setDate(maxBookingTime.getDate() + settings.max_advance_booking_days);

    const actualStartDate = new Date(Math.max(searchStartDate.getTime(), minBookingTime.getTime()));
    const actualEndDate = new Date(Math.min(searchEndDate.getTime(), maxBookingTime.getTime()));

    // Generate clean 15-minute interval time slots
    const cleanTimeSlots = generateCleanTimeSlots(actualStartDate, actualEndDate, 15);

    // Check each clean time slot for availability
    for (const slotStartTime of cleanTimeSlots) {
      const slotEndTime = new Date(slotStartTime.getTime() + slotDurationMs);

      // Skip if slot extends beyond search end date
      if (slotEndTime > actualEndDate) {
        continue;
      }

      // Check if within business hours
      if (!isWithinBusinessHours(slotStartTime, slotEndTime, settings)) {
        continue;
      }

      // Capacity guard: total booked minutes for the day + this job cannot exceed capacity
      const bookedMinutes = calcBookedMinutesForDay(slotStartTime);
      if ((bookedMinutes + durationMinutes) > (capacityHoursPerDay * 60)) {
        if (window.DEBUG_SCHEDULING) {
          console.log('⛔ Slot exceeds capacity for the day', { bookedMinutes, durationMinutes, capacityHoursPerDay });
        }
        continue;
      }

      // Check for conflicts using enhanced buffer settings (GPT-5 fix: correct parameter order)
      const hasConflict = hasTimeConflict(existingEvents, slotStartTime, slotEndTime, settings);
      if (!hasConflict) {
        // FIXED: Remove excessive logging that was causing infinite console spam
        // Only log in debug mode or when specifically needed
        if (window.DEBUG_SCHEDULING) {
          console.log('✅ SLOT ADDED:', slotStartTime.toISOString(), 'to', slotEndTime.toISOString());
        }
        availableSlots.push({
          start_time: new Date(slotStartTime),
          end_time: new Date(slotEndTime),
          duration_minutes: durationMinutes,
          employee_id: employeeId,
          buffer_before: settings.default_buffer_before_minutes || 30,
          buffer_after: settings.default_buffer_after_minutes || 30,
          is_clean_interval: true // Flag to indicate this is a professionally rounded time
        });

        // No arbitrary limit - show all available slots for the full work week
      }
    }

    console.log(`🎯 CONFLICT SUMMARY for employee ${employeeId}:`);
    console.log(`   - Existing events: ${existingEvents.length}`);
    console.log(`   - Available slots: ${availableSlots.length}`);
    console.log(`   - Duration: ${durationMinutes} minutes`);
    console.log(`   - Search range: ${searchStartDate.toISOString()} to ${searchEndDate.toISOString()}`);

    return availableSlots;
  } catch (error) {
    console.error('Error finding available time slots:', error);
    return [];
  }
};

/**
 * Get smart scheduling suggestions for multiple employees
 * @param {Array} employeeIds - Array of employee IDs
 * @param {number} durationMinutes - Job duration in minutes
 * @param {string} companyId - Company ID
 * @param {Date} preferredDate - Preferred date (optional)
 * @returns {Object} - Suggestions grouped by employee
 */
export const getSmartSchedulingSuggestions = async (employeeIds, durationMinutes, companyId, preferredStartDate = null, preferredEndDate = null) => {
  try {
    const settings = await getSchedulingSettings(companyId);

    // Set search date range - respect user's date range selection
    const searchStartDate = preferredStartDate || new Date();
    const searchEndDate = preferredEndDate || new Date(searchStartDate.getTime() + 14 * 24 * 60 * 60 * 1000); // Default 2 weeks if not specified

    const suggestions = {};

    // Get suggestions for each employee
    for (const employeeId of employeeIds) {
      const slots = await findAvailableTimeSlots(
        employeeId,
        durationMinutes,
        searchStartDate,
        searchEndDate,
        settings
      );

      suggestions[employeeId] = {
        employee_id: employeeId,
        available_slots: slots, // Show all available slots
        total_available: slots.length
      };
    }

    return {
      suggestions,
      settings,
      search_period: {
        start: searchStartDate,
        end: searchEndDate
      }
    };
  } catch (error) {
    console.error('Error getting smart scheduling suggestions:', error);
    return { suggestions: {}, settings: DEFAULT_SCHEDULING_SETTINGS };
  }
};

/**
 * Create a schedule event
 * @param {Object} eventData - Event data
 * @returns {Object} - Created event or error
 */
export const createScheduleEvent = async (eventData) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/schedule_events`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...eventData,
        company_id: eventData.company_id, // must be provided by caller
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });

    if (response.ok) {
      const events = await response.json();
      return { success: true, event: events[0] };
    } else {
      const error = await response.json();
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error('Error creating schedule event:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate customer self-scheduling link
 * @param {string} quoteId - Quote ID
 * @param {string} customerId - Customer ID
 * @param {number} durationMinutes - Job duration
 * @returns {string} - Self-scheduling URL
 */
export const generateSelfSchedulingLink = (quoteId, customerId, durationMinutes) => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    quote_id: quoteId,
    customer_id: customerId,
    duration: durationMinutes
  });

  return `${baseUrl}/schedule-appointment?${params.toString()}`;
};

/**
 * Format time slot for display with clean professional formatting
 * @param {Object} slot - Time slot object
 * @returns {string} - Formatted time slot
 */
export const formatTimeSlot = (slot) => {
  const startTime = new Date(slot.start_time);
  const endTime = new Date(slot.end_time);

  const dateStr = startTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Use clean formatting for professional appearance
  const timeStr = `${startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })} - ${endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })}`;

  // Add indicator for clean intervals
  const cleanIndicator = slot.is_clean_interval ? ' ✨' : '';

  return `${dateStr} at ${timeStr}${cleanIndicator}`;
};

/**
 * Format time for display in 12-hour format with clean intervals
 * @param {Date} date - Date to format
 * @returns {string} - Formatted time
 */
export const formatCleanTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get duration display string
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hr${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }
};
