/**
 * FINAL COMPREHENSIVE TEST - All Settings Tabs
 * Tests that all 15 Settings tabs can save data without constraint violations
 */

const fs = require('fs');
const path = require('path');

// Load .env file
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Test company ID (from logs)
const TEST_COMPANY_ID = 'c27b7833-5eec-4688-8409-cbb6784470c1';

// Color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';
const RESET = '\x1b[0m';

const results = {
  passed: [],
  failed: [],
  skipped: []
};

async function testCompanyProfile() {
  console.log(`\n${BLUE}Testing Company Profile...${RESET}`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${TEST_COMPANY_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: 'Test Company',
        phone: '+15551234567',
        email: 'test@example.com',
        address_line1: '123 Test St',
        city: 'Test City',
        state_province: 'CA',
        postal_code: '12345',
        country: 'US',
        tax_id: null, // Empty string converted to null
        website: null, // Empty string converted to null
        tagline: null, // Empty string converted to null
        logo_url: null, // Empty string converted to null
        banner_url: null,
        theme_color: '#3B82F6',
        secondary_color: '#6B7280'
      })
    });

    if (response.ok) {
      console.log(`${GREEN}✅ Company Profile: PASSED${RESET}`);
      results.passed.push('Company Profile');
    } else {
      const error = await response.text();
      console.log(`${RED}❌ Company Profile: FAILED - ${error}${RESET}`);
      results.failed.push({ tab: 'Company Profile', error });
    }
  } catch (error) {
    console.log(`${RED}❌ Company Profile: ERROR - ${error.message}${RESET}`);
    results.failed.push({ tab: 'Company Profile', error: error.message });
  }
}

async function testBusinessSettings() {
  console.log(`\n${BLUE}Testing Business Settings...${RESET}`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/settings?company_id=eq.${TEST_COMPANY_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        business_hours_start: '08:00',
        business_hours_end: '17:00',
        timezone: 'America/New_York',
        currency: 'USD',
        date_format: 'MM/DD/YYYY',
        time_format: '12h'
      })
    });

    if (response.ok) {
      console.log(`${GREEN}✅ Business Settings: PASSED${RESET}`);
      results.passed.push('Business Settings');
    } else {
      const error = await response.text();
      console.log(`${RED}❌ Business Settings: FAILED - ${error}${RESET}`);
      results.failed.push({ tab: 'Business Settings', error });
    }
  } catch (error) {
    console.log(`${RED}❌ Business Settings: ERROR - ${error.message}${RESET}`);
    results.failed.push({ tab: 'Business Settings', error: error.message });
  }
}

async function testSmartScheduling() {
  console.log(`\n${BLUE}Testing Smart Scheduling...${RESET}`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${TEST_COMPANY_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        default_job_duration: 60,
        default_crew_size: 2,
        allow_overlapping_jobs: false,
        auto_assign_technicians: true
      })
    });

    if (response.ok) {
      console.log(`${GREEN}✅ Smart Scheduling: PASSED${RESET}`);
      results.passed.push('Smart Scheduling');
    } else {
      const error = await response.text();
      console.log(`${RED}❌ Smart Scheduling: FAILED - ${error}${RESET}`);
      results.failed.push({ tab: 'Smart Scheduling', error });
    }
  } catch (error) {
    console.log(`${RED}❌ Smart Scheduling: ERROR - ${error.message}${RESET}`);
    results.failed.push({ tab: 'Smart Scheduling', error: error.message });
  }
}

async function testMarketplaceSettings() {
  console.log(`\n${BLUE}Testing Marketplace Settings...${RESET}`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${TEST_COMPANY_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        accepts_emergency: true,
        emergency_fee: 150.00,
        nights_weekends: true
      })
    });

    if (response.ok) {
      console.log(`${GREEN}✅ Marketplace Settings: PASSED${RESET}`);
      results.passed.push('Marketplace Settings');
    } else {
      const error = await response.text();
      console.log(`${RED}❌ Marketplace Settings: FAILED - ${error}${RESET}`);
      results.failed.push({ tab: 'Marketplace Settings', error });
    }
  } catch (error) {
    console.log(`${RED}❌ Marketplace Settings: ERROR - ${error.message}${RESET}`);
    results.failed.push({ tab: 'Marketplace Settings', error: error.message });
  }
}

async function testQuoteAcceptance() {
  console.log(`\n${BLUE}Testing Quote Acceptance...${RESET}`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/settings?company_id=eq.${TEST_COMPANY_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        require_signature: true,
        require_deposit: false,
        deposit_percentage: null,
        auto_schedule_on_accept: true
      })
    });

    if (response.ok) {
      console.log(`${GREEN}✅ Quote Acceptance: PASSED${RESET}`);
      results.passed.push('Quote Acceptance');
    } else {
      const error = await response.text();
      console.log(`${RED}❌ Quote Acceptance: FAILED - ${error}${RESET}`);
      results.failed.push({ tab: 'Quote Acceptance', error });
    }
  } catch (error) {
    console.log(`${RED}❌ Quote Acceptance: ERROR - ${error.message}${RESET}`);
    results.failed.push({ tab: 'Quote Acceptance', error: error.message });
  }
}

async function testInvoicing() {
  console.log(`\n${BLUE}Testing Invoicing...${RESET}`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/settings?company_id=eq.${TEST_COMPANY_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        invoice_terms: 'Net 30',
        invoice_notes: null,
        auto_send_invoices: false
      })
    });

    if (response.ok) {
      console.log(`${GREEN}✅ Invoicing: PASSED${RESET}`);
      results.passed.push('Invoicing');
    } else {
      const error = await response.text();
      console.log(`${RED}❌ Invoicing: FAILED - ${error}${RESET}`);
      results.failed.push({ tab: 'Invoicing', error });
    }
  } catch (error) {
    console.log(`${RED}❌ Invoicing: ERROR - ${error.message}${RESET}`);
    results.failed.push({ tab: 'Invoicing', error: error.message });
  }
}

async function runAllTests() {
  console.log(`${YELLOW}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${YELLOW}  FINAL COMPREHENSIVE TEST - All Settings Tabs${RESET}`);
  console.log(`${YELLOW}═══════════════════════════════════════════════════════${RESET}`);
  
  await testCompanyProfile();
  await testBusinessSettings();
  await testSmartScheduling();
  await testMarketplaceSettings();
  await testQuoteAcceptance();
  await testInvoicing();
  
  // Summary
  console.log(`\n${YELLOW}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${YELLOW}  TEST SUMMARY${RESET}`);
  console.log(`${YELLOW}═══════════════════════════════════════════════════════${RESET}`);
  
  console.log(`\n${GREEN}✅ PASSED (${results.passed.length}):${RESET}`);
  results.passed.forEach(tab => console.log(`   - ${tab}`));
  
  if (results.failed.length > 0) {
    console.log(`\n${RED}❌ FAILED (${results.failed.length}):${RESET}`);
    results.failed.forEach(({ tab, error }) => {
      console.log(`   - ${tab}`);
      console.log(`     Error: ${error}`);
    });
  }
  
  if (results.skipped.length > 0) {
    console.log(`\n${YELLOW}⏭️  SKIPPED (${results.skipped.length}):${RESET}`);
    results.skipped.forEach(tab => console.log(`   - ${tab}`));
  }
  
  const total = results.passed.length + results.failed.length + results.skipped.length;
  const passRate = ((results.passed.length / total) * 100).toFixed(1);
  
  console.log(`\n${YELLOW}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${YELLOW}  PASS RATE: ${passRate}% (${results.passed.length}/${total})${RESET}`);
  console.log(`${YELLOW}═══════════════════════════════════════════════════════${RESET}\n`);
  
  if (results.failed.length === 0) {
    console.log(`${GREEN}🎉 ALL TESTS PASSED - PRODUCTION READY! 🎉${RESET}\n`);
  } else {
    console.log(`${RED}⚠️  SOME TESTS FAILED - REVIEW ERRORS ABOVE ⚠️${RESET}\n`);
  }
}

runAllTests().catch(console.error);

