// Subcontractor Timesheets - Log and view hours
import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  PlusIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const SubcontractorTimesheets = ({ subcontractorId }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadTimesheets();
  }, [subcontractorId, dateRange]);

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(dateRange);
      const response = await fetch(`/api/subcontractors/${subcontractorId}/timesheets?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTimesheets(data);
      }
    } catch (error) {
      console.error('Error loading timesheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogHours = async (timesheetData) => {
    try {
      const response = await fetch(`/api/subcontractors/${subcontractorId}/timesheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(timesheetData)
      });
      
      if (response.ok) {
        setShowLogForm(false);
        loadTimesheets();
      }
    } catch (error) {
      console.error('Error logging hours:', error);
    }
  };

  const getTotalHours = () => {
    return timesheets.reduce((total, timesheet) => total + (parseFloat(timesheet.total_hours) || 0), 0);
  };

  const getWeeklyBreakdown = () => {
    const weeks = {};
    timesheets.forEach(timesheet => {
      const date = new Date(timesheet.work_date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { hours: 0, days: 0 };
      }
      weeks[weekKey].hours += parseFloat(timesheet.total_hours) || 0;
      weeks[weekKey].days += 1;
    });
    
    return Object.entries(weeks).map(([weekStart, data]) => ({
      weekStart: new Date(weekStart),
      ...data
    })).sort((a, b) => b.weekStart - a.weekStart);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const weeklyBreakdown = getWeeklyBreakdown();

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Timesheets</h2>
        <button
          onClick={() => setShowLogForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Log Hours
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {getTotalHours().toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Days Worked</p>
              <p className="text-2xl font-bold text-gray-900">
                {timesheets.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Hours/Day</p>
              <p className="text-2xl font-bold text-gray-900">
                {timesheets.length > 0 ? (getTotalHours() / timesheets.length).toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Breakdown */}
      {weeklyBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Summary</h3>
          <div className="space-y-3">
            {weeklyBreakdown.map((week, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">
                    Week of {week.weekStart.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">{week.days} days worked</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{week.hours.toFixed(1)} hours</p>
                  <p className="text-sm text-gray-600">
                    {(week.hours / week.days).toFixed(1)} avg/day
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timesheet Entries */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Time Entries</h3>
        </div>
        
        {timesheets.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No time entries found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start logging your hours to track your work time.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowLogForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Log First Entry
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {timesheets.map((timesheet) => (
              <div key={timesheet.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <p className="font-medium text-gray-900">
                        {new Date(timesheet.work_date).toLocaleDateString()}
                      </p>
                      {timesheet.work_orders && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {timesheet.work_orders.title}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      {timesheet.clock_in && timesheet.clock_out && (
                        <span>
                          {new Date(timesheet.clock_in).toLocaleTimeString()} - {new Date(timesheet.clock_out).toLocaleTimeString()}
                        </span>
                      )}
                      {timesheet.notes && (
                        <span>• {timesheet.notes}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {parseFloat(timesheet.total_hours || 0).toFixed(1)} hours
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(timesheet.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Hours Form Modal */}
      {showLogForm && (
        <LogHoursForm
          onSubmit={handleLogHours}
          onCancel={() => setShowLogForm(false)}
          subcontractorId={subcontractorId}
        />
      )}
    </div>
  );
};

// Log Hours Form Component
const LogHoursForm = ({ onSubmit, onCancel, subcontractorId }) => {
  const [formData, setFormData] = useState({
    work_date: new Date().toISOString().split('T')[0],
    clock_in: '',
    clock_out: '',
    total_hours: '',
    work_order_id: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Calculate total hours if clock in/out provided
      let totalHours = parseFloat(formData.total_hours) || 0;
      
      if (formData.clock_in && formData.clock_out && !formData.total_hours) {
        const clockIn = new Date(`${formData.work_date}T${formData.clock_in}`);
        const clockOut = new Date(`${formData.work_date}T${formData.clock_out}`);
        totalHours = (clockOut - clockIn) / (1000 * 60 * 60); // Convert to hours
      }
      
      await onSubmit({
        ...formData,
        total_hours: totalHours,
        clock_in: formData.clock_in ? `${formData.work_date}T${formData.clock_in}:00Z` : null,
        clock_out: formData.clock_out ? `${formData.work_date}T${formData.clock_out}:00Z` : null
      });
    } catch (error) {
      console.error('Error submitting timesheet:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Log Hours</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Date *
              </label>
              <input
                type="date"
                value={formData.work_date}
                onChange={(e) => setFormData(prev => ({ ...prev, work_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clock In
                </label>
                <input
                  type="time"
                  value={formData.clock_in}
                  onChange={(e) => setFormData(prev => ({ ...prev, clock_in: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clock Out
                </label>
                <input
                  type="time"
                  value={formData.clock_out}
                  onChange={(e) => setFormData(prev => ({ ...prev, clock_out: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Hours *
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={formData.total_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, total_hours: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="8.0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description of work performed..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Logging...' : 'Log Hours'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubcontractorTimesheets;
