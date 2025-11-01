const fs = require('fs');

const data = JSON.parse(fs.readFileSync('logs.md', 'utf8'));
const wo = data[0];
const keys = Object.keys(wo).sort();

console.log('ACTUAL WORK_ORDER COLUMNS IN DATABASE: ' + keys.length);
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
  const found = fields.filter(f => keys.includes(f));
  if (found.length > 0) {
    console.log(`\n${cat}:`);
    found.forEach(f => console.log(`  - ${f}`));
  }
});

console.log('\n\nAll columns:');
keys.forEach(col => console.log(`  ${col}`));

