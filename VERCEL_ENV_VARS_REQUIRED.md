# 🚨 URGENT: Vercel Environment Variables Required

## Current Error

```
Failed to execute 'json' on 'Response': Unexpected token '<', "<!doctype "... is not valid JSON
```

**Root Cause:** `process.env.REACT_APP_SUPABASE_URL` is **undefined** in production!

The app is trying to fetch from: `undefined/rest/v1/work_orders` → Returns HTML 404 page

---

## Required Environment Variables

You MUST set these in Vercel dashboard:

### 1. REACT_APP_SUPABASE_URL
```
https://cxlqzejzraczumqmsrcx.supabase.co
```

### 2. REACT_APP_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODU0NDMsImV4cCI6MjA3NDU2MTQ0M30.zoD59re6xxW9Z6HOexR0qwWwTBU29MvjwP_y8qwBkkg
```

### 3. REACT_APP_PUBLIC_URL
```
https://www.tradesmatepro.com
```

### 4. REACT_APP_RESEND_API_KEY
```
re_a7hbhZUG_8hQoDfPGZsHmgDHUjmgEvt1t
```

---

## How to Set Environment Variables in Vercel

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Login if needed

2. **Select Your Project**
   - Click on: `tradesmatepro`

3. **Go to Settings**
   - Click "Settings" tab at the top

4. **Go to Environment Variables**
   - Click "Environment Variables" in the left sidebar

5. **Add Each Variable**

   **For each variable above:**
   
   a. Click "Add New" button
   
   b. Enter:
      - **Name:** (e.g., `REACT_APP_SUPABASE_URL`)
      - **Value:** (copy from above)
      - **Environments:** Check ALL boxes:
        - ✅ Production
        - ✅ Preview
        - ✅ Development
   
   c. Click "Save"
   
   d. Repeat for all 4 variables

6. **Redeploy**
   - Go to "Deployments" tab
   - Click the "..." menu on the latest deployment
   - Click "Redeploy"
   - Wait 2-3 minutes for build to complete

---

## Quick Copy-Paste Format

For easy copy-pasting into Vercel:

```
Name: REACT_APP_SUPABASE_URL
Value: https://cxlqzejzraczumqmsrcx.supabase.co
Environments: Production, Preview, Development

Name: REACT_APP_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODU0NDMsImV4cCI6MjA3NDU2MTQ0M30.zoD59re6xxW9Z6HOexR0qwWwTBU29MvjwP_y8qwBkkg
Environments: Production, Preview, Development

Name: REACT_APP_PUBLIC_URL
Value: https://www.tradesmatepro.com
Environments: Production, Preview, Development

Name: REACT_APP_RESEND_API_KEY
Value: re_a7hbhZUG_8hQoDfPGZsHmgDHUjmgEvt1t
Environments: Production, Preview, Development
```

---

## Why This Is Needed

### React Environment Variables
- React apps need environment variables at **build time**
- Vercel doesn't read `.env` files from your repo
- Must be configured in Vercel dashboard
- Requires redeploy after adding

### Current State:
- ✅ `.env` file has all variables (for local development)
- ❌ Vercel dashboard has NO variables (for production)
- ❌ Production build has `undefined` for all env vars

### After Setting Variables:
- ✅ Vercel will inject them during build
- ✅ `process.env.REACT_APP_SUPABASE_URL` will work
- ✅ Portal will load quotes correctly

---

## Verification

### After Setting Variables and Redeploying:

1. **Check Vercel Dashboard**
   - Settings → Environment Variables
   - Should see all 4 variables listed

2. **Check Deployment Logs**
   - Deployments → Latest → Build Logs
   - Should see: "Using environment variables"

3. **Test Portal Link**
   - Send a quote
   - Click portal link
   - Should load quote (not "Unable to load quote")

4. **Check Browser Console**
   - Should NOT see: "undefined/rest/v1/work_orders"
   - Should see: "https://cxlqzejzraczumqmsrcx.supabase.co/rest/v1/work_orders"

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Add env vars to Vercel | 5 min | ❌ Not done |
| Redeploy | 3 min | ❌ Not done |
| Test portal link | 1 min | ❌ Not done |
| **Total** | **~10 min** | **Waiting for you** |

---

## Common Mistakes to Avoid

### ❌ Don't Do This:
- Don't add variables without checking all 3 environments
- Don't forget to redeploy after adding variables
- Don't copy variables with extra spaces or quotes
- Don't use the service role key (use anon key)

### ✅ Do This:
- Check all 3 environment boxes (Production, Preview, Development)
- Redeploy after adding ALL variables
- Copy values exactly as shown (no quotes, no spaces)
- Use the anon key (starts with `eyJhbGci...`)

---

## Expected Results

### Before Setting Variables:
```
Portal link → "Unable to load quote"
Console error → "undefined/rest/v1/work_orders"
```

### After Setting Variables:
```
Portal link → Quote loads successfully ✅
Console → No errors ✅
Email links → Production URLs ✅
PDFs → Content visible ✅
```

---

## Security Note

These are **public** (anon) keys that are safe to expose:
- ✅ `REACT_APP_SUPABASE_URL` - Public URL
- ✅ `REACT_APP_SUPABASE_ANON_KEY` - Public anon key (RLS protected)
- ✅ `REACT_APP_PUBLIC_URL` - Your domain
- ✅ `REACT_APP_RESEND_API_KEY` - API key (already in emails)

**Do NOT use:**
- ❌ `SUPABASE_SERVICE_KEY` - This is secret!
- ❌ Any keys with "service" or "admin" in the name

---

## Next Steps

1. **Set all 4 environment variables** in Vercel (5 minutes)
2. **Redeploy** the project (3 minutes)
3. **Test** the portal link (1 minute)
4. **Celebrate** when it works! 🎉

---

**Go to Vercel dashboard NOW and set these variables!**

**Link:** https://vercel.com/dashboard

**This is the ONLY thing blocking your portal from working!**

