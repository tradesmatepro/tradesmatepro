import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { hasModuleAccess, MODULES } from '../utils/simplePermissions';
import {
  getSmartSchedulingSuggestions,
  formatTimeSlot,
  formatCleanTime,
  formatDuration,
  generateSelfSchedulingLink,
  getSchedulingSettings,
  createScheduleEvent,
  hasTimeConflict,
  getEmployeeSchedule
} from '../utils/smartScheduling';
import { supaFetch } from '../utils/supaFetch';
import {
  SparklesIcon,
  ClockIcon,
  UserIcon,
  CalendarDaysIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

// GPT-5 fix: Day filter helper
const matchesDay = (d, selectedDay) => {
  if (selectedDay === 'all') return true;
  const day = new Date(d).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return day === selectedDay;
};

const SmartSchedulingAssistant = ({ isOpen = true, onClose, jobData = null, onEventCreated = null }) => {
  const { user } = useUser();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('any'); // 'any' or specific employee ID
  const [jobDuration, setJobDuration] = useState(2); // Default 2 hours (per-employee block)
  const [crewRequired, setCrewRequired] = useState(1); // From labor_summary if available
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [dateRange, setDateRange] = useState('this_week'); // 'this_week', 'next_week', 'anytime', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedDay, setSelectedDay] = useState('all'); // 'all' or specific weekday name (lowercase)
  const [suggestions, setSuggestions] = useState({});
  const [schedulingSettings, setSchedulingSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);

  // Check if user has calendar/scheduling permissions
  const canSchedule = hasModuleAccess(user, MODULES.CALENDAR) || hasModuleAccess(user, MODULES.JOBS);

  useEffect(() => {
    if (isOpen && canSchedule) {
      loadEmployees();
      loadSchedulingSettings();

      // Pre-fill data if jobData is provided
      if (jobData) {
        console.log('📋 Job data received:', jobData);

        // Prefer labor_summary for crew size and per-employee daily duration
        if (jobData.labor_summary) {
          const ls = jobData.labor_summary;
          const perEmployeeHours = ls.hours_per_day || 8; // per-day duration per employee
          setJobDuration(perEmployeeHours);
          setCrewRequired(ls.crew_size || 1);
          console.log('👥 Using labor_summary for scheduling:', { crew: ls.crew_size, hoursPerDay: perEmployeeHours });
        } else {
          // Fallback: Calculate crew size and per-person hours from work order items (legacy)
          let totalLaborHours = 0;
          let crewSize = 1;

          // ✅ STANDARDIZATION FIX: Support both work_order_items and quote_items (legacy)
          const items = jobData.work_order_items || jobData.quote_items;
          if (items && Array.isArray(items)) {
            totalLaborHours = items
              .filter(item => item.item_type === 'labor')
              .reduce((sum, item) => sum + (item.quantity || 0), 0);
            console.log('💼 Found total labor hours from items:', totalLaborHours);

            // If we have a lot of labor hours, assume it needs multiple people
            if (totalLaborHours > 8) {
              crewSize = Math.ceil(totalLaborHours / 8); // Assume 8-hour workdays
              console.log(`📊 Large job (${totalLaborHours}h) - suggesting crew of ${crewSize}`);
            }
          }

          // Calculate per-person duration
          const totalDuration = totalLaborHours > 0 ? totalLaborHours : (jobData.estimated_duration || 16);
          const perPersonHours = Math.min(totalDuration / crewSize, 8); // Max 8 hours per person per day

          setJobDuration(perPersonHours);
          setCrewRequired(crewSize);
          console.log('🔧 Fallback calculation:', { totalHours: totalDuration, crewSize, perPersonHours });
        }
        setJobTitle(jobData.job_title || jobData.title || '');
        setJobDescription(jobData.description || '');
        // ✅ STANDARDIZATION FIX: Use employee_id (new) or assigned_technician_id (legacy)
        const technicianId = jobData.employee_id || jobData.assigned_technician_id;
        if (technicianId) {
          setSelectedEmployee(technicianId);
        }
        // If job has a start time, use that date
        if (jobData.start_time) {
          setCustomStartDate(jobData.start_time.split('T')[0]);
          setDateRange('custom');
        }
      }
    }
  }, [isOpen, jobData, canSchedule]);
  // Load employees from Supabase using supaFetch for consistent scoping
  const loadEmployees = async () => {
    try {
      // ✅ INDUSTRY STANDARD: Query employees table, join with users table, filter by is_schedulable
      // NOTE: Filter on main table uses column=eq.value, filter on joined table uses table.column=eq.value
      const queryString = `employees?select=id,user_id,job_title,is_schedulable,users!inner(id,first_name,last_name,name,role,status)&is_schedulable=eq.true&order=users(name).asc`;
      console.log('🔍 SMART SCHEDULER - Query string:', queryString);
      console.log('🔍 SMART SCHEDULER - Company ID:', user.company_id);

      const response = await supaFetch(
        queryString,
        { method: 'GET' },
        user.company_id
      );

      console.log('🔍 SMART SCHEDULER - Response status:', response.status);

      if (response.ok) {
        const employeeData = await response.json();
        console.log('📋 SMART SCHEDULER - Raw employee data from API:', employeeData);
        console.log('📋 SMART SCHEDULER - Number of employees returned:', employeeData.length);

        // Map to expected format (employees table joined with users table)
        const mappedEmployees = employeeData
          .filter(emp => emp.users) // Only include if user data exists
          .map(emp => ({
            id: emp.user_id, // User ID for display
            employee_id: emp.id, // Employee record ID for saving
            full_name: emp.users.name, // ✅ Use computed name column from users
            first_name: emp.users.first_name,
            last_name: emp.users.last_name,
            role: emp.users.role,
            status: emp.users.status,
            job_title: emp.job_title,
            is_schedulable: emp.is_schedulable
          }));

        console.log('✅ SMART SCHEDULER - Mapped employees:', mappedEmployees);
        // Phase 1: filter by required skills if this job has any
        let finalEmployees = mappedEmployees;
        try {
          if (jobData?.id) {
            const reqRes = await supaFetch(
              `work_order_required_skills?work_order_id=eq.${jobData.id}&select=skill_id,required_level,quantity`,
              { method: 'GET' },
              user.company_id
            );
            const required = reqRes.ok ? (await reqRes.json()) : [];
            if (required && required.length > 0) {
              const empIdsCsv = mappedEmployees.map(e => e.employee_id).filter(Boolean).join(',');
              let empSkillsMap = new Map();
              if (empIdsCsv) {
                const esRes = await supaFetch(
                  `employee_skills?employee_id=in.(${empIdsCsv})&select=employee_id,skill_id,level`,
                  { method: 'GET' },
                  user.company_id
                );
                const skillRows = esRes.ok ? (await esRes.json()) : [];
                for (const row of (skillRows || [])) {
                  if (!empSkillsMap.has(row.employee_id)) empSkillsMap.set(row.employee_id, new Map());
                  empSkillsMap.get(row.employee_id).set(row.skill_id, row.level ?? null);
                }
              }
              finalEmployees = mappedEmployees.filter(emp => {
                const map = empSkillsMap.get(emp.employee_id) || new Map();
                return required.every(req => {
                  const lvl = map.get(req.skill_id);
                  // If a level is required, ensure employee meets or exceeds it
                  if (req.required_level != null) {
                    return lvl != null && Number(lvl) >= Number(req.required_level);
                  }
                  // Otherwise, just ensure the skill exists
                  return lvl != null;
                });
              });
              console.log('🎯 Skills filter applied. Before:', mappedEmployees.length, 'After:', finalEmployees.length);
              if (finalEmployees.length === 0) {
                console.warn('No employees match required skills for this job. Showing all schedulable employees.');
                finalEmployees = mappedEmployees; // Non-blocking: let dispatcher choose, but UI shows zero slots if conflicts exist
              }
            }
          }
        } catch (e) {
          console.warn('Skills filtering skipped due to error:', e?.message || e);
        }
        console.log('✅ SMART SCHEDULER - Final employee count:', finalEmployees.length);
        // Exclude non-field roles by default (respect is_schedulable + role)
        const allowedRoles = new Set(['technician', 'lead_technician', 'field_tech']);
        finalEmployees = finalEmployees.filter(emp => allowedRoles.has((emp.role || '').toLowerCase()));

        setEmployees(finalEmployees);
      } else {
        const errorText = await response.text();
        console.error('❌ SMART SCHEDULER - Failed to load employees:', response.status, errorText);
        setEmployees([]);
      }
    } catch (error) {
      showAlert('error', 'Failed to load employees');
      setEmployees([]);
    }
  };

  const loadSchedulingSettings = async () => {
    try {
      const settings = await getSchedulingSettings(user.company_id);
      setSchedulingSettings(settings);
    } catch (error) {
      showAlert('error', 'Failed to load scheduling settings');
    }
  };



  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };



  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'this_week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // Start of this week
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of this week
        break;
      case 'next_week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() + 7); // Start of next week
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of next week
        break;
      case 'anytime':
        startDate = new Date(today);
        endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead
        break;
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : new Date(today);
        endDate = customEndDate ? new Date(customEndDate) : new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(today);
        endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  };

  const runSmartCheck = async () => {
    // Determine which employees to check
    let employeesToCheck = [];
    if (selectedEmployee === 'any') {
      employeesToCheck = employees.map(emp => emp.id);
    } else {
      employeesToCheck = [selectedEmployee];
    }

    if (employeesToCheck.length === 0) {
      showAlert('error', 'No employees available for scheduling');
      return;
    }

    if (jobDuration < 0.25) {
      showAlert('error', 'Job duration must be at least 15 minutes (0.25 hours)');
      return;
    }

    if (!jobTitle.trim()) {
      showAlert('error', 'Please enter a job title');
      return;
    }

    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      // We compute per-employee block duration from jobDuration and enforce crewRequired simultaneous availability later in UI
      const results = await getSmartSchedulingSuggestions(
        employeesToCheck,
        jobDuration * 60, // minutes per employee
        user.company_id,
        startDate,
        endDate // Pass the actual end date from user's selection
      );

      // If crewRequired > 1, filter to slots where at least N employees share the same start time window
      const suggestionsByEmp = results.suggestions || {};
      console.log('🔍 Raw suggestions from API:', suggestionsByEmp);
      console.log('🔍 Crew required:', crewRequired);
      let finalSuggestions = {};

      if (crewRequired > 1) {
        console.log('🔍 Filtering for crew of', crewRequired);
        const slotMap = new Map(); // key: ISO start, value: array of {empId, slot}
        Object.entries(suggestionsByEmp).forEach(([empId, data]) => {
          (data.available_slots || []).forEach(slot => {
            const key = new Date(slot.start_time).toISOString() + '|' + slot.duration_minutes;
            if (!slotMap.has(key)) slotMap.set(key, []);
            slotMap.get(key).push({ empId, slot });
          });
        });
        // Build filtered suggestions: only keep slots that appear for >= crewRequired distinct employees
        const qualifiedStarts = new Set(
          Array.from(slotMap.entries())
            .filter(([, arr]) => arr.length >= crewRequired)
            .map(([key]) => key)
        );
        const filtered = {};
        Object.entries(suggestionsByEmp).forEach(([empId, data]) => {
          const kept = (data.available_slots || []).filter(slot => {
            const key = new Date(slot.start_time).toISOString() + '|' + slot.duration_minutes;
            return qualifiedStarts.has(key);
          });
          filtered[empId] = { ...data, available_slots: kept, total_available: kept.length };
        });
        finalSuggestions = filtered;
      } else {
        finalSuggestions = suggestionsByEmp;
      }

      // GPT-5 fix: Don't setState twice, compute filtered counts directly
      console.log('🔍 Raw suggestions:', suggestionsByEmp);
      console.log('🔍 Final filtered suggestions:', finalSuggestions);
      console.log('🔍 Crew required:', crewRequired);

      setSuggestions(finalSuggestions);

      // Calculate total slots from the FINAL filtered results
      const totalSlots = Object.values(finalSuggestions).reduce((sum, emp) => sum + (emp.available_slots?.length || 0), 0);
      console.log('🔍 Total filtered slots:', totalSlots);

      if (totalSlots === 0) {
        // More helpful messaging based on date range selection
        let message = '';
        if (crewRequired > 1) {
          message = `No overlapping slots found for a crew of ${crewRequired} in the selected ${dateRange.replace('_', ' ')}.`;
        } else {
          message = `No available slots found in the selected ${dateRange.replace('_', ' ')}.`;
        }

        // Add specific suggestions based on current selection
        if (dateRange === 'this_week') {
          message += ' Try selecting "Next Week" or "Anytime" for more options.';
        } else if (dateRange === 'next_week') {
          message += ' Try selecting "Anytime" or a custom date range.';
        } else if (dateRange === 'custom') {
          message += ' Try expanding your date range or selecting "Anytime".';
        } else {
          message += ' Try reducing job duration or selecting different employees.';
        }

        showAlert('warning', message);
      } else {
        showAlert('success', `Found ${totalSlots} available time slots in ${dateRange.replace('_', ' ')}!`);
      }
    } catch (error) {
      showAlert('error', 'Failed to analyze schedule');
    } finally {
      setLoading(false);
    }
  };

  const scheduleAppointment = async (slot, employeeId) => {
    console.log('scheduleAppointment called with:', { slot, employeeId, crewRequired });
    setCreating(true);
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      console.log('Found employee:', employee);

      // Update the work order record directly (unified system - no separate schedule_events)
      if (jobData?.id) {
        console.log('Updating work order record:', jobData.id);

        // Enforce deposit policy if enabled
        try {
          if (schedulingSettings?.require_deposit_before_scheduling) {
            const depRes = await supaFetch(`work_orders?id=eq.${jobData.id}&select=deposit_amount,deposit_method`, { method: 'GET' }, user.company_id);
            if (depRes.ok) {
              const rows = await depRes.json();
              const wo = rows?.[0];
              const amt = parseFloat(wo?.deposit_amount || 0);
              const method = wo?.deposit_method || '';
              if (!amt || amt <= 0 || !method) {
                showAlert('error', 'Deposit required before scheduling. Please record a deposit on the quote/invoice first.');
                setCreating(false);
                return;
              }
            }
          }
        } catch (e) {
          console.warn('Deposit enforcement check failed', e);
        }

        // For crew jobs, we need to find all available employees for this time slot
        let assignedEmployees = [employeeId];
        if (crewRequired > 1) {
          // Find all employees that have this same time slot available
          const slotKey = new Date(slot.start_time).toISOString() + '|' + slot.duration_minutes;
          const availableForSlot = [];

          Object.entries(suggestions).forEach(([empId, data]) => {
            const hasSlot = (data.available_slots || []).some(s => {
              const key = new Date(s.start_time).toISOString() + '|' + s.duration_minutes;
              return key === slotKey;
            });
            if (hasSlot) {
              availableForSlot.push(empId);
            }
          });

          // Take the first crewRequired employees
          assignedEmployees = availableForSlot.slice(0, crewRequired);
          console.log(`Assigning ${assignedEmployees.length} employees for crew of ${crewRequired}:`, assignedEmployees);
        }

        // Final conflict check just before commit (prevents overlaps)
        try {
          const settings = await getSchedulingSettings(user.company_id);
          const startISO = slot.start_time.toISOString();
          const endISO = slot.end_time.toISOString();
          for (const empId of assignedEmployees) {
            const events = await getEmployeeSchedule(empId, user.company_id, new Date(startISO), new Date(endISO));
            const filtered = (events || []).filter(ev => ev?.id !== jobData.id && ev?.work_order_id !== jobData.id);
            if (hasTimeConflict(filtered, startISO, endISO, settings)) {
              const emp = employees.find(e => e.id === empId);
              showAlert('error', `Time conflict: ${emp?.full_name || 'Selected tech'} is already booked in that window.`);
              setCreating(false);
              return;
            }
          }
        } catch (conflictErr) {
          console.warn('Conflict pre-check failed, proceeding cautiously:', conflictErr);
        }

        // ✅ STANDARDIZATION FIX: Use correct work_orders column names
        const workOrderUpdateData = {
          status: 'scheduled', // ✅ Use status enum (lowercase)
          assigned_to: assignedEmployees[0], // ✅ work_orders uses 'assigned_to' column
          scheduled_start: slot.start_time.toISOString(), // ✅ work_orders uses 'scheduled_start' column
          scheduled_end: slot.end_time.toISOString(), // ✅ work_orders uses 'scheduled_end' column
          updated_at: new Date().toISOString()
        };

        console.log('Work order update data:', workOrderUpdateData);

        const workOrderUpdateResponse = await supaFetch(`work_orders?id=eq.${jobData.id}`, {
          method: 'PATCH',
          body: workOrderUpdateData,
          headers: {
            'Prefer': 'return=representation'
          }
        }, user.company_id);

        if (workOrderUpdateResponse.ok) {
          const updatedRecord = await workOrderUpdateResponse.json();
          console.log('Work order updated successfully. New record:', updatedRecord);

          // ⚠️ OPTIONAL: Labor tracking (work_order_labor table doesn't exist yet)
          // TODO: Implement labor tracking when work_order_labor table is created
          console.log('ℹ️ Skipping labor tracking (work_order_labor table not implemented yet)');

          // NOTE: The work order is already scheduled successfully above.
          // Labor tracking is optional and used for detailed crew hour tracking.

          const crewMessage = assignedEmployees.length > 1 ? ` with ${assignedEmployees.length} crew members` : '';
          if (typeof onEventCreated === 'function') {
            onEventCreated({
              id: jobData.id,
              start_time: slot.start_time.toISOString(),
              end_time: slot.end_time.toISOString(),
              employee_ids: assignedEmployees
            });
          }
          showAlert('success', `Work order scheduled successfully${crewMessage}!`);
        } else {
          const errorText = await workOrderUpdateResponse.text();
          console.error('Failed to update work order:', workOrderUpdateResponse.status, errorText);
          throw new Error('Failed to update work order record');
        }
      } else {
        throw new Error('No job data provided for scheduling');
      }

      // Remove the scheduled slot from suggestions
      setSuggestions(prev => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          available_slots: prev[employeeId].available_slots.filter(s =>
            s.start_time.getTime() !== slot.start_time.getTime()
          )
        }
      }));

      // Auto-close after successful scheduling
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      showAlert('error', 'Error scheduling appointment');
    } finally {
      setCreating(false);
    }
  };

  // New function specifically for crew scheduling
  const scheduleCrewAppointment = async (slot) => {
    console.log('scheduleCrewAppointment called with:', { slot, crewRequired });
    // Store debug info in localStorage
    localStorage.setItem('crewSchedulingDebug', JSON.stringify({
      timestamp: new Date().toISOString(),
      slot: slot,
      crewRequired: crewRequired,
      availableEmployees: slot.availableEmployees
    }));

    setCreating(true);
    try {
      if (jobData?.id) {
        console.log('Scheduling crew for work order:', jobData.id);

        // Enforce deposit policy if enabled
        try {
          if (schedulingSettings?.require_deposit_before_scheduling) {
            const depRes = await supaFetch(`work_orders?id=eq.${jobData.id}&select=deposit_amount,deposit_method`, { method: 'GET' }, user.company_id);
            if (depRes.ok) {
              const rows = await depRes.json();
              const wo = rows?.[0];
              const amt = parseFloat(wo?.deposit_amount || 0);
              const method = wo?.deposit_method || '';
              if (!amt || amt <= 0 || !method) {
                showAlert('error', 'Deposit required before scheduling. Please record a deposit on the quote/invoice first.');
                setCreating(false);
                return;
              }
            }
          }
        } catch (e) {
          console.warn('Deposit enforcement check failed', e);
        }

        // Get the employees that will be assigned to this crew slot
        const assignedEmployees = slot.availableEmployees || [];
        console.log(`Assigning ${assignedEmployees.length} employees for crew of ${crewRequired}:`, assignedEmployees);

        // ✅ STANDARDIZATION FIX: Use correct work_orders column names
        // Final conflict check for crew just before commit
        try {
          const settings = await getSchedulingSettings(user.company_id);
          const startISO = slot.start_time.toISOString();
          const endISO = slot.end_time.toISOString();
          for (const empId of assignedEmployees) {
            const events = await getEmployeeSchedule(empId, user.company_id, new Date(startISO), new Date(endISO));
            const filtered = (events || []).filter(ev => ev?.id !== jobData.id && ev?.work_order_id !== jobData.id);
            if (hasTimeConflict(filtered, startISO, endISO, settings)) {
              const emp = employees.find(e => e.id === empId);
              showAlert('error', `Time conflict: ${emp?.full_name || 'A crew member'} is already booked in that window.`);
              setCreating(false);
              return;
            }
          }
        } catch (conflictErr) {
          console.warn('Crew conflict pre-check failed:', conflictErr);
        }

        const workOrderUpdateData = {
          status: 'scheduled', // ✅ Use status enum (lowercase)
          assigned_to: assignedEmployees[0], // ✅ work_orders uses 'assigned_to' column
          scheduled_start: slot.start_time.toISOString(), // ✅ work_orders uses 'scheduled_start' column
          scheduled_end: slot.end_time.toISOString(), // ✅ work_orders uses 'scheduled_end' column
          updated_at: new Date().toISOString()
        };

        console.log('Work order update data:', workOrderUpdateData);

        const workOrderUpdateResponse = await supaFetch(`work_orders?id=eq.${jobData.id}`, {
          method: 'PATCH',
          body: workOrderUpdateData,
          headers: {
            'Prefer': 'return=representation'
          }
        }, user.company_id);

        if (workOrderUpdateResponse.ok) {
          const updatedRecord = await workOrderUpdateResponse.json();
          console.log('Work order updated successfully. New record:', updatedRecord);

          // ⚠️ OPTIONAL: Labor tracking (work_order_labor table doesn't exist yet)
          // TODO: Implement labor tracking when work_order_labor table is created
          console.log('ℹ️ Skipping labor tracking (work_order_labor table not implemented yet)');

          // NOTE: The work order is already scheduled successfully above.
          // Labor tracking is optional and used for detailed crew hour tracking.

          // Success - avoid relying on any 'stage' field
          showAlert('success', `Crew of ${assignedEmployees.length} scheduled successfully!`);

          // Trigger refresh of parent component
          if (onEventCreated) {
            onEventCreated({
              id: jobData.id,
              start_time: slot.start_time.toISOString(),
              end_time: slot.end_time.toISOString(),
              employee_ids: assignedEmployees
            });
          }

          // Add delay so we can see console logs before redirect
          console.log('🎯 SCHEDULING COMPLETE - Waiting 3 seconds before closing...');
          await new Promise(r => setTimeout(r, 3000));

          // Close the assistant
          if (onClose) onClose();
        } else {
          const errorText = await workOrderUpdateResponse.text();
          console.error('Failed to update work order:', workOrderUpdateResponse.status, errorText);
          throw new Error('Failed to update work order record');
        }
      } else {
        throw new Error('No job data provided for scheduling');
      }
    } catch (error) {
      console.error('Error scheduling crew appointment:', error);
      showAlert('error', 'Failed to schedule crew appointment: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const generateCustomerLink = () => {
    if (!jobData?.quote_id || !jobData?.customer_id) {
      showAlert('error', 'Quote and customer information required');
      return;
    }

    const link = generateSelfSchedulingLink(jobData.quote_id, jobData.customer_id, jobDuration * 60); // Convert to minutes
    navigator.clipboard.writeText(link);
    showAlert('success', 'Self-scheduling link copied to clipboard!');
  };

  // GPT-5 fix: Derive filtered slots once and reuse
  const employeesWithDisplaySlots = React.useMemo(() => {
    const entries = Object.entries(suggestions || {});
    return entries.map(([empId, data]) => {
      const employee = employees.find(e => e.id === empId);
      const slots = (data?.available_slots || []).filter(s =>
        matchesDay(s.start_time, selectedDay)
      );
      return { empId, name: employee?.full_name || 'Employee', slots, data };
    }).filter(e => e.slots.length > 0);
  }, [suggestions, selectedDay, employees]);

  const totalDisplaySlots = React.useMemo(
    () => employeesWithDisplaySlots.reduce((sum, e) => sum + e.slots.length, 0),
    [employeesWithDisplaySlots]
  );

  if (!isOpen) return null;

  // Check permissions
  if (!canSchedule) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />



            <h3 className="text-lg font-semibold text-red-600">Access Denied</h3>
          </div>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the Smart Scheduling Assistant.
          </p>
          <button onClick={onClose} className="w-full btn-secondary">
            Close
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex flex-1 min-h-0">
          {/* Configuration Panel */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold">Smart Scheduling</h3>
              </div>
              <p className="text-sm text-gray-600">AI-powered appointment scheduling</p>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., HVAC Maintenance, Electrical Repair"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Additional details about the job..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Job Duration */}
              <div>

	              {/* Crew size (from labor summary) */}
	              <div>
	                <label className="block text-sm font-medium text-gray-700 mb-2">
	                  Crew Required
	                </label>
	                <input
	                  type="number"
	                  min="1"
	                  value={crewRequired}
	                  onChange={(e) => setCrewRequired(parseInt(e.target.value) || 1)}
	                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
	                />
	                <p className="text-xs text-gray-500 mt-1">We’ll look for overlapping availability for {crewRequired} employees at the same start time.</p>
	              </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Duration per employee (hours) *
                </label>
                <input
                  type="number"
                  value={jobDuration}
                  onChange={(e) => setJobDuration(parseFloat(e.target.value) || 0)}
                  min="0.25"
                  max="24"
                  step="0.25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">This is the hours per person for the day. We’ll find overlapping availability based on Crew Required.</p>
              </div>

              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Employee
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="any">Any Available Employee</option>
                  {Array.from(new Map((employees || []).map(e => [e.id, e])).values()).map((employee, idx) => (
                    <option key={`${employee.id}-${idx}`} value={employee.id}>
                      {employee.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                >
                  <option value="this_week">This Week</option>
                  <option value="next_week">Next Week</option>
                  <option value="anytime">Anytime (30 days)</option>
                  <option value="custom">Custom Range</option>
                </select>

                {dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      min={customStartDate || new Date().toISOString().split('T')[0]}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                {/* Filter by Day */}
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Filter by Day</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Days</option>
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                </select>
              </div>

              {/* Buffer Time Info */}
              {schedulingSettings && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">

                {/* Full Auto Schedule */}
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      // Run suggestions if needed
                      if (!suggestions || Object.keys(suggestions).length === 0) {
                        await runSmartCheck();
                      }
                      // Flatten and pick the earliest best slot across all employees
                      const all = Object.entries(suggestions || {}).flatMap(([empId, data]) =>
                        (data?.available_slots || []).map(slot => ({ slot, empId }))
                      );
                      if (all.length === 0) {
                        showAlert('warning', 'No available slots to auto-schedule.');
                        return;
                      }
                      all.sort((a, b) => a.slot.start_time - b.slot.start_time);
                      const choice = all[0];
                      await scheduleAppointment(choice.slot, choice.empId);
                    } catch (e) {
                      showAlert('error', 'Auto schedule failed');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || !jobTitle.trim() || jobDuration < 0.25}
                  className="w-full btn-secondary mt-2 flex items-center justify-center gap-2"
                >
                  <SparklesIcon className="w-4 h-4" /> Full Auto Schedule
                </button>

                    <InformationCircleIcon className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <strong>Smart Scheduling:</strong><br />
                      • Times rounded to 15-minute intervals<br />
                      • Buffer: {schedulingSettings.default_buffer_before_minutes || 30}m before, {schedulingSettings.default_buffer_after_minutes || 30}m after<br />
                      • Business hours: {schedulingSettings.business_hours_start} - {schedulingSettings.business_hours_end}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={runSmartCheck}
                  disabled={loading || !jobTitle.trim() || jobDuration < 0.25}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <SparklesIcon className="w-4 h-4" />
                  )}
                  {loading ? 'Finding Slots...' : 'Find Available Times'}
                </button>

                <button
                  onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <UsersIcon className="w-4 h-4" />
                  {showAdvancedPanel ? 'Hide' : 'Show'} Advanced Analysis
                </button>

                {jobData?.quote_id && (
                  <button
                    onClick={generateCustomerLink}
                    className="w-full btn-secondary"
                  >
                    Generate Customer Link
                  </button>
                )}
              </div>
            </div>
          </div>



          {/* Results Panel */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold">Available Time Slots</h4>
              <p className="text-sm text-gray-600">
                {totalDisplaySlots > 0
                  ? `Found ${totalDisplaySlots} available time slot${totalDisplaySlots !== 1 ? 's' : ''} in ${dateRange.replace('_', ' ')}`
                  : Object.keys(suggestions).length > 0
                    ? 'No available time slots in this range. Try widening the dates.'
                    : 'Run Smart Check to see available time slots'
                }
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {Object.keys(suggestions).length === 0 ? (
                <div className="text-center py-12">
                  <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No suggestions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Fill in the job details and click "Find Available Times" to see scheduling options.
                  </p>
                  {schedulingSettings && (
                    <div className="mt-4 text-xs text-gray-400">
                      Business Hours: {schedulingSettings.business_hours_start} - {schedulingSettings.business_hours_end}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {crewRequired > 1 ? (
                    // For crew jobs, show unified crew slots instead of per-employee
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-3">
                        Crew Slots Available (Requires {crewRequired} employees)
                      </h5>
                      {(() => {
                        // Build unified crew slots
                        const slotMap = new Map();
                        Object.entries(suggestions).forEach(([empId, data]) => {
                          (data.available_slots || []).forEach(slot => {
                            const key = new Date(slot.start_time).toISOString() + '|' + slot.duration_minutes;
                            if (!slotMap.has(key)) {
                              slotMap.set(key, { slot, employees: [] });
                            }
                            slotMap.get(key).employees.push(empId);
                          });
                        });

                        // Filter to slots with enough crew members
                        const crewSlots = Array.from(slotMap.values())
                          .filter(item => item.employees.length >= crewRequired)
                          .map(item => ({
                            ...item.slot,
                            availableEmployees: item.employees.slice(0, crewRequired)
                          }))
                          .filter(slot => {
                            if (selectedDay === 'all') return true;
                            const dayName = slot.start_time.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                            return dayName === selectedDay;
                          });

                        if (crewSlots.length === 0) {
                          return (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                              <div className="flex items-start gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mt-0.5" />
                                <div className="text-sm text-yellow-700">
                                  <strong>No crew slots found</strong><br />
                                  No time slots where {crewRequired} employees are simultaneously available. Try adjusting the duration or date range.
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {crewSlots.map((slot, index) => (
                              <div key={index} className="bg-white rounded-md p-3 border border-gray-200 hover:border-primary-300 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {formatTimeSlot(slot)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {formatDuration(slot.duration_minutes)} • {formatCleanTime(slot.start_time)} - {formatCleanTime(slot.end_time)}
                                    </div>
                                    <div className="text-xs text-green-600 mt-1 font-medium">
                                      Crew: {slot.availableEmployees.map(empId => {
                                        const emp = employees.find(e => e.id === empId);
                                        return emp?.full_name || 'Unknown';
                                      }).join(', ')}
                                    </div>
                                    {slot.buffer_before && slot.buffer_after && (
                                      <div className="text-xs text-blue-600 mt-1">
                                        Buffer: {slot.buffer_before}m before, {slot.buffer_after}m after
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => scheduleCrewAppointment(slot)}
                                    disabled={creating}
                                    className="btn-primary-sm flex items-center gap-1 ml-3"
                                  >
                                    <CheckIcon className="w-3 h-3" />
                                    {creating ? 'Scheduling...' : `Schedule Crew (${crewRequired})`}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    // For single employee jobs, show per-employee slots (GPT-5 fix: use filtered data)
                    employeesWithDisplaySlots.map((emp) => {
                      return (
                        <div key={emp.empId} className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-900 mb-3">
                            {emp.name} ({emp.slots.length} slots available)
                          </h5>

                        {emp.slots.length === 0 ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <div className="flex items-start gap-2">
                              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mt-0.5" />
                              <div className="text-sm text-yellow-700">
                                <strong>No available times found</strong><br />
                                Try adjusting the duration, date range, or check for existing appointments.
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {emp.slots.map((slot, index) => (
                                <div key={index} className="bg-white rounded-md p-3 border border-gray-200 hover:border-primary-300 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900">
                                        {formatTimeSlot(slot)}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {formatDuration(slot.duration_minutes)} • {formatCleanTime(slot.start_time)} - {formatCleanTime(slot.end_time)}
                                      </div>
                                      {slot.buffer_before && slot.buffer_after && (
                                        <div className="text-xs text-blue-600 mt-1">
                                          Buffer: {slot.buffer_before}m before, {slot.buffer_after}m after
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => scheduleAppointment(slot, emp.empId)}
                                      disabled={creating}
                                      className="btn-primary-sm flex items-center gap-1 ml-3"
                                    >
                                      <CheckIcon className="w-3 h-3" />
                                      {creating ? 'Scheduling...' : 'Schedule'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              {alert.show && (
                <div className={`mb-4 p-3 rounded-md ${
                  alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {alert.message}
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="btn-secondary flex items-center gap-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSchedulingAssistant;
