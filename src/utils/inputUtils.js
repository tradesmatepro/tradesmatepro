/**
 * Simple utility functions for better numeric input handling
 */

/**
 * Simple numeric input props that avoid leading zeros
 */
export const createCurrencyInputProps = (value, onChange, options = {}) => {
  const { min = 0, max = 999999 } = options;

  return {
    type: 'text',
    inputMode: 'decimal',
    value: value === 0 ? '' : value.toString(),
    placeholder: '0.00',
    onChange: (e) => {
      const inputValue = e.target.value;

      // Allow empty string and valid decimal patterns
      if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
        const numValue = inputValue === '' ? 0 : parseFloat(inputValue);
        if (!isNaN(numValue) && numValue >= min && numValue <= max) {
          onChange(numValue);
        }
      }
    },
    onBlur: (e) => {
      const inputValue = e.target.value;
      const numValue = inputValue === '' ? 0 : parseFloat(inputValue);
      const clampedValue = Math.max(min, Math.min(max, isNaN(numValue) ? 0 : numValue));
      onChange(clampedValue);
    }
  };
};

export const createHoursInputProps = (value, onChange, options = {}) => {
  const { min = 0, max = 24 } = options;

  return {
    type: 'text',
    inputMode: 'decimal',
    value: value === 0 ? '' : value.toString(),
    placeholder: '0',
    onChange: (e) => {
      const inputValue = e.target.value;

      // Allow empty string and valid decimal patterns
      if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
        const numValue = inputValue === '' ? 0 : parseFloat(inputValue);
        if (!isNaN(numValue) && numValue >= min && numValue <= max) {
          onChange(numValue);
        }
      }
    },
    onBlur: (e) => {
      const inputValue = e.target.value;
      const numValue = inputValue === '' ? 0 : parseFloat(inputValue);
      const clampedValue = Math.max(min, Math.min(max, isNaN(numValue) ? 0 : numValue));
      onChange(clampedValue);
    }
  };
};

export const createIntegerInputProps = (value, onChange, options = {}) => {
  const { min = 0, max = 999 } = options;

  return {
    type: 'text',
    inputMode: 'numeric',
    value: value === 0 ? '' : value.toString(),
    placeholder: '0',
    onChange: (e) => {
      const inputValue = e.target.value;

      // Allow empty string and whole numbers only
      if (inputValue === '' || /^\d+$/.test(inputValue)) {
        const numValue = inputValue === '' ? 0 : parseInt(inputValue);
        if (!isNaN(numValue) && numValue >= min && numValue <= max) {
          onChange(numValue);
        }
      }
    },
    onBlur: (e) => {
      const inputValue = e.target.value;
      const numValue = inputValue === '' ? 0 : parseInt(inputValue);
      const clampedValue = Math.max(min, Math.min(max, isNaN(numValue) ? 0 : numValue));
      onChange(clampedValue);
    }
  };
};

export const createPercentageInputProps = (value, onChange, options = {}) => {
  const { max = 1 } = options; // value is stored as decimal (0.15 for 15%)
  const displayValue = value * 100; // convert to percentage for display

  return {
    type: 'text',
    inputMode: 'decimal',
    value: displayValue === 0 ? '' : displayValue.toString(),
    placeholder: '0',
    onChange: (e) => {
      const inputValue = e.target.value;

      // Allow empty string and valid decimal patterns
      if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
        const percentValue = inputValue === '' ? 0 : parseFloat(inputValue);
        const decimalValue = percentValue / 100;
        if (!isNaN(decimalValue) && decimalValue >= 0 && decimalValue <= max) {
          onChange(decimalValue);
        }
      }
    },
    onBlur: (e) => {
      const inputValue = e.target.value;
      const percentValue = inputValue === '' ? 0 : parseFloat(inputValue);
      const decimalValue = percentValue / 100;
      const clampedValue = Math.max(0, Math.min(max, isNaN(decimalValue) ? 0 : decimalValue));
      onChange(clampedValue);
    }
  };
};

export const createNumericInputProps = (value, onChange, options = {}) => {
  const {
    min = 0,
    max = Infinity,
    allowDecimals = true,
    defaultValue = 1.5,
    showZero = true
  } = options;

  return {
    type: 'text',
    inputMode: allowDecimals ? 'decimal' : 'numeric',
    value: (value === 0 && !showZero) ? '' : value.toString(),
    placeholder: defaultValue.toString(),
    onChange: (e) => {
      const inputValue = e.target.value;
      const pattern = allowDecimals ? /^\d*\.?\d*$/ : /^\d+$/;

      // Allow empty string and valid patterns
      if (inputValue === '' || pattern.test(inputValue)) {
        const numValue = inputValue === '' ? (showZero ? 0 : defaultValue) : (allowDecimals ? parseFloat(inputValue) : parseInt(inputValue));
        if (!isNaN(numValue) && numValue >= min && numValue <= max) {
          onChange(numValue);
        }
      }
    },
    onBlur: (e) => {
      const inputValue = e.target.value;
      let numValue = inputValue === '' ? defaultValue : (allowDecimals ? parseFloat(inputValue) : parseInt(inputValue));
      if (isNaN(numValue) || numValue < min) {
        numValue = defaultValue;
      }
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
  };
};

/**
 * Calculate timesheet hours with lunch deduction
 * @param {string} clockIn - Clock in time (HH:MM format)
 * @param {string} clockOut - Clock out time (HH:MM format)
 * @param {boolean} lunchTaken - Whether lunch was taken
 * @param {number} lunchMinutes - Lunch minutes (default or override)
 * @returns {Object} - Calculated hours breakdown
 */
export const calculateTimesheetHours = (clockIn, clockOut, lunchTaken = true, lunchMinutes = 30) => {
  if (!clockIn || !clockOut) {
    return {
      totalMinutes: 0,
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      totalPaidHours: 0,
      lunchDeduction: 0
    };
  }

  // Parse time strings to minutes since midnight
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const clockInMinutes = parseTime(clockIn);
  let clockOutMinutes = parseTime(clockOut);

  // Handle overnight shifts (clock out next day)
  if (clockOutMinutes < clockInMinutes) {
    clockOutMinutes += 24 * 60; // Add 24 hours
  }

  const totalMinutes = clockOutMinutes - clockInMinutes;
  const totalHours = totalMinutes / 60;

  // Apply lunch deduction
  const lunchDeduction = lunchTaken ? lunchMinutes : 0;
  const totalPaidMinutes = totalMinutes - lunchDeduction;
  const totalPaidHours = Math.max(0, totalPaidMinutes / 60);

  // Calculate regular and overtime (anything over 8 hours is overtime)
  const regularHours = Math.min(totalPaidHours, 8);
  const overtimeHours = Math.max(0, totalPaidHours - 8);

  return {
    totalMinutes,
    totalHours: Math.round(totalHours * 100) / 100,
    regularHours: Math.round(regularHours * 100) / 100,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    totalPaidHours: Math.round(totalPaidHours * 100) / 100,
    lunchDeduction
  };
};

/**
 * Format hours for display
 * @param {number} hours - Hours to format
 * @returns {string} - Formatted hours (e.g., "8.5" or "8.0")
 */
export const formatHours = (hours) => {
  if (!hours || hours === 0) return '0.0';
  return hours.toFixed(1);
};
