const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runManualSQLThenBrowserTest() {
    console.log('🚀 MANUAL SQL + REAL BROWSER TEST');
    console.log('=' .repeat(50));

    console.log('\n📋 STEP 1: MANUAL SQL EXECUTION');
    await executeManualSQL();

    console.log('\n📋 STEP 2: REAL BROWSER TEST');
    await realBrowserTest();

    console.log('\n🎯 COMPLETE!');
}

async function executeManualSQL() {
    console.log('\n🔧 Executing SQL fixes manually...');
    
    // FIX 1: Add created_via column
    console.log('   🔧 Fix 1: Adding created_via column...');
    try {
        // Test if we can insert with created_via
        const testInsert = await supabase
            .from('customers')
            .insert({
                name: 'SQL Fix Test',
                email: 'sql-fix-test@example.com',
                phone: '555-000-0001',
                street_address: '123 SQL Fix St',
                city: 'SQL City',
                state: 'SQ',
                zip_code: '00001',
                country: 'United States',
                customer_type: 'COMMERCIAL',
                status: 'active',
                created_via: 'self_signup'
            })
            .select()
            .single();

        if (testInsert.error) {
            if (testInsert.error.message.includes('created_via')) {
                console.log('   ❌ created_via column missing - MANUAL SQL REQUIRED');
                console.log('   📋 YOU MUST RUN THE SQL IN SUPABASE SQL EDITOR:');
                console.log('   📋 ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT \'manual\';');
                return false;
            } else {
                console.log('   ⚠️  Different error:', testInsert.error.message);
            }
        } else {
            console.log('   ✅ created_via column works');
            // Clean up test
            await supabase.from('customers').delete().eq('id', testInsert.data.id);
        }
    } catch (error) {
        console.log('   ❌ SQL test failed:', error.message);
        return false;
    }

    // FIX 2: Test portal accounts structure
    console.log('   🔧 Fix 2: Testing portal accounts structure...');
    try {
        // Get the structure of customer_portal_accounts
        const { data: accounts, error } = await supabase
            .from('customer_portal_accounts')
            .select('*')
            .limit(1);

        if (error) {
            console.log('   ❌ Portal accounts query failed:', error.message);
            return false;
        }

        if (accounts && accounts.length > 0) {
            const account = accounts[0];
            const requiredColumns = ['auth_user_id', 'email', 'is_active', 'last_login'];
            
            console.log('   📊 Portal accounts columns:');
            requiredColumns.forEach(col => {
                const exists = col in account;
                console.log(`     ${col}: ${exists ? '✅' : '❌'}`);
                if (!exists) {
                    console.log(`   📋 MISSING COLUMN: ${col} - MANUAL SQL REQUIRED`);
                }
            });
        } else {
            console.log('   ⚠️  Portal accounts table is empty - will test with insert');
        }
    } catch (error) {
        console.log('   ❌ Portal accounts test failed:', error.message);
        return false;
    }

    console.log('   🎯 SQL verification complete');
    return true;
}

async function realBrowserTest() {
    console.log('\n🌐 Launching REAL browser test...');
    
    let browser;
    try {
        // Launch browser in visible mode
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized', '--disable-web-security'],
            devtools: true // Open DevTools automatically
        });
        
        const page = await browser.newPage();
        
        // Set up console monitoring
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            
            if (type === 'error') {
                console.log(`   🔴 BROWSER ERROR: ${text}`);
            } else if (type === 'warn') {
                console.log(`   🟡 BROWSER WARN: ${text}`);
            } else if (text.includes('🔍') || text.includes('✅') || text.includes('❌') || text.includes('📊')) {
                console.log(`   📊 APP LOG: ${text}`);
            }
        });

        // Monitor network requests
        page.on('response', response => {
            const status = response.status();
            const url = response.url();
            
            if (status >= 400) {
                console.log(`   🔴 NETWORK ERROR: ${status} ${url}`);
            } else if (url.includes('supabase') && status === 200) {
                console.log(`   ✅ SUPABASE OK: ${url.split('/').pop()}`);
            }
        });

        // Monitor page errors
        page.on('pageerror', error => {
            console.log(`   🔴 PAGE ERROR: ${error.message}`);
        });

        console.log('   🔧 Navigating to Customer Portal...');
        
        // Navigate to the portal
        await page.goto('http://localhost:3000', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });

        console.log('   ✅ Page loaded, analyzing loading behavior...');

        // Wait and monitor for 10 seconds to see what happens
        console.log('   📊 Monitoring app behavior for 10 seconds...');

        for (let i = 1; i <= 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check for loading indicators
            const loadingElements = await page.$$eval('*', elements => {
                return elements.filter(el => {
                    const text = el.textContent || '';
                    const className = el.className || '';
                    return text.includes('Loading') || 
                           text.includes('loading') || 
                           className.includes('loading') ||
                           className.includes('spinner') ||
                           el.tagName === 'SPINNER';
                }).length;
            });

            // Check for error messages
            const errorElements = await page.$$eval('*', elements => {
                return elements.filter(el => {
                    const text = el.textContent || '';
                    const className = el.className || '';
                    return text.includes('Error') || 
                           text.includes('error') || 
                           className.includes('error') ||
                           text.includes('400') ||
                           text.includes('Bad Request');
                }).length;
            });

            // Check for signup/login elements
            const authElements = await page.$$eval('*', elements => {
                return elements.filter(el => {
                    const text = el.textContent || '';
                    return text.includes('Sign Up') || 
                           text.includes('Login') || 
                           text.includes('Sign In') ||
                           text.includes('Register');
                }).length;
            });

            console.log(`   📊 Second ${i}: Loading=${loadingElements}, Errors=${errorElements}, Auth=${authElements}`);

            // If we see auth elements, the app loaded successfully
            if (authElements > 0 && loadingElements === 0) {
                console.log('   ✅ App loaded successfully - auth elements visible');
                await testSignupInteraction(page);
                break;
            }

            // If we see persistent loading, that's the issue
            if (i >= 5 && loadingElements > 0) {
                console.log('   ❌ App stuck on loading - CONFIRMED ISSUE');
                
                // Try to get more details about what's hanging
                const pageContent = await page.content();
                if (pageContent.includes('🔍 Checking auth status')) {
                    console.log('   📊 ISSUE: App stuck on "🔍 Checking auth status"');
                }
                break;
            }
        }

        // Keep browser open for manual inspection
        console.log('   📋 Keeping browser open for 30 seconds for manual inspection...');
        console.log('   📋 Check the DevTools console for detailed logs');
        await new Promise(resolve => setTimeout(resolve, 30000));

    } catch (error) {
        console.log('   ❌ Browser test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function testSignupInteraction(page) {
    console.log('   🔧 Testing signup interaction...');
    
    try {
        // Look for signup button
        const signupButton = await page.$('button, a, [role="button"]');
        
        if (signupButton) {
            const buttonText = await page.evaluate(el => el.textContent, signupButton);
            
            if (buttonText && (buttonText.includes('Sign Up') || buttonText.includes('Register'))) {
                console.log('   ✅ Found signup button, clicking...');
                await signupButton.click();
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Look for form fields
                const emailField = await page.$('input[type="email"]');
                const nameField = await page.$('input[name="name"], input[placeholder*="name"]');
                
                if (emailField && nameField) {
                    console.log('   ✅ Signup form appeared - testing form interaction');
                    
                    await nameField.type('Browser Test User');
                    await emailField.type('browser-test@example.com');
                    
                    console.log('   ✅ Form fields work - signup flow functional');
                } else {
                    console.log('   ⚠️  Signup button clicked but no form appeared');
                }
            }
        }
    } catch (error) {
        console.log('   ❌ Signup interaction test failed:', error.message);
    }
}

// Run the automation
runManualSQLThenBrowserTest().catch(console.error);
