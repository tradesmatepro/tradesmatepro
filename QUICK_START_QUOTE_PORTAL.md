# ⚡ QUICK START - Quote Portal Deployment

**Goal:** Add quote acceptance to tradesmatepro.com WITHOUT uploading the whole app

**Time:** 5 minutes

---

## 🚀 3 SIMPLE STEPS

### Step 1: Upload File (2 min)

1. **Rename file:**
   - `public-quote-portal.html` → `quote.html`

2. **Upload to website:**
   - Upload `quote.html` to tradesmatepro.com root
   - Use FTP, cPanel, or your hosting provider's file manager

3. **Verify:**
   - Visit: `https://www.tradesmatepro.com/quote.html`
   - Should see: "Loading your quote..." message

---

### Step 2: Test It (2 min)

1. **Get a quote ID:**
   - Open your TradeMate Pro app
   - Go to Quotes page
   - Copy any quote ID (or use database query below)

   ```sql
   SELECT id FROM work_orders WHERE status = 'sent' LIMIT 1;
   ```

2. **Test URL:**
   ```
   https://www.tradesmatepro.com/quote.html?id=YOUR_QUOTE_ID
   ```

3. **Should see:**
   - Quote details
   - Line items
   - Total amount
   - Approve/Reject buttons

4. **Click "Approve Quote"**
   - Should see success message
   - Check database - status should be 'approved'

---

### Step 3: Send Test Email (1 min)

1. **In your app:**
   - Go to Quotes page
   - Click "Send" on a quote
   - Select "Email"
   - Send to your own email

2. **Check email:**
   - Click the link
   - Should open quote portal
   - Approve the quote

3. **Done!** ✅

---

## 📋 THAT'S IT!

Your quote portal is live and working!

**What you deployed:**
- ✅ Single HTML file
- ✅ No React, no build process
- ✅ Works standalone

**What stayed the same:**
- ✅ Your placeholder site (unchanged)
- ✅ Your main app (not deployed)

**What you can do now:**
- ✅ Send quotes via email
- ✅ Send quotes via SMS
- ✅ Customers can approve/reject
- ✅ Database updates automatically

---

## 🐛 TROUBLESHOOTING

**Problem:** Can't access quote.html  
**Fix:** Make sure file is uploaded to root directory

**Problem:** "Quote not found"  
**Fix:** Make sure quote status is 'sent' in database

**Problem:** Approve button doesn't work  
**Fix:** Check browser console (F12) for errors

---

## 📚 MORE INFO

- **Full Guide:** `STANDALONE_QUOTE_PORTAL_COMPLETE.md`
- **Deployment Guide:** `DEPLOY_QUOTE_PORTAL_PAGE.md`
- **Customization:** Edit `quote.html` directly (it's just HTML/CSS/JS)

---

## 🎉 SUCCESS!

**Your quote portal is live!**

**URL:** `https://www.tradesmatepro.com/quote.html?id={quoteId}`

**Ready to send quotes!** 📧📱


