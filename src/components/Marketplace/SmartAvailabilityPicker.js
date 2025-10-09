import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { getSmartSchedulingSuggestions } from '../../utils/smartScheduling';
import { supaFetch } from '../../utils/supaFetch';
import {
  ClockIcon,
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const SmartAvailabilityPicker = ({ 
  request, 
  selectedStart, 
  selectedEnd, 
  onAvailabilitySelect,
  estimatedDuration = 120 // Default 2 hours in minutes
}) => {
  const { user } = useUser();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [searchRange, setSearchRange] = useState(7); // Days to search ahead
  const [companySettings, setCompanySettings] = useState(null);
  const [weekendValidationError, setWeekendValidationError] = useState(null);

  useEffect(() => {
    loadEmployees();
    loadCompanySettings();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      findAvailableSlots();
    }
  }, [employees, searchRange, estimatedDuration]);

  const loadEmployees = async () => {
    try {
      const response = await supaFetch(`users?company_id=eq.${user.company_id}&active=eq.true&select=id,full_name,role`, {
        method: 'GET'
      }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setEmployees(data || []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadCompanySettings = async () => {
    try {
      const response = await supaFetch(`companies?id=eq.${user.company_id}&select=nights_weekends`, {
        method: 'GET'
      }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setCompanySettings(data?.[0] || null);
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
    }
  };

  const findAvailableSlots = async () => {
    if (employees.length === 0) return;

    setLoading(true);
    try {
      const employeeIds = employees.map(e => e.id);

      // Adjust search parameters based on customer's time preference
      let startDate = new Date();
      let endDate = new Date();

      const customerTimePreference = request?.preferred_time_option || 'anytime';

      // Debug logging to see what preference we're actually getting
      console.log('🕐 SmartAvailabilityPicker - Customer time preference:', customerTimePreference);
      console.log('🕐 SmartAvailabilityPicker - Request data:', {
        preferred_time_option: request?.preferred_time_option,
        start_time: request?.start_time,
        end_time: request?.end_time
      });

      switch (customerTimePreference) {
        case 'soonest':
          // Search next 3 days for soonest available
          endDate.setDate(endDate.getDate() + 3);
          break;
        case 'this_week':
          // Search within next 7 days
          endDate.setDate(endDate.getDate() + 7);
          break;
        case 'weekend_only':
          // Search next 4 weekends (28 days)
          endDate.setDate(endDate.getDate() + 28);
          break;
        case 'specific':
          // Use customer's specified date range
          if (request?.start_time) {
            startDate = new Date(request.start_time);
            endDate = request?.end_time ? new Date(request.end_time) : new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // +1 day if no end time
          } else {
            endDate.setDate(endDate.getDate() + searchRange);
          }
          break;
        default: // 'anytime'
          endDate.setDate(endDate.getDate() + searchRange);
      }

      const suggestions = await getSmartSchedulingSuggestions(
        employeeIds,
        estimatedDuration,
        user.company_id,
        startDate,
        endDate
      );

      // Flatten all available slots from all employees
      const allSlots = [];
      Object.entries(suggestions.suggestions || {}).forEach(([employeeId, employeeData]) => {
        const employee = employees.find(e => e.id === employeeId);
        employeeData.available_slots.forEach(slot => {
          allSlots.push({
            ...slot,
            employee_id: employeeId,
            employee_name: employee?.full_name || 'Unknown',
            start_time: new Date(slot.start_time),
            end_time: new Date(slot.end_time)
          });
        });
      });

      // Filter slots based on customer time preference
      let filteredSlots = allSlots;

      if (customerTimePreference === 'weekend_only') {
        // Check if company supports weekend work
        if (companySettings && !companySettings.nights_weekends) {
          setWeekendValidationError('This company does not offer weekend services. Please contact them directly to discuss alternative scheduling options.');
          filteredSlots = []; // No slots available
        } else {
          setWeekendValidationError(null);
          filteredSlots = allSlots.filter(slot => {
            const dayOfWeek = slot.start_time.getDay();
            return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
          });
        }
      } else {
        setWeekendValidationError(null);
      }

      // Sort by date and time based on customer preference
      if (customerTimePreference === 'soonest') {
        // For soonest: sort by earliest time and limit to first 5 slots
        filteredSlots.sort((a, b) => a.start_time - b.start_time);
        filteredSlots = filteredSlots.slice(0, 5);
        console.log('🕐 Soonest preference: showing first 5 slots');
      } else if (customerTimePreference === 'specific') {
        // For specific dates: prioritize slots within the customer's requested timeframe
        filteredSlots.sort((a, b) => {
          // If customer specified start_time, prioritize slots closer to that time
          if (request?.start_time) {
            const customerStart = new Date(request.start_time);
            const diffA = Math.abs(a.start_time - customerStart);
            const diffB = Math.abs(b.start_time - customerStart);
            return diffA - diffB;
          }
          // Otherwise sort chronologically
          return a.start_time - b.start_time;
        });
        console.log('🕐 Specific dates preference: prioritizing customer timeframe');
      } else {
        // For anytime, this_week, weekend_only: sort chronologically but show more options
        filteredSlots.sort((a, b) => a.start_time - b.start_time);
        console.log(`🕐 ${customerTimePreference} preference: showing all available slots chronologically`);
      }

      // Group by date for better display
      const groupedSlots = {};
      filteredSlots.forEach(slot => {
        const dateKey = slot.start_time.toDateString();
        if (!groupedSlots[dateKey]) {
          groupedSlots[dateKey] = [];
        }
        groupedSlots[dateKey].push(slot);
      });

      setAvailableSlots(groupedSlots);
    } catch (error) {
      console.error('Error finding available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    onAvailabilitySelect({
      availableStart: slot.start_time.toISOString().slice(0, 16),
      availableEnd: slot.end_time.toISOString().slice(0, 16),
      assignedEmployee: slot.employee_id
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSlotPriority = (slot) => {
    const now = new Date();
    const hoursFromNow = (slot.start_time - now) / (1000 * 60 * 60);
    
    if (hoursFromNow <= 24) return 'urgent';
    if (hoursFromNow <= 72) return 'soon';
    return 'normal';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 border-red-200 text-red-800';
      case 'soon': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Finding available times...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          Smart Availability Suggestions
        </h4>
        <div className="flex items-center space-x-2">
          <select
            value={searchRange}
            onChange={(e) => setSearchRange(parseInt(e.target.value))}
            className="text-xs border-gray-300 rounded-md"
          >
            <option value={3}>Next 3 days</option>
            <option value={7}>Next week</option>
            <option value={14}>Next 2 weeks</option>
            <option value={30}>Next month</option>
          </select>
        </div>
      </div>

      {/* Weekend Validation Error */}
      {weekendValidationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <strong>Weekend Service Not Available:</strong>
              <p className="mt-1">{weekendValidationError}</p>
            </div>
          </div>
        </div>
      )}

      {Object.keys(availableSlots).length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            No available time slots found in the selected range.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Try extending the search range or adjusting the estimated duration.
          </p>
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-3">
          {Object.entries(availableSlots).map(([dateKey, slots]) => (
            <div key={dateKey}>
              <h5 className="text-xs font-medium text-gray-700 mb-2 sticky top-0 bg-white">
                {formatDate(dateKey)}
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {slots.slice(0, 4).map((slot, index) => {
                  const priority = getSlotPriority(slot);
                  const isSelected = selectedSlot?.start_time?.getTime() === slot.start_time.getTime();
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' 
                          : `${getPriorityColor(priority)} hover:shadow-sm`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircleIcon className="h-4 w-4 text-primary-600" />
                        )}
                      </div>
                      <div className="flex items-center mt-1 text-xs opacity-75">
                        <UserIcon className="h-3 w-3 mr-1" />
                        {slot.employee_name}
                      </div>
                    </button>
                  );
                })}
                {slots.length > 4 && (
                  <p className="text-xs text-gray-500 text-center py-1">
                    +{slots.length - 4} more slots available
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSlot && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-primary-900">
                Selected: {formatDate(selectedSlot.start_time.toDateString())} at {formatTime(selectedSlot.start_time)}
              </p>
              <p className="text-xs text-primary-700">
                Duration: {estimatedDuration} minutes • Assigned to: {selectedSlot.employee_name}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        💡 These times are based on your team's current schedule and availability settings.
      </div>
    </div>
  );
};

export default SmartAvailabilityPicker;
