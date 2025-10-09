// Direct Supabase client approach to create missing tables
const { createClient } = require('@supabase/supabase-js');

// Use the correct credentials from the codebase
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createMissingTables() {
    console.log('🚀 CREATING MISSING TABLES FOR TRADEMATE PRO');
    console.log('=' .repeat(70));
    console.log('📋 Using direct table creation approach');
    console.log('📋 Target: Fix all 44 network errors');
    console.log('');

    try {
        // PHASE 1: Create Missing Sales/CRM Tables
        console.log('📋 PHASE 1: CREATING MISSING SALES/CRM TABLES');
        console.log('-'.repeat(50));
        
        // Create leads table
        console.log('   Creating leads table...');
        const { error: leadsError } = await supabase
            .from('leads')
            .select('id')
            .limit(1);
        
        if (leadsError && leadsError.code === 'PGRST116') {
            // Table doesn't exist, create sample data to trigger table creation
            console.log('   ❌ Leads table missing - creating via REST API...');
            
            // Try to create the table by inserting data (this will fail but show us the structure needed)
            const { error: insertError } = await supabase
                .from('leads')
                .insert([{
                    company_id: '00000000-0000-0000-0000-000000000000',
                    first_name: 'Test',
                    last_name: 'Lead',
                    email: 'test@example.com',
                    source: 'website',
                    status: 'new'
                }]);
            
            console.log('   Insert error (expected):', insertError?.message);
        } else {
            console.log('   ✅ Leads table exists');
        }

        // Create opportunities table
        console.log('   Creating opportunities table...');
        const { error: opportunitiesError } = await supabase
            .from('opportunities')
            .select('id')
            .limit(1);
        
        if (opportunitiesError && opportunitiesError.code === 'PGRST116') {
            console.log('   ❌ Opportunities table missing');
        } else {
            console.log('   ✅ Opportunities table exists');
        }

        // Create sales_activities table
        console.log('   Creating sales_activities table...');
        const { error: salesActivitiesError } = await supabase
            .from('sales_activities')
            .select('id')
            .limit(1);
        
        if (salesActivitiesError && salesActivitiesError.code === 'PGRST116') {
            console.log('   ❌ Sales_activities table missing');
        } else {
            console.log('   ✅ Sales_activities table exists');
        }

        // PHASE 2: Create Missing Customer Management Tables
        console.log('\n📋 PHASE 2: CREATING MISSING CUSTOMER MANAGEMENT TABLES');
        console.log('-'.repeat(50));
        
        // Check customer_service_agreements
        console.log('   Checking customer_service_agreements table...');
        const { error: csaError } = await supabase
            .from('customer_service_agreements')
            .select('id')
            .limit(1);
        
        if (csaError && csaError.code === 'PGRST116') {
            console.log('   ❌ Customer_service_agreements table missing');
        } else {
            console.log('   ✅ Customer_service_agreements table exists');
        }

        // Check customer_tags
        console.log('   Checking customer_tags table...');
        const { error: tagsError } = await supabase
            .from('customer_tags')
            .select('id')
            .limit(1);
        
        if (tagsError && tagsError.code === 'PGRST116') {
            console.log('   ❌ Customer_tags table missing');
        } else {
            console.log('   ✅ Customer_tags table exists');
        }

        // Check customer_communications
        console.log('   Checking customer_communications table...');
        const { error: commError } = await supabase
            .from('customer_communications')
            .select('id')
            .limit(1);
        
        if (commError && commError.code === 'PGRST116') {
            console.log('   ❌ Customer_communications table missing');
        } else {
            console.log('   ✅ Customer_communications table exists');
        }

        // Check company_customers_view
        console.log('   Checking company_customers_view...');
        const { error: viewError } = await supabase
            .from('company_customers_view')
            .select('id')
            .limit(1);
        
        if (viewError && viewError.code === 'PGRST116') {
            console.log('   ❌ Company_customers_view missing');
        } else {
            console.log('   ✅ Company_customers_view exists');
        }

        // PHASE 3: Create Missing Quote Enhancement Tables
        console.log('\n📋 PHASE 3: CREATING MISSING QUOTE ENHANCEMENT TABLES');
        console.log('-'.repeat(50));
        
        // Check quote_follow_ups
        console.log('   Checking quote_follow_ups table...');
        const { error: followUpsError } = await supabase
            .from('quote_follow_ups')
            .select('id')
            .limit(1);
        
        if (followUpsError && followUpsError.code === 'PGRST116') {
            console.log('   ❌ Quote_follow_ups table missing');
        } else {
            console.log('   ✅ Quote_follow_ups table exists');
        }

        // Check quote_analytics
        console.log('   Checking quote_analytics table...');
        const { error: analyticsError } = await supabase
            .from('quote_analytics')
            .select('id')
            .limit(1);
        
        if (analyticsError && analyticsError.code === 'PGRST116') {
            console.log('   ❌ Quote_analytics table missing');
        } else {
            console.log('   ✅ Quote_analytics table exists');
        }

        // Check quote_approval_workflows
        console.log('   Checking quote_approval_workflows table...');
        const { error: workflowsError } = await supabase
            .from('quote_approval_workflows')
            .select('id')
            .limit(1);
        
        if (workflowsError && workflowsError.code === 'PGRST116') {
            console.log('   ❌ Quote_approval_workflows table missing');
        } else {
            console.log('   ✅ Quote_approval_workflows table exists');
        }

        console.log('\n📋 PHASE 4: CHECKING EXISTING TABLES');
        console.log('-'.repeat(50));
        
        // Check what tables DO exist
        const { data: existingTables, error: tablesError } = await supabase
            .rpc('get_table_names');
        
        if (tablesError) {
            console.log('   ❌ Could not get table names:', tablesError.message);
        } else {
            console.log('   ✅ Existing tables:', existingTables);
        }

        console.log('\n🎯 SUMMARY: TABLE CREATION STATUS');
        console.log('=' .repeat(70));
        console.log('❌ Missing tables identified - need manual SQL creation');
        console.log('📋 Supabase REST API cannot create tables directly');
        console.log('📋 Need to use SQL DDL commands via database connection');
        console.log('');
        console.log('🔧 NEXT STEPS:');
        console.log('1. Use Supabase dashboard SQL editor');
        console.log('2. Or use direct PostgreSQL connection');
        console.log('3. Execute the comprehensive SQL schema');

    } catch (error) {
        console.log('❌ Error during table creation check:', error.message);
        console.error('Full error:', error);
    }
}

createMissingTables().catch(console.error);
