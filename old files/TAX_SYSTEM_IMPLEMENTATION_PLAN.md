# 🧾 Tax System Implementation Plan

## 🎯 Goal: Industry-Standard Tax Calculation

**Current State:** Single manual tax rate (8.25%)  
**Target State:** Multi-jurisdiction automatic tax calculation  
**Competitors:** ServiceTitan (Avalara), Jobber, Housecall Pro

---

## 📊 Three-Tier Approach

### **Tier 1: Basic (MVP - 2 Weeks)**
Manual multi-rate support - Good enough for beta

### **Tier 2: Smart (3 Months)**
Address-based lookup - Competitive with Jobber

### **Tier 3: Enterprise (6 Months)**
Avalara integration - Match ServiceTitan

---

## 🚀 TIER 1: Basic Multi-Rate (IMPLEMENT NOW)

### **Database Schema**

```sql
-- Tax jurisdictions table
CREATE TABLE tax_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(255) NOT NULL, -- "California State", "Los Angeles County", "City of LA"
  jurisdiction_type VARCHAR(50) NOT NULL, -- 'state', 'county', 'city', 'district'
  tax_rate DECIMAL(5,4) NOT NULL, -- 0.0725 = 7.25%
  applies_to VARCHAR(50) DEFAULT 'all', -- 'all', 'goods', 'services', 'labor'
  active BOOLEAN DEFAULT true,
  effective_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax exemptions table
CREATE TABLE tax_exemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  exemption_type VARCHAR(50) NOT NULL, -- 'resale', 'nonprofit', 'government', 'agricultural'
  certificate_number VARCHAR(100),
  issuing_state VARCHAR(2),
  expiration_date DATE,
  document_url TEXT, -- Link to stored certificate
  applies_to VARCHAR(50) DEFAULT 'all', -- 'all', 'goods', 'services'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service address tax rates (for quick lookup)
CREATE TABLE service_address_tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  combined_rate DECIMAL(5,4) NOT NULL, -- Total of all jurisdictions
  jurisdiction_breakdown JSONB, -- {"state": 0.0625, "county": 0.01, "city": 0.01}
  last_verified TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add to work_orders table
ALTER TABLE work_orders
ADD COLUMN service_address_id UUID REFERENCES service_address_tax_rates(id),
ADD COLUMN tax_jurisdiction_ids UUID[], -- Array of jurisdiction IDs
ADD COLUMN tax_exempt BOOLEAN DEFAULT false,
ADD COLUMN tax_exemption_id UUID REFERENCES tax_exemptions(id);

-- Add to work_order_line_items table
ALTER TABLE work_order_line_items
ADD COLUMN taxable BOOLEAN DEFAULT true,
ADD COLUMN tax_rate DECIMAL(5,4), -- Can override per line item
ADD COLUMN tax_amount DECIMAL(10,2);
```

### **Frontend Service**

```javascript
// src/services/TaxService.js

export class TaxService {
  /**
   * Calculate tax for a work order
   */
  static async calculateTax(workOrder, lineItems, companyId) {
    // Check if customer is tax exempt
    if (workOrder.tax_exempt && workOrder.tax_exemption_id) {
      const exemption = await this.getExemption(workOrder.tax_exemption_id);
      if (exemption && exemption.active && !this.isExpired(exemption)) {
        return {
          taxable: false,
          exemptionReason: exemption.exemption_type,
          taxAmount: 0,
          taxRate: 0
        };
      }
    }

    // Get tax rate for service address
    let taxRate = 0;
    let jurisdictions = [];

    if (workOrder.service_address_id) {
      const addressRate = await this.getAddressTaxRate(workOrder.service_address_id);
      taxRate = addressRate.combined_rate;
      jurisdictions = addressRate.jurisdiction_breakdown;
    } else {
      // Fallback to company default
      const settings = await settingsService.getBusinessSettings(companyId);
      taxRate = settings.default_tax_rate || 0;
    }

    // Calculate tax per line item
    let totalTax = 0;
    const itemsWithTax = lineItems.map(item => {
      if (!item.taxable) {
        return { ...item, tax_amount: 0 };
      }

      const itemTaxRate = item.tax_rate || taxRate;
      const itemTax = item.total_price * itemTaxRate;
      totalTax += itemTax;

      return {
        ...item,
        tax_rate: itemTaxRate,
        tax_amount: itemTax
      };
    });

    return {
      taxable: true,
      taxRate,
      taxAmount: totalTax,
      jurisdictions,
      lineItems: itemsWithTax
    };
  }

  /**
   * Get tax jurisdictions for a company
   */
  static async getJurisdictions(companyId) {
    const response = await supaFetch(
      `tax_jurisdictions?company_id=eq.${companyId}&active=eq.true&order=jurisdiction_type,name`,
      { method: 'GET' },
      companyId
    );
    return response.ok ? await response.json() : [];
  }

  /**
   * Add tax jurisdiction
   */
  static async addJurisdiction(jurisdiction, companyId) {
    const response = await supaFetch(
      'tax_jurisdictions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...jurisdiction, company_id: companyId })
      },
      companyId
    );
    return response.ok ? await response.json() : null;
  }

  /**
   * Get customer tax exemption
   */
  static async getExemption(exemptionId) {
    const response = await supaFetch(
      `tax_exemptions?id=eq.${exemptionId}`,
      { method: 'GET' }
    );
    const data = await response.json();
    return data?.[0] || null;
  }

  /**
   * Check if exemption is expired
   */
  static isExpired(exemption) {
    if (!exemption.expiration_date) return false;
    return new Date(exemption.expiration_date) < new Date();
  }

  /**
   * Get or create service address tax rate
   */
  static async getAddressTaxRate(addressId) {
    const response = await supaFetch(
      `service_address_tax_rates?id=eq.${addressId}`,
      { method: 'GET' }
    );
    const data = await response.json();
    return data?.[0] || null;
  }

  /**
   * Create service address tax rate (manual entry for now)
   */
  static async createAddressTaxRate(addressData, companyId) {
    const response = await supaFetch(
      'service_address_tax_rates',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addressData, company_id: companyId })
      },
      companyId
    );
    return response.ok ? await response.json() : null;
  }
}
```

### **UI Components**

```javascript
// Tax Jurisdiction Manager (Settings page)
const TaxJurisdictionManager = () => {
  const [jurisdictions, setJurisdictions] = useState([]);
  
  const addJurisdiction = async (data) => {
    await TaxService.addJurisdiction(data, user.company_id);
    loadJurisdictions();
  };

  return (
    <div>
      <h3>Tax Jurisdictions</h3>
      <button onClick={() => setShowAdd(true)}>Add Jurisdiction</button>
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Rate</th>
            <th>Applies To</th>
          </tr>
        </thead>
        <tbody>
          {jurisdictions.map(j => (
            <tr key={j.id}>
              <td>{j.name}</td>
              <td>{j.jurisdiction_type}</td>
              <td>{(j.tax_rate * 100).toFixed(2)}%</td>
              <td>{j.applies_to}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Tax Exemption Manager (Customer page)
const TaxExemptionForm = ({ customerId }) => {
  const [exemption, setExemption] = useState({
    exemption_type: 'resale',
    certificate_number: '',
    issuing_state: '',
    expiration_date: '',
    applies_to: 'all'
  });

  return (
    <form>
      <select value={exemption.exemption_type} onChange={...}>
        <option value="resale">Resale Certificate</option>
        <option value="nonprofit">Nonprofit Organization</option>
        <option value="government">Government Entity</option>
        <option value="agricultural">Agricultural</option>
      </select>
      
      <input 
        placeholder="Certificate Number"
        value={exemption.certificate_number}
        onChange={...}
      />
      
      <input 
        type="date"
        placeholder="Expiration Date"
        value={exemption.expiration_date}
        onChange={...}
      />
      
      <button type="submit">Save Exemption</button>
    </form>
  );
};
```

---

## 🚀 TIER 2: Smart Address-Based (3 MONTHS)

### **Address Geocoding & Lookup**

```javascript
// Use free geocoding API
const geocodeAddress = async (address) => {
  // Option 1: Nominatim (free, OpenStreetMap)
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`
  );
  const data = await response.json();
  return data[0]; // { lat, lon, address components }
};

// Tax rate database (build or license)
const lookupTaxRate = async (lat, lon) => {
  // Option 1: Build database from state sources
  // Option 2: Use TaxJar API (cheaper than Avalara)
  // Option 3: Use Avalara AvaTax
  
  // For now: Manual database
  const jurisdiction = await findJurisdictionByCoordinates(lat, lon);
  return jurisdiction.combined_rate;
};
```

### **Auto-Calculate on Address Entry**

```javascript
// In QuoteBuilder
const handleAddressChange = async (address) => {
  setFormData({ ...formData, service_address: address });
  
  // Geocode and lookup tax
  const location = await geocodeAddress(address);
  const taxRate = await lookupTaxRate(location.lat, location.lon);
  
  // Update tax rate
  setRates({ ...rates, tax: taxRate * 100 });
  
  // Show notification
  showNotification(`Tax rate updated to ${(taxRate * 100).toFixed(2)}% based on service address`);
};
```

---

## 🚀 TIER 3: Enterprise Avalara Integration (6 MONTHS)

### **Avalara AvaTax API**

```javascript
// src/services/AvalaraService.js

export class AvalaraService {
  static async calculateTax(transaction) {
    const response = await fetch('https://rest.avatax.com/api/v2/transactions/create', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${AVALARA_ACCOUNT}:${AVALARA_LICENSE}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'SalesInvoice',
        companyCode: transaction.companyCode,
        date: transaction.date,
        customerCode: transaction.customerId,
        addresses: {
          shipFrom: transaction.businessAddress,
          shipTo: transaction.serviceAddress
        },
        lines: transaction.lineItems.map(item => ({
          number: item.id,
          quantity: item.quantity,
          amount: item.total_price,
          taxCode: item.taxCode, // 'P0000000' = tangible goods, 'PS081282' = services
          description: item.description
        }))
      })
    });

    const result = await response.json();
    return {
      totalTax: result.totalTax,
      taxByJurisdiction: result.summary,
      lineItems: result.lines
    };
  }
}
```

### **Pricing Tiers**

| Tier | Tax Feature | Price |
|------|-------------|-------|
| **Basic** | Manual single rate | Free |
| **Pro** | Manual multi-rate | Free |
| **Premium** | Address-based lookup | +$20/mo |
| **Enterprise** | Avalara integration | +$50/mo |

---

## 📋 Implementation Checklist

### **Phase 1: Basic (2 Weeks)**
- [ ] Create tax_jurisdictions table
- [ ] Create tax_exemptions table
- [ ] Create service_address_tax_rates table
- [ ] Build TaxService.js
- [ ] Add Tax Jurisdiction Manager to Settings
- [ ] Add Tax Exemption form to Customer page
- [ ] Update QuoteBuilder to use TaxService
- [ ] Update WorkOrderBuilder to use TaxService
- [ ] Update InvoiceBuilder to use TaxService
- [ ] Test multi-rate calculations
- [ ] Test tax exemptions

### **Phase 2: Smart (3 Months)**
- [ ] Integrate geocoding API
- [ ] Build tax rate database (or license)
- [ ] Auto-calculate on address entry
- [ ] Cache tax rates by address
- [ ] Add "Verify Tax Rate" button
- [ ] Show jurisdiction breakdown in UI
- [ ] Test with real addresses

### **Phase 3: Enterprise (6 Months)**
- [ ] Sign up for Avalara AvaTax
- [ ] Build AvalaraService.js
- [ ] Add Avalara toggle in Settings
- [ ] Implement transaction sync
- [ ] Add tax reporting dashboard
- [ ] Test with Avalara sandbox
- [ ] Launch enterprise tier

---

## 🎯 Success Metrics

**Tier 1 Success:**
- ✅ Support multiple tax jurisdictions
- ✅ Handle tax exemptions
- ✅ Calculate tax per line item
- ✅ Match competitor basic features

**Tier 2 Success:**
- ✅ Auto-calculate tax from address
- ✅ 95%+ accuracy on tax rates
- ✅ Faster than manual entry
- ✅ Competitive with Jobber

**Tier 3 Success:**
- ✅ 100% accurate tax calculation
- ✅ Automatic tax filing (Avalara)
- ✅ Multi-state compliance
- ✅ Match ServiceTitan

---

## 💡 Key Decisions

**Q: Build or buy tax database?**  
**A:** Start with manual (Tier 1), evaluate TaxJar vs Avalara for Tier 2/3

**Q: Free or paid feature?**  
**A:** Basic free, address-based premium, Avalara enterprise

**Q: How to handle tax changes?**  
**A:** Store effective_date, allow historical rates, audit trail

**Q: What about international?**  
**A:** US-only for now, VAT later (different system entirely)

---

## 🎉 Bottom Line

**Start with Tier 1 (2 weeks):**
- Manual multi-rate support
- Tax exemption handling
- Good enough for beta launch
- Foundation for future tiers

**This alone puts us ahead of most competitors' basic plans!**

