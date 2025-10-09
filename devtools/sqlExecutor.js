/**
 * SQL Executor
 * 
 * Executes SQL queries against Supabase database
 * Requires explicit approval for safety
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SQL_LOGS_DIR = path.join(__dirname, '../sql_logs');

// Ensure SQL logs directory exists
if (!fs.existsSync(SQL_LOGS_DIR)) {
  fs.mkdirSync(SQL_LOGS_DIR, { recursive: true });
}

// Database connection details
const DB_CONFIG = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlqzejzraczumqmsrcx',
  password: 'Alphaecho19!'
};

/**
 * Execute SQL query
 */
async function executeSQL(params = {}) {
  const { sql, approved, readOnly } = params;
  
  // Safety checks
  if (!sql) {
    return {
      status: 'error',
      message: 'No SQL query provided'
    };
  }
  
  if (!approved) {
    return {
      status: 'requires_approval',
      message: 'SQL execution requires explicit approval. Add "approved": true to params.',
      sql,
      warning: 'This will execute against the production database!'
    };
  }
  
  // Check if query is read-only
  const sqlUpper = sql.trim().toUpperCase();
  const isReadOnly = sqlUpper.startsWith('SELECT') || 
                     sqlUpper.startsWith('SHOW') || 
                     sqlUpper.startsWith('DESCRIBE') ||
                     sqlUpper.startsWith('EXPLAIN');
  
  if (!isReadOnly && !readOnly === false) {
    return {
      status: 'requires_write_approval',
      message: 'This appears to be a write operation (INSERT/UPDATE/DELETE). Add "readOnly": false to confirm.',
      sql,
      warning: 'Write operations can modify or delete data!'
    };
  }
  
  // Log the query
  const logEntry = {
    timestamp: new Date().toISOString(),
    sql,
    approved,
    readOnly: isReadOnly
  };
  
  const logPath = path.join(SQL_LOGS_DIR, `sql_${Date.now()}.json`);
  fs.writeFileSync(logPath, JSON.stringify(logEntry, null, 2));
  
  // Execute query
  return new Promise((resolve) => {
    const command = `$env:PGPASSWORD='${DB_CONFIG.password}'; psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -d ${DB_CONFIG.database} -U ${DB_CONFIG.user} -c "${sql.replace(/"/g, '\\"')}"`;
    
    exec(command, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          status: 'error',
          message: error.message,
          stderr,
          sql
        });
        return;
      }
      
      resolve({
        status: 'success',
        result: stdout,
        sql,
        timestamp: new Date().toISOString()
      });
    });
  });
}

/**
 * Execute SQL file
 */
async function executeSQLFile(params = {}) {
  const { filePath, approved } = params;
  
  if (!approved) {
    return {
      status: 'requires_approval',
      message: 'SQL file execution requires explicit approval.',
      filePath
    };
  }
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    return await executeSQL({ sql, approved: true, readOnly: false });
  } catch (err) {
    return {
      status: 'error',
      message: `Failed to read SQL file: ${err.message}`,
      filePath
    };
  }
}

/**
 * Get database schema
 */
async function getDatabaseSchema(params = {}) {
  const table = params.table;
  
  let sql;
  if (table) {
    sql = `SELECT column_name, data_type, is_nullable, column_default 
           FROM information_schema.columns 
           WHERE table_name = '${table}' 
           ORDER BY ordinal_position;`;
  } else {
    sql = `SELECT table_name 
           FROM information_schema.tables 
           WHERE table_schema = 'public' 
           ORDER BY table_name;`;
  }
  
  return await executeSQL({ sql, approved: true, readOnly: true });
}

/**
 * Get table row count
 */
async function getTableRowCount(params = {}) {
  const { table } = params;
  
  if (!table) {
    return {
      status: 'error',
      message: 'Table name required'
    };
  }
  
  const sql = `SELECT COUNT(*) FROM ${table};`;
  return await executeSQL({ sql, approved: true, readOnly: true });
}

/**
 * Get recent records
 */
async function getRecentRecords(params = {}) {
  const { table, limit = 10, orderBy = 'created_at' } = params;
  
  if (!table) {
    return {
      status: 'error',
      message: 'Table name required'
    };
  }
  
  const sql = `SELECT * FROM ${table} ORDER BY ${orderBy} DESC LIMIT ${limit};`;
  return await executeSQL({ sql, approved: true, readOnly: true });
}

module.exports = {
  executeSQL,
  executeSQLFile,
  getDatabaseSchema,
  getTableRowCount,
  getRecentRecords
};

