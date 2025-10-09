const fetch = require('node-fetch');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

// Since we can't run arbitrary SQL via REST API, let's check the current state
// and provide instructions for manual fixes

async function checkTableStructure(tableName) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            }
        });

        if (!response.ok) {
            return { exists: false, error: await response.text() };
        }

        const data = await response.json();
        return {
            exists: true,
            columns: data.length > 0 ? Object.keys(data[0]) : [],
            sampleData: data[0] || null
        };
    } catch (error) {
        return { exists: false, error: error.message };
    }
}

async function checkDatabaseIssues() {
    console.log('🔍 Checking database structure for 400 error causes...\n');

    try {
        // Check 1: customers table structure
        console.log('1. Checking customers table structure...');
        const customersCheck = await checkTableStructure('customers');

        if (customersCheck.exists) {
            console.log('✅ customers table exists');
            console.log('   Columns:', customersCheck.columns.join(', '));

            if (customersCheck.columns.includes('created_via')) {
                console.log('✅ created_via column EXISTS - 400 error should be fixed');
            } else {
                console.log('❌ created_via column MISSING - this is causing 400 errors');
                console.log('   🔧 MANUAL FIX NEEDED: Run this SQL in Supabase SQL Editor:');
                console.log('   ALTER TABLE public.customers ADD COLUMN created_via TEXT DEFAULT \'manual\';');
            }
        } else {
            console.log('❌ customers table does not exist');
        }

        // Check 2: customer_portal_accounts table structure
        console.log('\n2. Checking customer_portal_accounts table structure...');
        const portalCheck = await checkTableStructure('customer_portal_accounts');

        if (portalCheck.exists) {
            console.log('✅ customer_portal_accounts table exists');
            console.log('   Columns:', portalCheck.columns.join(', '));

            const requiredColumns = ['auth_user_id', 'email', 'is_active', 'customer_id'];
            const missingColumns = requiredColumns.filter(col => !portalCheck.columns.includes(col));

            if (missingColumns.length === 0) {
                console.log('✅ All required columns exist');
            } else {
                console.log('❌ Missing columns:', missingColumns.join(', '));
                console.log('   🔧 MANUAL FIX NEEDED: Add missing columns in Supabase SQL Editor');
            }
        } else {
            console.log('❌ customer_portal_accounts table does not exist');
        }

        // Check 3: Test a simple insert to see what fails
        console.log('\n3. Testing customer insert to identify exact 400 error cause...');
        try {
            // Try to insert a test customer with created_via
            const testInsert = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    name: 'Test Customer',
                    email: 'test@example.com',
                    created_via: 'self_signup'
                })
            });

            if (testInsert.ok) {
                console.log('✅ Test insert with created_via SUCCEEDED - column exists');
                // Clean up test record
                await fetch(`${SUPABASE_URL}/rest/v1/customers?email=eq.test@example.com`, {
                    method: 'DELETE',
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    }
                });
            } else {
                const error = await testInsert.text();
                console.log('❌ Test insert FAILED:', error);

                if (error.includes('created_via')) {
                    console.log('🔧 CONFIRMED: created_via column is missing');
                }
            }
        } catch (error) {
            console.log('❌ Test insert error:', error.message);
        }

        console.log('\n📋 SUMMARY OF REQUIRED FIXES:');
        console.log('=' .repeat(50));

        console.log('\n🔧 TO FIX 400 ERRORS, RUN THIS SQL IN SUPABASE SQL EDITOR:');
        console.log('```sql');
        console.log('-- Add missing created_via column');
        console.log('ALTER TABLE public.customers');
        console.log('ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT \'manual\'');
        console.log('CHECK (created_via IN (\'manual\', \'self_signup\', \'contractor_invite\'));');
        console.log('');
        console.log('-- Update existing records');
        console.log('UPDATE public.customers SET created_via = \'manual\' WHERE created_via IS NULL;');
        console.log('```');

        console.log('\n📋 AFTER RUNNING SQL:');
        console.log('1. Test Customer Portal signup - should work without 400 errors');
        console.log('2. Check browser console for any remaining errors');
        console.log('3. Test relationship embedding in portal account loading');

        console.log('\n💡 The Customer Portal code has been updated with fallback handling');
        console.log('   so it should work even if some columns are missing temporarily.');

    } catch (error) {
        console.error('❌ Error checking database:', error.message);
    }
}

// Run the checks
checkDatabaseIssues().catch(console.error);
