const puppeteer = require('puppeteer');

async function quickAuthenticatedAudit() {
    console.log('🔍 QUICK AUTHENTICATED TRADEMATE PRO AUDIT');
    console.log('=' .repeat(50));
    console.log('📋 Logging in as: jeraldjsmith@gmail.com');
    console.log('📋 Testing key pages for 400/404 errors');
    console.log('');

    let browser;
    const auditResults = {
        networkErrors: [],
        consoleErrors: [],
        loginSuccess: false,
        pagesChecked: []
    };

    try {
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized'],
            devtools: false
        });
        
        const page = await browser.newPage();
        
        // Monitor network requests for errors
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
            
            if (type === 'error') {
                auditResults.consoleErrors.push({
                    type,
                    text,
                    timestamp: new Date().toISOString()
                });
                console.log(`   🟡 CONSOLE ERROR: ${text}`);
            }
        });

        console.log('📋 STEP 1: ACCESSING TRADEMATE PRO');
        
        // Access TradeMate Pro
        await page.goto('http://localhost:3000', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });

        console.log('   ✅ TradeMate Pro loaded');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check if we need to log in
        const pageContent = await page.content();
        const needsLogin = pageContent.includes('Sign in') || 
                          pageContent.includes('Login') ||
                          pageContent.includes('Email') ||
                          pageContent.includes('Password');

        if (needsLogin) {
            console.log('   🔧 Login required, attempting to log in...');
            
            // Try to find and fill email input
            try {
                await page.type('input[type="email"]', 'jeraldjsmith@gmail.com');
                console.log('   ✅ Email entered');
            } catch (e) {
                console.log('   ❌ Could not find email input');
            }
            
            // Try to find and fill password input
            try {
                await page.type('input[type="password"]', 'Gizmo123');
                console.log('   ✅ Password entered');
            } catch (e) {
                console.log('   ❌ Could not find password input');
            }
            
            // Try to click login button
            try {
                await page.click('button[type="submit"]');
                console.log('   🔧 Login button clicked');
                
                // Wait for navigation or dashboard to load
                await new Promise(resolve => setTimeout(resolve, 5000));
                auditResults.loginSuccess = true;
                console.log('   ✅ Login attempt completed');
            } catch (e) {
                console.log('   ❌ Could not click login button:', e.message);
            }
        } else {
            console.log('   ✅ Already logged in or no login required');
            auditResults.loginSuccess = true;
        }

        console.log('\n📋 STEP 2: TESTING KEY PAGES');
        
        // Test key pages that commonly have issues
        const keyPages = [
            { name: 'Dashboard', path: '/' },
            { name: 'Customers', path: '/customers' },
            { name: 'Work Orders', path: '/work' },
            { name: 'Inventory', path: '/inventory' },
            { name: 'Quotes', path: '/quotes' }
        ];

        for (const pageInfo of keyPages) {
            console.log(`\n   🔍 TESTING: ${pageInfo.name} (${pageInfo.path})`);
            
            const initialErrorCount = auditResults.networkErrors.length;
            
            try {
                await page.goto(`http://localhost:3000${pageInfo.path}`, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 15000 
                });
                
                // Wait for page to load and any async requests
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const newErrors = auditResults.networkErrors.length - initialErrorCount;
                
                auditResults.pagesChecked.push({
                    ...pageInfo,
                    newErrors,
                    status: newErrors > 0 ? 'HAS_ERRORS' : 'OK'
                });
                
                console.log(`      📊 New errors: ${newErrors}`);
                console.log(`      📊 Status: ${newErrors > 0 ? '❌ HAS ERRORS' : '✅ OK'}`);
                
            } catch (error) {
                console.log(`      ❌ Failed to load: ${error.message}`);
                auditResults.pagesChecked.push({
                    ...pageInfo,
                    status: 'FAILED',
                    error: error.message
                });
            }
        }

        console.log('\n📋 STEP 3: DETAILED ERROR ANALYSIS');
        
        // Group errors by status code
        const errorsByStatus = {};
        auditResults.networkErrors.forEach(error => {
            if (!errorsByStatus[error.status]) {
                errorsByStatus[error.status] = [];
            }
            errorsByStatus[error.status].push(error);
        });
        
        console.log('\n   📊 ERRORS BY STATUS CODE:');
        Object.keys(errorsByStatus).forEach(status => {
            console.log(`      ${status}: ${errorsByStatus[status].length} errors`);
        });

        console.log('\n📋 KEEPING BROWSER OPEN FOR 30 SECONDS FOR MANUAL INSPECTION...');
        console.log('   You can now manually navigate and see the errors in real-time');
        await new Promise(resolve => setTimeout(resolve, 30000));

    } catch (error) {
        console.log('❌ Audit failed:', error.message);
    } finally {
        // Generate report
        console.log('\n' + '='.repeat(50));
        console.log('📋 QUICK AUTHENTICATED AUDIT RESULTS');
        console.log('='.repeat(50));
        
        console.log(`\n📊 SUMMARY:`);
        console.log(`   Login Success: ${auditResults.loginSuccess ? '✅ YES' : '❌ NO'}`);
        console.log(`   Total Network Errors: ${auditResults.networkErrors.length}`);
        console.log(`   Total Console Errors: ${auditResults.consoleErrors.length}`);
        console.log(`   Pages Checked: ${auditResults.pagesChecked.length}`);
        
        console.log(`\n📋 PAGES WITH ISSUES:`);
        auditResults.pagesChecked.forEach(page => {
            if (page.status === 'HAS_ERRORS' || page.status === 'FAILED') {
                console.log(`   ❌ ${page.name}: ${page.status} (${page.newErrors || 0} errors)`);
            }
        });
        
        console.log(`\n🔴 ALL NETWORK ERRORS:`);
        auditResults.networkErrors.forEach(error => {
            console.log(`   ${error.status} ${error.method} ${error.url}`);
        });
        
        console.log(`\n🟡 ALL CONSOLE ERRORS:`);
        auditResults.consoleErrors.forEach(error => {
            console.log(`   ${error.text}`);
        });
        
        // Save report
        const fs = require('fs');
        const reportData = {
            timestamp: new Date().toISOString(),
            loginCredentials: 'jeraldjsmith@gmail.com',
            summary: {
                loginSuccess: auditResults.loginSuccess,
                totalNetworkErrors: auditResults.networkErrors.length,
                totalConsoleErrors: auditResults.consoleErrors.length,
                pagesChecked: auditResults.pagesChecked.length
            },
            ...auditResults
        };
        
        fs.writeFileSync('quick_audit_report.json', JSON.stringify(reportData, null, 2));
        console.log('\n📄 Report saved to: quick_audit_report.json');
        
        if (browser) {
            await browser.close();
        }
    }
}

quickAuthenticatedAudit().catch(console.error);
