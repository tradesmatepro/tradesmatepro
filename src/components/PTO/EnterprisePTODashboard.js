import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  TrendingUpIcon,
  CogIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const EnterprisePTODashboard = ({ user }) => {
  const [balances, setBalances] = useState([]);
  const [accrualRuns, setAccrualRuns] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.company_id) {
      loadDashboardData();
    }
  }, [user?.company_id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load real-time balances
      const balancesRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/rpc/calculate_pto_balance?p_employee_id=${user.id}&p_category_code=VAC`, {
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        }
      });
      
      if (balancesRes.ok) {
        const balancesData = await balancesRes.json();
        setBalances(balancesData);
      }

      // Load recent accrual runs
      const runsRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/pto_accrual_runs?company_id=eq.${user.company_id}&order=created_at.desc&limit=5`, {
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        }
      });
      
      if (runsRes.ok) {
        const runsData = await runsRes.json();
        setAccrualRuns(runsData);
      }

      // Load policies
      const policiesRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/pto_accrual_policies?company_id=eq.${user.company_id}&is_active=eq.true`, {
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        }
      });
      
      if (policiesRes.ok) {
        const policiesData = await policiesRes.json();
        setPolicies(policiesData);
      }

    } catch (error) {
      console.error('Error loading enterprise PTO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAccrualProcess = async () => {
    try {
      // Calculate current pay period
      const today = new Date();
      const payStart = new Date(today);
      payStart.setDate(today.getDate() - today.getDay()); // Start of week
      const payEnd = new Date(payStart);
      payEnd.setDate(payStart.getDate() + 13); // Biweekly

      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/rpc/process_pto_accruals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          p_company_id: user.company_id,
          p_pay_period_start: payStart.toISOString().split('T')[0],
          p_pay_period_end: payEnd.toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        alert('Accrual processing completed successfully!');
        loadDashboardData(); // Refresh data
      } else {
        alert('Error processing accruals');
      }
    } catch (error) {
      console.error('Error running accrual process:', error);
      alert('Error running accrual process');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <ClockIcon className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading enterprise PTO data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUpIcon className="w-6 h-6" />
          Enterprise PTO System
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={runAccrualProcess}
            className="btn-primary flex items-center gap-2"
          >
            <PlayIcon className="w-4 h-4" />
            Run Accrual Process
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <CogIcon className="w-4 h-4" />
            Manage Policies
          </button>
        </div>
      </div>

      {/* Real-Time Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['VAC', 'SICK', 'PERS'].map(category => {
          const categoryBalance = balances.find(b => b.category_code === category) || {};
          return (
            <div key={category} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {category === 'VAC' ? 'Vacation' : category === 'SICK' ? 'Sick Leave' : 'Personal'}
                </h3>
                <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Balance:</span>
                  <span className="font-semibold text-green-600">
                    {categoryBalance.current_balance || 0} hrs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending Requests:</span>
                  <span className="font-semibold text-yellow-600">
                    {categoryBalance.pending_requests || 0} hrs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Available:</span>
                  <span className="font-semibold text-blue-600">
                    {categoryBalance.available_balance || 0} hrs
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>YTD Accrued: {categoryBalance.ytd_accrued || 0} hrs</span>
                    <span>YTD Used: {categoryBalance.ytd_used || 0} hrs</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accrual Policies */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <CogIcon className="w-5 h-5" />
          Active Accrual Policies
        </h3>
        
        <div className="space-y-4">
          {policies.map(policy => (
            <div key={policy.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{policy.policy_name}</h4>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  {policy.category_code}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Accrual Method:</span>
                  <div className="font-medium">{policy.accrual_method}</div>
                </div>
                <div>
                  <span className="text-gray-600">Frequency:</span>
                  <div className="font-medium">{policy.accrual_frequency}</div>
                </div>
                <div>
                  <span className="text-gray-600">Max Hours:</span>
                  <div className="font-medium">{policy.max_accrual_hours || 'Unlimited'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Carryover:</span>
                  <div className="font-medium">{policy.max_carryover_hours} hrs</div>
                </div>
              </div>
              
              {/* Accrual Tiers */}
              {policy.accrual_tiers && policy.accrual_tiers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-600 mb-2 block">Accrual Tiers:</span>
                  <div className="flex flex-wrap gap-2">
                    {policy.accrual_tiers.map((tier, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                        {tier.min_months}-{tier.max_months || '∞'} months: {tier.hours_per_period} hrs/period
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Accrual Runs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5" />
          Recent Accrual Processing
        </h3>
        
        <div className="space-y-3">
          {accrualRuns.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No accrual runs yet. Click "Run Accrual Process" to start.
            </div>
          ) : (
            accrualRuns.map(run => (
              <div key={run.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className={`w-5 h-5 ${
                    run.status === 'COMPLETED' ? 'text-green-500' : 
                    run.status === 'RUNNING' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900">
                      {run.pay_period_start} to {run.pay_period_end}
                    </div>
                    <div className="text-sm text-gray-600">
                      {run.employees_processed} employees • {run.total_hours_accrued} hours accrued
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    run.status === 'COMPLETED' ? 'text-green-600' : 
                    run.status === 'RUNNING' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {run.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(run.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterprisePTODashboard;
