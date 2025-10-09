# 🚀 TradeMate Pro: Complete Architecture & Feature Roadmap

## 📋 Status: ARCHITECTURE LOCKED ✅
**Last Updated:** 2025-10-01  
**Decision:** Frontend = Source of Truth, Backend = Validation Only  
**Trigger Audit:** Complete - 2 calculation triggers disabled, 30 metadata triggers kept

---

## 🎯 CRITICAL GAPS FOUND

### **🚨 MISSING: Auto Sales Tax by Address**
**Current State:** Manual tax rate entry (8.25%)  
**Industry Standard:** Automatic tax calculation based on service address

**Competitors:**
- ✅ ServiceTitan: Integrates with Avalara for automatic tax
- ✅ Jobber: Address-based tax calculation
- ✅ Housecall Pro: Multi-jurisdiction tax support

**What We Need:**
1. **Tax nexus tracking** - Which states/jurisdictions you have nexus in
2. **Address-based tax lookup** - Calculate tax based on service address
3. **Multi-jurisdiction support** - Handle city + county + state taxes
4. **Tax exemption certificates** - Store customer tax-exempt status
5. **Tax reporting** - Generate tax liability reports by jurisdiction

**Implementation Priority:** 🔴 HIGH - Required for compliance

---

### **🚨 MISSING: Regional Compliance Features**

#### **1. Labor Law Compliance**
**Current State:** No overtime tracking  
**Need:**
- Overtime after 40 hrs/week (federal)
- Overtime after 8 hrs/day (CA, CO, NV)
- Double-time rules (CA after 12 hrs/day)
- Meal break requirements
- Rest break requirements

#### **2. License Requirements**
**Current State:** No license tracking  
**Need:**
- Contractor license numbers on invoices (required in many states)
- License expiration tracking
- Per-trade license requirements
- Insurance certificate tracking

#### **3. Lien Rights & Notices**
**Current State:** None  
**Need:**
- Preliminary notice generation (CA, TX, FL, etc.)
- Lien waiver templates
- Notice of completion tracking
- Deadline calculators by state

#### **4. Prevailing Wage (Government Work)**
**Current State:** None  
**Need:**
- Prevailing wage rate tables by county
- Certified payroll reports
- Fringe benefit tracking

**Implementation Priority:** 🟡 MEDIUM - Needed for enterprise customers

---

### **🚨 MISSING: Offline/Sync Infrastructure**

**Current State:** Web-only, online-required  
**Need for Mobile:**

#### **1. Local Storage Layer**
```javascript
// Abstract storage interface
class StorageAdapter {
  async save(table, data) {
    if (navigator.onLine) {
      return await supabase.from(table).insert(data);
    } else {
      return await localDB.save(table, data, { pending: true });
    }
  }
}
```

#### **2. Sync Queue**
- Track pending changes while offline
- Conflict resolution strategy
- Retry logic with exponential backoff
- Sync status indicators

#### **3. Optimistic UI**
- Show changes immediately
- Roll back on sync failure
- Visual indicators for syncing/synced/failed

#### **4. Offline-First Data**
- Cache enums, rate cards, customers
- Download job data for today
- Store photos locally until synced

**Implementation Priority:** 🔴 HIGH - Required before mobile apps

---

## ✅ PART 1: Core Data Integrity (COMPLETE)

### **Database Constraints** ✅
```sql
-- ✅ IMPLEMENTED
CHECK (subtotal >= 0)
CHECK (total_amount = subtotal + tax_amount)
CHECK (actual_end >= actual_start)
UNIQUE (email, company_id)
FOREIGN KEY (customer_id) REFERENCES customers(id)
```

### **UUIDs Everywhere** ✅
- Prevents offline insert conflicts
- All tables use UUID primary keys

### **Timestamps** ✅
- `created_at` on all tables
- `updated_at` with auto-trigger
- Ready for sync diff calculations

### **Soft Deletes** ⚠️ PARTIAL
- Need `deleted_at` on more tables
- Prevents "record not found" errors during sync

---

## ✅ PART 2: Enums (COMPLETE)

### **Current Enums** ✅
```sql
work_order_status_enum: draft, quote, approved, scheduled, parts_ordered,
  on_hold, in_progress, requires_approval, rework_needed, completed,
  invoiced, cancelled, sent, rejected, paid, closed (16 values)

invoice_status_enum: draft, sent, viewed, approved, paid, partially_paid,
  overdue, void, cancelled (9 values)

payment_method_enum: cash, check, credit_card, debit_card, ach, wire_transfer,
  paypal, venmo, zelle, other (10 values)
```

### **Offline Strategy** ⚠️ TODO
```javascript
// On login: Fetch and cache
const enums = await supabase.rpc('get_all_enums');
localStorage.setItem('cached_enums', JSON.stringify(enums));

// Offline: Use cached
const statuses = JSON.parse(localStorage.getItem('cached_enums'));
```

---

## ✅ PART 3: Triggers (AUDITED)

### **✅ KEEP (30 triggers)**
- Auto-timestamps: `update_updated_at_column()`
- Audit logging: `log_audit_event()`
- Auto-numbering: `auto_generate_invoice_number()`
- Status validation: `enforce_work_order_status()`

### **❌ DISABLED (2 triggers)**
- ~~`trigger_calculate_work_order_totals`~~ - Conflicted with frontend
- ~~`trigger_calculate_invoice_totals`~~ - Conflicted with frontend

### **⚠️ REVIEW (4 triggers)**
- `trg_calculate_deposit` - Check if frontend calculates
- `trg_calculate_discount` - Check if frontend calculates
- `trigger_update_invoice_amount_paid` - Check if frontend tracks
- `trg_set_quote_expiration` - Check if frontend sets

---

## ✅ PART 4: Business Rules

### **Quote Rules** ✅ IMPLEMENTED
- Require ≥ 1 line item → Frontend validates
- Auto-set status = 'quote' → DB default
- Can't approve without line items → Frontend blocks

### **Work Order Rules** ✅ IMPLEMENTED
- Status transitions validated → DB trigger
- Can't mark completed without items → Frontend checks

### **Invoice Rules** ⚠️ PARTIAL
- ✅ Tax applied based on rate
- ❌ No auto-tax by address
- ❌ No tax exemption support
- ⚠️ Payment tracking needs review

### **Payment Rules** ⚠️ PARTIAL
- ✅ Amount ≤ invoice balance
- ❌ No overpayment/credit handling
- ❌ No payment plan support

---

## 🚨 PART 5: Regional Compliance (MISSING)

### **Tax Compliance** ❌ NOT IMPLEMENTED
**Priority:** 🔴 CRITICAL

**What's Missing:**
1. **Tax Nexus Tracking**
   - Which states/jurisdictions you operate in
   - Nexus thresholds (economic nexus laws)
   - Registration dates

2. **Address-Based Tax Calculation**
   - Service address → tax jurisdiction lookup
   - Multi-rate support (state + county + city)
   - Special district taxes

3. **Tax Exemption Management**
   - Store customer exemption certificates
   - Expiration tracking
   - Exempt item categories

4. **Tax Reporting**
   - Tax collected by jurisdiction
   - Taxable vs non-taxable sales
   - Export for filing

**Implementation Options:**
- **Option A:** Build in-house (complex, ongoing maintenance)
- **Option B:** Integrate Avalara/TaxJar (industry standard, $$$)
- **Option C:** Hybrid - basic built-in, Avalara for complex cases

**Recommendation:** Start with Option C
- Build basic multi-rate support
- Add Avalara integration for enterprise tier
- Charge premium for auto-tax feature

### **Labor Law Compliance** ❌ NOT IMPLEMENTED
**Priority:** 🟡 MEDIUM

**What's Missing:**
1. **Overtime Rules by State**
   ```javascript
   const overtimeRules = {
     'CA': { daily: 8, weekly: 40, doubleTime: 12 },
     'CO': { daily: 12, weekly: 40 },
     'NV': { daily: 8, weekly: 40 },
     'DEFAULT': { weekly: 40 }
   };
   ```

2. **Break Requirements**
   - Meal breaks (30 min after 5 hrs in CA)
   - Rest breaks (10 min per 4 hrs in CA)
   - Tracking and enforcement

3. **Prevailing Wage**
   - Government project tracking
   - Prevailing wage rate tables
   - Certified payroll reports

### **License & Insurance** ❌ NOT IMPLEMENTED
**Priority:** 🟡 MEDIUM

**What's Missing:**
1. **License Tracking**
   - Contractor license numbers
   - Expiration dates
   - Per-trade licenses
   - Auto-include on invoices (required in many states)

2. **Insurance Certificates**
   - General liability
   - Workers comp
   - Auto insurance
   - Expiration tracking

3. **Bonding**
   - Bond amounts
   - Bond company info
   - Expiration tracking

### **Lien Rights** ❌ NOT IMPLEMENTED
**Priority:** 🟢 LOW (but high value for contractors)

**What's Missing:**
1. **Preliminary Notices**
   - Auto-generate by state
   - Deadline tracking
   - Certified mail tracking

2. **Lien Waivers**
   - Conditional/unconditional
   - Progress/final
   - Templates by state

3. **Notice of Completion**
   - Deadline calculators
   - Filing tracking

---

## 🚀 PART 6: Offline/Mobile Readiness

### **Current State:** ❌ NOT READY
- Web-only
- Requires internet
- No local storage
- No sync queue

### **What's Needed:**

#### **1. Storage Abstraction Layer**
```javascript
// src/services/StorageService.js
class StorageService {
  constructor() {
    this.online = navigator.onLine;
    this.localDB = new LocalDatabase(); // IndexedDB wrapper
    this.remoteDB = supabase;
  }

  async save(table, data) {
    // Save locally first (optimistic)
    await this.localDB.save(table, data);
    
    // Sync to remote if online
    if (this.online) {
      try {
        await this.remoteDB.from(table).insert(data);
        await this.localDB.markSynced(table, data.id);
      } catch (error) {
        await this.localDB.markPending(table, data.id);
      }
    }
  }
}
```

#### **2. Sync Queue**
```javascript
// src/services/SyncService.js
class SyncService {
  async syncPendingChanges() {
    const pending = await localDB.getPending();
    
    for (const change of pending) {
      try {
        await this.syncChange(change);
        await localDB.markSynced(change.id);
      } catch (error) {
        if (error.code === 'CONFLICT') {
          await this.resolveConflict(change, error.serverData);
        } else {
          await localDB.incrementRetryCount(change.id);
        }
      }
    }
  }

  async resolveConflict(localChange, serverData) {
    // Strategy: Server wins for now
    // TODO: Implement smart conflict resolution
    await localDB.update(localChange.table, serverData);
  }
}
```

#### **3. Offline Data Caching**
```javascript
// On login: Download essential data
await cacheService.downloadForOffline({
  enums: true,
  rateCards: true,
  customers: true,
  todaysJobs: true,
  recentQuotes: 10
});
```

#### **4. Network Status Handling**
```javascript
// Monitor online/offline
window.addEventListener('online', () => {
  syncService.syncPendingChanges();
});

window.addEventListener('offline', () => {
  showOfflineIndicator();
});
```

---

## 📊 PART 7: Feature Comparison Matrix

| Feature | TradeMate Pro | ServiceTitan | Jobber | Housecall Pro |
|---------|---------------|--------------|--------|---------------|
| **Tax Calculation** |
| Manual tax rate | ✅ | ✅ | ✅ | ✅ |
| Auto tax by address | ❌ | ✅ (Avalara) | ✅ | ✅ |
| Multi-jurisdiction | ❌ | ✅ | ✅ | ✅ |
| Tax exemptions | ❌ | ✅ | ✅ | ✅ |
| **Compliance** |
| License tracking | ❌ | ✅ | ✅ | ✅ |
| Insurance tracking | ❌ | ✅ | ✅ | ✅ |
| Lien notices | ❌ | ✅ | ❌ | ❌ |
| Prevailing wage | ❌ | ✅ | ❌ | ❌ |
| **Offline Support** |
| Web offline | ❌ | ❌ | ❌ | ❌ |
| Mobile offline | ❌ | ✅ | ✅ | ✅ |
| Sync queue | ❌ | ✅ | ✅ | ✅ |
| **Pricing** |
| Basic | ✅ | ✅ | ✅ | ✅ |
| Rate cards | ✅ | ✅ | ✅ | ✅ |
| Dynamic pricing | ✅ | ✅ | ✅ | ❌ |
| Price books | ❌ | ✅ | ✅ | ✅ |

**Key Takeaway:** We're missing critical compliance features that competitors have.

---

## 🎯 IMPLEMENTATION ROADMAP

### **Phase 1: Critical Gaps (Next 2 Weeks)**
1. ✅ Fix quote update issues (DONE)
2. ✅ Audit and disable calculation triggers (DONE)
3. ⚠️ Add soft deletes to remaining tables
4. ⚠️ Implement enum caching for offline prep
5. ❌ Basic multi-rate tax support (manual entry per jurisdiction)

### **Phase 2: Offline Foundation (Next Month)**
1. ❌ Build storage abstraction layer
2. ❌ Implement sync queue
3. ❌ Add offline indicators
4. ❌ Cache essential data on login
5. ❌ Test offline scenarios

### **Phase 3: Regional Compliance (Next Quarter)**
1. ❌ Tax nexus tracking
2. ❌ Address-based tax lookup (basic)
3. ❌ License/insurance tracking
4. ❌ Overtime rules by state
5. ❌ Tax exemption certificates

### **Phase 4: Mobile Apps (Q2 2026)**
1. ❌ React Native setup
2. ❌ Offline-first architecture
3. ❌ Photo capture & sync
4. ❌ GPS tracking
5. ❌ Push notifications

### **Phase 5: Advanced Compliance (Q3 2026)**
1. ❌ Avalara integration
2. ❌ Lien notice generation
3. ❌ Prevailing wage support
4. ❌ Certified payroll
5. ❌ Multi-state compliance dashboard

---

## 💡 RECOMMENDATIONS

### **Immediate Actions:**
1. **Add tax jurisdiction table** - Prepare for multi-rate support
2. **Add soft deletes** - Required for offline sync
3. **Cache enums** - First step toward offline
4. **Review remaining triggers** - Decide keep/disable

### **Short Term (This Month):**
1. **Build storage abstraction** - Foundation for offline
2. **Implement basic multi-rate tax** - Manual entry for now
3. **Add license tracking** - Required in many states
4. **Test offline scenarios** - Even if not fully implemented

### **Medium Term (This Quarter):**
1. **Address-based tax lookup** - Build or integrate
2. **Overtime rules engine** - State-specific logic
3. **Sync queue implementation** - Required for mobile
4. **Mobile app planning** - Architecture decisions

### **Long Term (Next Year):**
1. **Avalara integration** - Enterprise feature
2. **Lien rights automation** - High-value differentiator
3. **Prevailing wage** - Government work support
4. **Full offline mobile apps** - iOS + Android

---

## 🎉 BOTTOM LINE

**What We Have:**
- ✅ Solid database architecture
- ✅ Frontend-first calculation logic
- ✅ Clean trigger strategy
- ✅ UUID-based design (offline-ready)

**What We're Missing:**
- ❌ Auto tax by address (CRITICAL)
- ❌ Regional compliance features (IMPORTANT)
- ❌ Offline/sync infrastructure (REQUIRED FOR MOBILE)
- ❌ License/insurance tracking (EXPECTED FEATURE)

**Next Steps:**
1. Implement basic multi-rate tax (manual)
2. Add storage abstraction layer
3. Build sync queue foundation
4. Add license/insurance tracking

**Timeline to Mobile:**
- 2 weeks: Fix critical gaps
- 1 month: Offline foundation
- 3 months: Regional compliance
- 6 months: Mobile apps ready

**We're 70% there!** The hard part (architecture) is done. Now we need the compliance features that users expect.

