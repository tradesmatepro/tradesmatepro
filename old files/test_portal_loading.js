const fetch = require('node-fetch');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

async function testPortalLoading() {
    console.log('🔍 TESTING CUSTOMER PORTAL LOADING ISSUES');
    console.log('=' .repeat(50));

    try {
        // Test 1: Check if customer_portal_accounts table is accessible
        console.log('\n1. Testing customer_portal_accounts access...');
        const portalResponse = await fetch(`${SUPABASE_URL}/rest/v1/customer_portal_accounts?limit=1`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            }
        });

        if (portalResponse.ok) {
            const portalData = await portalResponse.json();
            console.log('✅ customer_portal_accounts accessible');
            console.log(`   Records found: ${portalData.length}`);
            
            if (portalData.length > 0) {
                console.log('   Sample columns:', Object.keys(portalData[0]).join(', '));
            }
        } else {
            const error = await portalResponse.text();
            console.log('❌ customer_portal_accounts access failed:', error);
        }

        // Test 2: Check if customers table is accessible
        console.log('\n2. Testing customers table access...');
        const customersResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers?limit=1`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            }
        });

        if (customersResponse.ok) {
            const customersData = await customersResponse.json();
            console.log('✅ customers table accessible');
            console.log(`   Records found: ${customersData.length}`);
        } else {
            const error = await customersResponse.text();
            console.log('❌ customers table access failed:', error);
        }

        // Test 3: Test the specific query that might be causing issues
        console.log('\n3. Testing portal account query with auth_user_id...');
        
        // First, let's see if there are any portal accounts with auth_user_id
        const authUserQuery = await fetch(`${SUPABASE_URL}/rest/v1/customer_portal_accounts?select=*&auth_user_id=not.is.null&limit=1`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            }
        });

        if (authUserQuery.ok) {
            const authUserData = await authUserQuery.json();
            console.log('✅ Portal accounts with auth_user_id query works');
            console.log(`   Accounts with auth_user_id: ${authUserData.length}`);
            
            if (authUserData.length > 0) {
                console.log('   Sample auth_user_id:', authUserData[0].auth_user_id);
                
                // Test the exact query the app would make
                const testAuthId = authUserData[0].auth_user_id;
                const exactQuery = await fetch(`${SUPABASE_URL}/rest/v1/customer_portal_accounts?auth_user_id=eq.${testAuthId}&is_active=eq.true`, {
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    }
                });
                
                if (exactQuery.ok) {
                    const exactData = await exactQuery.json();
                    console.log('✅ Exact auth query works');
                    console.log(`   Results: ${exactData.length}`);
                } else {
                    const exactError = await exactQuery.text();
                    console.log('❌ Exact auth query failed:', exactError);
                }
            }
        } else {
            const error = await authUserQuery.text();
            console.log('❌ Auth user query failed:', error);
        }

        // Test 4: Check Supabase Auth users (if accessible)
        console.log('\n4. Testing auth.users access...');
        const authUsersQuery = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            }
        });

        if (authUsersQuery.ok) {
            const authUsersData = await authUsersQuery.json();
            console.log('✅ Auth users accessible');
            console.log(`   Users found: ${authUsersData.users ? authUsersData.users.length : 'unknown'}`);
        } else {
            console.log('⚠️  Auth users not accessible via REST (normal for security)');
        }

        console.log('\n📋 DIAGNOSIS SUMMARY:');
        console.log('=' .repeat(50));
        
        console.log('\n💡 LIKELY CAUSES OF SPINNING WHEEL:');
        console.log('1. CustomerContext.loadCustomerData() might be hanging on a query');
        console.log('2. useEffect dependency array might be causing infinite re-renders');
        console.log('3. Supabase auth session check might be failing silently');
        console.log('4. Database query might be waiting for a response that never comes');
        
        console.log('\n🔧 IMMEDIATE FIXES TO TRY:');
        console.log('1. Check browser console for specific error messages');
        console.log('2. Add console.log statements to CustomerContext to see where it hangs');
        console.log('3. Temporarily disable the loadCustomerData call to isolate the issue');
        console.log('4. Check if the app loads without authentication (public pages)');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testPortalLoading().catch(console.error);
