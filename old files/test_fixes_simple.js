const puppeteer = require('puppeteer');

async function testFixesSimple() {
    console.log('🚀 TESTING COMPILATION FIXES AND SESSION PERSISTENCE');
    console.log('=' .repeat(60));

    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        // Monitor console logs for compilation errors and session behavior
        const consoleLogs = [];
        page.on('console', msg => {
            const text = msg.text();
            consoleLogs.push(text);
            
            // Log important messages
            if (text.includes('🔧') || 
                text.includes('✅') || 
                text.includes('🧹') || 
                text.includes('cbrown') ||
                text.includes('ERROR') ||
                text.includes('Cleared any persisted sessions') ||
                text.includes('Loading customer data')) {
                console.log(`   📊 ${text}`);
            }
        });

        // Monitor page errors (compilation issues)
        page.on('pageerror', error => {
            console.log(`   🔴 PAGE ERROR: ${error.message}`);
        });

        console.log('\n📋 TEST 1: LOADING APP AND CHECKING FOR COMPILATION ERRORS');
        
        // Try to find the running app
        const ports = [3000, 3001, 3002, 3003];
        let workingPort = null;
        
        for (const port of ports) {
            try {
                console.log(`   🔧 Trying port ${port}...`);
                await page.goto(`http://localhost:${port}`, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 5000 
                });
                
                const hasCustomerPortal = await page.evaluate(() => {
                    return document.body.textContent.includes('Customer Portal') ||
                           document.body.textContent.includes('Magic Link') ||
                           document.body.textContent.includes('You need to enable JavaScript');
                });
                
                if (hasCustomerPortal) {
                    workingPort = port;
                    console.log(`   ✅ Found Customer Portal on port ${port}`);
                    break;
                }
            } catch (error) {
                console.log(`   ❌ Port ${port} not accessible`);
            }
        }
        
        if (!workingPort) {
            console.log('   ❌ Could not find running Customer Portal');
            console.log('   📋 Make sure to run: cd "Customer Portal" && npm start');
            return;
        }

        console.log('\n📋 TEST 2: CHECKING FOR COMPILATION ERRORS');
        
        // Wait for React to load and check for errors
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check if the page loaded successfully (no compilation errors)
        const pageContent = await page.evaluate(() => {
            return {
                hasJavaScriptError: document.body.textContent.includes('You need to enable JavaScript'),
                hasReactApp: !!window.React || document.body.textContent.includes('Customer Portal'),
                bodyText: document.body.textContent.substring(0, 200),
                currentPath: window.location.pathname
            };
        });
        
        console.log(`   📊 Has JavaScript Error: ${pageContent.hasJavaScriptError ? '❌ YES' : '✅ NO'}`);
        console.log(`   📊 React App Loaded: ${pageContent.hasReactApp ? '✅ YES' : '❌ NO'}`);
        console.log(`   📊 Current Path: ${pageContent.currentPath}`);
        
        if (!pageContent.hasJavaScriptError && pageContent.hasReactApp) {
            console.log('   ✅ SUCCESS: App compiled and loaded without errors');
        } else {
            console.log('   ❌ COMPILATION ISSUES: App not loading properly');
        }

        console.log('\n📋 TEST 3: CHECKING SESSION PERSISTENCE');
        
        // Check for fake user persistence
        const hasFakeUser = await page.evaluate(() => {
            return document.body.textContent.includes('cbrown@cgrenewables.com');
        });
        
        console.log(`   📊 Has fake user on load: ${hasFakeUser ? '❌ YES' : '✅ NO'}`);
        
        // Check console logs for session clearing
        const hasSessionClearing = consoleLogs.some(log => 
            log.includes('Cleared any persisted sessions') || 
            log.includes('🧹')
        );
        
        console.log(`   📊 Session clearing detected: ${hasSessionClearing ? '✅ YES' : '❌ NO'}`);
        
        // Test refresh behavior
        console.log('   🔧 Testing refresh behavior...');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const afterRefreshHasFakeUser = await page.evaluate(() => {
            return document.body.textContent.includes('cbrown@cgrenewables.com');
        });
        
        console.log(`   📊 Has fake user after refresh: ${afterRefreshHasFakeUser ? '❌ YES' : '✅ NO'}`);

        console.log('\n📋 FINAL RESULTS:');
        console.log('=' .repeat(50));
        
        const compilationFixed = !pageContent.hasJavaScriptError && pageContent.hasReactApp;
        const sessionPersistenceFixed = !hasFakeUser && !afterRefreshHasFakeUser;
        
        console.log(`✅ Compilation Errors Fixed: ${compilationFixed ? 'YES' : 'NO'}`);
        console.log(`✅ Session Persistence Fixed: ${sessionPersistenceFixed ? 'YES' : 'NO'}`);
        
        if (compilationFixed && sessionPersistenceFixed) {
            console.log('\n🎉 ALL FIXES SUCCESSFUL!');
            console.log('   • App compiles without errors');
            console.log('   • No fake user persistence');
            console.log('   • Clean login experience');
        } else {
            console.log('\n⚠️  SOME ISSUES REMAIN:');
            if (!compilationFixed) {
                console.log('   • Compilation errors still present');
            }
            if (!sessionPersistenceFixed) {
                console.log('   • Fake user still persisting');
            }
        }
        
        console.log('\n📋 Keeping browser open for 10 seconds for manual verification...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testFixesSimple().catch(console.error);
