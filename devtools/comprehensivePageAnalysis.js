/**
 * COMPREHENSIVE PAGE-BY-PAGE ANALYSIS
 * 
 * For each page:
 * 1. Test current functionality
 * 2. Compare to ServiceTitan/Jobber/Housecall Pro
 * 3. Identify pain points and missing features
 * 4. Generate fix recommendations
 */

const { chromium } = require('playwright');
const fs = require('fs');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

// Industry standard features for each page
const INDUSTRY_STANDARDS = {
  dashboard: {
    mustHave: [
      'Revenue metrics (today, week, month, year)',
      'Job status breakdown (scheduled, in progress, completed)',
      'Recent activity feed',
      'Quick actions (create quote, schedule job)',
      'Upcoming jobs calendar view',
      'Technician status (available, on job, off)',
      'Outstanding invoices total'
    ],
    competitors: {
      serviceTitan: ['Dispatch board', 'Revenue goals', 'Booking rate'],
      jobber: ['Client requests', 'Team schedule', 'Revenue chart'],
      housecallPro: ['Jobs today', 'Estimates pending', 'Revenue graph']
    },
    painPoints: [
      'Too many clicks to see important info',
      'No real-time updates',
      'Cant customize dashboard',
      'Mobile view is cluttered'
    ]
  },
  
  workOrders: {
    mustHave: [
      'Filter by status (all, scheduled, in progress, completed)',
      'Search by customer, job number, address',
      'Bulk actions (assign, reschedule, cancel)',
      'Quick view details without opening',
      'Drag to reschedule',
      'Color coding by priority/status',
      'Export to CSV/PDF'
    ],
    competitors: {
      serviceTitan: ['Dispatch board view', 'Map view', 'Technician assignment'],
      jobber: ['Kanban board', 'Timeline view', 'Client portal link'],
      housecallPro: ['Calendar integration', 'Route optimization', 'Job templates']
    },
    painPoints: [
      'Cant see job location on map',
      'No bulk rescheduling',
      'Cant assign multiple techs easily',
      'No job templates',
      'Slow to load with many jobs'
    ]
  },
  
  scheduling: {
    mustHave: [
      'Calendar view (day, week, month)',
      'Drag and drop to schedule/reschedule',
      'Technician availability view',
      'Color coding by job type/status',
      'Conflict detection',
      'Travel time calculation',
      'Recurring jobs support',
      'Unscheduled jobs sidebar'
    ],
    competitors: {
      serviceTitan: ['Dispatch board', 'Route optimization', 'Real-time GPS'],
      jobber: ['Team calendar', 'Client booking', 'Buffer time'],
      housecallPro: ['Online booking', 'Smart scheduling', 'Availability blocks']
    },
    painPoints: [
      'Calendar doesnt show all jobs',
      'Cant drag to reschedule',
      'No technician availability',
      'Double booking happens',
      'No travel time buffer',
      'Cant see job details on hover'
    ]
  },
  
  quotes: {
    mustHave: [
      'Quick quote creation',
      'Line items (labor, materials, equipment)',
      'Pricing tiers (good, better, best)',
      'Photo attachments',
      'Email/SMS sending',
      'E-signature capture',
      'Quote templates',
      'Approval workflow',
      'Convert to job with one click'
    ],
    competitors: {
      serviceTitan: ['Pricebook integration', 'Financing options', 'Membership pricing'],
      jobber: ['Quote templates', 'Online approval', 'Payment on approval'],
      housecallPro: ['Instant estimates', 'Photo markup', 'Video estimates']
    },
    painPoints: [
      'Labor line items disappear (FIXED!)',
      'Too many steps to create quote',
      'Cant duplicate quotes easily',
      'No pricing tiers',
      'Email sending is clunky',
      'No e-signature'
    ]
  },
  
  invoices: {
    mustHave: [
      'Auto-create from completed jobs',
      'Payment tracking (unpaid, partial, paid)',
      'Payment methods (cash, check, card, ACH)',
      'Email/SMS invoice',
      'Payment reminders',
      'Late fees',
      'Batch invoicing',
      'Export to QuickBooks/Xero'
    ],
    competitors: {
      serviceTitan: ['Payment processing', 'Recurring billing', 'Membership invoicing'],
      jobber: ['Online payments', 'Auto-reminders', 'Deposit requests'],
      housecallPro: ['Instant invoicing', 'Text-to-pay', 'Subscription billing']
    },
    painPoints: [
      'Invoices not showing (NEEDS FIX)',
      'Cant send payment reminders',
      'No online payment link',
      'Manual invoice creation is slow',
      'No recurring invoices'
    ]
  },
  
  customers: {
    mustHave: [
      'Contact info (name, phone, email, address)',
      'Job history',
      'Communication log',
      'Tags/categories',
      'Custom fields',
      'Billing info',
      'Service location(s)',
      'Equipment/property details',
      'Quick actions (call, text, email, create job)'
    ],
    competitors: {
      serviceTitan: ['Customer portal', 'Membership management', 'Equipment tracking'],
      jobber: ['Client hub', 'Property details', 'Request portal'],
      housecallPro: ['Customer app', 'Review requests', 'Referral tracking']
    },
    painPoints: [
      'Cant see all jobs at a glance',
      'No communication history',
      'Cant track equipment',
      'No customer portal',
      'Search is slow'
    ]
  },
  
  employees: {
    mustHave: [
      'Contact info',
      'Role/permissions',
      'Schedule/availability',
      'Skills/certifications',
      'Pay rate',
      'Commission tracking',
      'Performance metrics',
      'Time off requests',
      'Mobile app access'
    ],
    competitors: {
      serviceTitan: ['Technician scorecard', 'Commission rules', 'GPS tracking'],
      jobber: ['Team scheduling', 'Time tracking', 'Performance reports'],
      housecallPro: ['Tech app', 'Job assignment', 'Payroll integration']
    },
    painPoints: [
      'Cant see technician location',
      'No performance tracking',
      'Commission calculation is manual',
      'Cant manage availability easily'
    ]
  },
  
  timesheets: {
    mustHave: [
      'Clock in/out',
      'Job time tracking',
      'Break tracking',
      'Overtime calculation',
      'Approval workflow',
      'Export to payroll',
      'Mobile time entry',
      'GPS verification'
    ],
    competitors: {
      serviceTitan: ['Job costing', 'Timesheet approval', 'Payroll export'],
      jobber: ['Time tracking', 'Job profitability', 'QuickBooks sync'],
      housecallPro: ['Clock in/out', 'Job timer', 'Payroll integration']
    },
    painPoints: [
      'No timesheets showing (NEEDS DATA)',
      'Manual entry is tedious',
      'No mobile clock in',
      'Approval process is unclear'
    ]
  },
  
  pto: {
    mustHave: [
      'PTO balance display',
      'Request submission',
      'Approval workflow',
      'Calendar integration',
      'Accrual tracking',
      'Policy management',
      'Conflict detection',
      'Team calendar view'
    ],
    competitors: {
      serviceTitan: ['Time off calendar', 'Approval routing', 'Balance tracking'],
      jobber: ['Time off requests', 'Team availability', 'Auto-decline conflicts'],
      housecallPro: ['PTO calendar', 'Request approval', 'Availability blocking']
    },
    painPoints: [
      'PTO page not working (NEEDS FIX)',
      'No balance shown',
      'Approval process unclear',
      'Doesnt block calendar'
    ]
  }
};

const pageAnalysis = [];

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

async function analyzePage(page, pageName, url, standards) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 ANALYZING: ${pageName}`);
  console.log('='.repeat(80));
  
  const analysis = {
    page: pageName,
    url: url,
    currentFeatures: [],
    missingFeatures: [],
    painPoints: [],
    fixes: [],
    competitorComparison: {}
  };
  
  try {
    await page.goto(`${APP_URL}${url}`);
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: `devtools/screenshots/analysis-${pageName.toLowerCase().replace(/\s+/g, '-')}.png`,
      fullPage: true
    });
    
    // Check what's currently on the page
    const pageContent = await page.content();
    
    console.log('\n🔍 Checking current features...\n');
    
    // Check for must-have features
    for (const feature of standards.mustHave) {
      const hasFeature = await checkFeature(page, feature);
      if (hasFeature) {
        console.log(`   ✅ ${feature}`);
        analysis.currentFeatures.push(feature);
      } else {
        console.log(`   ❌ MISSING: ${feature}`);
        analysis.missingFeatures.push(feature);
      }
    }
    
    // Compare to competitors
    console.log('\n📊 Competitor comparison:\n');
    for (const [competitor, features] of Object.entries(standards.competitors)) {
      console.log(`   ${competitor}:`);
      for (const feature of features) {
        const hasFeature = await checkFeature(page, feature);
        if (!hasFeature) {
          console.log(`      ❌ Missing: ${feature}`);
          if (!analysis.missingFeatures.includes(feature)) {
            analysis.missingFeatures.push(feature);
          }
        }
      }
    }
    
    // Identify pain points
    console.log('\n⚠️  Known pain points to avoid:\n');
    for (const painPoint of standards.painPoints) {
      console.log(`   - ${painPoint}`);
      analysis.painPoints.push(painPoint);
    }
    
  } catch (err) {
    console.error(`\n❌ Error analyzing ${pageName}:`, err.message);
    analysis.error = err.message;
  }
  
  return analysis;
}

async function checkFeature(page, featureDescription) {
  // Simple heuristic: check if keywords from feature are in page
  const keywords = featureDescription.toLowerCase().split(' ');
  const pageText = await page.textContent('body').catch(() => '');
  
  // Check if at least 2 keywords are present
  const matches = keywords.filter(kw => 
    kw.length > 3 && pageText.toLowerCase().includes(kw)
  );
  
  return matches.length >= 2;
}

async function runComprehensiveAnalysis() {
  console.log('\n🔍 COMPREHENSIVE PAGE-BY-PAGE ANALYSIS');
  console.log('Comparing to ServiceTitan, Jobber, and Housecall Pro');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  try {
    await login(page);
    
    // Analyze key pages
    const pagesToAnalyze = [
      { name: 'Dashboard', url: '/dashboard', standards: INDUSTRY_STANDARDS.dashboard },
      { name: 'Work Orders', url: '/work-orders', standards: INDUSTRY_STANDARDS.workOrders },
      { name: 'Scheduling', url: '/scheduling', standards: INDUSTRY_STANDARDS.scheduling },
      { name: 'Quotes', url: '/quotes', standards: INDUSTRY_STANDARDS.quotes },
      { name: 'Invoices', url: '/invoices', standards: INDUSTRY_STANDARDS.invoices },
      { name: 'Customers', url: '/customers', standards: INDUSTRY_STANDARDS.customers },
      { name: 'Employees', url: '/employees', standards: INDUSTRY_STANDARDS.employees },
      { name: 'Timesheets', url: '/timesheets', standards: INDUSTRY_STANDARDS.timesheets },
      { name: 'PTO', url: '/my-time-off', standards: INDUSTRY_STANDARDS.pto }
    ];
    
    for (const pageInfo of pagesToAnalyze) {
      const analysis = await analyzePage(page, pageInfo.name, pageInfo.url, pageInfo.standards);
      pageAnalysis.push(analysis);
    }
    
    // Generate summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 ANALYSIS SUMMARY');
    console.log('='.repeat(80));
    
    pageAnalysis.forEach(analysis => {
      console.log(`\n${analysis.page}:`);
      console.log(`   Current features: ${analysis.currentFeatures.length}`);
      console.log(`   Missing features: ${analysis.missingFeatures.length}`);
      console.log(`   Pain points to address: ${analysis.painPoints.length}`);
    });
    
    // Save results
    fs.writeFileSync(
      'devtools/logs/page-analysis-results.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        pages: pageAnalysis
      }, null, 2)
    );
    
    console.log('\n='.repeat(80));
    console.log('\n📁 Results saved to: devtools/logs/page-analysis-results.json');
    console.log('\nPress Ctrl+C to close browser.\n');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (err) {
    console.error('\n❌ ERROR:', err);
    await browser.close();
    process.exit(1);
  }
}

if (require.main === module) {
  runComprehensiveAnalysis().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runComprehensiveAnalysis };

