import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to get timezone offset from IANA timezone name
// Returns the offset in hours (e.g., -7 for PDT, -8 for PST, -5 for EST)
function getTimezoneOffset(timezone: string): number {
  // Common timezone offsets (standard time, not DST)
  const timezoneOffsets: Record<string, number> = {
    'America/Los_Angeles': -8,  // PST
    'America/Denver': -7,        // MST
    'America/Chicago': -6,       // CST
    'America/New_York': -5,      // EST
    'America/Phoenix': -7,       // MST (no DST)
    'America/Anchorage': -9,     // AKST
    'Pacific/Honolulu': -10,     // HST
    'America/Toronto': -5,       // EST
    'America/Vancouver': -8,     // PST
    'Europe/London': 0,          // GMT
    'Europe/Paris': 1,           // CET
    'Asia/Tokyo': 9,             // JST
    'Australia/Sydney': 10,      // AEST
  }

  // Return the offset, or default to PST if timezone not found
  return timezoneOffsets[timezone] || -8
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { employeeIds, durationMinutes, companyId, startDate, endDate } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    console.log('📅 Smart Scheduling Request:', {
      employeeIds,
      durationMinutes,
      companyId,
      startDate,
      endDate
    })

    // Get scheduling settings including timezone
    console.log('🔍 DEBUG - Fetching settings for company:', companyId)
    const { data: settings, error: settingsError } = await supabaseClient
      .from('companies')
      .select('job_buffer_minutes, default_buffer_before_minutes, default_buffer_after_minutes, business_hours_start, business_hours_end, working_days, min_advance_booking_hours, max_advance_booking_days, timezone')
      .eq('id', companyId)
      .single()

    console.log('🔍 DEBUG - Settings query result:', {
      settings,
      error: settingsError,
      hasSettings: !!settings
    })

    if (settingsError) {
      console.error('❌ Error loading settings:', settingsError)
      throw new Error(`Failed to load scheduling settings: ${settingsError.message}`)
    }

    // Validate required settings exist - NO DEFAULTS!
    if (!settings) {
      console.error('❌ No settings found for company:', companyId)
      throw new Error('Company settings not found. Please configure scheduling settings in Settings page.')
    }

    console.log('🔍 DEBUG - Raw settings from database:', {
      business_hours_start: settings.business_hours_start,
      business_hours_end: settings.business_hours_end,
      working_days: settings.working_days,
      timezone: settings.timezone,
      buffers: {
        job_buffer_minutes: settings.job_buffer_minutes,
        default_buffer_before_minutes: settings.default_buffer_before_minutes,
        default_buffer_after_minutes: settings.default_buffer_after_minutes
      }
    })

    if (!settings.business_hours_start || !settings.business_hours_end) {
      console.error('❌ Missing business hours for company:', companyId, settings)
      throw new Error('Business hours not configured. Please set business hours in Settings page.')
    }

    if (!settings.working_days || settings.working_days.length === 0) {
      console.error('❌ Missing working days for company:', companyId, settings)
      throw new Error('Working days not configured. Please set working days in Settings page.')
    }

    if (!settings.timezone) {
      console.error('❌ Missing timezone for company:', companyId, settings)
      throw new Error('Timezone not configured. Please set timezone in Settings page.')
    }

    // Build settings object - use actual values, fail if missing critical ones
    const schedulingSettings = {
      company_id: companyId,
      job_buffer_minutes: settings.job_buffer_minutes ?? 30, // Optional, can default
      default_buffer_before_minutes: settings.default_buffer_before_minutes ?? 30, // Optional
      default_buffer_after_minutes: settings.default_buffer_after_minutes ?? 30, // Optional
      business_hours_start: settings.business_hours_start, // Required
      business_hours_end: settings.business_hours_end, // Required
      working_days: settings.working_days, // Required
      min_advance_booking_hours: settings.min_advance_booking_hours ?? 1, // Optional
      max_advance_booking_days: settings.max_advance_booking_days ?? 90, // Optional
      capacity_hours_per_day: 8, // Standard workday
      timezone: settings.timezone // Required
    }

    console.log('✅ Final scheduling settings:', schedulingSettings)

    // Get available slots for each employee
    const suggestions: any = {}

    for (const employeeId of employeeIds) {
      const slots = await findAvailableTimeSlots(
        supabaseClient,
        employeeId,
        durationMinutes,
        new Date(startDate),
        new Date(endDate),
        schedulingSettings
      )

      suggestions[employeeId] = {
        employee_id: employeeId,
        available_slots: slots,
        total_available: slots.length
      }
    }

    console.log('✅ Generated suggestions for', Object.keys(suggestions).length, 'employees')

    return new Response(
      JSON.stringify({
        suggestions,
        settings: schedulingSettings,
        search_period: {
          start: startDate,
          end: endDate
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Helper functions

function roundToNext15Minutes(date: Date): Date {
  const minutes = date.getMinutes()
  const remainder = minutes % 15
  const roundedMinutes = remainder === 0 ? minutes : minutes + (15 - remainder)
  
  const rounded = new Date(date)
  rounded.setMinutes(roundedMinutes, 0, 0)
  
  return rounded
}

function generateCleanTimeSlots(startTime: Date, endTime: Date, intervalMinutes = 15): Date[] {
  const slots: Date[] = []
  let currentTime = roundToNext15Minutes(new Date(startTime))

  while (currentTime < endTime) {
    slots.push(new Date(currentTime))
    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes)
  }

  return slots
}

function isWithinBusinessHours(startTime: Date, endTime: Date, settings: any): boolean {
  const dayOfWeek = startTime.getDay()

  // Check if it's a working day
  if (!settings.working_days.includes(dayOfWeek)) {
    return false
  }

  // Parse business hours
  const [startHour, startMinute] = settings.business_hours_start.split(':').map(Number)
  const [endHour, endMinute] = settings.business_hours_end.split(':').map(Number)

  const businessStart = new Date(startTime)
  businessStart.setHours(startHour, startMinute, 0, 0)

  const businessEnd = new Date(startTime)
  businessEnd.setHours(endHour, endMinute, 0, 0)

  return startTime >= businessStart && endTime <= businessEnd
}

async function getEmployeeSchedule(supabaseClient: any, employeeId: string, companyId: string, startDate: Date, endDate: Date) {
  // Get schedule events
  const { data: scheduleEvents, error: scheduleError } = await supabaseClient
    .from('schedule_events')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('start_time', startDate.toISOString())
    .lte('end_time', endDate.toISOString())

  if (scheduleError) {
    console.error('Error loading schedule events:', scheduleError)
    return []
  }

  // Get work orders
  const { data: workOrders, error: workOrdersError } = await supabaseClient
    .from('work_orders')
    .select('id, scheduled_start, scheduled_end, assigned_to')
    .eq('company_id', companyId)
    .eq('assigned_to', employeeId)
    .gte('scheduled_start', startDate.toISOString())
    .lte('scheduled_end', endDate.toISOString())
    .in('status', ['scheduled', 'in_progress'])

  if (workOrdersError) {
    console.error('Error loading work orders:', workOrdersError)
    return scheduleEvents || []
  }

  // Combine and normalize
  const allEvents = [
    ...(scheduleEvents || []).map((e: any) => ({
      id: e.id,
      start_time: e.start_time,
      end_time: e.end_time,
      type: 'schedule_event'
    })),
    ...(workOrders || []).map((wo: any) => ({
      id: wo.id,
      start_time: wo.scheduled_start,
      end_time: wo.scheduled_end,
      type: 'work_order'
    }))
  ]

  return allEvents
}

function hasTimeConflict(existingEvents: any[], slotStart: Date, slotEnd: Date, settings: any): boolean {
  const bufferBefore = (settings.default_buffer_before_minutes || 30) * 60 * 1000
  const bufferAfter = (settings.default_buffer_after_minutes || 30) * 60 * 1000

  const s = slotStart.getTime()
  const e = slotEnd.getTime()

  return existingEvents.some(event => {
    const es = new Date(event.start_time).getTime()
    const ee = new Date(event.end_time).getTime()

    const bufferedStart = es - bufferBefore
    const bufferedEnd = ee + bufferAfter

    return s < bufferedEnd && e > bufferedStart
  })
}

async function findAvailableTimeSlots(
  supabaseClient: any,
  employeeId: string,
  durationMinutes: number,
  searchStartDate: Date,
  searchEndDate: Date,
  settings: any
) {
  // Get existing schedule events
  const existingEvents = await getEmployeeSchedule(
    supabaseClient,
    employeeId,
    settings.company_id,
    searchStartDate,
    searchEndDate
  )

  const capacityHoursPerDay = settings.capacity_hours_per_day || 8
  const availableSlots: any[] = []
  const slotDurationMs = durationMinutes * 60 * 1000

  // Parse business hours
  const [startHour, startMinute] = settings.business_hours_start.split(':').map(Number)
  const [endHour, endMinute] = settings.business_hours_end.split(':').map(Number)

  // Get timezone offset from IANA timezone name
  // This converts company's local time to UTC
  const timezoneOffset = getTimezoneOffset(settings.timezone || 'America/Los_Angeles')

  // Calculate booked minutes for a day
  const calcBookedMinutesForDay = (dayStart: Date) => {
    const start = new Date(dayStart)
    start.setHours(0, 0, 0, 0)
    const end = new Date(dayStart)
    end.setHours(23, 59, 59, 999)

    let totalMs = 0
    for (const ev of existingEvents) {
      const es = new Date(ev.start_time).getTime()
      const ee = new Date(ev.end_time).getTime()
      const overlapStart = Math.max(start.getTime(), es)
      const overlapEnd = Math.min(end.getTime(), ee)
      if (overlapEnd > overlapStart) {
        totalMs += (overlapEnd - overlapStart)
      }
    }
    return Math.round(totalMs / 60000)
  }

  // Ensure we don't schedule too far in advance or too soon
  const minBookingTime = new Date()
  minBookingTime.setHours(minBookingTime.getHours() + settings.min_advance_booking_hours)

  const maxBookingTime = new Date()
  maxBookingTime.setDate(maxBookingTime.getDate() + settings.max_advance_booking_days)

  const actualStartDate = new Date(Math.max(searchStartDate.getTime(), minBookingTime.getTime()))
  const actualEndDate = new Date(Math.min(searchEndDate.getTime(), maxBookingTime.getTime()))

  // Generate slots day by day, only during business hours
  let currentDay = new Date(actualStartDate)
  currentDay.setUTCHours(0, 0, 0, 0)

  while (currentDay <= actualEndDate) {
    const dayOfWeek = currentDay.getUTCDay()

    // Check if it's a working day
    if (settings.working_days.includes(dayOfWeek)) {
      // Set business hours for this day in company's local time
      // Convert local business hours to UTC by subtracting timezone offset
      const dayStart = new Date(currentDay)
      dayStart.setUTCHours(startHour - timezoneOffset, startMinute, 0, 0)

      const dayEnd = new Date(currentDay)
      dayEnd.setUTCHours(endHour - timezoneOffset, endMinute, 0, 0)

      // Apply buffer relative to business open so earliest slot respects prep/travel
      const bufferBeforeMs = ((settings.default_buffer_before_minutes ?? settings.job_buffer_minutes ?? 0) * 60 * 1000)

      // Make sure we don't start before actualStartDate and respect opening buffer
      const effectiveStart = new Date(Math.max(dayStart.getTime() + bufferBeforeMs, actualStartDate.getTime()))

      // Round to next 15-minute interval
      const roundedStart = roundToNext15Minutes(effectiveStart)

      // Generate 15-minute slots for this day's business hours
      // DYNAMIC: Show ALL available slots, let customer choose
      let slotStartTime = new Date(roundedStart)

      console.log(`🔍 DEBUG - Day ${currentDay.toISOString().split('T')[0]}:`, {
        dayStart: dayStart.toISOString(),
        dayEnd: dayEnd.toISOString(),
        roundedStart: roundedStart.toISOString(),
        durationMinutes,
        slotDurationMs,
        businessHoursStart: settings.business_hours_start,
        businessHoursEnd: settings.business_hours_end
      })

      while (slotStartTime < dayEnd) {
        const slotEndTime = new Date(slotStartTime.getTime() + slotDurationMs)

        // DEBUG: Log each slot check
        const slotStartLocal = slotStartTime.toLocaleString('en-US', { timeZone: settings.timezone })
        const slotEndLocal = slotEndTime.toLocaleString('en-US', { timeZone: settings.timezone })
        const dayEndLocal = dayEnd.toLocaleString('en-US', { timeZone: settings.timezone })

        console.log(`  🕐 Checking slot: ${slotStartLocal} - ${slotEndLocal} (dayEnd: ${dayEndLocal})`)

        // Skip if slot extends beyond business hours or search end date
        if (slotEndTime > dayEnd || slotEndTime > actualEndDate) {
          console.log(`    ❌ Rejected: extends beyond business hours (${slotEndTime.toISOString()} > ${dayEnd.toISOString()})`)
          slotStartTime.setMinutes(slotStartTime.getMinutes() + 15)
          continue
        }

        // Capacity guard: check if adding this job would exceed daily capacity
        const bookedMinutes = calcBookedMinutesForDay(slotStartTime)
        if ((bookedMinutes + durationMinutes) > (capacityHoursPerDay * 60)) {
          console.log(`    ❌ Rejected: exceeds capacity (${bookedMinutes} + ${durationMinutes} > ${capacityHoursPerDay * 60})`)
          slotStartTime.setMinutes(slotStartTime.getMinutes() + 15)
          continue
        }

        // Check for conflicts
        if (!hasTimeConflict(existingEvents, slotStartTime, slotEndTime, settings)) {
          console.log(`    ✅ Accepted: ${slotStartLocal} - ${slotEndLocal}`)
          availableSlots.push({
            start_time: slotStartTime.toISOString(),
            end_time: slotEndTime.toISOString(),
            duration_minutes: durationMinutes,
            employee_id: employeeId,
            buffer_before: settings.default_buffer_before_minutes ?? 30,
            buffer_after: settings.default_buffer_after_minutes ?? 30,
            is_clean_interval: true
          })
        } else {
          console.log(`    ❌ Rejected: time conflict`)
        }

        // Move to next 15-minute slot
        slotStartTime.setMinutes(slotStartTime.getMinutes() + 15)
      }
    }

    // Move to next day
    currentDay.setDate(currentDay.getDate() + 1)
  }

  return availableSlots
}

