# 🎯 Quick Reference: Frontend vs Backend Responsibilities

## ✅ FRONTEND (Source of Truth)

### **Calculations**
- ✅ Subtotals
- ✅ Tax amounts
- ✅ Discounts
- ✅ Deposits
- ✅ Totals
- ✅ Line item prices
- ✅ Markup percentages

### **Business Logic**
- ✅ Pricing rules
- ✅ Discount logic
- ✅ Tax calculations
- ✅ Payment splits
- ✅ Workflow steps
- ✅ Validation rules

### **User Experience**
- ✅ Instant feedback
- ✅ Real-time updates
- ✅ Offline support
- ✅ Optimistic UI

---

## ✅ BACKEND (Validation Only)

### **Validation (Constraints)**
- ✅ Math correctness: `total = subtotal + tax`
- ✅ Positive amounts: `total >= 0`
- ✅ Date logic: `end_date >= start_date`
- ✅ Required fields: `customer_id NOT NULL`

### **Metadata (Triggers)**
- ✅ Auto-timestamps: `updated_at = NOW()`
- ✅ Audit logging: Log changes
- ✅ Auto-numbering: Generate invoice numbers
- ✅ Status validation: Enforce transitions

### **Storage**
- ✅ Store data as-is
- ✅ Enforce foreign keys
- ✅ Maintain referential integrity

---

## ❌ BACKEND DOES NOT

### **Never Recalculate**
- ❌ Totals
- ❌ Taxes
- ❌ Discounts
- ❌ Subtotals
- ❌ Any financial data

### **Never Override**
- ❌ Frontend calculations
- ❌ User input
- ❌ Business logic

### **Never Implement**
- ❌ Complex workflows
- ❌ Pricing rules
- ❌ Business logic

---

## 🎯 Decision Tree

### **Should This Be a Database Trigger?**

```
Is it metadata? (timestamp, audit log, ID generation)
├─ YES → ✅ Use trigger
└─ NO → Is it validation? (constraint check)
    ├─ YES → ✅ Use constraint (not trigger!)
    └─ NO → Is it calculation?
        ├─ YES → ❌ Frontend responsibility
        └─ NO → Is it business logic?
            ├─ YES → ❌ Frontend responsibility
            └─ NO → ⚠️ Review case-by-case
```

---

## 📊 Examples

### **✅ GOOD: Frontend Calculates**
```javascript
// Frontend
const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
const taxAmount = subtotal * taxRate;
const total = subtotal + taxAmount;

// Send to backend
await api.updateQuote({
  subtotal,
  taxAmount,
  total
});
```

```sql
-- Backend validates
ALTER TABLE quotes
ADD CONSTRAINT chk_total_correct
CHECK (total = subtotal + tax_amount);
```

### **❌ BAD: Backend Recalculates**
```sql
-- DON'T DO THIS!
CREATE TRIGGER recalc_totals
AFTER INSERT ON line_items
FOR EACH ROW
BEGIN
  UPDATE quotes SET total = (SELECT SUM(price) FROM line_items);
END;
```

---

## 🚀 Migration Checklist

### **For Each Trigger:**

1. **Identify category:**
   - Metadata? → Keep
   - Validation? → Convert to constraint
   - Calculation? → Disable, move to frontend
   - Business logic? → Disable, move to frontend

2. **If disabling:**
   - Check if frontend already does it
   - If not, implement in frontend first
   - Then disable trigger
   - Test thoroughly

3. **Document:**
   - Why it was disabled
   - Where logic moved to
   - Date of change

---

## 💡 Remember

**Frontend = Smart**
- Calculates everything
- Handles business logic
- Provides UX

**Backend = Dumb + Safe**
- Stores data
- Validates correctness
- Enforces integrity

**Result = Fast + Reliable**
- Instant feedback
- Offline support
- Data integrity
- Easy to debug

---

## 🎉 Quick Wins

### **Already Done:**
- ✅ Disabled `trigger_calculate_work_order_totals`
- ✅ Disabled `trigger_calculate_invoice_totals`
- ✅ Quote updates work!

### **Next Steps:**
- [ ] Review deposit calculation trigger
- [ ] Review discount calculation trigger
- [ ] Review payment tracking trigger
- [ ] Test invoice updates

### **Long Term:**
- [ ] Add offline support
- [ ] Optimize frontend calculations
- [ ] Performance monitoring

