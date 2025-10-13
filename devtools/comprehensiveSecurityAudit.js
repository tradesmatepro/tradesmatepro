/**
 * Comprehensive Security Audit
 * 
 * Finds ALL instances of:
 * - SUPABASE_SERVICE_KEY in frontend code
 * - Hardcoded API keys
 * - Exposed secrets
 * - Security vulnerabilities
 */

const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    // Skip node_modules, build, .git, etc.
    if (file === 'node_modules' || file === 'build' || file === '.git' || 
        file === 'dist' || file === '.next' || file === 'coverage') {
      return;
    }

    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (file.match(/\.(js|jsx|ts|tsx)$/)) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const lines = content.split('\n');

  // Check each line
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // 1. SUPABASE_SERVICE_KEY in frontend
    if (line.includes('SUPABASE_SERVICE_KEY')) {
      issues.push({
        severity: 'CRITICAL',
        type: 'SUPABASE_SERVICE_KEY',
        line: lineNum,
        content: line.trim()
      });
    }

    // 2. Hardcoded API keys (common patterns)
    if (line.match(/['"]?api[_-]?key['"]?\s*[:=]\s*['"]\w{20,}['"]/i)) {
      if (!line.includes('process.env') && !line.includes('SUPABASE_ANON_KEY')) {
        issues.push({
          severity: 'HIGH',
          type: 'HARDCODED_API_KEY',
          line: lineNum,
          content: line.trim()
        });
      }
    }

    // 3. Hardcoded passwords
    if (line.match(/['"]?password['"]?\s*[:=]\s*['"]\w+['"]/i)) {
      if (!line.includes('process.env') && !line.includes('placeholder')) {
        issues.push({
          severity: 'HIGH',
          type: 'HARDCODED_PASSWORD',
          line: lineNum,
          content: line.trim()
        });
      }
    }

    // 4. Hardcoded tokens
    if (line.match(/['"]?token['"]?\s*[:=]\s*['"]\w{20,}['"]/i)) {
      if (!line.includes('process.env')) {
        issues.push({
          severity: 'HIGH',
          type: 'HARDCODED_TOKEN',
          line: lineNum,
          content: line.trim()
        });
      }
    }

    // 5. Service role key patterns
    if (line.match(/service[_-]?role/i) && line.includes('eyJ')) {
      issues.push({
        severity: 'CRITICAL',
        type: 'SERVICE_ROLE_KEY',
        line: lineNum,
        content: line.trim()
      });
    }

    // 6. Database credentials
    if (line.match(/['"]?(db|database)[_-]?(password|user|host)['"]?\s*[:=]/i)) {
      if (!line.includes('process.env')) {
        issues.push({
          severity: 'HIGH',
          type: 'DATABASE_CREDENTIALS',
          line: lineNum,
          content: line.trim()
        });
      }
    }
  });

  return issues;
}

function comprehensiveSecurityAudit() {
  console.log('🔒 COMPREHENSIVE SECURITY AUDIT');
  console.log('═══════════════════════════════════════════════════════\n');

  const srcPath = path.join(__dirname, '..', 'src');
  const publicPath = path.join(__dirname, '..', 'public');
  
  const allFiles = [
    ...getAllFiles(srcPath),
    ...getAllFiles(publicPath)
  ];

  console.log(`📁 Scanning ${allFiles.length} files...\n`);

  const fileIssues = {};
  let totalIssues = 0;
  let criticalIssues = 0;
  let highIssues = 0;

  allFiles.forEach(filePath => {
    const issues = auditFile(filePath);
    if (issues.length > 0) {
      const relativePath = path.relative(path.join(__dirname, '..'), filePath);
      fileIssues[relativePath] = issues;
      totalIssues += issues.length;
      
      issues.forEach(issue => {
        if (issue.severity === 'CRITICAL') criticalIssues++;
        if (issue.severity === 'HIGH') highIssues++;
      });
    }
  });

  // Report results
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 AUDIT RESULTS');
  console.log('═══════════════════════════════════════════════════════\n');

  if (totalIssues === 0) {
    console.log('🎉 NO SECURITY ISSUES FOUND!');
    console.log('✅ All files are clean\n');
  } else {
    console.log(`❌ Found ${totalIssues} security issues:`);
    console.log(`   🔴 CRITICAL: ${criticalIssues}`);
    console.log(`   🟠 HIGH: ${highIssues}\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 DETAILED ISSUES');
    console.log('═══════════════════════════════════════════════════════\n');

    Object.entries(fileIssues).forEach(([file, issues]) => {
      console.log(`📄 ${file}`);
      issues.forEach(issue => {
        const icon = issue.severity === 'CRITICAL' ? '🔴' : '🟠';
        console.log(`   ${icon} Line ${issue.line}: ${issue.type}`);
        console.log(`      ${issue.content.substring(0, 80)}${issue.content.length > 80 ? '...' : ''}`);
      });
      console.log('');
    });
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('🔧 RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════════════════\n');

  if (criticalIssues > 0) {
    console.log('🔴 CRITICAL ISSUES FOUND:');
    console.log('   1. Replace SUPABASE_SERVICE_KEY with SUPABASE_ANON_KEY');
    console.log('   2. Move service keys to backend/edge functions only');
    console.log('   3. Never expose service keys in frontend code\n');
  }

  if (highIssues > 0) {
    console.log('🟠 HIGH PRIORITY ISSUES:');
    console.log('   1. Move hardcoded credentials to environment variables');
    console.log('   2. Use process.env for all sensitive data');
    console.log('   3. Add .env to .gitignore\n');
  }

  console.log('✅ BEST PRACTICES:');
  console.log('   - Use SUPABASE_ANON_KEY for frontend');
  console.log('   - Use SUPABASE_SERVICE_KEY only in edge functions');
  console.log('   - Store all secrets in environment variables');
  console.log('   - Never commit .env files to git\n');

  console.log('═══════════════════════════════════════════════════════\n');

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: allFiles.length,
    totalIssues,
    criticalIssues,
    highIssues,
    fileIssues
  };

  fs.writeFileSync(
    path.join(__dirname, 'security-audit-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('📄 Full report saved to: devtools/security-audit-report.json\n');

  return totalIssues;
}

// Run it
const issueCount = comprehensiveSecurityAudit();
process.exit(issueCount > 0 ? 1 : 0);

