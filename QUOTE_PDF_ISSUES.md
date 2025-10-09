# Quote PDF Issues

## Issues Identified

### 1. PDF Shows Wrong Pricing Model
**Problem**: Quote has `pricing_model='PERCENTAGE'` with 27.5% of $5150.57 base amount, but PDF shows "Time and Materials" line items (Labor 1, 8 × $75.00 = $600.00).

**Root Cause**: The PDF generation service (`QuotePDFService.js`) ONLY displays line items from `work_order_line_items` table. It doesn't check the `pricing_model` field or display percentage-based pricing information.

**Current PDF Logic** (lines 60-73):
```javascript
// Compute totals from line items
const subtotal = items.reduce((s, it) => s + (it.total_price || (Number(it.quantity||0) * Number(it.unit_price||0))), 0);
const tax_amount = Number(quote.tax_amount || 0);
const total_amount = Number(quote.total_amount || 0);

// Display line items as table rows
const rows = items.length ? items.map(it => `
  <tr>
    <td>${it.description || it.item_name || ''}</td>
    <td style="text-align:right">${Number(it.quantity || it.qty || 0)}</td>
    <td style="text-align:right">${fmt(it.unit_price || it.rate)}</td>
    <td style="text-align:right">${fmt(it.total_price || (Number(it.quantity||0)*Number(it.unit_price||0)))}</td>
  </tr>`).join('') : ...
```

**What's Missing**:
- No check for `quote.pricing_model`
- No display of percentage-based pricing (27.5% × $5150.57 = $1,416.41)
- No display of flat rate, unit pricing, milestone, or recurring pricing models
- PDF always shows line-item table even when pricing model doesn't use line items

### 2. "Save & Download PDF" Does Nothing
**Problem**: Button says "Opened successfully" but no PDF appears.

**Root Cause**: The `QuotePDFService.openPrintable()` function opens a new window with the HTML, triggers print dialog, then closes the window after 800ms. This is designed for **printing**, not **downloading**.

**Current Code** (lines 125-140):
```javascript
async openPrintable(companyId, quoteId) {
  const { quote, items, customer } = await this.get(companyId, quoteId);
  const html = this.exportHtml(company, quote, items, customer);
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
    w.onload = () => {
      try { w.focus(); w.print(); } catch (e) {}
      setTimeout(() => { try { w.close(); } catch (e) {} }, 800);  // ❌ Closes window!
    };
  }
}
```

**What Happens**:
1. Opens new window
2. Writes HTML
3. Triggers print dialog
4. Closes window after 800ms
5. User sees "Opened successfully" but window closes before they can interact

**What Should Happen**:
- For "Download PDF": Generate actual PDF file and download it
- For "Print": Keep current behavior
- For "Preview": Open window but don't auto-close

### 3. Had to Click Job to Open Main Actions
**Problem**: PDF button not easily accessible from quote form.

**Current Behavior**: 
- In edit mode, there's a "Save & Download PDF" button
- But it doesn't work (issue #2)
- User had to go back to quotes list, click on the quote, then click PDF from the context drawer

**What's Needed**:
- Fix the "Save & Download PDF" button in edit mode
- Add a "Preview PDF" button that opens PDF in new tab without auto-closing
- Add a "Print" button for printing

## Fixes Needed

### Fix 1: PDF Should Respect Pricing Model

The PDF needs to display different content based on `pricing_model`:

**TIME_MATERIALS** (current):
```
Description          Qty    Rate      Line Total
Labor 1              8      $75.00    $600.00
Materials            10     $50.00    $500.00
                                      ----------
Subtotal                              $1,100.00
Tax                                   $90.75
Total Quote                           $1,190.75
```

**PERCENTAGE** (what you have):
```
Pricing Model: Percentage of Base Amount

Base Amount:                          $5,150.57
Percentage:                           27.5%
                                      ----------
Subtotal                              $1,416.41
Tax                                   $116.85
Total Quote                           $1,533.26
```

**FLAT_RATE**:
```
Pricing Model: Flat Rate

Flat Rate Amount:                     $2,500.00
                                      ----------
Subtotal                              $2,500.00
Tax                                   $206.25
Total Quote                           $2,706.25
```

**UNIT**:
```
Pricing Model: Unit Pricing

Units:                                25
Price per Unit:                       $150.00
                                      ----------
Subtotal                              $3,750.00
Tax                                   $309.38
Total Quote                           $4,059.38
```

**MILESTONE**:
```
Pricing Model: Milestone-Based

Milestone 1: Foundation           $5,000.00  (25%)
Milestone 2: Framing              $8,000.00  (40%)
Milestone 3: Finishing            $7,000.00  (35%)
                                  ----------
Subtotal                          $20,000.00
Tax                               $1,650.00
Total Quote                       $21,650.00
```

**RECURRING**:
```
Pricing Model: Recurring Service

Recurring Rate:                       $500.00 / month
Billing Frequency:                    Monthly
Contract Duration:                    12 months
                                      ----------
Monthly Amount                        $500.00
Tax                                   $41.25
Total Monthly                         $541.25

Total Contract Value                  $6,495.00
```

### Fix 2: Add Proper PDF Download

Need to add a real PDF download function that:
1. Generates HTML
2. Converts to PDF (using browser's print-to-PDF or a library)
3. Downloads the file
4. Doesn't auto-close the window

**Options**:
- **Option A**: Use `html2pdf.js` library (client-side PDF generation)
- **Option B**: Use browser's print-to-PDF with better UX (keep window open, add download button)
- **Option C**: Server-side PDF generation (Puppeteer, PDFKit, etc.)

### Fix 3: Add Multiple PDF Actions

Add 3 separate buttons:
1. **Preview PDF** - Opens in new tab, doesn't auto-close
2. **Download PDF** - Generates and downloads PDF file
3. **Print** - Opens print dialog (current behavior)

## Implementation Plan

1. **Update QuotePDFService.exportHtml()** to check `pricing_model` and render appropriate content
2. **Add `previewPDF()` function** that opens window without auto-closing
3. **Add `downloadPDF()` function** that generates and downloads PDF
4. **Keep `openPrintable()` for printing**
5. **Update QuoteBuilder buttons** to use correct functions

## Industry Standard

**ServiceTitan**:
- PDF respects pricing model (T&M, Flat Rate, etc.)
- Separate buttons for Preview, Download, Print, Email
- PDF includes company branding, terms, payment info

**Jobber**:
- PDF shows pricing model clearly
- Download button actually downloads
- Preview opens in new tab

**Housecall Pro**:
- PDF adapts to pricing type
- Download and email options
- Print button for physical copies

All competitors properly display the pricing model in the PDF and have working download functionality.

