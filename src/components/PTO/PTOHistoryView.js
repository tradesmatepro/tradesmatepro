import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import {
  CalendarDaysIcon,
  ClockIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const PTOHistoryView = () => {
  const { user } = useUser();
  const [historicalRequests, setHistoricalRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee_id: '',
    category_code: '',
    status: '',
    start_date: '',
    end_date: '',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    if (user?.company_id) {
      // Only auto-load on initial mount, not on filter changes
      loadHistoricalData();
    }
  }, [user?.company_id]); // Removed filters dependency

  const loadHistoricalData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading PTO historical data...');

      // Try multiple table names to find your PTO data
      const tablesToTry = [
        'employee_time_off', // Your test data might be here
        'pto_requests',      // New PTO system
        'time_off_requests'  // Alternative name
      ];

      let foundData = [];
      let successfulTable = null;

      for (const tableName of tablesToTry) {
        try {
          console.log(`🔍 Trying table: ${tableName}`);

          // Build query with company filter (NO JOIN - that was breaking it)
          let query = `${tableName}?select=*&company_id=eq.${user.company_id}&order=created_at.desc`;

          // Add filters if they exist
          const queryFilters = [];
          if (filters.employee_id) queryFilters.push(`employee_id=eq.${filters.employee_id}`);
          if (filters.status) queryFilters.push(`status=eq.${filters.status}`);

          // Date filtering - try different date column names
          if (filters.start_date) {
            queryFilters.push(`starts_at=gte.${filters.start_date}`);
          }
          if (filters.end_date) {
            queryFilters.push(`starts_at=lte.${filters.end_date}`);
          }

          // Only apply year filter if no specific date range is set
          if (!filters.start_date && !filters.end_date && filters.year) {
            queryFilters.push(`starts_at=gte.${filters.year}-01-01`);
            queryFilters.push(`starts_at=lte.${filters.year}-12-31`);
          }

          // If no filters at all, get recent data (last 2 years)
          if (!filters.start_date && !filters.end_date && !filters.year) {
            const twoYearsAgo = new Date().getFullYear() - 2;
            queryFilters.push(`starts_at=gte.${twoYearsAgo}-01-01`);
          }

          if (queryFilters.length > 0) {
            query += '&' + queryFilters.join('&');
          }

          console.log(`🔍 Query: ${query}`);

          const response = await fetch(`https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/${query}`, {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Found ${data.length} records in ${tableName}:`, data);

            // Log the field names to understand the schema
            if (data.length > 0) {
              console.log(`🔍 Available fields in ${tableName}:`, Object.keys(data[0]));
              console.log(`🔍 Sample record:`, data[0]);

              foundData = data;
              successfulTable = tableName;
              break; // Found data, stop trying other tables
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ ${tableName} failed:`, response.status, errorText);
          }
        } catch (tableError) {
          console.log(`❌ Error with ${tableName}:`, tableError.message);
        }
      }

      if (foundData.length > 0) {
        console.log(`✅ Successfully loaded ${foundData.length} PTO records from ${successfulTable}`);

        // Always fetch employee names separately (since we removed the JOIN)
        console.log(`🔍 Fetching employee names for ${foundData.length} records...`);
        await enrichWithEmployeeNames(foundData);

        setHistoricalRequests(foundData);
      } else {
        console.log('⚠️ No PTO data found in any table');
        setHistoricalRequests([]);
      }

      // Load employees and categories for filters from real database
      loadRealFilterData();

    } catch (error) {
      console.error('Error loading historical data:', error);
      setHistoricalRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch employee names separately and enrich the PTO data
  const enrichWithEmployeeNames = async (ptoRecords) => {
    try {
      console.log('🔍 Fetching employee names...');

      // Get unique employee IDs
      const employeeIds = [...new Set(ptoRecords.map(record => record.employee_id).filter(Boolean))];
      console.log('🔍 Employee IDs to lookup:', employeeIds);

      if (employeeIds.length === 0) return;

      // Fetch employee data
      const employeeQuery = `users?select=id,full_name,email&id=in.(${employeeIds.map(id => `"${id}"`).join(',')})`;
      console.log('🔍 Employee query:', employeeQuery);

      const response = await fetch(`https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/${employeeQuery}`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
        }
      });

      if (response.ok) {
        const employees = await response.json();
        console.log('✅ Fetched employee data:', employees);

        // Create a lookup map
        const employeeMap = {};
        employees.forEach(emp => {
          employeeMap[emp.id] = emp;
        });

        // Enrich PTO records with employee data
        ptoRecords.forEach(record => {
          if (record.employee_id && employeeMap[record.employee_id]) {
            record.users = employeeMap[record.employee_id];
          }
        });

        console.log('✅ Enriched PTO records with employee names');
      } else {
        console.error('❌ Failed to fetch employee data:', response.status);
      }
    } catch (error) {
      console.error('❌ Error enriching employee names:', error);
    }
  };

  // Special function to load ALL data without any filters
  const loadAllDataWithoutFilters = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading ALL PTO data with NO FILTERS...');

      const tablesToTry = [
        'employee_time_off',
        'pto_requests',
        'time_off_requests'
      ];

      let foundData = [];
      let successfulTable = null;

      for (const tableName of tablesToTry) {
        try {
          console.log(`🔍 Trying table: ${tableName} (NO FILTERS)`);

          // ONLY filter by company - no date, employee, or status filters (NO JOIN)
          let query = `${tableName}?select=*&company_id=eq.${user.company_id}&order=created_at.desc`;

          console.log(`🔍 Query (NO FILTERS): ${query}`);

          const response = await fetch(`https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/${query}`, {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Found ${data.length} records in ${tableName} (NO FILTERS):`, data);

            if (data.length > 0) {
              console.log(`🔍 Available fields in ${tableName}:`, Object.keys(data[0]));
              console.log(`🔍 Sample record:`, data[0]);

              foundData = data;
              successfulTable = tableName;
              break;
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ ${tableName} failed:`, response.status, errorText);
          }
        } catch (tableError) {
          console.log(`❌ Error with ${tableName}:`, tableError.message);
        }
      }

      if (foundData.length > 0) {
        console.log(`✅ Successfully loaded ${foundData.length} PTO records from ${successfulTable} (NO FILTERS)`);

        // Always enrich with employee names (since we removed the JOIN)
        console.log(`🔍 Fetching employee names for ${foundData.length} records...`);
        await enrichWithEmployeeNames(foundData);

        setHistoricalRequests(foundData);
      } else {
        console.log('⚠️ No PTO data found in any table (even with NO FILTERS)');
        setHistoricalRequests([]);
      }

    } catch (error) {
      console.error('Error loading all data:', error);
      setHistoricalRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRealFilterData = async () => {
    // Load real employees for filters
    try {
      const employeesRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/users?select=id,full_name&active=eq.true&order=full_name`, {
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
      console.error('Error loading employees for filters:', error);
      setEmployees([]);
    }

    // Load real categories for filters
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
      console.error('Error loading categories for filters:', error);
      setCategories([]);
    }
  };

  const formatHours = (hours) => {
    const h = Number(hours || 0);
    if (h === 0) return '0 hrs';
    return `${h} hrs`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'DENIED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (categoryCode) => {
    const category = categories.find(c => c.code === categoryCode);
    return category?.color || '#6B7280';
  };

  // Helper function to get field values with multiple possible field names
  const getFieldValue = (record, fieldOptions) => {
    for (const field of fieldOptions) {
      if (record[field] !== undefined && record[field] !== null) {
        return record[field];
      }
    }
    return null;
  };

  // Helper function to get employee name from various possible sources
  const getEmployeeName = (record) => {
    // Try different ways to get employee name
    if (record.users?.full_name) return record.users.full_name;
    if (record.employee?.full_name) return record.employee.full_name;
    if (record.full_name) return record.full_name;
    if (record.employee_name) return record.employee_name;
    return `Employee ID: ${record.employee_id || 'Unknown'}`;
  };

  // Helper function to get start date from various possible field names
  const getStartDate = (record) => {
    const startDate = getFieldValue(record, ['start_date', 'starts_at', 'date_from', 'begin_date']);
    return startDate ? new Date(startDate) : null;
  };

  // Helper function to get end date from various possible field names
  const getEndDate = (record) => {
    const endDate = getFieldValue(record, ['end_date', 'ends_at', 'date_to', 'end_date']);
    return endDate ? new Date(endDate) : null;
  };

  // Helper function to get hours from various possible field names
  const getHours = (record) => {
    // Try different hour field names first
    const storedHours = getFieldValue(record, ['hours_requested', 'hours', 'total_hours', 'duration_hours']);

    if (storedHours && storedHours > 0) {
      return storedHours;
    }

    // Check if there's a days field and convert to hours
    const storedDays = getFieldValue(record, ['days_requested', 'days', 'duration_days']);
    if (storedDays && storedDays > 0) {
      return storedDays * 8; // Convert days to business hours
    }

    // If no hours/days field, calculate from dates (assuming 8 hours per business day)
    const startDate = getStartDate(record);
    const endDate = getEndDate(record);

    if (startDate && endDate) {
      // Calculate inclusive days: if start = end, it's 1 day
      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1; // +1 for inclusive range

      console.log(`📅 Date calculation for ${record.id}:`, {
        startDate: startDate.toDateString(),
        endDate: endDate.toDateString(),
        timeDiff: timeDiff,
        daysDiff: daysDiff,
        businessHours: daysDiff * 8
      });

      return daysDiff * 8; // Convert to business hours (8 hours per day)
    }

    return 0;
  };

  // Helper function to get reason/note from various possible field names
  const getReason = (record) => {
    return getFieldValue(record, ['reason', 'note', 'notes', 'description', 'comment']) || '-';
  };

  // Helper function to get category from your actual schema
  const getCategory = (record) => {
    return record.category_code || record.kind || 'PTO';
  };

  const exportToCSV = () => {
    const headers = ['Employee', 'Category', 'Start Date', 'End Date', 'Hours', 'Status', 'Reason'];
    const csvData = [
      headers.join(','),
      ...historicalRequests.map(request => [
        getEmployeeName(request),
        getCategory(request),
        getStartDate(request)?.toLocaleDateString() || 'Invalid',
        getEndDate(request)?.toLocaleDateString() || 'Invalid',
        getHours(request),
        request.status || 'Unknown',
        `"${getReason(request)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pto-history-${filters.year}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="w-6 h-6" />
            PTO History & Reports
          </h2>
          <div className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            ⚠️ Beta: Some old data may show calculated hours
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                loadHistoricalData();
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <ClockIcon className="w-4 h-4" />
              Refresh Data
            </button>

            <button
              onClick={async () => {
                console.log('🔍 TESTING DATABASE CONNECTION...');
                try {
                  const response = await fetch(`https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/employee_time_off?select=count&company_id=eq.${user.company_id}`, {
                    headers: {
                      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
                      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
                    }
                  });

                  if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Database connection OK. Record count:', data);
                    alert(`Database connection OK. Found ${data.length} records for your company.`);
                  } else {
                    const errorText = await response.text();
                    console.log('❌ Database error:', response.status, errorText);
                    alert(`Database error: ${response.status} - ${errorText}`);
                  }
                } catch (error) {
                  console.log('❌ Connection error:', error);
                  alert(`Connection error: ${error.message}`);
                }
              }}
              className="btn-secondary flex items-center gap-2 text-xs"
            >
              🔍 Test DB
            </button>
            <button
              onClick={exportToCSV}
              className="btn-secondary flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Search Controls */}
        <div className="flex items-center justify-between mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                console.log('🔍 Manual search triggered');
                loadHistoricalData();
              }}
              className="btn-primary flex items-center gap-2"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              Search PTO History
            </button>

            <button
              onClick={async () => {
                console.log('🔍 SHOW ALL DATA - Clearing all filters...');
                const clearedFilters = {
                  employee_id: '',
                  category_code: '',
                  status: '',
                  start_date: '',
                  end_date: '',
                  year: ''
                };
                setFilters(clearedFilters);

                // Wait a moment for state to update, then load with no filters
                setTimeout(() => {
                  console.log('🔍 Loading ALL PTO data with no restrictions...');
                  loadAllDataWithoutFilters();
                }, 100);
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <CalendarDaysIcon className="w-4 h-4" />
              Show All Data
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilters({ ...filters, year: new Date().getFullYear() });
              }}
              className="btn-sm btn-secondary"
            >
              This Year
            </button>
            <button
              onClick={() => {
                setFilters({ ...filters, year: new Date().getFullYear() - 1 });
              }}
              className="btn-sm btn-secondary"
            >
              Last Year
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={filters.employee_id}
              onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category_code}
              onChange={(e) => setFilters({ ...filters, category_code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.code} value={cat.code}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="DENIED">Denied</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              min="2020"
              max={new Date().getFullYear() + 1}
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) || new Date().getFullYear() })}
              placeholder={new Date().getFullYear().toString()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Historical Requests ({historicalRequests.length})
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 animate-spin" />
            <p>Loading PTO data...</p>
          </div>
        ) : historicalRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No historical requests found for the selected filters</p>
            <div className="text-xs text-orange-600 mt-2">
              Debug: Company ID: {user?.company_id} | Year: {filters.year || 'All'}
              <br />
              <strong>Click "Search PTO History" or "Show All Data" button above to load data</strong>
              <br />
              Check browser console for detailed logs
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historicalRequests.map((request) => {
                  const startDate = getStartDate(request);
                  const endDate = getEndDate(request);
                  const employeeName = getEmployeeName(request);
                  const hours = getHours(request);
                  const reason = getReason(request);

                  // Debug logging for hours calculation
                  console.log(`🔍 Hours calculation for ${employeeName}:`, {
                    id: request.id,
                    startDate: startDate?.toDateString(),
                    endDate: endDate?.toDateString(),
                    calculatedHours: hours,
                    availableFields: Object.keys(request),
                    possibleHourFields: {
                      hours_requested: request.hours_requested,
                      hours: request.hours,
                      total_hours: request.total_hours,
                      duration_hours: request.duration_hours,
                      days_requested: request.days_requested,
                      days: request.days,
                      duration_days: request.duration_days
                    }
                  });

                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employeeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getCategoryColor(getCategory(request)) }}
                          />
                          {getCategory(request)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {startDate && endDate ? (
                          `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                        ) : startDate ? (
                          startDate.toLocaleDateString()
                        ) : (
                          <span className="text-red-500">Invalid Date</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{formatHours(hours)}</div>
                        {!getFieldValue(request, ['hours_requested', 'hours', 'total_hours']) && startDate && endDate && (
                          <div className="text-xs text-gray-500">
                            (calculated from dates)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {reason}
                        {request.review_notes && (
                          <div className="text-xs text-red-600 mt-1">
                            Note: {request.review_notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PTOHistoryView;
