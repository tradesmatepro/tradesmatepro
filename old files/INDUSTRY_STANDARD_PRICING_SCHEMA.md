# 🏆 Industry Standard Pricing Schema

## 🔍 What Competitors Actually Use

### **Jobber** (Simplest - Good for SMBs)
**Structure:**
- **Products & Services List** - Single flat table
  - Name, Description, Unit Price, Unit Cost, Markup %
  - Taxable (yes/no)
  - Category (Product or Service)
  - Active (yes/no)

**That's it.** No complex rate cards, no pricing rules. Just a simple price list.

---

### **ServiceTitan** (Most Complex - Enterprise)
**Structure:**
- **PriceBook** - Base pricing catalog
  - Services organized by categories
  - Each service has: name, description, base price, labor hours, materials
  - Can have multiple price books per company
- **Customer-Specific Pricing** - Overrides per customer
- **Dynamic Pricing Rules** - Time-based, emergency, etc.

---

### **Housecall Pro** (Middle Ground)
**Structure:**
- **Price Book** - Base services and products
  - Name, description, price
  - Can add images
- **Flat Rate Pricing** - Pre-set packages
- **Customer-Specific Rates** - Optional overrides

---

## ✅ RECOMMENDATION FOR TRADEMATE PRO

**Start with Jobber's approach (simplest), add ServiceTitan features later.**

### Phase 1: Simple Price List (NOW - Beta Launch)
```sql
-- This already exists in your locked schema!
CREATE TABLE rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rate_type rate_card_type_enum NOT NULL,  -- HOURLY, FLAT, PER_UNIT
    base_rate NUMERIC(10,2) NOT NULL,
    overtime_multiplier NUMERIC(3,2) DEFAULT 1.50,
    emergency_multiplier NUMERIC(3,2) DEFAULT 2.00,
    weekend_multiplier NUMERIC(3,2) DEFAULT 1.25,
    holiday_multiplier NUMERIC(3,2) DEFAULT 1.50,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, name)
);
```

**This is BETTER than Jobber because:**
- ✅ Has multipliers (overtime, emergency, weekend, holiday)
- ✅ Has effective dates (can schedule price changes)
- ✅ Has rate types (hourly, flat, per-unit)

---

### Phase 2: Service Catalog (Post-Beta)
```sql
-- Add this later for ServiceTitan-style catalog
CREATE TABLE service_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    service_category_id UUID REFERENCES service_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    default_rate_card_id UUID REFERENCES rate_cards(id),
    estimated_duration_hours NUMERIC(5,2),
    requires_permit BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Phase 3: Customer-Specific Pricing (Post-Beta)
```sql
-- Add this for customer overrides
CREATE TABLE customer_rate_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    rate_card_id UUID REFERENCES rate_cards(id) ON DELETE CASCADE,
    override_rate NUMERIC(10,2) NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, rate_card_id)
);
```

---

## 🎯 THE REAL FIX FOR YOUR CURRENT ISSUE

**Problem:** Frontend is querying `service_rates` and `pricing_rules` tables that DON'T EXIST.

**Solution:** Use the `rate_cards` table that DOES EXIST in your locked schema.

### Fix SettingsService.js:

**Current (BROKEN):**
```javascript
// Queries tables that don't exist
const { data: serviceRates } = await supabase
  .from('service_rates')  // ❌ DOESN'T EXIST
  .select('*');

const { data: pricingRules } = await supabase
  .from('pricing_rules')  // ❌ DOESN'T EXIST
  .select('*');
```

**Fixed (INDUSTRY STANDARD):**
```javascript
// Query rate_cards table (exists in locked schema)
const { data: rateCards, error: rateError } = await supabase
  .from('rate_cards')
  .select('*')
  .eq('company_id', companyId)
  .eq('is_active', true)
  .gte('effective_date', new Date().toISOString().split('T')[0])
  .or(`expiration_date.is.null,expiration_date.gte.${new Date().toISOString().split('T')[0]}`)
  .order('effective_date', { ascending: false });

if (rateError) {
  console.warn('⚠️ Error fetching rate_cards:', rateError);
}

// If rate cards exist, use them
if (rateCards && rateCards.length > 0) {
  const primaryCard = rateCards[0]; // Most recent active card
  
  return {
    rateCards: rateCards,
    laborRates: {
      standard: primaryCard.base_rate,
      overtime: primaryCard.base_rate * primaryCard.overtime_multiplier,
      emergency: primaryCard.base_rate * primaryCard.emergency_multiplier,
      weekend: primaryCard.base_rate * primaryCard.weekend_multiplier,
      holiday: primaryCard.base_rate * primaryCard.holiday_multiplier
    },
    markupPercentages: {
      materials: 25,  // TODO: Add to company_settings
      subcontractor: 15
    },
    taxRate: 8.25  // TODO: Get from company_settings
  };
}

// Fallback to company_settings
const { data: companySettings } = await supabase
  .from('company_settings')
  .select('*')
  .eq('company_id', companyId)
  .single();

return {
  rateCards: [],
  laborRates: {
    standard: 75,  // Hardcoded default
    overtime: 112.5,
    emergency: 150
  },
  markupPercentages: {
    materials: 25,
    subcontractor: 15
  },
  taxRate: companySettings?.default_tax_rate || 8.25,
  emergencyMultiplier: companySettings?.emergency_rate_multiplier || 1.5
};
```

---

## 📊 Comparison

| Feature | Jobber | TradeMate Pro (Current) | ServiceTitan |
|---------|--------|-------------------------|--------------|
| Simple price list | ✅ | ✅ (rate_cards) | ✅ |
| Rate multipliers | ❌ | ✅ | ✅ |
| Effective dates | ❌ | ✅ | ✅ |
| Customer overrides | ❌ | 🔜 Phase 3 | ✅ |
| Service catalog | ❌ | 🔜 Phase 2 | ✅ |
| Dynamic pricing | ❌ | 🔜 Phase 3 | ✅ |

**TradeMate Pro is ALREADY better than Jobber!**

---

## 🚀 Action Plan

### Step 1: Verify rate_cards table exists
```sql
SELECT * FROM rate_cards LIMIT 1;
```

### Step 2: Fix SettingsService.js
- Remove queries to `service_rates` and `pricing_rules`
- Add query to `rate_cards`
- Add fallback to `company_settings`

### Step 3: Seed default rate card
```sql
-- Add a default rate card for existing companies
INSERT INTO rate_cards (company_id, name, description, rate_type, base_rate)
SELECT 
    id as company_id,
    'Standard Rates' as name,
    'Default hourly rates for labor' as description,
    'HOURLY' as rate_type,
    75.00 as base_rate
FROM companies
WHERE NOT EXISTS (
    SELECT 1 FROM rate_cards WHERE rate_cards.company_id = companies.id
);
```

---

## ✅ This Is Industry Standard

**Jobber:** Simple price list ✅  
**TradeMate Pro:** Simple price list + multipliers + dates ✅✅  
**ServiceTitan:** Complex catalog + overrides + rules ✅✅✅

**You're between Jobber and ServiceTitan - perfect for your market!**


