const puppeteer = require('puppeteer');

async function clearSessionAnyPort() {
    console.log('🔧 CLEARING FAKE USER SESSION ON ANY PORT');
    console.log('=' .repeat(50));

    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        // Try a wider range of ports
        const ports = [3000, 3001, 3002, 3003, 3004, 3005];
        let workingPort = null;
        
        console.log('🔍 Scanning for Customer Portal...');
        
        for (const port of ports) {
            try {
                console.log(`   Trying port ${port}...`);
                
                await page.goto(`http://localhost:${port}`, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 3000 
                });
                
                // Check if this looks like the Customer Portal
                const isCustomerPortal = await page.evaluate(() => {
                    const bodyText = document.body.textContent || '';
                    const title = document.title || '';
                    
                    return bodyText.includes('Customer Portal') || 
                           bodyText.includes('Magic Link') ||
                           bodyText.includes('cbrown@cgrenewables.com') ||
                           title.includes('Customer Portal') ||
                           bodyText.includes('TradeMate');
                });
                
                if (isCustomerPortal) {
                    workingPort = port;
                    console.log(`   ✅ FOUND Customer Portal on port ${port}!`);
                    break;
                } else {
                    console.log(`   ❌ Port ${port} - not Customer Portal`);
                }
                
            } catch (error) {
                console.log(`   ❌ Port ${port} - not accessible`);
            }
        }
        
        if (workingPort) {
            console.log(`\n🔧 Clearing session on port ${workingPort}...`);
            
            // Monitor console logs to see current state
            page.on('console', msg => {
                const text = msg.text();
                if (text.includes('cbrown') || text.includes('Loading customer data')) {
                    console.log(`   📊 BEFORE: ${text}`);
                }
            });
            
            // Clear all storage
            await page.evaluate(() => {
                console.log('🧹 Starting storage cleanup...');
                
                // Clear localStorage
                const localStorageKeys = Object.keys(localStorage);
                console.log('LocalStorage keys before:', localStorageKeys);
                localStorage.clear();
                
                // Clear sessionStorage
                const sessionStorageKeys = Object.keys(sessionStorage);
                console.log('SessionStorage keys before:', sessionStorageKeys);
                sessionStorage.clear();
                
                // Clear any IndexedDB (Supabase might use this)
                if (window.indexedDB) {
                    // This is a more thorough cleanup
                    indexedDB.databases().then(databases => {
                        databases.forEach(db => {
                            if (db.name.includes('supabase') || db.name.includes('auth')) {
                                indexedDB.deleteDatabase(db.name);
                                console.log('Deleted IndexedDB:', db.name);
                            }
                        });
                    }).catch(() => {
                        // Ignore errors
                    });
                }
                
                console.log('🧹 Storage cleanup complete');
                return 'Storage cleared';
            });
            
            console.log('   ✅ Storage cleared');
            
            // Force a hard refresh
            console.log('   🔄 Performing hard refresh...');
            await page.reload({ waitUntil: 'domcontentloaded' });
            
            // Wait for the app to reinitialize
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Check the result
            const finalUrl = page.url();
            const hasOldUser = await page.evaluate(() => {
                return document.body.textContent.includes('cbrown@cgrenewables.com');
            });
            
            console.log(`   📊 Final URL: ${finalUrl}`);
            console.log(`   📊 Still has old user: ${hasOldUser ? '❌ YES' : '✅ NO'}`);
            
            if (!hasOldUser) {
                console.log('   🎉 SUCCESS: Fake user session cleared!');
            } else {
                console.log('   ⚠️  Old user still present - may need manual browser refresh');
            }
            
            // Keep browser open for verification
            console.log('\n📋 Keeping browser open for 10 seconds for verification...');
            console.log('   You should now see a clean login page without cbrown@cgrenewables.com');
            await new Promise(resolve => setTimeout(resolve, 10000));
            
        } else {
            console.log('\n❌ Could not find Customer Portal on any port');
            console.log('   Make sure the Customer Portal is running');
            console.log('   Try: cd "Customer Portal" && npm start');
        }
        
    } catch (error) {
        console.log('❌ Session clearing failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

clearSessionAnyPort().catch(console.error);
