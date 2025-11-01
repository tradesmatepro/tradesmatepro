import React, { useState } from 'react';
import {
  BriefcaseIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  PlayIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const JobsStats = ({ jobs }) => {
  const totalJobs = jobs.length;

  // Unscheduled jobs (no start_time)
  const unscheduledJobs = jobs.filter(j => !j.start_time).length;

  // Scheduled today (start_time is today)
  const today = new Date().toDateString();
  const scheduledToday = jobs.filter(j => {
    if (!j.start_time) return false;
    return new Date(j.start_time).toDateString() === today;
  }).length;

  // Total value of all jobs
  const totalValue = jobs.reduce((sum, j) => sum + (parseFloat(j.total_amount) || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <BriefcaseIcon className="w-8 h-8 text-blue-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{totalJobs}</div>
            <div className="text-sm text-gray-500">Total Jobs</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <ClockIcon className="w-8 h-8 text-orange-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{unscheduledJobs}</div>
            <div className="text-sm text-gray-500">Unscheduled Jobs</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <CalendarIcon className="w-8 h-8 text-green-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{scheduledToday}</div>
            <div className="text-sm text-gray-500">Scheduled Today</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <CurrencyDollarIcon className="w-8 h-8 text-purple-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};


export const JobsStatsClickable = ({ stats, onClick }) => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
    {[
      { key: 'total', label: 'Total Jobs', value: stats.total, color: 'text-gray-700', bg: 'bg-gray-100' },
      { key: 'unscheduled', label: 'Unscheduled', value: stats.unscheduled, color: 'text-orange-700', bg: 'bg-orange-50' },
      { key: 'scheduled', label: 'Scheduled', value: stats.scheduled, color: 'text-blue-700', bg: 'bg-blue-50' },
      { key: 'inProgress', label: 'In Progress', value: stats.inProgress, color: 'text-purple-700', bg: 'bg-purple-50' },
      { key: 'completed', label: 'Completed', value: stats.completed, color: 'text-green-700', bg: 'bg-green-50' },
    ].map(item => (
      <button key={item.key} className={`rounded-lg border border-gray-200 p-4 text-left ${item.bg}`} onClick={() => onClick && onClick(item.key)}>
        <div className="text-2xl font-bold">{item.value}</div>
        <div className={`text-sm ${item.color}`}>{item.label}</div>
      </button>
    ))}
  </div>
);

export const JobsUtilization = ({ jobs, employees, datePreset }) => {
  const getPresetRange = (preset) => {
    const now = new Date();
    if (preset === 'TODAY') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start); end.setHours(23,59,59,999);
      return { start, end };
    }
    if (preset === 'MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999);
      return { start, end };
    }
    if (preset === 'ALL') return { start: new Date(2000,0,1), end: new Date(2100,0,1) };
    // WEEK default: Monday-Sunday of current week
    const day = now.getDay(); // 0 Sun ... 6 Sat
    const diffToMon = (day === 0 ? -6 : 1 - day);
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon);
    const end = new Date(start); end.setDate(start.getDate()+6); end.setHours(23,59,59,999);
    return { start, end };
  };

  const countWeekdays = (start, end) => {
    let d = new Date(start);
    let count = 0;
    while (d <= end) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) count++;
      d.setDate(d.getDate()+1);
    }
    return count;
  };

  const { start, end } = getPresetRange(datePreset || 'WEEK');
  const techCount = (employees || []).length;
  const weekdays = countWeekdays(start, end);
  const capacityHours = techCount * 8 * weekdays;
  const scheduledHours = (jobs || []).filter(j => j.start_time && new Date(j.start_time) >= start && new Date(j.start_time) <= end)
    .reduce((sum, j) => sum + Number(j.estimated_duration || 0), 0);
  const pct = capacityHours > 0 ? Math.min(100, Math.round((scheduledHours / capacityHours) * 100)) : 0;

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">Utilization</div>
        <div className="text-sm text-gray-800">{scheduledHours}h / {capacityHours}h</div>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded">
        <div className={`h-3 rounded ${pct > 90 ? 'bg-red-500' : pct > 75 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-gray-500">{pct}% of capacity for {datePreset || 'WEEK'}</div>
    </div>
  );
};

export const JobsFiltersBar = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, datePreset, setDatePreset, techFilter, setTechFilter, employees }) => (
  <div className="card mb-6">
    <div className="flex flex-col lg:flex-row gap-4 items-center">
      <div className="flex-1 w-full">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by job, ID, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <FunnelIcon className="w-4 h-4 text-gray-500" />
        <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300">
          <option value="all">All</option>
          <option value="unscheduled">Unscheduled</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-gray-500" />
        <select value={datePreset} onChange={(e)=>setDatePreset(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300">
          <option value="TODAY">Today</option>
          <option value="WEEK">This Week</option>
          <option value="MONTH">This Month</option>
          <option value="ALL">All Time</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <UserIcon className="w-4 h-4 text-gray-500" />
        <select value={techFilter} onChange={(e)=>setTechFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300">
          <option value="all">All Techs</option>
          {employees.map(e => (
            <option key={e.id} value={e.id}>{e.full_name}</option>
          ))}
        </select>
      </div>
    </div>
    {/* Quick chips */}
    <div className="mt-4 flex flex-wrap gap-2 text-xs">
      {[
        {v:'all', label:'All'},
        {v:'unscheduled', label:'Unscheduled'},
        {v:'scheduled', label:'Scheduled'},
        {v:'in_progress', label:'In Progress'},
        {v:'completed', label:'Completed'},
      ].map(item => (
        <button
          key={item.v}
          onClick={() => setStatusFilter(item.v)}
          className={`px-3 py-1 rounded-full border ${statusFilter===item.v?'bg-gray-200 border-gray-300 text-gray-900':'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-gray-300`}
        >
          {item.label}
        </button>
      ))}
      <span className="mx-2 text-gray-300">|</span>
      {[
        {v:'TODAY', label:'Today'},
        {v:'WEEK', label:'Week'},
        {v:'MONTH', label:'Month'},
        {v:'ALL', label:'All'},
      ].map(item => (
        <button
          key={item.v}
          onClick={() => setDatePreset(item.v)}
          className={`px-3 py-1 rounded-full border ${datePreset===item.v?'bg-gray-200 border-gray-300 text-gray-900':'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-gray-300`}
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>
);

export const JobsSearchFilter = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => (
  <div className="card mb-6">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by job name, job ID, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <FunnelIcon className="w-4 h-4 text-gray-500" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Jobs</option>
          <option value="unscheduled">Unscheduled</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>
    </div>
  </div>
);

export const JobsTable = ({ jobs, customers, employees, loading, openEditForm, deleteJob, onCreateInvoice, onScheduleJob, onAllocateInventory, onConfirmUsage }) => {
  const [expanded, setExpanded] = useState({});
  const toggleExpanded = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const fmtTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const fmtDate = (ts) => ts ? new Date(ts).toLocaleDateString() : '';
  const fmtDateNice = (ts) => ts ? new Date(ts).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : '';
  const durationHours = (start, end) => {
    if (!start || !end) return 0;
    const ms = new Date(end) - new Date(start);
    return Math.max(0, Math.round(ms / 36e5));
  };
  const relativeTime = (ts) => {
    if (!ts) return '—';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  };

  // naive conflict: same tech overlapping time ranges on same day
  const getConflicts = (job) => {
    if (!job.start_time || !job.end_time || !job.assigned_technician_id) return [];
    const tech = job.assigned_technician_id;
    const start = new Date(job.start_time);
    const end = new Date(job.end_time);
    const dayKey = start.toDateString();
    return (jobs || [])
      .filter(j => j.id !== job.id && j.assigned_technician_id === tech && j.start_time && j.end_time)
      .filter(j => new Date(j.start_time).toDateString() === dayKey)
      .filter(j => {
        const s = new Date(j.start_time); const e = new Date(j.end_time);
        return s < end && e > start; // overlap
      })
      .slice(0, 3);
  };



  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const getTechnicianName = (techId) => {
    const tech = employees.find(e => e.id === techId);
    return tech ? tech.full_name : 'Unassigned';
  };

  const getSchedulingStatus = (job) => {
    // 1) Invoiced overrides scheduling status
    if (job.invoice_id || job.job_status === 'INVOICED') {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Invoiced'
      };
    }

    // 2) Use the unified job_status field that handles both job_status and work_status
    const currentStatus = job.job_status;
    const isScheduled = job.start_time && String(job.start_time).trim() !== '';

    // Show actual status for scheduled jobs
    if (isScheduled) {
      const statusConfig = {
        'ASSIGNED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Scheduled' }, // Show "Scheduled" instead of "Assigned"
        'IN_PROGRESS': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Progress' },
        'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
        'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
      };

      const config = statusConfig[currentStatus];
      if (config) {
        return config;
      }

      // Fallback for scheduled jobs without specific status
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Scheduled'
      };
    }

    // Unscheduled jobs - show job status or default
    if (currentStatus === 'DRAFT') {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Draft'
      };
    }

    return {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: 'Unscheduled'
    };
  };

  const getStatusBadge = (job) => {
    const config = getSchedulingStatus(job);
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
        {config.label === 'Invoiced' && job.invoice_number && (
          <span className="ml-2 text-gray-700">#{job.invoice_number}</span>
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-gray-500">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technician
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500 mb-2">No jobs found</div>
                  <div className="text-sm text-gray-400">Jobs appear here when quotes are accepted</div>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <React.Fragment key={job.id}>
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {job.title || job.job_title || `Job #${job.id}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {job.id}
                      </div>
                      {(job.street_address || job.city || job.job_location) && (
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPinIcon className="w-4 h-4" />
                          {job.street_address ?
                            `${job.street_address}, ${job.city || ''} ${job.state || ''} ${job.zip_code || ''}`.trim() :
                            job.job_location
                          }
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getCustomerName(job.customer_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-700">
                        {(getTechnicianName(job.assigned_technician_id) || '?').slice(0,1)}
                      </div>
                      {getTechnicianName(job.assigned_technician_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(job)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {job.start_time ? (
                        <>
                          <div className="text-sm">{fmtDateNice(job.start_time)}</div>
                          <div className="text-xs text-gray-500">
                            {fmtTime(job.start_time)}{job.end_time && ` - ${fmtTime(job.end_time)}`}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Not scheduled</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(job.total_amount || job.total_cost || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(job)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit job"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>

                      {/* Schedule button when not scheduled */}
                      {!job.start_time && (
                        <button
                          onClick={() => onScheduleJob && onScheduleJob(job)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Schedule job"
                        >
                          <CalendarIcon className="w-4 h-4" />
                        </button>
                      )}

                      {/* Reschedule button when scheduled */}
                      {job.start_time && (
                        <button
                          onClick={() => onScheduleJob && onScheduleJob(job)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Reschedule job"
                        >
                          <CalendarIcon className="w-4 h-4" />
                        </button>
                      )}

                      {/* Start button for SCHEDULED jobs */}
                      {job.job_status === 'SCHEDULED' && (
                        <button
                          onClick={() => {
                            // Update job status to IN_PROGRESS
                            console.log('Starting job:', job.id);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Start job"
                        >
                          <PlayIcon className="w-4 h-4" />
                        </button>
                      )}

                      {/* Open Invoice quick link if linked */}
                      {job.invoice_id && (
                        <a
                          href={`/invoices?view=${job.invoice_id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Open invoice"
                        >
                          <CurrencyDollarIcon className="w-4 h-4" />
                        </a>
                      )}

                      {/* Invoice button for COMPLETED jobs (show if not invoiced yet) */}
                      {job.job_status === 'COMPLETED' && !job.invoice_id && (
                        <button
                          onClick={() => onCreateInvoice && onCreateInvoice(job)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Create invoice"
                        >
                          <CurrencyDollarIcon className="w-4 h-4" />
                        </button>
                      )}

                      {/* Allocate Inventory button for JOB stage */}
                      {job.stage === 'JOB' && (
                        <button
                          onClick={() => onAllocateInventory && onAllocateInventory(job)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Allocate Inventory"
                        >
                          <ClipboardDocumentListIcon className="w-4 h-4" />
                        </button>
                      )}

                      {/* Confirm Usage button for WORK stage */}
                      {job.stage === 'WORK' && (
                        <button
                          onClick={() => onConfirmUsage && onConfirmUsage(job)}
                          className="text-green-600 hover:text-green-900"
                          title="Confirm Material Usage"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteJob(job.id, job.job_title)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete job"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>

                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => toggleExpanded(job.id)}
                        title={expanded[job.id] ? 'Hide details' : 'Show details'}
                      >
                        <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${expanded[job.id] ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded[job.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan="7" className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-700">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Planned vs Scheduled</div>
                          <div>
                            {Number(job.estimated_duration || 0)}h est · {durationHours(job.start_time, job.end_time)}h scheduled
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Crew</div>
                          <div>{getTechnicianName(job.assigned_technician_id)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">When</div>
                          <div>
                            {job.start_time ? `${fmtDateNice(job.start_time)} · ${fmtTime(job.start_time)} - ${fmtTime(job.end_time)}` : 'Not scheduled'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Conflicts</div>
                          {(() => { const c = getConflicts(job); return c.length ? (
                            <ul className="list-disc list-inside text-xs text-gray-600">
                              {c.map(x => (
                                <li key={x.id} title={`${fmtDateNice(x.start_time)} · ${fmtTime(x.start_time)} - ${fmtTime(x.end_time)}`}>
                                  Overlaps with #{x.id}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-xs text-gray-400">None</div>
                          ); })()}
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Last activity</div>
                          <div className="text-xs text-gray-600">{relativeTime(job.updated_at || job.created_at)}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Alert = ({ alert }) => {
  if (!alert.show) return null;

  return (
    <div className={`alert mb-6 ${alert.type === 'error' ? 'alert-error' : 'alert-success'}`}>
      {alert.message}
    </div>
  );
};
