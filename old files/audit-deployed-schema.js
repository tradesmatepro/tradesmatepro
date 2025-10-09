#!/usr/bin/env node

/**
 * CRITICAL SCHEMA AUDIT
 * 
 * Audits the deployed schema against FSM industry standards
 * Identifies missing tables, columns, and functionality gaps
 */

const { Client } = require('pg');

// Database configuration
const DB_CONFIG = {
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.cxlqzejzraczumqmsrcx',
    password: 'Alphaecho19!',
    ssl: { rejectUnauthorized: false }
};

// FSM Industry Standard Requirements
const FSM_REQUIRED_TABLES = {
    // Core Customer Management
    'customers': ['id', 'company_id', 'customer_number', 'first_name', 'last_name', 'company_name', 'email', 'phone', 'status', 'created_at'],
    'customer_addresses': ['id', 'customer_id', 'address_line1', 'city', 'state_province', 'postal_code', 'is_primary'],
    'customer_contacts': ['id', 'customer_id', 'first_name', 'last_name', 'email', 'phone', 'role'],
    'customer_notes': ['id', 'customer_id', 'user_id', 'note_type', 'content', 'created_at'],
    
    // Work Order Pipeline (CORE FSM)
    'work_orders': ['id', 'company_id', 'customer_id', 'work_order_number', 'title', 'description', 'status', 'priority', 'scheduled_start', 'scheduled_end', 'actual_start', 'actual_end', 'assigned_to', 'created_by', 'total_amount', 'created_at', 'updated_at'],
    'work_order_line_items': ['id', 'work_order_id', 'item_type', 'description', 'quantity', 'unit_price', 'total_price'],
    'work_order_attachments': ['id', 'work_order_id', 'file_name', 'file_url', 'file_type', 'uploaded_by'],
    'work_order_notes': ['id', 'work_order_id', 'user_id', 'note_type', 'content', 'is_internal', 'created_at'],
    
    // Financial Management
    'invoices': ['id', 'company_id', 'customer_id', 'work_order_id', 'invoice_number', 'status', 'issue_date', 'due_date', 'subtotal', 'tax_amount', 'total_amount', 'created_at'],
    'invoice_line_items': ['id', 'invoice_id', 'description', 'quantity', 'unit_price', 'total_price'],
    'payments': ['id', 'company_id', 'invoice_id', 'amount', 'payment_method', 'received_at', 'status', 'created_at'],
    'payment_methods': ['id', 'company_id', 'name', 'type', 'is_active'],
    
    // Team Management
    'employees': ['id', 'company_id', 'user_id', 'employee_number', 'job_title', 'department', 'hire_date', 'hourly_rate', 'status'],
    'employee_timesheets': ['id', 'employee_id', 'work_order_id', 'start_time', 'end_time', 'break_duration', 'total_hours', 'status'],
    
    // Scheduling & Dispatch
    'schedule_events': ['id', 'work_order_id', 'assigned_to', 'start_time', 'end_time', 'status', 'created_at'],
    
    // Communication & Notifications
    'notifications': ['id', 'company_id', 'user_id', 'type', 'title', 'message', 'status', 'created_at'],
    'messages': ['id', 'company_id', 'customer_id', 'work_order_id', 'sender_type', 'message_type', 'content', 'status', 'created_at'],
    
    // User Management
    'users': ['id', 'auth_user_id', 'company_id', 'role', 'status', 'created_at', 'updated_at'],
    'profiles': ['id', 'user_id', 'first_name', 'last_name', 'phone', 'avatar_url', 'status', 'created_at'],
    'user_dashboard_settings': ['id', 'user_id', 'dashboard_config', 'created_at', 'updated_at'],
    
    // Company Management
    'companies': ['id', 'name', 'company_number', 'email', 'phone', 'time_zone', 'currency', 'created_at'],
    'company_settings': ['id', 'company_id', 'business_hours', 'default_tax_rate', 'invoice_terms', 'created_at'],
    
    // Service Catalog
    'service_categories': ['id', 'company_id', 'name', 'description', 'is_active'],
    'service_types': ['id', 'service_category_id', 'name', 'description', 'default_price', 'is_active'],
    
    // Inventory Management
    'inventory_items': ['id', 'company_id', 'sku', 'name', 'category', 'unit_of_measure', 'cost_price', 'sell_price', 'reorder_point'],
    'inventory_stock': ['id', 'item_id', 'location_id', 'quantity_on_hand', 'quantity_allocated', 'quantity_available'],
    
    // System Tables
    'audit_logs': ['id', 'table_name', 'record_id', 'action', 'old_values', 'new_values', 'user_id', 'created_at']
};

async function auditDeployedSchema() {
    console.log('🚨 CRITICAL SCHEMA AUDIT STARTING...\n');
    
    let client;
    
    try {
        client = new Client(DB_CONFIG);
        await client.connect();
        console.log('✅ Connected to database\n');
        
        // Get all existing tables
        const existingTablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        const existingTables = existingTablesResult.rows.map(row => row.table_name);
        console.log(`📊 EXISTING TABLES (${existingTables.length}):`);
        existingTables.forEach(table => console.log(`  ✅ ${table}`));
        
        console.log('\n🔍 FSM REQUIREMENTS AUDIT:\n');
        
        const missingTables = [];
        const incompleteTableDetails = [];
        
        // Check each required table
        for (const [tableName, requiredColumns] of Object.entries(FSM_REQUIRED_TABLES)) {
            if (!existingTables.includes(tableName)) {
                missingTables.push(tableName);
                console.log(`❌ MISSING TABLE: ${tableName}`);
                console.log(`   Required columns: ${requiredColumns.join(', ')}\n`);
            } else {
                // Check columns for existing table
                const columnsResult = await client.query(`
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = $1 AND table_schema = 'public'
                    ORDER BY ordinal_position
                `, [tableName]);
                
                const existingColumns = columnsResult.rows.map(row => row.column_name);
                const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
                
                if (missingColumns.length > 0) {
                    console.log(`⚠️  INCOMPLETE TABLE: ${tableName}`);
                    console.log(`   Missing columns: ${missingColumns.join(', ')}`);
                    console.log(`   Existing columns: ${existingColumns.join(', ')}\n`);
                    
                    incompleteTableDetails.push({
                        table: tableName,
                        missing: missingColumns,
                        existing: existingColumns
                    });
                } else {
                    console.log(`✅ COMPLETE TABLE: ${tableName}`);
                    console.log(`   All required columns present: ${existingColumns.join(', ')}\n`);
                }
            }
        }
        
        // Summary
        console.log('\n🎯 AUDIT SUMMARY:');
        console.log(`📊 Total FSM Required Tables: ${Object.keys(FSM_REQUIRED_TABLES).length}`);
        console.log(`✅ Tables Present: ${Object.keys(FSM_REQUIRED_TABLES).length - missingTables.length}`);
        console.log(`❌ Tables Missing: ${missingTables.length}`);
        console.log(`⚠️  Tables Incomplete: ${incompleteTableDetails.length}`);
        
        if (missingTables.length > 0) {
            console.log('\n🚨 CRITICAL MISSING TABLES:');
            missingTables.forEach(table => console.log(`  - ${table}`));
        }
        
        if (incompleteTableDetails.length > 0) {
            console.log('\n⚠️  INCOMPLETE TABLES DETAILS:');
            incompleteTableDetails.forEach(detail => {
                console.log(`  ${detail.table}:`);
                console.log(`    Missing: ${detail.missing.join(', ')}`);
            });
        }
        
        // Calculate completion percentage
        const totalRequired = Object.keys(FSM_REQUIRED_TABLES).length;
        const fullyComplete = totalRequired - missingTables.length - incompleteTableDetails.length;
        const completionPercentage = Math.round((fullyComplete / totalRequired) * 100);
        
        console.log(`\n📈 FSM COMPLETION: ${completionPercentage}%`);
        
        if (completionPercentage < 80) {
            console.log('🚨 CRITICAL: Schema is not ready for production FSM use!');
            console.log('🔧 Immediate action required to fill gaps');
        } else if (completionPercentage < 95) {
            console.log('⚠️  WARNING: Schema has significant gaps');
            console.log('🔧 Gaps should be filled before launch');
        } else {
            console.log('✅ GOOD: Schema is mostly FSM-ready');
        }
        
    } catch (error) {
        console.error('❌ AUDIT FAILED:', error.message);
    } finally {
        if (client) {
            await client.end();
        }
    }
}

// Run the audit
if (require.main === module) {
    auditDeployedSchema().catch(error => {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = { auditDeployedSchema };
