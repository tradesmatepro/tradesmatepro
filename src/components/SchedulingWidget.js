/**
 * SchedulingWidget - Shared Scheduling Component
 * 
 * Industry-standard reusable scheduling widget used across:
 * - Customer-facing quote acceptance (quote.html)
 * - Customer portal scheduling page
 * - Internal smart scheduling assistant
 * 
 * Features:
 * - Week filters (This Week, Next Week, Custom Range)
 * - Auto-schedule ASAP button
 * - Grouped by day display
 * - Responsive design
 * - Matches ServiceTitan/Jobber/Housecall Pro UX
 */

import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const SchedulingWidget = ({
  companyId,
  employeeIds = [],
  durationMinutes = 120,
  onSlotSelected,
  onAutoSchedule,
  selectedSlot = null,
  className = '',
  showAutoSchedule = true,
  maxDaysAhead = 90,
  supabaseUrl,
  supabaseAnonKey
}) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weekFilter, setWeekFilter] = useState(0); // 0 = this week, 1 = next week, etc.
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [earliestSlot, setEarliestSlot] = useState(null);

  // Load available slots on mount
  useEffect(() => {
    if (companyId && employeeIds.length > 0) {
      loadAvailableSlots();
    }
  }, [companyId, employeeIds, durationMinutes]);

  // Filter slots when week filter changes
  useEffect(() => {
    if (availableSlots.length > 0) {
      filterSlotsByWeek(weekFilter);
    }
  }, [weekFilter, availableSlots]);

  const loadAvailableSlots = async () => {
    setLoading(true);
    setError('');

    try {
      // Call smart-scheduling edge function
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + maxDaysAhead);

      const requestBody = {
        employeeIds,
        durationMinutes,
        companyId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      const response = await fetch(
        `${supabaseUrl}/functions/v1/smart-scheduling`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load slots: ${response.status}`);
      }

      const data = await response.json();

      // Flatten all slots from all employees
      const allSlots = [];
      Object.values(data.suggestions || {}).forEach(employeeData => {
        (employeeData.available_slots || []).forEach(slot => {
          allSlots.push({
            ...slot,
            employee_id: employeeData.employee_id,
            start_time: new Date(slot.start_time),
            end_time: new Date(slot.end_time)
          });
        });
      });

      // Sort by date/time
      allSlots.sort((a, b) => a.start_time - b.start_time);

      setAvailableSlots(allSlots);
      
      if (allSlots.length > 0) {
        setEarliestSlot(allSlots[0]);
      } else {
        setError('No available time slots found. Please contact us to schedule.');
      }
    } catch (err) {
      console.error('Error loading slots:', err);
      setError('Unable to load available times. Please try again or contact us.');
    } finally {
      setLoading(false);
    }
  };

  const filterSlotsByWeek = (offset) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + (offset * 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const filtered = availableSlots.filter(slot => {
      return slot.start_time >= startOfWeek && slot.start_time < endOfWeek;
    });

    setFilteredSlots(filtered);
  };

  const filterByCustomRange = () => {
    if (!customStartDate || !customEndDate) {
      setError('Please select both start and end dates');
      return;
    }

    const start = new Date(customStartDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(customEndDate);
    end.setHours(23, 59, 59, 999);

    const filtered = availableSlots.filter(slot => {
      return slot.start_time >= start && slot.start_time <= end;
    });

    setFilteredSlots(filtered);
    setShowCustomRange(false);
  };

  const handleAutoSchedule = () => {
    if (earliestSlot && onAutoSchedule) {
      onAutoSchedule(earliestSlot);
    }
  };

  const formatSlotDateTime = (date) => {
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  };

  const formatSlotTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Group slots by day
  const groupSlotsByDay = () => {
    const grouped = {};
    filteredSlots.forEach(slot => {
      const dayKey = slot.start_time.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(slot);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available times...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDay();

  return (
    <div className={`scheduling-widget ${className}`}>
      {/* Auto-Schedule ASAP Button */}
      {showAutoSchedule && earliestSlot && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-6 w-6 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900">Auto-Schedule ASAP</p>
                <p className="text-sm text-gray-600">
                  Next available: {formatSlotDateTime(earliestSlot.start_time)}
                </p>
              </div>
            </div>
            <button
              onClick={handleAutoSchedule}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Schedule Now
            </button>
          </div>
        </div>
      )}

      {/* Week Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => { setWeekFilter(0); setShowCustomRange(false); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              weekFilter === 0 && !showCustomRange
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => { setWeekFilter(1); setShowCustomRange(false); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              weekFilter === 1 && !showCustomRange
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Next Week
          </button>
          <button
            onClick={() => { setWeekFilter(2); setShowCustomRange(false); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              weekFilter === 2 && !showCustomRange
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            2 Weeks Out
          </button>
          <button
            onClick={() => setShowCustomRange(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showCustomRange
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom Range
          </button>
        </div>

        {/* Custom Date Range Picker */}
        {showCustomRange && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={filterByCustomRange}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Apply Range
              </button>
              <button
                onClick={() => { setShowCustomRange(false); setWeekFilter(0); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Available Slots Grouped by Day */}
      <div className="space-y-6">
        {Object.keys(groupedSlots).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No available slots for this time period. Try a different week.
          </div>
        ) : (
          Object.entries(groupedSlots).map(([day, slots]) => (
            <div key={day} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">{day}</h3>
                  <span className="text-sm text-gray-500">({slots.length} available)</span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {slots.map((slot, idx) => {
                  const isSelected = selectedSlot && 
                    selectedSlot.start_time.getTime() === slot.start_time.getTime() &&
                    selectedSlot.employee_id === slot.employee_id;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => onSlotSelected && onSlotSelected(slot)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50 text-primary-900 font-semibold'
                          : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span className="text-sm">{formatSlotTime(slot.start_time)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SchedulingWidget;

