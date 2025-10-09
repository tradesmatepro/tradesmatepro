import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../contexts/UserContext';

const SchemaTest = () => {
  const { user } = useUser();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testQueries = async () => {
    if (!user?.company_id) return;
    
    setLoading(true);
    const testResults = {};

    try {
      // Test 1: Check service_categories table
      console.log('Testing service_categories...');
      const { data: categories, error: catError } = await supabase
        .from('service_categories')
        .select('*')
        .limit(5);
      
      testResults.categories = {
        success: !catError,
        error: catError?.message,
        data: categories,
        count: categories?.length || 0
      };

      // Test 2: Check service_types table structure
      console.log('Testing service_types...');
      const { data: serviceTypes, error: serviceError } = await supabase
        .from('service_types')
        .select('*')
        .limit(5);
      
      testResults.serviceTypes = {
        success: !serviceError,
        error: serviceError?.message,
        data: serviceTypes,
        count: serviceTypes?.length || 0
      };

      // Test 3: Check service_types with category join
      console.log('Testing service_types with category join...');
      const { data: joinData, error: joinError } = await supabase
        .from('service_types')
        .select(`
          *,
          service_categories (
            name,
            company_id
          )
        `)
        .limit(5);
      
      testResults.joinQuery = {
        success: !joinError,
        error: joinError?.message,
        data: joinData,
        count: joinData?.length || 0
      };

      // Test 4: Check companies table
      console.log('Testing companies...');
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id, name, industry')
        .eq('id', user.company_id)
        .single();
      
      testResults.company = {
        success: !companyError,
        error: companyError?.message,
        data: company
      };

    } catch (error) {
      console.error('Test error:', error);
      testResults.generalError = error.message;
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.company_id) {
      testQueries();
    }
  }, [user?.company_id]);

  if (!user) {
    return <div className="p-4">Please log in to test schema</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Database Schema Test</h2>
      <p className="text-gray-600 mb-4">Company ID: {user.company_id}</p>
      
      <button 
        onClick={testQueries}
        disabled={loading}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run Tests'}
      </button>

      <div className="space-y-4">
        {Object.entries(results).map(([testName, result]) => (
          <div key={testName} className="border rounded p-4">
            <h3 className="font-bold text-lg mb-2">
              {testName}: {result.success ? '✅ Success' : '❌ Failed'}
            </h3>
            
            {result.error && (
              <div className="text-red-600 mb-2">
                <strong>Error:</strong> {result.error}
              </div>
            )}
            
            {result.count !== undefined && (
              <div className="text-blue-600 mb-2">
                <strong>Records found:</strong> {result.count}
              </div>
            )}
            
            {result.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-gray-700">View Data</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemaTest;
