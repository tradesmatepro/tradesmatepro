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

async function diagnoseAndFix() {
    console.log('🔍 TARGETED 400 ERROR DIAGNOSIS & FIX');
    console.log('=' .repeat(50));

    // Step 1: Get existing customer to understand valid status values
    console.log('\n1. Analyzing existing customer data...');
    const existingCustomer = await makeRequest('customers?limit=1');
    
    if (existingCustomer.ok && existingCustomer.data.length > 0) {
        const customer = existingCustomer.data[0];
        console.log('✅ Found existing customer');
        console.log('   Valid status value:', customer.status);
        console.log('   Available columns:', Object.keys(customer).join(', '));
        
        const hasCreatedVia = 'created_via' in customer;
        console.log('   Has created_via column:', hasCreatedVia ? '✅ YES' : '❌ NO');
        
        // Step 2: Test customer creation with valid status
        console.log('\n2. Testing customer creation with valid status...');
        const testCustomerData = {
            name: 'Test Customer Fix',
            email: 'test-fix@example.com',
            phone: '555-123-4567',
            street_address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zip_code: '12345',
            status: customer.status, // Use the valid status from existing customer
            customer_type: customer.customer_type || 'RESIDENTIAL'
        };

        // Add created_via only if the column exists
        if (hasCreatedVia) {
            testCustomerData.created_via = 'self_signup';
        }

        const testResult = await makeRequest('customers', {
            method: 'POST',
            body: testCustomerData,
            headers: { 'Prefer': 'return=representation' }
        });

        if (testResult.ok) {
            console.log('✅ Customer creation test PASSED');
            
            // Clean up test customer
            await makeRequest(`customers?email=eq.${testCustomerData.email}`, {
                method: 'DELETE'
            });
            
            console.log('✅ Test customer cleaned up');
            
            // Step 3: Update Customer Portal code with working values
            console.log('\n3. Generating Customer Portal fix...');
            
            const portalFix = `
// AUTOMATED FIX FOR CUSTOMER PORTAL
// Replace the customer creation in CustomerContext.js selfSignup function

const customerData = {
    name: customerData.name,
    email: customerData.email,
    phone: customerData.phone,
    street_address: customerData.street_address,
    city: customerData.city,
    state: customerData.state,
    zip_code: customerData.zip_code,
    country: 'United States',
    customer_type: '${customer.customer_type || 'RESIDENTIAL'}',
    status: '${customer.status}', // Use this exact status value
    ${hasCreatedVia ? "created_via: 'self_signup'" : '// created_via column not available'}
};`;

            console.log('📋 CUSTOMER PORTAL FIX:');
            console.log(portalFix);
            
        } else {
            console.log('❌ Customer creation test FAILED');
            console.log('   Error:', testResult.text);
            
            // Analyze the specific error
            if (testResult.text.includes('created_via')) {
                console.log('\n🔧 ISSUE: created_via column missing');
                console.log('   SOLUTION: Run this SQL in Supabase SQL Editor:');
                console.log('   ALTER TABLE public.customers ADD COLUMN created_via TEXT DEFAULT \'manual\';');
            }
            
            if (testResult.text.includes('status_check')) {
                console.log('\n🔧 ISSUE: Invalid status value');
                console.log(`   SOLUTION: Use status '${customer.status}' instead of 'ACTIVE'`);
            }
        }
        
    } else {
        console.log('❌ No existing customers found');
        console.log('   Cannot determine valid status values');
    }

    // Step 4: Check customer_portal_accounts structure
    console.log('\n4. Checking customer_portal_accounts structure...');
    const portalTest = await makeRequest('customer_portal_accounts?limit=1');
    
    if (portalTest.ok) {
        if (portalTest.data.length > 0) {
            console.log('✅ customer_portal_accounts has data');
            console.log('   Columns:', Object.keys(portalTest.data[0]).join(', '));
        } else {
            console.log('⚠️  customer_portal_accounts exists but is empty');
            
            // Test if we can insert a basic portal account
            const portalTestData = {
                email: 'test-portal@example.com',
                is_active: true
            };
            
            const portalInsertTest = await makeRequest('customer_portal_accounts', {
                method: 'POST',
                body: portalTestData,
                headers: { 'Prefer': 'return=minimal' }
            });
            
            if (portalInsertTest.ok) {
                console.log('✅ Portal account creation works');
                // Clean up
                await makeRequest('customer_portal_accounts?email=eq.test-portal@example.com', {
                    method: 'DELETE'
                });
            } else {
                console.log('❌ Portal account creation failed:', portalInsertTest.text);
            }
        }
    } else {
        console.log('❌ customer_portal_accounts table issue:', portalTest.text);
    }

    // Step 5: Generate comprehensive fix instructions
    console.log('\n📋 COMPREHENSIVE FIX INSTRUCTIONS:');
    console.log('=' .repeat(50));
    
    if (existingCustomer.ok && existingCustomer.data.length > 0) {
        const customer = existingCustomer.data[0];
        const hasCreatedVia = 'created_via' in customer;
        
        console.log('\n1. Update Customer Portal signup code:');
        console.log(`   - Use status: '${customer.status}'`);
        console.log(`   - Use customer_type: '${customer.customer_type || 'RESIDENTIAL'}'`);
        
        if (!hasCreatedVia) {
            console.log('\n2. Add created_via column (run in Supabase SQL Editor):');
            console.log('   ALTER TABLE public.customers ADD COLUMN created_via TEXT DEFAULT \'manual\';');
        }
        
        console.log('\n3. Test the Customer Portal signup after these changes');
        
        // Generate the exact code fix
        console.log('\n🔧 EXACT CODE FIX for CustomerContext.js:');
        console.log('Replace lines 330-350 in Customer Portal/src/contexts/CustomerContext.js with:');
        console.log(`
const customerInsertData = {
    name: customerData.name,
    email: customerData.email,
    phone: customerData.phone,
    street_address: customerData.street_address,
    city: customerData.city,
    state: customerData.state,
    zip_code: customerData.zip_code,
    country: 'United States',
    customer_type: '${customer.customer_type || 'RESIDENTIAL'}',
    status: '${customer.status}'${hasCreatedVia ? ',\n    created_via: \'self_signup\'' : ''}
};

const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert(customerInsertData)
    .select()
    .single();`);
    }
}

// Run the diagnosis
diagnoseAndFix().catch(console.error);
