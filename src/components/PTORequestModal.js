import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PTORequestModal = ({ isOpen, onClose, onSubmit, employees = [], user = null }) => {
  // If user is provided, this is for individual employee (Timesheets page)
  // If employees array is provided, this is for admin (Employees page)
  const isIndividualRequest = user && !employees.length;

  const [formData, setFormData] = useState({
    employeeId: isIndividualRequest ? user.id : '',
    kind: 'PTO',
    startDate: '',
    endDate: '',
    isFullDay: true,
    startTime: '09:00',
    endTime: '17:00',
    note: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert form data to proper datetime format
      const submitData = {
        ...formData,
        startsAt: formData.isFullDay
          ? `${formData.startDate}T00:00:00`
          : `${formData.startDate}T${formData.startTime}:00`,
        endsAt: formData.isFullDay
          ? `${formData.endDate}T23:59:59`
          : `${formData.endDate}T${formData.endTime}:00`
      };

      await onSubmit(submitData);
      setFormData({
        employeeId: isIndividualRequest ? user.id : '',
        kind: 'PTO',
        startDate: '',
        endDate: '',
        isFullDay: true,
        startTime: '09:00',
        endTime: '17:00',
        note: ''
      });
      onClose();
    } catch (error) {
      console.error('Error submitting PTO request:', error);
      // Use window.alert safely or replace with your notification system
      if (window.alert) {
        window.alert('Failed to submit PTO request: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Request Time Off</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection - Only show for admin/manager requests */}
          {!isIndividualRequest && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name || emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Show current user info for individual requests */}
          {isIndividualRequest && (
            <div className="bg-gray-50 p-3 rounded-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requesting Time Off For
              </label>
              <p className="text-sm text-gray-900 font-medium">
                {user.full_name || user.name || user.email}
              </p>
            </div>
          )}

          {/* Time Off Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="kind"
              value={formData.kind}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PTO">PTO</option>
              <option value="SICK">Sick Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Full Day Toggle */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isFullDay"
                checked={formData.isFullDay}
                onChange={(e) => setFormData({...formData, isFullDay: e.target.checked})}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Full Day</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {formData.isFullDay ? 'Entire day will be blocked' : 'Specify start and end times'}
            </p>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Time Selection (only if not full day) */}
          {!formData.isFullDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (Optional)
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              placeholder="Reason for time off..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PTORequestModal;
