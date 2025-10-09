/**
 * Script to extract console errors from the running TradeMate Pro application
 * This script can be run in the browser console to see captured errors
 */

// Function to extract and display all console errors
function extractConsoleErrors() {
    console.log('🔍 Extracting console errors from TradeMate Pro...');
    
    // Check if our capture system is working
    if (typeof window.capturedErrors !== 'undefined') {
        console.log(`✅ Found ${window.capturedErrors.length} captured errors`);
        console.log(`✅ Found ${window.capturedWarnings.length} captured warnings`);
        console.log(`✅ Found ${window.capturedLogs.length} captured logs`);
        
        // Display errors
        if (window.capturedErrors.length > 0) {
            console.log('\n📋 CAPTURED ERRORS:');
            window.capturedErrors.forEach((error, index) => {
                console.log(`\n${index + 1}. [${error.timestamp}] ${error.message}`);
                if (error.stack) {
                    console.log(`   Stack: ${error.stack.split('\n')[1]}`);
                }
            });
        }
        
        // Display warnings
        if (window.capturedWarnings.length > 0) {
            console.log('\n⚠️ CAPTURED WARNINGS:');
            window.capturedWarnings.forEach((warning, index) => {
                console.log(`\n${index + 1}. [${warning.timestamp}] ${warning.message}`);
            });
        }
        
        return {
            errors: window.capturedErrors,
            warnings: window.capturedWarnings,
            logs: window.capturedLogs
        };
    } else {
        console.log('❌ Console capture system not found!');
        return null;
    }
}

// Function to test if we can see the developer tools data
function testDeveloperToolsAccess() {
    console.log('🧪 Testing Developer Tools access...');
    
    // Try to access React DevTools data
    if (window.React) {
        console.log('✅ React is available');
    } else {
        console.log('❌ React not found in window');
    }
    
    // Check for our developer tools service
    if (window.devToolsLogger) {
        console.log('✅ DevToolsLogger found');
        console.log('Logs:', window.devToolsLogger.logs?.length || 0);
        console.log('Errors:', window.devToolsLogger.errors?.length || 0);
    } else {
        console.log('❌ DevToolsLogger not found');
    }
    
    // Check for console error detector
    if (window.consoleErrorDetector) {
        console.log('✅ ConsoleErrorDetector found');
    } else {
        console.log('❌ ConsoleErrorDetector not found');
    }
}

// Function to simulate the errors the user is seeing
function simulateUserErrors() {
    console.log('🎭 Simulating the errors the user reported...');
    
    // Simulate WebSocket errors
    console.error('❌ Remote debug connection error: [object Event]');
    console.warn('⚠️ Remote Debug Service failed to initialize: WebSocket connection failed to ws://localhost:8080/debug');
    console.info('🛠️ Developer tools initialized successfully');
    console.info('🔴 Remote debug connection closed');
    console.info('🔄 Scheduling reconnect attempt 1 in 1000ms');
    
    // Simulate more errors
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
}

// Function to get a comprehensive report
function getComprehensiveReport() {
    const report = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        captureSystemActive: !!window.capturedErrors,
        totalErrors: window.capturedErrors?.length || 0,
        totalWarnings: window.capturedWarnings?.length || 0,
        totalLogs: window.capturedLogs?.length || 0,
        devToolsActive: !!window.devToolsLogger,
        reactAvailable: !!window.React
    };
    
    console.log('📊 COMPREHENSIVE REPORT:');
    console.table(report);
    
    return report;
}

// Auto-run when script loads
console.log('🚀 Console Error Extraction Script Loaded');
console.log('📋 Available functions:');
console.log('  - extractConsoleErrors() - Extract all captured errors');
console.log('  - testDeveloperToolsAccess() - Test developer tools access');
console.log('  - simulateUserErrors() - Simulate the errors user reported');
console.log('  - getComprehensiveReport() - Get comprehensive report');

// Auto-extract errors
setTimeout(() => {
    extractConsoleErrors();
    testDeveloperToolsAccess();
    getComprehensiveReport();
}, 1000);
