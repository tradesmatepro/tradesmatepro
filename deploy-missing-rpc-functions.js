/**
 * Deploy Missing RPC Functions
 * Creates additional RPC functions needed for frontend consolidation
 */

const { Client } = require('pg');
require('dotenv').config();

const DB_HOST = process.env.SUPABASE_DB_HOST || 'aws-1-us-west-1.pooler.supabase.com';
const DB_PORT = process.env.SUPABASE_DB_PORT || 5432;
const DB_NAME = process.env.SUPABASE_DB_NAME || 'postgres';
const DB_USER = process.env.SUPABASE_DB_USER || 'postgres.cxlqzejzraczumqmsrcx';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || 'Alphaecho19!';

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const fs = require('fs');
const path = require('path');

async function deployMissingRPCs() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'MISSING_RPC_FUNCTIONS.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Split into individual statements - handle dollar-quoted strings properly
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarQuoteDelimiter = '';

    for (let i = 0; i < sqlContent.length; i++) {
      const char = sqlContent[i];
      const remaining = sqlContent.substring(i);

      // Check for dollar quote start/end
      const dollarMatch = remaining.match(/^\$[a-zA-Z0-9_]*\$/);
      if (dollarMatch) {
        const delimiter = dollarMatch[0];
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarQuoteDelimiter = delimiter;
          currentStatement += delimiter;
          i += delimiter.length - 1;
          continue;
        } else if (delimiter === dollarQuoteDelimiter) {
          inDollarQuote = false;
          currentStatement += delimiter;
          i += delimiter.length - 1;
          continue;
        }
      }

      currentStatement += char;

      // Check for statement end (semicolon outside dollar quotes)
      if (char === ';' && !inDollarQuote) {
        const trimmed = currentStatement.trim();
        if (trimmed && !trimmed.startsWith('--')) {
          statements.push(trimmed);
        }
        currentStatement = '';
      }
    }

    // Add any remaining statement
    if (currentStatement.trim() && !currentStatement.trim().startsWith('--')) {
      statements.push(currentStatement.trim());
    }

    console.log(`\n📋 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 80).replace(/\n/g, ' ');

      try {
        await client.query(statement);
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
        successCount++;
      } catch (error) {
        // Some errors are expected (e.g., function already exists)
        if (error.message.includes('already exists')) {
          console.log(`⚠️  [${i + 1}/${statements.length}] Function already exists (skipped)`);
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Error: ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`\n📊 DEPLOYMENT SUMMARY:`);
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ⚠️  Skipped: ${statements.length - successCount - errorCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);

    // Verify functions were created
    console.log(`\n🔍 VERIFYING FUNCTIONS:\n`);

    const functions = [
      'get_unscheduled_work_orders',
      'get_work_orders_by_status',
      'get_work_orders_with_crew',
      'get_work_orders_for_calendar',
      'get_customers_with_work_order_count'
    ];

    for (const funcName of functions) {
      try {
        const result = await client.query(
          `SELECT proname FROM pg_proc WHERE proname = $1`,
          [funcName]
        );
        if (result.rows.length > 0) {
          console.log(`✅ ${funcName} - EXISTS`);
        } else {
          console.log(`❌ ${funcName} - NOT FOUND`);
        }
      } catch (error) {
        console.error(`❌ ${funcName} - Error checking: ${error.message}`);
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`\n✅ DEPLOYMENT COMPLETE\n`);

  } catch (error) {
    console.error('❌ Connection error:', error);
  } finally {
    await client.end();
  }
}

deployMissingRPCs();

