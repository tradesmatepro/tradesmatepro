const puppeteer = require('puppeteer');

async function comprehensiveAppAudit() {
    console.log('🔍 COMPREHENSIVE TRADEMATE PRO APP AUDIT');
    console.log('=' .repeat(70));
    console.log('📋 This will navigate through ALL pages and monitor for errors');
    console.log('');

    let browser;
    const auditResults = {
        networkErrors: [],
        consoleErrors: [],
        pageErrors: [],
        failedRequests: [],
        pageResults: {}
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

        console.log('\n📋 STEP 1: ACCESSING TRADEMATE PRO');
        
        // Try to find TradeMate Pro (usually on port 3000 or 3001)
        const ports = [3000, 3001, 3002, 5173, 8080];
        let appPort = null;
        
        for (const port of ports) {
            try {
                console.log(`   🔧 Trying port ${port}...`);
                await page.goto(`http://localhost:${port}`, { 
                    waitUntil: 'networkidle0',
                    timeout: 10000 
                });
                
                const isTradeMate = await page.evaluate(() => {
                    const title = document.title || '';
                    const bodyText = document.body.textContent || '';
                    
                    return title.includes('TradeMate') || 
                           bodyText.includes('TradeMate') ||
                           bodyText.includes('Dashboard') ||
                           bodyText.includes('Work Orders') ||
                           bodyText.includes('Customers');
                });
                
                if (isTradeMate) {
                    appPort = port;
                    console.log(`   ✅ Found TradeMate Pro on port ${port}`);
                    break;
                }
            } catch (error) {
                console.log(`   ❌ Port ${port} not accessible`);
            }
        }
        
        if (!appPort) {
            console.log('   ❌ Could not find TradeMate Pro running');
            console.log('   📋 Make sure TradeMate Pro is running (npm run dev or npm start)');
            return;
        }

        // Wait for initial page load and capture errors
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('\n📋 STEP 2: COMPREHENSIVE PAGE NAVIGATION AUDIT');
        
        // Define all pages to test (based on typical TradeMate Pro structure)
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
            { name: 'Vendors', path: '/vendors', description: 'Vendor management' }
        ];

        for (const pageInfo of pagesToTest) {
            console.log(`\n   🔍 TESTING: ${pageInfo.name} (${pageInfo.path})`);
            
            const pageStartTime = Date.now();
            const initialErrorCount = auditResults.networkErrors.length;
            
            try {
                await page.goto(`http://localhost:${appPort}${pageInfo.path}`, { 
                    waitUntil: 'networkidle0',
                    timeout: 15000 
                });
                
                // Wait for page to fully load and any async requests
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Check page content and functionality
                const pageAnalysis = await page.evaluate(() => {
                    return {
                        title: document.title,
                        hasContent: document.body.textContent.length > 100,
                        hasErrors: document.body.textContent.includes('Error') || 
                                  document.body.textContent.includes('Failed to load'),
                        hasLoadingSpinners: !!document.querySelector('[class*="loading"], [class*="spinner"]'),
                        url: window.location.href
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

        console.log('\n📋 KEEPING BROWSER OPEN FOR 30 SECONDS FOR MANUAL INSPECTION...');
        console.log('   You can now manually navigate and see the errors in real-time');
        await new Promise(resolve => setTimeout(resolve, 30000));

    } catch (error) {
        console.log('❌ Audit failed:', error.message);
    } finally {
        // Generate comprehensive report
        console.log('\n' + '='.repeat(70));
        console.log('📋 COMPREHENSIVE AUDIT RESULTS');
        console.log('='.repeat(70));
        
        console.log(`\n📊 SUMMARY:`);
        console.log(`   Total Network Errors: ${auditResults.networkErrors.length}`);
        console.log(`   Total Console Errors: ${auditResults.consoleErrors.length}`);
        console.log(`   Total Page Errors: ${auditResults.pageErrors.length}`);
        console.log(`   Total Failed Requests: ${auditResults.failedRequests.length}`);
        
        console.log(`\n📋 PAGES WITH ISSUES:`);
        Object.values(auditResults.pageResults).forEach(page => {
            if (page.status === 'ERROR' || page.status === 'FAILED' || page.newErrors > 0) {
                console.log(`   ❌ ${page.name}: ${page.status} (${page.newErrors} new errors)`);
            }
        });
        
        console.log(`\n🔴 TOP NETWORK ERRORS:`);
        auditResults.networkErrors.slice(0, 10).forEach(error => {
            console.log(`   ${error.status} ${error.method} ${error.url}`);
        });
        
        // Save detailed report
        const fs = require('fs');
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalNetworkErrors: auditResults.networkErrors.length,
                totalConsoleErrors: auditResults.consoleErrors.length,
                totalPageErrors: auditResults.pageErrors.length,
                totalFailedRequests: auditResults.failedRequests.length
            },
            ...auditResults
        };
        
        fs.writeFileSync('trademate_pro_audit_report.json', JSON.stringify(reportData, null, 2));
        console.log('\n📄 Detailed report saved to: trademate_pro_audit_report.json');
        
        if (browser) {
            await browser.close();
        }
    }
}

comprehensiveAppAudit().catch(console.error);
