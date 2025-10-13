// Test Quote SMS Sending from Quotes Page
// This script automates testing the Twilio SMS integration

const puppeteer = require('puppeteer');

const APP_URL = 'http://localhost:3005';
const LOGIN_EMAIL = 'jeraldjsmith@gmail.com';
const LOGIN_PASSWORD = 'Gizmo123';

console.log('🧪 Testing Quote SMS Sending...\n');

async function testQuoteSMSSending() {
  let browser;
  
  try {
    // Launch browser
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Show browser so user can see what's happening
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('SMS') || text.includes('Twilio') || text.includes('send-sms')) {
        console.log(`📋 Browser console: ${text}`);
      }
    });
    
    // Listen for network requests
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('send-sms')) {
        console.log(`\n📡 Edge Function called: ${url}`);
        console.log(`   Status: ${response.status()}`);
        
        try {
          const body = await response.text();
          console.log(`   Response: ${body.substring(0, 200)}...\n`);
        } catch (err) {
          console.log(`   (Could not read response body)`);
        }
      }
    });
    
    // Go to login page
    console.log('📱 Navigating to app...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
    
    // Login
    console.log('🔐 Logging in...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', LOGIN_EMAIL);
    await page.type('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    console.log('⏳ Waiting for dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    
    // Navigate to Quotes page
    console.log('📄 Navigating to Quotes page...');
    await page.goto(`${APP_URL}/quotes`, { waitUntil: 'networkidle2' });
    
    // Wait for quotes to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find first quote and click Send button
    console.log('🔍 Looking for Send button...');
    const sendButtons = await page.$$('button');
    let sendButton = null;
    
    for (const button of sendButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text.includes('Send') && !text.includes('Resend')) {
        sendButton = button;
        break;
      }
    }
    
    if (!sendButton) {
      console.error('❌ Could not find Send button on Quotes page');
      console.log('💡 Make sure there is at least one quote in draft/pending status');
      return;
    }
    
    console.log('✅ Found Send button, clicking...');
    await sendButton.click();
    
    // Wait for modal to open
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Select SMS option
    console.log('📱 Selecting SMS delivery method...');
    const smsRadio = await page.$('input[value="sms"]');
    if (!smsRadio) {
      console.error('❌ Could not find SMS radio button');
      return;
    }
    await smsRadio.click();

    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Click Send Quote button
    console.log('📤 Clicking Send Quote button...');
    const modalButtons = await page.$$('button');
    let sendQuoteButton = null;
    
    for (const button of modalButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text.includes('Send Quote')) {
        sendQuoteButton = button;
        break;
      }
    }
    
    if (!sendQuoteButton) {
      console.error('❌ Could not find Send Quote button in modal');
      return;
    }
    
    await sendQuoteButton.click();
    
    // Wait for response
    console.log('⏳ Waiting for SMS to send...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check for success/error messages
    const pageContent = await page.content();
    
    if (pageContent.includes('Quote sent via SMS')) {
      console.log('\n✅ SUCCESS! Quote sent via SMS!');
      console.log('📱 Check the customer phone number for the SMS message.');
    } else if (pageContent.includes('SMS failed') || pageContent.includes('failed')) {
      console.log('\n❌ SMS FAILED!');
      console.log('Check the browser console and network tab for error details.');
    } else {
      console.log('\n⚠️  Could not determine if SMS was sent successfully.');
      console.log('Check the browser console and network tab manually.');
    }
    
    // Keep browser open for 10 seconds so user can see result
    console.log('\n⏳ Keeping browser open for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testQuoteSMSSending();

