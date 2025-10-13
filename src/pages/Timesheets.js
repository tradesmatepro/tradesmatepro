import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernTable from '../components/Common/ModernTable';
import ModernCard from '../components/Common/ModernCard';
import '../styles/modern-enhancements.css';
import TimesheetFormModal from '../components/TimesheetFormModal';
import PTORequestModal from '../components/PTORequestModal';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';
import { supabase } from '../utils/supabaseClient';

import {
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  UserIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Timesheets = ({ initialTab, showAdminTabs = false }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [activeTab, setActiveTab] = useState(initialTab || 'timesheets');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('approve'); // 'approve' or 'reject'
  const [denialReason, setDenialReason] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [overtimeFilter, setOvertimeFilter] = useState(false); // ✅ NEW: Filter for overtime timesheets
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: '',
    end: ''
  });
  const [quickDateFilter, setQuickDateFilter] = useState('all');

  // Bulk operations - competitor advantage!
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');

  // Advanced calculations - Phase 2 enhancement
  const [summaryStats, setSummaryStats] = useState({
    totalHours: 0,
    totalOvertimeHours: 0,
    uniqueEmployees: 0,
    pendingApprovals: 0
  });

  // Notification system - Phase 2 enhancement
  const [notifications, setNotifications] = useState([]);

  // PTO functionality - moved from Employees page
  const [showPTOModal, setShowPTOModal] = useState(false);
  const [ptoRequests, setPtoRequests] = useState([]);
  const [showPTOAdjustmentModal, setShowPTOAdjustmentModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);



  useEffect(() => {
    if (user?.company_id) {
      loadTimesheets();
      loadEmployees();
      loadJobs();
      loadPTORequests(); // Load employee's PTO requests
    }
  }, [user?.company_id]);

  // Supabase fetch helper
  const supaFetch = async (endpoint, options = {}, companyId = null) => {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const loadTimesheets = async () => {
    try {
      setLoading(true);

      // ✅ INDUSTRY STANDARD: employee_timesheets.employee_id → employees.id
      // Build query with correct join to employees table
      // Note: employee_timesheets doesn't have company_id, so we filter through employees
      // ✅ FIX: Add work_orders join using work_order_id (not job_id)
      let query = `${SUPABASE_URL}/rest/v1/employee_timesheets?select=*,employees:employee_id(id,employee_number,company_id,users(first_name,last_name,email)),work_orders:work_order_id(id,title)&order=date.desc,created_at.desc`;

      // Employees only see their own timesheets, Owners/Admins see everyone's
      if (user.role === 'employee') {
        // First, look up the employee record for this user
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.user_id)
          .single();

        if (employeeError || !employeeData) {
          console.warn('⚠️ No employee record found for user:', user.user_id);
          setTimesheets([]);
          setLoading(false);
          return;
        }

        query += `&employee_id=eq.${employeeData.id}`;
      }
      // Owners and Admins see all timesheets for their company (filter after fetch)

      const response = await fetch(query, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // 🔍 DEBUG: Log raw data structure
        console.log('📊 Raw timesheet data:', data);
        console.log('📊 First timesheet structure:', data[0]);
        console.log('📊 Employee data:', data[0]?.employees);
        console.log('📊 Work date field:', data[0]?.date, data[0]?.work_date);

        // Filter by company_id through the employees relationship
        const companyTimesheets = data.filter(timesheet =>
          timesheet.employees?.company_id === user.company_id
        );

        // Ensure all timesheets have a status field (default to 'approved' for existing timesheets)
        const timesheetsWithStatus = companyTimesheets.map(timesheet => ({
          ...timesheet,
          status: timesheet.status || 'approved',
          // Add computed full_name for display
          full_name: timesheet.employees?.users
            ? `${timesheet.employees.users.first_name || ''} ${timesheet.employees.users.last_name || ''}`.trim()
            : 'Unknown Employee',
          // ✅ FIX: Use 'date' field (not 'work_date')
          work_date: timesheet.date,
          // ✅ FIX: Add job title from work_orders join
          job_title: timesheet.work_orders?.title || 'No Job',
          // ✅ FIX: Map break_duration to break_minutes for compatibility
          break_minutes: timesheet.break_duration || 0
        }));

        console.log('📊 Processed timesheets:', timesheetsWithStatus);
        console.log('📊 Sample processed timesheet:', timesheetsWithStatus[0]);
        console.log('📊 Full name check:', timesheetsWithStatus[0]?.full_name);
        console.log('📊 Job title check:', timesheetsWithStatus[0]?.job_title);
        console.log('📊 Unique employee_ids:', [...new Set(timesheetsWithStatus.map(t => t.employee_id))]);
        console.log('📊 Employees with valid data:', timesheetsWithStatus.filter(t => t.employees && t.employees.id).length);
        setTimesheets(timesheetsWithStatus);
      } else {
        const errorData = await response.json();
        console.error('Failed to load timesheets:', errorData);
        showAlert('error', 'Failed to load timesheets');
      }
    } catch (error) {
      console.error('Error loading timesheets:', error);
      showAlert('error', 'Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      // ✅ INDUSTRY STANDARD: Query employees table (not users!)
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          employee_number,
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
        console.error('Error loading employees:', error);
        return;
      }

      // Transform data to match expected format
      const mappedEmployees = (data || []).map(emp => ({
        id: emp.id, // employee.id (not user.id!)
        employee_number: emp.employee_number,
        full_name: `${emp.users?.first_name || ''} ${emp.users?.last_name || ''}`.trim() || 'Unknown',
        first_name: emp.users?.first_name || '',
        last_name: emp.users?.last_name || '',
        email: emp.users?.email || '',
        role: emp.users?.role || ''
      }));

      setEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadJobs = async () => {
    try {
      // Use correct column names from schema: job_title instead of title
      const response = await fetch(`${SUPABASE_URL}/rest/v1/work_orders?company_id=eq.${user.company_id}&select=id,title,customer_id&order=title`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Map work_orders data to jobs format for compatibility
        const mappedJobs = data.map(wo => ({
          id: wo.id,
          job_title: wo.title,
          customer_id: wo.customer_id
        }));
        setJobs(mappedJobs);
      } else {
        console.error('Failed to load jobs:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
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

  // Quick date filter function - competitor advantage!
  const applyQuickDateFilter = (filterType) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    switch (filterType) {
      case 'today':
        setDateRangeFilter({
          start: startOfToday.toISOString().split('T')[0],
          end: startOfToday.toISOString().split('T')[0]
        });
        break;
      case 'yesterday':
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        setDateRangeFilter({
          start: yesterday.toISOString().split('T')[0],
          end: yesterday.toISOString().split('T')[0]
        });
        break;
      case 'thisWeek':
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
        setDateRangeFilter({
          start: startOfWeek.toISOString().split('T')[0],
          end: startOfToday.toISOString().split('T')[0]
        });
        break;
      case 'lastWeek':
        const startOfLastWeek = new Date(startOfToday);
        startOfLastWeek.setDate(startOfToday.getDate() - startOfToday.getDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        setDateRangeFilter({
          start: startOfLastWeek.toISOString().split('T')[0],
          end: endOfLastWeek.toISOString().split('T')[0]
        });
        break;
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRangeFilter({
          start: startOfMonth.toISOString().split('T')[0],
          end: startOfToday.toISOString().split('T')[0]
        });
        break;
      case 'all':
      default:
        setDateRangeFilter({ start: '', end: '' });
        break;
    }
    setQuickDateFilter(filterType);
  };

  // Bulk operations - what competitors are missing!
  const toggleSelectAll = () => {
    const filteredTimesheets = getFilteredTimesheets();
    if (selectedIds.size === filteredTimesheets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTimesheets.map(t => t.id)));
    }
  };

  const toggleRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const bulkApprove = async () => {
    if (selectedIds.size === 0) return;

    try {
      const updates = Array.from(selectedIds).map(id => ({
        id,
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id
      }));

      for (const update of updates) {
        await fetch(`${SUPABASE_URL}/rest/v1/employee_timesheets?id=eq.${update.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            status: update.status,
            approved_at: update.approved_at,
            approved_by: update.approved_by
          })
        });
      }

      setAlert({ show: true, type: 'success', message: `${selectedIds.size} timesheets approved successfully!` });
      setSelectedIds(new Set());
      loadTimesheets();
    } catch (error) {
      setAlert({ show: true, type: 'error', message: 'Failed to approve timesheets' });
    }
  };

  const bulkReject = async () => {
    if (selectedIds.size === 0) return;

    const reason = prompt('Enter rejection reason (optional):') || 'Bulk rejection';

    try {
      const updates = Array.from(selectedIds).map(id => ({
        id,
        status: 'rejected',
        denied_at: new Date().toISOString(),
        denied_by: user.id,
        denial_reason: reason
      }));

      for (const update of updates) {
        await fetch(`${SUPABASE_URL}/rest/v1/employee_timesheets?id=eq.${update.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            status: update.status,
            denied_at: update.denied_at,
            denied_by: update.denied_by,
            denial_reason: update.denial_reason
          })
        });
      }

      setAlert({ show: true, type: 'success', message: `${selectedIds.size} timesheets rejected successfully!` });
      setSelectedIds(new Set());
      loadTimesheets();
    } catch (error) {
      setAlert({ show: true, type: 'error', message: 'Failed to reject timesheets' });
    }
  };

  // Smart Export - Export exactly what you see!
  const exportTimesheetsCSV = (timesheetsToExport) => {
    const headers = [
      'Employee',
      'Job',
      'Work Date',
      'Clock In',
      'Clock Out',
      'Total Hours',
      'Regular Hours',
      'Overtime Hours',
      'Lunch Taken',
      'Status',
      'Notes'
    ];

    const csvData = timesheetsToExport.map(timesheet => {
      const totalHours = calculateTotalHours(timesheet.clock_in, timesheet.clock_out, timesheet.break_minutes);
      return [
        timesheet.full_name || 'Unknown',
        timesheet.job_title || 'No Job',
        new Date(timesheet.work_date).toLocaleDateString(),
        formatTime(timesheet.clock_in),
        formatTime(timesheet.clock_out),
        totalHours.toFixed(2),
        timesheet.regular_hours?.toFixed(2) || totalHours.toFixed(2),
        timesheet.overtime_hours?.toFixed(2) || '0.00',
        timesheet.lunch_taken ? 'Yes' : 'No',
        timesheet.status || 'approved',
        timesheet.notes || ''
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `timesheets_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Advanced export with multiple formats - Phase 2
  const exportTimesheetsJSON = (timesheetsToExport) => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalRecords: timesheetsToExport.length,
      summary: calculateSummaryStats(timesheetsToExport),
      timesheets: timesheetsToExport.map(timesheet => ({
        id: timesheet.id,
        employee: {
          id: timesheet.employee_id,
          name: timesheet.employees?.full_name || 'Unknown'
        },
        job: {
          id: timesheet.work_order_id,
          title: timesheet.job_title || 'No Job'
        },
        workDate: timesheet.work_date,
        clockIn: timesheet.clock_in,
        clockOut: timesheet.clock_out,
        totalHours: calculateTotalHours(timesheet.clock_in, timesheet.clock_out, timesheet.break_minutes),
        regularHours: timesheet.regular_hours || 0,
        overtimeHours: timesheet.overtime_hours || 0,
        lunchTaken: timesheet.lunch_taken,
        status: timesheet.status || 'approved',
        notes: timesheet.notes || '',
        createdAt: timesheet.created_at,
        updatedAt: timesheet.updated_at
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `timesheets_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Export timesheets as CSV - matches what user is viewing
  const exportTimesheets = (timesheetsToExport) => {
    if (!timesheetsToExport || timesheetsToExport.length === 0) {
      showAlert('warning', 'No timesheets to export');
      return;
    }

    const headers = [
      'Date',
      'Employee',
      'Job',
      'Clock In',
      'Clock Out',
      'Break (min)',
      'Total Hours',
      'Regular Hours',
      'Overtime Hours',
      'Status',
      'Notes'
    ];

    const csvRows = timesheetsToExport.map(timesheet => [
      timesheet.work_date || '',
      timesheet.full_name || 'Unknown',
      timesheet.job_title || 'No Job',
      timesheet.clock_in || '',
      timesheet.clock_out || '',
      timesheet.break_minutes || 0,
      calculateTotalHours(timesheet.clock_in, timesheet.clock_out, timesheet.break_minutes).toFixed(2),
      (timesheet.regular_hours || 0).toFixed(2),
      (timesheet.overtime_hours || 0).toFixed(2),
      timesheet.status || 'approved',
      (timesheet.notes || '').replace(/\n/g, ' ').replace(/,/g, ';') // Clean notes for CSV
    ]);

    const csv = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `timesheets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showAlert('success', `Exported ${timesheetsToExport.length} timesheets to CSV`);
  };

  // Calculate summary statistics - Phase 2 enhancement
  const calculateSummaryStats = (timesheetsToAnalyze) => {
    const stats = {
      totalHours: 0,
      totalOvertimeHours: 0,
      uniqueEmployees: new Set(),
      pendingApprovals: 0
    };

    timesheetsToAnalyze.forEach(timesheet => {
      // Calculate total hours
      const hours = calculateTotalHours(timesheet.clock_in, timesheet.clock_out, timesheet.break_minutes);
      stats.totalHours += hours;

      // Add overtime hours
      if (timesheet.overtime_hours) {
        stats.totalOvertimeHours += timesheet.overtime_hours;
      }

      // Track unique employees
      if (timesheet.employee_id) {
        stats.uniqueEmployees.add(timesheet.employee_id);
      }

      // Count pending approvals
      if (timesheet.status === 'submitted') {
        stats.pendingApprovals++;
      }
    });

    return {
      totalHours: stats.totalHours,
      totalOvertimeHours: stats.totalOvertimeHours,
      uniqueEmployees: stats.uniqueEmployees.size,
      pendingApprovals: stats.pendingApprovals
    };
  };

  // Load PTO requests - moved from Employees page
  const loadPTORequests = async () => {
    try {
      const response = await supaFetch(
        `employee_time_off?employee_id=eq.${user.id}&select=*&order=created_at.desc`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        setPtoRequests(data);
      }
    } catch (error) {
      console.error('Error loading PTO requests:', error);
    }
  };

  // Submit PTO request - moved from Employees page
  const handlePTOSubmit = async (ptoData) => {
    try {
      const response = await supaFetch(
        'employee_time_off',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employee_id: user.id,
            company_id: user.company_id,
            kind: ptoData.kind,
            starts_at: ptoData.startsAt || ptoData.starts_at,
            ends_at: ptoData.endsAt || ptoData.ends_at,
            note: ptoData.note,
            status: 'PENDING'
          })
        },
        user.company_id
      );

      if (response.ok) {
        showAlert('success', 'Time off request submitted successfully!');
        loadPTORequests(); // Reload PTO requests
      } else {
        throw new Error('Failed to submit PTO request');
      }
    } catch (error) {
      console.error('Error submitting PTO request:', error);
      showAlert('error', 'Failed to submit time off request');
    }
  };

  // Advanced notification system - Phase 2
  const getNotificationCounts = () => {
    const userTimesheets = timesheets.filter(t => t.employee_id === user.id);
    return {
      approved: userTimesheets.filter(t => t.status === 'approved' &&
        t.approved_at && new Date(t.approved_at) > new Date(Date.now() - 7*24*60*60*1000)).length,
      rejected: userTimesheets.filter(t => t.status === 'rejected' &&
        t.denied_at && new Date(t.denied_at) > new Date(Date.now() - 7*24*60*60*1000)).length,
      submitted: timesheets.filter(t => t.status === 'submitted').length
    };
  };

  const getStatusNotification = (timesheet) => {
    if (timesheet.employee_id !== user.id) return null;

    const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000);

    if (timesheet.status === 'approved' && timesheet.approved_at && new Date(timesheet.approved_at) > sevenDaysAgo) {
      return { type: 'approved', icon: '✅', message: 'Recently approved' };
    }

    if (timesheet.status === 'rejected' && timesheet.denied_at && new Date(timesheet.denied_at) > sevenDaysAgo) {
      return { type: 'rejected', icon: '❌', message: 'Recently rejected' };
    }

    return null;
  };

  const handleCreateTimesheet = async (formData, submitForApproval = false) => {
    try {
      // ✅ FIXED: employee_timesheets doesn't have company_id column
      // It filters by company through employees.company_id relationship
      // Also fixed column names to match actual schema
      const timesheetData = {
        employee_id: formData.employee_id || user.id, // Default to current user if not specified
        work_order_id: formData.job_id || null, // Schema uses work_order_id, not job_id
        date: formData.work_date, // Schema uses date, not work_date
        clock_in: `${formData.work_date}T${formData.clock_in}:00`,
        clock_out: `${formData.work_date}T${formData.clock_out}:00`,
        break_duration: formData.break_minutes || formData.lunch_override_minutes || 0, // Schema uses break_duration
        regular_hours: formData.regular_hours || 0,
        overtime_hours: formData.overtime_hours || 0,
        notes: formData.notes || '',
        user_id: user.id, // Add user_id for tracking who created it
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Only add status fields if we're implementing the approval workflow
      // This allows the feature to work even if the database hasn't been updated yet
      if (submitForApproval) {
        timesheetData.status = 'submitted';
      } else {
        timesheetData.status = 'draft';
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_timesheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(timesheetData)
      });

      if (response.ok) {
        showAlert('success', 'Timesheet created successfully');
        setShowCreateModal(false);
        loadTimesheets();
      } else {
        const errorData = await response.json();
        showAlert('error', `Failed to create timesheet: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating timesheet:', error);
      showAlert('error', 'Failed to create timesheet');
    }
  };

  const handleUpdateTimesheet = async (formData) => {
    try {
      const timesheetData = {
        job_id: formData.job_id || null,
        work_date: formData.work_date,
        clock_in: `${formData.work_date}T${formData.clock_in}:00`,
        clock_out: `${formData.work_date}T${formData.clock_out}:00`,
        lunch_taken: formData.lunch_taken,
        lunch_override_minutes: formData.lunch_override_minutes,
        regular_hours: formData.regular_hours,
        overtime_hours: formData.overtime_hours,
        total_paid_hours: formData.total_paid_hours,
        notes: formData.notes,
        updated_at: new Date().toISOString()
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_timesheets?id=eq.${selectedTimesheet.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(timesheetData)
      });

      if (response.ok) {
        showAlert('success', 'Timesheet updated successfully');
        setShowEditModal(false);
        setSelectedTimesheet(null);
        loadTimesheets();
      } else {
        const errorData = await response.json();
        showAlert('error', `Failed to update timesheet: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating timesheet:', error);
      showAlert('error', 'Failed to update timesheet');
    }
  };

  const handleDeleteTimesheet = async (timesheet) => {
    if (!window.confirm('Are you sure you want to delete this timesheet?')) return;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_timesheets?id=eq.${timesheet.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        showAlert('success', 'Timesheet deleted successfully');
        loadTimesheets();
      } else {
        showAlert('error', 'Failed to delete timesheet');
      }
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      showAlert('error', 'Failed to delete timesheet');
    }
  };

  const openEditModal = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setShowEditModal(true);
  };

  const handleSubmitForApproval = async (timesheet) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_timesheets?id=eq.${timesheet.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        showAlert('success', 'Timesheet submitted for approval');
        loadTimesheets();
      } else {
        const errorData = await response.json();
        if (errorData.message && errorData.message.includes('column "status" does not exist')) {
          showAlert('warning', 'Approval workflow not yet configured. Please run the database migration first.');
        } else {
          showAlert('error', 'Failed to submit timesheet');
        }
      }
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      showAlert('error', 'Failed to submit timesheet');
    }
  };

  const handleApproveTimesheet = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_timesheets?id=eq.${selectedTimesheet.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
        setShowApprovalModal(false);
        setSelectedTimesheet(null);
        loadTimesheets();
      } else {
        showAlert('error', 'Failed to approve timesheet');
      }
    } catch (error) {
      console.error('Error approving timesheet:', error);
      showAlert('error', 'Failed to approve timesheet');
    }
  };

  const handleRejectTimesheet = async () => {
    if (!denialReason.trim()) {
      showAlert('error', 'Please provide a reason for rejection');
      return;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_timesheets?id=eq.${selectedTimesheet.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status: 'rejected',
          denied_by: user.id,
          denied_at: new Date().toISOString(),
          denial_reason: denialReason,
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        showAlert('success', 'Timesheet rejected');
        setShowApprovalModal(false);
        setSelectedTimesheet(null);
        setDenialReason('');
        loadTimesheets();
      } else {
        showAlert('error', 'Failed to reject timesheet');
      }
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      showAlert('error', 'Failed to reject timesheet');
    }
  };

  const openApprovalModal = (timesheet, action) => {
    setSelectedTimesheet(timesheet);
    setApprovalAction(action);
    setDenialReason('');
    setShowApprovalModal(true);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (hours) => {
    if (!hours) return '0h 0m';
    // ✅ FIX: Convert to total minutes first to avoid "60m" bug
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: PencilIcon, label: 'Draft' },
      submitted: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Rejected' }
    };

    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  // Filter timesheets based on active tab and filters
  const getFilteredTimesheets = () => {
    let filtered = timesheets.filter(timesheet => {
      const matchesSearch = !searchTerm ||
        timesheet.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEmployee = employeeFilter === 'all' || timesheet.employee_id === employeeFilter;
      const matchesJob = jobFilter === 'all' || timesheet.work_order_id === jobFilter; // ✅ FIX: Use work_order_id not job_id
      const matchesStatus = statusFilter === 'all' || timesheet.status === statusFilter;
      const matchesOvertime = !overtimeFilter || (timesheet.overtime_hours && timesheet.overtime_hours > 0); // ✅ NEW: Overtime filter

      const matchesDateRange = (!dateRangeFilter.start || timesheet.work_date >= dateRangeFilter.start) &&
                              (!dateRangeFilter.end || timesheet.work_date <= dateRangeFilter.end);

      return matchesSearch && matchesEmployee && matchesJob && matchesStatus && matchesOvertime && matchesDateRange;
    });

    // Filter by tab
    if (activeTab === 'approvals' && (user?.role === 'owner' || user?.role === 'admin')) {
      filtered = filtered.filter(timesheet => timesheet.status === 'submitted');
    }

    return filtered;
  };

  const filteredTimesheets = getFilteredTimesheets();

  // Calculate summary statistics
  const totalHours = filteredTimesheets.reduce((sum, timesheet) => {
    return sum + calculateTotalHours(timesheet.clock_in, timesheet.clock_out, timesheet.break_minutes);
  }, 0);

  const totalOvertimeHours = filteredTimesheets.reduce((sum, timesheet) => {
    return sum + (timesheet.overtime_hours || 0);
  }, 0);

  // ✅ FIX: Only count employees that actually exist (have employee data loaded)
  const uniqueEmployees = new Set(
    filteredTimesheets
      .filter(t => t.employees && t.employees.id)  // Only count if employee exists
      .map(t => t.employee_id)
  ).size;

  const stats = calculateSummaryStats(filteredTimesheets);

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title={user?.role === 'employee' ? 'My Timesheets' : 'Team Timesheets'}
        subtitle={user?.role === 'employee' ? 'Track your work hours and manage time off' : 'Manage team time tracking and approvals'}
        icon={ClockIcon}
        gradient="green"
        stats={[
          { label: 'Total Hours', value: totalHours.toFixed(1) },
          { label: 'Employees', value: uniqueEmployees },
          { label: 'Pending', value: stats.pendingApprovals }
        ]}
        actions={[
          {
            label: 'Request PTO',
            icon: CalendarDaysIcon,
            onClick: () => setShowPTOModal(true)
          },
          {
            label: 'Log Time',
            icon: PlusIcon,
            onClick: () => setShowCreateModal(true)
          }
        ]}
      />

      {/* Time Tracking Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernStatCard
          title="Hours This Week"
          value={`${totalHours.toFixed(1)}h`}
          icon={ClockIcon}
          gradient="blue"
          onClick={() => setActiveTab('timesheets')}

        />

        <ModernStatCard
          title="Overtime Hours"
          value={`${totalOvertimeHours.toFixed(1)}h`}
          icon={ArrowTrendingUpIcon}
          gradient="orange"
          onClick={() => {
            // ✅ FIX: Toggle overtime filter to show only timesheets with overtime
            setOvertimeFilter(!overtimeFilter);
            if (!overtimeFilter) {
              // When enabling overtime filter, clear other filters for clarity
              setSearchTerm('');
              setEmployeeFilter('all');
              setJobFilter('all');
              setStatusFilter('all');
            }
          }}
        />

        <ModernStatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={DocumentCheckIcon}
          gradient="purple"
          onClick={() => setStatusFilter('pending')}
          trend={[8, 6, 4, 7, 5, 3, stats.pendingApprovals]}
        />

        <ModernStatCard
          title="Active Team"
          value={uniqueEmployees}
          icon={UserGroupIcon}
          gradient="green"
          onClick={() => navigate('/employees')}
          trend={[12, 15, 18, 22, 25, 28, uniqueEmployees]}
        />
      </div>

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
              onClick={() => setActiveTab('timesheets')}
              className={`${
                activeTab === 'timesheets'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <ClockIcon className="w-4 h-4" />
              {user?.role === 'employee' ? 'My Timesheets' : 'All Timesheets'}
            </button>

            {/* Personal PTO Tab - For all users */}
            <button
              onClick={() => setActiveTab('pto')}
              className={`${
                activeTab === 'pto'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <CalendarDaysIcon className="w-4 h-4" />
              My Time Off
              {ptoRequests.filter(p => p.status === 'PENDING').length > 0 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                  {ptoRequests.filter(p => p.status === 'PENDING').length}
                </span>
              )}
            </button>

            {/* Admin-only tabs */}
            {(showAdminTabs && (user?.role === 'owner' || user?.role === 'admin')) && (
              <>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className={`${
                    activeTab === 'approvals'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <DocumentCheckIcon className="w-4 h-4" />
                  Pending Approvals
                  {getNotificationCounts().submitted > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      {getNotificationCounts().submitted}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`${
                    activeTab === 'history'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <ClockIcon className="w-4 h-4" />
                  Timesheet History
                </button>

                <button
                  onClick={() => setActiveTab('accruals')}
                  className={`${
                    activeTab === 'accruals'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  PTO Accruals (Payroll)
                </button>
              </>
            )}
          </nav>
              {/* Notification Summary for Employees */}
              {user?.role === 'employee' && (getNotificationCounts().approved > 0 || getNotificationCounts().rejected > 0) && (
                <div className="ml-4 flex items-center gap-2">
                  {getNotificationCounts().approved > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ {getNotificationCounts().approved} approved
                    </span>
                  )}
                  {getNotificationCounts().rejected > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ❌ {getNotificationCounts().rejected} rejected
                    </span>
                  )}
                </div>
              )}
        </div>
      </div>



      {/* Enhanced Summary Cards - Phase 2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Hours</p>
              <p className="text-3xl font-bold text-blue-900">{formatDuration(totalHours)}</p>
              <p className="text-xs text-blue-600 mt-1">
                {filteredTimesheets.length} timesheet{filteredTimesheets.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 mb-1">Overtime Hours</p>
              <p className="text-3xl font-bold text-amber-900">{formatDuration(totalOvertimeHours)}</p>
              <p className="text-xs text-amber-600 mt-1">
                {totalOvertimeHours > 0 ? `${((totalOvertimeHours / totalHours) * 100).toFixed(1)}% of total` : 'No overtime'}
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">
                {user?.role === 'employee' ? 'My Timesheets' : 'Active Employees'}
              </p>
              <p className="text-3xl font-bold text-green-900">
                {user?.role === 'employee' ? filteredTimesheets.length : uniqueEmployees}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {user?.role === 'employee' ? 'This period' : 'Team members'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <UserIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Pending Approvals</p>
              <p className="text-3xl font-bold text-purple-900">
                {timesheets.filter(t => t.status === 'submitted').length}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {timesheets.filter(t => t.status === 'submitted').length === 0 ? 'All caught up!' : 'Need review'}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DocumentCheckIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Hours</p>
              <p className="text-2xl font-semibold text-gray-900">{formatDuration(totalHours)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overtime Hours</p>
              <p className="text-2xl font-semibold text-gray-900">{formatDuration(totalOvertimeHours)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {user?.role === 'employee' ? 'My Timesheets' : 'Active Employees'}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {user?.role === 'employee' ? filteredTimesheets.length : uniqueEmployees}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Date Filters - Competitor Advantage! */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
          {[
            { label: 'Today', value: 'today' },
            { label: 'Yesterday', value: 'yesterday' },
            { label: 'This Week', value: 'thisWeek' },
            { label: 'Last Week', value: 'lastWeek' },
            { label: 'This Month', value: 'thisMonth' },
            { label: 'All Time', value: 'all' }
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => applyQuickDateFilter(filter.value)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                quickDateFilter === filter.value
                  ? 'bg-primary-100 text-primary-700 border-primary-300'
                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>


	      {/* Smart Export - exports exactly the filtered/sorted set */}
	      <div className="flex justify-end mb-4">
	        <button
	          onClick={() => exportTimesheets(filteredTimesheets)}
	          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
	        >
	          Export CSV (what you see)
	        </button>
	      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search timesheets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Employee Filter - Only show for admins/owners */}
          {user?.role !== 'employee' && (
            <div>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
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
          )}

          {/* Job Filter */}
          <div>
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.job_title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRangeFilter.start}
              onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, start: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Start date"
            />
            <input
              type="date"
              value={dateRangeFilter.end}
              onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, end: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="End date"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {filteredTimesheets.length} timesheet{filteredTimesheets.length !== 1 ? 's' : ''} found
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setEmployeeFilter('all');
              setJobFilter('all');
              setStatusFilter('all');
              setOvertimeFilter(false); // ✅ FIX: Also clear overtime filter
              setDateRangeFilter({ start: '', end: '' });
              setQuickDateFilter('all');
            }}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar - Competitor Killer Feature! */}
      {(user?.role === 'owner' || user?.role === 'admin') && selectedIds.size > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-primary-700">
              {selectedIds.size} timesheet{selectedIds.size > 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={bulkApprove}
                className="btn-secondary bg-green-600 text-white hover:bg-green-700"
              >
                Bulk Approve
              </button>
              <button
                onClick={bulkReject}
                className="btn-secondary bg-red-600 text-white hover:bg-red-700"
              >
                Bulk Reject
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="btn-secondary"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Export & Summary - What competitors lack! */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          {getFilteredTimesheets().length} timesheet{getFilteredTimesheets().length !== 1 ? 's' : ''} found
          {selectedIds.size > 0 && (
            <span className="ml-2 text-primary-600">({selectedIds.size} selected)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Enhanced Export Options - Phase 2 */}
          <div className="relative inline-block text-left">
            <select
              onChange={(e) => {
                const [format, type] = e.target.value.split('-');
                const data = type === 'selected'
                  ? getFilteredTimesheets().filter(t => selectedIds.has(t.id))
                  : getFilteredTimesheets();

                if (format === 'csv') {
                  exportTimesheetsCSV(data);
                } else if (format === 'json') {
                  exportTimesheetsJSON(data);
                }
                e.target.value = ''; // Reset selection
              }}
              className="btn-secondary flex items-center gap-2 pr-8"
              defaultValue=""
            >
              <option value="" disabled>Export Options</option>
              <option value="csv-all">📊 Export CSV (All Filtered)</option>
              <option value="json-all">📋 Export JSON (All Filtered)</option>
              {selectedIds.size > 0 && (
                <>
                  <option value="csv-selected">📊 Export CSV (Selected)</option>
                  <option value="json-selected">📋 Export JSON (Selected)</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Timesheets Table - Hide when PTO tab is active */}
      {activeTab !== 'pto' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === getFilteredTimesheets().length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                {user?.role !== 'employee' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job
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
                  Paid Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lunch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={user?.role !== 'employee' ? "12" : "11"} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                      <p className="text-gray-500 text-sm">Loading timesheets...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTimesheets.length === 0 ? (
                <tr>
                  <td colSpan={user?.role !== 'employee' ? "12" : "11"} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 rounded-full p-4 mb-4">
                        <ClockIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {activeTab === 'approvals' ? 'No Pending Approvals' : 'No Timesheets Found'}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        {activeTab === 'approvals'
                          ? 'All timesheets have been reviewed.'
                          : 'Try adjusting your filters or create a new timesheet.'
                        }
                      </p>
                      {activeTab !== 'approvals' && (
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="btn-primary flex items-center gap-2"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Create Timesheet
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTimesheets.map((timesheet) => {
                  const totalHours = calculateTotalHours(timesheet.clock_in, timesheet.clock_out, timesheet.break_minutes);

                  return (
                    <tr key={timesheet.id} className={`hover:bg-gray-50 ${selectedIds.has(timesheet.id) ? 'bg-primary-50 border-primary-200' : ''}`}>
                      <td className="px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(timesheet.id)}
                          onChange={() => toggleRow(timesheet.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      {user?.role !== 'employee' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                timesheet.employee_id === user.id
                                  ? 'bg-primary-100'
                                  : 'bg-gray-100'
                              }`}>
                                <span className={`text-sm font-medium ${
                                  timesheet.employee_id === user.id
                                    ? 'text-primary-700'
                                    : 'text-gray-700'
                                }`}>
                                  {timesheet.employees?.full_name?.charAt(0) || 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {timesheet.employees?.full_name || 'Unknown Employee'}
                                </span>
                                {timesheet.employee_id === user.id && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BriefcaseIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {timesheet.job_title || 'No Job'}
                            </div>
                            {timesheet.work_orders?.customer_id && (
                              <div className="text-sm text-gray-500">
                                Customer ID: {timesheet.jobs.customer_id}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarDaysIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(timesheet.work_date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(timesheet.work_date).toLocaleDateString([], { weekday: 'short' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 text-green-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatTime(timesheet.clock_in)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 text-red-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatTime(timesheet.clock_out)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {timesheet.total_paid_hours ? `${timesheet.total_paid_hours.toFixed(1)}h` : formatDuration(totalHours)}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {timesheet.regular_hours && timesheet.overtime_hours ?
                              `${timesheet.regular_hours.toFixed(1)}h reg + ${timesheet.overtime_hours.toFixed(1)}h OT` :
                              'Total hours'
                            }
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timesheet.lunch_taken === false ?
                          <span className="text-red-600">No lunch</span> :
                          <span className="text-gray-600">
                            {timesheet.lunch_override_minutes || '30'}m lunch
                          </span>
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timesheet.overtime_hours && timesheet.overtime_hours > 0 ?
                          <span className="text-amber-600 font-medium">{timesheet.overtime_hours.toFixed(1)}h</span> :
                          '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(timesheet.status || 'draft')}
                          {getStatusNotification(timesheet) && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              getStatusNotification(timesheet).type === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`} title={getStatusNotification(timesheet).message}>
                              {getStatusNotification(timesheet).icon}
                            </span>
                          )}
                        </div>
                        {timesheet.status === 'approved' && timesheet.approved_by_user && (
                          <div className="text-xs text-gray-500 mt-1">
                            by {timesheet.approved_by_user.full_name}
                          </div>
                        )}
                        {timesheet.status === 'rejected' && timesheet.denied_by_user && (
                          <div className="text-xs text-gray-500 mt-1">
                            by {timesheet.denied_by_user.full_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {timesheet.notes || '-'}
                        {timesheet.status === 'rejected' && timesheet.denial_reason && (
                          <div className="text-xs text-red-600 mt-1">
                            Reason: {timesheet.denial_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {/* Employee actions - only for their own timesheets */}
                          {user.role === 'employee' && timesheet.employee_id === user.id && (
                            <>
                              {(timesheet.status === 'draft' || timesheet.status === 'rejected') && (
                                <>
                                  <button
                                    onClick={() => openEditModal(timesheet)}
                                    className="text-primary-600 hover:text-primary-900 p-1 rounded"
                                    title="Edit timesheet"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleSubmitForApproval(timesheet)}
                                    className="text-green-600 hover:text-green-900 p-1 rounded"
                                    title="Submit for approval"
                                  >
                                    <DocumentCheckIcon className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {timesheet.status === 'draft' && (
                                <button
                                  onClick={() => handleDeleteTimesheet(timesheet)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Delete timesheet"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}

                          {/* Admin/Owner actions - can manage all timesheets */}
                          {(user?.role === 'owner' || user?.role === 'admin') && (
                            <>
                              {/* Approval actions for submitted timesheets */}
                              {timesheet.status === 'submitted' && (
                                <>
                                  <button
                                    onClick={() => openApprovalModal(timesheet, 'approve')}
                                    className="text-green-600 hover:text-green-900 p-1 rounded"
                                    title="Approve timesheet"
                                  >
                                    <CheckCircleIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openApprovalModal(timesheet, 'reject')}
                                    className="text-red-600 hover:text-red-900 p-1 rounded"
                                    title="Reject timesheet"
                                  >
                                    <XCircleIcon className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {/* Edit action for any timesheet that's not approved (admins can fix issues) */}
                              {timesheet.status !== 'approved' && (
                                <button
                                  onClick={() => openEditModal(timesheet)}
                                  className="text-primary-600 hover:text-primary-900 p-1 rounded"
                                  title="Edit timesheet"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                              )}

                              {/* Delete action for draft timesheets */}
                              {timesheet.status === 'draft' && (
                                <button
                                  onClick={() => handleDeleteTimesheet(timesheet)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Delete timesheet"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}

                              {/* Special admin override for approved timesheets */}
                              {timesheet.status === 'approved' && (
                                <button
                                  onClick={() => openEditModal(timesheet)}
                                  className="text-orange-600 hover:text-orange-900 p-1 rounded"
                                  title="Admin override - Edit approved timesheet"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                              )}
                            </>
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
      )}

      {/* My PTO Table - Show when PTO tab is active */}
      {activeTab === 'pto' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">My Time Off Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ptoRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 rounded-full p-4 mb-4">
                          <CalendarDaysIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Off Requests</h3>
                        <p className="text-gray-500 text-sm mb-4">
                          You haven't submitted any time off requests yet.
                        </p>
                        <button
                          onClick={() => setShowPTOModal(true)}
                          className="btn-primary flex items-center gap-2"
                        >
                          <CalendarDaysIcon className="w-4 h-4" />
                          Request Time Off
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ptoRequests.map((pto) => {
                    const startDate = new Date(pto.starts_at);
                    const endDate = new Date(pto.ends_at);
                    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

                    return (
                      <tr key={pto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">
                              {pto.kind === 'VACATION' ? '🏖️' :
                               pto.kind === 'SICK' ? '🤒' :
                               pto.kind === 'PERSONAL' ? '👤' :
                               pto.kind === 'BEREAVEMENT' ? '🕊️' :
                               pto.kind === 'JURY_DUTY' ? '⚖️' : '📝'}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {pto.kind.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {startDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {endDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {daysDiff} day{daysDiff !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            pto.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            pto.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pto.status === 'APPROVED' ? '✅ Approved' :
                             pto.status === 'REJECTED' ? '❌ Rejected' :
                             '⏳ Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {pto.note || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(pto.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timesheet History Tab - Admin Only */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Timesheet History & Reports
            </h3>
            <button
              onClick={() => {
                const csvData = [
                  ['Employee', 'Job', 'Date', 'Hours', 'Status', 'Submitted'].join(','),
                  ...filteredTimesheets.map(ts => [
                    ts.full_name || 'Unknown Employee',
                    ts.job_title || 'No Job',
                    new Date(ts.work_date).toLocaleDateString(),
                    ts.total_hours || 0,
                    ts.status,
                    new Date(ts.created_at).toLocaleDateString()
                  ].join(','))
                ].join('\n');

                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `timesheet-history-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export History
            </button>
          </div>

          {/* Enhanced Filters for History */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="submitted">Submitted</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                min="2020"
                max={new Date().getFullYear() + 1}
                value={new Date(dateRangeFilter.start || new Date()).getFullYear()}
                onChange={(e) => {
                  const year = parseInt(e.target.value) || new Date().getFullYear();
                  setDateRangeFilter({
                    start: `${year}-01-01`,
                    end: `${year}-12-31`
                  });
                }}
                placeholder={new Date().getFullYear().toString()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quick Filters</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDateRangeFilter({
                      start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                      end: new Date().toISOString().split('T')[0]
                    });
                    setQuickDateFilter('thisYear');
                  }}
                  className="btn-sm btn-secondary text-xs"
                >
                  This Year
                </button>
                <button
                  onClick={() => {
                    setDateRangeFilter({
                      start: new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0],
                      end: new Date(new Date().getFullYear() - 1, 11, 31).toISOString().split('T')[0]
                    });
                    setQuickDateFilter('lastYear');
                  }}
                  className="btn-sm btn-secondary text-xs"
                >
                  Last Year
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredTimesheets.length}
              </div>
              <div className="text-sm text-blue-600">Total Timesheets</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredTimesheets.filter(ts => ts.status === 'approved').length}
              </div>
              <div className="text-sm text-green-600">Approved</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredTimesheets.filter(ts => ts.status === 'submitted').length}
              </div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {filteredTimesheets.filter(ts => ts.status === 'rejected').length}
              </div>
              <div className="text-sm text-red-600">Rejected</div>
            </div>
          </div>

          {/* Historical Data Table */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredTimesheets.length} timesheets
            {dateRangeFilter.start && dateRangeFilter.end && (
              <span> from {new Date(dateRangeFilter.start).toLocaleDateString()} to {new Date(dateRangeFilter.end).toLocaleDateString()}</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTimesheets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No timesheets found for the selected criteria
                    </td>
                  </tr>
                ) : (
                  filteredTimesheets.map((timesheet) => (
                    <tr key={timesheet.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {timesheet.full_name || 'Unknown Employee'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timesheet.job_title || 'No Job'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(timesheet.work_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timesheet.total_hours || 0}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          timesheet.status === 'approved' ? 'bg-green-100 text-green-800' :
                          timesheet.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          timesheet.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {timesheet.status?.charAt(0).toUpperCase() + timesheet.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(timesheet.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PTO Accruals Tab - Admin Only */}
      {activeTab === 'accruals' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5" />
              PTO Accrual Management
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    // Calculate current pay period
                    const today = new Date();
                    const payStart = new Date(today);
                    payStart.setDate(today.getDate() - today.getDay()); // Start of week
                    const payEnd = new Date(payStart);
                    payEnd.setDate(payStart.getDate() + 13); // Biweekly

                    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/process_pto_accruals`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                      },
                      body: JSON.stringify({
                        p_company_id: user.company_id,
                        p_pay_period_start: payStart.toISOString().split('T')[0],
                        p_pay_period_end: payEnd.toISOString().split('T')[0]
                      })
                    });

                    if (response.ok) {
                      showAlert('success', 'PTO accruals processed successfully!');
                    } else {
                      showAlert('error', 'Error processing PTO accruals');
                    }
                  } catch (error) {
                    console.error('Error running accrual process:', error);
                    showAlert('error', 'Error running accrual process');
                  }
                }}
                className="btn-primary flex items-center gap-2"
              >
                <ClockIcon className="w-4 h-4" />
                Process Accruals
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <DocumentArrowDownIcon className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Real Summary Cards - No Fake Data */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {employees.length}
              </div>
              <div className="text-sm text-blue-600">Active Employees</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                -
              </div>
              <div className="text-sm text-gray-600">Run database setup first</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                -
              </div>
              <div className="text-sm text-gray-600">No accrual runs yet</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                -
              </div>
              <div className="text-sm text-gray-600">Setup required</div>
            </div>
          </div>

          {/* Employee PTO Management Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-900">Employee PTO Management</h4>
              <button
                onClick={() => setShowPTOAdjustmentModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add/Adjust PTO
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vacation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sick Leave
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No employees found. Add employees first.
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="text-green-600 font-medium">- hrs</div>
                          <div className="text-xs text-gray-500">Run setup first</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="text-blue-600 font-medium">- hrs</div>
                          <div className="text-xs text-gray-500">Run setup first</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="text-purple-600 font-medium">- hrs</div>
                          <div className="text-xs text-gray-500">Run setup first</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowPTOAdjustmentModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900 font-medium"
                          >
                            Manage PTO
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Enterprise PTO System Setup</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900 mb-2">Database Setup Required</h5>
                  <p className="text-blue-800 mb-4">
                    To use the enterprise PTO system, you need to run the database setup scripts first.
                  </p>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div>1. Go to Supabase Dashboard → SQL Editor</div>
                    <div>2. Run: <code className="bg-blue-100 px-2 py-1 rounded">database/apply_pto_optimization.sql</code></div>
                    <div>3. Run: <code className="bg-blue-100 px-2 py-1 rounded">database/setup_enterprise_pto.sql</code></div>
                    <div>4. Refresh this page to see employee PTO balances</div>
                  </div>
                  <div className="mt-4">
                    <button className="btn-secondary text-sm">
                      View Setup Instructions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Accrual Activity */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Recent Accrual Activity</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center text-gray-500">
                <ClockIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No recent accrual activity</p>
                <p className="text-sm">Click "Process Accruals" to run the next accrual cycle</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Timesheet Modal */}
      <TimesheetFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTimesheet}
        employees={employees}
        jobs={jobs}
      />

      {/* Edit Timesheet Modal */}
      <TimesheetFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTimesheet(null);
        }}
        onSubmit={handleUpdateTimesheet}
        timesheet={selectedTimesheet}
        employees={employees}
        jobs={jobs}
      />

      {/* Approval Modal */}
      {showApprovalModal && selectedTimesheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                {approvalAction === 'approve' ? (
                  <>
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    Approve Timesheet
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-6 h-6 text-red-600" />
                    Reject Timesheet
                  </>
                )}
              </h2>
              <button
                onClick={() => setShowApprovalModal(false)}
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
                  <div>Hours: {formatDuration(calculateTotalHours(selectedTimesheet.clock_in, selectedTimesheet.clock_out, selectedTimesheet.break_minutes))}</div>
                  {selectedTimesheet.job_title && (
                    <div>Job: {selectedTimesheet.job_title}</div>
                  )}
                </div>
              </div>

              {/* Rejection Reason */}
              {approvalAction === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    rows={3}
                    value={denialReason}
                    onChange={(e) => setDenialReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Please provide a reason for rejecting this timesheet..."
                    required
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={approvalAction === 'approve' ? handleApproveTimesheet : handleRejectTimesheet}
                  className={`btn-primary flex items-center gap-2 ${
                    approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approvalAction === 'approve' ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      Approve
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-4 h-4" />
                      Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PTO Request Modal - Now in the right place! */}
      <PTORequestModal
        isOpen={showPTOModal}
        onClose={() => setShowPTOModal(false)}
        onSubmit={handlePTOSubmit}
        user={user}
      />

      {/* PTO Adjustment Modal */}
      {showPTOAdjustmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedEmployee ? `Manage PTO - ${selectedEmployee.full_name}` : 'Add PTO Hours'}
              </h3>
              <button
                onClick={() => {
                  setShowPTOAdjustmentModal(false);
                  setSelectedEmployee(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              try {
                // Add PTO adjustment as time off record
                const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_time_off`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal'
                  },
                  body: JSON.stringify({
                    employee_id: selectedEmployee?.id || formData.get('employee_id'),
                    kind: formData.get('pto_kind'),
                    company_id: user.company_id,
                    starts_at: formData.get('effective_date') + 'T09:00:00Z',
                    ends_at: formData.get('effective_date') + 'T17:00:00Z',
                    hours_requested: parseFloat(formData.get('hours')),
                    note: formData.get('notes') || `Admin adjustment: ${formData.get('adjustment_type')}`,
                    status: 'APPROVED', // Admin adjustments are pre-approved
                    created_by: user.id,
                    approved_by: user.id,
                    approved_at: new Date().toISOString()
                  })
                });

                if (response.ok) {
                  showAlert('success', 'PTO adjustment added successfully!');
                  setShowPTOAdjustmentModal(false);
                  setSelectedEmployee(null);
                } else {
                  showAlert('error', 'Failed to add PTO adjustment');
                }
              } catch (error) {
                console.error('Error adding PTO adjustment:', error);
                showAlert('error', 'Error adding PTO adjustment');
              }
            }}>
              <div className="space-y-4">
                {/* Employee Selection (if not pre-selected) */}
                {!selectedEmployee && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee
                    </label>
                    <select
                      name="employee_id"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* PTO Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PTO Type
                  </label>
                  <select
                    name="pto_kind"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select PTO Type</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal">Personal</option>
                    <option value="PTO">General PTO</option>
                  </select>
                </div>

                {/* Adjustment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Adjustment
                  </label>
                  <select
                    name="adjustment_type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Reason</option>
                    <option value="Manual Addition">Add PTO Hours</option>
                    <option value="Correction">Correct Previous Entry</option>
                    <option value="Year-End Carryover">Year-End Carryover</option>
                    <option value="Bonus/Reward">Bonus PTO Award</option>
                    <option value="Policy Change">Policy Adjustment</option>
                  </select>
                </div>

                {/* Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours
                  </label>
                  <input
                    type="number"
                    name="hours"
                    step="0.5"
                    min="0"
                    required
                    placeholder="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Effective Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    name="effective_date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows="2"
                    placeholder="Reason for adjustment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPTOAdjustmentModal(false);
                    setSelectedEmployee(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add PTO Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timesheets;
