/**
 * Merge quote.html and customer-portal-new.html into unified customer portal
 * 
 * Strategy:
 * 1. Use customer-portal-new.html as base (has dashboard + living quote link system)
 * 2. Extract approval wizard from quote.html
 * 3. Extract deposit payment system from quote.html
 * 4. Extract scheduling widget from quote.html
 * 5. Merge all functionality into one file
 */

const fs = require('fs');

console.log('🔄 Merging portal files...\n');

// Read both files
const quoteHtml = fs.readFileSync('quote.html', 'utf8');
const portalHtml = fs.readFileSync('customer-portal-new.html', 'utf8');

console.log('✅ Read quote.html (' + quoteHtml.length + ' chars)');
console.log('✅ Read customer-portal-new.html (' + portalHtml.length + ' chars)\n');

// Extract key sections from quote.html
console.log('📦 Extracting sections from quote.html...');

// Extract SchedulingWidget class (lines ~1700-2000 in quote.html)
const schedulingWidgetMatch = quoteHtml.match(/class SchedulingWidget \{[\s\S]*?^\s{4}\}/m);
const schedulingWidget = schedulingWidgetMatch ? schedulingWidgetMatch[0] : '';

// Extract approval wizard functions
const approvalFunctionsStart = quoteHtml.indexOf('async function approveQuote()');
const approvalFunctionsEnd = quoteHtml.indexOf('// Load quote on page load', approvalFunctionsStart);
const approvalFunctions = quoteHtml.substring(approvalFunctionsStart, approvalFunctionsEnd);

console.log('  ✅ Extracted SchedulingWidget class (' + schedulingWidget.length + ' chars)');
console.log('  ✅ Extracted approval functions (' + approvalFunctions.length + ' chars)\n');

// Find insertion points in customer-portal-new.html
console.log('🔍 Finding insertion points...');

// Find where to insert approval wizard functions (before the closing </script>)
const scriptEnd = portalHtml.lastIndexOf('</script>');

// Build the merged content
console.log('🔨 Building merged portal...\n');

let mergedHtml = portalHtml;

// Insert approval wizard and scheduling widget before </script>
const insertionCode = `
    // =====================================================
    // APPROVAL WIZARD - Merged from quote.html
    // =====================================================

    ${schedulingWidget}

    ${approvalFunctions}

    // =====================================================
    // END APPROVAL WIZARD
    // =====================================================

  `;

mergedHtml = mergedHtml.substring(0, scriptEnd) + insertionCode + mergedHtml.substring(scriptEnd);

// Write the merged file
fs.writeFileSync('customer-portal-unified.html', mergedHtml);

console.log('✅ Created customer-portal-unified.html (' + mergedHtml.length + ' chars)');
console.log('\n🎉 Merge complete!');
console.log('\nNext steps:');
console.log('1. Review customer-portal-unified.html');
console.log('2. Test the approval wizard');
console.log('3. Replace customer-portal-new.html with unified version');

