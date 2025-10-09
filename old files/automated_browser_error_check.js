// Automated Browser Error Check - Run this in browser console
// This will systematically check each page and capture real errors

(function() {
  console.log('🔍 AUTOMATED BROWSER ERROR CHECK STARTING');
  console.log('This will check all pages for real 400 errors');
  console.log('='.repeat(60));

  // Error storage
  const pageErrors = {};
  let currentPage = '';

  // Override fetch to capture all network errors
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    
    try {
      const response = await originalFetch.apply(this, args);
      
      if (!response.ok) {
        const errorText = await response.clone().text();
        
        if (!pageErrors[currentPage]) pageErrors[currentPage] = [];
        pageErrors[currentPage].push({
          type: 'HTTP_ERROR',
          status: response.status,
          url: url,
          error: errorText,
          timestamp: new Date().toISOString()
        });
        
        console.log(`🚨 ${currentPage} - HTTP ${response.status} ERROR:`, url);
        console.log('   Error:', errorText);
      }
      
      return response;
    } catch (error) {
      if (!pageErrors[currentPage]) pageErrors[currentPage] = [];
      pageErrors[currentPage].push({
        type: 'NETWORK_ERROR',
        url: url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🚨 ${currentPage} - NETWORK ERROR:`, url, error.message);
      throw error;
    }
  };

  // Override console.error to capture console errors
  const originalError = console.error;
  console.error = function(...args) {
    const errorMsg = args.join(' ');
    
    if (currentPage && (errorMsg.includes('Error loading') || errorMsg.includes('Failed to') || errorMsg.includes('400'))) {
      if (!pageErrors[currentPage]) pageErrors[currentPage] = [];
      pageErrors[currentPage].push({
        type: 'CONSOLE_ERROR',
        message: errorMsg,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🚨 ${currentPage} - CONSOLE ERROR:`, errorMsg);
    }
    
    originalError.apply(console, args);
  };

  // Function to check a specific page
  async function checkPage(pageName, url) {
    return new Promise((resolve) => {
      console.log(`\n🔍 CHECKING ${pageName.toUpperCase()} PAGE`);
      console.log(`Navigating to: ${url}`);
      console.log('-'.repeat(50));
      
      currentPage = pageName;
      
      // Navigate to page
      window.location.href = url;
      
      // Wait for page to load and make all requests
      setTimeout(() => {
        const errors = pageErrors[pageName] || [];
        console.log(`📊 ${pageName} Results: ${errors.length} errors found`);
        
        if (errors.length > 0) {
          errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error.type}: ${error.error || error.message}`);
            if (error.url) console.log(`      URL: ${error.url}`);
          });
        } else {
          console.log(`   ✅ No errors found on ${pageName} page`);
        }
        
        resolve(errors);
      }, 5000); // Wait 5 seconds for page to fully load
    });
  }

  // Main function to check all pages
  async function checkAllPages() {
    const baseUrl = window.location.origin;
    
    const pagesToCheck = [
      { name: 'Customers', url: `${baseUrl}/customers` },
      { name: 'Quotes', url: `${baseUrl}/quotes` },
      { name: 'Invoices', url: `${baseUrl}/invoices` },
      { name: 'Sales Dashboard', url: `${baseUrl}/sales` },
      { name: 'Customer Dashboard', url: `${baseUrl}/customer-dashboard` }
    ];

    console.log('🎯 STARTING SYSTEMATIC PAGE CHECK');
    console.log(`Will check ${pagesToCheck.length} pages for real browser errors`);
    
    for (const page of pagesToCheck) {
      await checkPage(page.name, page.url);
      
      // Small delay between pages
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL SUMMARY - ALL PAGES CHECKED');
    console.log('='.repeat(80));

    let totalErrors = 0;
    const pagesWithErrors = [];

    for (const [pageName, errors] of Object.entries(pageErrors)) {
      totalErrors += errors.length;
      console.log(`${pageName}: ${errors.length} errors`);
      
      if (errors.length > 0) {
        pagesWithErrors.push(pageName);
      }
    }

    console.log(`\n🎯 OVERALL RESULTS:`);
    console.log(`   Total errors across all pages: ${totalErrors}`);
    console.log(`   Pages with errors: ${pagesWithErrors.length}/${pagesToCheck.length}`);

    if (pagesWithErrors.length > 0) {
      console.log(`\n❌ PAGES NEEDING FIXES:`);
      pagesWithErrors.forEach(page => {
        console.log(`   - ${page} (${pageErrors[page].length} errors)`);
      });
    } else {
      console.log(`\n🎉 ALL PAGES WORKING - NO ERRORS FOUND!`);
    }

    // Return results for further processing
    return pageErrors;
  }

  // Function to get detailed error report
  window.getDetailedErrorReport = function() {
    console.log('\n📋 DETAILED ERROR REPORT');
    console.log('='.repeat(60));

    for (const [pageName, errors] of Object.entries(pageErrors)) {
      if (errors.length > 0) {
        console.log(`\n🔧 ${pageName.toUpperCase()} ERRORS:`);
        errors.forEach((error, index) => {
          console.log(`\n   ${index + 1}. ${error.type}`);
          console.log(`      Time: ${error.timestamp}`);
          if (error.status) console.log(`      Status: ${error.status}`);
          if (error.url) console.log(`      URL: ${error.url}`);
          console.log(`      Error: ${error.error || error.message}`);
        });
      }
    }

    return pageErrors;
  };

  // Start the automated check
  console.log('✅ Automated Browser Error Check Ready!');
  console.log('📋 Available commands:');
  console.log('   checkAllPages() - Check all pages systematically');
  console.log('   getDetailedErrorReport() - Get detailed error breakdown');
  console.log('\n🚀 Starting automated check in 3 seconds...');

  setTimeout(() => {
    checkAllPages();
  }, 3000);

})();
