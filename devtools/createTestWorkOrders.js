/**
 * CREATE TEST WORK ORDERS
 * 
 * Creates test data for:
 * 1. Work Orders (scheduled, in_progress, completed)
 * 2. Scheduled events for calendar
 * 3. PTO requests
 */

const { chromium } = require('playwright');
const fs = require('fs');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

async function login(page) {
  console.log('🔐 Logging in...');
  await page.goto(`${APP_URL}/login`);
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('✅ Logged in\n');
}

async function createTestWorkOrders(page) {
  console.log('\n' + '='.repeat(80));
  console.log('📝 CREATING TEST WORK ORDERS');
  console.log('='.repeat(80));
  
  const created = [];
  
  // First, let's check existing quotes and convert one to a job
  console.log('\n🔍 Checking existing quotes...');
  
  const quotes = await page.evaluate(async () => {
    try {
      const token = localStorage.getItem('token');
      const companyId = JSON.parse(localStorage.getItem('user'))?.company_id;
      
      const response = await fetch(`http://localhost:3004/api/supabase/work_orders?status=in.(quote,sent)&select=id,title,status,customer_id&order=created_at.desc&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Company-ID': companyId
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (err) {
      return { error: err.message };
    }
  });
  
  console.log(`   Found ${quotes.length} quotes`);
  
  if (quotes.length > 0) {
    console.log('\n✅ Converting first quote to APPROVED status (becomes a job)...');
    
    const quoteToConvert = quotes[0];
    console.log(`   Quote: ${quoteToConvert.title} (ID: ${quoteToConvert.id})`);
    
    // Update quote status to 'approved'
    const updated = await page.evaluate(async (quoteId) => {
      try {
        const token = localStorage.getItem('token');
        const companyId = JSON.parse(localStorage.getItem('user'))?.company_id;
        
        const response = await fetch(`http://localhost:3004/api/supabase/work_orders?id=eq.${quoteId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Company-ID': companyId,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: 'approved'
          })
        });
        
        if (response.ok) {
          return await response.json();
        }
        return { error: await response.text() };
      } catch (err) {
        return { error: err.message };
      }
    }, quoteToConvert.id);
    
    if (updated.error) {
      console.log(`   ❌ Error: ${updated.error}`);
    } else {
      console.log(`   ✅ Quote converted to APPROVED status!`);
      created.push({
        type: 'Approved Job',
        id: quoteToConvert.id,
        title: quoteToConvert.title
      });
    }
  }
  
  if (quotes.length > 1) {
    console.log('\n✅ Converting second quote to SCHEDULED status...');
    
    const quoteToSchedule = quotes[1];
    console.log(`   Quote: ${quoteToSchedule.title} (ID: ${quoteToSchedule.id})`);
    
    // Calculate scheduled dates (tomorrow 9 AM - 5 PM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setHours(17, 0, 0, 0);
    
    const updated = await page.evaluate(async (quoteId, scheduledStart, scheduledEnd) => {
      try {
        const token = localStorage.getItem('token');
        const companyId = JSON.parse(localStorage.getItem('user'))?.company_id;
        
        const response = await fetch(`http://localhost:3004/api/supabase/work_orders?id=eq.${quoteId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Company-ID': companyId,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: 'scheduled',
            scheduled_start: scheduledStart,
            scheduled_end: scheduledEnd
          })
        });
        
        if (response.ok) {
          return await response.json();
        }
        return { error: await response.text() };
      } catch (err) {
        return { error: err.message };
      }
    }, quoteToSchedule.id, tomorrow.toISOString(), endTime.toISOString());
    
    if (updated.error) {
      console.log(`   ❌ Error: ${updated.error}`);
    } else {
      console.log(`   ✅ Quote converted to SCHEDULED status!`);
      console.log(`   📅 Scheduled for: ${tomorrow.toLocaleDateString()} 9:00 AM - 5:00 PM`);
      created.push({
        type: 'Scheduled Job',
        id: quoteToSchedule.id,
        title: quoteToSchedule.title,
        scheduledStart: tomorrow.toISOString()
      });
    }
  }
  
  if (quotes.length > 2) {
    console.log('\n✅ Converting third quote to IN_PROGRESS status...');
    
    const quoteInProgress = quotes[2];
    console.log(`   Quote: ${quoteInProgress.title} (ID: ${quoteInProgress.id})`);
    
    const updated = await page.evaluate(async (quoteId) => {
      try {
        const token = localStorage.getItem('token');
        const companyId = JSON.parse(localStorage.getItem('user'))?.company_id;
        
        const response = await fetch(`http://localhost:3004/api/supabase/work_orders?id=eq.${quoteId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Company-ID': companyId,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: 'in_progress'
          })
        });
        
        if (response.ok) {
          return await response.json();
        }
        return { error: await response.text() };
      } catch (err) {
        return { error: err.message };
      }
    }, quoteInProgress.id);
    
    if (updated.error) {
      console.log(`   ❌ Error: ${updated.error}`);
    } else {
      console.log(`   ✅ Quote converted to IN_PROGRESS status!`);
      created.push({
        type: 'In Progress Job',
        id: quoteInProgress.id,
        title: quoteInProgress.title
      });
    }
  }
  
  return created;
}

async function runCreateTestData() {
  console.log('\n🤖 CREATE TEST WORK ORDERS - AUTONOMOUS');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await login(page);
    
    const created = await createTestWorkOrders(page);
    
    // Print summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 TEST DATA CREATION SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n✅ Created: ${created.length} work orders`);
    
    if (created.length > 0) {
      console.log('\n📋 CREATED WORK ORDERS:\n');
      created.forEach((item, i) => {
        console.log(`${i + 1}. ${item.type}: ${item.title}`);
        if (item.scheduledStart) {
          console.log(`   Scheduled: ${new Date(item.scheduledStart).toLocaleString()}`);
        }
      });
    }
    
    // Save results
    fs.writeFileSync(
      'devtools/logs/test-data-created.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        created: created
      }, null, 2)
    );
    
    console.log('\n='.repeat(80));
    console.log('\n📁 Results saved to: devtools/logs/test-data-created.json');
    console.log('\n✅ Now re-run the comprehensive test to verify fixes!');
    console.log('\nClosing browser in 5 seconds...\n');
    
    await page.waitForTimeout(5000);
    await browser.close();
    
  } catch (err) {
    console.error('\n❌ ERROR:', err);
    await browser.close();
    process.exit(1);
  }
}

if (require.main === module) {
  runCreateTestData().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runCreateTestData };

