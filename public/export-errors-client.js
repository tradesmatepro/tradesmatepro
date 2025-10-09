/**
 * Client-side Error Export Script
 * 
 * This script runs in the browser and exports captured errors to downloadable JSON files.
 * It can be run manually or automated.
 * 
 * Usage:
 *   1. Open browser console on /developer-tools page
 *   2. Run: exportAllErrors()
 *   3. Or run: startAutoExport() for continuous export
 */

(function() {
  'use strict';

  // Export all captured errors to a downloadable JSON file
  window.exportAllErrors = function() {
    console.log('📡 Exporting all captured errors...');
    
    const exportData = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      
      // Get data from various capture systems
      capturedErrors: window.capturedErrors || [],
      capturedWarnings: window.capturedWarnings || [],
      capturedLogs: window.capturedLogs || [],
      
      // Get data from console error detector if available
      consoleErrors: window.consoleErrorDetector ? window.consoleErrorDetector.errors : [],
      consoleWarnings: window.consoleErrorDetector ? window.consoleErrorDetector.warnings : [],
      consoleLogs: window.consoleErrorDetector ? window.consoleErrorDetector.logs : [],
      
      // Get data from enhanced capture if available
      enhancedLogs: window.__capturedLogs || [],
      
      // Summary
      summary: {
        totalErrors: (window.capturedErrors?.length || 0) + (window.consoleErrorDetector?.errors?.length || 0),
        totalWarnings: (window.capturedWarnings?.length || 0) + (window.consoleErrorDetector?.warnings?.length || 0),
        totalLogs: (window.capturedLogs?.length || 0) + (window.consoleErrorDetector?.logs?.length || 0)
      }
    };

    // Create and download the file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `errors_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Exported ${exportData.summary.totalErrors} errors, ${exportData.summary.totalWarnings} warnings, ${exportData.summary.totalLogs} logs`);
    return exportData;
  };

  // Start automatic export every X seconds
  window.startAutoExport = function(intervalSeconds = 30) {
    if (window.autoExportInterval) {
      clearInterval(window.autoExportInterval);
    }
    
    console.log(`🚀 Starting auto-export every ${intervalSeconds} seconds...`);
    
    window.autoExportInterval = setInterval(() => {
      const data = window.exportAllErrors();
      console.log(`🔄 Auto-exported at ${new Date().toISOString()}`);
    }, intervalSeconds * 1000);
    
    return window.autoExportInterval;
  };

  // Stop automatic export
  window.stopAutoExport = function() {
    if (window.autoExportInterval) {
      clearInterval(window.autoExportInterval);
      window.autoExportInterval = null;
      console.log('⏹️ Auto-export stopped');
    }
  };

  // Quick export function for immediate use
  window.quickExport = function() {
    return window.exportAllErrors();
  };

  console.log('📋 Error export functions loaded:');
  console.log('  - exportAllErrors() - Export all errors to file');
  console.log('  - startAutoExport(30) - Start auto-export every 30 seconds');
  console.log('  - stopAutoExport() - Stop auto-export');
  console.log('  - quickExport() - Quick export alias');

})();
