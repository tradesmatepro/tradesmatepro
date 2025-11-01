/**
 * Scan for all direct database operations in frontend code
 * Identifies supaFetch calls with POST/PATCH/PUT/DELETE that should be backend RPCs
 */

const fs = require('fs');
const path = require('path');

const BUSINESS_TABLES = [
  'work_orders',
  'invoices',
  'customers',
  'employees',
  'payments',
  'expenses',
  'schedule_events',
  'vendors',
  'purchase_orders',
  'messages',
  'marketplace_requests',
  'marketplace_responses',
  'work_order_line_items',
  'invoice_line_items',
  'po_items',
  'customer_addresses',
  'profiles',
  'users'
];

const METHODS_TO_CHECK = ['POST', 'PATCH', 'PUT', 'DELETE'];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const findings = [];

    lines.forEach((line, index) => {
      // Look for supaFetch calls with business table operations
      if (line.includes('supaFetch')) {
        // Check if it's a direct table operation (not RPC)
        if (!line.includes('rpc/')) {
          // Check for POST/PATCH/PUT/DELETE methods
          METHODS_TO_CHECK.forEach(method => {
            if (line.includes(`method: '${method}'`) || line.includes(`method: "${method}"`)) {
              // Check if it's operating on a business table
              BUSINESS_TABLES.forEach(table => {
                if (line.includes(`'${table}`) || line.includes(`"${table}`)) {
                  findings.push({
                    file: filePath,
                    line: index + 1,
                    method,
                    table,
                    code: line.trim()
                  });
                }
              });
            }
          });
        }
      }
    });

    return findings;
  } catch (error) {
    return [];
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!['node_modules', 'build', 'dist', '.git', '.next'].includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      callback(filePath);
    }
  });
}

console.log('🔍 Scanning frontend code for direct database operations...\n');
console.log('=' .repeat(80));

const allFindings = [];
const srcDir = path.join(__dirname, 'src');

walkDir(srcDir, (filePath) => {
  const findings = scanFile(filePath);
  allFindings.push(...findings);
});

if (allFindings.length === 0) {
  console.log('✅ No direct database operations found!');
} else {
  console.log(`\n⚠️  Found ${allFindings.length} direct database operations:\n`);

  // Group by table
  const byTable = {};
  allFindings.forEach(finding => {
    if (!byTable[finding.table]) {
      byTable[finding.table] = [];
    }
    byTable[finding.table].push(finding);
  });

  Object.entries(byTable).forEach(([table, findings]) => {
    console.log(`\n📊 ${table.toUpperCase()} (${findings.length} operations)`);
    console.log('-' .repeat(80));

    findings.forEach(finding => {
      console.log(`  File: ${finding.file.replace(__dirname, '.')}`);
      console.log(`  Line: ${finding.line}`);
      console.log(`  Method: ${finding.method}`);
      console.log(`  Code: ${finding.code.substring(0, 100)}...`);
      console.log();
    });
  });

  console.log('\n' + '=' .repeat(80));
  console.log(`\n📋 SUMMARY:`);
  console.log(`  Total operations: ${allFindings.length}`);
  console.log(`  Tables affected: ${Object.keys(byTable).length}`);
  console.log(`  Methods: ${[...new Set(allFindings.map(f => f.method))].join(', ')}`);
  console.log('\n💡 These should be moved to backend RPC functions for proper security!');
}

