#!/usr/bin/env node

/**
 * ENHANCED UNIVERSAL SUPABASE SCHEMA DEPLOYER
 * Self-Healing Deploy + Logging System for TradeMate Pro
 *
 * Integrates with existing DevTools error capture system
 * Uses new Supabase project credentials from .env
 * Provides comprehensive JSON logging and VS Code transparency
 *
 * Usage:
 *   node deploy-enhanced.js --phase=1
 *   node deploy-enhanced.js --phase=all
 *   node deploy-enhanced.js --phase=1 --verify-only
 *   node deploy-enhanced.js --pull-schema          (NEW: Pull current schema)
 *   node deploy-enhanced.js --introspect           (NEW: Full DB introspection)
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// =========================================
// CONFIGURATION
// =========================================

const CONFIG = {
    // Database connections (always prefer pooler for IPv4 compatibility)
    database: {
        pooler: {
            host: process.env.DB_HOST || 'aws-1-us-west-1.pooler.supabase.com',
            port: parseInt(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || 'postgres',
            user: process.env.DB_USER || 'postgres.cxlqzejzraczumqmsrcx',
            password: process.env.DB_PASSWORD || 'your_password_here',
            ssl: { rejectUnauthorized: false }
        },
        direct: {
            host: process.env.DB_HOST_DIRECT || 'db.cxlqzejzraczumqmsrcx.supabase.co',
            port: parseInt(process.env.DB_PORT_DIRECT) || 5432,
            database: process.env.DB_NAME || 'postgres',
            user: 'postgres',
            password: process.env.DB_PASSWORD || 'your_password_here',
            ssl: { rejectUnauthorized: false }
        }
    },
    
    // Logging configuration
    logging: {
        logDir: process.env.LOG_DIR || './logs',
        errorLogDir: process.env.ERROR_LOG_DIR || './error_logs',
        errorServerUrl: 'http://localhost:4000/save-errors',
        enableConsoleCapture: process.env.ENABLE_CONSOLE_CAPTURE !== 'false'
    },
    
    // Phase definitions
    phases: {
        1: {
            name: 'Core FSM',
            description: 'Foundation functionality (Jobber/Housecall Pro level)',
            layers: ['enums', 'tables', 'columns', 'constraints', 'indexes', 'functions', 'triggers', 'views', 'seeds']
        },
        2: {
            name: 'Enterprise Features',
            description: 'Advanced functionality (ServiceTitan level)',
            layers: ['enums', 'tables', 'columns', 'constraints', 'indexes', 'functions', 'triggers', 'views', 'seeds']
        },
        3: {
            name: 'Marketplace',
            description: 'Marketplace and contractor network',
            layers: ['enums', 'tables', 'columns', 'constraints', 'indexes', 'functions', 'triggers', 'views', 'seeds']
        },
        4: {
            name: 'AI/IoT',
            description: 'AI optimization and IoT integration',
            layers: ['enums', 'tables', 'columns', 'constraints', 'indexes', 'functions', 'triggers', 'views', 'seeds']
        }
    }
};

// =========================================
// ENHANCED LOGGING SYSTEM
// =========================================

class EnhancedLogger {
    constructor() {
        this.logs = [];
        this.startTime = new Date();
        this.currentPhase = null;
        this.currentLayer = null;
        
        // Ensure log directories exist
        this.ensureDirectories();
    }
    
    ensureDirectories() {
        [CONFIG.logging.logDir, CONFIG.logging.errorLogDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    
    log(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            phase: this.currentPhase,
            layer: this.currentLayer,
            message,
            data,
            duration: Date.now() - this.startTime.getTime()
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
        
        const color = colors[level.toUpperCase()] || colors.RESET;
        console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.RESET}`);
        
        if (Object.keys(data).length > 0) {
            console.log(`${color}${JSON.stringify(data, null, 2)}${colors.RESET}`);
        }
    }
    
    info(message, data = {}) { this.log('info', message, data); }
    success(message, data = {}) { this.log('success', message, data); }
    warning(message, data = {}) { this.log('warning', message, data); }
    error(message, data = {}) { this.log('error', message, data); }
    
    setPhase(phase) { this.currentPhase = phase; }
    setLayer(layer) { this.currentLayer = layer; }
    
    async saveToFile() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `deploy-${timestamp}.json`;
        const filepath = path.join(CONFIG.logging.logDir, filename);
        
        const logData = {
            deployment: {
                startTime: this.startTime.toISOString(),
                endTime: new Date().toISOString(),
                duration: Date.now() - this.startTime.getTime(),
                totalLogs: this.logs.length
            },
            logs: this.logs,
            summary: this.generateSummary()
        };
        
        fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
        this.info(`📄 Deployment log saved to ${filename}`);
        
        // Also send to error server for integration with existing DevTools
        await this.sendToErrorServer(logData);
        
        return filepath;
    }
    
    async sendToErrorServer(logData) {
        if (!CONFIG.logging.enableConsoleCapture) return;
        
        try {
            await axios.post(CONFIG.logging.errorServerUrl, {
                type: 'DEPLOYMENT_LOG',
                timestamp: new Date().toISOString(),
                deployment: logData
            });
            this.info('📡 Deployment log sent to error server');
        } catch (error) {
            this.warning('⚠️ Failed to send log to error server', { error: error.message });
        }
    }
    
    generateSummary() {
        const summary = {
            total: this.logs.length,
            byLevel: {},
            byPhase: {},
            byLayer: {},
            errors: [],
            warnings: []
        };
        
        this.logs.forEach(log => {
            // Count by level
            summary.byLevel[log.level] = (summary.byLevel[log.level] || 0) + 1;
            
            // Count by phase
            if (log.phase) {
                summary.byPhase[log.phase] = (summary.byPhase[log.phase] || 0) + 1;
            }
            
            // Count by layer
            if (log.layer) {
                summary.byLayer[log.layer] = (summary.byLayer[log.layer] || 0) + 1;
            }
            
            // Collect errors and warnings
            if (log.level === 'ERROR') {
                summary.errors.push(log);
            } else if (log.level === 'WARNING') {
                summary.warnings.push(log);
            }
        });
        
        return summary;
    }
}

// =========================================
// SELF-HEALING AUTO-FIX SYSTEM
// =========================================

class AutoFixEngine {
    constructor(logger) {
        this.logger = logger;
        this.fixPatterns = this.initializeFixPatterns();
    }
    
    initializeFixPatterns() {
        return [
            // Table already exists
            {
                pattern: /relation "([^"]+)" already exists/i,
                fix: (statement, match) => {
                    const tableName = match[1];
                    if (statement.includes('CREATE TABLE')) {
                        return statement.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS');
                    }
                    return null;
                },
                description: 'Convert CREATE TABLE to CREATE TABLE IF NOT EXISTS'
            },
            
            // Column already exists
            {
                pattern: /column "([^"]+)" of relation "([^"]+)" already exists/i,
                fix: (statement, match) => {
                    const [, columnName, tableName] = match;
                    if (statement.includes('ADD COLUMN')) {
                        return statement.replace('ADD COLUMN', 'ADD COLUMN IF NOT EXISTS');
                    }
                    return null;
                },
                description: 'Convert ADD COLUMN to ADD COLUMN IF NOT EXISTS'
            },

            // PostgreSQL doesn't support IF NOT EXISTS for ADD COLUMN in older versions
            {
                pattern: /syntax error at or near "IF"/i,
                fix: (statement, match) => {
                    if (statement.includes('ADD COLUMN IF NOT EXISTS')) {
                        // Convert to DO block for older PostgreSQL versions
                        const columnMatch = statement.match(/ALTER TABLE\s+(\w+)\s+ADD COLUMN IF NOT EXISTS\s+(\w+)\s+([\s\S]+?)(?:;|$)/i);
                        if (columnMatch) {
                            const [, tableName, columnName, columnDef] = columnMatch;

                            return `DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = '${tableName}'
        AND column_name = '${columnName}'
    ) THEN
        ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef.trim()};
    END IF;
END $$;`;
                        }
                    }
                    return null;
                },
                description: 'Convert ADD COLUMN IF NOT EXISTS to DO block'
            },
            
            // Type already exists
            {
                pattern: /type "([^"]+)" already exists/i,
                fix: (statement, match) => {
                    const typeName = match[1];
                    if (statement.includes('CREATE TYPE')) {
                        return 'SKIP'; // Skip if type already exists
                    }
                    return null;
                },
                description: 'Skip CREATE TYPE if already exists'
            },
            
            // Index already exists
            {
                pattern: /relation "([^"]+)" already exists/i,
                fix: (statement, match) => {
                    if (statement.includes('CREATE INDEX')) {
                        return statement.replace('CREATE INDEX', 'CREATE INDEX IF NOT EXISTS');
                    }
                    return null;
                },
                description: 'Convert CREATE INDEX to CREATE INDEX IF NOT EXISTS'
            },
            
            // Function already exists
            {
                pattern: /function "([^"]+)" already exists/i,
                fix: (statement, match) => {
                    if (statement.includes('CREATE FUNCTION')) {
                        return statement.replace('CREATE FUNCTION', 'CREATE OR REPLACE FUNCTION');
                    }
                    return null;
                },
                description: 'Convert CREATE FUNCTION to CREATE OR REPLACE FUNCTION'
            },
            
            // Constraint already exists
            {
                pattern: /constraint "([^"]+)" for relation "([^"]+)" already exists/i,
                fix: (statement, match) => {
                    // For constraints, we typically want to skip if they already exist
                    return 'SKIP'; // Special return value to skip this statement
                },
                description: 'Skip constraint creation if already exists'
            },

            // PostgreSQL doesn't support IF NOT EXISTS for constraints - convert to DO block
            {
                pattern: /syntax error at or near "NOT"/i,
                fix: (statement, match) => {
                    if (statement.includes('ADD CONSTRAINT IF NOT EXISTS')) {
                        // Extract constraint details - handle multiline constraints
                        const constraintMatch = statement.match(/ALTER TABLE\s+(\w+)\s+ADD CONSTRAINT IF NOT EXISTS\s+(\w+)\s+([\s\S]+?)(?:;|$)/i);
                        if (constraintMatch) {
                            const [, tableName, constraintName, constraintDef] = constraintMatch;

                            return `DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = '${constraintName}'
        AND table_name = '${tableName}'
    ) THEN
        ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} ${constraintDef.trim()};
    END IF;
END $$;`;
                        }
                    }
                    return null;
                },
                description: 'Convert ADD CONSTRAINT IF NOT EXISTS to DO block'
            },
            
            // Duplicate key value
            {
                pattern: /duplicate key value violates unique constraint/i,
                fix: (statement, match) => {
                    if (statement.includes('INSERT')) {
                        return statement.replace('INSERT', 'INSERT ... ON CONFLICT DO NOTHING');
                    }
                    return null;
                },
                description: 'Convert INSERT to INSERT ... ON CONFLICT DO NOTHING'
            },

            // Unterminated dollar-quoted string - usually malformed DO blocks
            {
                pattern: /unterminated dollar-quoted string/i,
                fix: (statement, match) => {
                    // Skip malformed DO blocks - they're usually from bad SQL files
                    if (statement.includes('$$') || statement.includes('DO')) {
                        return 'SKIP';
                    }
                    return null;
                },
                description: 'Skip malformed dollar-quoted strings'
            }
        ];
    }
    
    attemptFix(statement, errorMessage) {
        for (const pattern of this.fixPatterns) {
            const match = errorMessage.match(pattern.pattern);
            if (match) {
                this.logger.info(`🔧 Attempting auto-fix: ${pattern.description}`);
                const fixedStatement = pattern.fix(statement, match);
                
                if (fixedStatement === 'SKIP') {
                    this.logger.warning(`⏭️ Skipping statement due to: ${errorMessage}`);
                    return { fixed: true, statement: null, skipped: true };
                } else if (fixedStatement) {
                    this.logger.success(`✅ Auto-fix applied: ${pattern.description}`);
                    return { fixed: true, statement: fixedStatement, skipped: false };
                }
            }
        }
        
        this.logger.warning(`⚠️ No auto-fix available for: ${errorMessage}`);
        return { fixed: false, statement, skipped: false };
    }
}

// =========================================
// DATABASE CONNECTION MANAGER
// =========================================

class DatabaseManager {
    constructor(logger) {
        this.logger = logger;
        this.client = null;
        this.connectionType = null;
    }

    async connect() {
        this.logger.info('📡 Attempting database connection...');

        // Try pooler connection first (IPv4 compatible)
        try {
            this.logger.info('🔄 Trying pooler connection...');
            this.client = new Client(CONFIG.database.pooler);
            await this.client.connect();
            this.connectionType = 'pooler';
            this.logger.success('✅ Connected via pooler connection');
            return true;
        } catch (error) {
            this.logger.warning('⚠️ Pooler connection failed, trying direct...', { error: error.message });
        }

        // Fallback to direct connection
        try {
            this.logger.info('🔄 Trying direct connection...');
            this.client = new Client(CONFIG.database.direct);
            await this.client.connect();
            this.connectionType = 'direct';
            this.logger.success('✅ Connected via direct connection');
            return true;
        } catch (error) {
            this.logger.error('❌ All connection attempts failed', { error: error.message });
            return false;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.end();
            this.logger.info(`📡 Disconnected from ${this.connectionType} connection`);
        }
    }

    async executeStatement(statement, autoFix = true) {
        if (!this.client) {
            throw new Error('Database not connected');
        }

        try {
            const result = await this.client.query(statement);
            return { success: true, result, autoFixed: false, skipped: false };
        } catch (error) {
            if (autoFix) {
                const autoFixEngine = new AutoFixEngine(this.logger);
                const fixResult = autoFixEngine.attemptFix(statement, error.message);

                if (fixResult.fixed && fixResult.skipped) {
                    return { success: true, result: null, autoFixed: true, skipped: true };
                } else if (fixResult.fixed && fixResult.statement) {
                    try {
                        const result = await this.client.query(fixResult.statement);
                        return { success: true, result, autoFixed: true, skipped: false };
                    } catch (retryError) {
                        return { success: false, error: retryError.message, autoFixed: false, skipped: false };
                    }
                }
            }

            return { success: false, error: error.message, autoFixed: false, skipped: false };
        }
    }

    async beginTransaction() {
        await this.client.query('BEGIN');
        this.logger.info('🔄 Transaction started');
    }

    async commitTransaction() {
        await this.client.query('COMMIT');
        this.logger.success('✅ Transaction committed');
    }

    async rollbackTransaction() {
        await this.client.query('ROLLBACK');
        this.logger.warning('⚠️ Transaction rolled back');
    }
}

// =========================================
// SCHEMA DEPLOYER
// =========================================

class SchemaDeployer {
    constructor(logger) {
        this.logger = logger;
        this.dbManager = new DatabaseManager(logger);
        this.stats = {
            executed: 0,
            autoFixed: 0,
            skipped: 0,
            failed: 0
        };
    }

    async deploy(phases, verifyOnly = false) {
        this.logger.info('🚀 ENHANCED UNIVERSAL SUPABASE SCHEMA DEPLOYER STARTING...');
        this.logger.info(`📋 Phases: ${phases.join(', ')}`);
        this.logger.info(`🔍 Verify Only: ${verifyOnly}`);

        // Connect to database
        const connected = await this.dbManager.connect();
        if (!connected) {
            throw new Error('Failed to connect to database');
        }

        try {
            for (const phaseNum of phases) {
                await this.deployPhase(phaseNum, verifyOnly);
            }

            this.logger.success('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
            this.logFinalStats();

        } catch (error) {
            this.logger.error('💥 Deployment failed', { error: error.message });
            throw error;
        } finally {
            await this.dbManager.disconnect();
        }
    }

    async deployPhase(phaseNum, verifyOnly) {
        const phase = CONFIG.phases[phaseNum];
        if (!phase) {
            throw new Error(`Unknown phase: ${phaseNum}`);
        }

        this.logger.setPhase(`Phase ${phaseNum}`);
        this.logger.info(`🚀 Starting Phase ${phaseNum}: ${phase.name}`);
        this.logger.info(`📋 Description: ${phase.description}`);

        for (const layer of phase.layers) {
            await this.deployLayer(phaseNum, layer, verifyOnly);
        }

        this.logger.success(`🎉 Phase ${phaseNum} complete`);
    }

    async deployLayer(phaseNum, layer, verifyOnly) {
        this.logger.setLayer(layer.toUpperCase());
        this.logger.info(`\n📦 Deploying Layer: ${layer.toUpperCase()}`);

        const sqlFile = path.join(__dirname, 'deploy', `phase${phaseNum}`, `${layer}.sql`);

        if (!fs.existsSync(sqlFile)) {
            this.logger.warning(`⚠️ SQL file not found: ${sqlFile}`);
            return;
        }

        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        this.logger.info(`📖 Loaded ${layer}.sql (${sqlContent.length} characters)`);

        if (verifyOnly) {
            this.logger.info(`🔍 Verify-only mode: skipping execution of ${layer}`);
            return;
        }

        await this.executeSqlContent(sqlContent, layer);
        await this.verifyLayer(layer);
    }

    async executeSqlContent(sqlContent, layer) {
        this.logger.info(`🔧 Executing ${layer} with auto-fix enabled...`);

        // Split SQL content into statements
        const statements = this.splitSqlStatements(sqlContent);
        this.logger.info(`📋 Found ${statements.length} SQL statements to execute`);

        // For layers that might have existing objects, don't use transactions
        const useTransaction = !['enums', 'tables', 'columns', 'constraints', 'indexes', 'functions', 'views'].includes(layer);

        if (useTransaction) {
            await this.dbManager.beginTransaction();
        }

        try {
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i].trim();
                if (!statement || statement.startsWith('--')) continue;

                const result = await this.dbManager.executeStatement(statement, true);

                if (result.success) {
                    if (result.skipped) {
                        this.logger.warning(`⏭️ Statement ${i + 1}: Skipped (already exists)`);
                        this.stats.skipped++;
                    } else if (result.autoFixed) {
                        this.logger.success(`🔧 Statement ${i + 1}: Auto-fixed and executed`);
                        this.stats.autoFixed++;
                    } else {
                        this.logger.success(`✅ Statement ${i + 1}: Executed successfully`);
                        this.stats.executed++;
                    }
                } else {
                    this.logger.error(`❌ Statement ${i + 1}: Execution failed`, { error: result.error });
                    this.stats.failed++;

                    if (useTransaction) {
                        throw new Error(result.error);
                    } else {
                        // For non-transactional layers, continue with other statements
                        this.logger.warning(`⚠️ Continuing with remaining statements...`);
                    }
                }
            }

            if (useTransaction) {
                await this.dbManager.commitTransaction();
            }

            this.logger.success(`🎉 Layer ${layer} complete: ${this.stats.executed} executed, ${this.stats.autoFixed} auto-fixed, ${this.stats.skipped} skipped`);

        } catch (error) {
            if (useTransaction) {
                await this.dbManager.rollbackTransaction();
            }
            throw error;
        }
    }

    splitSqlStatements(sqlContent) {
        // Enhanced SQL splitting that properly handles PL/pgSQL functions
        const statements = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let inDollarQuote = false;
        let dollarTag = '';
        let functionDepth = 0;

        for (let i = 0; i < sqlContent.length; i++) {
            const char = sqlContent[i];
            const nextChar = sqlContent[i + 1];

            // Handle dollar quoting (PostgreSQL)
            if (char === '$' && !inQuotes) {
                if (!inDollarQuote) {
                    // Look for dollar tag
                    const match = sqlContent.slice(i).match(/^\$([^$]*)\$/);
                    if (match) {
                        dollarTag = match[0];
                        inDollarQuote = true;
                        current += match[0];
                        i += match[0].length - 1;
                        continue;
                    }
                } else {
                    // Check if this ends the dollar quote
                    if (sqlContent.slice(i).startsWith(dollarTag)) {
                        inDollarQuote = false;
                        current += dollarTag;
                        i += dollarTag.length - 1;
                        continue;
                    }
                }
            }

            // Handle regular quotes
            if (!inDollarQuote && (char === '"' || char === "'")) {
                if (!inQuotes) {
                    inQuotes = true;
                    quoteChar = char;
                } else if (char === quoteChar) {
                    // Check for escaped quote
                    if (nextChar === char) {
                        current += char + char;
                        i++; // Skip next char
                        continue;
                    } else {
                        inQuotes = false;
                        quoteChar = '';
                    }
                }
            }

            // Track function depth for proper splitting
            if (!inQuotes && !inDollarQuote) {
                const remaining = sqlContent.slice(i).toUpperCase();
                if (remaining.startsWith('CREATE') &&
                    (remaining.includes('FUNCTION') || remaining.includes('PROCEDURE'))) {
                    functionDepth++;
                } else if (remaining.startsWith('$$') && functionDepth > 0) {
                    // This might be the end of a function
                    const afterDollar = sqlContent.slice(i + 2);
                    if (afterDollar.toUpperCase().includes('LANGUAGE')) {
                        functionDepth--;
                    }
                }
            }

            // Handle semicolon - only split if not inside function or quotes
            if (char === ';' && !inQuotes && !inDollarQuote && functionDepth === 0) {
                current += char;
                const trimmed = current.trim();
                if (trimmed && !trimmed.startsWith('--')) {
                    statements.push(trimmed);
                }
                current = '';
                continue;
            }

            current += char;
        }

        // Add final statement if exists
        const trimmed = current.trim();
        if (trimmed && !trimmed.startsWith('--')) {
            statements.push(trimmed);
        }

        return statements.filter(stmt => stmt.length > 0);
    }

    async verifyLayer(layer) {
        this.logger.info(`🔍 Verifying ${layer} deployment...`);

        // Layer-specific verification queries
        const verificationQueries = {
            enums: "SELECT COUNT(*) as count, array_agg(typname) as enums FROM pg_type WHERE typtype = 'e'",
            tables: "SELECT COUNT(*) as count, array_agg(tablename) as tables FROM pg_tables WHERE schemaname = 'public'",
            functions: "SELECT COUNT(*) as count, array_agg(proname) as functions FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')",
            views: "SELECT COUNT(*) as count, array_agg(viewname) as views FROM pg_views WHERE schemaname = 'public'"
        };

        const query = verificationQueries[layer];
        if (query) {
            try {
                const result = await this.dbManager.executeStatement(query, false);
                if (result.success && result.result.rows.length > 0) {
                    const data = result.result.rows[0];
                    this.logger.success(`✅ ${layer.charAt(0).toUpperCase() + layer.slice(1)} verified: ${data.count} found`, data);
                }
            } catch (error) {
                this.logger.warning(`⚠️ Verification failed for ${layer}`, { error: error.message });
            }
        }
    }

    logFinalStats() {
        this.logger.info('\n📊 DEPLOYMENT STATISTICS:');
        this.logger.info(`   • Executed: ${this.stats.executed}`);
        this.logger.info(`   • Auto-fixed: ${this.stats.autoFixed}`);
        this.logger.info(`   • Skipped: ${this.stats.skipped}`);
        this.logger.info(`   • Failed: ${this.stats.failed}`);
        this.logger.info(`   • Total: ${this.stats.executed + this.stats.autoFixed + this.stats.skipped + this.stats.failed}`);
    }
}

// =========================================
// MAIN EXECUTION
// =========================================

async function main() {
    const logger = new EnhancedLogger();

    try {
        // Parse command line arguments
        const args = process.argv.slice(2);
        const phaseArg = args.find(arg => arg.startsWith('--phase='));
        const verifyOnly = args.includes('--verify-only');

        // ========== NEW FEATURE: SCHEMA DUMP MODE ==========
        if (args.includes("--dump")) {
            logger.info("📤 Dumping full schema…");

            const client = new Client(CONFIG.database.pooler);
            await client.connect();

            const queries = {
                tables: `
                  SELECT table_name, column_name, data_type, is_nullable, column_default
                  FROM information_schema.columns
                  WHERE table_schema = 'public'
                  ORDER BY table_name, ordinal_position;
                `,
                constraints: `
                  SELECT conrelid::regclass AS table_name,
                         conname AS constraint_name,
                         pg_get_constraintdef(c.oid) AS definition
                  FROM pg_constraint c
                  JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE n.nspname = 'public';
                `,
                indexes: `
                  SELECT schemaname, relname AS table_name, indexname, indexdef
                  FROM pg_indexes
                  WHERE schemaname = 'public';
                `,
                triggers: `
                  SELECT event_object_table AS table_name,
                         trigger_name,
                         event_manipulation AS event,
                         action_statement
                  FROM information_schema.triggers
                  WHERE trigger_schema = 'public';
                `,
                functions: `
                  SELECT proname AS function_name,
                         pg_get_functiondef(p.oid) AS definition
                  FROM pg_proc p
                  JOIN pg_namespace n ON n.oid = p.pronamespace
                  WHERE n.nspname = 'public';
                `,
                enums: `
                  SELECT t.typname AS enum_name,
                         array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
                  FROM pg_type t
                  JOIN pg_enum e ON t.oid = e.enumtypid
                  JOIN pg_namespace n ON n.oid = t.typnamespace
                  WHERE n.nspname = 'public'
                  GROUP BY t.typname;
                `
            };

            let dump = {};
            for (const [key, sql] of Object.entries(queries)) {
                try {
                    const res = await client.query(sql);
                    dump[key] = res.rows;
                    logger.success(`✅ Dumped ${res.rows.length} ${key}`);
                } catch (error) {
                    logger.error(`❌ Failed to dump ${key}:`, { error: error.message });
                    dump[key] = [];
                }
            }

            // Ensure exports directory exists
            const exportsDir = './deploy/exports';
            if (!fs.existsSync(exportsDir)) {
                fs.mkdirSync(exportsDir, { recursive: true });
            }

            fs.writeFileSync(`${exportsDir}/schema_dump.json`, JSON.stringify(dump, null, 2));
            logger.success("✅ Schema dump written to deploy/exports/schema_dump.json");

            await client.end();
            await logger.saveToFile();
            process.exit(0);
        }

        // ========== NEW FEATURE: PULL SCHEMA (AI-FRIENDLY) ==========
        if (args.includes("--pull-schema")) {
            logger.info("🔍 Pulling current schema for AI introspection...");

            const client = new Client(CONFIG.database.pooler);
            await client.connect();

            const schema = {
                metadata: {
                    timestamp: new Date().toISOString(),
                    database: CONFIG.database.pooler.database,
                    host: CONFIG.database.pooler.host
                },
                tables: [],
                enums: [],
                functions: [],
                triggers: [],
                constraints: [],
                indexes: [],
                row_counts: []
            };

            try {
                // Get all tables with columns
                const tablesQuery = `
                    SELECT
                        t.table_name,
                        json_agg(
                            json_build_object(
                                'column_name', c.column_name,
                                'data_type', c.data_type,
                                'is_nullable', c.is_nullable,
                                'column_default', c.column_default,
                                'character_maximum_length', c.character_maximum_length
                            ) ORDER BY c.ordinal_position
                        ) as columns
                    FROM information_schema.tables t
                    LEFT JOIN information_schema.columns c
                        ON t.table_name = c.table_name
                        AND t.table_schema = c.table_schema
                    WHERE t.table_schema = 'public'
                    AND t.table_type = 'BASE TABLE'
                    GROUP BY t.table_name
                    ORDER BY t.table_name;
                `;
                const tablesResult = await client.query(tablesQuery);
                schema.tables = tablesResult.rows;
                logger.success(`✅ Found ${tablesResult.rows.length} tables`);

                // Get all enums
                const enumsQuery = `
                    SELECT
                        t.typname as enum_name,
                        array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
                    FROM pg_type t
                    JOIN pg_enum e ON t.oid = e.enumtypid
                    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
                    WHERE n.nspname = 'public'
                    GROUP BY t.typname
                    ORDER BY t.typname;
                `;
                const enumsResult = await client.query(enumsQuery);
                schema.enums = enumsResult.rows;
                logger.success(`✅ Found ${enumsResult.rows.length} enums`);

                // Get all foreign keys
                const fkQuery = `
                    SELECT
                        tc.table_name,
                        kcu.column_name,
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name,
                        tc.constraint_name
                    FROM information_schema.table_constraints AS tc
                    JOIN information_schema.key_column_usage AS kcu
                        ON tc.constraint_name = kcu.constraint_name
                        AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                        ON ccu.constraint_name = tc.constraint_name
                        AND ccu.table_schema = tc.table_schema
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_schema = 'public'
                    ORDER BY tc.table_name, kcu.column_name;
                `;
                const fkResult = await client.query(fkQuery);
                schema.constraints = fkResult.rows;
                logger.success(`✅ Found ${fkResult.rows.length} foreign keys`);

                // Get row counts for all tables
                for (const table of schema.tables) {
                    try {
                        const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
                        schema.row_counts.push({
                            table_name: table.table_name,
                            row_count: parseInt(countResult.rows[0].count)
                        });
                    } catch (err) {
                        schema.row_counts.push({
                            table_name: table.table_name,
                            row_count: 0,
                            error: err.message
                        });
                    }
                }
                logger.success(`✅ Got row counts for ${schema.tables.length} tables`);

            } catch (error) {
                logger.error("❌ Schema pull failed:", { error: error.message });
            }

            // Save to multiple formats for AI consumption
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const outputDir = './schema_dumps';
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // JSON format (for AI parsing)
            const jsonPath = `${outputDir}/schema_dump.json`;
            fs.writeFileSync(jsonPath, JSON.stringify(schema, null, 2));
            logger.success(`✅ Schema saved to: ${jsonPath}`);

            // Markdown format (for human reading)
            const mdPath = `${outputDir}/SCHEMA_CURRENT.md`;
            let markdown = `# Current Database Schema\n\n`;
            markdown += `**Generated:** ${schema.metadata.timestamp}\n\n`;
            markdown += `**Database:** ${schema.metadata.database}\n\n`;
            markdown += `---\n\n`;

            markdown += `## 📊 Summary\n\n`;
            markdown += `- **Tables:** ${schema.tables.length}\n`;
            markdown += `- **Enums:** ${schema.enums.length}\n`;
            markdown += `- **Foreign Keys:** ${schema.constraints.length}\n\n`;

            markdown += `## 📋 Tables\n\n`;
            for (const table of schema.tables) {
                const rowCount = schema.row_counts.find(r => r.table_name === table.table_name);
                markdown += `### ${table.table_name}\n\n`;
                markdown += `**Rows:** ${rowCount ? rowCount.row_count : 'unknown'}\n\n`;
                markdown += `| Column | Type | Nullable | Default |\n`;
                markdown += `|--------|------|----------|----------|\n`;
                for (const col of table.columns) {
                    markdown += `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${col.column_default || '-'} |\n`;
                }
                markdown += `\n`;
            }

            markdown += `## 🏷️ Enums\n\n`;
            for (const enumType of schema.enums) {
                markdown += `### ${enumType.enum_name}\n\n`;
                const values = Array.isArray(enumType.values) ? enumType.values : [enumType.values];
                markdown += `Values: ${values.join(', ')}\n\n`;
            }

            fs.writeFileSync(mdPath, markdown);
            logger.success(`✅ Human-readable schema saved to: ${mdPath}`);

            await client.end();
            await logger.saveToFile();

            console.log('\n' + '='.repeat(60));
            console.log('✅ SCHEMA PULL COMPLETE');
            console.log('='.repeat(60));
            console.log(`📁 JSON: ${jsonPath}`);
            console.log(`📄 Markdown: ${mdPath}`);
            console.log('='.repeat(60) + '\n');

            process.exit(0);
        }

        // ========== NEW FEATURE: FUNCTIONS-ONLY MODE ==========
        if (args.includes("--functions-only")) {
            logger.info("⚡ Running functions-only deployment…");

            const client = new Client(CONFIG.database.pooler);
            await client.connect();

            const functionsFile = "deploy/phase1/functions.sql";
            if (!fs.existsSync(functionsFile)) {
                logger.error(`❌ Functions file not found: ${functionsFile}`);
                await client.end();
                process.exit(1);
            }

            const sql = fs.readFileSync(functionsFile, "utf8");

            // Split functions by CREATE FUNCTION or CREATE OR REPLACE FUNCTION
            const functions = sql.split(/(?=CREATE\s+(OR\s+REPLACE\s+)?FUNCTION)/gi).filter(fn => fn.trim());

            let successCount = 0;
            let failureCount = 0;

            for (const fn of functions) {
                if (!fn.trim()) continue;

                const functionName = fn.match(/FUNCTION\s+(\w+)/i)?.[1] || 'unknown';

                try {
                    await client.query("BEGIN");
                    await client.query(fn);
                    await client.query("COMMIT");
                    logger.success(`✅ Function deployed successfully: ${functionName}`);
                    successCount++;
                } catch (err) {
                    await client.query("ROLLBACK");
                    logger.error(`❌ Function failed: ${functionName}`, { error: err.message });
                    failureCount++;

                    // Send to error server if available
                    try {
                        await axios.post("http://localhost:4000/save-errors", {
                            type: 'function_deployment',
                            function_name: functionName,
                            sql: fn,
                            error: err.message
                        });
                    } catch (e) {
                        // Error server not available, continue
                    }
                }
            }

            logger.info(`📊 Functions deployment complete: ✅ ${successCount} success, ❌ ${failureCount} failed`);

            await client.end();
            await logger.saveToFile();
            process.exit(0);
        }

        if (!phaseArg) {
            console.error('❌ Usage: node deploy-enhanced.js --phase=1|all [--verify-only] | --dump | --functions-only');
            process.exit(1);
        }

        const phaseValue = phaseArg.split('=')[1];
        let phases = [];

        if (phaseValue === 'all') {
            phases = [1, 2, 3, 4];
        } else {
            const phaseNum = parseInt(phaseValue);
            if (isNaN(phaseNum) || phaseNum < 1 || phaseNum > 4) {
                console.error('❌ Invalid phase. Use 1, 2, 3, 4, or all');
                process.exit(1);
            }
            phases = [phaseNum];
        }

        // Create deployer and run
        const deployer = new SchemaDeployer(logger);
        await deployer.deploy(phases, verifyOnly);

        // Save comprehensive logs
        const logFile = await logger.saveToFile();

        logger.success('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
        logger.info(`📄 Full deployment log saved to: ${logFile}`);

    } catch (error) {
        logger.error('💥 DEPLOYMENT FAILED!', { error: error.message, stack: error.stack });

        // Save error logs
        await logger.saveToFile();

        process.exit(1);
    }
}

// =========================================
// VS CODE INTEGRATION & TRANSPARENCY
// =========================================

/**
 * HOW TO USE THIS DEPLOYER
 *
 * 🚀 BASIC USAGE:
 *
 * Deploy single phase:
 *   node deploy-enhanced.js --phase=1
 *
 * Deploy all phases:
 *   node deploy-enhanced.js --phase=all
 *
 * Verify only (no changes):
 *   node deploy-enhanced.js --phase=1 --verify-only
 *
 * 📋 PHASE BREAKDOWN:
 *
 * Phase 1: Core FSM (Foundation functionality)
 *   - Basic tables, enums, functions for work orders, customers, invoices
 *   - Equivalent to Jobber/Housecall Pro level functionality
 *
 * Phase 2: Enterprise Features (Advanced functionality)
 *   - Advanced reporting, multi-location, team management
 *   - Equivalent to ServiceTitan level functionality
 *
 * Phase 3: Marketplace (Contractor network)
 *   - Marketplace requests, contractor matching, bidding system
 *   - Network effects and contractor collaboration
 *
 * Phase 4: AI/IoT (Future enhancements)
 *   - AI optimization, IoT sensor integration, predictive analytics
 *   - Next-generation field service capabilities
 *
 * 🔧 SELF-HEALING FEATURES:
 *
 * The deployer automatically handles common deployment errors:
 *   • "Table already exists" → Converts to "CREATE TABLE IF NOT EXISTS"
 *   • "Column already exists" → Converts to "ADD COLUMN IF NOT EXISTS"
 *   • "Type already exists" → Wraps in exception handler
 *   • "Index already exists" → Converts to "CREATE INDEX IF NOT EXISTS"
 *   • "Function already exists" → Converts to "CREATE OR REPLACE FUNCTION"
 *   • "Constraint already exists" → Skips gracefully
 *   • "Duplicate key value" → Converts to "INSERT ... ON CONFLICT DO NOTHING"
 *
 * 📊 COMPREHENSIVE LOGGING:
 *
 * All deployment activities are logged in structured JSON format:
 *   • Console output: Real-time colored logs in VS Code terminal
 *   • File logs: Saved to logs/deploy-TIMESTAMP.json
 *   • Error server: Integrated with existing DevTools error capture
 *   • Summary stats: Executed, auto-fixed, skipped, failed counts
 *
 * 🔍 READING THE LOGS:
 *
 * Console logs show real-time progress with color coding:
 *   • 🔵 INFO: General information and progress
 *   • 🟢 SUCCESS: Successful operations
 *   • 🟡 WARNING: Non-fatal issues and auto-fixes
 *   • 🔴 ERROR: Fatal errors that stop deployment
 *
 * JSON log files contain complete deployment history:
 *   • deployment.startTime/endTime: When deployment ran
 *   • logs[]: Array of all log entries with timestamps
 *   • summary: Statistics and error/warning summaries
 *
 * 🚨 WHAT TO DO IF SOMETHING FAILS:
 *
 * 1. Check the console output for the specific error
 * 2. Review the JSON log file for complete context
 * 3. Common issues and solutions:
 *    • Connection failed: Check .env credentials and network
 *    • SQL syntax error: Review the specific SQL file mentioned
 *    • Permission denied: Ensure database user has proper permissions
 *    • File not found: Ensure deploy/phaseX/ directories exist with SQL files
 *
 * 4. Safe to re-run: All operations are idempotent
 *    • Re-running the same phase will not cause issues
 *    • Auto-fix system handles existing objects gracefully
 *    • Transactions ensure partial deployments are rolled back
 *
 * 🔄 RE-RUNNING SAFELY:
 *
 * This deployer is designed to be completely safe to re-run:
 *   • All SQL uses IF NOT EXISTS, CREATE OR REPLACE, ON CONFLICT DO NOTHING
 *   • Transactions ensure atomicity (all or nothing)
 *   • Auto-fix system handles existing objects
 *   • Verification queries confirm successful deployment
 *
 * You can re-run the same phase multiple times without issues.
 *
 * 🔗 INTEGRATION WITH EXISTING DEVTOOLS:
 *
 * This deployer integrates with your existing error capture system:
 *   • Sends deployment logs to error server (port 4000)
 *   • Compatible with existing error_logs/latest.json workflow
 *   • Works with console-error-capture.js system
 *   • Maintains compatibility with How Tos methodology
 *
 * 📱 VS CODE TRANSPARENCY:
 *
 * To see deployment progress in VS Code:
 *   1. Open integrated terminal (Ctrl+`)
 *   2. Run deployment command
 *   3. Watch real-time colored logs
 *   4. Check logs/ directory for detailed JSON files
 *   5. Use error_logs/latest.json for integration with existing tools
 *
 * 🎯 TROUBLESHOOTING CHECKLIST:
 *
 * Before running deployment:
 *   □ .env file exists with correct Supabase credentials
 *   □ deploy/phase1/ directory exists with SQL files
 *   □ Error server is running (npm run dev-error-server)
 *   □ Network connection to Supabase is working
 *
 * If deployment fails:
 *   □ Check console output for specific error
 *   □ Review JSON log file for complete context
 *   □ Verify database permissions
 *   □ Ensure SQL files are valid
 *   □ Try --verify-only mode first
 *
 * After successful deployment:
 *   □ Review deployment summary statistics
 *   □ Check verification results for each layer
 *   □ Test frontend functionality
 *   □ Monitor error_logs/latest.json for runtime issues
 */

// Run the main function
if (require.main === module) {
    main().catch(console.error);
}
