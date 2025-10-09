const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

async function verifyCompilationAndNoPersistence() {
    console.log('🚀 VERIFY COMPILATION AND NO PERSISTENCE');
    console.log('=' .repeat(60));

    console.log('\n📋 STEP 1: CHECK COMPILATION');
    await checkCompilation();

    console.log('\n📋 STEP 2: TEST NO SESSION PERSISTENCE');
    await testNoSessionPersistence();

    console.log('\n🎯 VERIFICATION COMPLETE!');
}

async function checkCompilation() {
    console.log('\n🔧 Checking if app compiles without errors...');
    
    return new Promise((resolve) => {
        const buildProcess = spawn('npm', ['run', 'build'], {
            cwd: 'Customer Portal',
            stdio: 'pipe'
        });

        let output = '';
        let hasErrors = false;

        buildProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        buildProcess.stderr.on('data', (data) => {
            const errorText = data.toString();
            output += errorText;
            
            if (errorText.includes('ERROR') || errorText.includes('Failed to compile')) {
                hasErrors = true;
            }
        });

        buildProcess.on('close', (code) => {
            if (code === 0 && !hasErrors) {
                console.log('   ✅ SUCCESS: App compiles without errors');
            } else {
                console.log('   ❌ COMPILATION ISSUES FOUND:');
                console.log('   ' + output.split('\n').slice(-20).join('\n   '));
            }
            resolve();
        });

        // Timeout after 60 seconds
        setTimeout(() => {
            buildProcess.kill();
            console.log('   ⚠️  Build timeout - checking manually');
            resolve();
        }, 60000);
    });
}

async function testNoSessionPersistence() {
    console.log('\n🔧 Testing session persistence behavior...');
    
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        // Monitor console logs
        const consoleLogs = [];
        page.on('console', msg => {
            const text = msg.text();
            consoleLogs.push(text);
            
            if (text.includes('🔧') || text.includes('✅') || text.includes('🧹') || text.includes('cbrown')) {
                console.log(`   📊 ${text}`);
            }
        });

        console.log('   🔧 Loading Customer Portal...');
        
        // Try to find the running app
        const ports = [3000, 3001, 3002, 3003];
        let workingPort = null;
        
        for (const port of ports) {
            try {
                await page.goto(`http://localhost:${port}`, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 5000 
                });
                
                const hasCustomerPortal = await page.evaluate(() => {
                    return document.body.textContent.includes('Customer Portal') ||
                           document.body.textContent.includes('Magic Link');
                });
                
                if (hasCustomerPortal) {
                    workingPort = port;
                    break;
                }
            } catch (error) {
                // Continue to next port
            }
        }
        
        if (workingPort) {
            console.log(`   ✅ Found Customer Portal on port ${workingPort}`);
            
            // Wait for auth initialization
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Check if fake user appears
            const hasFakeUser = await page.evaluate(() => {
                return document.body.textContent.includes('cbrown@cgrenewables.com');
            });
            
            const currentUrl = page.url();
            
            console.log(`   📊 Current URL: ${currentUrl}`);
            console.log(`   📊 Has fake user: ${hasFakeUser ? '❌ YES' : '✅ NO'}`);
            
            // Check console logs for session clearing
            const hasSessionClearing = consoleLogs.some(log => 
                log.includes('Cleared any persisted sessions') || 
                log.includes('🧹')
            );
            
            console.log(`   📊 Session clearing detected: ${hasSessionClearing ? '✅ YES' : '❌ NO'}`);
            
            // Test multiple refreshes to ensure no persistence
            console.log('   🔧 Testing multiple refreshes...');
            
            for (let i = 1; i <= 3; i++) {
                await page.reload({ waitUntil: 'domcontentloaded' });
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const stillHasFakeUser = await page.evaluate(() => {
                    return document.body.textContent.includes('cbrown@cgrenewables.com');
                });
                
                console.log(`   📊 Refresh ${i}: Fake user present: ${stillHasFakeUser ? '❌ YES' : '✅ NO'}`);
            }
            
            // Final assessment
            const finalUrl = page.url();
            const finalHasFakeUser = await page.evaluate(() => {
                return document.body.textContent.includes('cbrown@cgrenewables.com');
            });
            
            console.log('\n   📋 FINAL ASSESSMENT:');
            if (finalUrl.includes('/login') && !finalHasFakeUser) {
                console.log('   🎉 SUCCESS: No session persistence, clean login page');
            } else if (finalHasFakeUser) {
                console.log('   ❌ ISSUE: Fake user still persisting');
            } else {
                console.log('   ⚠️  Partial success: Check login redirect');
            }
            
        } else {
            console.log('   ❌ Could not find running Customer Portal');
            console.log('   📋 Make sure to run: cd "Customer Portal" && npm start');
        }
        
        console.log('\n   📋 Keeping browser open for 10 seconds for verification...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
    } catch (error) {
        console.log('   ❌ Session persistence test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

verifyCompilationAndNoPersistence().catch(console.error);
