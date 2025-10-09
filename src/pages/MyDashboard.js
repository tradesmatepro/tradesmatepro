import React, { useEffect, useState } from 'react';
import PageHeader from '../components/Common/PageHeader';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import { useNavigate } from 'react-router-dom';
import {
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowRightIcon,
  BanknotesIcon,
  BeakerIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function MyDashboard(){
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Enhanced state for competitive dashboard
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [scheduledHours, setScheduledHours] = useState(40); // Default 40hr week
  const [ptoBalances, setPtoBalances] = useState([]);
  const [nextJob, setNextJob] = useState(null);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => { if (user?.company_id && user?.id) load(); }, [user?.company_id, user?.id]);

  const load = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const [timesheetsRes, ptoRes, nextJobRes, expensesRes, upcomingRes, activityRes] = await Promise.all([
        // Weekly hours from timesheets
        supaFetch(`employee_timesheets?select=total_hours&user_id=eq.${user.id}&work_date=gte.${startOfWeek.toISOString().split('T')[0]}&work_date=lte.${endOfWeek.toISOString().split('T')[0]}`, { method: 'GET' }, user.company_id),
        // PTO balances
        supaFetch(`pto_current_balances?select=category_code,current_balance&employee_id=eq.${user.id}`, { method: 'GET' }, user.company_id),
        // Next job - use status and created_at fields
        supaFetch(`work_orders?select=id,title,created_at,status,customers(name,address)&status=in.(SCHEDULED,IN_PROGRESS)&created_at=gte.${new Date().toISOString()}&order=created_at.asc&limit=1`, { method: 'GET' }, user.company_id),
        // Recent expenses (removed status filter since expenses table doesn't have status column)
        supaFetch(`expenses?select=id,amount,date,description&user_id=eq.${user.id}&order=date.desc&limit=5`, { method: 'GET' }, user.company_id),
        // Upcoming jobs (next 5) - use status and created_at fields
        supaFetch(`work_orders?select=id,title,created_at,status,customers(name,address)&status=in.(SCHEDULED,IN_PROGRESS)&created_at=gte.${new Date().toISOString()}&order=created_at.asc&limit=5`, { method: 'GET' }, user.company_id),
        // Recent activity - mix of timesheets, expenses, PTO
        supaFetch(`employee_timesheets?select=id,work_date,status,total_hours,updated_at&user_id=eq.${user.id}&order=updated_at.desc&limit=3`, { method: 'GET' }, user.company_id)
      ]);

      // Calculate weekly hours
      if (timesheetsRes.ok) {
        const timesheets = await timesheetsRes.json();
        const totalHours = timesheets.reduce((sum, t) => sum + Number(t.total_hours || 0), 0);
        setWeeklyHours(totalHours);
      }

      setPtoBalances(ptoRes.ok ? await ptoRes.json() : []);

      if (nextJobRes.ok) {
        const jobs = await nextJobRes.json();
        setNextJob(jobs[0] || null);
      }

      setPendingExpenses(expensesRes.ok ? await expensesRes.json() : []);
      setUpcomingJobs(upcomingRes.ok ? await upcomingRes.json() : []);

      // Build recent activity feed
      const activities = [];
      if (activityRes.ok) {
        const timesheets = await activityRes.json();
        timesheets.forEach(t => {
          activities.push({
            id: `timesheet-${t.id}`,
            type: 'timesheet',
            message: `Timesheet ${t.status} for ${new Date(t.work_date).toLocaleDateString()}`,
            time: new Date(t.updated_at),
            icon: ClockIcon,
            status: t.status
          });
        });
      }

      // Sort by time and take most recent
      activities.sort((a, b) => b.time - a.time);
      setRecentActivity(activities.slice(0, 5));

    } finally { setLoading(false); }
  };

  // Quick Stats Cards
  const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick, progress }) => (
    <button
      onClick={onClick}
      className={`card hover:shadow-lg transition-all duration-200 text-left ${color} border-l-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-white text-sm font-medium">{title}</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{value}</div>
          {subtitle && <div className="text-white text-opacity-80 text-xs">{subtitle}</div>}
          {progress && (
            <div className="mt-3">
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <div className="text-white text-opacity-80 text-xs mt-1">{Math.round(progress)}% of scheduled</div>
            </div>
          )}
        </div>
      </div>
    </button>
  );

  // Action Button Component
  const ActionButton = ({ title, subtitle, icon: Icon, color, onClick }) => (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 border-dashed ${color} hover:bg-opacity-5 transition-all duration-200 text-left w-full`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('text-', 'bg-')} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('border-', 'text-')}`} />
        </div>
        <div>
          <div className={`font-semibold ${color.replace('border-', 'text-')}`}>{title}</div>
          <div className="text-gray-500 text-sm">{subtitle}</div>
        </div>
      </div>
    </button>
  );

  // Status Chip Component
  const StatusChip = ({ status, type = 'default' }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      submitted: 'bg-blue-100 text-blue-800 border-blue-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
      in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-green-100 text-green-800 border-green-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[status] || colors.default}`}>
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const totalPtoHours = ptoBalances.reduce((sum, b) => sum + Number(b.current_balance || 0), 0);
  const weeklyProgress = scheduledHours > 0 ? (weeklyHours / scheduledHours) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="My Dashboard" subtitle="Your personal workspace" />

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Hours This Week"
          value={loading ? '—' : `${weeklyHours}h`}
          subtitle={`of ${scheduledHours}h scheduled`}
          icon={ClockIcon}
          color="bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500"
          onClick={() => navigate('/my/time')}
          progress={weeklyProgress}
        />
        <StatCard
          title="PTO Available"
          value={loading ? '—' : `${totalPtoHours}h`}
          subtitle={ptoBalances.length > 1 ? `${ptoBalances.length} categories` : 'Ready to use'}
          icon={BeakerIcon}
          color="bg-gradient-to-r from-green-500 to-green-600 border-green-500"
          onClick={() => navigate('/my/time-off')}
        />
        <StatCard
          title="Next Job"
          value={loading ? '—' : nextJob ? 'Today' : 'None'}
          subtitle={nextJob ? nextJob.customers?.name || 'Customer' : 'No jobs scheduled'}
          icon={CalendarDaysIcon}
          color="bg-gradient-to-r from-purple-500 to-purple-600 border-purple-500"
          onClick={() => navigate('/jobs')}
        />
        <StatCard
          title="Pending Expenses"
          value={loading ? '—' : pendingExpenses.length.toString()}
          subtitle={pendingExpenses.length > 0 ? `$${pendingExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0).toFixed(0)} total` : 'All caught up'}
          icon={BanknotesIcon}
          color="bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500"
          onClick={() => navigate('/expenses')}
        />
      </div>

      {/* Action Shortcuts Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton
            title="Submit Timesheet"
            subtitle="Log your hours worked"
            icon={ClockIcon}
            color="border-blue-500 text-blue-600"
            onClick={() => navigate('/my/time')}
          />
          <ActionButton
            title="Request PTO"
            subtitle="Plan your time off"
            icon={BeakerIcon}
            color="border-green-500 text-green-600"
            onClick={() => navigate('/my/time-off')}
          />
          <ActionButton
            title="Submit Expense"
            subtitle="Track business expenses"
            icon={BanknotesIcon}
            color="border-orange-500 text-orange-600"
            onClick={() => navigate('/expenses')}
          />
        </div>
      </div>

      {/* Timeline/Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Jobs</h3>
            <button
              onClick={() => navigate('/jobs')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              View All <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : upcomingJobs.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <div className="text-gray-500 text-sm">No upcoming jobs scheduled</div>
              <button
                onClick={() => navigate('/jobs')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View your schedule
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingJobs.map(job => (
                <div key={job.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{job.title || 'Service Call'}</h4>
                        <StatusChip status={job.job_status?.toLowerCase()} />
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {job.customers?.name || 'Customer'}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          {job.start_time ? new Date(job.start_time).toLocaleDateString() : 'TBD'}
                        </div>
                        {job.customers?.address && (
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            {job.customers.address.split(',')[0]} {/* First part of address */}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button
              onClick={() => navigate('/profile')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              View Profile <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <div className="text-gray-500 text-sm">No recent activity</div>
              <div className="text-gray-400 text-xs mt-1">Your timesheet and expense updates will appear here</div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <activity.icon className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900">{activity.message}</div>
                    <div className="text-xs text-gray-500">{activity.time.toLocaleDateString()}</div>
                  </div>
                  <StatusChip status={activity.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Quick Access */}
      <div className="card bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user?.full_name || 'Employee'}</h3>
              <div className="text-sm text-gray-600 capitalize">{user?.role} • {user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
