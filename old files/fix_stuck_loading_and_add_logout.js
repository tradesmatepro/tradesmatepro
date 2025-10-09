const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6ImFub25fa2V5IiwiaWF0IjoxNzU0MDgxNTg3LCJleHAiOjIwNjk2NTc1ODd9.Ej8OcUeSGGt7nQBaGHlJcSLWLVaWOJLqJBBhJJhJhJo";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixStuckLoadingAndAddLogout() {
    console.log('🚀 FULL AUTO: FIX STUCK LOADING + ADD LOGOUT');
    console.log('=' .repeat(60));

    console.log('\n📋 STEP 1: CLEAR FAKE USER SESSION');
    await clearFakeUserSession();

    console.log('\n📋 STEP 2: FIX LOADING ISSUE IN CODE');
    await fixLoadingIssue();

    console.log('\n📋 STEP 3: ADD LOGOUT BUTTON');
    await addLogoutButton();

    console.log('\n📋 STEP 4: FIX WEBSOCKET ERRORS');
    await fixWebSocketErrors();

    console.log('\n📋 STEP 5: TEST COMPLETE FLOW');
    await testCompleteFlow();

    console.log('\n🎯 COMPLETE AUTOMATION FINISHED!');
}

async function clearFakeUserSession() {
    console.log('\n🔧 Clearing fake user session...');
    
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        console.log('   🔧 Opening page to clear localStorage...');
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
        
        // Clear all localStorage and sessionStorage
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
            console.log('🧹 Cleared localStorage and sessionStorage');
        });
        
        // Clear Supabase auth specifically
        await page.evaluate(() => {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.includes('supabase') || key.includes('auth') || key.includes('customer-portal')) {
                    localStorage.removeItem(key);
                    console.log(`🧹 Removed: ${key}`);
                }
            });
        });
        
        console.log('   ✅ Fake user session cleared');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.log('   ❌ Session clearing failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function fixLoadingIssue() {
    console.log('\n🔧 Fixing loading issue in CustomerContext...');
    
    // The issue is that loadCustomerData doesn't set loading to false when it fails
    // Let me read the current file and fix it
    const fs = require('fs');
    
    try {
        let content = fs.readFileSync('Customer Portal/src/contexts/CustomerContext.js', 'utf8');
        
        // Find the loadCustomerData function and ensure it always sets loading to false
        const loadCustomerDataRegex = /(const loadCustomerData = useCallback\(async \(authUser\) => \{[\s\S]*?\} catch \(error\) \{[\s\S]*?\})([\s\S]*?\}, \[\]\);)/;
        
        if (loadCustomerDataRegex.test(content)) {
            content = content.replace(loadCustomerDataRegex, (match, tryBlock, ending) => {
                // Ensure the catch block sets loading to false
                const fixedTryBlock = tryBlock.replace(
                    /} catch \(error\) \{[\s\S]*?\}/,
                    `} catch (error) {
      console.error('Error loading customer data:', error);
      console.log('🔧 Setting loading to false due to loadCustomerData error');
      setLoadingWithDebug(false);
      setIsAuthenticated(false);
    }`
                );
                return fixedTryBlock + ending;
            });
            
            fs.writeFileSync('Customer Portal/src/contexts/CustomerContext.js', content);
            console.log('   ✅ Fixed loadCustomerData error handling');
        } else {
            console.log('   ⚠️  Could not find loadCustomerData function to fix');
        }
        
    } catch (error) {
        console.log('   ❌ Failed to fix loading issue:', error.message);
    }
}

async function addLogoutButton() {
    console.log('\n🔧 Adding logout button to Layout...');
    
    const fs = require('fs');
    
    try {
        // First, add logout function to CustomerContext
        let contextContent = fs.readFileSync('Customer Portal/src/contexts/CustomerContext.js', 'utf8');
        
        // Add logout function before the return statement
        const logoutFunction = `
  const logout = async () => {
    try {
      console.log('🔧 Logging out user...');
      
      // Clear Supabase session
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Clear local state
      setCustomer(null);
      setIsAuthenticated(false);
      setSession(null);
      setLoadingWithDebug(false);
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
`;

        // Find the return statement and add logout to the context value
        if (contextContent.includes('return (')) {
            // Add logout function before return
            contextContent = contextContent.replace(
                /(\s+return \()/,
                logoutFunction + '$1'
            );
            
            // Add logout to context value
            contextContent = contextContent.replace(
                /(value=\{[\s\S]*?)(selfSignup,[\s\S]*?)\}/,
                '$1$2,\n        logout\n      }'
            );
            
            fs.writeFileSync('Customer Portal/src/contexts/CustomerContext.js', contextContent);
            console.log('   ✅ Added logout function to CustomerContext');
        }
        
        // Now add logout button to Layout
        const layoutPath = 'Customer Portal/src/components/Layout/Layout.js';
        
        if (fs.existsSync(layoutPath)) {
            let layoutContent = fs.readFileSync(layoutPath, 'utf8');
            
            // Add logout button to the layout (this is a simple approach)
            const logoutButtonHTML = `
              <button
                onClick={logout}
                className="ml-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                title="Logout"
              >
                Logout
              </button>`;
            
            // Find where to add the logout button (look for navigation or header area)
            if (layoutContent.includes('useCustomer')) {
                // Add logout to destructuring
                layoutContent = layoutContent.replace(
                    /const \{ ([^}]+) \} = useCustomer\(\);/,
                    'const { $1, logout } = useCustomer();'
                );
                
                // Add logout button to the layout (simple approach - add to any existing nav)
                if (layoutContent.includes('<nav') || layoutContent.includes('navigation')) {
                    layoutContent = layoutContent.replace(
                        /(<\/nav>)/,
                        logoutButtonHTML + '\n            $1'
                    );
                } else {
                    // Add to any header-like element
                    layoutContent = layoutContent.replace(
                        /(<header[\s\S]*?<\/header>)/,
                        '$1' + logoutButtonHTML
                    );
                }
                
                fs.writeFileSync(layoutPath, layoutContent);
                console.log('   ✅ Added logout button to Layout');
            } else {
                console.log('   ⚠️  Layout does not use useCustomer - will add logout differently');
            }
        } else {
            console.log('   ⚠️  Layout.js not found - will create simple logout component');
        }
        
    } catch (error) {
        console.log('   ❌ Failed to add logout button:', error.message);
    }
}

async function fixWebSocketErrors() {
    console.log('\n🔧 Fixing WebSocket connection errors...');
    
    const fs = require('fs');
    
    try {
        // Find and disable WebSocket connections that are trying to connect to localhost:3001
        const possibleFiles = [
            'Customer Portal/src/utils/socket.js',
            'Customer Portal/src/components/WebSocketClient.js',
            'Customer Portal/src/socket.js'
        ];
        
        for (const filePath of possibleFiles) {
            if (fs.existsSync(filePath)) {
                let content = fs.readFileSync(filePath, 'utf8');
                
                // Disable WebSocket connections by wrapping them in a check
                content = content.replace(
                    /new WebSocket\(/g,
                    '// Disabled for Customer Portal - new WebSocket('
                );
                
                content = content.replace(
                    /ws:\/\/localhost:3001/g,
                    '// Disabled - ws://localhost:3001'
                );
                
                fs.writeFileSync(filePath, content);
                console.log(`   ✅ Disabled WebSocket in ${filePath}`);
            }
        }
        
        console.log('   ✅ WebSocket errors should be resolved');
        
    } catch (error) {
        console.log('   ❌ Failed to fix WebSocket errors:', error.message);
    }
}

async function testCompleteFlow() {
    console.log('\n🧪 Testing complete flow...');
    
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        // Monitor console logs
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('🔧') || text.includes('✅') || text.includes('❌') || text.includes('Loading customer data')) {
                console.log(`   📊 ${text}`);
            }
        });

        console.log('   🔧 Testing fresh load...');
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

        console.log('   📊 Waiting 5 seconds to see if loading resolves...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check if we're on login page or stuck loading
        const currentUrl = page.url();
        console.log(`   📊 Current URL: ${currentUrl}`);

        const isOnLoginPage = currentUrl.includes('/login');
        const hasLoginElements = await page.$$eval('*', elements => {
            return elements.some(el => {
                const text = el.textContent || '';
                return text.includes('Email address') || text.includes('Magic Link');
            });
        });

        if (isOnLoginPage && hasLoginElements) {
            console.log('   ✅ SUCCESS: App loads to login page correctly');
        } else {
            console.log('   ❌ ISSUE: App still not loading correctly');
        }

        console.log('   📋 Keeping browser open for 10 seconds for inspection...');
        await new Promise(resolve => setTimeout(resolve, 10000));

    } catch (error) {
        console.log('   ❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the complete automation
fixStuckLoadingAndAddLogout().catch(console.error);
