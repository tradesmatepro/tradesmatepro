import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import { ClockIcon, PlayIcon as StartIcon, PauseIcon, CheckCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

function isoDateRange(preset, customDate = null) {
  const now = new Date();
  let start, end;
  if (preset === 'TODAY') {
    start = new Date(now); start.setHours(0,0,0,0);
    end = new Date(now); end.setHours(23,59,59,999);
  } else if (preset === 'TOMORROW') {
    const t = new Date(now); t.setDate(now.getDate()+1);
    start = new Date(t); start.setHours(0,0,0,0);
    end = new Date(t); end.setHours(23,59,59,999);
  } else if (preset === 'WEEK') {
    start = new Date(now); start.setHours(0,0,0,0); start.setDate(now.getDate() - now.getDay());
    end = new Date(start); end.setDate(start.getDate()+6); end.setHours(23,59,59,999);
  } else if (preset === 'CUSTOM' && customDate) {
    const t = new Date(customDate);
    start = new Date(t); start.setHours(0,0,0,0);
    end = new Date(t); end.setHours(23,59,59,999);
  } else {
    start = new Date(now); start.setHours(0,0,0,0);
    end = new Date(now); end.setHours(23,59,59,999);
  }
  return { startISO: start.toISOString(), endISO: end.toISOString(), start, end };
}

export default function MyJobsTodayWidget() {
  const { user } = useUser();
  const [preset, setPreset] = useState('TODAY');
  const [customDate, setCustomDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null); // open timesheet entry
  const [employeeId, setEmployeeId] = useState(null);

  const { startISO, endISO } = useMemo(() => isoDateRange(preset, customDate), [preset, customDate]);

  useEffect(() => {
    if (!user?.company_id || !user?.id) return;
    (async () => {
      try {
        setLoading(true);

        // ✅ INDUSTRY STANDARD FIX: Load jobs directly from work_orders (single source of truth)
        // Calendar is for JOBS, not employee schedules
        // Query: work_orders where assigned_to = current_user AND scheduled_start IS NOT NULL

        // 1) Load work orders assigned to current user in date range
        const woRes = await supaFetch(
          `work_orders?assigned_to=eq.${user.id}&scheduled_start=not.is.null&scheduled_end=gte.${startISO}&scheduled_start=lte.${endISO}&order=scheduled_start.asc&select=id,title,status,scheduled_start,scheduled_end,actual_start,actual_end,customer_id`,
          { method: 'GET' }, user.company_id
        );
        const workOrders = woRes.ok ? await woRes.json() : [];
        console.log('✅ My Jobs loaded from work_orders:', workOrders.length);

        // 2) Resolve employee_id for current user (for timesheet)
        const empRes = await supaFetch(`employees?select=id,user_id&user_id=eq.${user.id}&limit=1`, { method: 'GET' }, user.company_id);
        const empArr = empRes.ok ? await empRes.json() : [];
        const empId = empArr?.[0]?.id || null;
        setEmployeeId(empId);

        // 3) Load current open timesheet (for sticky timer)
        let current = null;
        if (empId) {
          const tsRes = await supaFetch(
            `employee_timesheets?employee_id=eq.${empId}&clock_out=is.null&order=clock_in.desc&limit=1`,
            { method: 'GET' }, user.company_id
          );
          if (tsRes.ok) {
            const arr = await tsRes.json();
            current = arr?.[0] || null;
          }
        }
        setCurrentEntry(current);

        // 4) Format rows (work_orders are already the source of truth)
        const combined = workOrders.map(wo => ({
          event: {
            id: wo.id,
            work_order_id: wo.id,
            start_time: wo.scheduled_start,
            end_time: wo.scheduled_end,
            status: wo.status
          },
          workOrder: wo
        }));
        setRows(combined);
      } catch (e) {
        console.error('MyJobsToday load error', e);
        setRows([]);
        setCurrentEntry(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.company_id, user?.id, startISO, endISO]);

  const refresh = () => {
    // Trigger reload by toggling preset (cheap way) or you can refactor to extract load function
    setPreset(p => p);
  };

  const callRpc = async (name, workOrderId) => {
    const body = { p_work_order: workOrderId };
    const res = await supaFetch(`rpc/${name}`, { method: 'POST', body }, user.company_id);
    if (!res.ok) {
      const txt = await res.text();
      console.warn(`${name} failed`, res.status, txt);
    }
    refresh();
  };

  const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const elapsedSince = (iso) => {
    if (!iso) return '';
    const ms = Date.now() - new Date(iso).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const currentTimer = currentEntry ? (
    <div className="sticky top-2 z-10 p-3 rounded-md border border-blue-200 bg-blue-50 text-blue-800 flex items-center gap-3">
      <ClockIcon className="w-5 h-5" />
      <div className="text-sm">
        Currently on job • Started {fmtTime(currentEntry.clock_in)} • {elapsedSince(currentEntry.clock_in)} elapsed
      </div>
    </div>
  ) : null;

  return (
    <div className="mb-8">
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">My Jobs</h3>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5">
              {['TODAY','TOMORROW','WEEK'].map(p => (
                <button key={p} onClick={()=>setPreset(p)} className={`px-3 py-1 text-sm rounded ${preset===p?'bg-gray-100 text-gray-900':'text-gray-600 hover:text-gray-900'}`}>{p==='WEEK'?'Week':p.charAt(0)+p.slice(1).toLowerCase()}</button>
              ))}
              <button onClick={()=>setPreset('CUSTOM')} className={`px-3 py-1 text-sm rounded ${preset==='CUSTOM'?'bg-gray-100 text-gray-900':'text-gray-600 hover:text-gray-900'}`}>Custom</button>
            </div>
            {preset==='CUSTOM' && (
              <input type="date" value={customDate} onChange={e=>setCustomDate(e.target.value)} className="text-sm border border-gray-200 rounded px-2 py-1" />
            )}
          </div>
        </div>

        {currentTimer}

        {loading ? (
          <div className="py-6 text-sm text-gray-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="py-6 text-sm text-gray-500">No jobs in this range.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rows.map(({ event, workOrder }) => {
              const inProgress = (event?.status || '').toLowerCase() === 'in_progress';
              const completed = (event?.status || '').toLowerCase() === 'completed';
              return (
                <div key={event.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{workOrder?.title || `Work Order ${event.work_order_id}`}</div>
                    <div className="text-xs text-gray-500">{fmtTime(event.start_time)} – {fmtTime(event.end_time)} • {workOrder?.status || event?.status || ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!inProgress && !completed && (
                      <button onClick={()=>callRpc('on_my_way', event.work_order_id)} className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 inline-flex items-center gap-1">
                        <ArrowRightOnRectangleIcon className="w-4 h-4" /> On my way
                      </button>
                    )}

                    {!inProgress && !completed && (
                      <button onClick={()=>callRpc('start_job_now', event.work_order_id)} className="px-2 py-1 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100 inline-flex items-center gap-1">
                        <StartIcon className="w-4 h-4" /> Start
                      </button>
                    )}

                    {inProgress && (
                      <button onClick={()=>callRpc('pause_job_now', event.work_order_id)} className="px-2 py-1 text-xs rounded bg-amber-50 text-amber-700 hover:bg-amber-100 inline-flex items-center gap-1">
                        <PauseIcon className="w-4 h-4" /> Pause
                      </button>
                    )}

                    {!completed && (
                      <button onClick={()=>callRpc('complete_job_now', event.work_order_id)} className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" /> Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

