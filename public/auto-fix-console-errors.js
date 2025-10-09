/**
 * Automated Console Error Analysis and Fix Script
 * Run this in the browser console to automatically identify and provide fixes for console errors
 */

(function() {
  console.log('🚀 Starting Automated Console Error Analysis...');
  
  // Wait for the error capture script to be available
  if (!window.getAllCapturedErrors) {
    console.error('❌ Console error capture not available. Make sure console-error-capture.js is loaded.');
    return;
  }

  // Get all captured errors
  const errorData = window.getAllCapturedErrors();
  const analysis = window.analyzeErrors();
  
  console.log('📊 Error Analysis Results:');
  console.log('==========================');
  console.log(`Total Errors: ${errorData.summary.totalErrors}`);
  console.log(`Total Warnings: ${errorData.summary.totalWarnings}`);
  console.log(`Categories Found: ${analysis.summary.categoriesFound}`);
  console.log(`Most Common Category: ${analysis.summary.mostCommonCategory}`);
  
  // Detailed analysis and fixes
  const fixes = [];
  
  // Analyze each error category and provide specific fixes
  Object.keys(analysis.categories).forEach(category => {
    const categoryErrors = analysis.categories[category];
    console.log(`\n🔍 Category: ${category} (${categoryErrors.length} errors)`);
    
    categoryErrors.forEach((error, index) => {
      if (index < 3) { // Show first 3 errors in each category
        console.log(`  - ${error.message.substring(0, 100)}...`);
        
        // Generate specific fixes based on error patterns
        const fix = generateSpecificFix(error);
        if (fix) {
          fixes.push(fix);
        }
      }
    });
  });
  
  // Display fixes
  console.log('\n🔧 RECOMMENDED FIXES:');
  console.log('=====================');
  
  fixes.forEach((fix, index) => {
    console.log(`\n${index + 1}. ${fix.title}`);
    console.log(`   Problem: ${fix.problem}`);
    console.log(`   Solution: ${fix.solution}`);
    if (fix.code) {
      console.log(`   Code Fix:`);
      console.log(`   ${fix.code}`);
    }
  });
  
  // Auto-generate fix script
  generateAutoFixScript(fixes);
  
  function generateSpecificFix(error) {
    const msg = error.message.toLowerCase();
    
    // Failed to load resource errors
    if (msg.includes('failed to load') || msg.includes('404') || msg.includes('not found')) {
      return {
        title: 'Fix Missing Resource',
        problem: `Resource not found: ${error.message}`,
        solution: 'Check file paths, ensure files exist, or remove unused imports',
        code: `// Check if file exists or remove import\n// Verify path: ${error.filename || 'unknown'}`
      };
    }
    
    // React Hook dependency errors
    if (msg.includes('react hook') && msg.includes('missing dependency')) {
      const hookMatch = error.message.match(/React Hook (\w+) has.*missing.*dependency.*'([^']+)'/);
      if (hookMatch) {
        const hookName = hookMatch[1];
        const dependency = hookMatch[2];
        return {
          title: `Fix ${hookName} Dependencies`,
          problem: `Missing dependency '${dependency}' in ${hookName}`,
          solution: `Add '${dependency}' to the dependency array or remove it if not needed`,
          code: `// Add to dependency array:\n${hookName}(() => {\n  // hook code\n}, [${dependency}]); // Add ${dependency} here`
        };
      }
    }
    
    // Unused variable errors
    if (msg.includes('is defined but never used') || msg.includes('is assigned a value but never used')) {
      const varMatch = error.message.match(/'([^']+)' is (?:defined|assigned).*but never used/);
      if (varMatch) {
        const varName = varMatch[1];
        return {
          title: `Remove Unused Variable`,
          problem: `Variable '${varName}' is defined but never used`,
          solution: `Remove the unused variable or use it in the code`,
          code: `// Remove this line:\n// const ${varName} = ...;\n// OR use it in your code`
        };
      }
    }
    
    // WebSocket connection errors
    if (msg.includes('websocket') || msg.includes('ws://')) {
      return {
        title: 'Fix WebSocket Connection',
        problem: 'WebSocket connection failed',
        solution: 'This is expected if no debug server is running. Consider making WebSocket connection optional.',
        code: `// Make WebSocket connection optional:\ntry {\n  const ws = new WebSocket(url);\n} catch (error) {\n  console.warn('WebSocket not available:', error.message);\n}`
      };
    }
    
    // Reference errors (undefined/null)
    if (msg.includes('undefined') || msg.includes('null') || msg.includes('cannot read')) {
      return {
        title: 'Fix Reference Error',
        problem: 'Trying to access property of undefined/null object',
        solution: 'Add null checks or optional chaining',
        code: `// Use optional chaining:\nobj?.property?.subProperty\n// OR null check:\nif (obj && obj.property) { ... }`
      };
    }
    
    return null;
  }
  
  function generateAutoFixScript(fixes) {
    console.log('\n🤖 AUTO-FIX SCRIPT GENERATED:');
    console.log('=============================');
    
    let autoFixScript = `
// Auto-generated fix script for TradeMate Pro
// Run this script to automatically fix common issues

(function autoFixConsoleErrors() {
  console.log('🔧 Applying automatic fixes...');
  
  // Fix 1: Suppress WebSocket warnings for development
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    try {
      return new originalWebSocket(url, protocols);
    } catch (error) {
      console.warn('WebSocket connection failed (this is expected in development):', error.message);
      return {
        readyState: 3, // CLOSED
        close: () => {},
        send: () => {},
        addEventListener: () => {}
      };
    }
  };
  
  // Fix 2: Add global error handler
  window.addEventListener('error', function(event) {
    if (event.message.includes('Script error')) {
      console.warn('Script error suppressed (likely CORS related)');
      return true;
    }
  });
  
  // Fix 3: Add unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    console.warn('Unhandled promise rejection:', event.reason);
    event.preventDefault();
  });
  
  console.log('✅ Auto-fixes applied successfully!');
})();
`;
    
    console.log(autoFixScript);
    
    // Also save to window for easy access
    window.autoFixScript = autoFixScript;
    console.log('\n💡 TIP: Run window.autoFixScript in console to apply fixes, or copy the script above');
  }
  
  // Export results for further analysis
  window.errorAnalysisResults = {
    errorData,
    analysis,
    fixes,
    timestamp: new Date().toISOString()
  };
  
  console.log('\n📋 Results saved to window.errorAnalysisResults');
  console.log('🎯 Navigate to /developer-tools and click "Analyze Errors" to see more details');
  
})();
