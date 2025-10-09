import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import '../styles/modern-enhancements.css';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import { Avatar } from '../utils/avatarUtils';
import InventoryAlertsWidget from '../components/Dashboard/InventoryAlertsWidget';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import {
  UsersIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ChartPieIcon,
  CalendarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, change, changeType, icon: Icon, onClick, loading, extra }) => (
  <button
    type="button"
    onClick={onClick}
    className="card text-left hover:shadow-md transition-shadow duration-150"
  >
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
      <div className="ml-4 flex-1">
        <div className="text-sm font-medium text-gray-500">{title}</div>
        {loading ? (
          <div className="mt-1 h-6 w-24 bg-gray-100 rounded animate-pulse" />
        ) : (
          <div className="text-2xl font-semibold text-gray-900">{value}</div>
        )}
        {!loading && change && (
          <div className={`mt-1 inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5 border ${
            changeType === 'increase' ? 'text-green-700 border-green-200 bg-green-50' : 'text-red-700 border-red-200 bg-red-50'
          }`}>
            {changeType === 'increase' ? (
              <ArrowUpIcon className="w-3 h-3 mr-1" />
            ) : (
              <ArrowDownIcon className="w-3 h-3 mr-1" />
            )}
            {change}
          </div>
        )}
        {!loading && extra && (
          <div className="mt-2">{extra}</div>
        )}
      </div>
    </div>
  </button>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // 🔍 DEBUG: Log user state
  console.log('🔍 AdminDashboard - User state:', user);
  console.log('🔍 AdminDashboard - User is null?', user === null);
  console.log('🔍 AdminDashboard - User is undefined?', user === undefined);

  const [showCompare, setShowCompare] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    activeEmployees: 0,
    jobsThisWeek: 0,
    monthlyRevenue: 0,
    completionRate: 0,
    unscheduledJobs: 0,
    outstandingInvoices: 0,
    quoteConversionRate: 0,
    overdueJobs: 0,
    arAging: { bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90_plus: 0 },
    utilizationPct: 0,
    scheduledHours: 0,
    capacityHours: 0,
    revenueSeries: [],
    funnel: { sent: 0, accepted: 0, scheduled: 0, inProgress: 0, completed: 0 },
    leaderboard: [],
    loading: true
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [range, setRange] = useState({ preset: 'MONTH', start: null, end: null });

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_range');
    if (saved) {
      try { setRange(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('dashboard_range', JSON.stringify(range)); } catch {}
  }, [range]);

  useEffect(() => {
    if (user?.company_id) {
      loadDashboardData();
    }
  }, [user, range]);

  // 🔒 LOGIN ENFORCEMENT - Must be after all hooks
  if (!user) {
    console.log('🚨 AdminDashboard - No user found, redirecting to login');
    navigate('/login');
    return null;
  }

  // 🔒 ROLE GUARDS - Only allow admin dashboard access to these roles
  const allowedRoles = ['APP_OWNER', 'OWNER', 'ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    console.log('🚨 AdminDashboard - Invalid role:', user.role, 'redirecting to unauthorized');
    navigate('/unauthorized');
    return null;
  }

  console.log('✅ AdminDashboard - User authenticated with role:', user.role);

  const loadDashboardData = async () => {
    try {
      const now = new Date();
      const presets = {
        TODAY: () => {
          const s = new Date(now); s.setHours(0,0,0,0);
          const e = new Date(now); e.setHours(23,59,59,999);
          return { start: s, end: e };
        },
        WEEK: () => {
          const s = new Date(now); s.setHours(0,0,0,0); s.setDate(now.getDate() - now.getDay());
          const e = new Date(s); e.setDate(s.getDate() + 6); e.setHours(23,59,59,999);
          return { start: s, end: e };
        },
        MONTH: () => {
          const s = new Date(now.getFullYear(), now.getMonth(), 1); s.setHours(0,0,0,0);
          const e = new Date(now.getFullYear(), now.getMonth() + 1, 0); e.setHours(23,59,59,999);
          return { start: s, end: e };
        }
      };
      const { start, end } = range.start && range.end ? range : (presets[range.preset] || presets.MONTH)();

      const formatDate = (date) => date.toISOString().split('T')[0];
      const toISO = (date) => date.toISOString();

      // 1) Active Employees - fallback: count employees table rows (no status filter)
      const employeesResponse = await supaFetch('employees?select=id', { method: 'GET' }, user.company_id);
      const activeEmployees = employeesResponse.ok ? (await employeesResponse.json()).length : 0;

      // 2) Jobs in range - use status field and created_at instead of stage/start_time
      // ✅ FIXED: Use lowercase status values (enum cleanup)
      const jobsRangeResponse = await supaFetch(
        `work_orders?select=id&status=in.(scheduled,in_progress,completed)&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );
      const jobsInRange = jobsRangeResponse.ok ? (await jobsRangeResponse.json()).length : 0;

      // 3) Cash-basis Revenue
      const paymentsRes = await supaFetch(
        `payments?select=amount,received_at&received_at=gte.${toISO(start)}&received_at=lt.${toISO(new Date(end.getTime()+1))}`,
        { method: 'GET' }, user.company_id
      );
      let cashRevenue = 0;
      let paysArr = [];
      if (paymentsRes.ok) {
        const tmp = await paymentsRes.json();
        paysArr = Array.isArray(tmp) ? tmp : [];
        cashRevenue = paysArr.reduce((sum, p) => sum + (Number(p.amount) > 0 ? Number(p.amount) : 0), 0);
      }

      // 4) Completion Rate - use status field and created_at
      const completedJobsResponse = await supaFetch(
        `work_orders?select=id&status=eq.completed&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );
      const completedJobs = completedJobsResponse.ok ? (await completedJobsResponse.json()).length : 0;
      const completionRate = jobsInRange > 0 ? Math.round((completedJobs / jobsInRange) * 100) : 0;

      // Build revenue series for sparkline
      const days = [];
      const dayMs = 24*60*60*1000;
      for (let d = new Date(start); d <= end; d = new Date(d.getTime()+dayMs)) {
        days.push(d.toISOString().slice(0,10));
      }
      const daily = Object.fromEntries(days.map(d => [d, 0]));
      paysArr.forEach(p => {
        const day = new Date(p.paid_at).toISOString().slice(0,10);
        if (daily[day] != null) daily[day] += (Number(p.amount) > 0 ? Number(p.amount) : 0);
      });
      const revenueSeries = days.map(d => daily[d] || 0);

      await loadAdvancedKPIs(formatDate, start, end, {
        activeEmployees,
        jobsThisWeek: jobsInRange,
        monthlyRevenue: cashRevenue,
        completionRate,
        revenueSeries
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const loadAdvancedKPIs = async (formatDate, start, end, basicKPIs) => {
    try {
      // 5) Unscheduled Jobs
      // ✅ FIXED: Use lowercase status values (enum cleanup)
      const unscheduledResponse = await supaFetch(
        'work_orders?select=id&status=in.(scheduled,in_progress)',
        { method: 'GET' }, user.company_id
      );
      const unscheduledJobs = unscheduledResponse.ok ? (await unscheduledResponse.json()).length : 0;

      // 6) Outstanding invoices and A/R Aging
      const invRes = await supaFetch(
        'invoices?select=id,total_amount,status,due_date',
        { method: 'GET' }, user.company_id
      );
      let outstandingInvoices = 0;
      let arAging = { bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90_plus: 0 };
      if (invRes.ok) {
        const allInvs = await invRes.json();
        const openInvs = allInvs.filter(inv => inv.status !== 'PAID');
        const ids = openInvs.map(i => i.id);
        let paymentsByInvoice = new Map();
        if (ids.length > 0) {
          const idsCSV = ids.map(id => `${id}`).join(',');
          const payRes = await supaFetch(
            `payments?select=invoice_id,amount&invoice_id=in.(${idsCSV})`,
            { method: 'GET' }, user.company_id
          );
          if (payRes.ok) {
            const pays = await payRes.json();
            pays.forEach(p => {
              const k = p.invoice_id;
              const prev = paymentsByInvoice.get(k) || 0;
              paymentsByInvoice.set(k, prev + Number(p.amount || 0));
            });
          }
        }
        const today = new Date();
        const msDay = 24*60*60*1000;
        openInvs.forEach(inv => {
          const paid = paymentsByInvoice.get(inv.id) || 0;
          const balance = Math.max(0, Number(inv.total_amount || 0) - paid);
          outstandingInvoices += balance;
          const dueRaw = inv.due_date;
          if (dueRaw) {
            const due = new Date(dueRaw);
            const daysOver = Math.floor((today - due) / msDay);
            if (daysOver > 0) {
              if (daysOver <= 30) arAging.bucket0_30 += balance;
              else if (daysOver <= 60) arAging.bucket31_60 += balance;
              else if (daysOver <= 90) arAging.bucket61_90 += balance;
              else arAging.bucket90_plus += balance;
            }
          }
        });
      }

      // 7) Quote conversion in range
      // ✅ FIXED: Use lowercase status values (enum cleanup)
      const sentQuotesResponse = await supaFetch(
        `work_orders?select=id&status=in.(sent,approved)&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );
      const acceptedQuotesResponse = await supaFetch(
        `work_orders?select=id&status=eq.approved&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );
      const sentQuotes = sentQuotesResponse.ok ? (await sentQuotesResponse.json()).length : 0;
      const acceptedQuotes = acceptedQuotesResponse.ok ? (await acceptedQuotesResponse.json()).length : 0;
      const quoteConversionRate = sentQuotes > 0 ? Math.round((acceptedQuotes / sentQuotes) * 100) : 0;

      // 8) Overdue Jobs
      // ✅ FIXED: Use lowercase status values (enum cleanup)
      const todayStr = formatDate(new Date());
      const overdueResponse = await supaFetch(
        `work_orders?select=id&created_at=lt.${todayStr}&status=in.(scheduled,in_progress)`,
        { method: 'GET' }, user.company_id
      );
      const overdueJobs = overdueResponse.ok ? (await overdueResponse.json()).length : 0;

      // 9) Funnel counts
      // ✅ FIXED: Use lowercase status values (enum cleanup)
      const sentQuotesRes = await supaFetch(
        `work_orders?select=id&status=eq.sent&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );
      const acceptedQuotesRes = await supaFetch(
        `work_orders?select=id&status=eq.approved&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );
      const scheduledJobsRes = await supaFetch(
        `work_orders?select=id&status=eq.scheduled&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );
      const inProgressJobsRes = await supaFetch(
        `work_orders?select=id&status=eq.in_progress&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );
      const completedJobsRes = await supaFetch(
        `work_orders?select=id,created_by&status=eq.completed&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );

      let completedJobsData = [];
      if (completedJobsRes.ok) {
        completedJobsData = await completedJobsRes.json();
      }

      const funnel = {
        sent: sentQuotesRes.ok ? (await sentQuotesRes.json()).length : 0,
        accepted: acceptedQuotesRes.ok ? (await acceptedQuotesRes.json()).length : 0,
        scheduled: scheduledJobsRes.ok ? (await scheduledJobsRes.json()).length : 0,
        inProgress: inProgressJobsRes.ok ? (await inProgressJobsRes.json()).length : 0,
        completed: completedJobsData.length,
      };

      // 10) Leaderboard: top technicians by completed jobs
      let leaderboard = [];
      if (completedJobsData.length > 0) {
        const counts = new Map();
        completedJobsData.forEach(j => {
          if (!j.created_by) return;
          counts.set(j.created_by, (counts.get(j.created_by) || 0) + 1);
        });
        leaderboard = Array.from(counts.entries())
          .map(([techId, count]) => ({ techId, count }))
          .sort((a,b) => b.count - a.count)
          .slice(0, 5);
      }

      // Resolve technician names using users table
      if (leaderboard.length) {
        const techIds = leaderboard.map(t => t.techId).join(',');
        const usersRes = await supaFetch(`users?select=id,name,first_name,last_name&id=in.(${techIds})`, { method: 'GET' }, user.company_id);
        if (usersRes.ok) {
          const users = await usersRes.json();
          const nameById = new Map(users.map(u => [u.id, u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Technician']));
          leaderboard = leaderboard.map(t => ({ ...t, name: nameById.get(t.techId) || t.techId }));
        }
      }

      // 11) Team Utilization
      const woDurRes = await supaFetch(
        `work_orders?select=created_at,updated_at&status=in.(scheduled,in_progress,completed)&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );
      let scheduledHours = 0;
      if (woDurRes.ok) {
        const rows = await woDurRes.json();
        rows.forEach(r => {
          if (r.start_time && r.end_time) {
            const st = new Date(r.start_time);
            const et = new Date(r.end_time);
            const h = Math.max(0, (et - st) / 3600000);
            scheduledHours += h;
          }
        });
      }
      const activeEmployees = basicKPIs.activeEmployees || 0;
      const countWeekdays = (s, e) => {
        let d = new Date(s), cnt = 0;
        d.setHours(0,0,0,0);
        const endD = new Date(e); endD.setHours(0,0,0,0);
        while (d <= endD) {
          const day = d.getDay();
          if (day !== 0 && day !== 6) cnt++;
          d.setDate(d.getDate() + 1);
        }
        return cnt;
      };
      const weekdays = countWeekdays(start, end);
      const capacityHours = activeEmployees * 8 * weekdays;
      const utilizationPct = capacityHours > 0 ? Math.round((scheduledHours / capacityHours) * 100) : 0;

      // Load recent activity
      await loadRecentActivity();

      // Set all dashboard data
      setDashboardData({
        ...basicKPIs,
        unscheduledJobs,
        outstandingInvoices,
        quoteConversionRate,
        overdueJobs,
        arAging,
        utilizationPct,
        scheduledHours,
        capacityHours,
        revenueSeries: basicKPIs.revenueSeries || [],
        funnel,
        leaderboard,
        loading: false
      });

    } catch (error) {
      console.error('Error loading advanced KPIs:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await supaFetch(
        'work_orders?select=id,title,status,updated_at,customers(name)&order=updated_at.desc&limit=5',
        { method: 'GET' }, user.company_id
      );

      if (response.ok) {
        const workOrders = await response.json();
        const activities = workOrders.map(wo => {
          let message = '';
          let icon = DocumentTextIcon;

          // Use computed name column from customers table
          const customerName = wo.customers?.name || 'Customer';

          if (wo.stage === 'QUOTE') {
            if (wo.quote_status === 'ACCEPTED') {
              message = `Quote #${wo.id} accepted by ${customerName}`;
              icon = ChartBarIcon;
            } else if (wo.quote_status === 'SENT') {
              message = `Quote #${wo.id} sent to ${customerName}`;
              icon = DocumentTextIcon;
            } else {
              message = `Quote #${wo.id} created for ${customerName}`;
              icon = DocumentTextIcon;
            }
          } else if (wo.stage === 'JOB') {
            if (wo.job_status === 'COMPLETED') {
              message = `Job #${wo.id} completed for ${customerName}`;
              icon = ChartBarIcon;
            } else if (wo.job_status === 'IN_PROGRESS') {
              message = `Job #${wo.id} started for ${customerName}`;
              icon = ClockIcon;
            } else {
              message = `Job #${wo.id} scheduled for ${customerName}`;
              icon = CalendarDaysIcon;
            }
          } else if (wo.stage === 'INVOICE') {
            if (wo.payment_status === 'PAID') {
              message = `Invoice #${wo.id} paid by ${wo.customers?.name || 'Customer'}`;
              icon = CurrencyDollarIcon;
            } else {
              message = `Invoice #${wo.id} sent to ${wo.customers?.name || 'Customer'}`;
              icon = BanknotesIcon;
            }
          }

          return {
            id: wo.id,
            message,
            icon,
            time: new Date(wo.updated_at).toLocaleDateString()
          };
        });

        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Error loading recent activity:', error);
      setRecentActivity([]);
    }
  };

  // Primary KPI Stats
  const primaryStats = [
    {
      title: 'Active Employees',
      value: dashboardData.loading ? '-' : dashboardData.activeEmployees.toString(),
      icon: UsersIcon,
      onClick: () => navigate('/employees')
    },
    {
      title: 'Jobs This Range',
      value: dashboardData.loading ? '-' : dashboardData.jobsThisWeek.toString(),
      icon: CalendarDaysIcon,
      onClick: () => navigate('/jobs')
    },
    {
      title: 'Cash Revenue',
      value: dashboardData.loading ? '-' : `$${Number(dashboardData.monthlyRevenue || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      onClick: () => navigate('/invoices'),
      extra: !dashboardData.loading && (
        <div className="mt-2">
          <ResponsiveContainer width="100%" height={54}>
            <AreaChart data={(dashboardData.revenueSeries || []).map((v,i)=>({ i, v }))}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="i" hide />
              <YAxis hide />
              <RTooltip formatter={(v)=>[`$${Number(v).toLocaleString()}`, 'Revenue']} cursor={{ stroke: '#E5E7EB' }} />
              <Area type="monotone" dataKey="v" stroke="#9CA3AF" fillOpacity={1} fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )
    },
    {
      title: 'Completion Rate',
      value: dashboardData.loading ? '-' : `${dashboardData.completionRate}%`,
      icon: ChartBarIcon,
      onClick: () => navigate('/jobs?filter=completed')
    }
  ];

  // Advanced KPI Stats
  const advancedStats = [
    {
      title: 'Unscheduled Jobs',
      value: dashboardData.loading ? '-' : dashboardData.unscheduledJobs.toString(),
      icon: ExclamationTriangleIcon,
      onClick: () => navigate('/jobs?filter=unscheduled')
    },
    {
      title: 'Outstanding A/R',
      value: dashboardData.loading ? '-' : `$${Number(dashboardData.outstandingInvoices || 0).toLocaleString()}`,
      icon: BanknotesIcon,
      onClick: () => navigate('/invoices?filter=outstanding')
    },
    {
      title: 'Quote Conversion',
      value: dashboardData.loading ? '-' : `${dashboardData.quoteConversionRate}%`,
      icon: ChartPieIcon,
      onClick: () => navigate('/quotes?filter=sent')
    },
    {
      title: 'Overdue Jobs',
      value: dashboardData.loading ? '-' : dashboardData.overdueJobs.toString(),
      icon: CalendarIcon,
      onClick: () => navigate('/jobs?filter=overdue')
    }
  ];

  // Helper components
  const AgingPill = ({ label, value }) => (
    <div className="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 bg-white">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{fmtMoney(value)}</span>
    </div>
  );

  const ProgressBar = ({ pct }) => (
    <div className="w-full h-2 bg-gray-100 rounded">
      <div className="h-2 bg-gray-400 rounded" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );

  const fmtMoney = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n || 0));

  const ar = dashboardData.arAging || { bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90_plus: 0 };
  const arTotal = (Number(ar.bucket0_30)||0) + (Number(ar.bucket31_60)||0) + (Number(ar.bucket61_90)||0) + (Number(ar.bucket90_plus)||0);

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Executive Dashboard"
        subtitle="Strategic business overview and key performance indicators"
        icon={ChartBarIcon}
        gradient="purple"
        stats={[
          { label: 'Revenue', value: fmtMoney(dashboardData.totalRevenue || 0) },
          { label: 'Active Jobs', value: dashboardData.activeJobs || 0 },
          { label: 'Team Members', value: dashboardData.activeEmployees || 0 }
        ]}
        actions={[
          {
            label: 'View Reports',
            icon: DocumentTextIcon,
            onClick: () => navigate('/reports')
          }
        ]}
      />

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernCard className="card-gradient-blue text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Monthly Revenue</p>
                <p className="text-3xl font-bold text-white">{fmtMoney(dashboardData.totalRevenue || 0)}</p>
                <p className="text-blue-200 text-xs mt-1">This month</p>
              </div>
              <CurrencyDollarIcon className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-green text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Jobs</p>
                <p className="text-3xl font-bold text-white">{dashboardData.activeJobs || 0}</p>
                <p className="text-green-200 text-xs mt-1">In progress</p>
              </div>
              <CalendarDaysIcon className="w-12 h-12 text-green-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-orange text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Team Utilization</p>
                <p className="text-3xl font-bold text-white">{dashboardData.utilizationPct || 0}%</p>
                <p className="text-orange-200 text-xs mt-1">Capacity used</p>
              </div>
              <UserGroupIcon className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-purple text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Outstanding A/R</p>
                <p className="text-3xl font-bold text-white">{fmtMoney(arTotal)}</p>
                <p className="text-purple-200 text-xs mt-1">To collect</p>
              </div>
              <BanknotesIcon className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Time Period:</span>
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              {['TODAY','WEEK','MONTH'].map(p => (
                <button
                  key={p}
                  onClick={() => setRange({ preset: p, start: null, end: null })}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    range.preset === p
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="form-checkbox text-primary-600 rounded"
              checked={showCompare}
              onChange={(e)=>setShowCompare(e.target.checked)}
            />
            Compare to previous period
          </label>
        </div>
      </div>

      {/* Advanced KPI Stats Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advancedStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Executive Actions */}
      <div className="mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Executive Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-blue-700"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span className="text-sm font-medium">View Reports</span>
            </button>
            <button
              onClick={() => navigate('/employees')}
              className="flex items-center justify-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 text-green-700"
            >
              <UsersIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Team Performance</span>
            </button>
            <button
              onClick={() => navigate('/invoices')}
              className="flex items-center justify-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors duration-200 text-amber-700"
            >
              <CurrencyDollarIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Financial Overview</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center justify-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 text-purple-700"
            >
              <CogIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Company Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Insights */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Health Score */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Business Health</h3>
            <button onClick={() => navigate('/customer-dashboard')} className="text-sm text-gray-600 hover:text-gray-900">View Details</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">Quote Conversion Rate</div>
              <div className="text-lg font-semibold text-gray-900">{dashboardData.quoteConversionRate}%</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">Team Utilization</div>
              <div className="text-lg font-semibold text-gray-900">{dashboardData.utilizationPct}%</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">Outstanding A/R</div>
              <div className="text-lg font-semibold text-gray-900">${Number(dashboardData.outstandingInvoices || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Technician Leaderboard */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Technicians</h3>
            <button onClick={() => navigate('/jobs?filter=completed')} className="text-sm text-gray-600 hover:text-gray-900">View</button>
          </div>
          <div className="divide-y divide-gray-100">
            {(dashboardData.leaderboard || []).length === 0 ? (
              <div className="text-sm text-gray-500">No completed jobs in range</div>
            ) : (
              (dashboardData.leaderboard || []).map((t) => (
                <div key={t.techId} className="flex items-center justify-between py-2 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={t.name || 'Technician'} size="sm" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-700 truncate">{t.name || t.techId}</div>
                      <div className="w-32 h-1.5 bg-gray-100 rounded mt-1">
                        <div className="h-1.5 bg-gray-300 rounded" style={{ width: `${Math.min(100, (t.count || 0) * 20)}%` }} />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/jobs?filter=completed&tech_id=${t.techId}`)} className="text-sm font-medium text-gray-900 hover:underline flex-shrink-0">{t.count}</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Operational Health */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A/R Aging */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">A/R Aging</h3>
            <div className="text-sm text-gray-500">Total: {fmtMoney(arTotal)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AgingPill label="0–30 days" value={ar.bucket0_30} />
            <AgingPill label="31–60 days" value={ar.bucket31_60} />
            <AgingPill label="61–90 days" value={ar.bucket61_90} />
            <AgingPill label="> 90 days" value={ar.bucket90_plus} />
          </div>
          <div className="mt-4 text-right space-x-3">
            <button onClick={() => navigate('/invoices?filter=aging_0_30')} className="text-sm text-gray-600 hover:text-gray-900">View 0–30</button>
            <button onClick={() => navigate('/invoices?filter=aging_31_60')} className="text-sm text-gray-600 hover:text-gray-900">31–60</button>
            <button onClick={() => navigate('/invoices?filter=aging_61_90')} className="text-sm text-gray-600 hover:text-gray-900">61–90</button>
            <button onClick={() => navigate('/invoices?filter=aging_90_plus')} className="text-sm text-gray-600 hover:text-gray-900">90+</button>
          </div>
        </div>

        {/* Team Utilization */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Utilization</h3>
            <div className="text-sm text-gray-500">{dashboardData.utilizationPct}%</div>
          </div>
          <ProgressBar pct={dashboardData.utilizationPct} />
          <div className="mt-3 text-sm text-gray-600">
            {Number(dashboardData.scheduledHours || 0).toFixed(1)} hrs scheduled of {Number(dashboardData.capacityHours || 0).toFixed(1)} hrs capacity
          </div>
          <div className="mt-4 text-right">
            <button onClick={() => navigate('/jobs')} className="text-sm text-gray-600 hover:text-gray-900">View schedule</button>
          </div>
        </div>

        {/* Inventory Alerts */}
        <InventoryAlertsWidget />
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <activity.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-500">No recent activity</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
