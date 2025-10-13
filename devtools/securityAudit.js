/**
 * COMPREHENSIVE SECURITY AUDIT
 * 
 * Checks for:
 * 1. Hardcoded API keys, secrets, credentials
 * 2. Service keys exposed to frontend
 * 3. Database credentials in client code
 * 4. RLS policies on all tables
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const issues = [];
const warnings = [];
const passed = [];

// Patterns to search for
const SECURITY_PATTERNS = {
  serviceKey: /sb_secret_[A-Za-z0-9_]+/g,
  anonKey: /sb_publishable_[A-Za-z0-9_]+/g,
  supabaseUrl: /https:\/\/[a-z]+\.supabase\.co/g,
  dbPassword: /Alphaecho19!/g,
  dbHost: /aws-[0-9]-us-west-[0-9]\.pooler\.supabase\.com/g,
  apiKey: /[A-Z0-9]{32,}/g,
  hardcodedPassword: /password\s*[:=]\s*['"][^'"]+['"]/gi,
  hardcodedToken: /token\s*[:=]\s*['"][^'"]+['"]/gi,
};

function scanDirectory(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const results = [];
  
  function scan(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      // Skip node_modules, .git, build, etc.
      if (file === 'node_modules' || file === '.git' || file === 'build' || 
          file === 'dist' || file === '.env' || file === 'devtools') {
        continue;
      }
      
      if (stat.isDirectory()) {
        scan(filePath);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  }
  
  scan(dir);
  return results;
}

function scanFileForSecrets(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  const fileIssues = [];
  
  // Check for service key (CRITICAL)
  const serviceKeyMatches = content.match(SECURITY_PATTERNS.serviceKey);
  if (serviceKeyMatches) {
    fileIssues.push({
      severity: 'CRITICAL',
      type: 'Service Key Exposed',
      file: relativePath,
      matches: serviceKeyMatches.length,
      message: 'Supabase service key found in code! This should ONLY be in .env or server-side code.'
    });
  }
  
  // Check for database password (CRITICAL)
  const dbPasswordMatches = content.match(SECURITY_PATTERNS.dbPassword);
  if (dbPasswordMatches) {
    fileIssues.push({
      severity: 'CRITICAL',
      type: 'Database Password Exposed',
      file: relativePath,
      matches: dbPasswordMatches.length,
      message: 'Database password found in code! This should ONLY be in .env.'
    });
  }
  
  // Check for anon key in non-config files (WARNING)
  if (!relativePath.includes('config') && !relativePath.includes('.env')) {
    const anonKeyMatches = content.match(SECURITY_PATTERNS.anonKey);
    if (anonKeyMatches) {
      fileIssues.push({
        severity: 'WARNING',
        type: 'Anon Key Hardcoded',
        file: relativePath,
        matches: anonKeyMatches.length,
        message: 'Supabase anon key hardcoded. Should use environment variable.'
      });
    }
  }
  
  // Check for Supabase URL hardcoded (WARNING)
  if (!relativePath.includes('config') && !relativePath.includes('.env')) {
    const urlMatches = content.match(SECURITY_PATTERNS.supabaseUrl);
    if (urlMatches) {
      fileIssues.push({
        severity: 'WARNING',
        type: 'Supabase URL Hardcoded',
        file: relativePath,
        matches: urlMatches.length,
        message: 'Supabase URL hardcoded. Should use environment variable.'
      });
    }
  }
  
  return fileIssues;
}

async function checkRLSPolicies() {
  console.log('\n📋 Checking RLS Policies...\n');
  
  try {
    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_without_rls', {});
    
    if (tablesError) {
      console.log('   ⚠️  Could not check RLS via RPC, using direct query...');
      
      // Alternative: Query pg_tables directly
      const { data: allTables, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (error) {
        console.log('   ❌ Error querying tables:', error.message);
        return;
      }
      
      console.log(`   Found ${allTables?.length || 0} tables in public schema`);
      
      // Check each table for RLS
      for (const table of allTables || []) {
        const tableName = table.tablename;
        
        // Try to query the table to see if RLS is enforced
        const { data, error: queryError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (queryError) {
          if (queryError.message.includes('row-level security')) {
            passed.push({
              type: 'RLS Enabled',
              table: tableName,
              message: 'RLS is enabled and enforced'
            });
          } else {
            warnings.push({
              severity: 'WARNING',
              type: 'RLS Check Failed',
              table: tableName,
              message: `Could not verify RLS: ${queryError.message}`
            });
          }
        } else {
          // If query succeeded without company_id, RLS might not be enforced
          warnings.push({
            severity: 'WARNING',
            type: 'RLS Possibly Not Enforced',
            table: tableName,
            message: 'Query succeeded without company_id filter - verify RLS policies'
          });
        }
      }
    }
  } catch (err) {
    console.log('   ❌ Error checking RLS:', err.message);
  }
}

async function runSecurityAudit() {
  console.log('\n🔒 COMPREHENSIVE SECURITY AUDIT');
  console.log('='.repeat(80));
  
  // Step 1: Scan for hardcoded secrets
  console.log('\n📁 Step 1: Scanning for hardcoded secrets...\n');
  
  const srcFiles = scanDirectory(path.join(process.cwd(), 'src'));
  const publicFiles = scanDirectory(path.join(process.cwd(), 'public'));
  const allFiles = [...srcFiles, ...publicFiles];
  
  console.log(`   Scanning ${allFiles.length} files...`);
  
  for (const file of allFiles) {
    const fileIssues = scanFileForSecrets(file);
    
    for (const issue of fileIssues) {
      if (issue.severity === 'CRITICAL') {
        issues.push(issue);
      } else {
        warnings.push(issue);
      }
    }
  }
  
  console.log(`   ✅ Scan complete`);
  
  // Step 2: Check RLS policies
  console.log('\n📋 Step 2: Checking RLS policies...\n');
  await checkRLSPolicies();
  
  // Step 3: Check specific files
  console.log('\n📋 Step 3: Checking specific security-sensitive files...\n');
  
  // Check if service key is in any React component
  const reactFiles = allFiles.filter(f => f.includes('src/'));
  for (const file of reactFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('service_role') || content.includes('sb_secret')) {
      issues.push({
        severity: 'CRITICAL',
        type: 'Service Key in Frontend',
        file: path.relative(process.cwd(), file),
        message: 'Service key or service_role reference found in frontend code!'
      });
    }
  }
  
  // Print results
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 SECURITY AUDIT RESULTS');
  console.log('='.repeat(80));
  
  console.log(`\n🔴 Critical Issues: ${issues.length}`);
  console.log(`🟡 Warnings: ${warnings.length}`);
  console.log(`✅ Passed: ${passed.length}`);
  
  if (issues.length > 0) {
    console.log('\n🔴 CRITICAL ISSUES:\n');
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.type}`);
      console.log(`   File: ${issue.file}`);
      console.log(`   ${issue.message}`);
      if (issue.matches) console.log(`   Matches: ${issue.matches}`);
      console.log('');
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n🟡 WARNINGS:\n');
    warnings.slice(0, 10).forEach((warning, i) => {
      console.log(`${i + 1}. ${warning.type}`);
      console.log(`   File: ${warning.file || warning.table || 'N/A'}`);
      console.log(`   ${warning.message}`);
      console.log('');
    });
    
    if (warnings.length > 10) {
      console.log(`   ... and ${warnings.length - 10} more warnings\n`);
    }
  }
  
  if (passed.length > 0) {
    console.log(`\n✅ PASSED CHECKS: ${passed.length}`);
  }
  
  // Save results
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      critical: issues.length,
      warnings: warnings.length,
      passed: passed.length
    },
    issues,
    warnings,
    passed
  };
  
  fs.writeFileSync(
    'devtools/logs/security-audit-results.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n='.repeat(80));
  console.log('\n📁 Results saved to: devtools/logs/security-audit-results.json');
  
  if (issues.length > 0) {
    console.log('\n🔴 SECURITY ISSUES FOUND! Please fix critical issues immediately.\n');
  } else {
    console.log('\n✅ No critical security issues found!\n');
  }
}

if (require.main === module) {
  runSecurityAudit().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runSecurityAudit };

