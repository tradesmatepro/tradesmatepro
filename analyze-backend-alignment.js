#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('\n🔍 ANALYZING BACKEND ALIGNMENT...\n');

// Load schema
const schemaPath = path.join(__dirname, 'Supabase Schema', 'latest.json');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Schema file not found. Run db-dumper first.');
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Group by table
const tables = {};
schema.tables.forEach(col => {
  if (!tables[col.table_name]) {
    tables[col.table_name] = [];
  }
  tables[col.table_name].push(col.column_name);
});

// Key tables to check
const keyTables = [
  'users', 'employees', 'profiles', 'settings', 'company_settings', 
  'business_settings', 'companies', 'work_orders', 'quotes', 'jobs', 
  'invoices', 'schedule_events', 'employee_availability', 'employee_time_off'
];

console.log('=== KEY TABLES ANALYSIS ===\n');
keyTables.forEach(table => {
  if (tables[table]) {
    console.log(`✅ ${table}: ${tables[table].length} columns`);
    console.log(`   ${tables[table].slice(0, 8).join(', ')}`);
  } else {
    console.log(`❌ ${table}: MISSING`);
  }
  console.log('');
});

// Check for duplicates
console.log('\n=== POTENTIAL DUPLICATES/OVERLAPS ===\n');
const settingsTables = Object.keys(tables).filter(t => t.includes('setting'));
console.log(`Settings tables: ${settingsTables.join(', ')}`);

const userTables = Object.keys(tables).filter(t => t.includes('user') || t.includes('profile'));
console.log(`User-related tables: ${userTables.join(', ')}`);

const workOrderTables = Object.keys(tables).filter(t => t.includes('work_order') || t.includes('quote') || t.includes('job'));
console.log(`Work order related: ${workOrderTables.join(', ')}`);

// Check employees table structure
console.log('\n=== EMPLOYEES TABLE STRUCTURE ===\n');
if (tables.employees) {
  const empCols = tables.employees;
  console.log(`Total columns: ${empCols.length}`);
  console.log(`Has user_id: ${empCols.includes('user_id') ? '✅' : '❌'}`);
  console.log(`Has is_schedulable: ${empCols.includes('is_schedulable') ? '✅' : '❌'}`);
  console.log(`Has job_title: ${empCols.includes('job_title') ? '✅' : '❌'}`);
  console.log(`Has hourly_rate: ${empCols.includes('hourly_rate') ? '✅' : '❌'}`);
}

// Check for RPC functions
console.log('\n=== RPC FUNCTIONS ===\n');
const functions = schema.functions || [];
const rpcFunctions = functions.filter(f => f.routine_name && f.routine_name.includes('get_'));
console.log(`Total functions: ${functions.length}`);
console.log(`RPC-like functions: ${rpcFunctions.length}`);
rpcFunctions.slice(0, 10).forEach(f => {
  console.log(`  - ${f.routine_name}`);
});

console.log('\n✅ Analysis complete!\n');

