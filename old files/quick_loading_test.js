const puppeteer = require('puppeteer');

async function quickLoadingTest() {
    console.log('🔍 Quick Loading State Test');
    
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
            if (text.includes('LOADING STATE CHANGE') || text.includes('🔧') || text.includes('✅')) {
                console.log(`   📊 ${text}`);
            }
        });

        console.log('   🔧 Loading page...');
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

        console.log('   📊 Waiting 5 seconds for loading state changes...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check current loading state
        const loadingElements = await page.$$eval('*', elements => {
            return elements.filter(el => {
                const text = el.textContent || '';
                const className = el.className || '';
                return text.includes('Loading') || 
                       text.includes('loading') || 
                       className.includes('loading') ||
                       className.includes('spinner');
            }).map(el => ({
                tag: el.tagName,
                text: el.textContent?.substring(0, 50),
                className: el.className
            }));
        });

        console.log('   📊 Current loading elements:', loadingElements);

        await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
        console.log('   ❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

quickLoadingTest().catch(console.error);
