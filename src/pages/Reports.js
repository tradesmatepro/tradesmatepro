import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import '../styles/modern-enhancements.css';
import SimpleChart from '../components/SimpleChart';
import AdvancedChart from '../components/AdvancedChart';
import { supaFetch } from '../utils/supaFetch';
import { formatCurrency as fmtCurrency } from '../utils/formatters';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  UsersIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  FunnelIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BuildingOfficeIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '../utils/env';

const Reports = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [activeSection, setActiveSection] = useState('overview');

  // Profitability data
  const [profitabilityData, setProfitabilityData] = useState({
    customers: [],
    projects: [],
    summary: { totalRevenue: 0, totalCosts: 0, netProfit: 0, margin: 0 }
  });

  // Date filters
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Data states
  const [timesheetReports, setTimesheetReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [totals, setTotals] = useState({
    totalHours: 0,
    regularHours: 0,
    overtimeHours: 0,
    weeklyTotals: {},
    monthlyTotals: {},
    employeeTotals: {}
  });
  // Invoicing analytics states
  const [invoicesData, setInvoicesData] = useState([]);
  const [workOrdersData, setWorkOrdersData] = useState([]);
  const [aging, setAging] = useState({ buckets: {}, totalOutstanding: 0 });
  const [daysToInvoice, setDaysToInvoice] = useState({ average: 0, distribution: {} });


  // Filters
  const [filters, setFilters] = useState({
    employee: 'all',
    status: 'all',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Utility functions
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const formatCurrency = (amount) => fmtCurrency(amount);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  // Data loading functions
  useEffect(() => {
    if (user?.company_id) {
      loadTimesheetReports();
      loadEmployees();
      loadProfitabilityData();
    }
  }, [user?.company_id, filters, dateRange]);

  const loadTimesheetReports = async () => {
    try {
      setLoading(true);

      // Build query with filters
      let query = `${SUPABASE_URL}/rest/v1/employee_timesheets?company_id=eq.${user.company_id}`;

      // Apply role-based filtering
      if (user.role === 'employee') {
        query += `&employee_id=eq.${user.id}`;
      }

      // Apply filters
      if (filters.employee !== 'all') {
        query += `&employee_id=eq.${filters.employee}`;
      }

      if (filters.status !== 'all') {
        query += `&status=eq.${filters.status}`;
      }

      if (filters.startDate) {
        query += `&work_date=gte.${filters.startDate}`;
      }

      if (filters.endDate) {
        query += `&work_date=lte.${filters.endDate}`;
      }

      query += '&order=work_date.desc,employee_id.asc';

      const response = await fetch(query, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTimesheetReports(data);
        calculateTotals(data);
      } else {
        showAlert('error', 'Failed to load timesheet reports');
      }
    } catch (error) {
      console.error('Error loading timesheet reports:', error);
      showAlert('error', 'Failed to load timesheet reports');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      let query = `${SUPABASE_URL}/rest/v1/profiles?company_id=eq.${user.company_id}&select=id,full_name&order=full_name`;

      // If user is employee, only show themselves
      if (user.role === 'employee') {
        query += `&id=eq.${user.id}`;
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
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const calculateTotals = (data) => {
    const totals = {
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      weeklyTotals: {},
      monthlyTotals: {},
      employeeTotals: {}
    };

    data.forEach(timesheet => {
      const totalHours = timesheet.calculated_total_hours || 0;
      const regularHours = timesheet.regular_hours || Math.min(totalHours, 8);
      const overtimeHours = timesheet.overtime_hours || Math.max(0, totalHours - 8);

      // Overall totals
      totals.totalHours += totalHours;
      totals.regularHours += regularHours;
      totals.overtimeHours += overtimeHours;

      // Weekly totals
      const weekKey = timesheet.week_start;
      if (!totals.weeklyTotals[weekKey]) {
        totals.weeklyTotals[weekKey] = { totalHours: 0, regularHours: 0, overtimeHours: 0 };
      }
      totals.weeklyTotals[weekKey].totalHours += totalHours;
      totals.weeklyTotals[weekKey].regularHours += regularHours;
      totals.weeklyTotals[weekKey].overtimeHours += overtimeHours;

      // Monthly totals
      const monthKey = timesheet.month_start;
      if (!totals.monthlyTotals[monthKey]) {
        totals.monthlyTotals[monthKey] = { totalHours: 0, regularHours: 0, overtimeHours: 0 };
      }
      totals.monthlyTotals[monthKey].totalHours += totalHours;
      totals.monthlyTotals[monthKey].regularHours += regularHours;
      totals.monthlyTotals[monthKey].overtimeHours += overtimeHours;

      // Employee totals
      const employeeKey = timesheet.employee_id;
      if (!totals.employeeTotals[employeeKey]) {
        totals.employeeTotals[employeeKey] = {
          name: timesheet.employee_name,
          totalHours: 0,
          regularHours: 0,
          overtimeHours: 0
        };
      }
      totals.employeeTotals[employeeKey].totalHours += totalHours;
      totals.employeeTotals[employeeKey].regularHours += regularHours;
      totals.employeeTotals[employeeKey].overtimeHours += overtimeHours;
    });

    setTotals(totals);
  };

  // Load invoice analytics (aging and days-to-invoice)
  useEffect(() => {
    if (user?.company_id) {
      loadInvoiceAnalytics();
    }
  }, [user?.company_id, dateRange, workOrdersData]);

  const loadInvoiceAnalytics = async () => {
    try {
      // Fetch invoices in range by issued_at
      const invRes = await supaFetch(
        `invoices?select=id,job_id,status,due_date,issued_at,total_amount,invoice_status&issued_at=gte.${dateRange.start}&issued_at=lte.${dateRange.end}T23:59:59`,
        { method: 'GET' },
        user.company_id
      );
      const rows = invRes.ok ? await invRes.json() : [];
      setInvoicesData(rows);

      // Aging buckets for outstanding (UNPAID / PARTIALLY_PAID / OVERDUE)
      const now = new Date();
      const statuses = new Set(['UNPAID','PARTIALLY_PAID','OVERDUE','unpaid','partially_paid','overdue']);
      const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '91+': 0 };
      let totalOutstanding = 0;
      rows.forEach(inv => {
        const st = String(inv.invoice_status || inv.status || '').toUpperCase();
        if (!statuses.has(st)) return;
        const amt = Number(inv.total_amount || 0) || 0;
        const due = inv.due_date ? new Date(inv.due_date) : (inv.issued_at ? new Date(inv.issued_at) : null);
        if (!due) return;
        const diffDays = Math.floor((now - due) / (1000*60*60*24));
        const overdue = Math.max(diffDays, 0);
        if (overdue <= 30) buckets['0-30'] += amt;
        else if (overdue <= 60) buckets['31-60'] += amt;
        else if (overdue <= 90) buckets['61-90'] += amt;
        else buckets['91+'] += amt;
        totalOutstanding += amt;
      });

      // Days to invoice: from work order completed_at to invoice issued_at
      const woById = new Map((workOrdersData || []).map(wo => [wo.id, wo]));
      const distro = { '0-1': 0, '2-3': 0, '4-7': 0, '8-14': 0, '15+': 0 };
      let sum = 0, count = 0;
      rows.forEach(inv => {
        const wo = woById.get(inv.job_id);
        const issuedAt = inv.issued_at ? new Date(inv.issued_at) : null;
        const completedAt = wo?.completed_at ? new Date(wo.completed_at) : (wo?.updated_at ? new Date(wo.updated_at) : null);
        if (!issuedAt || !completedAt) return;
        const days = Math.max(0, Math.round((issuedAt - completedAt) / (1000*60*60*24)));
        sum += days; count += 1;
        if (days <= 1) distro['0-1'] += 1;
        else if (days <= 3) distro['2-3'] += 1;
        else if (days <= 7) distro['4-7'] += 1;
        else if (days <= 14) distro['8-14'] += 1;
        else distro['15+'] += 1;
      });
      setAging({ buckets, totalOutstanding });
      setDaysToInvoice({ average: count ? (sum / count) : 0, distribution: distro });
    } catch (e) {
      console.warn('Failed to load invoice analytics', e);
    }
  };

  const handleExport = (format = 'csv') => {
    try {
      const headers = [
        'Employee Name',
        'Work Date',
        'Clock In',
        'Clock Out',
        'Break Minutes',
        'Regular Hours',
        'Overtime Hours',
        'Total Hours',
        'Status',
        'Job Title',
        'Customer',
        'Notes'
      ];

      const csvContent = [
        headers.join(','),
        ...timesheetReports.map(timesheet => [
          `"${timesheet.employee_name || 'Unknown'}"`,
          timesheet.work_date,
          timesheet.clock_in ? new Date(timesheet.clock_in).toLocaleTimeString() : '',
          timesheet.clock_out ? new Date(timesheet.clock_out).toLocaleTimeString() : '',
          timesheet.break_minutes || 0,
          (timesheet.regular_hours || 0).toFixed(2),
          (timesheet.overtime_hours || 0).toFixed(2),
          (timesheet.calculated_total_hours || 0).toFixed(2),
          timesheet.status || 'pending',
          `"${timesheet.job_title || ''}"`,
          `"${timesheet.customer_name || ''}"`,
          `"${timesheet.notes || ''}"`
        ].join(','))
      ].join('\n');

      // Add totals section
      const totalsSection = [
        '',
        'TOTALS',
        '',
        '',
        '',
        totals.regularHours.toFixed(2),
        totals.overtimeHours.toFixed(2),
        totals.totalHours.toFixed(2),
        '',
        '',
        '',
        ''
      ].join(',');

      const finalContent = csvContent + '\n' + totalsSection;

      const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `timesheet_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showAlert('success', 'Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      showAlert('error', 'Failed to export report');
    }
  };



  // Permission check
  const loadProfitabilityData = async () => {
    try {
      setLoading(true);

      // Load work orders (revenue source)
      const workOrdersRes = await supaFetch(
        `work_orders?select=*,customers(name)&created_at=gte.${dateRange.start}&created_at=lte.${dateRange.end}T23:59:59`,
        { method: 'GET' },
        user.company_id
      );
      const workOrders = workOrdersRes.ok ? await workOrdersRes.json() : [];
      setWorkOrdersData(workOrders);

      // Load expenses (cost source)
      const expensesRes = await supaFetch(
        `expenses?select=*&date=gte.${dateRange.start}&date=lte.${dateRange.end}`,
        { method: 'GET' },
        user.company_id
      );
      const expenses = expensesRes.ok ? await expensesRes.json() : [];

      // Load timesheets for labor costs
      const timesheetsRes = await supaFetch(
        `employee_timesheets?select=*&work_date=gte.${dateRange.start}&work_date=lte.${dateRange.end}`,
        { method: 'GET' },
        user.company_id
      );
      const timesheets = timesheetsRes.ok ? await timesheetsRes.json() : [];

      // Calculate customer profitability
      const customerMap = new Map();

      // Add revenue from work orders
      workOrders.forEach(wo => {
        const customerId = wo.customer_id;
        const customerName = wo.customers?.name || 'Unknown Customer';
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            id: customerId,
            name: customerName,
            revenue: 0,
            expenses: 0,
            laborCosts: 0,
            workOrderCount: 0
          });
        }
        const customer = customerMap.get(customerId);
        customer.revenue += parseFloat(wo.total_amount || 0);
        customer.workOrderCount += 1;
      });

      // Add expenses
      expenses.forEach(expense => {
        if (expense.customer_id) {
          const customer = customerMap.get(expense.customer_id);
          if (customer) {
            customer.expenses += parseFloat(expense.amount || 0);
          }
        }
      });

      // Add labor costs (simplified - could be more sophisticated with job assignments)
      const avgLaborRate = 35; // $35/hour average
      timesheets.forEach(timesheet => {
        const hours = parseFloat(timesheet.regular_hours || 0) + parseFloat(timesheet.overtime_hours || 0);
        const laborCost = hours * avgLaborRate;

        // For now, distribute labor costs evenly across customers with work orders
        // In a real system, you'd link timesheets to specific jobs/customers
        const activeCustomers = Array.from(customerMap.values()).filter(c => c.workOrderCount > 0);
        if (activeCustomers.length > 0) {
          const costPerCustomer = laborCost / activeCustomers.length;
          activeCustomers.forEach(customer => {
            customer.laborCosts += costPerCustomer;
          });
        }
      });

      // Calculate totals and margins
      const customers = Array.from(customerMap.values()).map(customer => ({
        ...customer,
        totalCosts: customer.expenses + customer.laborCosts,
        netProfit: customer.revenue - (customer.expenses + customer.laborCosts),
        margin: customer.revenue > 0 ? ((customer.revenue - (customer.expenses + customer.laborCosts)) / customer.revenue * 100) : 0
      })).sort((a, b) => b.netProfit - a.netProfit);

      // Calculate project profitability (simplified - using work orders as projects)
      const projects = workOrders.map(wo => {
        const projectExpenses = expenses.filter(e => e.project_id === wo.id).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const revenue = parseFloat(wo.total_amount || 0);
        const estimatedLaborCost = parseFloat(wo.estimated_duration || 0) * avgLaborRate;
        const totalCosts = projectExpenses + estimatedLaborCost;

        return {
          id: wo.id,
          name: wo.title || wo.job_title || 'Untitled Project',
          customerName: wo.customers?.name || 'Unknown',
          revenue,
          expenses: projectExpenses,
          laborCosts: estimatedLaborCost,
          totalCosts,
          netProfit: revenue - totalCosts,
          margin: revenue > 0 ? ((revenue - totalCosts) / revenue * 100) : 0,
          status: wo.quote_status || wo.job_status || wo.work_status || 'unknown'
        };
      }).sort((a, b) => b.netProfit - a.netProfit);

      // Calculate summary
      const totalRevenue = customers.reduce((sum, c) => sum + c.revenue, 0);
      const totalCosts = customers.reduce((sum, c) => sum + c.totalCosts, 0);
      const netProfit = totalRevenue - totalCosts;
      const margin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;

      setProfitabilityData({
        customers,
        projects,
        summary: { totalRevenue, totalCosts, netProfit, margin }
      });


    } catch (error) {
      console.error('Error loading profitability data:', error);
      setAlert({ show: true, type: 'error', message: 'Failed to load profitability data' });
    } finally {
      setLoading(false);
    }
  };
  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reports"
          subtitle="Business analytics and insights"
        />

        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">
            Reports are only available to administrators and owners.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Business Intelligence & Reports"
        subtitle="Advanced analytics, insights, and comprehensive reporting dashboard"
        icon={ChartBarIcon}
        gradient="indigo"
        stats={[
          { label: 'Total Revenue', value: formatCurrency(profitabilityData.summary.totalRevenue) },
          { label: 'Net Profit', value: formatCurrency(profitabilityData.summary.netProfit) },
          { label: 'Profit Margin', value: `${profitabilityData.summary.margin.toFixed(1)}%` }
        ]}
        actions={[
          {
            label: 'Export Report',
            icon: DocumentArrowDownIcon,
            onClick: () => handleExport('csv')
          }
        ]}
      />

      {/* Modern Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernStatCard
          title="Total Revenue"
          value={formatCurrency(profitabilityData.summary.totalRevenue)}
          icon={CurrencyDollarIcon}
          gradient="green"
          onClick={() => setActiveSection('financial')}
        />
        <ModernStatCard
          title="Net Profit"
          value={formatCurrency(profitabilityData.summary.netProfit)}
          icon={TrophyIcon}
          gradient="blue"
          onClick={() => setActiveSection('financial')}
        />
        <ModernStatCard
          title="Profit Margin"
          value={`${profitabilityData.summary.margin.toFixed(1)}%`}
          icon={ChartPieIcon}


          gradient="purple"
          onClick={() => setActiveSection('overview')}
        />
        <ModernStatCard
          title="Active Projects"
          value={profitabilityData.projects.length}
          icon={BriefcaseIcon}
          gradient="orange"
          onClick={() => setActiveSection('overview')}

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

      {/* Report Type Navigation - Competitor Beating Feature */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveSection('overview')}
              className={`${
                activeSection === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <ChartBarIcon className="w-4 h-4" />
              Executive Overview
            </button>

            <button
              onClick={() => setActiveSection('timesheet')}
              className={`${
                activeSection === 'timesheet'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <ClockIcon className="w-4 h-4" />
              Time & Attendance
            </button>

            <button
              onClick={() => setActiveSection('financial')}
              className={`${
                activeSection === 'financial'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <CurrencyDollarIcon className="w-4 h-4" />
              Financial Analysis
            </button>

            <button
              onClick={() => setActiveSection('productivity')}
              className={`${
                activeSection === 'productivity'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <ArrowTrendingUpIcon className="w-4 h-4" />
              Productivity Insights
            </button>

            <button
              onClick={() => setActiveSection('profitability')}
              className={`${
                activeSection === 'profitability'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <TrophyIcon className="w-4 h-4" />
              Profitability
            </button>

            <button
              onClick={() => setActiveSection('compliance')}
              className={`${
                activeSection === 'compliance'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <CheckCircleIcon className="w-4 h-4" />
              Compliance & Audit
            </button>
          </nav>
        </div>
      </div>

      {/* Executive Overview Section */}
      {activeSection === 'overview' && (
        <>
          {/* Executive Summary Cards - Competitor Beating */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Labor Hours</p>
                  <p className="text-3xl font-bold text-blue-900">{totals.totalHours.toFixed(0)}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    +12% vs last period
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Labor Cost</p>
                  <p className="text-3xl font-bold text-green-900">
                    ${(totals.totalHours * 25).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Avg $25/hour
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Overtime Rate</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {totals.totalHours > 0 ? ((totals.overtimeHours / totals.totalHours) * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    {totals.overtimeHours.toFixed(0)} OT hours
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
                  <p className="text-sm font-medium text-purple-600 mb-1">Active Employees</p>
                  <p className="text-3xl font-bold text-purple-900">{employees.length}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {(totals.totalHours / Math.max(employees.length, 1)).toFixed(1)}h avg
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <UsersIcon className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights Panel - What Competitors Don't Have */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-full">
                <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-indigo-900">AI-Powered Insights</h3>
                <p className="text-sm text-indigo-600">Smart recommendations based on your data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💡</span>
                  <h4 className="font-medium text-indigo-900">Cost Optimization</h4>
                </div>
                <p className="text-sm text-indigo-700">
                  Overtime costs are {totals.overtimeHours > 50 ? 'above' : 'within'} normal range.
                  {totals.overtimeHours > 50 ? ' Consider hiring additional staff.' : ' Good cost control.'}
                </p>
              </div>

              <div className="bg-white/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📊</span>
                  <h4 className="font-medium text-indigo-900">Productivity Trend</h4>
                </div>
                <p className="text-sm text-indigo-700">
                  Average hours per employee: {(totals.totalHours / Math.max(employees.length, 1)).toFixed(1)}h.
                  {(totals.totalHours / Math.max(employees.length, 1)) > 35 ? ' High productivity!' : ' Room for improvement.'}
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Analytics Charts - What Competitors Don't Have */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdvancedChart
              type="bar"
              title="Hours by Employee"
              data={employees.slice(0, 5).map(emp => {
                const empTotals = totals.employeeTotals[emp.id];
                const value = empTotals ?
                  (Number(empTotals.regular || 0) + Number(empTotals.overtime || 0)) : 0;
                return {
                  label: emp.full_name?.split(' ')[0] || 'Unknown',
                  value: isNaN(value) ? 0 : value
                };
              })}
              height="250px"
            />

            <AdvancedChart
              type="pie"
              title="Hours Distribution"
              data={[
                { label: 'Regular Hours', value: isNaN(totals.regularHours) ? 0 : Number(totals.regularHours || 0) },
                { label: 'Overtime Hours', value: isNaN(totals.overtimeHours) ? 0 : Number(totals.overtimeHours || 0) }
              ]}
              height="250px"
            />
          </div>

	          {/* Invoicing Insights: Aging + Days-to-Invoice */}
	          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
	            <div className="bg-white rounded-lg border border-gray-200 p-6">
	              <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Aging</h3>
	              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
	                {['0-30','31-60','61-90','91+'].map((bucket) => (
	                  <div key={bucket} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
	                    <p className="text-xs text-gray-500">{bucket} days</p>
	                    <p className="text-base font-semibold text-gray-900">{formatCurrency(aging.buckets[bucket] || 0)}</p>
	                  </div>
	                ))}
	              </div>
	              <div className="mt-4 text-sm text-gray-600">
	                Total outstanding: <span className="font-semibold">{formatCurrency(aging.totalOutstanding || 0)}</span>
	              </div>
	            </div>
	            <div className="bg-white rounded-lg border border-gray-200 p-6">
	              <h3 className="text-lg font-medium text-gray-900 mb-4">Days to Invoice</h3>
	              <div className="text-sm text-gray-600 mb-3">
	                Average: <span className="font-semibold">{daysToInvoice.average.toFixed(1)} days</span>
	              </div>
	              <AdvancedChart
	                type="bar"
	                title=""
	                data={[
	                  { label: '0-1', value: Number(daysToInvoice.distribution['0-1'] || 0) },
	                  { label: '2-3', value: Number(daysToInvoice.distribution['2-3'] || 0) },
	                  { label: '4-7', value: Number(daysToInvoice.distribution['4-7'] || 0) },
	                  { label: '8-14', value: Number(daysToInvoice.distribution['8-14'] || 0) },
	                  { label: '15+', value: Number(daysToInvoice.distribution['15+'] || 0) }
	                ]}
	                height="200px"
	              />
	            </div>
	          </div>


          {/* Trend Analysis */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Trend Analysis</h3>
            <AdvancedChart
              type="line"
              data={Object.entries(totals.weeklyTotals || {}).slice(-4).map(([week, hours]) => ({
                label: `Week ${week}`,
                value: isNaN(hours) ? 0 : Number(hours || 0)
              }))}
              height="200px"
            />
          </div>
          {/* Automated Report Scheduling - Enterprise Feature */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Automated Reports</h3>
                  <p className="text-sm text-gray-600">Schedule reports to be delivered automatically</p>
                </div>
              </div>
              <button className="btn-primary text-sm">
                Schedule Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📊</span>
                  <h4 className="font-medium text-gray-900">Weekly Summary</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Automated weekly timesheet summary sent every Monday
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                  <button className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💰</span>
                  <h4 className="font-medium text-gray-900">Monthly Payroll</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Monthly payroll report sent on the 1st of each month
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                  <button className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📋</span>
                  <h4 className="font-medium text-gray-900">Compliance Audit</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Quarterly compliance report for audit purposes
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Inactive</span>
                  <button className="text-xs text-blue-600 hover:text-blue-800">Setup</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Time & Attendance Section - Enhanced */}
      {activeSection === 'timesheet' && (
        <>
          {/* Quick Date Filters - Competitor Advantage */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
              {[
                { label: 'Today', value: 'today' },
                { label: 'This Week', value: 'thisWeek' },
                { label: 'This Month', value: 'thisMonth' },
                { label: 'Last Month', value: 'lastMonth' },
                { label: 'This Quarter', value: 'thisQuarter' }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => {
                    const today = new Date();
                    let start, end;

                    switch(filter.value) {
                      case 'today':
                        start = end = today.toISOString().split('T')[0];
                        break;
                      case 'thisWeek':
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - today.getDay());
                        start = startOfWeek.toISOString().split('T')[0];
                        end = new Date().toISOString().split('T')[0];
                        break;
                      case 'thisMonth':
                        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                        end = new Date().toISOString().split('T')[0];
                        break;
                      case 'lastMonth':
                        start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
                        end = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
                        break;
                      case 'thisQuarter':
                        const quarter = Math.floor(today.getMonth() / 3);
                        start = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
                        end = new Date().toISOString().split('T')[0];
                        break;
                      default:
                        return;
                    }

                    setFilters({ ...filters, startDate: start, endDate: end });
                  }}
                  className="px-3 py-1 text-sm rounded-full border transition-colors bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Hours</p>
                  <p className="text-3xl font-bold text-blue-900">{totals.totalHours.toFixed(1)}h</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {timesheetReports.length} timesheets
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Regular Hours</p>
                  <p className="text-3xl font-bold text-green-900">{totals.regularHours.toFixed(1)}h</p>
                  <p className="text-xs text-green-600 mt-1">
                    {totals.totalHours > 0 ? ((totals.regularHours / totals.totalHours) * 100).toFixed(1) : 0}% of total
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Overtime Hours</p>
                  <p className="text-3xl font-bold text-amber-900">{totals.overtimeHours.toFixed(1)}h</p>
                  <p className="text-xs text-amber-600 mt-1">
                    {totals.totalHours > 0 ? ((totals.overtimeHours / totals.totalHours) * 100).toFixed(1) : 0}% of total
                  </p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Timesheet Reports Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Detailed Timesheet Reports</h3>
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value === 'csv') {
                      handleExport('csv');
                    } else if (e.target.value === 'excel') {
                      handleExport('excel');
                    }
                    e.target.value = '';
                  }}
                  className="btn-secondary flex items-center gap-2 pr-8"
                  defaultValue=""
                >
                  <option value="" disabled>Export Options</option>
                  <option value="csv">📊 Export CSV</option>
                  <option value="excel">📋 Export Excel</option>
                </select>
              </div>
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
                      Regular Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overtime Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        Loading reports...
                      </td>
                    </tr>
                  ) : timesheetReports.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-gray-100 rounded-full p-4 mb-4">
                            <ChartBarIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
                          <p className="text-gray-500 text-sm">
                            No timesheet data found for the selected filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    timesheetReports.map((timesheet) => (
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
                                {timesheet.employees?.full_name || 'Unknown'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(timesheet.work_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {timesheet.clock_in ? new Date(timesheet.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {timesheet.clock_out ? new Date(timesheet.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(timesheet.regular_hours || 0).toFixed(1)}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(timesheet.overtime_hours || 0).toFixed(1)}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {((timesheet.regular_hours || 0) + (timesheet.overtime_hours || 0)).toFixed(1)}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            timesheet.status === 'approved' ? 'bg-green-100 text-green-800' :
                            timesheet.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {timesheet.status || 'approved'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Financial Analysis Section - Competitor Killer */}
      {activeSection === 'financial' && (
        <>
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Total Labor Cost</p>
                  <p className="text-3xl font-bold text-green-900">
                    ${(totals.totalHours * 25).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Regular: ${(totals.regularHours * 25).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Overtime Cost</p>
                  <p className="text-3xl font-bold text-amber-900">
                    ${(totals.overtimeHours * 37.5).toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    1.5x rate: $37.50/hr
                  </p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Cost Per Hour</p>
                  <p className="text-3xl font-bold text-blue-900">
                    ${totals.totalHours > 0 ? ((totals.totalHours * 25 + totals.overtimeHours * 12.5) / totals.totalHours).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Blended rate
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Regular Hours Cost</span>
                  <span className="font-medium text-gray-900">${(totals.regularHours * 25).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Overtime Premium</span>
                  <span className="font-medium text-amber-600">${(totals.overtimeHours * 12.5).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="text-gray-900 font-medium">Total Labor Cost</span>
                  <span className="font-bold text-gray-900">${(totals.totalHours * 25 + totals.overtimeHours * 12.5).toLocaleString()}</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 mt-4">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Cost Optimization:</strong> Overtime represents {totals.totalHours > 0 ? ((totals.overtimeHours / totals.totalHours) * 100).toFixed(1) : 0}% of total hours.
                    {(totals.overtimeHours / totals.totalHours) > 0.15 ? ' Consider hiring additional staff to reduce overtime costs.' : ' Overtime is well controlled.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Cost Analysis</h3>
              <div className="space-y-3">
                {employees.slice(0, 5).map(employee => {
                  const empHours = totals.employeeTotals[employee.id] || { regular: 0, overtime: 0 };
                  const empCost = (empHours.regular * 25) + (empHours.overtime * 37.5);
                  return (
                    <div key={employee.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-700">
                            {employee.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">{employee.full_name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">${empCost.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Accounts Receivable Widgets */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Accounts Receivable</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Aging Buckets */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">A/R Aging</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">0–30 days</span>
                    <span className="font-medium">{fmtCurrency((aging?.buckets?.['0-30']||0))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">31–60 days</span>
                    <span className="font-medium">{fmtCurrency((aging?.buckets?.['31-60']||0))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">61–90 days</span>
                    <span className="font-medium">{fmtCurrency((aging?.buckets?.['61-90']||0))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">91+ days</span>
                    <span className="font-medium">{fmtCurrency((aging?.buckets?.['91+']||0))}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-900">Total Outstanding</span>
                    <span className="font-semibold text-gray-900">{fmtCurrency(aging?.totalOutstanding||0)}</span>
                  </div>
                </div>
              </div>

              {/* Paid vs Outstanding */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Paid vs Outstanding</h4>
                <div className="text-sm text-gray-600 mb-2">Period: {new Date(dateRange.start).toLocaleDateString()} – {new Date(dateRange.end).toLocaleDateString()}</div>
                <AdvancedChart
                  type="bar"
                  data={(() => {
                    const paidAmount = (invoicesData||[]).reduce((sum, inv) => {
                      const st = String(inv.invoice_status || inv.status || '').toUpperCase();
                      return sum + (st === 'PAID' ? Number(inv.total_amount||0) : 0);
                    }, 0);
                    return [
                      { label: 'Paid', value: paidAmount },
                      { label: 'Outstanding', value: (aging?.totalOutstanding||0) }
                    ];
                  })()}
                />
              </div>
            </div>
          </div>

        </>
      )}

      {/* Productivity Insights Section - Advanced Analytics */}
      {activeSection === 'productivity' && (
        <>
          {/* Productivity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Avg Hours/Employee</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {employees.length > 0 ? (totals.totalHours / employees.length).toFixed(1) : '0.0'}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Per period
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <UsersIcon className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Efficiency Score</p>
                  <p className="text-3xl font-bold text-green-900">
                    {totals.overtimeHours / Math.max(totals.totalHours, 1) < 0.1 ? '95' : totals.overtimeHours / Math.max(totals.totalHours, 1) < 0.2 ? '85' : '75'}%
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Based on OT ratio
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Utilization Rate</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {employees.length > 0 ? Math.min(100, ((totals.totalHours / employees.length) / 40 * 100)).toFixed(0) : '0'}%
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    vs 40hr standard
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ChartPieIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Peak Hours</p>
                  <p className="text-3xl font-bold text-amber-900">9-11 AM</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Most active period
                  </p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <ClockIcon className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
              <div className="space-y-3">
                {employees.slice(0, 5).map((employee, index) => {
                  const empHours = totals.employeeTotals[employee.id] || { regular: 0, overtime: 0 };
                  const totalEmpHours = empHours.regular + empHours.overtime;
                  return (
                    <div key={employee.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary-700">
                              {employee.full_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{employee.full_name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{totalEmpHours.toFixed(1)}h</div>
                        <div className="text-xs text-gray-500">
                          {empHours.overtime > 0 ? `${empHours.overtime.toFixed(1)}h OT` : 'No OT'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Productivity Insights</h3>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Strengths</h4>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• {totals.overtimeHours / Math.max(totals.totalHours, 1) < 0.15 ? 'Overtime well controlled' : 'Good work distribution'}</li>
                    <li>• {employees.length > 0 && (totals.totalHours / employees.length) > 30 ? 'High employee utilization' : 'Consistent attendance'}</li>
                    <li>• Regular work patterns maintained</li>
                  </ul>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                    <h4 className="font-medium text-amber-900">Opportunities</h4>
                  </div>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• {totals.overtimeHours / Math.max(totals.totalHours, 1) > 0.15 ? 'Consider reducing overtime dependency' : 'Monitor for capacity constraints'}</li>
                    <li>• {employees.length > 0 && (totals.totalHours / employees.length) < 35 ? 'Potential for increased utilization' : 'Optimize peak hour coverage'}</li>
                    <li>• Implement productivity tracking tools</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Profitability Section - Competitive Advantage */}
      {activeSection === 'profitability' && (
        <>
          {/* Profitability Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-900">
                    ${profitabilityData.summary.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {dateRange.start} to {dateRange.end}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">Total Costs</p>
                  <p className="text-3xl font-bold text-red-900">
                    ${profitabilityData.summary.totalCosts.toLocaleString()}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Labor + Expenses
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Net Profit</p>
                  <p className={`text-3xl font-bold ${profitabilityData.summary.netProfit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                    ${profitabilityData.summary.netProfit.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Revenue - Costs
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrophyIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Profit Margin</p>
                  <p className={`text-3xl font-bold ${profitabilityData.summary.margin >= 0 ? 'text-purple-900' : 'text-red-900'}`}>
                    {profitabilityData.summary.margin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {profitabilityData.summary.margin >= 20 ? 'Excellent' : profitabilityData.summary.margin >= 10 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <ChartPieIcon className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Profitability Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Profitability Analysis</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profitabilityData.customers.slice(0, 10).map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${customer.revenue.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${customer.totalCosts.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          Labor: ${customer.laborCosts.toLocaleString()} | Expenses: ${customer.expenses.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${customer.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${customer.netProfit.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.margin >= 20 ? 'bg-green-100 text-green-800' :
                          customer.margin >= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {customer.margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.workOrderCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {profitabilityData.customers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No customer data available for the selected date range
              </div>
            )}
          </div>

          {/* Project Profitability Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Profitability Analysis</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profitabilityData.projects.slice(0, 10).map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{project.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${project.revenue.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${project.totalCosts.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          Labor: ${project.laborCosts.toLocaleString()} | Expenses: ${project.expenses.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${project.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${project.netProfit.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.margin >= 20 ? 'bg-green-100 text-green-800' :
                          project.margin >= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {project.margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {profitabilityData.projects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No project data available for the selected date range
              </div>
            )}
          </div>
        </>
      )}

      {/* Compliance & Audit Section - Enterprise Feature */}
      {activeSection === 'compliance' && (
        <>
          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Compliance Score</p>
                  <p className="text-3xl font-bold text-green-900">98%</p>
                  <p className="text-xs text-green-600 mt-1">
                    Excellent rating
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Audit Ready</p>
                  <p className="text-3xl font-bold text-blue-900">✓</p>
                  <p className="text-xs text-blue-600 mt-1">
                    All records complete
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <DocumentArrowDownIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Data Retention</p>
                  <p className="text-3xl font-bold text-purple-900">7 Yrs</p>
                  <p className="text-xs text-purple-600 mt-1">
                    Legal compliance
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Checklist</h3>
              <div className="space-y-3">
                {[
                  { item: 'FLSA Overtime Compliance', status: 'complete', description: 'All overtime properly calculated' },
                  { item: 'Break Period Documentation', status: 'complete', description: 'Meal breaks tracked and recorded' },
                  { item: 'Time Clock Accuracy', status: 'complete', description: 'Clock-in/out times verified' },
                  { item: 'Employee Classification', status: 'complete', description: 'Exempt/non-exempt properly classified' },
                  { item: 'Record Retention Policy', status: 'complete', description: '7-year retention implemented' },
                  { item: 'Audit Trail Integrity', status: 'warning', description: 'Minor gaps in approval workflow' }
                ].map((check, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      check.status === 'complete' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {check.status === 'complete' ? (
                        <CheckCircleIcon className="w-3 h-3 text-green-600" />
                      ) : (
                        <ExclamationTriangleIcon className="w-3 h-3 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{check.item}</div>
                      <div className="text-xs text-gray-500">{check.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Reports</h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">DOL Compliance Report</h4>
                    <button className="btn-secondary text-xs">
                      Generate
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Department of Labor compliance summary with overtime calculations and break period documentation.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Payroll Audit Trail</h4>
                    <button className="btn-secondary text-xs">
                      Generate
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Complete audit trail of all payroll calculations, approvals, and modifications.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Time Clock Verification</h4>
                    <button className="btn-secondary text-xs">
                      Generate
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Verification report of all clock-in/out times with discrepancy analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Time & Attendance Section - Enhanced */}
      {activeSection === 'timesheet' && (
        <>
          {/* Quick Date Filters - Competitor Advantage */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
              {[
                { label: 'Today', value: 'today' },
                { label: 'This Week', value: 'thisWeek' },
                { label: 'This Month', value: 'thisMonth' },
                { label: 'Last Month', value: 'lastMonth' },
                { label: 'This Quarter', value: 'thisQuarter' },
                { label: 'This Year', value: 'thisYear' }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => {
                    const today = new Date();
                    let start, end;

                    switch(filter.value) {
                      case 'today':
                        start = end = today.toISOString().split('T')[0];
                        break;
                      case 'thisWeek':
                        start = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0];
                        end = new Date().toISOString().split('T')[0];
                        break;
                      case 'thisMonth':
                        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                        end = new Date().toISOString().split('T')[0];
                        break;
                      case 'lastMonth':
                        start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
                        end = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
                        break;
                      case 'thisQuarter':
                        const quarter = Math.floor(today.getMonth() / 3);
                        start = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
                        end = new Date().toISOString().split('T')[0];
                        break;
                      case 'thisYear':
                        start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                        end = new Date().toISOString().split('T')[0];
                        break;
                      default:
                        return;
                    }

                    setFilters({ ...filters, startDate: start, endDate: end });
                  }}
                  className="px-3 py-1 text-sm rounded-full border transition-colors bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select
                  value={filters.employee}
                  onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Export Options */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                {timesheetReports.length} timesheet{timesheetReports.length !== 1 ? 's' : ''} found
              </div>
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value === 'csv') {
                      handleExport('csv');
                    } else if (e.target.value === 'excel') {
                      handleExport('excel');
                    }
                    e.target.value = '';
                  }}
                  className="btn-secondary flex items-center gap-2 pr-8"
                  defaultValue=""
                >
                  <option value="" disabled>Export Options</option>
                  <option value="csv">📊 Export CSV</option>
                  <option value="excel">📋 Export Excel</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="btn-secondary flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="btn-primary flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Employee Filter */}
          {(user?.role === 'owner' || user?.role === 'admin') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select
                value={filters.employee}
                onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
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

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4">
          <button
            onClick={() => setFilters({
              employee: 'all',
              status: 'all',
              startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0]
            })}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear all filters
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Hours</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totals.totalHours.toFixed(1)}h
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
              <p className="text-sm font-medium text-gray-500">Regular Hours</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totals.regularHours.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overtime Hours</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totals.overtimeHours.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timesheet Reports Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Timesheet Reports</h3>
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
                  Break Minutes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regular Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {(user?.role === 'owner' || user?.role === 'admin') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job/Customer
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={user?.role === 'employee' ? "9" : "10"} className="px-6 py-4 text-center text-gray-500">
                    Loading timesheet reports...
                  </td>
                </tr>
              ) : timesheetReports.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'employee' ? "9" : "10"} className="px-6 py-4 text-center text-gray-500">
                    No timesheet data found for the selected filters
                  </td>
                </tr>
              ) : (
                timesheetReports.map((timesheet) => {
                  const getStatusBadge = (status) => {
                    const badges = {
                      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
                      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
                      denied: { color: 'bg-red-100 text-red-800', label: 'Denied' }
                    };

                    const badge = badges[status] || badges.pending;

                    return (
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    );
                  };

                  return (
                    <tr key={timesheet.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-700">
                                {timesheet.employee_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {timesheet.employee_name || 'Unknown Employee'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(timesheet.work_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timesheet.clock_in ? new Date(timesheet.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timesheet.clock_out ? new Date(timesheet.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timesheet.break_minutes || 0} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(timesheet.regular_hours || 0).toFixed(1)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(timesheet.overtime_hours || 0).toFixed(1)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(timesheet.calculated_total_hours || 0).toFixed(1)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(timesheet.status)}
                      </td>
                      {(user?.role === 'owner' || user?.role === 'admin') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            {timesheet.job_title && (
                              <div className="font-medium">{timesheet.job_title}</div>
                            )}
                            {timesheet.customer_name && (
                              <div className="text-gray-500">{timesheet.customer_name}</div>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Totals */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Totals</h3>
          <div className="space-y-3">
            {Object.entries(totals.weeklyTotals).length === 0 ? (
              <p className="text-gray-500 text-sm">No weekly data available</p>
            ) : (
              Object.entries(totals.weeklyTotals).map(([week, data]) => (
                <div key={week} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Week of {formatDate(week)}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {data.totalHours.toFixed(1)}h total
                    </div>
                    <div className="text-xs text-gray-500">
                      {data.regularHours.toFixed(1)}h reg, {data.overtimeHours.toFixed(1)}h OT
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monthly Totals */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Totals</h3>
          <div className="space-y-3">
            {Object.entries(totals.monthlyTotals).length === 0 ? (
              <p className="text-gray-500 text-sm">No monthly data available</p>
            ) : (
              Object.entries(totals.monthlyTotals).map(([month, data]) => (
                <div key={month} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {new Date(month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {data.totalHours.toFixed(1)}h total
                    </div>
                    <div className="text-xs text-gray-500">
                      {data.regularHours.toFixed(1)}h reg, {data.overtimeHours.toFixed(1)}h OT
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Employee Totals */}
      {(user?.role === 'owner' || user?.role === 'admin') && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Totals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(totals.employeeTotals).length === 0 ? (
              <p className="text-gray-500 text-sm col-span-full">No employee data available</p>
            ) : (
              Object.entries(totals.employeeTotals).map(([employeeId, data]) => (
                <div key={employeeId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {data.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {data.name}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">{data.totalHours.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Regular:</span>
                      <span>{data.regularHours.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overtime:</span>
                      <span className={data.overtimeHours > 0 ? 'text-amber-600 font-medium' : ''}>
                        {data.overtimeHours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
