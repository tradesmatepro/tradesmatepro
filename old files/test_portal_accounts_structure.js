const fetch = require('node-fetch');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

async function testPortalAccountsStructure() {
    console.log('🔍 TESTING PORTAL ACCOUNTS STRUCTURE');
    console.log('=' .repeat(50));

    try {
        // Get a sample portal account to see the structure
        const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_portal_accounts?limit=1`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Portal accounts accessible');
            console.log(`   Records found: ${data.length}`);
            
            if (data.length > 0) {
                const account = data[0];
                console.log('\n📊 Available columns:');
                Object.keys(account).forEach(key => {
                    console.log(`   ${key}: ${typeof account[key]} = ${account[key]}`);
                });

                // Test updating just last_login_at
                console.log('\n🔧 Testing last_login_at update...');
                const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/customer_portal_accounts?id=eq.${account.id}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        last_login_at: new Date().toISOString()
                    })
                });

                if (updateResponse.ok) {
                    console.log('✅ last_login_at update works');
                } else {
                    const error = await updateResponse.text();
                    console.log('❌ last_login_at update failed:', error);
                }

                // Test updating with updated_at
                console.log('\n🔧 Testing updated_at column...');
                const updateResponse2 = await fetch(`${SUPABASE_URL}/rest/v1/customer_portal_accounts?id=eq.${account.id}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        last_login_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                });

                if (updateResponse2.ok) {
                    console.log('✅ updated_at column works');
                } else {
                    const error = await updateResponse2.text();
                    console.log('❌ updated_at column failed:', error);
                }

            } else {
                console.log('⚠️  No portal accounts found to test structure');
            }
        } else {
            const error = await response.text();
            console.log('❌ Portal accounts not accessible:', error);
        }

        // Test customer creation with the exact values from the logs
        console.log('\n🔧 Testing customer creation for cbrown@cgrenewables.com...');
        
        const testCustomerData = {
            name: 'Test Customer',
            email: 'test-pipeline@example.com',
            phone: '555-123-4567',
            street_address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zip_code: '12345',
            country: 'United States',
            customer_type: 'COMMERCIAL',
            status: 'active',
            created_via: 'self_signup'
        };

        const customerResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(testCustomerData)
        });

        if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            console.log('✅ Customer creation works');
            console.log('   Customer ID:', customerData[0].id);
            
            // Clean up
            await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${customerData[0].id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                }
            });
            console.log('✅ Test customer cleaned up');
            
        } else {
            const error = await customerResponse.text();
            console.log('❌ Customer creation failed:', error);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testPortalAccountsStructure().catch(console.error);
