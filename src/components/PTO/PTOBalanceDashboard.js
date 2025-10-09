import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
// import { supaFetch } from '../../utils/supaFetch'; // DISABLED - using mock data
import {
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const PTOBalanceDashboard = ({ onRequestPTO }) => {
  const { user } = useUser();
  const [balances, setBalances] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.company_id) {
      loadPTOData();
    }
  }, [user?.company_id]);

  const loadPTOData = async () => {
    try {
      setLoading(true);

      // TRY REAL DATABASE FIRST, FALLBACK TO MOCK
      try {
        // Load PTO categories
        const categoriesRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/pto_categories?select=*&is_active=eq.true&order=name`, {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          }
        });

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        } else {
          throw new Error('Categories not found');
        }

        // Load current balances from ledger-based view
        const balancesRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/pto_current_balances_v?employee_id=eq.${user.id}&company_id=eq.${user.company_id}&select=*`, {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          }
        });

        if (balancesRes.ok) {
          const balancesData = await balancesRes.json();
          setBalances(balancesData);
        } else {
          throw new Error('Balances not found');
        }

        // Load ONLY FUTURE/PENDING requests (NO HISTORICAL CLUTTER)
        const today = new Date().toISOString().split('T')[0];
        const requestsRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/pto_requests?employee_id=eq.${user.id}&or=(status.eq.PENDING,start_date.gte.${today})&order=start_date.asc&limit=5`, {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          }
        });

        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setRecentRequests(requestsData);
        } else {
          throw new Error('Requests not found');
        }

        console.log('✅ Real PTO data loaded successfully');

      } catch (dbError) {
        console.log('⚠️ Database not ready:', dbError.message);

        // NO MOCK DATA - Show empty state
        setCategories([]);
        setBalances([]);
        setRecentRequests([]);
      }

    } catch (error) {
      console.error('Error loading PTO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBalanceForCategory = (categoryCode) => {
    const balance = balances.find(b => b.category_code === categoryCode);
    return balance ? Number(balance.current_balance || 0) : 0;
  };

  const getCategoryByCode = (code) => {
    return categories.find(c => c.code === code) || { name: code, color: '#6B7280' };
  };

  const formatHours = (hours) => {
    const h = Number(hours || 0);
    if (h === 0) return '0 hrs';
    if (h < 8) return `${h.toFixed(1)} hrs`;
    const days = Math.floor(h / 8);
    const remainingHours = h % 8;
    if (remainingHours === 0) return `${days} day${days !== 1 ? 's' : ''}`;
    return `${days}d ${remainingHours.toFixed(1)}h`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'DENIED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PTO Balances */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Your PTO Balances
          </h3>
          <button
            onClick={onRequestPTO}
            className="btn-primary btn-sm flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Request Time Off
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No PTO categories configured</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const balance = getBalanceForCategory(category.code);
              const isLow = balance < 8; // Less than 1 day
              
              return (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    {isLow && (
                      <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatHours(balance)}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Available balance
                  </div>
                  
                  {isLow && balance > 0 && (
                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Low balance
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5" />
          Recent Requests
        </h3>

        {recentRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recent PTO requests</p>
            <button
              onClick={onRequestPTO}
              className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Submit your first request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((request) => {
              const category = getCategoryByCode(request.category_code);
              const startDate = new Date(request.start_date);
              const endDate = new Date(request.end_date);
              
              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        {request.hours_requested && (
                          <span className="ml-2">
                            ({formatHours(request.hours_requested)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PTOBalanceDashboard;
