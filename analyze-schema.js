const fs = require('fs');
const path = require('path');

// Read the supabase schema CSV
const schemaPath = path.join('docs', 'supabase schema.csv');
const content = fs.readFileSync(schemaPath, 'utf8');
const lines = content.split('\n');

// Filter for work_orders table
const woLines = lines.filter(line => line.includes('public,work_orders,'));

// Extract column names
const columns = woLines.map(line => {
  const parts = line.split(',');
  return parts[2]; // column name is 3rd field
}).filter(col => col && col !== 'column_name');

console.log('WORK_ORDERS TABLE - REDUNDANT COLUMNS ANALYSIS');
console.log('='.repeat(80));

// Group by category
const categories = {
  'Quote-related (REDUNDANT)': ['quote_sent_at', 'sent_at', 'quote_accepted_at', 'customer_approved_at', 'approved_at', 'quote_viewed_at', 'viewed_at'],
  'Scheduling (REDUNDANT)': ['scheduled_start', 'preferred_start_date', 'scheduled_end', 'estimated_completion_date', 'actual_start', 'started_at', 'actual_end', 'completed_at'],
  'Status/Approval (REDUNDANT)': ['status', 'invoiced_at', 'completed_at', 'presented_at', 'presented_time'],
  'Follow-up (MESSY)': ['follow_up_date', 'follow_up_scheduled_at', 'follow_up_reminder_time', 'follow_up_time'],
  'Payment/Invoice (OVERLAPPING)': ['paid_at', 'invoice_sent_at', 'invoice_date', 'invoice_viewed_at'],
};

Object.entries(categories).forEach(([cat, fields]) => {
  const found = fields.filter(f => columns.includes(f));
  if (found.length > 0) {
    console.log(`\n${cat}:`);
    found.forEach(f => console.log(`  - ${f}`));
  }
});

console.log('\n\nTOTAL COLUMNS IN work_orders: ' + columns.length);
console.log('\nAll columns:');
columns.sort().forEach(col => console.log(`  ${col}`));

