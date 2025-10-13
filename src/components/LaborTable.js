import React, { useState } from 'react';
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export const LaborTable = ({
  laborRows = [],
  onLaborChange,
  isEditable = true,
  showLegacyImport = false,
  legacyData = null,
  rates = { hourly: 75, overtime: 112.5 }
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const addLaborRow = () => {
    // Calculate initial line_total based on default values
    const employees = 1;
    const hoursPerDay = 8;
    const days = 1;
    const totalHours = employees * hoursPerDay * days; // 8 hours
    const regularHours = totalHours; // All regular (8 hours <= 8)
    const overtimeHours = 0;
    const lineTotal = (regularHours * rates.hourly) + (overtimeHours * rates.overtime);

    const newRow = {
      id: null,
      employees: employees, // Number of employees (crew size)
      hours_per_day: hoursPerDay, // Hours per employee per day
      days: days, // Number of days
      total_hours: totalHours, // employees × hours_per_day × days
      regular_hours: regularHours, // Hours at regular rate
      overtime_hours: overtimeHours, // Hours at overtime rate
      line_total: lineTotal // ✅ Calculate initial total!
    };
    onLaborChange([...laborRows, newRow]);
  };

  const removeLaborRow = (index) => {
    const newRows = laborRows.filter((_, i) => i !== index);
    onLaborChange(newRows);
  };

  const updateLaborRow = (index, field, value) => {
    const newRows = [...laborRows];
    newRows[index] = { ...newRows[index], [field]: value };

    const row = newRows[index];

    // Recalculate totals when any input changes
    const employees = parseInt(row.employees) || 0;
    const hoursPerDay = parseFloat(row.hours_per_day) || 0;
    const days = parseInt(row.days) || 0;

    // Total hours = employees × hours per day × days
    const totalHours = employees * hoursPerDay * days;
    newRows[index].total_hours = totalHours;

    // Calculate regular vs overtime hours
    // If hours per day > 8, then each employee works overtime
    if (hoursPerDay <= 8) {
      // All regular time
      newRows[index].regular_hours = totalHours;
      newRows[index].overtime_hours = 0;
    } else {
      // Each employee works 8 regular + (hoursPerDay - 8) overtime per day
      const regularHoursPerEmployee = 8 * days;
      const overtimeHoursPerEmployee = (hoursPerDay - 8) * days;

      newRows[index].regular_hours = employees * regularHoursPerEmployee;
      newRows[index].overtime_hours = employees * overtimeHoursPerEmployee;
    }

    // Calculate line total
    const regularTotal = newRows[index].regular_hours * rates.hourly;
    const overtimeTotal = newRows[index].overtime_hours * rates.overtime;
    newRows[index].line_total = regularTotal + overtimeTotal;

    onLaborChange(newRows);
  };

  const importLegacyData = () => {
    if (!legacyData) return;
    
    const legacyRow = {
      id: null,
      employee_id: '',
      work_date: legacyData.created_at ? legacyData.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      hours: legacyData.estimated_hours || 0,
      rate: legacyData.labor_rate || null,
      overtime_hours: 0,
      overtime_rate: null,
      note: 'Imported from legacy fields',
      line_total: (legacyData.estimated_hours || 0) * (legacyData.labor_rate || 0)
    };
    
    onLaborChange([...laborRows, legacyRow]);
  };

  const calculateTotalLabor = () => {
    return laborRows.reduce((sum, row) => sum + (row.line_total || 0), 0);
  };

  if (isCollapsed) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-900">Labor Details</h4>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {laborRows.length} row(s) • Total: ${calculateTotalLabor().toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-medium text-gray-900">Labor Details</h4>
        <div className="flex items-center gap-2">
          {isEditable && (
            <button
              type="button"
              onClick={addLaborRow}
              className="btn-secondary flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Labor Row
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronUpIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showLegacyImport && legacyData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="text-sm text-yellow-800">
              Legacy labor data detected: {legacyData.estimated_hours} hours at ${legacyData.labor_rate}/hour
            </div>
            <button
              type="button"
              onClick={importLegacyData}
              className="text-sm text-yellow-700 hover:text-yellow-900 underline"
            >
              Import to new format
            </button>
          </div>
        </div>
      )}

      {laborRows.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No labor entries yet.</p>
          {isEditable && (
            <button
              type="button"
              onClick={addLaborRow}
              className="mt-2 text-primary-600 hover:text-primary-800"
            >
              Add your first labor entry
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Employees</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Hours/Day</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Days</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Total Hours</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Regular</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Overtime</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Total Cost</th>
                {isEditable && <th className="w-10"></th>}
              </tr>
            </thead>
            <tbody>
              {laborRows.map((row, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.employees || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        updateLaborRow(index, 'employees', val ? parseInt(val) : '');
                      }}
                      onBlur={(e) => {
                        if (!e.target.value) updateLaborRow(index, 'employees', 1);
                      }}
                      disabled={!isEditable}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="1"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={row.hours_per_day || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        // Allow only one decimal point
                        const parts = val.split('.');
                        const cleaned = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : val;
                        updateLaborRow(index, 'hours_per_day', cleaned ? parseFloat(cleaned) || cleaned : '');
                      }}
                      onBlur={(e) => {
                        if (!e.target.value) updateLaborRow(index, 'hours_per_day', 8);
                      }}
                      disabled={!isEditable}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="8"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.days || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        updateLaborRow(index, 'days', val ? parseInt(val) : '');
                      }}
                      onBlur={(e) => {
                        if (!e.target.value) updateLaborRow(index, 'days', 1);
                      }}
                      disabled={!isEditable}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="1"
                    />
                  </td>
                  <td className="py-2 px-2 text-sm text-gray-600">
                    {(row.total_hours || 0).toFixed(1)}h
                  </td>
                  <td className="py-2 px-2 text-sm text-gray-600">
                    {(row.regular_hours || 0).toFixed(1)}h @ ${rates.hourly}
                  </td>
                  <td className="py-2 px-2 text-sm text-gray-600">
                    {(row.overtime_hours || 0).toFixed(1)}h @ ${rates.overtime}
                  </td>
                  <td className="py-2 px-2 text-sm font-medium">
                    ${(row.line_total || 0).toFixed(2)}
                  </td>
                  {isEditable && (
                    <td className="py-2 px-2">
                      <button
                        type="button"
                        onClick={() => removeLaborRow(index)}
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                        title="Remove row"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {laborRows.length > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="text-lg font-semibold">
            Labor Subtotal: ${calculateTotalLabor().toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default LaborTable;
