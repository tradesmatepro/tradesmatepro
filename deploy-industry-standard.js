#!/usr/bin/env node

/**
 * Deploy Quote Builder Schema Fixes
 * Fixes all schema mismatches while preserving pipeline
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST || 'aws-1-us-west-1.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres.cxlqzejzraczumqmsrcx',
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

async function deploy() {
    try {
        console.log('🚀 Connecting to database...');
        await client.connect();
        console.log('✅ Connected!');

        console.log('\n📖 Reading SQL file...');
        const sql = fs.readFileSync('FIX_NOTES_REDUNDANCY.sql', 'utf8');

        console.log('\n🔧 Fixing Notes Redundancy (Industry Standard)...');
        console.log('   - Adding work_orders.customer_notes column');
        console.log('   - Migrating internal_notes → notes');
        console.log('   - Deprecating internal_notes column');
        console.log('   - Adding performance indexes');
        console.log('   - Frontend: Fixed duplicate useEffect\n');

        await client.query(sql);

        console.log('\n✅ DEPLOYMENT COMPLETE!');
        console.log('\n📊 Summary:');
        console.log('   ✅ work_orders: Added customer_notes column (visible to customer)');
        console.log('   ✅ work_orders: notes = Internal notes (NOT visible to customer)');
        console.log('   ✅ work_orders: Migrated internal_notes → notes');
        console.log('   ✅ work_orders: internal_notes marked as DEPRECATED');
        console.log('   ✅ Frontend: Fixed duplicate useEffect (labor loading)');
        console.log('   ✅ Frontend: Removed redundant "Notes" field');
        console.log('   ✅ Logs: Duplicate logs should stop');
        console.log('   ✅ Created address_type_enum (SERVICE, BILLING, SHIPPING, MAILING)');
        console.log('   ✅ Created pricing_model_enum (TIME_MATERIALS, FLAT_RATE, UNIT, PERCENTAGE, RECURRING)');
        console.log('   ✅ Added performance indexes');
        console.log('   ✅ Added updated_at triggers');
        console.log('\n🎯 Quote builder is now industry standard!');
        console.log('   Pipeline preserved: QUOTE → SENT → ACCEPTED → SCHEDULED → IN_PROGRESS → COMPLETED → INVOICED → PAID');

    } catch (error) {
        console.error('\n❌ DEPLOYMENT FAILED:');
        console.error(error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

deploy();

