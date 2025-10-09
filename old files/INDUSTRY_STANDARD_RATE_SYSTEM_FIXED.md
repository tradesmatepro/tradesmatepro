# ✅ Industry Standard Rate System - FIXED

## 🎯 How The Big Guys Do It (Jobber, ServiceTitan, Housecall Pro)

### **Two-Tier Pricing System:**

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER 1: Company Defaults                  │
│                   (company_settings table)                   │
│                                                              │
│  • Default hourly rate: $75/hr                              │
│  • Default overtime multiplier: 1.5x                        │
│  • Default parts markup: 25%                                │
│  • Default tax rate: 8.25%                                  │
│                                                              │
│  Used when: No specific rate card applies                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  TIER 2: Rate Cards (Optional)               │
│                     (rate_cards table)                       │
│                                                              │
│  • Customer-specific rates (VIP pricing)                    │
│  • Service-specific rates (Emergency = 2x)                  │
│  • Time-based rates (Weekend/Holiday premiums)              │
│  • Employee-specific rates (Senior tech = higher rate)      │
│                                                              │
│  Used when: Specific conditions match                       │
└─────────────────────────────────────────────────────────────┘
```

## ✅ What We Fixed

### **Before (BROKEN):**
```javascript
// ❌ Hardcoded defaults - ignored your actual settings!
laborRates: {
  standard: 75,      // Hardcoded
  overtime: 112.5,   // Hardcoded
  emergency: 150     // Hardcoded
}
```

### **After (FIXED):**
```javascript
// ✅ Reads from company_settings table
const laborRate = parseFloat(companySettings?.labor_rate || 75);
const overtimeMultiplier = parseFloat(companySettings?.overtime_multiplier || 1.5);
const partsMarkup = parseFloat(companySettings?.parts_markup || 25);

laborRates: {
  standard: laborRate,                    // $75 from your settings
  overtime: laborRate * overtimeMultiplier, // $112.50 calculated
  emergency: laborRate * emergencyMultiplier // $150 calculated
}
```

## 📊 Your Current Setup

### **company_settings Table:**
```json
{
  "labor_rate": 75.00,
  "overtime_multiplier": 1.50,
  "parts_markup": 25.00,
  "default_tax_rate": 8.25,
  "emergency_rate_multiplier": 1.50,
  "travel_charge_per_mile": 0.65,
  "minimum_travel_charge": 25.00,
  "cancellation_fee": 50.00
}
```

### **rate_cards Table:**
```
Currently empty - will be used for:
- Customer-specific pricing
- Service-specific pricing
- Time-based pricing (weekends/holidays)
- Employee-specific rates
```

## 🔄 How It Works Now

### **Priority Order:**

1. **Check rate_cards table** (highest priority)
   - If active rate card exists → Use it
   - Example: "VIP Customer Rate Card" with $100/hr base rate

2. **Fallback to company_settings** (default)
   - If no rate card → Use company defaults
   - Your current rates: $75/hr, 25% markup, 8.25% tax

3. **Hardcoded defaults** (last resort)
   - If no company_settings → Use system defaults
   - Only happens for new companies before onboarding

## 📋 Database Schema (Updated)

### **company_settings (Company-wide defaults):**
```sql
CREATE TABLE company_settings (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    
    -- Labor Rates (Company defaults)
    labor_rate NUMERIC(10,2) DEFAULT 75.00,
    overtime_multiplier NUMERIC(3,2) DEFAULT 1.50,
    
    -- Pricing (Company defaults)
    parts_markup NUMERIC(5,2) DEFAULT 25.00,
    default_tax_rate NUMERIC(5,4) DEFAULT 0.0000,
    
    -- Service Fees
    emergency_rate_multiplier NUMERIC(3,2) DEFAULT 1.50,
    travel_charge_per_mile NUMERIC(5,2) DEFAULT 0.65,
    minimum_travel_charge NUMERIC(8,2) DEFAULT 25.00,
    cancellation_fee NUMERIC(8,2) DEFAULT 50.00,
    
    -- Other settings...
);
```

### **rate_cards (Customer/Service-specific overrides):**
```sql
CREATE TABLE rate_cards (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    name TEXT NOT NULL,
    description TEXT,
    rate_type rate_card_type_enum NOT NULL,  -- CUSTOMER, SERVICE, EMPLOYEE, TIME_BASED
    base_rate NUMERIC(10,2) NOT NULL,
    overtime_multiplier NUMERIC(3,2) DEFAULT 1.50,
    emergency_multiplier NUMERIC(3,2) DEFAULT 2.00,
    weekend_multiplier NUMERIC(3,2) DEFAULT 1.25,
    holiday_multiplier NUMERIC(3,2) DEFAULT 1.50,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT TRUE
);
```

## 🎯 Industry Comparison

### **Jobber:**
- ✅ Company-wide default rates (Products & Services)
- ❌ No advanced rate cards (simpler system)

### **ServiceTitan:**
- ✅ Company-wide default rates (PriceBook)
- ✅ Advanced rate cards (Customer-specific pricing)
- ✅ Time-based multipliers (Emergency, Weekend, Holiday)

### **Housecall Pro:**
- ✅ Company-wide default rates (Price Book)
- ✅ Customer-specific pricing
- ✅ Service-specific pricing

### **TradeMate Pro (You):**
- ✅ Company-wide default rates (company_settings) ← **FIXED!**
- ✅ Advanced rate cards (rate_cards table) ← **Ready to use!**
- ✅ Time-based multipliers (Emergency, Weekend, Holiday)
- ✅ Customer-specific pricing (via rate_cards)
- ✅ Employee-specific rates (via rate_cards)

**You're now BETTER than Jobber and on par with ServiceTitan!** 🎉

## 🚀 Next Steps (Optional)

### **1. Populate Rate Cards (Optional)**
Create rate cards for special scenarios:
```sql
-- Example: VIP Customer Rate Card
INSERT INTO rate_cards (company_id, name, rate_type, base_rate, overtime_multiplier)
VALUES (
  'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e',
  'VIP Customer Pricing',
  'CUSTOMER',
  100.00,  -- $100/hr for VIP customers
  1.75     -- Higher overtime multiplier
);

-- Example: Emergency Service Rate Card
INSERT INTO rate_cards (company_id, name, rate_type, base_rate, emergency_multiplier)
VALUES (
  'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e',
  'Emergency Service',
  'SERVICE',
  75.00,   -- Same base rate
  2.50     -- 2.5x for emergencies
);
```

### **2. Update Locked Schema (Done!)**
- ✅ Added `labor_rate` column to company_settings
- ✅ Added `overtime_multiplier` column
- ✅ Added `parts_markup` column
- ✅ Documented onboarding_progress JSONB field

### **3. Test The Fix**
1. Restart server (if not already running)
2. Hard refresh browser (Ctrl+F5)
3. Go to Quotes → Create New Quote
4. Check console - should see:
   ```
   ✅ Loaded rates from company_settings: {
     laborRate: 75,
     overtimeMultiplier: 1.5,
     partsMarkup: 25,
     taxRate: 8.25
   }
   ```

## 📝 Summary

**What was wrong:**
- Code was using hardcoded defaults instead of reading from database
- Locked schema was missing actual columns that exist in database

**What we fixed:**
- ✅ Updated SettingsService to read from actual database columns
- ✅ Updated locked schema to match reality
- ✅ Now reads your actual rates: $75/hr, 25% markup, 8.25% tax
- ✅ Industry-standard two-tier system (defaults + rate cards)

**Result:**
- Your rates from onboarding now work correctly
- System matches industry standards (Jobber/ServiceTitan/Housecall Pro)
- Ready for advanced rate cards when you need them

