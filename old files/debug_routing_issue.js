const puppeteer = require('puppeteer');

async function debugRoutingIssue() {
    console.log('🔍 DEBUGGING ROUTING ISSUE');
    console.log('=' .repeat(40));

    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        // Monitor all console logs
        page.on('console', msg => {
            console.log(`   📊 ${msg.text()}`);
        });

        console.log('\n🔧 Loading root page...');
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

        console.log('\n📊 Waiting 5 seconds and monitoring...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check what's actually rendered
        const pageContent = await page.evaluate(() => {
            const body = document.body;
            return {
                hasLoadingSpinner: !!body.querySelector('[class*="loading"], [class*="spinner"]'),
                hasLoginForm: !!body.querySelector('input[type="email"], input[name="email"]'),
                hasSignupForm: !!body.querySelector('input[name="name"], input[placeholder*="name"]'),
                bodyText: body.textContent.substring(0, 500),
                currentPath: window.location.pathname,
                reactElements: !!window.React
            };
        });

        console.log('\n📊 Page Analysis:');
        console.log(`   Current Path: ${pageContent.currentPath}`);
        console.log(`   Has Loading Spinner: ${pageContent.hasLoadingSpinner}`);
        console.log(`   Has Login Form: ${pageContent.hasLoginForm}`);
        console.log(`   Has Signup Form: ${pageContent.hasSignupForm}`);
        console.log(`   React Available: ${pageContent.reactElements}`);
        console.log(`   Body Text: "${pageContent.bodyText.replace(/\s+/g, ' ').trim()}"`);

        // Check if we can manually navigate to login
        console.log('\n🔧 Manually navigating to /login...');
        await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
        await new Promise(resolve => setTimeout(resolve, 2000));

        const loginPageContent = await page.evaluate(() => {
            const body = document.body;
            return {
                currentPath: window.location.pathname,
                hasEmailInput: !!body.querySelector('input[type="email"]'),
                hasPasswordInput: !!body.querySelector('input[type="password"]'),
                hasMagicLinkButton: body.textContent.includes('Magic Link'),
                bodyText: body.textContent.substring(0, 300)
            };
        });

        console.log('\n📊 Login Page Analysis:');
        console.log(`   Current Path: ${loginPageContent.currentPath}`);
        console.log(`   Has Email Input: ${loginPageContent.hasEmailInput}`);
        console.log(`   Has Password Input: ${loginPageContent.hasPasswordInput}`);
        console.log(`   Has Magic Link: ${loginPageContent.hasMagicLinkButton}`);
        console.log(`   Body Text: "${loginPageContent.bodyText.replace(/\s+/g, ' ').trim()}"`);

        console.log('\n📋 Keeping browser open for manual inspection...');
        await new Promise(resolve => setTimeout(resolve, 10000));

    } catch (error) {
        console.log('   ❌ Debug failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

debugRoutingIssue().catch(console.error);
