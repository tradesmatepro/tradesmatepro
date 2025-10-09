// PTO Reports - Comprehensive reporting interface for PTO analytics
import React, { useState, useEffect } from 'react';
import PTOServiceProduction from '../../services/PTOServiceProduction';
import PTOAccrualEngine from '../../services/PTOAccrualEngine';
import {
  DocumentChartBarIcon,
  CalendarDaysIcon,
  UsersIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const PTOReports = () => {
  const [activeReport, setActiveReport] = useState('summary');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    end: new Date().toISOString().split('T')[0] // Today
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [activeReport, dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Load different data based on active report
      switch (activeReport) {
        case 'summary':
          await loadSummaryReport();
          break;
        case 'usage':
          await loadUsageReport();
          break;
        case 'accrual':
          await loadAccrualReport();
          break;
        case 'balance':
          await loadBalanceReport();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummaryReport = async () => {
    const [requests, balances] = await Promise.all([
      PTOServiceProduction.getRequests(),
      PTOServiceProduction.getAllBalances()
    ]);

    const summary = {
      totalEmployees: balances.length,
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'PENDING').length,
      approvedRequests: requests.filter(r => r.status === 'APPROVED').length,
      deniedRequests: requests.filter(r => r.status === 'DENIED').length,
      totalVacationHours: balances.reduce((sum, b) => sum + (b.vacation_balance || 0), 0),
      totalSickHours: balances.reduce((sum, b) => sum + (b.sick_balance || 0), 0),
      avgVacationBalance: balances.length > 0 
        ? balances.reduce((sum, b) => sum + (b.vacation_balance || 0), 0) / balances.length 
        : 0,
      avgSickBalance: balances.length > 0 
        ? balances.reduce((sum, b) => sum + (b.sick_balance || 0), 0) / balances.length 
        : 0
    };

    setReportData(summary);
  };

  const loadUsageReport = async () => {
    const requests = await PTOServiceProduction.getRequests({
      start_date: dateRange.start,
      end_date: dateRange.end,
      status: 'APPROVED'
    });

    const usage = {
      totalHoursUsed: requests.reduce((sum, r) => sum + (r.hours_approved || 0), 0),
      vacationHoursUsed: requests
        .filter(r => r.accrual_type === 'vacation')
        .reduce((sum, r) => sum + (r.hours_approved || 0), 0),
      sickHoursUsed: requests
        .filter(r => r.accrual_type === 'sick')
        .reduce((sum, r) => sum + (r.hours_approved || 0), 0),
      personalHoursUsed: requests
        .filter(r => r.accrual_type === 'personal')
        .reduce((sum, r) => sum + (r.hours_approved || 0), 0),
      requestsByMonth: getRequestsByMonth(requests),
      topUsers: getTopUsers(requests)
    };

    setReportData(usage);
  };

  const loadAccrualReport = async () => {
    const report = await PTOAccrualEngine.generateAccrualReport(
      null, // company_id - will be handled by service
      dateRange.start,
      dateRange.end
    );
    setReportData(report);
  };

  const loadBalanceReport = async () => {
    const balances = await PTOServiceProduction.getAllBalances();
    
    const balanceAnalysis = {
      balances,
      highVacationBalances: balances.filter(b => (b.vacation_balance || 0) > 80),
      lowVacationBalances: balances.filter(b => (b.vacation_balance || 0) < 10),
      maxVacationBalance: Math.max(...balances.map(b => b.vacation_balance || 0)),
      minVacationBalance: Math.min(...balances.map(b => b.vacation_balance || 0)),
      balanceDistribution: getBalanceDistribution(balances)
    };

    setReportData(balanceAnalysis);
  };

  const getRequestsByMonth = (requests) => {
    const monthlyData = {};
    requests.forEach(request => {
      const month = new Date(request.starts_at).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, hours: 0 };
      }
      monthlyData[month].count++;
      monthlyData[month].hours += request.hours_approved || 0;
    });
    return monthlyData;
  };

  const getTopUsers = (requests) => {
    const userUsage = {};
    requests.forEach(request => {
      const userId = request.employee_id;
      if (!userUsage[userId]) {
        userUsage[userId] = {
          employee_name: request.employee_name,
          hours: 0,
          requests: 0
        };
      }
      userUsage[userId].hours += request.hours_approved || 0;
      userUsage[userId].requests++;
    });

    return Object.values(userUsage)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10);
  };

  const getBalanceDistribution = (balances) => {
    const ranges = {
      '0-20': 0,
      '21-40': 0,
      '41-80': 0,
      '81-120': 0,
      '120+': 0
    };

    balances.forEach(balance => {
      const vacation = balance.vacation_balance || 0;
      if (vacation <= 20) ranges['0-20']++;
      else if (vacation <= 40) ranges['21-40']++;
      else if (vacation <= 80) ranges['41-80']++;
      else if (vacation <= 120) ranges['81-120']++;
      else ranges['120+']++;
    });

    return ranges;
  };

  const exportReport = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pto-${activeReport}-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const reports = [
    { id: 'summary', name: 'Summary', icon: ChartBarIcon },
    { id: 'usage', name: 'Usage Analysis', icon: CalendarDaysIcon },
    { id: 'accrual', name: 'Accrual Report', icon: ClockIcon },
    { id: 'balance', name: 'Balance Analysis', icon: UsersIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">PTO Reports</h2>
        <div className="flex items-center space-x-4">
          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={exportReport}
            disabled={!reportData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`${
                activeReport === report.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <report.icon className="h-4 w-4 mr-2" />
              {report.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Report Content */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeReport === 'summary' && reportData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <UsersIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Employees</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.totalEmployees}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <DocumentChartBarIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Requests</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.totalRequests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Vacation Balance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {PTOServiceProduction.formatBalance(reportData.avgVacationBalance)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <ClockIcon className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Sick Balance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {PTOServiceProduction.formatBalance(reportData.avgSickBalance)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Request Status Breakdown */}
                <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Request Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="text-sm font-medium text-green-600">{reportData.approvedRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="text-sm font-medium text-yellow-600">{reportData.pendingRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Denied</span>
                      <span className="text-sm font-medium text-red-600">{reportData.deniedRequests}</span>
                    </div>
                  </div>
                </div>

                {/* Balance Summary */}
                <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Total Balances</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Vacation Hours</span>
                      <span className="text-sm font-medium text-blue-600">
                        {PTOServiceProduction.formatBalance(reportData.totalVacationHours)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Sick Hours</span>
                      <span className="text-sm font-medium text-red-600">
                        {PTOServiceProduction.formatBalance(reportData.totalSickHours)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'usage' && reportData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Total Hours Used</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {PTOServiceProduction.formatBalance(reportData.totalHoursUsed)}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Vacation Hours</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {PTOServiceProduction.formatBalance(reportData.vacationHoursUsed)}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sick Hours</h3>
                    <p className="text-3xl font-bold text-red-600">
                      {PTOServiceProduction.formatBalance(reportData.sickHoursUsed)}
                    </p>
                  </div>
                </div>

                {/* Top Users */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Top PTO Users</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {reportData.topUsers.map((user, index) => (
                      <div key={index} className="px-6 py-4 flex justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{user.employee_name}</p>
                          <p className="text-sm text-gray-500">{user.requests} requests</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {PTOServiceProduction.formatBalance(user.hours)} hrs
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'balance' && reportData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-600">High Balances</h3>
                    <p className="text-2xl font-bold text-amber-600">
                      {reportData.highVacationBalances.length}
                    </p>
                    <p className="text-xs text-gray-500">Over 80 hours</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-600">Low Balances</h3>
                    <p className="text-2xl font-bold text-red-600">
                      {reportData.lowVacationBalances.length}
                    </p>
                    <p className="text-xs text-gray-500">Under 10 hours</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-600">Highest Balance</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {PTOServiceProduction.formatBalance(reportData.maxVacationBalance)}
                    </p>
                    <p className="text-xs text-gray-500">hours</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-600">Lowest Balance</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {PTOServiceProduction.formatBalance(reportData.minVacationBalance)}
                    </p>
                    <p className="text-xs text-gray-500">hours</p>
                  </div>
                </div>

                {/* Balance Distribution */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Balance Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(reportData.balanceDistribution).map(([range, count]) => (
                      <div key={range} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{range} hours</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(count / reportData.balances.length) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PTOReports;
