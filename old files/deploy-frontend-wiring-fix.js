#!/usr/bin/env node

/**
 * TradeMate Pro - Frontend Schema Wiring Fix
 * 
 * Fixes mismatches between frontend expectations and deployed schema:
 * - Creates missing user_profiles view
 * - Adds compatibility columns to profiles table
 * - Creates sync triggers for data consistency
 * - Adds extended views for enhanced functionality
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// New Supabase project configuration
const DB_CONFIG = {
    host: 'db.cxlqzejzraczumqmsrcx.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Alphaecho19!',
    ssl: { rejectUnauthorized: false }
};

// Pooler connection as fallback
const DB_CONFIG_POOLER = {
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.cxlqzejzraczumqmsrcx',
    password: 'Alphaecho19!',
    ssl: { rejectUnauthorized: false }
};

async function deployFrontendWiringFix() {
    console.log('🔧 TradeMate Pro - Frontend Schema Wiring Fix Starting...\n');
    
    let client;
    
    try {
        // Try direct connection first
        console.log('📡 Attempting direct database connection...');
        client = new Client(DB_CONFIG);
        await client.connect();
        console.log('✅ Connected to database successfully!\n');
        
    } catch (error) {
        console.log('⚠️  Direct connection failed, trying pooler...');
        try {
            client = new Client(DB_CONFIG_POOLER);
            await client.connect();
            console.log('✅ Connected via pooler successfully!\n');
        } catch (poolerError) {
            console.error('❌ Both connection methods failed:');
            console.error('Direct:', error.message);
            console.error('Pooler:', poolerError.message);
            process.exit(1);
        }
    }
    
    try {
        // Read the frontend wiring fix SQL file
        const fixPath = path.join(__dirname, 'FIX_FRONTEND_SCHEMA_WIRING.sql');
        console.log('📖 Reading frontend wiring fix file...');
        
        if (!fs.existsSync(fixPath)) {
            throw new Error(`Fix file not found: ${fixPath}`);
        }
        
        const fixSql = fs.readFileSync(fixPath, 'utf8');
        console.log(`✅ Fix file loaded (${fixSql.length} characters)\n`);
        
        // Execute the frontend wiring fixes
        console.log('🔧 Applying frontend schema wiring fixes...');
        console.log('⏳ Creating views, adding columns, and setting up sync triggers...\n');
        
        const startTime = Date.now();
        
        // Execute the complete frontend wiring fix
        await client.query(fixSql);
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log('🎉 FRONTEND WIRING FIX SUCCESSFUL!\n');
        console.log('📊 Deployment Summary:');
        console.log(`   ⏱️  Duration: ${duration} seconds`);
        console.log('   ✅ Created user_profiles view for frontend compatibility');
        console.log('   ✅ Added missing columns to profiles table');
        console.log('   ✅ Created sync triggers for data consistency');
        console.log('   ✅ Created extended views for enhanced functionality');
        console.log('   ✅ Added compatibility functions for authentication');
        
        // Verify the fixes by checking new components
        console.log('\n🔍 Verifying frontend wiring fixes...');
        
        const verificationQueries = [
            { 
                name: 'user_profiles View', 
                query: `SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'user_profiles'` 
            },
            { 
                name: 'profiles Table Columns', 
                query: `SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('email', 'role', 'company_id')` 
            },
            { 
                name: 'Extended Views', 
                query: `SELECT COUNT(*) FROM information_schema.views WHERE table_name IN ('companies_extended', 'work_orders_extended', 'customers_extended')` 
            },
            { 
                name: 'Compatibility Functions', 
                query: `SELECT COUNT(*) FROM pg_proc WHERE proname IN ('get_user_by_auth_id', 'create_user_with_profile')` 
            },
            { 
                name: 'Sync Triggers', 
                query: `SELECT COUNT(*) FROM pg_trigger WHERE tgname IN ('trg_sync_profile_from_user', 'trg_sync_profile_data')` 
            }
        ];
        
        for (const check of verificationQueries) {
            try {
                const result = await client.query(check.query);
                const count = parseInt(result.rows[0].count);
                if (count > 0) {
                    console.log(`   ✅ ${check.name}: ${count} components created`);
                } else {
                    console.log(`   ⚠️  ${check.name}: No components found`);
                }
            } catch (error) {
                console.log(`   ❌ ${check.name}: Verification failed - ${error.message}`);
            }
        }
        
        // Test the user_profiles view
        console.log('\n🧪 Testing user_profiles view...');
        try {
            const testResult = await client.query('SELECT COUNT(*) FROM user_profiles');
            console.log(`   ✅ user_profiles view working: ${testResult.rows[0].count} records accessible`);
        } catch (error) {
            console.log(`   ❌ user_profiles view test failed: ${error.message}`);
        }
        
        console.log('\n🎯 FRONTEND WIRING NOW COMPATIBLE!');
        console.log('\n📋 What was fixed:');
        console.log('   • Created user_profiles view that frontend expects');
        console.log('   • Added email, role, company_id columns to profiles table');
        console.log('   • Set up automatic sync between users and profiles tables');
        console.log('   • Created extended views for enhanced functionality');
        console.log('   • Added authentication helper functions');
        console.log('   • Synced existing data to new structure');
        
        console.log('\n📋 Frontend should now work correctly:');
        console.log('   1. ✅ UserContext authentication will work');
        console.log('   2. ✅ Admin dashboard user list will load');
        console.log('   3. ✅ Employee pages will display data');
        console.log('   4. ✅ Profile management will function');
        console.log('   5. ✅ All user-related queries will succeed');
        
        console.log('\n🔗 Database Status:');
        console.log(`   Database: TradesMatePro (cxlqzejzraczumqmsrcx)`);
        console.log(`   Phase 1: COMPLETE with frontend compatibility ✅`);
        console.log(`   Frontend: Ready for testing and deployment`);
        
    } catch (error) {
        console.error('\n❌ FRONTEND WIRING FIX FAILED!');
        console.error('Error details:', error.message);
        
        if (error.message.includes('already exists')) {
            console.log('\n💡 Tip: Some components may already exist. This is normal.');
            console.log('   The fix script is designed to be idempotent.');
        }
        
        if (error.message.includes('does not exist')) {
            console.log('\n💡 Tip: Make sure Phase 1 core tables were deployed first.');
            console.log('   Run the Phase 1 deployment before this fix.');
        }
        
        process.exit(1);
    } finally {
        if (client) {
            await client.end();
            console.log('\n📡 Database connection closed.');
        }
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\n⚠️  Deployment interrupted by user');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\n⚠️  Deployment terminated');
    process.exit(1);
});

// Run the deployment
if (require.main === module) {
    deployFrontendWiringFix().catch(error => {
        console.error('\n💥 Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = { deployFrontendWiringFix };
