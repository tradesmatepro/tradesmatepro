import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/Common/PageHeader';
import { useUser } from '../contexts/UserContext';
import { getSupabaseClient } from '../utils/supabaseClient';
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
  ChatBubbleLeftRightIcon
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
// Local tiny sparkline component
const Sparkline = ({ values, width = 140, height = 36 }) => {
  const nums = (values || []).map(n => Number(n || 0));
  if (!nums.length) return null;
  const max = Math.max(...nums);
  const min = Math.min(...nums);
  const range = Math.max(1, max - min);
  const step = width / (nums.length - 1 || 1);
  const points = nums.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="block">
      <polyline fill="none" stroke="#9CA3AF" strokeWidth="2" points={points} />
    </svg>
  );
};


const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  // Compare toggle (show delta badges everywhere)
  const [showCompare, setShowCompare] = useState(true);


  const [dashboardData, setDashboardData] = useState({
    // Original KPIs
    activeEmployees: 0,
    jobsThisWeek: 0,
    monthlyRevenue: 0,
    completionRate: 0,
    // Advanced KPIs
    unscheduledJobs: 0,
    outstandingInvoices: 0,
    quoteConversionRate: 0,
    overdueJobs: 0,
    // Phase 1.5
    arAging: { bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90_plus: 0 },
    utilizationPct: 0,
    scheduledHours: 0,
    capacityHours: 0,
    revenueSeries: [],
    funnel: { sent: 0, accepted: 0, scheduled: 0, inProgress: 0, completed: 0 },
    leaderboard: [],
    // Marketplace KPIs
    marketplaceRequests: 0,
    marketplaceResponses: 0,
    marketplaceConversionRate: 0,
    marketplaceRevenue: 0,
    loading: true
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Date range state (neutral colors, simple preset)
  const [range, setRange] = useState({ preset: 'MONTH', start: null, end: null });
  // Persist range in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dashboard_range');
    if (saved) {
      try { setRange(JSON.parse(saved)); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try { localStorage.setItem('dashboard_range', JSON.stringify(range)); } catch {}
  }, [range]);


  useEffect(() => {
    // Only load dashboard data if user is authenticated and has company_id
    if (user?.company_id && user?.id) {
      console.log('📊 Loading dashboard data for company:', user.company_id);
      loadDashboardData();
    } else {
      console.log('⏳ Waiting for user authentication before loading dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, range]);

  const loadDashboardData = async () => {
    try {
      // Compute date range by preset
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

      // 1) Active Employees - use users table status enum
      const supabase = getSupabaseClient();
      const { data: employees, error: employeesError } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', user.company_id)
        .eq('status', 'ACTIVE');
      const activeEmployees = employeesError ? 0 : (employees?.length || 0);

      // 2) Jobs in range - use status field and created_at (no start_time field exists)
      // ✅ FIXED: Use lowercase status values (enum cleanup)
      const jobsRangeResponse = await supaFetch(
        `work_orders?select=id&status=in.(scheduled,in_progress,completed,cancelled,invoiced)&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );
      const jobsInRange = jobsRangeResponse.ok ? (await jobsRangeResponse.json()).length : 0;

      // 3) Cash-basis Revenue: sum payments.amount where paid_at in range and amount>0
      const paymentsRes = await supaFetch(
        `payments?select=amount,paid_at&paid_at=gte.${toISO(start)}&paid_at=lt.${toISO(new Date(end.getTime()+1))}`,
        { method: 'GET' }, user.company_id
      );
      let cashRevenue = 0;
      let paysArr = [];
      if (paymentsRes.ok) {
        const tmp = await paymentsRes.json();
        paysArr = Array.isArray(tmp) ? tmp : [];
        cashRevenue = paysArr.reduce((sum, p) => sum + (Number(p.amount) > 0 ? Number(p.amount) : 0), 0);
      }

      // 4) Completion Rate in range
      const completedJobsResponse = await supaFetch(
        `work_orders?select=id&status=eq.COMPLETED&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );
      const completedJobs = completedJobsResponse.ok ? (await completedJobsResponse.json()).length : 0;
      const completionRate = jobsInRange > 0 ? Math.round((completedJobs / jobsInRange) * 100) : 0;

      // Compute deltas vs previous period of same length
      const ms = end.getTime() - start.getTime() + 1;
      const prevStart = new Date(start.getTime() - ms);
      // Build daily revenue series for sparkline (after paymentsRes)
      const days = [];
      const dayMs = 24*60*60*1000;
      for (let d = new Date(start); d <= end; d = new Date(d.getTime()+dayMs)) {
        days.push(d.toISOString().slice(0,10));
      }
      const daily = Object.fromEntries(days.map(d => [d, 0]));
      const paysForSeries = paysArr;
      paysForSeries.forEach(p => {
        const day = new Date(p.paid_at).toISOString().slice(0,10);
        if (daily[day] != null) daily[day] += (Number(p.amount) > 0 ? Number(p.amount) : 0);
      });
      const revenueSeries = days.map(d => daily[d] || 0);

      const prevEnd = new Date(end.getTime() - ms);

      const prevJobsRes = await supaFetch(
        `work_orders?select=id&status=in.(SCHEDULED,IN_PROGRESS,COMPLETED)&created_at=gte.${formatDate(prevStart)}&created_at=lte.${formatDate(prevEnd)}`,
        { method: 'GET' }, user.company_id
      );
      const prevJobs = prevJobsRes.ok ? (await prevJobsRes.json()).length : 0;

      const prevPaymentsRes = await supaFetch(
        `payments?select=amount,paid_at&paid_at=gte.${toISO(prevStart)}&paid_at=lt.${toISO(new Date(prevEnd.getTime()+1))}`,
        { method: 'GET' }, user.company_id
      );
      let prevRevenue = 0;
      if (prevPaymentsRes.ok) {
        const prevPays = await prevPaymentsRes.json();
        prevRevenue = prevPays.reduce((sum, p) => sum + (Number(p.amount) > 0 ? Number(p.amount) : 0), 0);
      // Build monthly series and store
      let monthlySeries = [];
      try {
        monthlySeries = await (async (companyId) => {
          const now = new Date();
          const months = [];
          for (let i = 12; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ key: d.toISOString().slice(0,7), label: d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear().toString().slice(2), value: 0 });
          }
          const startIso = new Date(now.getFullYear(), now.getMonth() - 12, 1).toISOString();
          const endIso = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
          const res = await supaFetch(`payments?select=amount,paid_at&paid_at=gte.${startIso}&paid_at=lt.${endIso}`, { method: 'GET' }, companyId);
          if (res.ok) {
            const pays = await res.json();
            pays.forEach(p => {
              const key = new Date(p.paid_at).toISOString().slice(0,7);
              const row = months.find(r => r.key === key);
              if (row) row.value += (Number(p.amount) > 0 ? Number(p.amount) : 0);
            });
          }
          return months;
        })(user.company_id);
        setDashboardData(prev => ({ ...prev, monthlySeries }));
      } catch {}

      }

      const jobsDeltaPct = prevJobs > 0 ? Math.round(((jobsInRange - prevJobs) / prevJobs) * 100) : null;
      const revDeltaPct = prevRevenue > 0 ? Math.round(((cashRevenue - prevRevenue) / prevRevenue) * 100) : null;

      console.log('📊 KPIs:', { activeEmployees, jobsInRange, cashRevenue, completionRate, jobsDeltaPct, revDeltaPct });

      await loadAdvancedKPIs(formatDate, start, end, {
        activeEmployees,
        jobsThisWeek: jobsInRange,
        monthlyRevenue: cashRevenue,
        completionRate,
        jobsDeltaPct,
        revDeltaPct,
        revenueSeries
      });
      // Build monthly series and store
      try {
        const monthlySeries = await (async (companyId) => {
          const now = new Date();
          const months = [];
          for (let i = 12; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ key: d.toISOString().slice(0,7), label: d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear().toString().slice(2), value: 0 });
          }
          const startIso = new Date(now.getFullYear(), now.getMonth() - 12, 1).toISOString();
          const endIso = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
          const res = await supaFetch(`payments?select=amount,paid_at&paid_at=gte.${startIso}&paid_at=lt.${endIso}`, { method: 'GET' }, companyId);
          if (res.ok) {
            const pays = await res.json();
            pays.forEach(p => {
              const key = new Date(p.paid_at).toISOString().slice(0,7);
              const row = months.find(r => r.key === key);
              if (row) row.value += (Number(p.amount) > 0 ? Number(p.amount) : 0);
            });
          }
          return months;
        })(user.company_id);
        setDashboardData(prev => ({ ...prev, monthlySeries }));
      } catch {}


    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const loadAdvancedKPIs = async (formatDate, start, end, basicKPIs) => {
    try {
      // 5) Unscheduled Jobs (jobs that are scheduled but don't have a specific start time)
      // ✅ FIXED: Use lowercase 'scheduled' (enum cleanup)
      const unscheduledResponse = await supaFetch(
        'work_orders?select=id&status=eq.scheduled',
        { method: 'GET' }, user.company_id
      );
      const unscheduledJobs = unscheduledResponse.ok ? (await unscheduledResponse.json()).length : 0;

      // 6) Outstanding (true balances) + A/R Aging - FIXED: removed due_at field
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

      // 8) Overdue Jobs (created before today, not completed)
      // ✅ FIXED: Use lowercase status values (enum cleanup)
      const todayStr = formatDate(new Date());
      const overdueResponse = await supaFetch(
        `work_orders?select=id&created_at=lt.${todayStr}&status=in.(scheduled,in_progress)`,
        { method: 'GET' }, user.company_id
      );
      // 10) Funnel counts (quotes/jobs in range)
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
      // Get completed jobs data once and reuse it
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

      // 11) Leaderboard: top technicians by completed jobs in range
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

      // Resolve technician names for leaderboard using industry standard pattern
      if (leaderboard.length) {
        const techIds = leaderboard.map(t => t.techId).join(',');
        const usersRes = await supaFetch(`user_profiles?select=user_id,full_name,first_name,last_name&user_id=in.(${techIds})`, { method: 'GET' }, user.company_id);
        if (usersRes.ok) {
          const users = await usersRes.json();
          const nameById = new Map(users.map(u => [u.user_id, u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Technician']));
          leaderboard = leaderboard.map(t => ({ ...t, name: nameById.get(t.techId) || t.techId }));
        }
      }

      const overdueJobs = overdueResponse.ok ? (await overdueResponse.json()).length : 0;

      // 9) Technician Utilization: use estimated_duration since start_time/end_time don't exist
      const woDurRes = await supaFetch(
        `work_orders?select=estimated_duration&status=in.(SCHEDULED,IN_PROGRESS,COMPLETED)&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
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
      // Capacity = activeEmployees * 8h * weekdays in range
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

      // Load marketplace KPIs
      const marketplaceKPIs = await loadMarketplaceKPIs(formatDate, start, end);

      console.log('📈 Advanced KPIs loaded:', { unscheduledJobs, outstandingInvoices, quoteConversionRate, overdueJobs, arAging, utilizationPct, scheduledHours, capacityHours, ...marketplaceKPIs });

      // Load recent activity
      await loadRecentActivity();

      // Set all dashboard data
      setDashboardData({
        ...basicKPIs,
        unscheduledJobs,
        outstandingInvoices,
        quoteConversionRate,
        overdueJobs,
        // Phase 1.5 fields
        arAging,
        utilizationPct,
        scheduledHours,
        capacityHours,
        // Sparkline series and Phase 3
        revenueSeries: basicKPIs.revenueSeries || [],
        funnel,
        leaderboard,
        // Marketplace KPIs
        ...marketplaceKPIs,
        loading: false
      });

    } catch (error) {
      console.error('Error loading advanced KPIs:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const loadMarketplaceKPIs = async (formatDate, start, end) => {
    try {
      // Load marketplace requests in date range
      const requestsResponse = await supaFetch(
        `marketplace_requests?select=id,status,budget,created_at&company_id=eq.${user.company_id}&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );

      // Load marketplace responses in date range
      const responsesResponse = await supaFetch(
        `marketplace_responses?select=id,response_status,proposed_rate,created_at&company_id=eq.${user.company_id}&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );

      // Load marketplace revenue (from work orders created from marketplace)
      const marketplaceRevenueResponse = await supaFetch(
        `work_orders?select=total_amount,marketplace_request_id&company_id=eq.${user.company_id}&status=eq.PAID&marketplace_request_id=not.is.null&created_at=gte.${formatDate(start)}&created_at=lte.${formatDate(end)}`,
        { method: 'GET' }, user.company_id
      );

      const requests = requestsResponse.ok ? await requestsResponse.json() : [];
      const responses = responsesResponse.ok ? await responsesResponse.json() : [];
      const revenueData = marketplaceRevenueResponse.ok ? await marketplaceRevenueResponse.json() : [];

      const marketplaceRequests = requests.length;
      const marketplaceResponses = responses.length;
      const acceptedResponses = responses.filter(r => r.response_status === 'accepted').length;
      const marketplaceConversionRate = marketplaceResponses > 0 ? Math.round((acceptedResponses / marketplaceResponses) * 100) : 0;
      const marketplaceRevenue = revenueData.reduce((sum, order) => sum + (order.total_amount || 0), 0);

      return {
        marketplaceRequests,
        marketplaceResponses,
        marketplaceConversionRate,
        marketplaceRevenue
      };
    } catch (error) {
      console.error('Error loading marketplace KPIs:', error);
      return {
        marketplaceRequests: 0,
        marketplaceResponses: 0,
        marketplaceConversionRate: 0,
        marketplaceRevenue: 0
      };
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Get recent work orders across all stages, sorted by updated_at
      const response = await supaFetch(
        'work_orders?select=id,title,status,updated_at,customers(name)&order=updated_at.desc&limit=5',
        { method: 'GET' }, user.company_id
      );

      if (response.ok) {
        const workOrders = await response.json();
        const activities = workOrders.map(wo => {
          let message = '';
          let icon = DocumentTextIcon;

          // Generate activity message based on status
          if (['QUOTE', 'SENT', 'ACCEPTED', 'REJECTED'].includes(wo.status)) {
            if (wo.status === 'ACCEPTED') {
              message = `Quote #${wo.id} accepted by ${wo.customers?.name || 'Customer'}`;
              icon = ChartBarIcon;
            } else if (wo.status === 'SENT') {
              message = `Quote #${wo.id} sent to ${wo.customers?.name || 'Customer'}`;
              icon = DocumentTextIcon;
            } else {
              message = `Quote #${wo.id} created for ${wo.customers?.name || 'Customer'}`;
              icon = DocumentTextIcon;
            }
          } else if (['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'INVOICED'].includes(wo.status)) {
            if (wo.status === 'COMPLETED') {
              message = `Job #${wo.id} completed for ${wo.customers?.name || 'Customer'}`;
              icon = ChartBarIcon;
            } else if (wo.status === 'IN_PROGRESS') {
              message = `Job #${wo.id} started for ${wo.customers?.name || 'Customer'}`;
              icon = ClockIcon;
            } else {
              message = `Job #${wo.id} scheduled for ${wo.customers?.name || 'Customer'}`;
              icon = CalendarDaysIcon;
            }
          } else if (['INVOICED', 'PAID'].includes(wo.status)) {
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
        console.log('📋 Recent activity loaded:', activities.length, 'items');
      }
    } catch (error) {
      console.error('Error loading recent activity:', error);
      setRecentActivity([]);
    }
  };

  // Original KPIs
  const primaryStats = [
    {
      title: 'Active Employees',
      value: dashboardData.loading ? '-' : dashboardData.activeEmployees.toString(),
      change: showCompare ? (dashboardData.loading || dashboardData.jobsDeltaPct == null ? null : `${Math.abs(dashboardData.jobsDeltaPct)}% vs prev`) : null,
      changeType: showCompare ? (dashboardData.jobsDeltaPct == null ? null : (dashboardData.jobsDeltaPct >= 0 ? 'increase' : 'decrease')) : null,
      icon: UsersIcon,
      onClick: () => navigate('/employees')
    },
    {
      title: 'Jobs This Range',
      value: dashboardData.loading ? '-' : dashboardData.jobsThisWeek.toString(),
      change: showCompare ? (dashboardData.loading || dashboardData.jobsDeltaPct == null ? null : `${Math.abs(dashboardData.jobsDeltaPct)}% vs prev`) : null,
      changeType: showCompare ? (dashboardData.jobsDeltaPct == null ? null : (dashboardData.jobsDeltaPct >= 0 ? 'increase' : 'decrease')) : null,
      icon: CalendarDaysIcon,
      onClick: () => navigate('/jobs')
    },
    {
      title: 'Cash Revenue',
      value: dashboardData.loading ? '-' : `$${Number(dashboardData.monthlyRevenue || 0).toLocaleString()}`,
      change: showCompare ? (dashboardData.loading || dashboardData.revDeltaPct == null ? null : `${Math.abs(dashboardData.revDeltaPct)}% vs prev`) : null,
      changeType: showCompare ? (dashboardData.revDeltaPct == null ? null : (dashboardData.revDeltaPct >= 0 ? 'increase' : 'decrease')) : null,
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
      change: null,
      changeType: null,
      icon: ChartBarIcon,
      onClick: () => navigate('/jobs?filter=completed')
    }
  ];





  // Advanced KPIs
  // UI components for Phase 1.5
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

  const advancedStats = [
    {
      title: 'Unscheduled Jobs',
      value: dashboardData.loading ? '-' : dashboardData.unscheduledJobs.toString(),
      change: null,
      changeType: null,
      icon: ExclamationTriangleIcon,
      onClick: () => navigate('/jobs?filter=unscheduled')
    },
    {
      title: 'Outstanding (Balance)',
      value: dashboardData.loading ? '-' : `$${Number(dashboardData.outstandingInvoices || 0).toLocaleString()}`,
      change: null,
      changeType: null,
      icon: BanknotesIcon,
      onClick: () => navigate('/invoices?filter=outstanding')
    },

    {
      title: 'Quote Conversion',
      value: dashboardData.loading ? '-' : `${dashboardData.quoteConversionRate}%`,
      change: null,
      changeType: null,
      icon: ChartPieIcon,
      onClick: () => navigate('/quotes?filter=sent')
    },
    {
      title: 'Overdue Jobs',
      value: dashboardData.loading ? '-' : dashboardData.overdueJobs.toString(),
      change: null,
      changeType: null,
      icon: CalendarIcon,
      onClick: () => navigate('/jobs?filter=overdue')
    }
  ];

  // Marketplace stats (separate section)
  const marketplaceStats = [
    {
      title: 'Marketplace Requests',
      value: dashboardData.loading ? '-' : dashboardData.marketplaceRequests.toString(),
      change: null,
      changeType: null,
      icon: DocumentTextIcon,
      onClick: () => navigate('/marketplace?tab=my-requests')
    },
    {
      title: 'Marketplace Responses',
      value: dashboardData.loading ? '-' : dashboardData.marketplaceResponses.toString(),
      change: null,
      changeType: null,
      icon: ChatBubbleLeftRightIcon,
      onClick: () => navigate('/marketplace?tab=my-responses')
    },
    {
      title: 'Response Conversion',
      value: dashboardData.loading ? '-' : `${dashboardData.marketplaceConversionRate}%`,
      change: null,
      changeType: null,
      icon: ChartPieIcon,
      onClick: () => navigate('/marketplace?tab=my-responses')
    },
    {
      title: 'Marketplace Revenue',
      value: dashboardData.loading ? '-' : `$${Number(dashboardData.marketplaceRevenue || 0).toLocaleString()}`,
      change: null,
      changeType: null,
      icon: BanknotesIcon,
      onClick: () => navigate('/marketplace')
    }
  ];

  // Helpers
  const fmtMoney = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n || 0));

  const ar = dashboardData.arAging || { bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90_plus: 0 };
  const arTotal = (Number(ar.bucket0_30)||0) + (Number(ar.bucket31_60)||0) + (Number(ar.bucket61_90)||0) + (Number(ar.bucket90_plus)||0);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your business today."
      />
      {/* Quick switch to the new dashboards */}
      <div className="mb-4">
        <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5">
          <button onClick={()=>navigate('/my-dashboard')} className="px-3 py-1 text-sm rounded text-gray-600 hover:text-gray-900">My Dashboard</button>
          <button onClick={()=>navigate('/customer-dashboard')} className="px-3 py-1 text-sm rounded text-gray-600 hover:text-gray-900">Customer Dashboard</button>
          <button onClick={()=>navigate('/admin-dashboard')} className="px-3 py-1 text-sm rounded text-gray-600 hover:text-gray-900">Admin Dashboard</button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Range:</span>
          <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5">
            {['TODAY','WEEK','MONTH'].map(p => (
              <button
                key={p}
                onClick={() => setRange({ preset: p, start: null, end: null })}
                className={`px-3 py-1 text-sm rounded ${range.preset === p ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Compare toggle */}
        <div className="mb-4 flex items-center justify-end">
          <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" className="form-checkbox" checked={showCompare} onChange={(e)=>setShowCompare(e.target.checked)} />
            Compare to previous period
          </label>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="mb-6">
      {/* Funnel and Leaderboard */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quote → Job Funnel */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
          {/* Segmented horizontal bar */}
          <div className="mt-4 flex h-3 w-full rounded bg-gray-100 overflow-hidden">
            {[
              { key: 'sent', color: 'bg-blue-300' },
              { key: 'accepted', color: 'bg-green-300' },
              { key: 'scheduled', color: 'bg-amber-300' },
              { key: 'inProgress', color: 'bg-purple-300' },
              { key: 'completed', color: 'bg-gray-400' }
            ].map(({ key, color }) => {
              const total = Object.values(dashboardData.funnel || {}).reduce((s,v)=>s+(v||0),0) || 1;
              const val = (dashboardData.funnel?.[key] || 0);
              const pct = Math.round((val / total) * 100);
      {/* Monthly Revenue (13 months) */}
      <div className="mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue (Last 13 Months)</h3>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={(dashboardData.monthlySeries || []).map((d,idx)=>({ ...d, idx }))} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={1} />
                <YAxis tickFormatter={(v)=>`$${(v/1000).toFixed(0)}k`} width={50} />
                <RTooltip formatter={(v)=>[`$${Number(v).toLocaleString()}`, 'Revenue']} labelFormatter={(l, payload)=>payload?.[0]?.payload?.label || l} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="url(#monthlyGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

              return (
                <div key={key} title={`${key}: ${val}`} className={`${color}`} style={{ width: `${pct}%` }} />
              );
            })}
          </div>

            <h3 className="text-lg font-semibold text-gray-900">Pipeline</h3>
            <button onClick={() => navigate('/quotes')} className="text-sm text-gray-600 hover:text-gray-900">View</button>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Quotes Sent', value: dashboardData.funnel.sent, to: '/quotes?status=SENT' },
              { label: 'Quotes Accepted', value: dashboardData.funnel.accepted, to: '/quotes?status=ACCEPTED' },
              { label: 'Jobs Scheduled', value: dashboardData.funnel.scheduled, to: '/jobs?filter=scheduled' },
              { label: 'In Progress', value: dashboardData.funnel.inProgress, to: '/jobs?filter=in_progress' },
              { label: 'Completed', value: dashboardData.funnel.completed, to: '/jobs?filter=completed' }
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <div className="text-sm text-gray-700">{row.label}</div>
                <button onClick={() => navigate(row.to)} className="text-sm font-medium text-gray-900 hover:underline">{row.value}</button>
              </div>
            ))}
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

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* A/R donut with legend */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <div className="flex items-center justify-center">
              <div
                className="w-28 h-28 rounded-full"
                style={{
                  background: `conic-gradient(#93C5FD 0 ${Math.round((Number(ar.bucket0_30)||0)/ (arTotal||1) * 360)}deg, #FBBF24 0 ${Math.round(((Number(ar.bucket0_30)||0)+(Number(ar.bucket31_60)||0))/ (arTotal||1) * 360)}deg, #C4B5FD 0 ${Math.round(((Number(ar.bucket0_30)||0)+(Number(ar.bucket31_60)||0)+(Number(ar.bucket61_90)||0))/ (arTotal||1) * 360)}deg, #FCA5A5 0 360deg)`
                }}
              >
              </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 gap-2">
              {[
                { label: '0–30', key: 'aging_0_30', color: 'bg-blue-300' },
                { label: '31–60', key: 'aging_31_60', color: 'bg-amber-300' },
                { label: '61–90', key: 'aging_61_90', color: 'bg-purple-300' },
                { label: '90+', key: 'aging_90_plus', color: 'bg-red-300' }
              ].map(l => (
                <button key={l.key} onClick={() => navigate(`/invoices?filter=${l.key}`)} className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                  <span className={`inline-block w-3 h-3 rounded ${l.color}`} /> {l.label}
                </button>
              ))}
            </div>
          </div>

          {primaryStats.map((stat) => (
            <StatCard key={`primary-${stat.title}`} {...stat} loading={dashboardData.loading} />
          ))}
        </div>
      </div>

      {/* Advanced KPI Stats Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advancedStats.map((stat) => (
            <StatCard key={`advanced-${stat.title}`} {...stat} />
          ))}
        </div>
      </div>

      {/* Marketplace KPI Stats Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Marketplace Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketplaceStats.map((stat) => (
            <StatCard key={`marketplace-${stat.title}`} {...stat} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/employees?new=employee')}
              className="flex items-center justify-center gap-2 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200 text-primary-700"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Add Employee</span>
            </button>
            <button
              onClick={() => navigate('/quotes?new=quote')}
              className="flex items-center justify-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 text-green-700"
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Create Quote</span>
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-blue-700"
            >
              <CalendarDaysIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Schedule Job</span>
            </button>
            <button
              onClick={() => navigate('/employees')}
              className="flex items-center justify-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 text-orange-700"
            >
              <UserGroupIcon className="w-5 h-5" />
              <span className="text-sm font-medium">View Team</span>
            </button>
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
          {/* Donut-style proportion bar */}
          <div className="mt-4 flex items-center gap-3">
            {[
              { label: '0–30', val: ar.bucket0_30, color: 'bg-blue-300' },
              { label: '31–60', val: ar.bucket31_60, color: 'bg-amber-300' },
              { label: '61–90', val: ar.bucket61_90, color: 'bg-purple-300' },
              { label: '90+', val: ar.bucket90_plus, color: 'bg-red-300' }
            ].map((b) => {
              const total = arTotal || 1;
              const pct = Math.round(((Number(b.val)||0) / total) * 100);
              return (
                <div key={b.label} className="text-center">
                  <div className={`h-3 rounded ${b.color}`} style={{ width: `${Math.max(8, pct)}px` }} title={`${b.label}: ${fmtMoney(b.val)} (${pct}%)`} />
                  <div className="text-xs text-gray-500 mt-1">{b.label}</div>
                </div>
              );
            })}
          </div>

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
      {/* Skeletons for Advanced KPIs & Recent Activity when loading */}
      {dashboardData.loading && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card">
              <div className="animate-pulse h-6 w-28 bg-gray-100 rounded mb-3" />
              <div className="animate-pulse h-8 w-32 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

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

      {/* Business Tools */}
      <div className="mb-6">
        <div className="card">
          <div className="text-center py-8">
            <CurrencyDollarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Business Tools</h3>
            <p className="text-sm text-gray-500 mb-4">
              Manage integrations and business tools to streamline your operations.
            </p>
            <button
              onClick={() => navigate('/settings?tab=integrations')}
              className="btn-primary"
            >
              Manage Integrations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



export default Dashboard;
