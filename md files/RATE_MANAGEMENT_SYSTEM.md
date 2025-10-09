# TradeMate Pro - Rate Management & Auto-Calculation System

## 🎯 **OVERVIEW**

The Rate Management System provides comprehensive pricing control and auto-calculation features for quotes and jobs, inspired by the Android app's settings system. This eliminates manual rate entry and ensures consistent pricing across all quotes.

## 🏗️ **SYSTEM ARCHITECTURE**

### **1. Settings Database (Supabase)**
- **Table**: `company_settings`
- **Auto-creation**: Creates table if it doesn't exist
- **Single-row configuration**: One settings record per company
- **Real-time sync**: Settings cached for 5 minutes, then refreshed

### **2. Settings Service (`SettingsService.js`)**
- **Singleton pattern**: One instance across the app
- **Caching system**: 5-minute cache to reduce database calls
- **Auto-calculation**: Dynamic rate calculations based on base hourly rate
- **Fallback defaults**: Works even if database is unavailable

### **3. Enhanced Settings UI**
- **Company Profile**: Business information and contact details
- **Rates & Pricing**: Labor rates with auto-calculation
- **Quote Settings**: Default terms, validity, and configuration

## 💰 **RATE TYPES & AUTO-CALCULATION**

### **Labor Rates**
```javascript
Standard Hourly Rate: $75.00 (configurable)
Overtime Rate: $112.50 (auto: 1.5x standard)
Emergency Rate: $150.00 (auto: 2.0x standard)  
Weekend Rate: $90.00 (auto: 1.2x standard)
```

### **Pricing Configuration**
```javascript
Parts Markup: 30% (applied to parts/materials)
Tax Rate: 8.25% (applied to final total)
Down Payment: 30% (default requirement)
```

### **Auto-Calculation Logic**
- **Overtime**: Automatically 1.5x hourly rate (can be disabled)
- **Emergency**: Automatically 2.0x hourly rate (can be disabled)
- **Weekend**: Automatically 1.2x hourly rate (can be disabled)
- **Parts Markup**: Applied to all parts and materials
- **Tax**: Applied to final subtotal

## 🔧 **QUOTE BUILDER ENHANCEMENTS**

### **Item Types**
- **Labor**: Uses hourly rates, supports overtime checkbox
- **Part**: Applies markup percentage automatically
- **Material**: Applies markup percentage automatically  
- **Service**: Fixed rate, no markup

### **Auto-Calculation Features**
1. **Rate Selection**: Automatically sets rate based on item type
2. **Overtime Detection**: Checkbox for labor items to use overtime rate
3. **Markup Application**: Automatic markup on parts/materials
4. **Tax Calculation**: Real-time tax calculation on totals
5. **Live Updates**: All calculations update in real-time

### **Quote Summary**
```
Subtotal: $1,000.00
Tax (8.25%): $82.50
Total: $1,082.50

Auto-Calculation Active:
• Labor: $75/hr (Overtime: $112.50/hr)
• Parts Markup: 30%
• Tax Rate: 8.25%
```

## 📊 **SETTINGS MANAGEMENT**

### **Company Profile Tab**
- Company Name, Address, Phone, Email
- Website, License Number, Tax ID
- Used in quote headers and PDFs

### **Rates & Pricing Tab**
- **Standard Hourly Rate**: Base rate for all calculations
- **Overtime Rate**: Auto-calculated or manual override
- **Emergency Rate**: Auto-calculated or manual override  
- **Weekend Rate**: Auto-calculated or manual override
- **Default Markup**: Applied to parts/materials
- **Default Tax Rate**: Applied to final totals
- **Down Payment %**: Default payment requirement

### **Quote Settings Tab**
- **Quote Validity**: Days quotes remain valid (default: 30)
- **Auto-Calculate Toggles**: Enable/disable auto-rate calculation
- **Photo Inclusion**: Include photos in quote PDFs
- **Default Terms**: Standard terms and conditions
- **Default Notes**: Standard quote notes

## 🔄 **INTEGRATION POINTS**

### **Quote System Integration**
```javascript
// Automatic rate loading
const rates = await settingsService.getSettings();

// Auto-calculation for labor
const laborCost = await settingsService.calculateLaborCost(
  hours, isOvertime, isEmergency, isWeekend
);

// Auto-markup for parts
const partPrice = await settingsService.calculatePriceWithMarkup(cost);

// Tax calculation
const total = await settingsService.calculateTotalWithTax(subtotal);
```

### **Job System Integration**
- Rates automatically applied when converting quotes to jobs
- Labor costs calculated using current rate settings
- Material costs include configured markup

## 🎛️ **CONFIGURATION OPTIONS**

### **Rate Calculation Modes**
1. **Auto-Calculate Mode** (Recommended)
   - Overtime = 1.5x hourly rate
   - Emergency = 2.0x hourly rate
   - Weekend = 1.2x hourly rate

2. **Manual Override Mode**
   - Set custom rates for each type
   - Rates don't change when hourly rate changes

### **Quote Behavior Settings**
- **Quote Validity**: 1-365 days
- **Photo Inclusion**: Enable/disable in PDFs
- **Auto-Calculation**: Toggle for each rate type

## 📈 **BUSINESS BENEFITS**

### **Consistency**
- ✅ Same rates across all quotes and jobs
- ✅ No manual rate entry errors
- ✅ Standardized pricing structure

### **Efficiency**
- ✅ Auto-calculation saves time
- ✅ Real-time total updates
- ✅ One-click rate changes affect all future quotes

### **Profitability**
- ✅ Automatic markup ensures profit margins
- ✅ Overtime rates properly calculated
- ✅ Emergency/weekend premiums applied

### **Professional Appearance**
- ✅ Consistent quote formatting
- ✅ Professional rate structure
- ✅ Clear breakdown of costs

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Database Schema**
```sql
CREATE TABLE company_settings (
  id UUID PRIMARY KEY,
  -- Company Info
  company_name TEXT,
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  license_number TEXT,
  website TEXT,
  tax_id TEXT,
  
  -- Labor Rates
  hourly_rate DECIMAL(10,2) DEFAULT 75.0,
  overtime_rate DECIMAL(10,2) DEFAULT 112.5,
  emergency_rate DECIMAL(10,2) DEFAULT 150.0,
  weekend_rate DECIMAL(10,2) DEFAULT 90.0,
  
  -- Pricing
  default_markup_percentage DECIMAL(5,2) DEFAULT 30.0,
  default_tax_percentage DECIMAL(5,2) DEFAULT 8.25,
  default_down_payment_percentage DECIMAL(5,2) DEFAULT 30.0,
  
  -- Quote Settings
  quote_validity_days INTEGER DEFAULT 30,
  auto_calculate_overtime_rate BOOLEAN DEFAULT TRUE,
  auto_calculate_emergency_rate BOOLEAN DEFAULT TRUE,
  auto_calculate_weekend_rate BOOLEAN DEFAULT TRUE,
  include_photos_in_quotes BOOLEAN DEFAULT TRUE,
  default_quote_terms TEXT,
  default_quote_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Service Methods**
```javascript
// Get current rates
await settingsService.getHourlyRate()
await settingsService.getOvertimeRate()
await settingsService.getEmergencyRate()
await settingsService.getWeekendRate()

// Calculate costs
await settingsService.calculateLaborCost(hours, isOvertime, isEmergency, isWeekend)
await settingsService.calculatePriceWithMarkup(cost)
await settingsService.calculateTotalWithTax(subtotal)

// Get configurations
await settingsService.getQuoteDefaults()
await settingsService.getCompanyInfo()
```

## 🚀 **USAGE WORKFLOW**

### **1. Initial Setup**
1. Go to Settings → Company Profile
2. Enter company information
3. Go to Settings → Rates & Pricing
4. Set hourly rate (other rates auto-calculate)
5. Configure markup and tax percentages
6. Save settings

### **2. Creating Quotes**
1. Go to Quotes → Create Quote
2. Add quote items with types (Labor/Part/Material/Service)
3. Rates automatically populate based on type
4. Check "Overtime" for labor items if needed
5. Totals calculate automatically with markup and tax
6. Save quote

### **3. Rate Updates**
1. Go to Settings → Rates & Pricing
2. Update hourly rate
3. Other rates auto-update if auto-calculation enabled
4. All future quotes use new rates
5. Existing quotes remain unchanged

## ✅ **SYSTEM STATUS**

**✅ FULLY IMPLEMENTED:**
- Settings database with auto-table creation
- Company profile management
- Rate management with auto-calculation
- Quote builder with enhanced item types
- Real-time calculation and totals
- Settings service with caching
- Integration with quote system

**🎯 READY FOR USE:**
- Set your company rates in Settings
- Create quotes with auto-calculated pricing
- Professional quote generation with consistent rates
- Efficient quote-to-job conversion workflow

This rate management system brings TradeMate Pro's web app to parity with the Android app's pricing capabilities while adding web-specific enhancements like real-time calculations and visual feedback.
