# 🚨 Portal 404 Fix - Action Required

## Current Status

✅ Code fixes pushed to GitHub  
⏳ Vercel deployment in progress  
❌ Environment variable NOT set in Vercel (this is why you're still getting localhost URLs)

---

## Two Issues to Fix

### Issue 1: 404 on Portal Links ✅ (Deploying)

**Fix:** Added `vercel.json` for SPA routing  
**Status:** Deploying now (2-5 minutes)  
**Action:** Wait for deployment to complete

### Issue 2: Localhost URLs in Emails ❌ (Needs Manual Fix)

**Problem:** Emails still contain `http://localhost:3000` links  
**Root Cause:** `REACT_APP_PUBLIC_URL` environment variable is NOT set in Vercel  
**Status:** **YOU MUST SET THIS MANUALLY IN VERCEL DASHBOARD**

---

## REQUIRED: Set Vercel Environment Variable

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

5. **Add New Variable**
   - Click "Add New" button
   - **Name:** `REACT_APP_PUBLIC_URL`
   - **Value:** `https://www.tradesmatepro.com`
   - **Environments:** Check ALL boxes (Production, Preview, Development)
   - Click "Save"

6. **Redeploy**
   - Go to "Deployments" tab
   - Click the "..." menu on the latest deployment
   - Click "Redeploy"
   - Wait 2-3 minutes for build to complete

---

## Local Testing (If Testing on Localhost)

If you're testing on `http://localhost:3000`, you need to:

### 1. Stop Your Dev Server
```bash
# Press Ctrl+C in the terminal where npm start is running
```

### 2. Restart Dev Server
```bash
npm start
```

### 3. Hard Refresh Browser
```bash
# Press Ctrl+Shift+R (Windows/Linux)
# or Cmd+Shift+R (Mac)
```

### 4. Test Again
- Send a quote
- Check the console logs
- Should see production URL instead of localhost

---

## How to Verify It's Working

### Check 1: Vercel Deployment Status
1. Go to https://vercel.com/dashboard
2. Click on `tradesmatepro` project
3. Check "Deployments" tab
4. Latest deployment should show "Ready" (green checkmark)

### Check 2: Environment Variable Set
1. In Vercel dashboard, go to Settings → Environment Variables
2. Should see: `REACT_APP_PUBLIC_URL = https://www.tradesmatepro.com`
3. Should be checked for all environments

### Check 3: Portal Link Works
1. Send a test quote from production (www.tradesmatepro.com)
2. Check email
3. Portal link should be: `https://www.tradesmatepro.com/portal/quote/view/{token}`
4. Click link - should load quote page (not 404)

### Check 4: Console Logs
1. Open browser console (F12)
2. Send a quote
3. Look for log line: `✅ Quote sent via email: {...}`
4. Check `portalLink` value - should be `https://www.tradesmatepro.com/...`

---

## Why This Is Happening

### React Environment Variables
React apps need environment variables to be set at **build time**, not runtime.

**Local Development:**
- Reads from `.env` file
- Needs server restart to pick up changes

**Vercel Production:**
- Reads from Vercel Environment Variables
- Needs redeploy to pick up changes

### Current State:
- ✅ `.env` file has `REACT_APP_PUBLIC_URL=https://www.tradesmatepro.com`
- ❌ Vercel Environment Variables does NOT have this set
- ❌ Your local dev server hasn't restarted since adding the env var

**Result:** Code defaults to `http://localhost:3000` because `process.env.REACT_APP_PUBLIC_URL` is undefined

---

## Timeline

### What's Happening Now:
1. ✅ Code pushed to GitHub (completed)
2. ⏳ Vercel auto-deploy triggered (2-5 minutes)
3. ❌ Environment variable NOT set (manual action required)

### What You Need to Do:
1. **Wait 5 minutes** for current deployment to finish
2. **Set environment variable** in Vercel (see instructions above)
3. **Redeploy** after setting env var
4. **Test** the portal link

---

## Expected Results After Fix

### Before Fix:
```
Email link: http://localhost:3000/portal/quote/view/abc123
Click link: 404 NOT_FOUND ❌
```

### After Fix:
```
Email link: https://www.tradesmatepro.com/portal/quote/view/abc123
Click link: Quote page loads ✅
```

---

## Troubleshooting

### Still Getting 404?
- Check Vercel deployment status (must be "Ready")
- Check environment variable is set
- Check you redeployed AFTER setting env var
- Clear browser cache and try again

### Still Getting Localhost URLs?
- Check environment variable is set in Vercel
- Check you redeployed after setting env var
- Check the deployment logs for build errors

### PDF Still Blank?
- Wait for latest deployment to finish
- Hard refresh browser (Ctrl+Shift+R)
- Send a new quote (don't use old cached quotes)

---

## Quick Checklist

- [ ] Wait 5 minutes for Vercel deployment to complete
- [ ] Go to Vercel dashboard
- [ ] Add `REACT_APP_PUBLIC_URL` environment variable
- [ ] Redeploy the project
- [ ] Wait 3 minutes for redeploy to complete
- [ ] Send test quote from production
- [ ] Verify email has production URL
- [ ] Click portal link - should work (not 404)
- [ ] Download PDF - should have content (not blank)

---

## Files Changed (Already Pushed)

- ✅ `vercel.json` - Fixes 404 routing
- ✅ `src/services/QuoteSendingService.js` - Optimized PDF generation
- ✅ `src/components/quotes/SendQuoteModal.js` - Background sending

---

**Next Step: Set the Vercel environment variable and redeploy!**

**Vercel Dashboard:** https://vercel.com/dashboard

