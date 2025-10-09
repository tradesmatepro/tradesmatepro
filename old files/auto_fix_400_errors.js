const fetch = require('node-fetch');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

class AutoDatabaseFixer {
    constructor() {
        this.fixes = [];
        this.errors = [];
    }

    async log(message, type = 'info') {
        const icons = { info: '📋', success: '✅', error: '❌', warning: '⚠️', fix: '🔧' };
        console.log(`${icons[type]} ${message}`);
    }

    async testAndFix(testName, testFn, fixFn) {
        try {
            await this.log(`Testing: ${testName}`, 'info');
            const result = await testFn();
            
            if (result.success) {
                await this.log(`${testName}: PASSED`, 'success');
                return true;
            } else {
                await this.log(`${testName}: FAILED - ${result.error}`, 'error');
                
                if (fixFn) {
                    await this.log(`Applying fix for: ${testName}`, 'fix');
                    const fixResult = await fixFn(result.error);
                    
                    if (fixResult.success) {
                        await this.log(`Fix applied successfully for: ${testName}`, 'success');
                        this.fixes.push(testName);
                        
                        // Re-test after fix
                        const retestResult = await testFn();
                        if (retestResult.success) {
                            await this.log(`Re-test PASSED: ${testName}`, 'success');
                            return true;
                        } else {
                            await this.log(`Re-test FAILED: ${testName} - ${retestResult.error}`, 'error');
                            this.errors.push(`${testName}: ${retestResult.error}`);
                            return false;
                        }
                    } else {
                        await this.log(`Fix FAILED for: ${testName} - ${fixResult.error}`, 'error');
                        this.errors.push(`${testName}: ${fixResult.error}`);
                        return false;
                    }
                } else {
                    this.errors.push(`${testName}: ${result.error}`);
                    return false;
                }
            }
        } catch (error) {
            await this.log(`Exception in ${testName}: ${error.message}`, 'error');
            this.errors.push(`${testName}: ${error.message}`);
            return false;
        }
    }

    async makeRequest(endpoint, options = {}) {
        const defaultHeaders = {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
            headers: {
                ...defaultHeaders,
                ...options.headers
            },
            ...options
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

    // Test 1: Check if created_via column exists
    async testCreatedViaColumn() {
        return {
            success: false,
            error: 'created_via column missing - will test with insert'
        };
    }

    async fixCreatedViaColumn() {
        // We can't run ALTER TABLE via REST API, so we'll use a workaround
        // Try to insert a record and see what specific error we get
        const testResult = await this.makeRequest('customers', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Test Customer',
                email: 'test-created-via@example.com',
                created_via: 'self_signup',
                status: 'ACTIVE'  // Add status to avoid constraint issues
            }),
            headers: { 'Prefer': 'return=minimal' }
        });

        if (testResult.ok) {
            // Clean up test record
            await this.makeRequest('customers?email=eq.test-created-via@example.com', {
                method: 'DELETE'
            });
            return { success: true };
        } else {
            return { 
                success: false, 
                error: `Cannot add created_via column via API. Manual SQL needed: ${testResult.text}` 
            };
        }
    }

    // Test 2: Check customer status constraint
    async testCustomerStatusConstraint() {
        const testResult = await this.makeRequest('customers', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Test Status Customer',
                email: 'test-status@example.com',
                status: 'ACTIVE'
            }),
            headers: { 'Prefer': 'return=minimal' }
        });

        if (testResult.ok) {
            // Clean up
            await this.makeRequest('customers?email=eq.test-status@example.com', {
                method: 'DELETE'
            });
            return { success: true };
        } else {
            return { 
                success: false, 
                error: testResult.text 
            };
        }
    }

    async fixCustomerStatusConstraint(error) {
        // If it's a status constraint issue, we need to find valid values
        if (error.includes('status_check')) {
            await this.log('Status constraint violation detected. Checking valid values...', 'warning');
            
            // Get existing customer to see what status values work
            const existingResult = await this.makeRequest('customers?limit=1');
            if (existingResult.ok && existingResult.data.length > 0) {
                const validStatus = existingResult.data[0].status;
                await this.log(`Found valid status value: ${validStatus}`, 'info');
                
                // Test with the valid status
                const retestResult = await this.makeRequest('customers', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: 'Test Status Fix',
                        email: 'test-status-fix@example.com',
                        status: validStatus
                    }),
                    headers: { 'Prefer': 'return=minimal' }
                });

                if (retestResult.ok) {
                    await this.makeRequest('customers?email=eq.test-status-fix@example.com', {
                        method: 'DELETE'
                    });
                    return { success: true, validStatus };
                }
            }
        }
        
        return { success: false, error: 'Could not determine valid status values' };
    }

    // Test 3: Check customer portal accounts structure
    async testPortalAccountsStructure() {
        const result = await this.makeRequest('customer_portal_accounts?limit=1');
        
        if (!result.ok) {
            return { success: false, error: result.text };
        }

        // Check if we can insert a test record with required fields
        const testResult = await this.makeRequest('customer_portal_accounts', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test-portal@example.com',
                is_active: true
            }),
            headers: { 'Prefer': 'return=minimal' }
        });

        if (testResult.ok) {
            await this.makeRequest('customer_portal_accounts?email=eq.test-portal@example.com', {
                method: 'DELETE'
            });
            return { success: true };
        } else {
            return { success: false, error: testResult.text };
        }
    }

    async fixPortalAccountsStructure(error) {
        return { 
            success: false, 
            error: `Portal accounts structure issue requires manual SQL: ${error}` 
        };
    }

    // Test 4: Test actual signup flow
    async testSignupFlow() {
        const testData = {
            name: 'Auto Test Customer',
            email: 'auto-test@example.com',
            phone: '555-123-4567',
            street_address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zip_code: '12345',
            status: 'ACTIVE'  // Use a status that should work
        };

        const result = await this.makeRequest('customers', {
            method: 'POST',
            body: JSON.stringify(testData),
            headers: { 'Prefer': 'return=representation' }
        });

        if (result.ok) {
            // Clean up
            await this.makeRequest(`customers?email=eq.${testData.email}`, {
                method: 'DELETE'
            });
            return { success: true };
        } else {
            return { success: false, error: result.text };
        }
    }

    async fixSignupFlow(error) {
        // Analyze the error and provide specific fixes
        if (error.includes('created_via')) {
            return { 
                success: false, 
                error: 'MANUAL SQL REQUIRED: ALTER TABLE customers ADD COLUMN created_via TEXT DEFAULT \'manual\';' 
            };
        }
        
        if (error.includes('status_check')) {
            // Try to find valid status values
            const existingResult = await this.makeRequest('customers?limit=1');
            if (existingResult.ok && existingResult.data.length > 0) {
                const validStatus = existingResult.data[0].status;
                return { 
                    success: true, 
                    message: `Use status: '${validStatus}' instead of 'ACTIVE'` 
                };
            }
        }

        return { success: false, error: `Signup flow issue: ${error}` };
    }

    async runAllTests() {
        await this.log('🚀 Starting Automated Database Fix System', 'info');
        await this.log('=' .repeat(60), 'info');

        const tests = [
            {
                name: 'Customer Status Constraint',
                test: () => this.testCustomerStatusConstraint(),
                fix: (error) => this.fixCustomerStatusConstraint(error)
            },
            {
                name: 'Portal Accounts Structure',
                test: () => this.testPortalAccountsStructure(),
                fix: (error) => this.fixPortalAccountsStructure(error)
            },
            {
                name: 'Customer Signup Flow',
                test: () => this.testSignupFlow(),
                fix: (error) => this.fixSignupFlow(error)
            },
            {
                name: 'Created Via Column',
                test: () => this.testCreatedViaColumn(),
                fix: () => this.fixCreatedViaColumn()
            }
        ];

        for (const test of tests) {
            await this.testAndFix(test.name, test.test, test.fix);
            await this.log('', 'info'); // Empty line for readability
        }

        // Summary
        await this.log('📊 AUTOMATED FIX SUMMARY', 'info');
        await this.log('=' .repeat(60), 'info');
        
        if (this.fixes.length > 0) {
            await this.log(`✅ Successfully fixed: ${this.fixes.join(', ')}`, 'success');
        }
        
        if (this.errors.length > 0) {
            await this.log(`❌ Manual fixes needed:`, 'error');
            for (const error of this.errors) {
                await this.log(`   • ${error}`, 'error');
            }
        }

        // Provide manual SQL if needed
        if (this.errors.some(e => e.includes('created_via'))) {
            await this.log('', 'info');
            await this.log('🔧 REQUIRED MANUAL SQL:', 'fix');
            await this.log('Copy and paste this into Supabase SQL Editor:', 'info');
            await this.log('', 'info');
            await this.log('ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT \'manual\';', 'fix');
            await this.log('UPDATE public.customers SET created_via = \'manual\' WHERE created_via IS NULL;', 'fix');
        }

        return {
            fixesApplied: this.fixes.length,
            errorsRemaining: this.errors.length,
            fixes: this.fixes,
            errors: this.errors
        };
    }
}

// Run the automated fixer
const fixer = new AutoDatabaseFixer();
fixer.runAllTests().then(result => {
    console.log('\n🎯 FINAL RESULT:', result);
}).catch(console.error);
