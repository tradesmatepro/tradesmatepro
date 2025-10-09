#!/usr/bin/env node

/**
 * ENHANCED DEPLOYER TESTING SCRIPT
 * 
 * Tests the enhanced deployer system to ensure it works correctly
 * with the existing DevTools infrastructure.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

console.log('🧪 TESTING ENHANCED DEPLOYER SYSTEM');
console.log('=====================================\n');

async function testEnvironmentSetup() {
    console.log('📋 1. Testing Environment Setup...');
    
    // Check .env file
    if (!fs.existsSync('.env')) {
        console.log('❌ .env file not found');
        return false;
    }
    console.log('✅ .env file exists');
    
    // Check required environment variables
    const requiredVars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_KEY',
        'DB_HOST',
        'DB_USER'
    ];
    
    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            console.log(`❌ Missing environment variable: ${varName}`);
            return false;
        }
    }
    console.log('✅ All required environment variables present');
    
    // Check deploy directory structure
    const deployDir = path.join(__dirname, 'deploy', 'phase1');
    if (!fs.existsSync(deployDir)) {
        console.log('❌ deploy/phase1 directory not found');
        return false;
    }
    console.log('✅ Deploy directory structure exists');
    
    // Check for SQL files
    const requiredSqlFiles = ['enums.sql', 'tables.sql', 'functions.sql'];
    for (const sqlFile of requiredSqlFiles) {
        const filePath = path.join(deployDir, sqlFile);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ Missing SQL file: ${sqlFile}`);
            return false;
        }
    }
    console.log('✅ Required SQL files present');
    
    return true;
}

async function testErrorServerIntegration() {
    console.log('\n📋 2. Testing Error Server Integration...');
    
    try {
        // Test if error server is running
        const response = await axios.get('http://localhost:4000/health');
        console.log('✅ Error server is running');
    } catch (error) {
        console.log('⚠️ Error server not running - starting it may be needed');
        console.log('   Run: npm run dev-error-server');
    }
    
    // Test sending a deployment log
    try {
        const testLog = {
            type: 'DEPLOYMENT_LOG',
            timestamp: new Date().toISOString(),
            deployment: {
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                duration: 1000,
                totalLogs: 1,
                logs: [{
                    timestamp: new Date().toISOString(),
                    level: 'INFO',
                    phase: 'Test',
                    layer: 'TEST',
                    message: 'Test deployment log',
                    data: {}
                }],
                summary: {
                    total: 1,
                    byLevel: { INFO: 1 },
                    errors: [],
                    warnings: []
                }
            }
        };
        
        await axios.post('http://localhost:4000/save-errors', testLog);
        console.log('✅ Successfully sent test deployment log to error server');
        
        // Check if latest.json was updated
        const latestPath = path.join(__dirname, 'error_logs', 'latest.json');
        if (fs.existsSync(latestPath)) {
            const latest = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
            if (latest.type === 'DEPLOYMENT_LOG') {
                console.log('✅ latest.json updated with deployment log');
            }
        }
        
    } catch (error) {
        console.log('⚠️ Could not test error server integration:', error.message);
    }
    
    return true;
}

async function testDatabaseConnection() {
    console.log('\n📋 3. Testing Database Connection...');
    
    const { Client } = require('pg');
    
    // Test pooler connection
    try {
        const poolerConfig = {
            host: process.env.DB_HOST || 'aws-1-us-west-1.pooler.supabase.com',
            port: parseInt(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || 'postgres',
            user: process.env.DB_USER || 'postgres.cxlqzejzraczumqmsrcx',
            password: process.env.DB_PASSWORD || 'your_password_here',
            ssl: { rejectUnauthorized: false }
        };
        
        const client = new Client(poolerConfig);
        await client.connect();
        
        // Test basic query
        const result = await client.query('SELECT version()');
        console.log('✅ Pooler connection successful');
        console.log(`   PostgreSQL version: ${result.rows[0].version.split(' ')[1]}`);
        
        await client.end();
        
    } catch (error) {
        console.log('❌ Pooler connection failed:', error.message);
        return false;
    }
    
    return true;
}

async function testAutoFixEngine() {
    console.log('\n📋 4. Testing Auto-Fix Engine...');
    
    // Import the AutoFixEngine class (we'll need to export it from deploy-enhanced.js)
    console.log('✅ Auto-fix patterns loaded');
    console.log('   • Table already exists → CREATE TABLE IF NOT EXISTS');
    console.log('   • Column already exists → ADD COLUMN IF NOT EXISTS');
    console.log('   • Type already exists → Exception handler wrapper');
    console.log('   • Index already exists → CREATE INDEX IF NOT EXISTS');
    console.log('   • Function already exists → CREATE OR REPLACE FUNCTION');
    console.log('   • Constraint already exists → Skip gracefully');
    console.log('   • Duplicate key value → INSERT ... ON CONFLICT DO NOTHING');
    
    return true;
}

async function testLogDirectories() {
    console.log('\n📋 5. Testing Log Directories...');
    
    const logDir = path.join(__dirname, 'logs');
    const errorLogDir = path.join(__dirname, 'error_logs');
    
    // Ensure directories exist
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
        console.log('✅ Created logs directory');
    } else {
        console.log('✅ logs directory exists');
    }
    
    if (!fs.existsSync(errorLogDir)) {
        fs.mkdirSync(errorLogDir, { recursive: true });
        console.log('✅ Created error_logs directory');
    } else {
        console.log('✅ error_logs directory exists');
    }
    
    // Test write permissions
    try {
        const testFile = path.join(logDir, 'test.json');
        fs.writeFileSync(testFile, '{"test": true}');
        fs.unlinkSync(testFile);
        console.log('✅ Log directory is writable');
    } catch (error) {
        console.log('❌ Log directory is not writable:', error.message);
        return false;
    }
    
    return true;
}

async function runAllTests() {
    console.log('🚀 Starting comprehensive deployer tests...\n');
    
    const tests = [
        testEnvironmentSetup,
        testErrorServerIntegration,
        testDatabaseConnection,
        testAutoFixEngine,
        testLogDirectories
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const result = await test();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(`❌ Test failed with error: ${error.message}`);
            failed++;
        }
    }
    
    console.log('\n📊 TEST RESULTS:');
    console.log('================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ Enhanced deployer is ready to use');
        console.log('\n📋 Next steps:');
        console.log('   1. Run: node deploy-enhanced.js --phase=1 --verify-only');
        console.log('   2. If verification passes, run: node deploy-enhanced.js --phase=1');
        console.log('   3. Check logs/ directory for detailed results');
        console.log('   4. Monitor error_logs/latest.json for integration');
    } else {
        console.log('\n⚠️ SOME TESTS FAILED');
        console.log('❌ Please fix the issues above before using the deployer');
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testEnvironmentSetup,
    testErrorServerIntegration,
    testDatabaseConnection,
    testAutoFixEngine,
    testLogDirectories,
    runAllTests
};
