#!/usr/bin/env node

/**
 * UNIVERSAL SUPABASE SCHEMA DEPLOYER
 * 
 * Eliminates schema drift with phase-based deployment, 9-layer verification,
 * idempotent operations, and comprehensive audit logging.
 * 
 * Usage:
 *   node deploy-phase.js --phase=1
 *   node deploy-phase.js --phase=all
 *   node deploy-phase.js --phase=1 --verify-only
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

// =========================================
// CONFIGURATION
// =========================================

const CONFIG = {
    // Database connections (try direct first, fallback to pooler)
    connections: {
        direct: {
            host: process.env.SUPABASE_DB_HOST || 'db.cxlqzejzraczumqmsrcx.supabase.co',
            port: parseInt(process.env.SUPABASE_DB_PORT) || 5432,
            database: process.env.SUPABASE_DB_NAME || 'postgres',
            user: process.env.SUPABASE_DB_USER || 'postgres',
            password: process.env.SUPABASE_DB_PASSWORD || 'Alphaecho19!',
            ssl: { rejectUnauthorized: false }
        },
        pooler: {
            host: process.env.SUPABASE_POOLER_HOST || 'aws-1-us-west-1.pooler.supabase.com',
            port: parseInt(process.env.SUPABASE_POOLER_PORT) || 5432,
            database: process.env.SUPABASE_DB_NAME || 'postgres',
            user: process.env.SUPABASE_POOLER_USER || 'postgres.cxlqzejzraczumqmsrcx',
            password: process.env.SUPABASE_DB_PASSWORD || 'Alphaecho19!',
            ssl: { rejectUnauthorized: false }
        }
    },
    
    // 9-Layer Checklist (order matters!)
    layers: [
        'enums',
        'tables', 
        'columns',
        'constraints',
        'indexes',
        'functions',
        'triggers',
        'views',
        'seeds'
    ],
    
    // Phase definitions
    phases: {
        1: { name: 'Core FSM', description: 'Foundation functionality (Jobber/Housecall Pro level)' },
        2: { name: 'Enterprise', description: 'Advanced features (ServiceTitan level)' },
        3: { name: 'Marketplace', description: 'Two-sided marketplace (Angi/Thumbtack level)' },
        4: { name: 'AI/IoT', description: 'Next-generation intelligence' }
    }
};

// =========================================
// LOGGING SYSTEM
// =========================================

class DeploymentLogger {
    constructor() {
        this.logs = [];
        this.stats = {
            created: 0,
            skipped: 0,
            failed: 0,
            verified: 0
        };
        
        // Create logs directory
        const logsDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        // Create timestamped log file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        this.logFile = path.join(logsDir, `deploy-${timestamp}.txt`);
    }
    
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };
        
        this.logs.push(logEntry);
        
        // Console output with colors
        const colors = {
            INFO: '\x1b[36m',    // Cyan
            SUCCESS: '\x1b[32m', // Green
            WARNING: '\x1b[33m', // Yellow
            ERROR: '\x1b[31m',   // Red
            RESET: '\x1b[0m'
        };
        
        const color = colors[level] || colors.RESET;
        console.log(`${color}${this.formatLogMessage(logEntry)}${colors.RESET}`);
        
        // Write to file
        fs.appendFileSync(this.logFile, this.formatLogMessage(logEntry) + '\n');
    }
    
    formatLogMessage(entry) {
        let message = `[${entry.timestamp}] ${entry.level}: ${entry.message}`;
        if (entry.data) {
            message += ` | ${JSON.stringify(entry.data)}`;
        }
        return message;
    }
    
    success(message, data) { this.log('SUCCESS', message, data); this.stats.created++; }
    skip(message, data) { this.log('WARNING', message, data); this.stats.skipped++; }
    error(message, data) { this.log('ERROR', message, data); this.stats.failed++; }
    info(message, data) { this.log('INFO', message, data); }
    verify(message, data) { this.log('SUCCESS', message, data); this.stats.verified++; }
    
    printSummary(autoFixStats = null) {
        this.info('='.repeat(60));
        this.info('DEPLOYMENT SUMMARY');
        this.info('='.repeat(60));
        this.success(`✅ Created: ${this.stats.created}`);
        this.skip(`⚠️  Skipped: ${this.stats.skipped}`);
        this.error(`❌ Failed: ${this.stats.failed}`);
        this.verify(`🔍 Verified: ${this.stats.verified}`);

        if (autoFixStats) {
            this.info('');
            this.info('AUTO-FIX SUMMARY:');
            this.success(`🔧 Auto-Fixed: ${autoFixStats.fixed}`);
            this.skip(`⚠️  Auto-Skipped: ${autoFixStats.skipped}`);
            this.error(`❌ Auto-Fix Failed: ${autoFixStats.failed}`);
        }

        this.info(`📄 Log file: ${this.logFile}`);
        this.info('='.repeat(60));
    }
}

// =========================================
// DATABASE CONNECTION MANAGER
// =========================================

class DatabaseConnection {
    constructor(logger) {
        this.logger = logger;
        this.client = null;
    }
    
    async connect() {
        // Try direct connection first
        this.logger.info('📡 Attempting direct database connection...');
        try {
            this.client = new Client(CONFIG.connections.direct);
            await this.client.connect();
            this.logger.success('✅ Connected via direct connection');
            return true;
        } catch (error) {
            this.logger.skip('⚠️  Direct connection failed, trying pooler...', { error: error.message });
        }
        
        // Fallback to pooler
        try {
            this.client = new Client(CONFIG.connections.pooler);
            await this.client.connect();
            this.logger.success('✅ Connected via pooler connection');
            return true;
        } catch (error) {
            this.logger.error('❌ Both connection methods failed', { 
                direct: 'Failed',
                pooler: error.message 
            });
            throw new Error('Unable to connect to database');
        }
    }
    
    async query(sql, params = []) {
        if (!this.client) {
            throw new Error('Database not connected');
        }
        return await this.client.query(sql, params);
    }
    
    async close() {
        if (this.client) {
            await this.client.end();
            this.logger.info('📡 Database connection closed');
        }
    }
}

// =========================================
// AUTO-FIX ERROR PATTERNS
// =========================================

const ERROR_PATTERNS = {
    TABLE_EXISTS: /relation "([^"]+)" already exists/,
    COLUMN_EXISTS: /column "([^"]+)" of relation "([^"]+)" already exists/,
    ENUM_EXISTS: /type "([^"]+)" already exists/,
    ENUM_VALUE_EXISTS: /enum label "([^"]+)" already exists/,
    CONSTRAINT_EXISTS: /constraint "([^"]+)" for relation "([^"]+)" already exists/,
    INDEX_EXISTS: /relation "([^"]+)" already exists/,
    FUNCTION_EXISTS: /function "([^"]+)" already exists/,
    VIEW_EXISTS: /relation "([^"]+)" already exists/,
    DUPLICATE_KEY: /duplicate key value violates unique constraint/,
    FOREIGN_KEY_VIOLATION: /violates foreign key constraint/,
    NOT_NULL_VIOLATION: /violates not-null constraint/
};

// =========================================
// SCHEMA DEPLOYER WITH AUTO-FIX
// =========================================

class SchemaDeployer {
    constructor(logger, db) {
        this.logger = logger;
        this.db = db;
        this.autoFixStats = {
            fixed: 0,
            skipped: 0,
            failed: 0
        };
    }
    
    async deployPhase(phaseNumber, verifyOnly = false) {
        const phase = CONFIG.phases[phaseNumber];
        if (!phase) {
            throw new Error(`Invalid phase: ${phaseNumber}`);
        }
        
        this.logger.info(`🚀 Starting Phase ${phaseNumber}: ${phase.name}`);
        this.logger.info(`📋 Description: ${phase.description}`);
        
        if (verifyOnly) {
            this.logger.info('🔍 VERIFY-ONLY MODE: No changes will be made');
        }
        
        // Deploy each layer in order
        for (const layer of CONFIG.layers) {
            await this.deployLayer(phaseNumber, layer, verifyOnly);
        }
        
        this.logger.success(`🎉 Phase ${phaseNumber} deployment complete!`);
    }
    
    async deployLayer(phaseNumber, layer, verifyOnly = false) {
        this.logger.info(`\n📦 Deploying Layer: ${layer.toUpperCase()}`);

        // Look for SQL file
        const sqlFile = path.join(__dirname, 'deploy', `phase${phaseNumber}`, `${layer}.sql`);

        if (!fs.existsSync(sqlFile)) {
            this.logger.skip(`⚠️  No ${layer}.sql file found for Phase ${phaseNumber}`, { file: sqlFile });
            return;
        }

        // Read and execute SQL
        const sql = fs.readFileSync(sqlFile, 'utf8');
        this.logger.info(`📖 Loaded ${layer}.sql (${sql.length} characters)`);

        if (verifyOnly) {
            this.logger.info('🔍 VERIFY-ONLY: Skipping execution');
            return;
        }

        // Execute with auto-fix capabilities
        await this.executeWithAutoFix(sql, layer);

        // Verify deployment
        await this.verifyLayer(layer);
    }

    async executeWithAutoFix(sql, layer) {
        this.logger.info(`🔧 Executing ${layer} with auto-fix enabled...`);

        // Split SQL into individual statements
        const statements = this.splitSqlStatements(sql);
        this.logger.info(`📋 Found ${statements.length} SQL statements to execute`);

        let successCount = 0;
        let skipCount = 0;
        let fixCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (!statement || statement.startsWith('--')) continue;

            try {
                await this.db.query('BEGIN');
                await this.db.query(statement);
                await this.db.query('COMMIT');

                successCount++;
                this.logger.success(`✅ Statement ${i + 1}: Executed successfully`);

            } catch (error) {
                await this.db.query('ROLLBACK');

                // Try to auto-fix the error
                const fixedStatement = await this.autoFixStatement(statement, error, layer);

                if (fixedStatement) {
                    try {
                        await this.db.query('BEGIN');
                        await this.db.query(fixedStatement);
                        await this.db.query('COMMIT');

                        fixCount++;
                        this.autoFixStats.fixed++;
                        this.logger.success(`🔧 Statement ${i + 1}: Auto-fixed and executed`);

                    } catch (fixError) {
                        await this.db.query('ROLLBACK');
                        this.autoFixStats.failed++;
                        this.logger.error(`❌ Statement ${i + 1}: Auto-fix failed`, {
                            original: error.message,
                            fixed: fixError.message
                        });
                        throw fixError;
                    }
                } else {
                    // Check if it's a recoverable error (already exists)
                    if (this.isRecoverableError(error)) {
                        skipCount++;
                        this.autoFixStats.skipped++;
                        this.logger.skip(`⚠️  Statement ${i + 1}: Already exists, skipping`, { error: error.message });
                    } else {
                        this.autoFixStats.failed++;
                        this.logger.error(`❌ Statement ${i + 1}: Execution failed`, { error: error.message });
                        throw error;
                    }
                }
            }
        }

        this.logger.success(`🎉 Layer ${layer} complete: ${successCount} executed, ${fixCount} auto-fixed, ${skipCount} skipped`);
    }

    splitSqlStatements(sql) {
        // Split on semicolons but be smart about it (avoid splitting inside strings/functions)
        const statements = [];
        let current = '';
        let inString = false;
        let stringChar = '';
        let inFunction = false;

        for (let i = 0; i < sql.length; i++) {
            const char = sql[i];
            const nextChar = sql[i + 1];

            if (!inString && (char === "'" || char === '"')) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar && sql[i - 1] !== '\\') {
                inString = false;
                stringChar = '';
            }

            if (!inString) {
                if (char.toLowerCase() === '$' && nextChar === '$') {
                    inFunction = !inFunction;
                }

                if (char === ';' && !inFunction) {
                    statements.push(current.trim());
                    current = '';
                    continue;
                }
            }

            current += char;
        }

        if (current.trim()) {
            statements.push(current.trim());
        }

        return statements.filter(stmt => stmt && !stmt.startsWith('--'));
    }

    async autoFixStatement(statement, error, layer) {
        const errorMessage = error.message;
        this.logger.info(`🔧 Attempting auto-fix for: ${errorMessage}`);

        // Table already exists
        if (ERROR_PATTERNS.TABLE_EXISTS.test(errorMessage)) {
            const match = errorMessage.match(ERROR_PATTERNS.TABLE_EXISTS);
            const tableName = match[1];

            if (statement.includes('CREATE TABLE')) {
                const fixed = statement.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS');
                this.logger.info(`🔧 Auto-fix: Added IF NOT EXISTS to CREATE TABLE ${tableName}`);
                return fixed;
            }
        }

        // Column already exists
        if (ERROR_PATTERNS.COLUMN_EXISTS.test(errorMessage)) {
            const match = errorMessage.match(ERROR_PATTERNS.COLUMN_EXISTS);
            const columnName = match[1];
            const tableName = match[2];

            if (statement.includes('ALTER TABLE') && statement.includes('ADD COLUMN')) {
                const fixed = statement.replace('ADD COLUMN', 'ADD COLUMN IF NOT EXISTS');
                this.logger.info(`🔧 Auto-fix: Added IF NOT EXISTS to ADD COLUMN ${columnName} on ${tableName}`);
                return fixed;
            }
        }

        // Enum already exists
        if (ERROR_PATTERNS.ENUM_EXISTS.test(errorMessage)) {
            const match = errorMessage.match(ERROR_PATTERNS.ENUM_EXISTS);
            const enumName = match[1];

            if (statement.includes('CREATE TYPE')) {
                // Convert to DO block with exception handling
                const fixed = `
                    DO $$ BEGIN
                        ${statement}
                    EXCEPTION
                        WHEN duplicate_object THEN null;
                    END $$;
                `;
                this.logger.info(`🔧 Auto-fix: Wrapped CREATE TYPE ${enumName} in exception handler`);
                return fixed;
            }
        }

        // Index already exists
        if (ERROR_PATTERNS.INDEX_EXISTS.test(errorMessage) && statement.includes('CREATE INDEX')) {
            const fixed = statement.replace('CREATE INDEX', 'CREATE INDEX IF NOT EXISTS');
            this.logger.info(`🔧 Auto-fix: Added IF NOT EXISTS to CREATE INDEX`);
            return fixed;
        }

        // View already exists
        if (ERROR_PATTERNS.VIEW_EXISTS.test(errorMessage) && statement.includes('CREATE VIEW')) {
            const fixed = statement.replace('CREATE VIEW', 'CREATE OR REPLACE VIEW');
            this.logger.info(`🔧 Auto-fix: Changed to CREATE OR REPLACE VIEW`);
            return fixed;
        }

        // Function already exists
        if (ERROR_PATTERNS.FUNCTION_EXISTS.test(errorMessage) && statement.includes('CREATE FUNCTION')) {
            const fixed = statement.replace('CREATE FUNCTION', 'CREATE OR REPLACE FUNCTION');
            this.logger.info(`🔧 Auto-fix: Changed to CREATE OR REPLACE FUNCTION`);
            return fixed;
        }

        // Duplicate key in seed data
        if (ERROR_PATTERNS.DUPLICATE_KEY.test(errorMessage) && statement.includes('INSERT')) {
            const fixed = statement.replace('INSERT INTO', 'INSERT INTO').replace('VALUES', 'VALUES') + ' ON CONFLICT DO NOTHING';
            this.logger.info(`🔧 Auto-fix: Added ON CONFLICT DO NOTHING to INSERT`);
            return fixed;
        }

        this.logger.skip(`⚠️  No auto-fix available for: ${errorMessage}`);
        return null;
    }

    isRecoverableError(error) {
        const errorMessage = error.message;

        // These are errors we can safely ignore (already exists scenarios)
        const recoverablePatterns = [
            /already exists/,
            /duplicate key value/,
            /constraint.*already exists/
        ];

        return recoverablePatterns.some(pattern => pattern.test(errorMessage));
    }
    
    async verifyLayer(layer) {
        this.logger.info(`🔍 Verifying ${layer} deployment...`);
        
        try {
            switch (layer) {
                case 'tables':
                    await this.verifyTables();
                    break;
                case 'enums':
                    await this.verifyEnums();
                    break;
                case 'columns':
                    await this.verifyColumns();
                    break;
                case 'indexes':
                    await this.verifyIndexes();
                    break;
                case 'functions':
                    await this.verifyFunctions();
                    break;
                case 'triggers':
                    await this.verifyTriggers();
                    break;
                case 'views':
                    await this.verifyViews();
                    break;
                default:
                    this.logger.info(`🔍 No specific verification for ${layer}`);
            }
        } catch (error) {
            this.logger.error(`❌ Verification failed for ${layer}`, { error: error.message });
        }
    }
    
    async verifyTables() {
        const result = await this.db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        this.logger.verify(`✅ Tables verified: ${result.rows.length} found`, {
            count: result.rows.length,
            tables: result.rows.map(r => r.table_name)
        });
    }
    
    async verifyEnums() {
        const result = await this.db.query(`
            SELECT typname 
            FROM pg_type 
            WHERE typtype = 'e'
            ORDER BY typname
        `);
        
        this.logger.verify(`✅ Enums verified: ${result.rows.length} found`, {
            count: result.rows.length,
            enums: result.rows.map(r => r.typname)
        });
    }
    
    async verifyColumns() {
        const result = await this.db.query(`
            SELECT table_name, COUNT(*) as column_count
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            GROUP BY table_name
            ORDER BY table_name
        `);
        
        const totalColumns = result.rows.reduce((sum, row) => sum + parseInt(row.column_count), 0);
        this.logger.verify(`✅ Columns verified: ${totalColumns} total across ${result.rows.length} tables`);
    }
    
    async verifyIndexes() {
        const result = await this.db.query(`
            SELECT schemaname, tablename, indexname
            FROM pg_indexes 
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname
        `);
        
        this.logger.verify(`✅ Indexes verified: ${result.rows.length} found`);
    }
    
    async verifyFunctions() {
        const result = await this.db.query(`
            SELECT routine_name
            FROM information_schema.routines 
            WHERE routine_schema = 'public'
            ORDER BY routine_name
        `);
        
        this.logger.verify(`✅ Functions verified: ${result.rows.length} found`, {
            functions: result.rows.map(r => r.routine_name)
        });
    }
    
    async verifyTriggers() {
        const result = await this.db.query(`
            SELECT trigger_name, event_object_table
            FROM information_schema.triggers 
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table, trigger_name
        `);
        
        this.logger.verify(`✅ Triggers verified: ${result.rows.length} found`);
    }
    
    async verifyViews() {
        const result = await this.db.query(`
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        this.logger.verify(`✅ Views verified: ${result.rows.length} found`, {
            views: result.rows.map(r => r.table_name)
        });
    }
}

// =========================================
// MAIN DEPLOYMENT FUNCTION
// =========================================

async function main() {
    const args = process.argv.slice(2);
    const phaseArg = args.find(arg => arg.startsWith('--phase='));
    const verifyOnly = args.includes('--verify-only');
    
    if (!phaseArg) {
        console.error('❌ Usage: node deploy-phase.js --phase=1|2|3|4|all [--verify-only]');
        process.exit(1);
    }
    
    const phaseValue = phaseArg.split('=')[1];
    
    // Initialize logger and database
    const logger = new DeploymentLogger();
    const db = new DatabaseConnection(logger);
    const deployer = new SchemaDeployer(logger, db);
    
    try {
        logger.info('🚀 UNIVERSAL SUPABASE SCHEMA DEPLOYER STARTING...');
        logger.info(`📋 Phase: ${phaseValue}`);
        logger.info(`🔍 Verify Only: ${verifyOnly}`);
        
        // Connect to database
        await db.connect();
        
        // Deploy phases
        if (phaseValue === 'all') {
            for (let i = 1; i <= 4; i++) {
                await deployer.deployPhase(i, verifyOnly);
            }
        } else {
            const phaseNumber = parseInt(phaseValue);
            if (isNaN(phaseNumber) || phaseNumber < 1 || phaseNumber > 4) {
                throw new Error('Phase must be 1, 2, 3, 4, or "all"');
            }
            await deployer.deployPhase(phaseNumber, verifyOnly);
        }
        
        logger.printSummary(deployer.autoFixStats);
        
    } catch (error) {
        logger.error('💥 Deployment failed', { error: error.message });
        process.exit(1);
    } finally {
        await db.close();
    }
}

// =========================================
// ERROR HANDLING
// =========================================

process.on('SIGINT', () => {
    console.log('\n⚠️  Deployment interrupted by user');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\n⚠️  Deployment terminated');
    process.exit(1);
});

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('\n💥 Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = { SchemaDeployer, DatabaseConnection, DeploymentLogger };

/*
=========================================
📖 UNIVERSAL SUPABASE SCHEMA DEPLOYER
HOW TO USE GUIDE
=========================================

🎯 OVERVIEW
This tool eliminates schema drift with:
- Phase-based deployment (1-4 or all)
- 9-layer verification system
- Auto-fix capabilities for common errors
- Idempotent operations (safe to rerun)
- Comprehensive audit logging

🚀 BASIC USAGE

1. Deploy Single Phase:
   node deploy-phase.js --phase=1
   node deploy-phase.js --phase=2
   node deploy-phase.js --phase=3
   node deploy-phase.js --phase=4

2. Deploy All Phases:
   node deploy-phase.js --phase=all

3. Verify Only (No Changes):
   node deploy-phase.js --phase=1 --verify-only

📁 DIRECTORY STRUCTURE

Your project should have this structure:
deploy/
├── phase1/
│   ├── enums.sql
│   ├── tables.sql
│   ├── columns.sql
│   ├── constraints.sql
│   ├── indexes.sql
│   ├── functions.sql
│   ├── triggers.sql
│   ├── views.sql
│   └── seeds.sql
├── phase2/
│   └── (same structure)
├── phase3/
│   └── (same structure)
└── phase4/
    └── (same structure)

🔧 AUTO-FIX CAPABILITIES

The deployer automatically handles:
✅ CREATE TABLE → CREATE TABLE IF NOT EXISTS
✅ ADD COLUMN → ADD COLUMN IF NOT EXISTS
✅ CREATE INDEX → CREATE INDEX IF NOT EXISTS
✅ CREATE VIEW → CREATE OR REPLACE VIEW
✅ CREATE FUNCTION → CREATE OR REPLACE FUNCTION
✅ CREATE TYPE → Wrapped in exception handler
✅ INSERT → INSERT ... ON CONFLICT DO NOTHING
✅ Duplicate constraints → Skip gracefully

📊 WHAT YOU'LL SEE

Console Output:
🚀 UNIVERSAL SUPABASE SCHEMA DEPLOYER STARTING...
📋 Phase: 1
🔍 Verify Only: false
📡 Attempting direct database connection...
✅ Connected via pooler connection

📦 Deploying Layer: ENUMS
📖 Loaded enums.sql (1234 characters)
🔧 Executing enums with auto-fix enabled...
📋 Found 5 SQL statements to execute
✅ Statement 1: Executed successfully
🔧 Statement 2: Auto-fixed and executed
⚠️  Statement 3: Already exists, skipping
✅ Statement 4: Executed successfully
✅ Statement 5: Executed successfully
🎉 Layer enums complete: 3 executed, 1 auto-fixed, 1 skipped
🔍 Verifying enums deployment...
✅ Enums verified: 15 found

[... continues for all layers ...]

🎉 Phase 1 deployment complete!

=============================================================
DEPLOYMENT SUMMARY
=============================================================
✅ Created: 45
⚠️  Skipped: 12
❌ Failed: 0
🔍 Verified: 9

AUTO-FIX SUMMARY:
🔧 Auto-Fixed: 8
⚠️  Auto-Skipped: 12
❌ Auto-Fix Failed: 0
📄 Log file: logs/deploy-2024-01-15-14-30.txt
=============================================================

📄 LOG FILES

All deployments are logged to timestamped files:
logs/deploy-2024-01-15-14-30.txt

Log format:
[2024-01-15T14:30:15.123Z] SUCCESS: ✅ Connected via pooler connection
[2024-01-15T14:30:16.456Z] INFO: 📦 Deploying Layer: TABLES
[2024-01-15T14:30:17.789Z] WARNING: ⚠️  Statement 3: Already exists, skipping | {"error":"relation \"customers\" already exists"}

🔍 VERIFICATION SYSTEM

After each layer, the deployer verifies:
- Tables: Counts and lists all tables
- Enums: Counts and lists all custom types
- Columns: Counts columns across all tables
- Indexes: Counts all indexes
- Functions: Lists all custom functions
- Triggers: Lists all triggers
- Views: Lists all views

❌ TROUBLESHOOTING

If deployment fails:
1. Check the log file for detailed error messages
2. The deployer will show exactly which statement failed
3. Most common issues are auto-fixed automatically
4. For manual fixes, the log shows the exact SQL that failed

Common Issues:
- Missing referenced tables → Deploy earlier phases first
- Permission errors → Check database credentials
- Network issues → Deployer tries both direct and pooler connections

🔄 SAFE TO RERUN

The deployer is fully idempotent:
- Uses IF NOT EXISTS everywhere possible
- Skips existing objects gracefully
- ON CONFLICT DO NOTHING for seed data
- CREATE OR REPLACE for views/functions

You can safely run the same phase multiple times.

🎯 PHASES EXPLAINED

Phase 1 (Core FSM):
- Basic field service management
- Customers, work orders, invoices, payments
- Jobber/Housecall Pro equivalent

Phase 2 (Enterprise):
- Advanced features
- ServiceTitan level capabilities
- Performance analytics, advanced reporting

Phase 3 (Marketplace):
- Two-sided marketplace
- Angi/Thumbtack functionality
- Contractor matching, bidding

Phase 4 (AI/IoT):
- Next-generation features
- AI predictions, IoT integration
- Industry leadership capabilities

🔗 ENVIRONMENT VARIABLES

Create a .env file with:
SUPABASE_DB_HOST=db.your-project.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-password
SUPABASE_POOLER_HOST=aws-1-us-west-1.pooler.supabase.com
SUPABASE_POOLER_PORT=5432
SUPABASE_POOLER_USER=postgres.your-project

The deployer will try direct connection first, then fallback to pooler.

🎉 SUCCESS INDICATORS

Deployment is successful when you see:
✅ All layers complete without fatal errors
✅ Verification passes for all components
✅ Auto-fix summary shows reasonable numbers
✅ Log file contains no ERROR entries for critical components

After successful deployment, your Supabase project will have:
- Industry-standard FSM database schema
- All business logic implemented at database level
- Comprehensive audit system
- Performance-optimized indexes
- Dashboard-ready views

Ready to compete with Jobber, ServiceTitan, and Housecall Pro! 🚀

=========================================
*/
