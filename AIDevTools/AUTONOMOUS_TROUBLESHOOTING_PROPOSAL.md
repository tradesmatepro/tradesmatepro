# 🤖 Autonomous Troubleshooting - Implementation Proposal

**Date:** 2025-10-09  
**Status:** PROPOSAL  
**Goal:** Enable AI to fix external service issues (Resend, Supabase) autonomously

---

## 🎯 Current Limitation

The AI can:
- ✅ Test the TradeMate Pro app
- ✅ Identify issues (e.g., "Invalid API key")
- ✅ Capture evidence with screenshots

The AI **cannot**:
- ❌ Log into Resend dashboard
- ❌ Create new API keys
- ❌ Update Supabase secrets
- ❌ Redeploy Edge Functions
- ❌ Read Edge Function logs

**Result:** AI can identify the problem but cannot fix it autonomously.

---

## 🛠️ Proposed Solution: Three-Tier Approach

### Tier 1: API Integration (Safest) ⭐ RECOMMENDED

Add direct API access to external services.

#### Supabase Management API

```javascript
// AIDevTools/supabaseManagementAPI.js

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF;

class SupabaseManagementAPI {
  // Get Edge Function logs
  async getEdgeFunctionLogs(functionName, limit = 100) {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/functions/${functionName}/logs?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.json();
  }

  // Update secret
  async updateSecret(name, value) {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/secrets`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, value })
      }
    );
    return response.json();
  }

  // Deploy Edge Function
  async deployFunction(functionName) {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/functions/${functionName}/deploy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.json();
  }

  // List all secrets
  async listSecrets() {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/secrets`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.json();
  }
}

module.exports = new SupabaseManagementAPI();
```

#### Resend API Integration

```javascript
// AIDevTools/resendAPI.js

const RESEND_API_KEY = process.env.RESEND_API_KEY;

class ResendAPI {
  // Validate API key
  async validateAPIKey(apiKey = RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/api-keys', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Create new API key
  async createAPIKey(name, permission = 'full_access') {
    const response = await fetch('https://api.resend.com/api-keys', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, permission })
    });
    return response.json();
  }

  // List API keys
  async listAPIKeys() {
    const response = await fetch('https://api.resend.com/api-keys', {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  // Test email sending
  async sendTestEmail(to, from, subject, body) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html: body
      })
    });
    return response.json();
  }
}

module.exports = new ResendAPI();
```

#### Autonomous Fix Script

```javascript
// AIDevTools/autoFixResendAPIKey.js

const supabaseAPI = require('./supabaseManagementAPI');
const resendAPI = require('./resendAPI');
const { appendToPhaseLog } = require('./phaseLogger');

async function autoFixResendAPIKey() {
  console.log('🔧 Starting autonomous fix for Resend API key...\n');

  // Step 1: Validate current key
  console.log('📋 Step 1: Validating current Resend API key...');
  const currentKeyValid = await resendAPI.validateAPIKey();
  
  if (currentKeyValid) {
    console.log('   ✅ Current API key is valid - no fix needed');
    return { success: true, message: 'API key already valid' };
  }
  
  console.log('   ❌ Current API key is invalid');
  appendToPhaseLog('🔍 Detected invalid Resend API key');

  // Step 2: Create new API key
  console.log('\n📋 Step 2: Creating new Resend API key...');
  const newKey = await resendAPI.createAPIKey('TradeMate-Pro-Auto-Generated');
  
  if (!newKey.id) {
    console.log('   ❌ Failed to create new API key');
    return { success: false, error: 'Failed to create API key' };
  }
  
  console.log(`   ✅ New API key created: ${newKey.id}`);
  appendToPhaseLog(`✅ Created new Resend API key: ${newKey.id}`);

  // Step 3: Update Supabase secret
  console.log('\n📋 Step 3: Updating Supabase secret...');
  const updateResult = await supabaseAPI.updateSecret('RESEND_API_KEY', newKey.token);
  
  if (!updateResult.success) {
    console.log('   ❌ Failed to update Supabase secret');
    return { success: false, error: 'Failed to update secret' };
  }
  
  console.log('   ✅ Supabase secret updated');
  appendToPhaseLog('✅ Updated RESEND_API_KEY in Supabase secrets');

  // Step 4: Redeploy Edge Function
  console.log('\n📋 Step 4: Redeploying Edge Function...');
  const deployResult = await supabaseAPI.deployFunction('send-quote-email');
  
  if (!deployResult.success) {
    console.log('   ❌ Failed to redeploy Edge Function');
    return { success: false, error: 'Failed to redeploy function' };
  }
  
  console.log('   ✅ Edge Function redeployed');
  appendToPhaseLog('✅ Redeployed send-quote-email Edge Function');

  // Step 5: Test email sending
  console.log('\n📋 Step 5: Testing email sending...');
  const testResult = await resendAPI.sendTestEmail(
    'test@example.com',
    'noreply@trademateapp.com',
    'Test Email - Auto Fix',
    '<p>This is a test email to verify the API key is working.</p>'
  );
  
  if (testResult.id) {
    console.log(`   ✅ Test email sent successfully: ${testResult.id}`);
    appendToPhaseLog(`✅ Test email sent successfully: ${testResult.id}`);
  } else {
    console.log('   ⚠️  Test email failed, but API key should be valid');
  }

  console.log('\n🎉 Autonomous fix complete!');
  appendToPhaseLog('🎉 Autonomous fix for Resend API key complete');

  return {
    success: true,
    newKeyId: newKey.id,
    testEmailId: testResult.id
  };
}

// CLI support
if (require.main === module) {
  autoFixResendAPIKey()
    .then(result => {
      console.log('\n📊 Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { autoFixResendAPIKey };
```

---

### Tier 2: Browser Automation for External Sites (Advanced)

Enable Playwright to navigate external websites.

```javascript
// AIDevTools/externalSiteAutomation.js

async function loginToResend(email, password) {
  await page.goto('https://resend.com/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
}

async function createResendAPIKey(name) {
  await page.goto('https://resend.com/api-keys');
  await page.click('button:has-text("Create API Key")');
  await page.fill('input[name="name"]', name);
  await page.click('button:has-text("Create")');
  
  // Extract the new API key from the page
  const apiKey = await page.locator('[data-testid="api-key"]').textContent();
  return apiKey;
}
```

**Pros:**
- Can handle complex UI flows
- Works even if API is not available
- Can verify changes visually

**Cons:**
- Requires storing credentials
- May break if UI changes
- Slower than API calls
- May trigger security alerts

---

### Tier 3: Hybrid Approach (Best of Both Worlds)

Use APIs when available, fall back to browser automation when needed.

```javascript
// AIDevTools/autonomousTroubleshooter.js

async function fixResendAPIKey() {
  // Try API first
  try {
    return await autoFixResendAPIKey(); // Tier 1
  } catch (error) {
    console.log('⚠️  API approach failed, trying browser automation...');
    return await fixResendAPIKeyViaBrowser(); // Tier 2
  }
}
```

---

## 🔐 Security Considerations

### Required Credentials

**Tier 1 (API):**
- `SUPABASE_ACCESS_TOKEN` - Supabase Management API token
- `SUPABASE_PROJECT_REF` - Your project reference
- `RESEND_API_KEY` - Master Resend API key (to create new keys)

**Tier 2 (Browser):**
- `RESEND_EMAIL` - Your Resend login email
- `RESEND_PASSWORD` - Your Resend password
- `SUPABASE_EMAIL` - Your Supabase login email
- `SUPABASE_PASSWORD` - Your Supabase password

### Storage

Store in `AIDevTools/credentials.json` (gitignored):

```json
{
  "supabase": {
    "accessToken": "sbp_...",
    "projectRef": "cxlqzejzraczumqmsrcx"
  },
  "resend": {
    "apiKey": "re_...",
    "email": "your@email.com",
    "password": "encrypted_password"
  }
}
```

---

## 📊 Comparison

| Feature | Tier 1 (API) | Tier 2 (Browser) | Tier 3 (Hybrid) |
|---------|--------------|------------------|-----------------|
| Speed | ⚡⚡⚡ Fast | 🐌 Slow | ⚡⚡ Medium |
| Reliability | ✅ High | ⚠️ Medium | ✅ High |
| Security | ✅ API tokens | ⚠️ Passwords | ✅ API tokens |
| Maintenance | ✅ Low | ❌ High | ⚠️ Medium |
| Visual verification | ❌ No | ✅ Yes | ✅ Yes |
| Works offline | ❌ No | ❌ No | ❌ No |

---

## 🎯 Recommendation

**Implement Tier 1 (API Integration) first:**

1. ✅ Safer (uses API tokens, not passwords)
2. ✅ Faster (direct API calls)
3. ✅ More reliable (no UI changes to break)
4. ✅ Easier to maintain
5. ✅ Better error handling

**Add Tier 2 (Browser Automation) later if needed:**
- For services without APIs
- For visual verification
- For complex workflows

---

## 🚀 Implementation Steps

### Phase 1: API Integration (1-2 hours)

1. Create `AIDevTools/supabaseManagementAPI.js`
2. Create `AIDevTools/resendAPI.js`
3. Create `AIDevTools/autoFixResendAPIKey.js`
4. Add credentials to `AIDevTools/credentials.json`
5. Test autonomous fix script

### Phase 2: Integration with Test Runner (30 minutes)

1. Update `autoTestRunner.js` to call auto-fix on errors
2. Add retry logic after fix
3. Update reporting

### Phase 3: Browser Automation (Optional, 2-3 hours)

1. Create `AIDevTools/externalSiteAutomation.js`
2. Add login flows for Resend/Supabase
3. Add fallback logic

---

## ✅ Expected Result

After implementation, the AI will:

1. **Detect issue** - "Invalid API key"
2. **Validate current key** - Check if it's really invalid
3. **Create new key** - Via Resend API
4. **Update Supabase secret** - Via Supabase Management API
5. **Redeploy function** - Via Supabase Management API
6. **Test email** - Verify fix worked
7. **Re-run test** - Confirm quote sending works
8. **Report success** - Document the fix

**All autonomously, without human intervention!**

---

**Status:** PROPOSAL  
**Recommended:** Tier 1 (API Integration)  
**Estimated Time:** 2-3 hours  
**Dependencies:** Supabase access token, Resend API key

