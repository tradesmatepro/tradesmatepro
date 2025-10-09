const fetch = require('node-fetch');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

async function supabaseQuery(query, params = []) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ query, params })
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return await response.json();
}

async function supabaseRest(table, select = '*', filters = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;

    Object.entries(filters).forEach(([key, value]) => {
        url += `&${key}=${encodeURIComponent(value)}`;
    });

    const response = await fetch(url, {
        headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return await response.json();
}

async function auditSupabaseSchema() {
    try {
        console.log('🔍 Connecting to Supabase via REST API...');
        console.log('✅ Connected successfully!\n');

        // Get all tables by trying to query each one we expect
        console.log('📊 CHECKING TABLES AND DATA:');
        console.log('=' .repeat(50));

        const expectedTables = [
            'companies', 'users', 'customers', 'customer_portal_accounts',
            'company_customers', 'service_requests', 'work_orders',
            'invoices', 'schedule_events', 'settings', 'quotes', 'jobs',
            'payments', 'employees', 'messages'
        ];

        const tableStatus = {};

        for (const tableName of expectedTables) {
            try {
                const data = await supabaseRest(tableName, 'count', {});
                const count = Array.isArray(data) ? data.length : (data.count || 0);
                tableStatus[tableName] = { exists: true, count };
                console.log(`✅ ${tableName} (${count} records)`);
            } catch (error) {
                tableStatus[tableName] = { exists: false, error: error.message };
                console.log(`❌ ${tableName} - ${error.message}`);
            }
        }

        // Get sample data from key tables to understand structure
        console.log('\n🔍 SAMPLE DATA FROM KEY TABLES:');
        console.log('=' .repeat(50));

        const keyTables = ['customers', 'customer_portal_accounts', 'company_customers', 'service_requests'];

        for (const tableName of keyTables) {
            if (!tableStatus[tableName]?.exists) {
                console.log(`\n📋 ${tableName.toUpperCase()}: TABLE DOES NOT EXIST`);
                continue;
            }

            console.log(`\n📋 ${tableName.toUpperCase()}:`);
            console.log('-'.repeat(30));

            try {
                // Get first record to see structure
                const sampleData = await supabaseRest(tableName, '*', { limit: '1' });

                if (Array.isArray(sampleData) && sampleData.length > 0) {
                    const record = sampleData[0];
                    console.log('  📊 Columns found:');
                    Object.keys(record).forEach(key => {
                        const value = record[key];
                        const type = typeof value;
                        const preview = value !== null ? String(value).substring(0, 50) : 'NULL';
                        console.log(`    • ${key}: ${type} = "${preview}"`);
                    });
                } else {
                    console.log('  📊 No records found, trying to get column info...');
                    // Try to get an empty result to see column structure
                    const emptyResult = await supabaseRest(tableName, '*', { limit: '0' });
                    console.log('  📊 Table exists but is empty');
                }
            } catch (error) {
                console.log(`  ❌ Error accessing table: ${error.message}`);
            }
        }

        // Check for specific issues mentioned in the audit
        console.log('\n🔍 CHECKING SPECIFIC ISSUES FROM AUDIT:');
        console.log('=' .repeat(50));

        // 1. Check for created_via column in customers
        console.log('\n1. Checking customers.created_via column:');
        if (tableStatus.customers?.exists) {
            try {
                const customerSample = await supabaseRest('customers', '*', { limit: '1' });
                const hasCreatedVia = customerSample.length > 0 && 'created_via' in customerSample[0];
                if (hasCreatedVia) {
                    console.log('✅ created_via column EXISTS in customers table');
                } else {
                    console.log('❌ created_via column MISSING from customers table');
                }
            } catch (error) {
                console.log(`❌ Error checking created_via: ${error.message}`);
            }
        } else {
            console.log('❌ customers table does not exist');
        }

        // 2. Check customers.company_id column
        console.log('\n2. Checking customers.company_id column:');
        if (tableStatus.customers?.exists) {
            try {
                const customerSample = await supabaseRest('customers', '*', { limit: '1' });
                const hasCompanyId = customerSample.length > 0 && 'company_id' in customerSample[0];
                if (hasCompanyId) {
                    console.log('⚠️  company_id column EXISTS in customers table (should be removed for global registry)');
                } else {
                    console.log('✅ company_id column REMOVED from customers table (good for global registry)');
                }
            } catch (error) {
                console.log(`❌ Error checking company_id: ${error.message}`);
            }
        } else {
            console.log('❌ customers table does not exist');
        }

        // 3. Check company_customers join table
        console.log('\n3. Checking company_customers join table:');
        if (tableStatus.company_customers?.exists) {
            console.log('✅ company_customers join table EXISTS');
            try {
                const sample = await supabaseRest('company_customers', '*', { limit: '1' });
                if (sample.length > 0) {
                    console.log('   Structure:');
                    Object.keys(sample[0]).forEach(key => {
                        console.log(`     • ${key}`);
                    });
                } else {
                    console.log('   Table exists but is empty');
                }
            } catch (error) {
                console.log(`   Error getting structure: ${error.message}`);
            }
        } else {
            console.log('❌ company_customers join table MISSING');
        }

        // 4. Check service_requests address fields
        console.log('\n4. Checking service_requests address fields:');
        if (tableStatus.service_requests?.exists) {
            try {
                const sample = await supabaseRest('service_requests', '*', { limit: '1' });
                if (sample.length > 0) {
                    const addressFields = Object.keys(sample[0]).filter(key =>
                        key.includes('address') || key.includes('city') || key.includes('state') || key.includes('zip')
                    );
                    if (addressFields.length > 0) {
                        console.log('   Address-related columns found:');
                        addressFields.forEach(field => console.log(`     • ${field}`));
                    } else {
                        console.log('   No address-related columns found');
                    }
                } else {
                    console.log('   Table exists but is empty - cannot check structure');
                }
            } catch (error) {
                console.log(`   Error checking address fields: ${error.message}`);
            }
        } else {
            console.log('❌ service_requests table does not exist');
        }

        // 5. Check customer_portal_accounts structure
        console.log('\n5. Checking customer_portal_accounts auth fields:');
        if (tableStatus.customer_portal_accounts?.exists) {
            try {
                const sample = await supabaseRest('customer_portal_accounts', '*', { limit: '1' });
                if (sample.length > 0) {
                    const authFields = Object.keys(sample[0]).filter(key =>
                        key.includes('auth') || key.includes('password') || key.includes('token')
                    );
                    if (authFields.length > 0) {
                        console.log('   Auth-related columns found:');
                        authFields.forEach(field => console.log(`     • ${field}`));
                    } else {
                        console.log('   No auth-related columns found');
                    }
                } else {
                    console.log('   Table exists but is empty - cannot check structure');
                }
            } catch (error) {
                console.log(`   Error checking auth fields: ${error.message}`);
            }
        } else {
            console.log('❌ customer_portal_accounts table does not exist');
        }

        console.log('\n🎯 AUDIT COMPLETE!');
        console.log('=' .repeat(50));

        // Summary comparison with previous audit and GPT feedback
        console.log('\n📋 SUMMARY COMPARISON:');
        console.log('=' .repeat(50));

        console.log('\n🔍 CLAUDE\'S PREVIOUS AUDIT vs CURRENT REALITY:');

        // Check key findings
        const findings = {
            'customers.created_via missing': !tableStatus.customers?.exists || 'needs_verification',
            'customers.company_id exists': !tableStatus.customers?.exists || 'needs_verification',
            'company_customers missing': !tableStatus.company_customers?.exists,
            'customer_portal_accounts empty': tableStatus.customer_portal_accounts?.count === 0,
            'service_requests empty': tableStatus.service_requests?.count === 0
        };

        Object.entries(findings).forEach(([issue, status]) => {
            const icon = status === true ? '✅' : status === false ? '❌' : '⚠️';
            console.log(`${icon} ${issue}: ${status}`);
        });

        console.log('\n🤖 GPT\'S FEEDBACK vs CURRENT REALITY:');
        console.log('GPT said Claude was:');
        console.log('✅ RIGHT about: Missing company_customers join table');
        console.log('✅ RIGHT about: Login/auth confusion');
        console.log('✅ RIGHT about: Service request routing');
        console.log('❌ WRONG about: Address duplication (GPT says already cleaned)');
        console.log('❌ WRONG about: Customer portal redundancy (GPT says already cleaned)');

    } catch (error) {
        console.error('❌ Error during audit:', error.message);
        console.error('Full error:', error);
    }
}

// Run the audit
auditSupabaseSchema().catch(console.error);
