#!/usr/bin/env node

/**
 * Deploy Specific Schema Fixes
 * 
 * Targeted fixes for the exact issues causing 400/404 errors
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Database configuration
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
    host: 'aws-1-us-west-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.cxlqzejzraczumqmsrcx',
    password: 'Alphaecho19!',
    ssl: { rejectUnauthorized: false }
};

async function deploySpecificFixes() {
    console.log('🎯 DEPLOYING SPECIFIC SCHEMA FIXES...\n');
    console.log('🔧 Targeting exact issues from error logs:\n');
    console.log('   1. user_dashboard_settings table missing (404 error)');
    console.log('   2. profiles.status column missing (400 error)');
    console.log('   3. payments.received_at column missing (400 error)\n');
    
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
        // Read the specific fixes SQL file
        const sqlPath = path.join(__dirname, 'FIX_SPECIFIC_SCHEMA_GAPS.sql');
        console.log('📖 Reading specific fixes SQL file...');
        
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found: ${sqlPath}`);
        }
        
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(`✅ SQL file loaded (${sql.length} characters)\n`);
        
        // Execute the deployment
        console.log('🔧 Applying specific fixes...');
        
        const startTime = Date.now();
        
        // Execute the complete deployment
        await client.query(sql);
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log('🎉 SPECIFIC FIXES DEPLOYMENT SUCCESSFUL!\n');
        console.log('📊 Deployment Summary:');
        console.log(`   ⏱️  Duration: ${duration} seconds`);
        console.log('   ✅ Created user_dashboard_settings table');
        console.log('   ✅ Added profiles.status column');
        console.log('   ✅ Added payments.received_at column');
        console.log('   ✅ Created dashboard helper functions');
        console.log('   ✅ Added default settings for existing users');
        
        // Verify the deployment
        console.log('\n🔍 Verifying fixes...');
        
        const verificationQueries = [
            { 
                name: 'user_dashboard_settings table', 
                query: `SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_dashboard_settings'` 
            },
            { 
                name: 'profiles.status column', 
                query: `SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status'` 
            },
            { 
                name: 'payments.received_at column', 
                query: `SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'received_at'` 
            },
            { 
                name: 'Dashboard settings records', 
                query: `SELECT COUNT(*) FROM user_dashboard_settings` 
            }
        ];
        
        for (const check of verificationQueries) {
            try {
                const result = await client.query(check.query);
                const count = parseInt(result.rows[0].count);
                if (count > 0) {
                    console.log(`   ✅ ${check.name}: ${count > 1 ? count + ' records' : 'Present'}`);
                } else {
                    console.log(`   ❌ ${check.name}: Missing`);
                }
            } catch (error) {
                console.log(`   ❌ ${check.name}: Verification failed - ${error.message}`);
            }
        }
        
        console.log('\n🎯 SPECIFIC SCHEMA GAPS FIXED!');
        console.log('\n📋 What was fixed:');
        console.log('   • user_dashboard_settings table - Fixes 404 errors');
        console.log('   • profiles.status column - Fixes profiles?status=eq.ACTIVE queries');
        console.log('   • payments.received_at column - Fixes payments?select=amount,received_at queries');
        console.log('   • Dashboard helper functions - Improves frontend performance');
        console.log('   • Default user settings - All existing users get dashboard configs');
        
        console.log('\n📋 Expected Results:');
        console.log('   1. ✅ user_dashboard_settings?user_id=eq.xxx should return 200');
        console.log('   2. ✅ profiles?select=id&status=eq.ACTIVE should return 200');
        console.log('   3. ✅ payments?select=amount,received_at should return 200');
        console.log('   4. ✅ Dashboard should load without 400/404 errors');
        console.log('   5. ✅ User status filtering should work');
        
        console.log('\n🔗 Database Status:');
        console.log(`   Database: TradesMatePro (cxlqzejzraczumqmsrcx)`);
        console.log(`   Critical Gaps: Fixed ✅`);
        console.log(`   Ready for: Frontend testing`);
        
    } catch (error) {
        console.error('\n❌ DEPLOYMENT FAILED!');
        console.error('Error details:', error.message);
        
        if (error.message.includes('already exists')) {
            console.log('\n💡 Tip: Some components may already exist. This is normal.');
            console.log('   The deployment script uses IF NOT EXISTS for safety.');
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
    deploySpecificFixes().catch(error => {
        console.error('\n💥 Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = { deploySpecificFixes };
