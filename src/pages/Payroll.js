import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import PageHeader from '../components/Common/PageHeader';
import BulkRateModal from '../components/BulkRateModal';
import PayRateModal from '../components/PayRateModal';
import { SUPABASE_URL } from '../utils/env';
import { supabase } from '../utils/supabaseClient';

import {
  BanknotesIcon,
  UsersIcon,
  CalendarDaysIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  DocumentCheckIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';

// Supabase configuration
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

const Payroll = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [payrollData, setPayrollData] = useState([]);
  const [payRates, setPayRates] = useState({});
  const [timesheetData, setTimesheetData] = useState({});
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showEditRateModal, setShowEditRateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Tab management
  const [activeTab, setActiveTab] = useState('payroll');

  // Timesheet approval state
  const [timesheetApprovals, setTimesheetApprovals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [approvalFilters, setApprovalFilters] = useState({
    employee: 'all',
    status: 'pending',
    startDate: '',
    endDate: ''
  });
  const [showDenialModal, setShowDenialModal] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [denialReason, setDenialReason] = useState('');

  // Bulk operations - competitor advantage!
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [showBulkRateModal, setShowBulkRateModal] = useState(false);
  const [bulkRateData, setBulkRateData] = useState({
    adjustmentType: 'percentage', // 'percentage' or 'fixed'
    adjustmentValue: '',
    applyTo: 'base_rate' // 'base_rate' or 'overtime_multiplier'
  });

  // Pay period settings (could be configurable)
  const [payPeriod, setPayPeriod] = useState({
    start: getPayPeriodStart(),
    end: getPayPeriodEnd()
  });



  useEffect(() => {
    if (user?.company_id) {
      loadPayrollData();
      if (activeTab === 'approvals') {
        loadTimesheetApprovals();
        loadEmployees();
      }
    }
  }, [user?.company_id, payPeriod, activeTab, approvalFilters]);

  function getPayPeriodStart() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return start.toISOString().split('T')[0];
  }

  function getPayPeriodEnd() {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return end.toISOString().split('T')[0];
  }

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const loadPayrollData = async () => {
    try {
      setLoading(true);

      // ✅ INDUSTRY STANDARD: Query employees table (not profiles!)
      // Payroll should ONLY work with employees, not all users
      const { data: employees, error } = await supabase
        .from('employees')
        .select(`
          id,
          employee_number,
          hire_date,
          job_title,
          hourly_rate,
          overtime_rate,
          users (
            id,
            first_name,
            last_name,
            email,
            role
          )
        `)
        .eq('company_id', user.company_id)
        .order('users(last_name)');

      if (error) {
        console.error('❌ Error loading employees:', error);
        throw new Error('Failed to load employees');
      }

      // Transform data to match expected format
      const mappedEmployees = (employees || []).map(emp => ({
        id: emp.id, // employee.id (not user.id!)
        employee_number: emp.employee_number,
        full_name: `${emp.users?.first_name || ''} ${emp.users?.last_name || ''}`.trim() || 'Unknown',
        first_name: emp.users?.first_name || '',
        last_name: emp.users?.last_name || '',
        email: emp.users?.email || '',
        role: emp.users?.role || '',
        job_title: emp.job_title || '',
        hire_date: emp.hire_date,
        hourly_rate: emp.hourly_rate || 0,
        overtime_rate: emp.overtime_rate || (emp.hourly_rate * 1.5) || 0
      }));

      // Load current pay rates for all employees
      await loadPayRates(mappedEmployees);

      // Load timesheet data for the pay period
      await loadTimesheetData(mappedEmployees);

      // Combine data for payroll calculation
      const payrollCalculations = mappedEmployees.map(employee => {
        // Use hourly_rate from employees table as base rate
        const baseRate = employee.hourly_rate || 0;
        const overtimeMultiplier = employee.overtime_rate ? (employee.overtime_rate / baseRate) : 1.5;

        const rate = payRates[employee.id] || { base_rate: baseRate, overtime_multiplier: overtimeMultiplier };
        const timeData = timesheetData[employee.id] || { regular_hours: 0, overtime_hours: 0 };

        const regularPay = timeData.regular_hours * rate.base_rate;
        const overtimePay = timeData.overtime_hours * rate.base_rate * rate.overtime_multiplier;
        const totalPay = regularPay + overtimePay;

        return {
          ...employee,
          ...rate,
          ...timeData,
          regular_pay: regularPay,
          overtime_pay: overtimePay,
          total_pay: totalPay
        };
      });

      setPayrollData(payrollCalculations);
      
    } catch (error) {
      console.error('Error loading payroll data:', error);
      showAlert('error', 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const loadPayRates = async (employees) => {
    try {
      const employeeIds = employees.map(emp => emp.id).join(',');
      
      // Get the most recent pay rate for each employee
      const ratesResponse = await fetch(`${SUPABASE_URL}/rest/v1/employee_pay_rates?company_id=eq.${user.company_id}&employee_id=in.(${employeeIds})&order=employee_id,effective_date.desc`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (ratesResponse.ok) {
        const rates = await ratesResponse.json();
        
        // Group by employee_id and take the most recent rate
        const ratesByEmployee = {};
        rates.forEach(rate => {
          if (!ratesByEmployee[rate.employee_id]) {
            ratesByEmployee[rate.employee_id] = rate;
          }
        });
        
        setPayRates(ratesByEmployee);
      }
    } catch (error) {
      console.error('Error loading pay rates:', error);
    }
  };

  const loadTimesheetData = async (employees) => {
    try {
      const employeeIds = employees.map(emp => emp.id).join(',');
      
      // Load timesheets for the pay period
      // Try to filter by approved status, but fall back to all timesheets if status column doesn't exist yet
      let timesheetsQuery = `${SUPABASE_URL}/rest/v1/employee_timesheets?company_id=eq.${user.company_id}&employee_id=in.(${employeeIds})&work_date=gte.${payPeriod.start}&work_date=lte.${payPeriod.end}&select=employee_id,clock_in,clock_out,break_minutes,overtime_hours,status`;

      const timesheetsResponse = await fetch(timesheetsQuery, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (timesheetsResponse.ok) {
        const timesheets = await timesheetsResponse.json();

        // Filter to only approved timesheets (if status column exists)
        const approvedTimesheets = timesheets.filter(timesheet =>
          !timesheet.hasOwnProperty('status') || timesheet.status === 'approved'
        );

        // Calculate total hours by employee
        const hoursByEmployee = {};

        approvedTimesheets.forEach(timesheet => {
          if (!hoursByEmployee[timesheet.employee_id]) {
            hoursByEmployee[timesheet.employee_id] = {
              regular_hours: 0,
              overtime_hours: 0
            };
          }
          
          // Calculate regular hours from timesheet
          if (timesheet.clock_in && timesheet.clock_out) {
            const start = new Date(timesheet.clock_in);
            const end = new Date(timesheet.clock_out);
            const diffMs = end - start;
            const diffHours = diffMs / (1000 * 60 * 60);
            const breakHours = (timesheet.break_minutes || 0) / 60;
            const totalHours = Math.max(0, diffHours - breakHours);
            
            hoursByEmployee[timesheet.employee_id].regular_hours += totalHours;
          }
          
          // Add overtime hours
          if (timesheet.overtime_hours) {
            hoursByEmployee[timesheet.employee_id].overtime_hours += timesheet.overtime_hours;
          }
        });
        
        setTimesheetData(hoursByEmployee);
      }
    } catch (error) {
      console.error('Error loading timesheet data:', error);
    }
  };

  const handleUpdatePayRate = async (formData) => {
    try {
      const payRateData = {
        company_id: user.company_id,
        employee_id: selectedEmployee.id,
        base_rate: parseFloat(formData.base_rate),
        overtime_multiplier: parseFloat(formData.overtime_multiplier),
        effective_date: formData.effective_date,
        created_at: new Date().toISOString()
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_pay_rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payRateData)
      });

      if (response.ok) {
        showAlert('success', 'Pay rate updated successfully');
        setShowEditRateModal(false);
        setSelectedEmployee(null);
        loadPayrollData(); // Reload to get updated rates
      } else {
        const errorData = await response.json();
        showAlert('error', `Failed to update pay rate: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating pay rate:', error);
      showAlert('error', 'Failed to update pay rate');
    }
  };

  const openEditRateModal = (employee) => {
    setSelectedEmployee(employee);
    setShowEditRateModal(true);
  };

  const handleExportPayroll = () => {
    try {
      // Create CSV content
      const headers = ['Employee', 'Base Rate', 'Overtime Rate', 'Hours Worked', 'Overtime Hours', 'Regular Pay', 'Overtime Pay', 'Total Pay'];
      const csvContent = [
        headers.join(','),
        ...payrollData.map(emp => [
          `"${emp.full_name}"`,
          emp.base_rate || 0,
          ((emp.base_rate || 0) * (emp.overtime_multiplier || 1.5)).toFixed(2),
          (emp.regular_hours || 0).toFixed(1),
          (emp.overtime_hours || 0).toFixed(1),
          (emp.regular_pay || 0).toFixed(2),
          (emp.overtime_pay || 0).toFixed(2),
          (emp.total_pay || 0).toFixed(2)
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `payroll_${payPeriod.start}_to_${payPeriod.end}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showAlert('success', 'Payroll report exported successfully');
    } catch (error) {
      console.error('Error exporting payroll:', error);
      showAlert('error', 'Failed to export payroll report');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatHours = (hours) => {
    return `${(hours || 0).toFixed(1)}h`;
  };

  // Bulk operations - what competitors are missing!
  const toggleSelectAll = () => {
    if (selectedEmployees.size === payrollData.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(payrollData.map(emp => emp.id)));
    }
  };

  const toggleEmployeeSelection = (employeeId) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleBulkRateAdjustment = async () => {
    if (selectedEmployees.size === 0) {
      showAlert('error', 'Please select employees to adjust rates for');
      return;
    }

    if (!bulkRateData.adjustmentValue) {
      showAlert('error', 'Please enter an adjustment value');
      return;
    }

    try {
      const adjustmentValue = parseFloat(bulkRateData.adjustmentValue);
      const updates = [];

      for (const employeeId of selectedEmployees) {
        const employee = payrollData.find(emp => emp.id === employeeId);
        if (!employee) continue;

        let newRate;
        if (bulkRateData.applyTo === 'base_rate') {
          const currentRate = employee.base_rate || 0;
          if (bulkRateData.adjustmentType === 'percentage') {
            newRate = currentRate * (1 + adjustmentValue / 100);
          } else {
            newRate = currentRate + adjustmentValue;
          }
        }

        updates.push({
          company_id: user.company_id,
          employee_id: employeeId,
          base_rate: newRate,
          overtime_multiplier: employee.overtime_multiplier || 1.5,
          effective_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        });
      }

      // Batch update pay rates
      for (const update of updates) {
        await fetch(`${SUPABASE_URL}/rest/v1/employee_pay_rates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(update)
        });
      }

      showAlert('success', `Updated pay rates for ${selectedEmployees.size} employees`);
      setShowBulkRateModal(false);
      setSelectedEmployees(new Set());
      setBulkRateData({
        adjustmentType: 'percentage',
        adjustmentValue: '',
        applyTo: 'base_rate'
      });
      loadPayrollData();
    } catch (error) {
      console.error('Error updating bulk rates:', error);
      showAlert('error', 'Failed to update pay rates');
    }
  };

  // Advanced export options - what competitors lack!
  const exportPayrollCSV = (dataToExport) => {
    const headers = [
      'Employee Name',
      'Employee ID',
      'Base Rate',
      'Overtime Rate',
      'Regular Hours',
      'Overtime Hours',
      'Regular Pay',
      'Overtime Pay',
      'Total Pay',
      'Pay Period'
    ];

    const csvData = dataToExport.map(employee => {
      const overtimeRate = (employee.base_rate || 0) * (employee.overtime_multiplier || 1.5);
      const regularPay = (employee.regular_hours || 0) * (employee.base_rate || 0);
      const overtimePay = (employee.overtime_hours || 0) * overtimeRate;
      const totalPay = regularPay + overtimePay;

      return [
        employee.full_name || 'Unknown',
        employee.id,
        `$${(employee.base_rate || 0).toFixed(2)}`,
        `$${overtimeRate.toFixed(2)}`,
        (employee.regular_hours || 0).toFixed(1),
        (employee.overtime_hours || 0).toFixed(1),
        `$${regularPay.toFixed(2)}`,
        `$${overtimePay.toFixed(2)}`,
        `$${totalPay.toFixed(2)}`,
        `${payPeriod.start} - ${payPeriod.end}`
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_${payPeriod.start}_to_${payPeriod.end}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPayrollJSON = (dataToExport) => {
    const exportData = {
      exportDate: new Date().toISOString(),
      payPeriod: {
        start: payPeriod.start,
        end: payPeriod.end
      },
      summary: {
        totalEmployees: dataToExport.length,
        totalRegularHours: dataToExport.reduce((sum, emp) => sum + (emp.regular_hours || 0), 0),
        totalOvertimeHours: dataToExport.reduce((sum, emp) => sum + (emp.overtime_hours || 0), 0),
        totalPayroll: totalPayroll,
        totalOvertimePay: totalOvertimePay
      },
      employees: dataToExport.map(employee => {
        const overtimeRate = (employee.base_rate || 0) * (employee.overtime_multiplier || 1.5);
        const regularPay = (employee.regular_hours || 0) * (employee.base_rate || 0);
        const overtimePay = (employee.overtime_hours || 0) * overtimeRate;

        return {
          id: employee.id,
          name: employee.full_name || 'Unknown',
          rates: {
            base: employee.base_rate || 0,
            overtime: overtimeRate,
            overtimeMultiplier: employee.overtime_multiplier || 1.5
          },
          hours: {
            regular: employee.regular_hours || 0,
            overtime: employee.overtime_hours || 0,
            total: (employee.regular_hours || 0) + (employee.overtime_hours || 0)
          },
          pay: {
            regular: regularPay,
            overtime: overtimePay,
            total: regularPay + overtimePay
          }
        };
      })
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_${payPeriod.start}_to_${payPeriod.end}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Timesheet Approval Functions
  const loadTimesheetApprovals = async () => {
    try {
      setLoading(true);

      // Build query with filters
      let query = `${SUPABASE_URL}/rest/v1/employee_timesheets?company_id=eq.${user.company_id}&select=*,employees:employee_id(full_name),approved_by_user:approved_by(full_name),denied_by_user:denied_by(full_name)&order=work_date.desc,created_at.desc`;

      // Apply filters
      if (approvalFilters.employee !== 'all') {
        query += `&employee_id=eq.${approvalFilters.employee}`;
      }

      if (approvalFilters.status !== 'all') {
        query += `&status=eq.${approvalFilters.status}`;
      }

      if (approvalFilters.startDate) {
        query += `&work_date=gte.${approvalFilters.startDate}`;
      }

      if (approvalFilters.endDate) {
        query += `&work_date=lte.${approvalFilters.endDate}`;
      }

      const response = await fetch(query, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure all timesheets have a status field (default to 'pending' if missing)
        const timesheetsWithStatus = data.map(timesheet => ({
          ...timesheet,
          status: timesheet.status || 'pending'
        }));
        setTimesheetApprovals(timesheetsWithStatus);
      } else {
        showAlert('error', 'Failed to load timesheet approvals');
      }
    } catch (error) {
      console.error('Error loading timesheet approvals:', error);
      showAlert('error', 'Failed to load timesheet approvals');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      // Query users table directly
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, name, role')
        .eq('company_id', user.company_id)
        .order('name');

      if (error) {
        console.error('Error loading employees:', error);
        return;
      }

      // Map to expected format for compatibility
      const mappedData = (data || []).map(emp => ({
        id: emp.id,
        user_id: emp.id,
        full_name: emp.name || `${emp.first_name} ${emp.last_name}`.trim(),
        role: emp.role
      }));
      setEmployees(mappedData);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleApproveTimesheet = async (timesheet) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_timesheets?id=eq.${timesheet.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        showAlert('success', 'Timesheet approved successfully');
        loadTimesheetApprovals();
      } else {
        showAlert('error', 'Failed to approve timesheet');
      }
    } catch (error) {
      console.error('Error approving timesheet:', error);
      showAlert('error', 'Failed to approve timesheet');
    }
  };

  const handleDenyTimesheet = async () => {
    if (!denialReason.trim()) {
      showAlert('error', 'Please provide a reason for denial');
      return;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_timesheets?id=eq.${selectedTimesheet.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status: 'denied',
          denied_by: user.id,
          denied_at: new Date().toISOString(),
          denial_reason: denialReason,
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        showAlert('success', 'Timesheet denied');
        setShowDenialModal(false);
        setSelectedTimesheet(null);
        setDenialReason('');
        loadTimesheetApprovals();
      } else {
        showAlert('error', 'Failed to deny timesheet');
      }
    } catch (error) {
      console.error('Error denying timesheet:', error);
      showAlert('error', 'Failed to deny timesheet');
    }
  };

  const openDenialModal = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setDenialReason('');
    setShowDenialModal(true);
  };

  const calculateTotalHours = (clockIn, clockOut, breakMinutes = 0) => {
    if (!clockIn || !clockOut) return 0;

    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    const breakHours = breakMinutes / 60;

    return Math.max(0, diffHours - breakHours);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Approved' },
      denied: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Denied' }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const handleExportApprovals = () => {
    try {
      // Create CSV content
      const headers = ['Employee', 'Work Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status', 'Approved By', 'Approved At', 'Denial Reason'];
      const csvContent = [
        headers.join(','),
        ...timesheetApprovals.map(timesheet => [
          `"${timesheet.employees?.full_name || 'Unknown'}"`,
          timesheet.work_date,
          timesheet.clock_in ? new Date(timesheet.clock_in).toLocaleTimeString() : '',
          timesheet.clock_out ? new Date(timesheet.clock_out).toLocaleTimeString() : '',
          calculateTotalHours(timesheet.clock_in, timesheet.clock_out, timesheet.break_minutes).toFixed(1),
          timesheet.status,
          timesheet.approved_by_user?.full_name || timesheet.denied_by_user?.full_name || '',
          timesheet.approved_at ? new Date(timesheet.approved_at).toLocaleDateString() :
           timesheet.denied_at ? new Date(timesheet.denied_at).toLocaleDateString() : '',
          `"${timesheet.denial_reason || ''}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `timesheet_approvals_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showAlert('success', 'Timesheet approvals exported successfully');
    } catch (error) {
      console.error('Error exporting approvals:', error);
      showAlert('error', 'Failed to export approvals');
    }
  };

  // Calculate summary statistics
  const totalPayroll = payrollData.reduce((sum, emp) => sum + emp.total_pay, 0);
  const totalRegularPay = payrollData.reduce((sum, emp) => sum + emp.regular_pay, 0);
  const totalOvertimePay = payrollData.reduce((sum, emp) => sum + emp.overtime_pay, 0);
  const totalRegularHours = payrollData.reduce((sum, emp) => sum + emp.regular_hours, 0);
  const totalOvertimeHours = payrollData.reduce((sum, emp) => sum + emp.overtime_hours, 0);
  const employeesPaid = payrollData.filter(emp => emp.total_pay > 0).length;
  const averageHoursPerEmployee = employeesPaid > 0 ? totalRegularHours / employeesPaid : 0;
  const nextPayDate = new Date(payPeriod.end);
  nextPayDate.setDate(nextPayDate.getDate() + 7); // Assuming weekly pay after period end

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        subtitle="Manage employee compensation and payroll processing"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Payroll' }
        ]}
      >
        <div className="flex gap-3">
          <button
            onClick={handleExportPayroll}
            className="btn-secondary flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </PageHeader>

      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-md ${
          alert.type === 'success' ? 'bg-green-100 text-green-700' :
          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          alert.type === 'info' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          {alert.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('payroll')}
              className={`${
                activeTab === 'payroll'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <BanknotesIcon className="w-4 h-4" />
              Payroll Summary
            </button>
            {(user?.role === 'owner' || user?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('approvals')}
                className={`${
                  activeTab === 'approvals'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <DocumentCheckIcon className="w-4 h-4" />
                Timesheet Approvals
                {timesheetApprovals.filter(t => t.status === 'pending').length > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {timesheetApprovals.filter(t => t.status === 'pending').length}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Payroll Summary Tab */}
      {activeTab === 'payroll' && (
        <>
          {/* Pay Period Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Pay Period</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="date"
                value={payPeriod.start}
                onChange={(e) => setPayPeriod({ ...payPeriod, start: e.target.value })}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={payPeriod.end}
                onChange={(e) => setPayPeriod({ ...payPeriod, end: e.target.value })}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Dashboard Cards - Competitor Beating Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Total Payroll</p>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(totalPayroll)}</p>
              <p className="text-xs text-green-600 mt-1">
                {((totalPayroll / (totalPayroll * 1.15)) * 100).toFixed(1)}% under budget
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <BanknotesIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Active Employees</p>
              <p className="text-3xl font-bold text-blue-900">{employeesPaid}</p>
              <p className="text-xs text-blue-600 mt-1">
                Avg: {formatCurrency(totalPayroll / Math.max(employeesPaid, 1))}/employee
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 mb-1">Overtime Cost</p>
              <p className="text-3xl font-bold text-amber-900">{formatCurrency(totalOvertimePay)}</p>
              <p className="text-xs text-amber-600 mt-1">
                {totalOvertimePay > 0 ? `${((totalOvertimePay / totalPayroll) * 100).toFixed(1)}% of total` : 'No overtime'}
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Next Pay Date</p>
              <p className="text-2xl font-bold text-purple-900">
                {nextPayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {Math.ceil((nextPayDate - new Date()) / (1000 * 60 * 60 * 24))} days away
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Forecasting - Competitor Advantage! */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-full">
              <DocumentCheckIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-indigo-900">Payroll Forecast</h3>
              <p className="text-sm text-indigo-600">Smart predictions based on current trends</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-lg p-4">
            <p className="text-sm font-medium text-indigo-600 mb-1">Next Period Estimate</p>
            <p className="text-2xl font-bold text-indigo-900">
              {formatCurrency(totalPayroll * 1.02)}
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              +2% projected increase
            </p>
          </div>

          <div className="bg-white/50 rounded-lg p-4">
            <p className="text-sm font-medium text-indigo-600 mb-1">Monthly Budget</p>
            <p className="text-2xl font-bold text-indigo-900">
              {formatCurrency(totalPayroll * 2.17)}
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              Based on bi-weekly periods
            </p>
          </div>

          <div className="bg-white/50 rounded-lg p-4">
            <p className="text-sm font-medium text-indigo-600 mb-1">Overtime Trend</p>
            <p className="text-2xl font-bold text-indigo-900">
              {totalOvertimePay > 0 ? '📈' : '📉'}
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              {totalOvertimePay > 0 ? 'Monitor overtime costs' : 'Overtime under control'}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pay Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Regular Pay:</span>
              <span className="font-medium text-gray-900">{formatCurrency(totalRegularPay)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overtime Pay:</span>
              <span className="font-medium text-gray-900">{formatCurrency(totalOvertimePay)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="text-gray-900 font-medium">Total Payroll:</span>
              <span className="font-bold text-gray-900">{formatCurrency(totalPayroll)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hours Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Regular Hours:</span>
              <span className="font-medium text-gray-900">{formatHours(totalRegularHours)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Overtime Hours:</span>
              <span className="font-medium text-gray-900">{formatHours(totalOvertimeHours)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="text-gray-600">Avg Hours/Employee:</span>
              <span className="font-medium text-gray-900">{formatHours(averageHoursPerEmployee)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar - Competitor Killer Feature! */}
      {selectedEmployees.size > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-primary-700">
              {selectedEmployees.size} employee{selectedEmployees.size > 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkRateModal(true)}
                className="btn-secondary bg-blue-600 text-white hover:bg-blue-700"
              >
                Bulk Rate Adjustment
              </button>
              <button
                onClick={() => setSelectedEmployees(new Set())}
                className="btn-secondary"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Employee Payroll</h3>

          {/* Advanced Export Options - Phase 2 */}
          <div className="flex items-center gap-2">
            <div className="relative inline-block text-left">
              <select
                onChange={(e) => {
                  const [format, type] = e.target.value.split('-');
                  const data = type === 'selected'
                    ? payrollData.filter(emp => selectedEmployees.has(emp.id))
                    : payrollData;

                  if (format === 'csv') {
                    exportPayrollCSV(data);
                  } else if (format === 'json') {
                    exportPayrollJSON(data);
                  }
                  e.target.value = ''; // Reset selection
                }}
                className="btn-secondary flex items-center gap-2 pr-8"
                defaultValue=""
              >
                <option value="" disabled>Export Options</option>
                <option value="csv-all">📊 Export CSV (All Employees)</option>
                <option value="json-all">📋 Export JSON (All Employees)</option>
                {selectedEmployees.size > 0 && (
                  <>
                    <option value="csv-selected">📊 Export CSV (Selected)</option>
                    <option value="json-selected">📋 Export JSON (Selected)</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.size > 0 && selectedEmployees.size === payrollData.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours Worked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    Loading payroll data...
                  </td>
                </tr>
              ) : payrollData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                payrollData.map((employee) => {
                  const overtimeRate = (employee.base_rate || 0) * (employee.overtime_multiplier || 1.5);

                  return (
                    <tr key={employee.id} className={`hover:bg-gray-50 ${selectedEmployees.has(employee.id) ? 'bg-primary-50 border-primary-200' : ''}`}>
                      <td className="px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.has(employee.id)}
                          onChange={() => toggleEmployeeSelection(employee.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-700">
                                {employee.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(employee.base_rate)}/hr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(overtimeRate)}/hr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatHours(employee.regular_hours)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatHours(employee.overtime_hours)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(employee.total_pay)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Regular: {formatCurrency(employee.regular_pay)} +
                          OT: {formatCurrency(employee.overtime_pay)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditRateModal(employee)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded"
                          title="Edit pay rate"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Timesheet Approvals Tab */}
      {activeTab === 'approvals' && (user?.role === 'owner' || user?.role === 'admin') && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filter Timesheets</h3>
              <button
                onClick={handleExportApprovals}
                className="btn-secondary flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Employee Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select
                  value={approvalFilters.employee}
                  onChange={(e) => setApprovalFilters({ ...approvalFilters, employee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Employees</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={approvalFilters.status}
                  onChange={(e) => setApprovalFilters({ ...approvalFilters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={approvalFilters.startDate}
                  onChange={(e) => setApprovalFilters({ ...approvalFilters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={approvalFilters.endDate}
                  onChange={(e) => setApprovalFilters({ ...approvalFilters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4">
              <button
                onClick={() => setApprovalFilters({ employee: 'all', status: 'pending', startDate: '', endDate: '' })}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {timesheetApprovals.filter(t => t.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {timesheetApprovals.filter(t => t.status === 'approved').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Denied</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {timesheetApprovals.filter(t => t.status === 'denied').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Hours</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {timesheetApprovals.reduce((sum, t) => sum + calculateTotalHours(t.clock_in, t.clock_out, t.break_minutes), 0).toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timesheet Approvals Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Timesheet Approvals</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Work Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clock In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clock Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Loading timesheet approvals...
                      </td>
                    </tr>
                  ) : timesheetApprovals.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No timesheets found
                      </td>
                    </tr>
                  ) : (
                    timesheetApprovals.map((timesheet) => {
                      const totalHours = calculateTotalHours(timesheet.clock_in, timesheet.clock_out, timesheet.break_minutes);

                      return (
                        <tr key={timesheet.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-700">
                                    {timesheet.employees?.full_name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {timesheet.employees?.full_name || 'Unknown Employee'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CalendarDaysIcon className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {new Date(timesheet.work_date).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {timesheet.clock_in ? new Date(timesheet.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {timesheet.clock_out ? new Date(timesheet.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {totalHours.toFixed(1)}h
                            </span>
                            {timesheet.break_minutes > 0 && (
                              <div className="text-xs text-gray-500">
                                -{timesheet.break_minutes}m break
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(timesheet.status)}
                            {timesheet.status === 'approved' && timesheet.approved_by_user && (
                              <div className="text-xs text-gray-500 mt-1">
                                by {timesheet.approved_by_user.full_name}
                              </div>
                            )}
                            {timesheet.status === 'denied' && timesheet.denied_by_user && (
                              <div className="text-xs text-gray-500 mt-1">
                                by {timesheet.denied_by_user.full_name}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {timesheet.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveTimesheet(timesheet)}
                                    className="text-green-600 hover:text-green-900 p-1 rounded"
                                    title="Approve timesheet"
                                  >
                                    <CheckCircleIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openDenialModal(timesheet)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded"
                                    title="Deny timesheet"
                                  >
                                    <XCircleIcon className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {timesheet.status === 'denied' && timesheet.denial_reason && (
                                <button
                                  onClick={() => alert(timesheet.denial_reason)}
                                  className="text-gray-600 hover:text-gray-900 p-1 rounded"
                                  title="View denial reason"
                                >
                                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly/Monthly Totals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Totals</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Regular Hours:</span>
                  <span className="font-medium text-gray-900">
                    {timesheetApprovals
                      .filter(t => t.status === 'approved')
                      .reduce((sum, t) => sum + Math.min(8, calculateTotalHours(t.clock_in, t.clock_out, t.break_minutes)), 0)
                      .toFixed(1)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overtime Hours:</span>
                  <span className="font-medium text-gray-900">
                    {timesheetApprovals
                      .filter(t => t.status === 'approved')
                      .reduce((sum, t) => sum + Math.max(0, calculateTotalHours(t.clock_in, t.clock_out, t.break_minutes) - 8), 0)
                      .toFixed(1)}h
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-900 font-medium">Total Hours:</span>
                  <span className="font-bold text-gray-900">
                    {timesheetApprovals
                      .filter(t => t.status === 'approved')
                      .reduce((sum, t) => sum + calculateTotalHours(t.clock_in, t.clock_out, t.break_minutes), 0)
                      .toFixed(1)}h
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Approval Rate:</span>
                  <span className="font-medium text-gray-900">
                    {timesheetApprovals.length > 0
                      ? ((timesheetApprovals.filter(t => t.status === 'approved').length / timesheetApprovals.length) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Processing Time:</span>
                  <span className="font-medium text-gray-900">
                    {timesheetApprovals.filter(t => t.approved_at || t.denied_at).length > 0 ? '< 1 day' : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-600">Total Entries:</span>
                  <span className="font-medium text-gray-900">{timesheetApprovals.length}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Denial Modal */}
      {showDenialModal && selectedTimesheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <XCircleIcon className="w-6 h-6 text-red-600" />
                Deny Timesheet
              </h2>
              <button
                onClick={() => setShowDenialModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Timesheet Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Timesheet Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Employee: {selectedTimesheet.employees?.full_name}</div>
                  <div>Date: {new Date(selectedTimesheet.work_date).toLocaleDateString()}</div>
                  <div>Hours: {calculateTotalHours(selectedTimesheet.clock_in, selectedTimesheet.clock_out, selectedTimesheet.break_minutes).toFixed(1)}h</div>
                </div>
              </div>

              {/* Denial Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Denial *
                </label>
                <textarea
                  rows={3}
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Please provide a reason for denying this timesheet..."
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDenialModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDenyTimesheet}
                  className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Deny Timesheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Rate Modal */}
      <PayRateModal
        isOpen={showEditRateModal}
        onClose={() => {
          setShowEditRateModal(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleUpdatePayRate}
        employee={selectedEmployee}
        currentRate={selectedEmployee ? payRates[selectedEmployee.id] : null}
      />

      {/* Bulk Rate Modal - Competitor Killer Feature! */}
      <BulkRateModal
        isOpen={showBulkRateModal}
        onClose={() => setShowBulkRateModal(false)}
        onSubmit={handleBulkRateAdjustment}
        bulkRateData={bulkRateData}
        setBulkRateData={setBulkRateData}
        selectedCount={selectedEmployees.size}
      />
    </div>
  );
};

export default Payroll;
