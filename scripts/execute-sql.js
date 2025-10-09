#!/usr/bin/env node

/**
 * Simple SQL Executor for TradeMate Pro
 * Execute SQL files directly against Supabase database
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'aws-1-us-west-1.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres.cxlqzejzraczumqmsrcx',
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
};

async function executeSqlFile(filePath) {
    const client = new Client(dbConfig);
    
    try {
        console.log(`🔌 Connecting to database...`);
        await client.connect();
        console.log(`✅ Connected successfully`);
        
        console.log(`📖 Reading SQL file: ${filePath}`);
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        
        console.log(`🔧 Executing SQL content...`);
        const result = await client.query(sqlContent);

        console.log(`✅ SQL executed successfully`);
        if (result.rowCount !== undefined) {
            console.log(`📊 Rows affected: ${result.rowCount}`);
        }

        // Print query results if any
        if (result.rows && result.rows.length > 0) {
            console.log(`\n📋 Query Results:`);
            console.log(JSON.stringify(result.rows, null, 2));
        }
        
    } catch (error) {
        console.error(`❌ Error executing SQL:`, error.message);
        if (error.position) {
            console.error(`📍 Error position: ${error.position}`);
        }
        process.exit(1);
    } finally {
        await client.end();
        console.log(`🔌 Database connection closed`);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`Usage: node execute-sql.js <sql-file-path>`);
        console.log(`Example: node execute-sql.js sql_fixes/create_missing_tables.sql`);
        process.exit(1);
    }
    
    const sqlFile = args[0];
    
    if (!fs.existsSync(sqlFile)) {
        console.error(`❌ SQL file not found: ${sqlFile}`);
        process.exit(1);
    }
    
    await executeSqlFile(sqlFile);
}

main().catch(console.error);
