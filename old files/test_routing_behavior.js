const puppeteer = require('puppeteer');

async function testRoutingBehavior() {
    console.log('🔍 Testing Routing Behavior');
    
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
            if (text.includes('🔧') || text.includes('✅') || text.includes('📊') || text.includes('Auth')) {
                console.log(`   📊 ${text}`);
            }
        });

        // Monitor navigation
        page.on('framenavigated', frame => {
            if (frame === page.mainFrame()) {
                console.log(`   🔗 Navigated to: ${frame.url()}`);
            }
        });

        console.log('   🔧 Loading root page (/)...');
        await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

        console.log('   📊 Waiting for auth check and potential redirect...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check current URL
        const currentUrl = page.url();
        console.log(`   📊 Current URL: ${currentUrl}`);

        // Check for login/signup elements
        const authElements = await page.$$eval('*', elements => {
            return elements.filter(el => {
                const text = el.textContent || '';
                return text.includes('Sign Up') || 
                       text.includes('Login') || 
                       text.includes('Sign In') ||
                       text.includes('Register') ||
                       text.includes('Email') ||
                       text.includes('Password');
            }).map(el => ({
                tag: el.tagName,
                text: el.textContent?.substring(0, 100),
                type: el.type || 'N/A'
            }));
        });

        console.log(`   📊 Auth elements found: ${authElements.length}`);
        authElements.forEach((el, i) => {
            console.log(`     ${i + 1}. ${el.tag}: "${el.text}"`);
        });

        // Try navigating directly to login
        console.log('   🔧 Trying direct navigation to /login...');
        await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const loginUrl = page.url();
        console.log(`   📊 Login page URL: ${loginUrl}`);

        // Check for login form elements
        const loginElements = await page.$$eval('*', elements => {
            return elements.filter(el => {
                const text = el.textContent || '';
                return text.includes('Email') || 
                       text.includes('Password') ||
                       text.includes('Login') ||
                       text.includes('Sign In');
            }).map(el => ({
                tag: el.tagName,
                text: el.textContent?.substring(0, 50),
                type: el.type || 'N/A'
            }));
        });

        console.log(`   📊 Login form elements: ${loginElements.length}`);
        loginElements.forEach((el, i) => {
            console.log(`     ${i + 1}. ${el.tag}[${el.type}]: "${el.text}"`);
        });

        await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
        console.log('   ❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testRoutingBehavior().catch(console.error);
