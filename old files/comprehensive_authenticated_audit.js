const puppeteer = require('puppeteer');

async function comprehensiveAuthenticatedAudit() {
    console.log('🔍 COMPREHENSIVE AUTHENTICATED TRADEMATE PRO AUDIT');
    console.log('=' .repeat(70));
    console.log('📋 Logging in as beta tester: jeraldjsmith@gmail.com');
    console.log('📋 Will navigate through ALL pages and monitor for 400/404 errors');
    console.log('');

    let browser;
    const auditResults = {
        networkErrors: [],
        consoleErrors: [],
        pageErrors: [],
        failedRequests: [],
        pageResults: {},
        loginSuccess: false
    };

    try {
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized'],
            devtools: true
        });
        
        const page = await browser.newPage();
        
        // Monitor ALL network requests
        page.on('response', response => {
            const status = response.status();
            const url = response.url();
            const method = response.request().method();
            
            if (status >= 400) {
                const error = {
                    status,
                    method,
                    url,
                    timestamp: new Date().toISOString()
                };
                auditResults.networkErrors.push(error);
                console.log(`   🔴 ${status} ${method} ${url}`);
            }
        });

        // Monitor console errors
        page.on('console', msg => {
            const text = msg.text();
            const type = msg.type();
            
            if (type === 'error' || text.includes('Error') || text.includes('Failed')) {
                auditResults.consoleErrors.push({
                    type,
                    text,
                    timestamp: new Date().toISOString()
                });
                console.log(`   🟡 CONSOLE: ${text}`);
            }
        });

        // Monitor page errors
        page.on('pageerror', error => {
            auditResults.pageErrors.push({
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            console.log(`   🔴 PAGE ERROR: ${error.message}`);
        });

        // Monitor failed requests
        page.on('requestfailed', request => {
            auditResults.failedRequests.push({
                url: request.url(),
                method: request.method(),
                failure: request.failure().errorText,
                timestamp: new Date().toISOString()
            });
            console.log(`   ❌ FAILED REQUEST: ${request.method()} ${request.url()}`);
        });

        console.log('\n📋 STEP 1: ACCESSING TRADEMATE PRO AND LOGGING IN');
        
        // Access TradeMate Pro
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle0',
            timeout: 15000 
        });

        console.log('   ✅ TradeMate Pro loaded');

        // Check if we need to log in
        const needsLogin = await page.evaluate(() => {
            return document.body.textContent.includes('Sign in') || 
                   document.body.textContent.includes('Login') ||
                   document.body.textContent.includes('Email') ||
                   document.querySelector('input[type="email"]') !== null;
        });

        if (needsLogin) {
            console.log('   🔧 Login required, attempting to log in...');
            
            // Fill in login credentials
            const emailInput = await page.$('input[type="email"], input[name="email"]');
            const passwordInput = await page.$('input[type="password"], input[name="password"]');
            
            if (emailInput && passwordInput) {
                await emailInput.type('jeraldjsmith@gmail.com');
                await passwordInput.type('Gizmo123');
                
                // Find and click login button
                const loginButton = await page.$('button[type="submit"]') ||
                                   await page.$('button') ||
                                   await page.$('input[type="submit"]');
                if (loginButton) {
                    await loginButton.click();
                    console.log('   🔧 Login credentials submitted...');

                    // Wait for login to complete
                    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
                    auditResults.loginSuccess = true;
                    console.log('   ✅ Login successful');
                } else {
                    console.log('   ❌ Could not find login button');
                }
            } else {
                console.log('   ❌ Could not find email/password inputs');
            }
        } else {
            console.log('   ✅ Already logged in or no login required');
            auditResults.loginSuccess = true;
        }

        // Wait for dashboard to load
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('\n📋 STEP 2: COMPREHENSIVE PAGE NAVIGATION AUDIT');
        
        // Define all pages to test
        const pagesToTest = [
            { name: 'Dashboard', path: '/', description: 'Main dashboard' },
            { name: 'Work Orders', path: '/work', description: 'Work orders list' },
            { name: 'Customers', path: '/customers', description: 'Customer management' },
            { name: 'Inventory', path: '/inventory', description: 'Inventory management' },
            { name: 'Quotes', path: '/quotes', description: 'Quote management' },
            { name: 'Invoices', path: '/invoices', description: 'Invoice management' },
            { name: 'Calendar', path: '/calendar', description: 'Calendar/scheduling' },
            { name: 'Reports', path: '/reports', description: 'Reports and analytics' },
            { name: 'Settings', path: '/settings', description: 'Application settings' },
            { name: 'Tools', path: '/tools', description: 'Tools and calculators' },
            { name: 'Employees', path: '/employees', description: 'Employee management' },
            { name: 'PTO', path: '/pto', description: 'PTO management' },
            { name: 'Purchase Orders', path: '/purchase-orders', description: 'Purchase order management' },
            { name: 'Vendors', path: '/vendors', description: 'Vendor management' },
            { name: 'Jobs', path: '/jobs', description: 'Jobs management' },
            { name: 'Messages', path: '/messages', description: 'Internal messaging' },
            { name: 'Documents', path: '/documents', description: 'Document management' },
            { name: 'Timesheets', path: '/timesheets', description: 'Timesheet management' },
            { name: 'Expenses', path: '/expenses', description: 'Expense management' },
            { name: 'Payroll', path: '/payroll', description: 'Payroll management' }
        ];

        for (const pageInfo of pagesToTest) {
            console.log(`\n   🔍 TESTING: ${pageInfo.name} (${pageInfo.path})`);
            
            const pageStartTime = Date.now();
            const initialErrorCount = auditResults.networkErrors.length;
            
            try {
                await page.goto(`http://localhost:3000${pageInfo.path}`, { 
                    waitUntil: 'networkidle0',
                    timeout: 15000 
                });
                
                // Wait for page to fully load and any async requests
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // Check page content and functionality
                const pageAnalysis = await page.evaluate(() => {
                    return {
                        title: document.title,
                        hasContent: document.body.textContent.length > 100,
                        hasErrors: document.body.textContent.includes('Error') || 
                                  document.body.textContent.includes('Failed to load') ||
                                  document.body.textContent.includes('Something went wrong'),
                        hasLoadingSpinners: !!document.querySelector('[class*="loading"], [class*="spinner"]'),
                        url: window.location.href,
                        bodyTextSample: document.body.textContent.substring(0, 200)
                    };
                });
                
                const pageEndTime = Date.now();
                const loadTime = pageEndTime - pageStartTime;
                const newErrors = auditResults.networkErrors.length - initialErrorCount;
                
                auditResults.pageResults[pageInfo.name] = {
                    ...pageInfo,
                    ...pageAnalysis,
                    loadTime,
                    newErrors,
                    status: pageAnalysis.hasErrors ? 'ERROR' : 'SUCCESS'
                };
                
                console.log(`      📊 Load time: ${loadTime}ms`);
                console.log(`      📊 New errors: ${newErrors}`);
                console.log(`      📊 Status: ${pageAnalysis.hasErrors ? '❌ HAS ERRORS' : '✅ OK'}`);
                
                if (pageAnalysis.hasErrors) {
                    console.log(`      ⚠️  Page contains error messages`);
                    console.log(`      📝 Sample: ${pageAnalysis.bodyTextSample}`);
                }
                
                if (newErrors > 0) {
                    console.log(`      🔴 New network errors detected on this page`);
                }
                
            } catch (error) {
                console.log(`      ❌ Failed to load: ${error.message}`);
                auditResults.pageResults[pageInfo.name] = {
                    ...pageInfo,
                    status: 'FAILED',
                    error: error.message
                };
            }
        }

        console.log('\n📋 STEP 3: DETAILED ERROR ANALYSIS');
        
        // Analyze network errors by type
        const errorsByStatus = {};
        const errorsByEndpoint = {};
        
        auditResults.networkErrors.forEach(error => {
            // Group by status code
            if (!errorsByStatus[error.status]) {
                errorsByStatus[error.status] = [];
            }
            errorsByStatus[error.status].push(error);
            
            // Group by endpoint pattern
            const endpoint = error.url.replace(/http:\/\/localhost:\d+/, '').split('?')[0];
            if (!errorsByEndpoint[endpoint]) {
                errorsByEndpoint[endpoint] = [];
            }
            errorsByEndpoint[endpoint].push(error);
        });
        
        console.log('\n   📊 ERRORS BY STATUS CODE:');
        Object.keys(errorsByStatus).forEach(status => {
            console.log(`      ${status}: ${errorsByStatus[status].length} errors`);
        });
        
        console.log('\n   📊 ERRORS BY ENDPOINT:');
        Object.keys(errorsByEndpoint).forEach(endpoint => {
            console.log(`      ${endpoint}: ${errorsByEndpoint[endpoint].length} errors`);
        });

        console.log('\n📋 KEEPING BROWSER OPEN FOR 60 SECONDS FOR MANUAL INSPECTION...');
        console.log('   You can now manually navigate and see the errors in real-time');
        console.log('   Check the Network tab in DevTools for detailed error information');
        await new Promise(resolve => setTimeout(resolve, 60000));

    } catch (error) {
        console.log('❌ Audit failed:', error.message);
    } finally {
        // Generate comprehensive report
        console.log('\n' + '='.repeat(70));
        console.log('📋 COMPREHENSIVE AUTHENTICATED AUDIT RESULTS');
        console.log('='.repeat(70));
        
        console.log(`\n📊 SUMMARY:`);
        console.log(`   Login Success: ${auditResults.loginSuccess ? '✅ YES' : '❌ NO'}`);
        console.log(`   Total Network Errors: ${auditResults.networkErrors.length}`);
        console.log(`   Total Console Errors: ${auditResults.consoleErrors.length}`);
        console.log(`   Total Page Errors: ${auditResults.pageErrors.length}`);
        console.log(`   Total Failed Requests: ${auditResults.failedRequests.length}`);
        
        console.log(`\n📋 PAGES WITH ISSUES:`);
        Object.values(auditResults.pageResults).forEach(page => {
            if (page.status === 'ERROR' || page.status === 'FAILED' || page.newErrors > 0) {
                console.log(`   ❌ ${page.name}: ${page.status} (${page.newErrors || 0} new errors)`);
            }
        });
        
        console.log(`\n🔴 TOP NETWORK ERRORS:`);
        auditResults.networkErrors.slice(0, 20).forEach(error => {
            console.log(`   ${error.status} ${error.method} ${error.url}`);
        });
        
        // Save detailed report
        const fs = require('fs');
        const reportData = {
            timestamp: new Date().toISOString(),
            loginCredentials: 'jeraldjsmith@gmail.com',
            summary: {
                loginSuccess: auditResults.loginSuccess,
                totalNetworkErrors: auditResults.networkErrors.length,
                totalConsoleErrors: auditResults.consoleErrors.length,
                totalPageErrors: auditResults.pageErrors.length,
                totalFailedRequests: auditResults.failedRequests.length
            },
            ...auditResults
        };
        
        fs.writeFileSync('trademate_pro_authenticated_audit_report.json', JSON.stringify(reportData, null, 2));
        console.log('\n📄 Detailed report saved to: trademate_pro_authenticated_audit_report.json');
        
        if (browser) {
            await browser.close();
        }
    }
}

comprehensiveAuthenticatedAudit().catch(console.error);
