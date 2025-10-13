const fs = require('fs');
const path = require('path');

console.log('🔐 TradeMate Pro Security Audit\n');

// 1. Extract unique table names from schema
console.log('📊 Analyzing database schema...');
const schemaPath = path.join(__dirname, '../Supabase Schema/latest.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const tables = [...new Set(schema.tables.map(t => t.table_name))].sort();
console.log(`Found ${tables.length} tables:\n`);
tables.forEach(t => console.log(`  - ${t}`));

// 2. Scan for hardcoded API keys in source code
console.log('\n🔍 Scanning for hardcoded API keys...\n');

const srcDir = path.join(__dirname, '../src');
const findings = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for JWT tokens
    if (line.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
      findings.push({
        file: filePath.replace(srcDir, 'src'),
        line: index + 1,
        type: 'JWT Token',
        severity: 'CRITICAL',
        content: line.trim().substring(0, 100) + '...'
      });
    }
    
    // Check for service role key patterns
    if (line.includes('service_role') || line.includes('SERVICE_KEY')) {
      findings.push({
        file: filePath.replace(srcDir, 'src'),
        line: index + 1,
        type: 'Service Key Reference',
        severity: 'HIGH',
        content: line.trim().substring(0, 100)
      });
    }
    
    // Check for hardcoded URLs
    if (line.includes('supabase.co') && !line.includes('process.env')) {
      findings.push({
        file: filePath.replace(srcDir, 'src'),
        line: index + 1,
        type: 'Hardcoded URL',
        severity: 'MEDIUM',
        content: line.trim().substring(0, 100)
      });
    }
    
    // Check for API keys
    if (/['"](re_[a-zA-Z0-9]{32,}|sk_[a-zA-Z0-9]{32,})['"]/.test(line)) {
      findings.push({
        file: filePath.replace(srcDir, 'src'),
        line: index + 1,
        type: 'API Key',
        severity: 'CRITICAL',
        content: line.trim().substring(0, 100) + '...'
      });
    }
  });
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      scanFile(filePath);
    }
  });
}

scanDirectory(srcDir);

// Also scan utils/env.js specifically
const envPath = path.join(__dirname, '../src/utils/env.js');
if (fs.existsSync(envPath)) {
  scanFile(envPath);
}

// Print findings
console.log(`Found ${findings.length} security issues:\n`);

const critical = findings.filter(f => f.severity === 'CRITICAL');
const high = findings.filter(f => f.severity === 'HIGH');
const medium = findings.filter(f => f.severity === 'MEDIUM');

if (critical.length > 0) {
  console.log('🚨 CRITICAL ISSUES:');
  critical.forEach(f => {
    console.log(`  ${f.file}:${f.line}`);
    console.log(`    Type: ${f.type}`);
    console.log(`    Code: ${f.content}\n`);
  });
}

if (high.length > 0) {
  console.log('⚠️  HIGH SEVERITY:');
  high.forEach(f => {
    console.log(`  ${f.file}:${f.line}`);
    console.log(`    Type: ${f.type}`);
    console.log(`    Code: ${f.content}\n`);
  });
}

if (medium.length > 0) {
  console.log('📋 MEDIUM SEVERITY:');
  medium.forEach(f => {
    console.log(`  ${f.file}:${f.line} - ${f.type}`);
  });
}

// 3. Generate report
const report = {
  timestamp: new Date().toISOString(),
  tables: tables,
  totalTables: tables.length,
  securityFindings: findings,
  summary: {
    critical: critical.length,
    high: high.length,
    medium: medium.length,
    total: findings.length
  },
  recommendations: [
    'Remove all hardcoded JWT tokens from source code',
    'Move service role key to server-side only (Edge Functions)',
    'Enable RLS on all tables with company_id',
    'Create company-scoped RLS policies',
    'Implement token expiration for public portal',
    'Add rate limiting to public endpoints'
  ]
};

const reportPath = path.join(__dirname, 'SECURITY_AUDIT_REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n✅ Security audit complete!`);
console.log(`📄 Full report saved to: AIDevTools/SECURITY_AUDIT_REPORT.json`);
console.log(`\n📊 Summary:`);
console.log(`  - ${tables.length} database tables found`);
console.log(`  - ${critical.length} CRITICAL security issues`);
console.log(`  - ${high.length} HIGH severity issues`);
console.log(`  - ${medium.length} MEDIUM severity issues`);
console.log(`\n🔐 Next steps:`);
console.log(`  1. Review SECURITY_AUDIT_REPORT.json`);
console.log(`  2. Remove hardcoded credentials`);
console.log(`  3. Enable RLS on all tables`);
console.log(`  4. Create secure Edge Functions`);

