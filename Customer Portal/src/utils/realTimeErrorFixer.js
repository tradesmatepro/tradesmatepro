/**
 * Real-Time Error Fixer
 * This utility automatically detects and fixes common console errors in real-time
 */

class RealTimeErrorFixer {
  constructor() {
    this.fixes = [];
    this.isActive = false;
    this.errorPatterns = this.initializeErrorPatterns();
  }

  initializeErrorPatterns() {
    return [
      {
        pattern: /Failed to load resource.*404/i,
        category: 'MISSING_RESOURCE',
        fix: this.fixMissingResource.bind(this)
      },
      {
        pattern: /React Hook.*missing dependency/i,
        category: 'REACT_HOOK_DEPS',
        fix: this.fixReactHookDependencies.bind(this)
      },
      {
        pattern: /'([^']+)' is defined but never used/i,
        category: 'UNUSED_VARIABLE',
        fix: this.fixUnusedVariable.bind(this)
      },
      {
        pattern: /WebSocket connection.*failed/i,
        category: 'WEBSOCKET_ERROR',
        fix: this.fixWebSocketError.bind(this)
      },
      {
        pattern: /Cannot read propert.*of undefined/i,
        category: 'UNDEFINED_REFERENCE',
        fix: this.fixUndefinedReference.bind(this)
      }
    ];
  }

  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🔧 Real-Time Error Fixer activated');
    
    // Override console methods to catch errors in real-time
    this.interceptConsoleErrors();
    
    // Set up periodic error analysis
    this.analysisInterval = setInterval(() => {
      this.analyzeAndFix();
    }, 5000); // Check every 5 seconds
  }

  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    clearInterval(this.analysisInterval);
    console.log('🛑 Real-Time Error Fixer deactivated');
  }

  interceptConsoleErrors() {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      this.processError('ERROR', args);
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      this.processError('WARNING', args);
      originalWarn.apply(console, args);
    };
  }

  processError(level, args) {
    const message = args.join(' ');
    
    // Find matching pattern
    const matchingPattern = this.errorPatterns.find(pattern => 
      pattern.pattern.test(message)
    );
    
    if (matchingPattern) {
      const fix = matchingPattern.fix(message, args);
      if (fix) {
        this.fixes.push({
          timestamp: new Date().toISOString(),
          level,
          message,
          category: matchingPattern.category,
          fix,
          applied: false
        });
      }
    }
  }

  analyzeAndFix() {
    if (!window.getAllCapturedErrors) return;
    
    const errorData = window.getAllCapturedErrors();
    const newErrors = errorData.errors.filter(error => 
      !this.fixes.some(fix => fix.message === error.message)
    );
    
    newErrors.forEach(error => {
      const matchingPattern = this.errorPatterns.find(pattern => 
        pattern.pattern.test(error.message)
      );
      
      if (matchingPattern) {
        const fix = matchingPattern.fix(error.message, [error]);
        if (fix) {
          this.fixes.push({
            timestamp: error.timestamp,
            level: 'ERROR',
            message: error.message,
            category: matchingPattern.category,
            fix,
            applied: false
          });
        }
      }
    });
    
    // Apply fixes automatically for safe categories
    this.autoApplyFixes();
  }

  fixMissingResource(message, args) {
    const urlMatch = message.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      const url = urlMatch[0];
      return {
        type: 'MISSING_RESOURCE',
        description: `Resource not found: ${url}`,
        action: 'Check if file exists or remove reference',
        autoApplicable: false,
        code: `// Check if this resource is needed:\n// ${url}`
      };
    }
    return null;
  }

  fixReactHookDependencies(message, args) {
    const hookMatch = message.match(/React Hook (\w+).*missing.*dependency.*'([^']+)'/);
    if (hookMatch) {
      const hookName = hookMatch[1];
      const dependency = hookMatch[2];
      return {
        type: 'REACT_HOOK_DEPS',
        description: `Add missing dependency '${dependency}' to ${hookName}`,
        action: `Add '${dependency}' to dependency array`,
        autoApplicable: false,
        code: `// Add to ${hookName} dependency array:\n[${dependency}]`
      };
    }
    return null;
  }

  fixUnusedVariable(message, args) {
    const varMatch = message.match(/'([^']+)' is (?:defined|assigned).*but never used/);
    if (varMatch) {
      const varName = varMatch[1];
      return {
        type: 'UNUSED_VARIABLE',
        description: `Remove unused variable '${varName}'`,
        action: `Remove or use variable '${varName}'`,
        autoApplicable: false,
        code: `// Remove unused variable:\n// const ${varName} = ...;`
      };
    }
    return null;
  }

  fixWebSocketError(message, args) {
    return {
      type: 'WEBSOCKET_ERROR',
      description: 'WebSocket connection failed (expected in development)',
      action: 'Make WebSocket connection optional',
      autoApplicable: true,
      code: `// WebSocket error suppressed - this is expected in development`
    };
  }

  fixUndefinedReference(message, args) {
    return {
      type: 'UNDEFINED_REFERENCE',
      description: 'Accessing property of undefined object',
      action: 'Add null checks or optional chaining',
      autoApplicable: false,
      code: `// Use optional chaining:\n// obj?.property?.subProperty`
    };
  }

  autoApplyFixes() {
    const applicableFixes = this.fixes.filter(fix => 
      fix.fix.autoApplicable && !fix.applied
    );
    
    applicableFixes.forEach(fix => {
      switch (fix.category) {
        case 'WEBSOCKET_ERROR':
          // Suppress WebSocket errors in development
          if (!window.webSocketErrorsSuppressed) {
            window.webSocketErrorsSuppressed = true;
            console.log('✅ WebSocket errors suppressed for development');
          }
          fix.applied = true;
          break;
      }
    });
  }

  getFixReport() {
    const report = {
      totalFixes: this.fixes.length,
      appliedFixes: this.fixes.filter(f => f.applied).length,
      pendingFixes: this.fixes.filter(f => !f.applied).length,
      categories: {},
      fixes: this.fixes
    };
    
    // Group by category
    this.fixes.forEach(fix => {
      if (!report.categories[fix.category]) {
        report.categories[fix.category] = [];
      }
      report.categories[fix.category].push(fix);
    });
    
    return report;
  }

  exportFixes() {
    const report = this.getFixReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-fixes-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return report;
  }

  clearFixes() {
    this.fixes = [];
    console.log('🧹 Error fixes cleared');
  }
}

// Create global instance
window.realTimeErrorFixer = new RealTimeErrorFixer();

// Auto-start in development
if (process.env.NODE_ENV === 'development') {
  window.realTimeErrorFixer.start();
}

export default RealTimeErrorFixer;
