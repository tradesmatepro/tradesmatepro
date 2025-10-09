# 📚 TradesMate Pro Developer Guide – START HERE

## 🎉 **BREAKTHROUGH: AI CAN NOW SEE REAL ERRORS AUTOMATICALLY!**

## 🔑 Why This Exists

These guides exist because AI teammates (Claude, GPT) kept forgetting the fundamentals:

- Fixing symptoms instead of root causes
- Ignoring the full pipeline (quotes → jobs → invoices, contractor ↔ customer messages)  
- Creating stray tables or scripts instead of using existing tools
- **Most importantly: Guessing errors instead of reading real runtime data**

**This README is the entry point. If you forget, STOP and re-read before making changes.**

## 🚀 **NEW: Automated Error Detection System**

**AI can now see real runtime errors automatically via `error_logs/latest.json`!**

### **Quick Start for AI:**
1. **Always check `error_logs/latest.json` FIRST** before making any fixes
2. **Start both servers**: `npm run dev-main` and `npm run dev-error-server`  
3. **Wait 30+ seconds** for errors to auto-capture
4. **Read real error data** - no more guessing!
5. **Apply targeted fixes** based on actual error messages
6. **Verify by checking `latest.json` again** after fixes

### **Success Indicators:**
✅ Error server running: `📡 Error logging server running at http://localhost:4000`
✅ Auto-send working: Browser shows `✅ Sent N errors to error server`
✅ Files being created: New files in `error_logs/` every 30 seconds
✅ AI can read real errors: HTTP 400s, database errors, JavaScript errors visible

## 📖 Guide Index (Updated)

### **🔟 NEW: Automated Error Detection** ⭐ **START HERE**
✅ AI can read `error_logs/latest.json` automatically
✅ No manual exports needed - fully automated
✅ Real HTTP 400s, database errors, JavaScript errors visible
❌ Never guess errors - always check latest.json first

### **1. Authentication and Database Access**
✅ Use existing Supabase auth system
✅ Use supaFetch or Supabase client  
❌ Never hardcode keys (sandbox only can use service key)

### **2. Running SQL Commands**
✅ All SQL runs in sandbox project only
✅ Schema changes tested in sandbox before promotion
✅ Migrations saved to /migrations
❌ Never touch real project directly

### **3. Developer Tools and Logs** (UPDATED)
✅ **NEW: Global error capture** - works on every page
✅ **NEW: Auto-save every 30 seconds** to error_logs/
✅ Always check `error_logs/latest.json` first before fixing
❌ Never invent new logging scripts

### **4. Fix Loop and Verification** (UPDATED)
✅ **NEW: Logs-driven fixes** - read latest.json first
✅ Strict loop: Read logs → Analyze → Fix → Verify logs again
✅ End-to-end workflow must succeed before marking fixed
❌ Never skip verification

### **5. Troubleshooting Common Issues**
✅ Always check forward + backward flows
✅ Cross-check baseline app snapshot before changes
✅ Verify both contractor + customer roles
❌ Never patch in isolation

### **6. Understanding the Architecture**
✅ Quotes/Jobs/Invoices = stages of work_orders
✅ Messages = customer_messages (contractor ↔ customer)
✅ Baseline = source of truth before edits
❌ Never create duplicate tables

### **7. Full Architecture Check – No Bandaids**
✅ Map the "enchilada" (whole flow)
✅ Confirm schema alignment
✅ Confirm queries match schema
✅ Confirm app logic across roles
✅ Only fix after full-system check

## 🚨 CRITICAL RULES (UPDATED)

### **Always:**

**🔥 NEW: Check `error_logs/latest.json` FIRST** → Real errors, not guesses

**Sandbox first** → Real later

**Real project never touched by AI** → Promotion happens via human backup/restore only

**Logs before fixes** → But now automated via error_logs/latest.json

**Don't guess. Don't assume** → Read actual error data from latest.json

**Architecture first** → Always check baseline + architecture docs before editing

**Root cause only** → No bandaids, no skipping forward/backward verification

### **Never:**

❌ **Never fix without checking latest.json** → AI must see real runtime errors
❌ **Never guess error causes** → Always use actual error data  
❌ **Never skip verification** → Check latest.json again after fixes
❌ **Never assume pipeline from table names** → Check the actual relationships

## 🎯 Quick References

**🔥 NEW: Can't see errors?** → **Guide #10 - Automated Error Detection** ⭐

**Database errors?** → Guides #1 + #2 + #4 + #10

**UI/Component errors?** → Guides #3 + #5 + #6 + #10

**Complex/systemic issues?** → Guide #7 (The Enchilada 🌯) + #10

**AI forgot how to see logs?** → **Guide #10** (Always check error_logs/latest.json first!)

## 📝 Final Note

**🎉 The automated error detection system is now working!**

These guides exist because the same mistakes kept happening:
- Fixes without verification
- Breaking pipelines  
- Creating duplicate tables
- Forgetting RLS/auth
- **Most importantly: Guessing errors instead of reading real data**

**Read these first. Follow them exactly. Sandbox only. No shortcuts.**

**🔥 NEW RULE: Always check `error_logs/latest.json` first before making any fixes!**

---

## 🚀 **Quick Start for AI (Claude/GPT):**

1. **Start servers**: `npm run dev-main` and `npm run dev-error-server`
2. **Check real errors**: Read `error_logs/latest.json` 
3. **Apply targeted fixes**: Based on actual error messages
4. **Verify**: Check `latest.json` again after fixes
5. **No more guessing!** 🎉

---

**🎉 SUCCESS: The automated error detection system is now fully documented and working!**

**For AI (Claude/GPT): Always start by reading `error_logs/latest.json` to see real runtime errors before making any fixes!**
