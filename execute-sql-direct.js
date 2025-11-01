/**
 * Execute SQL via Supabase Management API
 * Uses the access token to execute SQL through Supabase
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function executeSql() {
  try {
    // Load credentials
    const credPath = path.join(__dirname, 'AIDevTools', 'credentials.json');
    const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));

    const accessToken = creds.supabase.accessToken;
    const projectRef = creds.supabase.projectRef;

    if (!accessToken || accessToken.includes('YOUR_')) {
      throw new Error('Missing or invalid Supabase access token in credentials.json');
    }

    if (!projectRef) {
      throw new Error('Missing Supabase project reference');
    }

    console.log('🔧 Executing SQL via Supabase Management API...\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'sql files', 'create_get_schedulable_employees_rpc.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📋 SQL to execute:');
    console.log(sql.substring(0, 200) + '...\n');

    // Execute via Supabase Management API
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ SQL executed successfully!\n');
    console.log('📊 Result:', result);

  } catch (error) {
    console.error('❌ Error:', error.message);
    try {
      const credPath = path.join(__dirname, 'AIDevTools', 'credentials.json');
      const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      console.log('\n📋 Manual SQL Execution Required:');
      console.log('1. Go to: https://app.supabase.com/project/' + (creds?.supabase?.projectRef || 'YOUR_PROJECT'));
      console.log('2. Click "SQL Editor"');
      console.log('3. Click "New Query"');
      console.log('4. Copy content from: sql files/create_get_schedulable_employees_rpc.sql');
      console.log('5. Click "Run"');
    } catch (e) {
      console.log('\n📋 Manual SQL Execution Required');
    }
  }
}

executeSql();

