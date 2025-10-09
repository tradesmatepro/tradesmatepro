# Rate System Analysis - TradeMate Pro

## Current State: Hybrid System (Partially Implemented)

### ✅ What EXISTS in Database:

**Industry-Standard Rate Tables:**
1. **`service_rates`** - Base rates by service category and rate type
   - Columns: company_id, service_category_id, rate_type (enum), rate, effective_date, end_date
   - ✅ Fully implemented, industry standard
   
2. **`rate_cards`** - Customer-specific pricing overrides
   - Columns: company_id, customer_id, name, description, active
   - ✅ Fully implemented, industry standard
   
3. **`rate_card_items`** - Line items for rate cards
   - Columns: rate_card_id, service_rate_id, override_rate
   - ✅ Fully implemented, industry standard

4. **`pricing_rules`** - Dynamic pricing rules
   - ✅ Exists in database

5. **`company_settings`** - Simple default rates
   - Columns: labor_rate, overtime_multiplier, parts_markup, default_tax_rate
   - ✅ Exists but MINIMAL columns

### ❌ What's BROKEN:

**Frontend is NOT using the industry-standard tables!**

**Current Frontend Behavior:**
- QuoteBuilder calls `settingsService.getRatesPricingSettings()`
- That method queries **TWO tables**:
  1. `settings` table (❌ DOESN'T EXIST - causes 404 error)
  2. `company_settings` table (✅ exists but has minimal columns)
- Returns hardcoded defaults when queries fail
- **NEVER queries `service_rates` or `rate_cards` tables**

---

## Industry Standard (Jobber/ServiceTitan/Housecall Pro)

### Pricing Hierarchy:
```
1. service_rates (base rates for all services)
   ↓
2. pricing_rules (conditional adjustments: time-of-day, emergency, etc.)
   ↓
3. rate_cards (customer-specific overrides)
   ↓
4. Final calculated price
```

### How Competitors Do It:

**ServiceTitan:**
- Base rates in `price_book` table (our `service_rates`)
- Customer-specific pricing in `customer_price_book` (our `rate_cards`)
- Dynamic pricing rules for emergency/after-hours
- Settings table only has company-wide defaults (tax rate, currency, etc.)

**Jobber:**
- Service rates by category
- Customer-specific rate cards
- Tiered pricing support
- Settings for markup percentages

**Housecall Pro:**
- Flat rate pricing book
- Customer-specific pricing
- Dynamic pricing for emergency calls
- Settings for tax and fees

---

## The Problem

### Current Code Flow (BROKEN):
```javascript
// QuoteBuilder.js line 210
const settings = await settingsService.getRatesPricingSettings(companyId);

// SettingsService.js line 260-264 (BROKEN)
const { data: settings, error: settingsError } = await supabase
  .from('settings')  // ❌ TABLE DOESN'T EXIST
  .select('*')
  .eq('company_id', companyId)
  .single();

// Returns hardcoded defaults:
return {
  laborRates: { standard: 75, overtime: 112.5, emergency: 150 },
  markupPercentages: { materials: 25, subcontractor: 15 },
  taxRate: 8.25
};
```

### What It SHOULD Do (Industry Standard):
```javascript
// 1. Query service_rates table for base rates
const { data: serviceRates } = await supabase
  .from('service_rates')
  .select('*')
  .eq('company_id', companyId)
  .lte('effective_date', today)
  .or('end_date.is.null,end_date.gte.' + today);

// 2. Query pricing_rules for adjustments
const { data: pricingRules } = await supabase
  .from('pricing_rules')
  .select('*')
  .eq('company_id', companyId);

// 3. If customer selected, check for rate card override
if (customerId) {
  const { data: rateCard } = await supabase
    .from('rate_cards')
    .select('*, rate_card_items(*, service_rates(*))')
    .eq('customer_id', customerId)
    .eq('active', true);
}

// 4. Fallback to company_settings for simple defaults
const { data: companySettings } = await supabase
  .from('company_settings')
  .select('labor_rate, overtime_multiplier, parts_markup, default_tax_rate')
  .eq('company_id', companyId);
```

---

## Recommended Fix Strategy

### Option 1: Quick Fix (Band-Aid) ⚠️
**Fix the immediate 404 error:**
- Change `settings` to `company_settings` in SettingsService.js
- Keep using simple rates from company_settings
- **Pros:** Fast, minimal changes
- **Cons:** Not using industry-standard tables, missing advanced features

### Option 2: Proper Implementation (Industry Standard) ✅ RECOMMENDED
**Implement full rate system:**
1. Fix SettingsService to query `service_rates` and `rate_cards`
2. Add fallback to `company_settings` for simple defaults
3. Update QuoteBuilder to use rate cards when customer is selected
4. Add UI for managing service rates and rate cards
5. Migrate existing company_settings data to service_rates table

**Pros:** 
- Industry standard
- Supports customer-specific pricing
- Supports dynamic pricing rules
- Scalable for future features

**Cons:** 
- More work upfront
- Need to populate service_rates table with initial data

---

## Immediate Action Plan

### Phase 1: Stop the Bleeding (Fix 404 errors)
1. ✅ Fix `SettingsService.getRatesPricingSettings()` to NOT query `settings` table
2. ✅ Query `company_settings` for basic rates
3. ✅ Return proper defaults if no data exists

### Phase 2: Implement Industry Standard (Next Sprint)
1. Create migration script to populate `service_rates` from `company_settings`
2. Update `SettingsService.getRatesPricingSettings()` to query `service_rates`
3. Add rate card support to QuoteBuilder
4. Create UI for managing service rates
5. Create UI for managing customer rate cards

### Phase 3: Advanced Features (Future)
1. Dynamic pricing rules (emergency, after-hours, etc.)
2. Tiered pricing
3. Volume discounts
4. Seasonal pricing

---

## Code Changes Needed NOW

### File: `src/services/SettingsService.js`

**Current (BROKEN):**
```javascript
// Line 260-264
const { data: settings, error: settingsError } = await supabase
  .from('settings')  // ❌ DOESN'T EXIST
  .select('*')
  .eq('company_id', companyId)
  .single();
```

**Fix Option 1 (Quick - Use company_settings):**
```javascript
const { data: companySettings, error: settingsError } = await supabase
  .from('company_settings')  // ✅ EXISTS
  .select('labor_rate, overtime_multiplier, parts_markup, default_tax_rate')
  .eq('company_id', companyId)
  .single();

return {
  laborRates: {
    standard: companySettings?.labor_rate || 75,
    overtime: (companySettings?.labor_rate || 75) * (companySettings?.overtime_multiplier || 1.5),
    emergency: (companySettings?.labor_rate || 75) * 2.0
  },
  markupPercentages: {
    materials: companySettings?.parts_markup || 25,
    subcontractor: 15
  },
  taxRate: companySettings?.default_tax_rate || 8.25
};
```

**Fix Option 2 (Proper - Use service_rates with fallback):**
```javascript
// Try service_rates first (industry standard)
const { data: serviceRates } = await supabase
  .from('service_rates')
  .select('*')
  .eq('company_id', companyId)
  .lte('effective_date', new Date().toISOString().split('T')[0])
  .or('end_date.is.null,end_date.gte.' + new Date().toISOString().split('T')[0]);

// Fallback to company_settings if no service rates
if (!serviceRates || serviceRates.length === 0) {
  const { data: companySettings } = await supabase
    .from('company_settings')
    .select('*')
    .eq('company_id', companyId)
    .single();
    
  return {
    laborRates: {
      standard: companySettings?.labor_rate || 75,
      overtime: (companySettings?.labor_rate || 75) * (companySettings?.overtime_multiplier || 1.5),
      emergency: (companySettings?.labor_rate || 75) * 2.0
    },
    markupPercentages: {
      materials: companySettings?.parts_markup || 25,
      subcontractor: 15
    },
    taxRate: companySettings?.default_tax_rate || 8.25
  };
}

// Transform service_rates into expected format
const ratesByType = {};
serviceRates.forEach(rate => {
  if (!ratesByType[rate.rate_type]) {
    ratesByType[rate.rate_type] = [];
  }
  ratesByType[rate.rate_type].push(rate);
});

return {
  serviceRates,
  ratesByType,
  laborRates: {
    standard: ratesByType.HOURLY?.[0]?.rate || 75,
    overtime: ratesByType.HOURLY?.[1]?.rate || 112.5,
    emergency: ratesByType.HOURLY?.[2]?.rate || 150
  },
  markupPercentages: {
    materials: 25,
    subcontractor: 15
  },
  taxRate: 8.25
};
```

---

## Decision Required

**Which approach do you want?**

1. **Quick Fix** - Just fix the 404 error, use company_settings (5 minutes)
2. **Proper Fix** - Implement industry-standard rate system (30 minutes + testing)

I recommend **Option 2 (Proper Fix)** since you already have the tables in the database and want to match industry standards.


