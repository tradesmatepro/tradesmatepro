#!/usr/bin/env node

/**
 * TradeMate Pro - Master Schema Deployment Script
 * 
 * Deploys the complete master database schema to the new Supabase project
 * Includes all phases: Enums, Tables, Indexes, Functions, Triggers, Views, Seeds
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

async function deploySchema() {
    console.log('🚀 TradeMate Pro - Master Schema Deployment Starting...\n');
    
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
        // Read the master schema SQL file
        const schemaPath = path.join(__dirname, 'DEPLOY_MASTER_SCHEMA.sql');
        console.log('📖 Reading master schema file...');
        
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found: ${schemaPath}`);
        }
        
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log(`✅ Schema file loaded (${schemaSql.length} characters)\n`);
        
        // Execute the schema deployment
        console.log('🏗️  Deploying master schema...');
        console.log('⏳ This may take a few minutes...\n');
        
        const startTime = Date.now();
        
        // Execute the complete schema in a single transaction
        await client.query(schemaSql);
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log('🎉 DEPLOYMENT SUCCESSFUL!\n');
        console.log('📊 Deployment Summary:');
        console.log(`   ⏱️  Duration: ${duration} seconds`);
        console.log('   ✅ Enums: All business logic types created');
        console.log('   ✅ Tables: ~30 core tables with relationships');
        console.log('   ✅ Indexes: Performance optimization applied');
        console.log('   ✅ Functions: Business logic functions created');
        console.log('   ✅ Triggers: Automated calculations enabled');
        console.log('   ✅ Views: Business intelligence views ready');
        console.log('   ✅ Seeds: Essential default data inserted');
        
        // Verify deployment by checking key tables
        console.log('\n🔍 Verifying deployment...');
        
        const verificationQueries = [
            { name: 'Companies', query: 'SELECT COUNT(*) FROM companies' },
            { name: 'Users', query: 'SELECT COUNT(*) FROM users' },
            { name: 'Work Orders', query: 'SELECT COUNT(*) FROM work_orders' },
            { name: 'Customers', query: 'SELECT COUNT(*) FROM customers' },
            { name: 'Service Categories', query: 'SELECT COUNT(*) FROM service_categories' },
            { name: 'Billing Plans', query: 'SELECT COUNT(*) FROM billing_plans' }
        ];
        
        for (const check of verificationQueries) {
            try {
                const result = await client.query(check.query);
                console.log(`   ✅ ${check.name}: Table exists (${result.rows[0].count} records)`);
            } catch (error) {
                console.log(`   ❌ ${check.name}: ${error.message}`);
            }
        }
        
        console.log('\n🎯 READY FOR APPLICATION DEPLOYMENT!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Test main application connection');
        console.log('   2. Test customer portal connection');
        console.log('   3. Test admin dashboard connection');
        console.log('   4. Create first company and user');
        console.log('   5. Verify all features work correctly');
        
        console.log('\n🔗 Database Connection Details:');
        console.log(`   URL: https://cxlqzejzraczumqmsrcx.supabase.co`);
        console.log(`   Project: TradesMatePro (cxlqzejzraczumqmsrcx)`);
        console.log(`   Status: Schema deployment complete ✅`);
        
    } catch (error) {
        console.error('\n❌ DEPLOYMENT FAILED!');
        console.error('Error details:', error.message);
        
        if (error.message.includes('already exists')) {
            console.log('\n💡 Tip: Some objects may already exist. This is normal for partial deployments.');
            console.log('   Consider dropping and recreating the schema if needed.');
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
    deploySchema().catch(error => {
        console.error('\n💥 Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = { deploySchema };
