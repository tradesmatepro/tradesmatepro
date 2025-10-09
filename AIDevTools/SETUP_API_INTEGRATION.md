# 🔧 API Integration Setup Guide

**Date:** 2025-10-09  
**Status:** READY TO CONFIGURE  
**Purpose:** Enable autonomous troubleshooting of external services

---

## 📋 What Was Implemented

### 3 New Files Created

1. **`AIDevTools/credentials.json`** - Secure credential storage
2. **`AIDevTools/supabaseManagementAPI.js`** - Supabase Management API client
3. **`AIDevTools/resendAPI.js`** - Resend API client
4. **`AIDevTools/autoFixResendAPIKey.js`** - Autonomous fix script

### Security

- ✅ `credentials.json` added to `.gitignore`
- ✅ Credentials never committed to git
- ✅ API tokens used instead of passwords

---

## 🔑 Step 1: Get Your API Keys

### Supabase Access Token

1. Go to https://supabase.com/dashboard
2. Click on your project (TradeMate Pro)
3. Click **Settings** → **API**
4. Scroll down to **Project API keys**
5. Copy the **service_role** key (starts with `eyJ...`)
6. Also note your **Project Reference ID** (e.g., `cxlqzejzraczumqmsrcx`)

**OR** for Management API:

1. Go to https://supabase.com/dashboard/account/tokens
2. Click **Generate new token**
3. Name it "TradeMate Pro AI DevTools"
4. Copy the token (starts with `sbp_...`)

### Resend API Key

1. Go to https://resend.com/api-keys
2. Click **Create API Key**
3. Name it "TradeMate Pro - Master Key"
4. Permission: **Full Access** (needed to create new keys)
5. Copy the API key (starts with `re_...`)

---

## 🔧 Step 2: Configure Credentials

Open `AIDevTools/credentials.json` and replace the placeholder values:

```json
{
  "supabase": {
    "accessToken": "sbp_YOUR_ACTUAL_TOKEN_HERE",
    "projectRef": "cxlqzejzraczumqmsrcx",
    "serviceRoleKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "resend": {
    "apiKey": "re_YOUR_ACTUAL_KEY_HERE",
    "fromEmail": "noreply@trademateapp.com",
    "fromName": "TradeMate Pro"
  },
  "test": {
    "email": "jeraldjsmith@gmail.com",
    "password": "Gizmo123"
  }
}
```

**Important:**
- Replace `sbp_YOUR_ACTUAL_TOKEN_HERE` with your Supabase access token
- Replace `re_YOUR_ACTUAL_KEY_HERE` with your Resend API key
- Keep the `projectRef` as is (unless you have a different project)
- Update `fromEmail` if you have a verified domain in Resend

---

## ✅ Step 3: Test the APIs

### Test Resend API

```bash
# Validate API key
node AIDevTools/resendAPI.js validate

# List API keys
node AIDevTools/resendAPI.js list-keys

# Send test email
node AIDevTools/resendAPI.js send-test test@resend.dev

# List domains
node AIDevTools/resendAPI.js domains
```

### Test Supabase API

```bash
# Get project details
node AIDevTools/supabaseManagementAPI.js project

# List secrets
node AIDevTools/supabaseManagementAPI.js secrets

# Get Edge Function logs
node AIDevTools/supabaseManagementAPI.js logs send-quote-email 50

# Invoke Edge Function
node AIDevTools/supabaseManagementAPI.js invoke send-quote-email
```

---

## 🤖 Step 4: Run Autonomous Fix

Once credentials are configured, run the autonomous fix:

```bash
node AIDevTools/autoFixResendAPIKey.js
```

**What it does:**

1. ✅ Validates current Resend API key
2. ✅ Creates new API key if invalid
3. ✅ Updates Supabase secret
4. ✅ Updates local credentials file
5. ✅ Tests email sending
6. ✅ Provides next steps

**Expected output:**

```
════════════════════════════════════════════════════════════
🤖 Autonomous Fix: Resend API Key
════════════════════════════════════════════════════════════

📋 Step 1: Validating current Resend API key...
   ❌ Current API key is invalid

📋 Step 2: Creating new Resend API key...
   ✅ New API key created: key_abc123...
   🔑 Key name: TradeMate-Pro-1696875123456

📋 Step 3: Updating Supabase secret...
   ✅ Supabase secret updated

📋 Step 4: Updating local credentials file...
   ✅ Local credentials updated

📋 Step 5: Testing email sending with new key...
   ✅ Test email sent successfully: email_xyz789...

📋 Step 6: Next steps...
   ℹ️  To complete the fix:
   1. Redeploy the Edge Function:
      supabase functions deploy send-quote-email
   2. Re-run the quote sending test:
      node devtools/testQuoteSending.js

🎉 Autonomous fix complete!
════════════════════════════════════════════════════════════
```

---

## 📊 Step 5: Verify the Fix

### Redeploy Edge Function

```bash
supabase functions deploy send-quote-email
```

### Re-run Quote Sending Test

```bash
node devtools/testQuoteSending.js
```

**Expected result:** Quote sends successfully with no errors!

---

## 🔍 Troubleshooting

### "Supabase access token not configured"

- Make sure you replaced `YOUR_SUPABASE_ACCESS_TOKEN_HERE` in `credentials.json`
- Make sure the token starts with `sbp_` (Management API) or `eyJ` (Service Role)

### "Resend API key not configured"

- Make sure you replaced `YOUR_RESEND_API_KEY_HERE` in `credentials.json`
- Make sure the key starts with `re_`

### "Failed to create API key"

- Make sure your Resend API key has **Full Access** permission
- Check that you haven't hit Resend's API key limit

### "Failed to update Supabase secret"

- Make sure your Supabase access token has the correct permissions
- Try using the Supabase CLI instead:
  ```bash
  supabase secrets set RESEND_API_KEY="re_your_new_key_here"
  ```

### "Test email failed"

- This is often due to domain verification or rate limits
- The API key should still work for your actual use case
- Verify your domain in Resend dashboard

---

## 📚 API Documentation

### Resend API Commands

```bash
# Validate API key
node AIDevTools/resendAPI.js validate [api-key]

# Create new API key
node AIDevTools/resendAPI.js create-key <name> [permission]

# List all API keys
node AIDevTools/resendAPI.js list-keys

# Delete API key
node AIDevTools/resendAPI.js delete-key <key-id>

# Send test email
node AIDevTools/resendAPI.js send-test [to-email] [subject]

# Get email details
node AIDevTools/resendAPI.js get-email <email-id>

# List domains
node AIDevTools/resendAPI.js domains
```

### Supabase API Commands

```bash
# Get Edge Function logs
node AIDevTools/supabaseManagementAPI.js logs [function-name] [limit]

# List secrets
node AIDevTools/supabaseManagementAPI.js secrets

# Update secret
node AIDevTools/supabaseManagementAPI.js update-secret <name> <value>

# Get project details
node AIDevTools/supabaseManagementAPI.js project

# Invoke Edge Function
node AIDevTools/supabaseManagementAPI.js invoke <function-name> [payload-json]
```

---

## 🎯 What's Next

After setup, the AI can:

1. **Detect issues** - "Invalid API key"
2. **Validate current key** - Check if it's really invalid
3. **Create new key** - Via Resend API
4. **Update Supabase secret** - Via Supabase Management API
5. **Test email** - Verify fix worked
6. **Re-run test** - Confirm quote sending works

**All autonomously!**

---

## 🔐 Security Best Practices

1. **Never commit credentials.json** - It's in `.gitignore`
2. **Use API tokens, not passwords** - More secure
3. **Rotate keys regularly** - Create new keys periodically
4. **Limit permissions** - Use minimum required permissions
5. **Monitor usage** - Check API logs for suspicious activity

---

## 📝 Files Created

- ✅ `AIDevTools/credentials.json` - Credential storage (gitignored)
- ✅ `AIDevTools/supabaseManagementAPI.js` - Supabase API client
- ✅ `AIDevTools/resendAPI.js` - Resend API client
- ✅ `AIDevTools/autoFixResendAPIKey.js` - Autonomous fix script
- ✅ `.gitignore` - Protects credentials from git

---

**Status:** READY TO CONFIGURE  
**Next Step:** Add your API keys to `credentials.json`  
**Time Required:** 5-10 minutes

