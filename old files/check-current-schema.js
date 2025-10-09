#!/usr/bin/env node

/**
 * Check Current Schema
 * 
 * Simple diagnostic to see what's actually in the database
 */

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

async function checkCurrentSchema() {
    console.log('🔍 CHECKING CURRENT SCHEMA...\n');
    
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
        // Check what tables exist
        console.log('📊 EXISTING TABLES:');
        const tablesResult = await client.query(`
            SELECT table_name, table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_type, table_name
        `);
        
        const tables = tablesResult.rows.filter(row => row.table_type === 'BASE TABLE');
        const views = tablesResult.rows.filter(row => row.table_type === 'VIEW');
        
        console.log(`\n📋 TABLES (${tables.length}):`);
        tables.forEach(row => console.log(`  ✅ ${row.table_name}`));
        
        console.log(`\n👁️  VIEWS (${views.length}):`);
        views.forEach(row => console.log(`  👁️  ${row.table_name}`));
        
        // Check specific tables from error logs
        const criticalTables = ['profiles', 'work_orders', 'invoices', 'payments', 'notifications', 'user_dashboard_settings'];
        
        console.log('\n🎯 CRITICAL TABLE STATUS:');
        for (const tableName of criticalTables) {
            const tableCheck = await client.query(`
                SELECT table_type
                FROM information_schema.tables 
                WHERE table_name = $1 AND table_schema = 'public'
            `, [tableName]);
            
            if (tableCheck.rows.length > 0) {
                const tableType = tableCheck.rows[0].table_type;
                console.log(`  ${tableType === 'BASE TABLE' ? '✅' : '👁️ '} ${tableName} (${tableType})`);
                
                // If it's a table, check columns
                if (tableType === 'BASE TABLE') {
                    const columnsResult = await client.query(`
                        SELECT column_name
                        FROM information_schema.columns 
                        WHERE table_name = $1 AND table_schema = 'public'
                        ORDER BY ordinal_position
                    `, [tableName]);
                    
                    const columns = columnsResult.rows.map(row => row.column_name);
                    console.log(`     Columns: ${columns.join(', ')}`);
                }
            } else {
                console.log(`  ❌ ${tableName} (MISSING)`);
            }
        }
        
        // Check enums
        console.log('\n🏷️  EXISTING ENUMS:');
        const enumsResult = await client.query(`
            SELECT typname
            FROM pg_type 
            WHERE typtype = 'e'
            ORDER BY typname
        `);
        
        if (enumsResult.rows.length > 0) {
            enumsResult.rows.forEach(row => console.log(`  🏷️  ${row.typname}`));
        } else {
            console.log('  ❌ No enums found');
        }
        
        console.log('\n📈 SCHEMA SUMMARY:');
        console.log(`  Tables: ${tables.length}`);
        console.log(`  Views: ${views.length}`);
        console.log(`  Enums: ${enumsResult.rows.length}`);
        
    } catch (error) {
        console.error('\n❌ SCHEMA CHECK FAILED!');
        console.error('Error details:', error.message);
        process.exit(1);
    } finally {
        if (client) {
            await client.end();
            console.log('\n📡 Database connection closed.');
        }
    }
}

// Run the check
if (require.main === module) {
    checkCurrentSchema().catch(error => {
        console.error('\n💥 Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = { checkCurrentSchema };
