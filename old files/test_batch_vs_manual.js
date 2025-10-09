const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

async function testBatchVsManual() {
    console.log('🚀 TESTING BATCH FILE VS MANUAL START');
    console.log('=' .repeat(60));

    console.log('\n📋 ANALYSIS: Batch File vs Manual Start Differences');
    
    // Check the batch file content
    const fs = require('fs');
    const batchPath = path.join('Customer Portal', 'start-portal.bat');
    
    if (fs.existsSync(batchPath)) {
        console.log('\n🔧 Current batch file content:');
        const batchContent = fs.readFileSync(batchPath, 'utf8');
        console.log('   ' + batchContent.split('\n').map(line => `   ${line}`).join('\n'));
    }

    console.log('\n📋 POTENTIAL ISSUES WITH BATCH FILE:');
    console.log('   1. Working directory might not be set correctly');
    console.log('   2. Environment variables might be different');
    console.log('   3. PATH issues with npm/node');
    console.log('   4. Console output buffering');

    console.log('\n🔧 Creating improved batch file...');
    
    const improvedBatchContent = `@echo off
cd /d "%~dp0"
echo ========================================
echo TradeMate Pro Customer Portal
echo ========================================
echo.
echo Working Directory: %CD%
echo.
echo Checking environment...
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found in PATH
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo ❌ NPM not found in PATH
    pause
    exit /b 1
)

echo ✅ Node.js and NPM found
echo.
echo Starting Customer Portal...
echo Opening browser at http://localhost:3000
echo.
echo To stop the server, press Ctrl+C
echo.
set BROWSER=none
npm start`;

    fs.writeFileSync(path.join('Customer Portal', 'start-portal-fixed.bat'), improvedBatchContent);
    console.log('   ✅ Created start-portal-fixed.bat');

    console.log('\n📋 KEY IMPROVEMENTS:');
    console.log('   ✅ cd /d "%~dp0" - Sets working directory to batch file location');
    console.log('   ✅ Checks for node/npm in PATH');
    console.log('   ✅ set BROWSER=none - Prevents automatic browser opening conflicts');
    console.log('   ✅ Better error handling');

    console.log('\n🔧 Testing the improved batch file behavior...');
    
    // Test if we can detect the difference in behavior
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        // Monitor for specific issues that might occur with batch file
        const issues = [];
        
        page.on('console', msg => {
            const text = msg.text();
            
            // Look for signs of the loading loop issue
            if (text.includes('🔍 Checking auth status...') && 
                !text.includes('🔧 LOADING STATE CHANGE')) {
                issues.push('Auth status check without loading state change');
            }
            
            if (text.includes('Loading customer data for user: cbrown@cgrenewables.com')) {
                issues.push('Fake user data loading detected');
            }
            
            console.log(`   📊 ${text}`);
        });

        // Try to access the app
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
            console.log(`   ✅ Found app running on port ${workingPort}`);
            
            // Wait and monitor for the loading loop issue
            console.log('   🔧 Monitoring for loading loop issues...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            const pageState = await page.evaluate(() => {
                return {
                    currentUrl: window.location.href,
                    hasLoadingSpinner: !!document.querySelector('[class*="loading"], [class*="spinner"]'),
                    bodyText: document.body.textContent.substring(0, 300),
                    hasFakeUser: document.body.textContent.includes('cbrown@cgrenewables.com')
                };
            });
            
            console.log('\n   📊 Current Page State:');
            console.log(`      URL: ${pageState.currentUrl}`);
            console.log(`      Has Loading Spinner: ${pageState.hasLoadingSpinner ? '❌ YES' : '✅ NO'}`);
            console.log(`      Has Fake User: ${pageState.hasFakeUser ? '❌ YES' : '✅ NO'}`);
            
            if (issues.length > 0) {
                console.log('\n   ⚠️  DETECTED ISSUES:');
                issues.forEach(issue => console.log(`      • ${issue}`));
            } else {
                console.log('\n   ✅ No loading loop issues detected');
            }
            
        } else {
            console.log('   ❌ No running Customer Portal found');
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
    } catch (error) {
        console.log('   ❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    console.log('\n📋 RECOMMENDATIONS:');
    console.log('=' .repeat(50));
    console.log('1. Use the new start-portal-fixed.bat file');
    console.log('2. Make sure to run it from the Customer Portal directory');
    console.log('3. If issues persist, try running manually: cd "Customer Portal" && npm start');
    console.log('4. Check if multiple instances are running on different ports');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('   Try running: Customer Portal\\start-portal-fixed.bat');
    console.log('   And let me know if the loading loop issue persists');
}

testBatchVsManual().catch(console.error);
