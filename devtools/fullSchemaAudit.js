/**
 * FULL SCHEMA AUDIT: App Code vs Actual Database
 * 
 * This tool compares what the app EXPECTS vs what the database ACTUALLY has
 * to identify schema drift issues.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Tables to audit (critical tables used across the app)
const TABLES_TO_AUDIT = [
  'companies',
  'work_orders',
  'work_order_line_items',
  'rate_cards',
  'employees',
  'customers',
  'schedule_events',
  'invoices',
  'invoice_items',
  'settings',
  'profiles',
  'users'
];

async function auditSchema() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n🔍 FULL SCHEMA AUDIT: App vs Database');
    console.log('='.repeat(100));

    // Login
    console.log('\n🔐 Logging in...');
    await page.goto('http://localhost:3004/login');
    await page.fill('input[type="email"]', 'owner@company.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard or any authenticated page
    await page.waitForTimeout(3000);
    console.log('✅ Logged in\n');

    // Get actual database schema for each table
    const schemaResults = await page.evaluate(async (tables) => {
      const results = {};

      for (const tableName of tables) {
        try {
          // Try to fetch one row to see what columns exist
          const response = await fetch(
            `https://cxlqzejzraczumqmsrcx.supabase.co/rest/v1/${tableName}?limit=1`,
            {
              headers: {
                'apikey': 'sb_publishable_62eAoe6DcrOweYtnzfhHmQ_aYY4JZSG',
                'Authorization': 'Bearer sb_publishable_62eAoe6DcrOweYtnzfhHmQ_aYY4JZSG'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              results[tableName] = {
                exists: true,
                columns: Object.keys(data[0]).sort(),
                sampleData: data[0]
              };
            } else {
              // Table exists but is empty - try to get schema from error
              const emptyResponse = await fetch(
                `https://cxlqzejzraczumqmsrcx.supabase.co/rest/v1/${tableName}?select=*`,
                {
                  headers: {
                    'apikey': 'sb_publishable_62eAoe6DcrOweYtnzfhHmQ_aYY4JZSG',
                    'Authorization': 'Bearer sb_publishable_62eAoe6DcrOweYtnzfhHmQ_aYY4JZSG',
                    'Prefer': 'return=representation'
                  }
                }
              );
              
              results[tableName] = {
                exists: true,
                columns: [],
                empty: true
              };
            }
          } else if (response.status === 401 || response.status === 403) {
            results[tableName] = {
              exists: true,
              columns: [],
              error: 'RLS_BLOCKED',
              message: 'Table exists but RLS blocks access'
            };
          } else if (response.status === 404) {
            results[tableName] = {
              exists: false,
              error: 'TABLE_NOT_FOUND'
            };
          } else {
            results[tableName] = {
              exists: 'unknown',
              error: `HTTP_${response.status}`,
              message: await response.text()
            };
          }
        } catch (error) {
          results[tableName] = {
            exists: 'unknown',
            error: 'FETCH_ERROR',
            message: error.message
          };
        }
      }

      return results;
    }, TABLES_TO_AUDIT);

    // Display results
    console.log('📊 DATABASE SCHEMA AUDIT RESULTS');
    console.log('='.repeat(100));

    const auditReport = {
      timestamp: new Date().toISOString(),
      tables: {}
    };

    for (const tableName of TABLES_TO_AUDIT) {
      const result = schemaResults[tableName];
      
      console.log(`\n📋 TABLE: ${tableName}`);
      console.log('-'.repeat(100));

      if (!result.exists) {
        console.log('  ❌ TABLE DOES NOT EXIST');
        auditReport.tables[tableName] = { exists: false };
      } else if (result.error === 'RLS_BLOCKED') {
        console.log('  ⚠️  TABLE EXISTS BUT RLS BLOCKS ACCESS');
        console.log('  💡 Need to use service key or disable RLS to audit this table');
        auditReport.tables[tableName] = { exists: true, rlsBlocked: true };
      } else if (result.columns && result.columns.length > 0) {
        console.log(`  ✅ TABLE EXISTS (${result.columns.length} columns)`);
        console.log('\n  Columns:');
        result.columns.forEach((col, i) => {
          console.log(`    ${String(i + 1).padStart(2, ' ')}. ${col}`);
        });
        
        auditReport.tables[tableName] = {
          exists: true,
          columns: result.columns,
          columnCount: result.columns.length
        };
      } else if (result.empty) {
        console.log('  ⚠️  TABLE EXISTS BUT IS EMPTY (cannot determine columns)');
        auditReport.tables[tableName] = { exists: true, empty: true };
      } else {
        console.log(`  ❌ ERROR: ${result.error}`);
        console.log(`  Message: ${result.message}`);
        auditReport.tables[tableName] = { exists: 'unknown', error: result.error };
      }
    }

    // Check for common schema drift issues
    console.log('\n\n🔍 SCHEMA DRIFT ANALYSIS');
    console.log('='.repeat(100));

    const driftIssues = [];

    // Check companies table
    if (schemaResults.companies?.columns) {
      const companiesColumns = schemaResults.companies.columns;
      
      console.log('\n📋 COMPANIES TABLE ANALYSIS:');
      console.log('-'.repeat(100));
      
      // Check for license columns
      const hasLicenses = companiesColumns.includes('licenses');
      const hasLicenseNumber = companiesColumns.includes('license_number');
      
      if (!hasLicenses && !hasLicenseNumber) {
        console.log('  ❌ MISSING: No license column (licenses or license_number)');
        driftIssues.push({
          table: 'companies',
          issue: 'missing_license_column',
          severity: 'high',
          fix: 'Add licenses JSONB column or license_number TEXT column'
        });
      } else if (hasLicenses) {
        console.log('  ✅ HAS: licenses (JSONB)');
      } else if (hasLicenseNumber) {
        console.log('  ✅ HAS: license_number (TEXT)');
      }

      // Check for scheduling columns
      const schedulingColumns = [
        'job_buffer_minutes',
        'default_buffer_before_minutes',
        'default_buffer_after_minutes',
        'business_hours_start',
        'business_hours_end',
        'working_days'
      ];
      
      const missingScheduling = schedulingColumns.filter(col => !companiesColumns.includes(col));
      if (missingScheduling.length > 0) {
        console.log(`  ❌ MISSING SCHEDULING COLUMNS (${missingScheduling.length}):`);
        missingScheduling.forEach(col => console.log(`     - ${col}`));
        driftIssues.push({
          table: 'companies',
          issue: 'missing_scheduling_columns',
          severity: 'medium',
          columns: missingScheduling
        });
      } else {
        console.log('  ✅ HAS: All scheduling columns');
      }
    }

    // Check rate_cards table
    if (schemaResults.rate_cards?.columns) {
      const rateCardsColumns = schemaResults.rate_cards.columns;
      
      console.log('\n📋 RATE_CARDS TABLE ANALYSIS:');
      console.log('-'.repeat(100));
      
      if (!rateCardsColumns.includes('sort_order')) {
        console.log('  ❌ MISSING: sort_order column');
        driftIssues.push({
          table: 'rate_cards',
          issue: 'missing_sort_order',
          severity: 'low',
          fix: 'Add sort_order INTEGER DEFAULT 0'
        });
      } else {
        console.log('  ✅ HAS: sort_order');
      }
    }

    // Check work_orders table
    if (schemaResults.work_orders?.columns) {
      const workOrdersColumns = schemaResults.work_orders.columns;
      
      console.log('\n📋 WORK_ORDERS TABLE ANALYSIS:');
      console.log('-'.repeat(100));
      
      // Check for status column
      if (!workOrdersColumns.includes('status')) {
        console.log('  ❌ MISSING: status column');
        driftIssues.push({
          table: 'work_orders',
          issue: 'missing_status',
          severity: 'critical',
          fix: 'Add status work_order_status_enum'
        });
      } else {
        console.log('  ✅ HAS: status');
      }
    }

    // Summary
    console.log('\n\n📊 AUDIT SUMMARY');
    console.log('='.repeat(100));
    console.log(`Total Tables Audited: ${TABLES_TO_AUDIT.length}`);
    console.log(`Tables Found: ${Object.values(schemaResults).filter(r => r.exists === true).length}`);
    console.log(`Tables Missing: ${Object.values(schemaResults).filter(r => r.exists === false).length}`);
    console.log(`Tables RLS Blocked: ${Object.values(schemaResults).filter(r => r.error === 'RLS_BLOCKED').length}`);
    console.log(`Schema Drift Issues: ${driftIssues.length}`);

    if (driftIssues.length > 0) {
      console.log('\n⚠️  DRIFT ISSUES FOUND:');
      driftIssues.forEach((issue, i) => {
        console.log(`\n  ${i + 1}. ${issue.table} - ${issue.issue} (${issue.severity})`);
        if (issue.fix) console.log(`     Fix: ${issue.fix}`);
        if (issue.columns) console.log(`     Missing: ${issue.columns.join(', ')}`);
      });
    }

    // Save detailed report
    auditReport.driftIssues = driftIssues;
    auditReport.summary = {
      totalTables: TABLES_TO_AUDIT.length,
      tablesFound: Object.values(schemaResults).filter(r => r.exists === true).length,
      tablesMissing: Object.values(schemaResults).filter(r => r.exists === false).length,
      tablesRlsBlocked: Object.values(schemaResults).filter(r => r.error === 'RLS_BLOCKED').length,
      driftIssuesCount: driftIssues.length
    };

    const reportPath = path.join(__dirname, 'logs', 'schema-audit-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));

    console.log(`\n💾 Detailed report saved: ${reportPath}`);
    console.log('\n' + '='.repeat(100));
    console.log('✅ SCHEMA AUDIT COMPLETE\n');

    // Keep browser open for inspection
    console.log('Browser will stay open for 30 seconds for manual inspection...\n');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

auditSchema();

