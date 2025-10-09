# 🎯 Architecture Decision: Frontend = Source of Truth

## ✅ APPROVED ARCHITECTURE

### **Frontend: Source of Truth**
- Calculates ALL financial data (subtotal, tax, discounts, totals)
- Handles ALL business logic
- Works offline
- Instant feedback
- Transparent to users

### **Backend: Validation Only**
- Validates math is correct (constraints)
- Enforces business rules (status transitions)
- Stores data
- Generates sequential IDs
- Logs audit trail

### **Backend Does NOT:**
- ❌ Recalculate anything
- ❌ Override frontend calculations
- ❌ Complex business logic

---

## 🎯 Implementation

### **Database Constraints (KEEP)**
```sql
-- ✅ KEEP: Validates frontend math
CHECK (total_amount = subtotal + tax_amount)

-- ✅ KEEP: Validates positive amounts
CHECK (subtotal >= 0 AND tax_amount >= 0 AND total_amount >= 0)

-- ✅ KEEP: Validates date logic
CHECK (actual_end >= actual_start)
```

**Why:** Catches frontend bugs, enforces data integrity

### **Database Triggers (SELECTIVE)**

**✅ KEEP:**
- Auto-timestamps (`update_updated_at_column`)
- Audit logging (`log_audit_event`)
- Auto-numbering (`auto_generate_invoice_number`)
- Status validation (`enforce_work_order_status`)

**❌ DISABLE:**
- Financial calculations (`calculate_work_order_totals`)
- Financial calculations (`calculate_invoice_totals`)
- Any trigger that recalculates frontend data

**⚠️ REVIEW:**
- Deposit calculations (`calculate_deposit_amount`)
- Discount calculations (`calculate_discount_amount`)
- Payment tracking (`update_invoice_amount_paid`)

---

## 🚀 Benefits

### **1. Offline Support**
- App works without internet
- Calculations happen locally
- Sync when online

### **2. Instant Feedback**
- No round-trips to server
- Real-time totals
- Better UX

### **3. Transparent**
- Users see calculations
- Easy to debug
- Clear source of truth

### **4. Simple Backend**
- Just storage + validation
- No complex logic
- Easier to maintain

### **5. Testable**
- Frontend unit tests
- Mock backend easily
- Fast test suite

---

## 📊 Industry Standard

### **Modern SaaS (2020+)**
- ✅ Stripe: Frontend calculates, backend validates
- ✅ Shopify: Frontend calculates, backend validates
- ✅ Jobber: Frontend calculates, backend validates
- ✅ ServiceTitan: Frontend calculates, backend validates
- ✅ Housecall Pro: Frontend calculates, backend validates

### **Legacy Enterprise (pre-2015)**
- ❌ Oracle: Backend calculates everything
- ❌ SAP: Backend calculates everything
- ❌ Old ERP systems: Backend calculates everything

**Why the shift?**
- Mobile apps need offline support
- Users expect instant feedback
- Simpler architecture scales better

---

## 🔧 Current State vs Target State

### **Current State (BROKEN)**
```
Frontend calculates → Sends to backend → Backend recalculates (WRONG) → Constraint fails → ERROR
```

### **Target State (FIXED)**
```
Frontend calculates → Sends to backend → Backend validates (CHECK) → Stores → SUCCESS
```

---

## 📝 Implementation Checklist

### **Phase 1: Emergency Fixes (DONE)**
- [x] Disable `trigger_calculate_work_order_totals`
- [x] Disable `trigger_calculate_invoice_totals`
- [x] Test quote updates
- [x] Document decision

### **Phase 2: Review Remaining (THIS WEEK)**
- [ ] Review `trg_calculate_deposit` - Does frontend calculate deposits?
- [ ] Review `trg_calculate_discount` - Does frontend calculate discounts?
- [ ] Review `trigger_update_invoice_amount_paid` - Does frontend track payments?
- [ ] Disable or keep based on frontend logic

### **Phase 3: Standardize (NEXT SPRINT)**
- [ ] Update coding standards document
- [ ] Add comments to all triggers explaining purpose
- [ ] Create trigger management guide
- [ ] Train team on architecture

### **Phase 4: Optimize (FUTURE)**
- [ ] Add offline support to mobile app
- [ ] Implement sync queue
- [ ] Add optimistic UI updates
- [ ] Performance monitoring

---

## 🎯 Validation Strategy

### **What Backend Validates:**

**1. Math Correctness**
```sql
-- Validates frontend calculated correctly
CHECK (total_amount = subtotal + tax_amount)
CHECK (subtotal = SUM(line_items.total_price))  -- Optional
```

**2. Business Rules**
```sql
-- Validates status transitions
IF NOT valid_transition(OLD.status, NEW.status) THEN
    RAISE EXCEPTION 'Invalid status transition';
END IF;
```

**3. Data Integrity**
```sql
-- Validates required fields
CHECK (customer_id IS NOT NULL)
CHECK (total_amount >= 0)
```

**4. Referential Integrity**
```sql
-- Foreign keys (automatic)
FOREIGN KEY (customer_id) REFERENCES customers(id)
```

### **What Backend Does NOT Validate:**

- ❌ Tax calculations (frontend responsibility)
- ❌ Discount logic (frontend responsibility)
- ❌ Pricing rules (frontend responsibility)
- ❌ Business workflows (frontend responsibility)

---

## 💡 Key Principles

### **1. Frontend = Single Source of Truth**
- All calculations happen in frontend
- Backend trusts frontend (with validation)
- No recalculation in backend

### **2. Backend = Dumb Storage + Smart Validation**
- Stores what frontend sends
- Validates it's correct
- Doesn't change it

### **3. Constraints = Safety Net**
- Catch frontend bugs
- Enforce data integrity
- Don't replace frontend logic

### **4. Triggers = Metadata Only**
- Timestamps
- Audit logs
- Sequential IDs
- NOT business logic

---

## 🚨 Anti-Patterns to Avoid

### **❌ Don't Do This:**
```sql
-- BAD: Backend recalculating
CREATE TRIGGER recalculate_totals
AFTER INSERT ON line_items
FOR EACH ROW
BEGIN
    UPDATE orders SET total = (SELECT SUM(price) FROM line_items);
END;
```

### **✅ Do This Instead:**
```sql
-- GOOD: Backend validating
ALTER TABLE orders
ADD CONSTRAINT chk_total_matches_items
CHECK (total = (SELECT COALESCE(SUM(price), 0) FROM line_items WHERE order_id = orders.id));
```

**Why:** Constraint validates without recalculating. Frontend still source of truth.

---

## 📚 Documentation Standards

### **Every Trigger Must Have:**
1. Comment explaining purpose
2. Category (timestamp/audit/validation/etc)
3. Justification for existence
4. Alternative considered

### **Example:**
```sql
-- PURPOSE: Auto-generate sequential invoice numbers
-- CATEGORY: Auto-numbering
-- JUSTIFICATION: Must be server-side to prevent duplicates
-- ALTERNATIVE: Frontend could call API, but race conditions possible
CREATE TRIGGER trg_auto_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION auto_generate_invoice_number();
```

---

## 🎉 Expected Outcomes

### **Immediate (This Week)**
- ✅ Quote updates work
- ✅ Invoice updates work
- ✅ No more 7-hour debug loops

### **Short Term (This Month)**
- ✅ Faster UX (no round-trips)
- ✅ Easier debugging (one source of truth)
- ✅ Simpler backend (less code)

### **Long Term (This Quarter)**
- ✅ Offline support ready
- ✅ Mobile app faster
- ✅ Better scalability

---

## 🚀 Bottom Line

**Architecture Decision:** Frontend = Source of Truth, Backend = Validation Only

**Rationale:**
- Industry standard (Stripe, Shopify, Jobber, ServiceTitan)
- Enables offline support
- Faster UX
- Simpler architecture
- Easier to maintain

**Implementation:**
- Disable calculation triggers
- Keep validation constraints
- Keep metadata triggers
- Document everything

**Result:** Modern, scalable, maintainable architecture! 🎉

