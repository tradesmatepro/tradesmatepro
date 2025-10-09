/**
 * Debug Injection Script
 * This script can be pasted into the browser console to debug the TradeMate Pro app
 */

// Function to check console capture status
function checkConsoleCapture() {
    console.log('🔍 CONSOLE CAPTURE STATUS CHECK:');
    console.log('================================');
    
    // Check if capture arrays exist
    console.log('window.capturedErrors exists:', !!window.capturedErrors);
    console.log('window.capturedWarnings exists:', !!window.capturedWarnings);
    console.log('window.capturedLogs exists:', !!window.capturedLogs);
    
    // Show counts
    console.log('\n📊 COUNTS:');
    console.log('Captured Errors:', window.capturedErrors?.length || 0);
    console.log('Captured Warnings:', window.capturedWarnings?.length || 0);
    console.log('Captured Logs:', window.capturedLogs?.length || 0);
    
    // Show recent errors
    if (window.capturedErrors && window.capturedErrors.length > 0) {
        console.log('\n🚨 RECENT ERRORS (last 5):');
        window.capturedErrors.slice(-5).forEach((error, i) => {
            console.log(`${i+1}. [${error.timestamp}] ${error.message}`);
        });
    }
    
    // Show recent warnings
    if (window.capturedWarnings && window.capturedWarnings.length > 0) {
        console.log('\n⚠️ RECENT WARNINGS (last 5):');
        window.capturedWarnings.slice(-5).forEach((warning, i) => {
            console.log(`${i+1}. [${warning.timestamp}] ${warning.message}`);
        });
    }
    
    // Check for developer tools
    console.log('\n🛠️ DEVELOPER TOOLS STATUS:');
    console.log('devToolsLogger exists:', !!window.devToolsLogger);
    console.log('consoleErrorDetector exists:', !!window.consoleErrorDetector);
    console.log('testConsoleCapture exists:', !!window.testConsoleCapture);
    
    return {
        capturedErrors: window.capturedErrors?.length || 0,
        capturedWarnings: window.capturedWarnings?.length || 0,
        capturedLogs: window.capturedLogs?.length || 0,
        hasDevTools: !!window.devToolsLogger,
        hasDetector: !!window.consoleErrorDetector
    };
}

// Function to simulate the user's reported errors
function simulateReportedErrors() {
    console.log('🎭 SIMULATING USER REPORTED ERRORS:');
    console.log('==================================');
    
    // Simulate the exact errors the user reported
    console.error('❌ Remote debug connection error: [object Event]');
    console.warn('⚠️ Remote Debug Service failed to initialize: WebSocket connection failed to ws://localhost:8080/debug');
    console.info('🛠️ Developer tools initialized successfully');
    console.info('🔴 Remote debug connection closed');
    console.info('🔄 Scheduling reconnect attempt 1 in 1000ms');
    
    setTimeout(() => {
        console.error('❌ Remote debug connection error: [object Event]');
        console.warn('⚠️ Remote Debug Service failed to initialize: WebSocket connection failed to ws://localhost:8080/debug');
        console.info('🛠️ Developer tools initialized successfully');
        console.info('🔴 Remote debug connection closed');
        console.info('🔄 Scheduling reconnect attempt 2 in 2000ms');
    }, 1000);
    
    setTimeout(() => {
        console.info('✅ WebSocket errors suppressed for development');
    }, 1500);
    
    setTimeout(() => {
        console.error('❌ Remote debug connection error: [object Event]');
        console.info('🔴 Remote debug connection closed');
        console.info('🔄 Scheduling reconnect attempt 3 in 4000ms');
    }, 2000);
    
    console.log('✅ Simulated errors generated. Check capture status in 3 seconds...');
    setTimeout(checkConsoleCapture, 3000);
}

// Function to get all console data
function getAllConsoleData() {
    return {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        errors: window.capturedErrors || [],
        warnings: window.capturedWarnings || [],
        logs: window.capturedLogs || [],
        userAgent: navigator.userAgent
    };
}

// Function to export console data
function exportConsoleData() {
    const data = getAllConsoleData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('📁 Console data exported!');
}

// Function to monitor console in real-time
function startConsoleMonitor() {
    console.log('🔄 Starting real-time console monitor...');
    
    const monitor = setInterval(() => {
        const errorCount = window.capturedErrors?.length || 0;
        const warningCount = window.capturedWarnings?.length || 0;
        
        if (errorCount > 0 || warningCount > 0) {
            console.log(`📊 Console Status: ${errorCount} errors, ${warningCount} warnings`);
        }
    }, 5000);
    
    // Store monitor ID for stopping
    window.consoleMonitorId = monitor;
    
    console.log('✅ Console monitor started. Run stopConsoleMonitor() to stop.');
    return monitor;
}

// Function to stop console monitor
function stopConsoleMonitor() {
    if (window.consoleMonitorId) {
        clearInterval(window.consoleMonitorId);
        delete window.consoleMonitorId;
        console.log('⏹️ Console monitor stopped.');
    }
}

// Make functions available globally
window.checkConsoleCapture = checkConsoleCapture;
window.simulateReportedErrors = simulateReportedErrors;
window.getAllConsoleData = getAllConsoleData;
window.exportConsoleData = exportConsoleData;
window.startConsoleMonitor = startConsoleMonitor;
window.stopConsoleMonitor = stopConsoleMonitor;

// Auto-run check
console.log('🚀 DEBUG INJECTION SCRIPT LOADED');
console.log('📋 Available functions:');
console.log('  - checkConsoleCapture() - Check capture status');
console.log('  - simulateReportedErrors() - Simulate user errors');
console.log('  - getAllConsoleData() - Get all captured data');
console.log('  - exportConsoleData() - Export data to file');
console.log('  - startConsoleMonitor() - Start real-time monitoring');
console.log('  - stopConsoleMonitor() - Stop monitoring');

// Auto-check after 1 second
setTimeout(checkConsoleCapture, 1000);
