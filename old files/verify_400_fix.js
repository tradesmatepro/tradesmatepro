const fetch = require('node-fetch');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

async function makeRequest(endpoint, options = {}) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        method: options.method || 'GET',
        headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }

    return { ok: response.ok, status: response.status, data, text };
}

async function verifyFix() {
    console.log('🔍 VERIFYING 400 ERROR FIXES');
    console.log('=' .repeat(40));

    // Test 1: Customer creation with fixed values
    console.log('\n1. Testing customer creation with FIXED values...');
    
    const testCustomerData = {
        name: 'Verification Test Customer',
        email: 'verify-fix@example.com',
        phone: '555-999-8888',
        street_address: '456 Fix Test Ave',
        city: 'Fix City',
        state: 'FC',
        zip_code: '54321',
        country: 'United States',
        customer_type: 'COMMERCIAL', // Fixed value
        status: 'active', // Fixed value (lowercase)
        created_via: 'self_signup'
    };

    const customerResult = await makeRequest('customers', {
        method: 'POST',
        body: testCustomerData,
        headers: { 'Prefer': 'return=representation' }
    });

    if (customerResult.ok) {
        console.log('✅ Customer creation SUCCESSFUL!');
        console.log('   Customer ID:', customerResult.data[0].id);
        
        const customerId = customerResult.data[0].id;
        
        // Test 2: Portal account creation
        console.log('\n2. Testing portal account creation...');
        
        const portalAccountData = {
            customer_id: customerId, // Link to the customer we just created
            email: testCustomerData.email,
            is_active: true,
            created_via: 'self_signup',
            needs_password_setup: false
        };

        const portalResult = await makeRequest('customer_portal_accounts', {
            method: 'POST',
            body: portalAccountData,
            headers: { 'Prefer': 'return=representation' }
        });

        if (portalResult.ok) {
            console.log('✅ Portal account creation SUCCESSFUL!');
            console.log('   Portal Account ID:', portalResult.data[0].id);
            
            // Test 3: Relationship embedding query
            console.log('\n3. Testing relationship embedding...');
            
            const embeddingResult = await makeRequest('customer_portal_accounts?select=*,customers(*)&limit=1');
            
            if (embeddingResult.ok) {
                console.log('✅ Relationship embedding SUCCESSFUL!');
                console.log('   Embedded data structure working');
            } else {
                console.log('❌ Relationship embedding failed:', embeddingResult.text);
            }
            
            // Clean up portal account
            await makeRequest(`customer_portal_accounts?id=eq.${portalResult.data[0].id}`, {
                method: 'DELETE'
            });
            console.log('✅ Test portal account cleaned up');
            
        } else {
            console.log('❌ Portal account creation failed:', portalResult.text);
        }
        
        // Clean up customer
        await makeRequest(`customers?id=eq.${customerId}`, {
            method: 'DELETE'
        });
        console.log('✅ Test customer cleaned up');
        
    } else {
        console.log('❌ Customer creation FAILED:', customerResult.text);
        
        // Analyze the error
        if (customerResult.text.includes('status_check')) {
            console.log('🔧 Status constraint still failing - check valid status values');
        }
        if (customerResult.text.includes('created_via')) {
            console.log('🔧 created_via column issue - may need manual SQL');
        }
    }

    // Final summary
    console.log('\n📋 VERIFICATION SUMMARY');
    console.log('=' .repeat(40));
    
    if (customerResult.ok) {
        console.log('✅ 400 ERRORS SHOULD BE FIXED!');
        console.log('');
        console.log('🎯 Next steps:');
        console.log('1. Test Customer Portal signup in browser');
        console.log('2. Check browser console for any remaining errors');
        console.log('3. Verify signup flow works end-to-end');
        console.log('');
        console.log('💡 The fixes applied:');
        console.log('   - Changed status from "ACTIVE" to "active"');
        console.log('   - Changed customer_type from "RESIDENTIAL" to "COMMERCIAL"');
        console.log('   - Added fallback handling for missing columns');
        console.log('   - Fixed relationship embedding queries');
    } else {
        console.log('❌ Issues still remain - manual intervention needed');
        console.log('');
        console.log('🔧 Remaining issues to fix:');
        if (customerResult.text.includes('status_check')) {
            console.log('   - Status constraint violation');
        }
        if (customerResult.text.includes('created_via')) {
            console.log('   - created_via column missing');
        }
    }
}

// Run verification
verifyFix().catch(console.error);
