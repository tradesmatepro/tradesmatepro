import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
// import { supaFetch } from '../../utils/supaFetch'; // DISABLED - using mock data
import {
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const PTOManagement = () => {
  const { user } = useUser();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [teamBalances, setTeamBalances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');

  useEffect(() => {
    if (user?.company_id) {
      loadPTOData();
    }
  }, [user?.company_id]);

  const loadPTOData = async () => {
    try {
      setLoading(true);

      // TRY REAL DATABASE - No mock data fallback
      console.log('Loading real PTO management data...');

      // Load employees from real database
      try {
        const employeesRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/users?select=id,full_name,role&active=eq.true&order=full_name`, {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          }
        });

        if (employeesRes.ok) {
          const employeesData = await employeesRes.json();
          setEmployees(employeesData);
        }
      } catch (error) {
        console.error('Error loading employees:', error);
        setEmployees([]);
      }

      // Load PTO categories from real database
      try {
        const categoriesRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/pto_categories?select=*&is_active=eq.true&order=name`, {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          }
        });

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      }

      // Load pending requests from real database
      try {
        const requestsRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/pto_requests?status=eq.PENDING&select=*&order=created_at.asc`, {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          }
        });

        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setPendingRequests(requestsData);
        }
      } catch (error) {
        console.error('Error loading requests:', error);
        setPendingRequests([]);
      }

      // Load team balances from unified view (CONSOLIDATED APPROACH)
      try {
        const balancesRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/pto_current_balances_v?select=*&company_id=eq.${user.company_id}`, {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          }
        });

        if (balancesRes.ok) {
          const balancesData = await balancesRes.json();
          setTeamBalances(balancesData);
        }
      } catch (error) {
        console.error('Error loading balances:', error);
        setTeamBalances([]);
      }

    } catch (error) {
      console.error('Error loading mock PTO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.full_name || 'Unknown Employee';
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

  const handleApproveRequest = async (requestId) => {
    try {
      console.log('Mock: Approving request', requestId);

      // Mock approval - just remove from pending list
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));

      // Show success message (you'd need to add this to the component)
      alert('Request approved successfully! (Mock mode)');

    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleDenyRequest = async (requestId, reason = '') => {
    try {
      console.log('Mock: Denying request', requestId, 'Reason:', reason);

      // Mock denial - just remove from pending list
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));

      // Show success message
      alert('Request denied successfully! (Mock mode)');

    } catch (error) {
      console.error('Error denying request:', error);
    }
  };

  const getEmployeeBalances = (employeeId) => {
    return teamBalances.filter(b => b.employee_id === employeeId);
  };

  const getTotalBalanceForEmployee = (employeeId) => {
    const balances = getEmployeeBalances(employeeId);
    return balances.reduce((total, balance) => total + Number(balance.current_balance || 0), 0);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserGroupIcon className="w-6 h-6" />
          PTO Management
        </h2>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'pending'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Requests ({pendingRequests.length})
            </button>
            <button
              onClick={() => setSelectedTab('balances')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'balances'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Team Balances
            </button>
          </nav>
        </div>
      </div>

      {/* Pending Requests Tab */}
      {selectedTab === 'pending' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Pending Approval
          </h3>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No pending PTO requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => {
                const category = getCategoryByCode(request.category_code);
                const employeeName = getEmployeeName(request.employee_id);
                const startDate = new Date(request.start_date);
                const endDate = new Date(request.end_date);
                
                return (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium text-gray-900">{employeeName}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{category.name}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Dates:</strong> {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Hours:</strong> {formatHours(request.hours_requested)}
                        </div>
                        
                        {request.reason && (
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Reason:</strong> {request.reason}
                          </div>
                        )}
                        
                        {request.notes && (
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Notes:</strong> {request.notes}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Submitted {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="btn-sm bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                        >
                          <CheckIcon className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDenyRequest(request.id)}
                          className="btn-sm bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          Deny
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Team Balances Tab */}
      {selectedTab === 'balances' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Team PTO Balances
          </h3>

          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No employees found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => {
                const balances = getEmployeeBalances(employee.id);
                const totalBalance = getTotalBalanceForEmployee(employee.id);
                const hasLowBalance = balances.some(b => Number(b.current_balance || 0) < 8);
                
                return (
                  <div
                    key={employee.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{employee.full_name}</span>
                        <span className="text-sm text-gray-500">{employee.role}</span>
                        {hasLowBalance && (
                          <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: {formatHours(totalBalance)}
                      </div>
                    </div>
                    
                    {balances.length === 0 ? (
                      <div className="text-sm text-gray-500">No PTO balances</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {balances.map((balance) => {
                          const category = getCategoryByCode(balance.category_code);
                          const hours = Number(balance.current_balance || 0);
                          const isLow = hours < 8;
                          
                          return (
                            <div
                              key={`${employee.id}-${balance.category_code}`}
                              className={`p-3 rounded-md border ${
                                isLow ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  {category.name}
                                </span>
                              </div>
                              <div className={`text-lg font-semibold ${
                                isLow ? 'text-amber-700' : 'text-gray-900'
                              }`}>
                                {formatHours(hours)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PTOManagement;
