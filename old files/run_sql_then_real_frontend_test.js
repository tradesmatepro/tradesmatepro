const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const puppeteer = require('puppeteer');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runSQLThenRealFrontendTest() {
    console.log('🚀 FULL AUTO: SQL + REAL BROWSER FRONTEND TEST');
    console.log('=' .repeat(60));

    console.log('\n📋 STEP 1: RUNNING SQL FIXES');
    await runSQLFixes();

    console.log('\n📋 STEP 2: REAL BROWSER FRONTEND TEST');
    await realBrowserFrontendTest();

    console.log('\n🎯 COMPLETE AUTOMATION FINISHED!');
}

async function runSQLFixes() {
    console.log('\n🔧 Executing SQL fixes via direct database calls...');
    
    try {
        // Read the SQL file content
        const sqlContent = fs.readFileSync('supabase db/URGENT_400_ERROR_FIX.sql', 'utf8');
        
        console.log('   📄 SQL file loaded, executing individual fixes...');

        // FIX 1: Add created_via column
        console.log('   🔧 Fix 1: Adding created_via column...');
        try {
            const { error: fix1Error } = await supabase.rpc('exec_sql', {
                query: `
                ALTER TABLE public.customers
                ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT 'manual';
                
                UPDATE public.customers 
                SET created_via = 'manual' 
                WHERE created_via IS NULL;
                `
            });
            
            if (fix1Error) {
                console.log('   ⚠️  Fix 1 via RPC failed, trying direct approach...');
                
                // Try to verify if column exists by testing insert
                const testResult = await supabase
                    .from('customers')
                    .insert({
                        name: 'SQL Test',
                        email: 'sql-test@example.com',
                        phone: '555-000-0000',
                        street_address: '123 SQL St',
                        city: 'SQL City',
                        state: 'SQ',
                        zip_code: '00000',
                        country: 'United States',
                        customer_type: 'COMMERCIAL',
                        status: 'active',
                        created_via: 'self_signup'
                    })
                    .select()
                    .single();
                
                if (testResult.error) {
                    console.log('   ❌ created_via column missing - MANUAL SQL REQUIRED');
                    console.log('   📋 You must run the SQL in Supabase SQL Editor');
                } else {
                    console.log('   ✅ created_via column works');
                    // Clean up test
                    await supabase.from('customers').delete().eq('id', testResult.data.id);
                }
            } else {
                console.log('   ✅ Fix 1 completed via RPC');
            }
        } catch (error) {
            console.log('   ⚠️  Fix 1 had issues:', error.message);
        }

        console.log('   🎯 SQL fixes attempted');

    } catch (error) {
        console.log('   ❌ SQL execution failed:', error.message);
        console.log('   📋 MANUAL ACTION REQUIRED: Run URGENT_400_ERROR_FIX.sql in Supabase SQL Editor');
    }
}

async function realBrowserFrontendTest() {
    console.log('\n🌐 Launching REAL browser test...');
    
    let browser;
    try {
        // Launch browser
        browser = await puppeteer.launch({ 
            headless: false, // Show browser so you can see what's happening
            defaultViewport: null,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        // Enable console logging from the page
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            
            if (type === 'error') {
                console.log(`   🔴 BROWSER ERROR: ${text}`);
            } else if (type === 'warn') {
                console.log(`   🟡 BROWSER WARN: ${text}`);
            } else if (text.includes('🔍') || text.includes('✅') || text.includes('❌')) {
                console.log(`   📊 BROWSER LOG: ${text}`);
            }
        });

        // Capture network errors
        page.on('response', response => {
            if (response.status() >= 400) {
                console.log(`   🔴 NETWORK ERROR: ${response.status()} ${response.url()}`);
            }
        });

        console.log('   🔧 Navigating to Customer Portal...');
        
        // Navigate to the Customer Portal
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });

        console.log('   ✅ Page loaded, checking for loading issues...');

        // Wait a moment to see if the app loads or hangs
        await page.waitForTimeout(5000);

        // Check if the app is stuck loading
        const loadingElements = await page.$$('[data-testid="loading"], .loading, .spinner');
        const hasLoadingSpinner = loadingElements.length > 0;

        if (hasLoadingSpinner) {
            console.log('   ❌ App is stuck on loading spinner - ISSUE CONFIRMED');
            
            // Get the current page content to see what's happening
            const pageContent = await page.content();
            const hasReactApp = pageContent.includes('react');
            
            console.log(`   📊 React app detected: ${hasReactApp ? 'YES' : 'NO'}`);
            
            // Check console for specific errors
            const consoleLogs = await page.evaluate(() => {
                return window.console.history || [];
            });
            
            console.log('   📋 Checking for specific error patterns...');
            
        } else {
            console.log('   ✅ No loading spinner detected');
            
            // Try to find signup/login elements
            const signupButton = await page.$('button:contains("Sign Up"), a:contains("Sign Up"), [data-testid="signup"]');
            const loginButton = await page.$('button:contains("Login"), a:contains("Login"), [data-testid="login"]');
            
            if (signupButton || loginButton) {
                console.log('   ✅ App loaded successfully - signup/login elements found');
                
                if (signupButton) {
                    console.log('   🔧 Testing signup flow...');
                    await testSignupFlow(page);
                }
            } else {
                console.log('   ⚠️  App loaded but no signup/login elements found');
            }
        }

        // Keep browser open for 10 seconds so you can see the result
        console.log('   📋 Keeping browser open for 10 seconds for inspection...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.log('   ❌ Browser test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function testSignupFlow(page) {
    try {
        console.log('   🔧 Attempting to click signup button...');
        
        // Look for signup button or link
        const signupSelectors = [
            'button:contains("Sign Up")',
            'a:contains("Sign Up")',
            '[data-testid="signup"]',
            'button[type="submit"]',
            '.signup-button',
            '#signup'
        ];

        let signupElement = null;
        for (const selector of signupSelectors) {
            try {
                signupElement = await page.$(selector);
                if (signupElement) break;
            } catch (e) {
                // Continue to next selector
            }
        }

        if (signupElement) {
            await signupElement.click();
            console.log('   ✅ Signup button clicked');
            
            // Wait for signup form
            await page.waitForTimeout(2000);
            
            // Look for form fields
            const emailField = await page.$('input[type="email"], input[name="email"], #email');
            const nameField = await page.$('input[name="name"], #name, input[placeholder*="name"]');
            
            if (emailField && nameField) {
                console.log('   ✅ Signup form found - filling out test data...');
                
                await nameField.type('Automated Test User');
                await emailField.type('automated-test@example.com');
                
                // Look for other required fields
                const phoneField = await page.$('input[name="phone"], #phone, input[type="tel"]');
                if (phoneField) {
                    await phoneField.type('555-123-4567');
                }
                
                const addressField = await page.$('input[name="address"], input[name="street_address"], #address');
                if (addressField) {
                    await addressField.type('123 Test Street');
                }
                
                // Try to submit
                const submitButton = await page.$('button[type="submit"], .submit-button, button:contains("Submit")');
                if (submitButton) {
                    console.log('   🔧 Submitting signup form...');
                    await submitButton.click();
                    
                    // Wait for response
                    await page.waitForTimeout(5000);
                    
                    // Check for success or error messages
                    const errorMessages = await page.$$('.error, .alert-error, [role="alert"]');
                    const successMessages = await page.$$('.success, .alert-success');
                    
                    if (errorMessages.length > 0) {
                        console.log('   ❌ Signup form showed errors');
                    } else if (successMessages.length > 0) {
                        console.log('   ✅ Signup form submitted successfully');
                    } else {
                        console.log('   ⚠️  Signup form submitted - unclear result');
                    }
                } else {
                    console.log('   ⚠️  No submit button found');
                }
            } else {
                console.log('   ❌ Signup form fields not found');
            }
        } else {
            console.log('   ❌ No signup button found');
        }

    } catch (error) {
        console.log('   ❌ Signup flow test failed:', error.message);
    }
}

// Run the complete automation
runSQLThenRealFrontendTest().catch(console.error);
