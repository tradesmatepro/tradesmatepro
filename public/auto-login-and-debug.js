/**
 * Auto-login and debug script
 * This script can be run in the browser console to automatically log in and access developer tools
 */

window.autoLoginAndDebug = async function() {
  console.log('🚀 Starting auto-login and debug process...');
  
  // First, check what errors we've captured so far
  console.log('\n=== CHECKING CAPTURED ERRORS ===');
  if (window.checkCapturedErrors) {
    window.checkCapturedErrors();
  } else {
    console.log('Error capture not available yet');
  }
  
  // Check if we're already logged in
  const currentPath = window.location.pathname;
  console.log(`Current path: ${currentPath}`);
  
  // Look for login form
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const loginForm = document.querySelector('form');
  
  if (emailInput && passwordInput && loginForm) {
    console.log('📝 Found login form, attempting to log in...');
    
    // Fill in the credentials
    emailInput.value = 'jeraldjsmith@gmail.com';
    passwordInput.value = 'Gizmo123';
    
    // Trigger change events
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('✅ Filled in credentials');
    
    // Submit the form
    loginForm.dispatchEvent(new Event('submit', { bubbles: true }));
    
    console.log('📤 Submitted login form');
    
    // Wait for login to complete
    setTimeout(() => {
      console.log('⏳ Waiting for login to complete...');
      
      // Check if we're now logged in by looking for dashboard elements
      setTimeout(() => {
        const currentPath = window.location.pathname;
        console.log(`New path after login: ${currentPath}`);
        
        // Try to navigate to developer tools
        if (currentPath !== '/developer-tools') {
          console.log('🔧 Navigating to developer tools...');
          window.location.href = '/developer-tools';
        } else {
          console.log('✅ Already on developer tools page');
          checkDeveloperToolsPage();
        }
      }, 3000);
    }, 1000);
    
  } else if (currentPath === '/developer-tools') {
    console.log('✅ Already on developer tools page');
    checkDeveloperToolsPage();
  } else {
    console.log('❌ Login form not found and not on developer tools page');
    console.log('Available inputs:', document.querySelectorAll('input'));
    console.log('Available forms:', document.querySelectorAll('form'));
  }
};

function checkDeveloperToolsPage() {
  console.log('\n=== CHECKING DEVELOPER TOOLS PAGE ===');
  
  // Look for developer tools elements
  const devToolsElements = document.querySelectorAll('[class*="developer"], [class*="debug"], [id*="developer"], [id*="debug"]');
  console.log(`Found ${devToolsElements.length} potential developer tools elements`);
  
  // Look for tabs
  const tabs = document.querySelectorAll('[role="tab"], .tab, [class*="tab"]');
  console.log(`Found ${tabs.length} potential tabs`);
  
  // Look for console logs display
  const logElements = document.querySelectorAll('[class*="log"], [class*="console"], [class*="error"]');
  console.log(`Found ${logElements.length} potential log display elements`);
  
  // Check if there's a logs tab or console tab
  const logsTab = Array.from(tabs).find(tab => 
    tab.textContent && (
      tab.textContent.toLowerCase().includes('log') ||
      tab.textContent.toLowerCase().includes('console') ||
      tab.textContent.toLowerCase().includes('error')
    )
  );
  
  if (logsTab) {
    console.log('🎯 Found logs tab, clicking it...');
    logsTab.click();
    
    setTimeout(() => {
      // Check for displayed errors
      const errorElements = document.querySelectorAll('[class*="error"], .text-red, [style*="color: red"]');
      console.log(`Found ${errorElements.length} potential error display elements`);
      
      errorElements.forEach((el, index) => {
        if (el.textContent && el.textContent.trim()) {
          console.log(`Error element ${index + 1}: ${el.textContent.trim()}`);
        }
      });
      
      // Also check our captured errors again
      if (window.checkCapturedErrors) {
        console.log('\n=== FINAL ERROR CHECK ===');
        const captured = window.checkCapturedErrors();
        
        if (captured.errors.length > 0) {
          console.log('\n🚨 SUMMARY OF CAPTURED ERRORS:');
          captured.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error.message}`);
          });
        }
      }
    }, 1000);
  } else {
    console.log('❌ Could not find logs tab');
    console.log('Available tab texts:', Array.from(tabs).map(tab => tab.textContent));
  }
}

// Auto-run when the script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('🔄 Auto-running login and debug script...');
      window.autoLoginAndDebug();
    }, 2000);
  });
} else {
  setTimeout(() => {
    console.log('🔄 Auto-running login and debug script...');
    window.autoLoginAndDebug();
  }, 2000);
}

console.log('📋 Auto-login script loaded. You can also run window.autoLoginAndDebug() manually.');
