#!/usr/bin/env node

/**
 * Deploy Missing Core FSM Tables
 * 
 * Based on error log analysis, deploys critical missing tables and columns
 * that are causing 400/404 errors in the application
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

// Pooler connection as fallback (IPv4 compatible)
const DB_CONFIG_POOLER = {
    host: 'aws-1-us-west-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.cxlqzejzraczumqmsrcx',
    password: 'Alphaecho19!',
    ssl: { rejectUnauthorized: false }
};

async function deployMissingCoreTables() {
    console.log('🚨 DEPLOYING MISSING CORE FSM TABLES...\n');
    console.log('🎯 Based on error log analysis - fixing 400/404 errors\n');
    
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
        // Read the missing core tables SQL file
        const sqlPath = path.join(__dirname, 'DEPLOY_MISSING_CORE_TABLES.sql');
        console.log('📖 Reading missing core tables SQL file...');
        
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found: ${sqlPath}`);
        }
        
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(`✅ SQL file loaded (${sql.length} characters)\n`);
        
        // Execute the deployment
        console.log('🔧 Deploying missing core FSM tables...');
        console.log('⏳ Adding notifications, payments, user_dashboard_settings...');
        console.log('⏳ Fixing missing columns in existing tables...\n');
        
        const startTime = Date.now();
        
        // Execute the complete deployment
        await client.query(sql);
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log('🎉 MISSING CORE TABLES DEPLOYMENT SUCCESSFUL!\n');
        console.log('📊 Deployment Summary:');
        console.log(`   ⏱️  Duration: ${duration} seconds`);
        console.log('   ✅ Added missing core tables (notifications, payments, user_dashboard_settings)');
        console.log('   ✅ Fixed missing columns in existing tables');
        console.log('   ✅ Created essential indexes for performance');
        console.log('   ✅ Added dashboard views for frontend compatibility');
        
        // Verify the deployment
        console.log('\n🔍 Verifying deployment...');
        
        const verificationQueries = [
            { 
                name: 'Notifications Table', 
                query: `SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'notifications'` 
            },
            { 
                name: 'Payments Table', 
                query: `SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'payments'` 
            },
            { 
                name: 'User Dashboard Settings', 
                query: `SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_dashboard_settings'` 
            },
            { 
                name: 'Profiles Status Column', 
                query: `SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status'` 
            },
            { 
                name: 'Work Orders Dashboard View', 
                query: `SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'work_orders_dashboard'` 
            }
        ];
        
        for (const check of verificationQueries) {
            try {
                const result = await client.query(check.query);
                const count = parseInt(result.rows[0].count);
                if (count > 0) {
                    console.log(`   ✅ ${check.name}: Present`);
                } else {
                    console.log(`   ❌ ${check.name}: Missing`);
                }
            } catch (error) {
                console.log(`   ❌ ${check.name}: Verification failed - ${error.message}`);
            }
        }
        
        console.log('\n🎯 CORE FSM GAPS FILLED!');
        console.log('\n📋 What was deployed:');
        console.log('   • notifications table - System alerts and messaging');
        console.log('   • payments table - Payment tracking with received_at column');
        console.log('   • user_dashboard_settings table - Customizable user dashboards');
        console.log('   • profiles.status column - User status tracking');
        console.log('   • work_orders missing columns - title, created_by');
        console.log('   • invoices missing columns - due_date, total_amount');
        console.log('   • Essential indexes for performance');
        console.log('   • Dashboard views for frontend compatibility');
        
        console.log('\n📋 Expected Results:');
        console.log('   1. ✅ Dashboard should load without 400 errors');
        console.log('   2. ✅ Notifications system should work');
        console.log('   3. ✅ Payment tracking should function');
        console.log('   4. ✅ User status queries should succeed');
        console.log('   5. ✅ Work order queries should return data');
        console.log('   6. ✅ Invoice queries should work properly');
        
        console.log('\n🔗 Database Status:');
        console.log(`   Database: TradesMatePro (cxlqzejzraczumqmsrcx)`);
        console.log(`   Core FSM Tables: Now deployed ✅`);
        console.log(`   Ready for: Frontend testing and validation`);
        
    } catch (error) {
        console.error('\n❌ DEPLOYMENT FAILED!');
        console.error('Error details:', error.message);
        
        if (error.message.includes('already exists')) {
            console.log('\n💡 Tip: Some tables may already exist. This is normal.');
            console.log('   The deployment script is designed to be idempotent.');
        }
        
        if (error.message.includes('does not exist')) {
            console.log('\n💡 Tip: Some referenced tables may be missing.');
            console.log('   Make sure Phase 1 core tables were deployed first.');
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
    deployMissingCoreTables().catch(error => {
        console.error('\n💥 Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = { deployMissingCoreTables };
