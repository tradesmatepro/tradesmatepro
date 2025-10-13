import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { calculateTimesheetHours, formatHours } from '../utils/inputUtils';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';
import {
  XMarkIcon,
  ClockIcon,
  UserIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PencilIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const TimesheetFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  timesheet = null, 
  employees = [], 
  jobs = [] 
}) => {
  const { user } = useUser();
  const [defaultLunchMinutes, setDefaultLunchMinutes] = useState(30);
  const [calculatedHours, setCalculatedHours] = useState({
    totalHours: 0,
    regularHours: 0,
    overtimeHours: 0,
    totalPaidHours: 0,
    lunchDeduction: 0
  });

  const [formData, setFormData] = useState({
    employee_id: user?.role === 'employee' ? user.id : '',
    job_id: '',
    work_date: new Date().toISOString().split('T')[0],
    clock_in: '09:00',
    clock_out: '17:00',
    lunch_taken: true,
    lunch_override_minutes: null,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timesheet) {
      // Editing existing timesheet
      setFormData({
        employee_id: timesheet.employee_id,
        job_id: timesheet.job_id || '',
        work_date: timesheet.work_date,
        clock_in: timesheet.clock_in ? new Date(timesheet.clock_in).toTimeString().slice(0, 5) : '',
        clock_out: timesheet.clock_out ? new Date(timesheet.clock_out).toTimeString().slice(0, 5) : '',
        lunch_taken: timesheet.lunch_taken !== false, // Default to true if not set
        lunch_override_minutes: timesheet.lunch_override_minutes || null,
        notes: timesheet.notes || ''
      });
    } else {
      // Creating new timesheet
      setFormData({
        employee_id: user?.role === 'employee' ? user.id : '',
        job_id: '',
        work_date: new Date().toISOString().split('T')[0],
        clock_in: '09:00',
        clock_out: '17:00',
        lunch_taken: true,
        lunch_override_minutes: null,
        notes: ''
      });
    }
  }, [timesheet, user]);

  // Load company default lunch minutes
  useEffect(() => {
    const loadCompanySettings = async () => {
      try {
        // TODO: Enable when companies table is created
        // For now, use default lunch minutes
        setDefaultLunchMinutes(30);
        console.log('Using default lunch minutes (30) - companies table not yet available');
      } catch (error) {
        console.error('Error loading company settings:', error);
        setDefaultLunchMinutes(30);
      }
    };

    if (user?.company_id) {
      loadCompanySettings();
    }
  }, [user?.company_id]);

  // Calculate hours whenever clock times or lunch settings change
  useEffect(() => {
    if (formData.clock_in && formData.clock_out) {
      const lunchMinutes = formData.lunch_taken
        ? (formData.lunch_override_minutes || defaultLunchMinutes)
        : 0;

      const hours = calculateTimesheetHours(
        formData.clock_in,
        formData.clock_out,
        formData.lunch_taken,
        lunchMinutes
      );

      setCalculatedHours(hours);
    } else {
      setCalculatedHours({
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        totalPaidHours: 0,
        lunchDeduction: 0
      });
    }
  }, [formData.clock_in, formData.clock_out, formData.lunch_taken, formData.lunch_override_minutes, defaultLunchMinutes]);

  const handleSubmit = async (e, submitForApproval = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Include calculated hours in the form data
      const submissionData = {
        ...formData,
        regular_hours: calculatedHours.regularHours,
        overtime_hours: calculatedHours.overtimeHours,
        total_paid_hours: calculatedHours.totalPaidHours,
        // Convert lunch settings to the format expected by the database
        lunch_override_minutes: formData.lunch_taken && formData.lunch_override_minutes !== defaultLunchMinutes
          ? formData.lunch_override_minutes
          : null
      };

      await onSubmit(submissionData, submitForApproval);
    } catch (error) {
      console.error('Error submitting timesheet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-primary-600" />
            {timesheet ? 'Edit Timesheet' : 'Log Time'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Employee Selection - Only show for admins/owners creating new timesheets */}
          {user?.role !== 'employee' && !timesheet && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Employee *
              </label>
              <select
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select an employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Show employee name when editing existing timesheet */}
          {timesheet && user?.role !== 'employee' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Employee
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                {employees.find(emp => emp.id === formData.employee_id)?.full_name || 'Unknown Employee'}
              </div>
            </div>
          )}

          {/* Job Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BriefcaseIcon className="w-4 h-4 inline mr-1" />
              Job (Optional)
            </label>
            <select
              value={formData.job_id}
              onChange={(e) => setFormData({ ...formData, job_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">No specific job</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.job_title}
                </option>
              ))}
            </select>
          </div>

          {/* Work Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
              Work Date *
            </label>
            <input
              type="date"
              required
              value={formData.work_date}
              onChange={(e) => setFormData({ ...formData, work_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Clock In/Out Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clock In *
              </label>
              <input
                type="time"
                required
                value={formData.clock_in}
                onChange={(e) => setFormData({ ...formData, clock_in: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clock Out *
              </label>
              <input
                type="time"
                required
                value={formData.clock_out}
                onChange={(e) => setFormData({ ...formData, clock_out: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Lunch Deduction */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Lunch Break
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lunch_taken"
                  checked={formData.lunch_taken}
                  onChange={(e) => setFormData({
                    ...formData,
                    lunch_taken: e.target.checked,
                    lunch_override_minutes: null // Reset override when toggling
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="lunch_taken" className="text-sm text-gray-700">
                  Lunch taken
                </label>
              </div>
            </div>

            {formData.lunch_taken && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lunch Duration (minutes)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.lunch_override_minutes || defaultLunchMinutes}
                    onChange={(e) => setFormData({
                      ...formData,
                      lunch_override_minutes: parseInt(e.target.value) || null
                    })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-500">
                    (Default: {defaultLunchMinutes} min)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Auto-Calculated Hours Summary */}
          {(formData.clock_in && formData.clock_out) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Hours Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Regular:</span>
                  <div className="text-blue-900">{formatHours(calculatedHours.regularHours)}</div>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Overtime:</span>
                  <div className="text-blue-900">{formatHours(calculatedHours.overtimeHours)}</div>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Lunch:</span>
                  <div className="text-blue-900">-{calculatedHours.lunchDeduction} min</div>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Total Paid:</span>
                  <div className="text-blue-900 font-semibold">{formatHours(calculatedHours.totalPaidHours)}</div>
                </div>
              </div>
              {calculatedHours.overtimeHours > 0 && (
                <div className="mt-2 flex items-center text-amber-700">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  <span className="text-xs">Overtime detected (over 8 hours)</span>
                </div>
              )}
            </div>
          )}



          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DocumentTextIcon className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Add any notes about this work session..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>

            {/* Show different buttons based on whether editing or creating and user role */}
            {timesheet ? (
              /* Editing existing timesheet */
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
                onClick={(e) => handleSubmit(e, false)}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <ClockIcon className="w-4 h-4" />
                    {user?.role === 'employee' ? 'Update Timesheet' : 'Admin Update'}
                  </>
                )}
              </button>
            ) : (
              /* Creating new timesheet */
              <>
                <button
                  type="button"
                  disabled={loading}
                  className="btn-secondary flex items-center gap-2"
                  onClick={(e) => handleSubmit(e, false)}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <PencilIcon className="w-4 h-4" />
                      Save as Draft
                    </>
                  )}
                </button>

                {/* Only show submit for approval if user is employee or admin creating for employee */}
                {(user?.role === 'employee' || user?.role !== 'employee') && (
                  <button
                    type="button"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                    onClick={(e) => handleSubmit(e, true)}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <DocumentCheckIcon className="w-4 h-4" />
                        {user?.role === 'employee' ? 'Submit for Approval' : 'Create & Submit'}
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimesheetFormModal;
