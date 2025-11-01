#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function findFiles(dir, ext = '.js') {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    if (item.startsWith('.') || item === 'node_modules') continue;
    
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(findFiles(fullPath, ext));
    } else if (item.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Find all useCallback definitions
  const useCallbackMatches = [...content.matchAll(/const\s+(\w+)\s*=\s*useCallback\s*\(/g)];
  const useCallbackFuncs = new Set(useCallbackMatches.map(m => m[1]));
  
  // Find all useEffect hooks
  const useEffectMatches = [...content.matchAll(/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([^}]*?)\},\s*\[([^\]]*?)\]\s*\)/g)];
  
  for (const match of useEffectMatches) {
    const body = match[1];
    const deps = match[2];
    
    // Check if useEffect calls a useCallback function
    for (const func of useCallbackFuncs) {
      if (body.includes(`${func}(`) && deps.includes(func)) {
        issues.push({
          type: 'INFINITE_LOOP_PATTERN',
          severity: 'CRITICAL',
          function: func,
          message: `useEffect calls ${func}() and includes it in dependency array`
        });
      }
    }
    
    // Check for state updates in dependency array
    const stateMatches = [...body.matchAll(/set(\w+)\(/g)];
    for (const stateMatch of stateMatches) {
      const stateName = stateMatch[1];
      const stateVar = stateName.charAt(0).toLowerCase() + stateName.slice(1);
      if (deps.includes(stateVar)) {
        issues.push({
          type: 'STATE_IN_DEPS',
          severity: 'HIGH',
          state: stateVar,
          message: `useEffect updates ${stateVar} and includes it in dependency array`
        });
      }
    }
  }
  
  return issues;
}

console.log('🔍 DETAILED INFINITE LOOP AUDIT\n');
console.log('='.repeat(80));

const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir);

console.log(`\n📁 Scanning ${files.length} files...\n`);

const allIssues = [];

for (const file of files) {
  try {
    const issues = analyzeFile(file);
    if (issues.length > 0) {
      allIssues.push({ file: path.relative(__dirname, file), issues });
    }
  } catch (error) {
    // Skip files that can't be parsed
  }
}

if (allIssues.length === 0) {
  console.log('✅ NO INFINITE LOOP PATTERNS FOUND!\n');
} else {
  console.log(`⚠️  FOUND ${allIssues.length} FILES WITH ISSUES:\n`);
  
  for (const { file, issues } of allIssues) {
    console.log(`📄 ${file}`);
    for (const issue of issues) {
      if (issue.type === 'INFINITE_LOOP_PATTERN') {
        console.log(`   🔴 CRITICAL: ${issue.message}`);
      } else if (issue.type === 'STATE_IN_DEPS') {
        console.log(`   🟠 HIGH: ${issue.message}`);
      }
    }
    console.log('');
  }
}

console.log('='.repeat(80));
console.log(`\n✅ AUDIT COMPLETE!\n`);

