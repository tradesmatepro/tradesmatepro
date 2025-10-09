const puppeteer = require('puppeteer');

async function runFinalVerificationAudit() {
    console.log('🎯 FINAL VERIFICATION AUDIT - TRADEMATE PRO');
    console.log('=' .repeat(70));
    console.log('📋 Testing all pages after database fixes');
    console.log('📋 Expected result: 0 network errors');
    console.log('');

    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: { width: 1200, height: 800 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Track network errors
        const networkErrors = [];
        page.on('response', response => {
            if (response.status() >= 400) {
                networkErrors.push({
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText()
                });
            }
        });

        // Navigate to TradeMate Pro
        console.log('🔍 Navigating to TradeMate Pro...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
        
        // Login
        console.log('🔐 Logging in as beta tester...');
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.type('input[type="email"]', 'jeraldjsmith@gmail.com');
        await page.type('input[type="password"]', 'Gizmo123');
        await page.click('button[type="submit"]');
        
        // Wait for dashboard to load
        await page.waitForSelector('[data-testid="dashboard"], .dashboard, h1, h2', { timeout: 15000 });
        console.log('✅ Successfully logged in');

        // Clear previous errors and start fresh count
        networkErrors.length = 0;

        // Test Dashboard
        console.log('\n📋 TESTING DASHBOARD PAGE');
        console.log('-'.repeat(40));
        await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for all API calls
        
        const dashboardErrors = networkErrors.filter(err => 
            err.url.includes('leads') || 
            err.url.includes('opportunities') || 
            err.url.includes('sales_activities')
        );
        console.log(`   Dashboard errors: ${dashboardErrors.length}`);
        if (dashboardErrors.length > 0) {
            dashboardErrors.forEach(err => console.log(`   ❌ ${err.status} ${err.url}`));
        } else {
            console.log('   ✅ Dashboard: 0 errors');
        }

        // Test Customers Page
        console.log('\n📋 TESTING CUSTOMERS PAGE');
        console.log('-'.repeat(40));
        networkErrors.length = 0; // Reset for this page
        await page.goto('http://localhost:3000/customers', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const customerErrors = networkErrors.filter(err => 
            err.url.includes('customer_service_agreements') || 
            err.url.includes('customer_tags') || 
            err.url.includes('customer_communications') ||
            err.url.includes('company_customers_view')
        );
        console.log(`   Customer errors: ${customerErrors.length}`);
        if (customerErrors.length > 0) {
            customerErrors.forEach(err => console.log(`   ❌ ${err.status} ${err.url}`));
        } else {
            console.log('   ✅ Customers: 0 errors');
        }

        // Test Quotes Page
        console.log('\n📋 TESTING QUOTES PAGE');
        console.log('-'.repeat(40));
        networkErrors.length = 0; // Reset for this page
        await page.goto('http://localhost:3000/quotes', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));

        const quoteErrors = networkErrors.filter(err =>
            err.url.includes('quote_follow_ups') ||
            err.url.includes('quote_analytics') ||
            err.url.includes('quote_approval_workflows')
        );
        console.log(`   Quote errors: ${quoteErrors.length}`);
        if (quoteErrors.length > 0) {
            quoteErrors.forEach(err => console.log(`   ❌ ${err.status} ${err.url}`));
        } else {
            console.log('   ✅ Quotes: 0 errors');
        }

        // Test Work Orders Page
        console.log('\n📋 TESTING WORK ORDERS PAGE');
        console.log('-'.repeat(40));
        networkErrors.length = 0; // Reset for this page
        await page.goto('http://localhost:3000/work-orders', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log(`   Work Orders errors: ${networkErrors.length}`);
        if (networkErrors.length > 0) {
            networkErrors.forEach(err => console.log(`   ❌ ${err.status} ${err.url}`));
        } else {
            console.log('   ✅ Work Orders: 0 errors');
        }

        // Test Inventory Page
        console.log('\n📋 TESTING INVENTORY PAGE');
        console.log('-'.repeat(40));
        networkErrors.length = 0; // Reset for this page
        await page.goto('http://localhost:3000/inventory', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log(`   Inventory errors: ${networkErrors.length}`);
        if (networkErrors.length > 0) {
            networkErrors.forEach(err => console.log(`   ❌ ${err.status} ${err.url}`));
        } else {
            console.log('   ✅ Inventory: 0 errors');
        }

        // Comprehensive error check
        console.log('\n📋 COMPREHENSIVE ERROR CHECK');
        console.log('-'.repeat(40));
        networkErrors.length = 0; // Reset for comprehensive check
        
        // Visit all pages in sequence and collect all errors
        const pages = [
            { name: 'Dashboard', url: '/dashboard' },
            { name: 'Customers', url: '/customers' },
            { name: 'Quotes', url: '/quotes' },
            { name: 'Work Orders', url: '/work-orders' },
            { name: 'Inventory', url: '/inventory' }
        ];

        for (const pageInfo of pages) {
            console.log(`   Testing ${pageInfo.name}...`);
            await page.goto(`http://localhost:3000${pageInfo.url}`, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Final summary
        console.log('\n🎯 FINAL AUDIT RESULTS');
        console.log('=' .repeat(70));
        
        const totalErrors = networkErrors.length;
        const errorsByStatus = {};
        networkErrors.forEach(err => {
            errorsByStatus[err.status] = (errorsByStatus[err.status] || 0) + 1;
        });

        console.log(`📊 Total network errors: ${totalErrors}`);
        
        if (totalErrors === 0) {
            console.log('🎉 SUCCESS: ALL PAGES LOAD WITHOUT ERRORS!');
            console.log('✅ TradeMate Pro is ready for beta launch');
            console.log('✅ All 44 previous errors have been resolved');
        } else {
            console.log('❌ REMAINING ISSUES:');
            Object.entries(errorsByStatus).forEach(([status, count]) => {
                console.log(`   ${status} errors: ${count}`);
            });
            
            console.log('\n📋 Error details:');
            networkErrors.forEach((err, index) => {
                console.log(`   ${index + 1}. ${err.status} ${err.url}`);
            });
        }

        console.log('\n📋 VERIFICATION COMPLETE');
        console.log('=' .repeat(70));

    } catch (error) {
        console.log('❌ Error during verification audit:', error.message);
        console.error('Full error:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

runFinalVerificationAudit().catch(console.error);
