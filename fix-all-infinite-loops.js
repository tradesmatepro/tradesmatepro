#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PATTERNS = [
  {
    name: 'useCallback in useEffect dependency array',
    regex: /useEffect\(\s*\(\s*\)\s*=>\s*\{([^}]*?)\},\s*\[\s*([^\]]*?)(\w+)\s*([^\]]*?)\]\s*\);/gs,
    fix: (match, body, before, funcName, after) => {
      // Check if funcName is defined with useCallback
      if (body.includes(`const ${funcName} = useCallback`)) {
        // Remove the function from dependency array
        const newDeps = `${before}${after}`.replace(/,\s*$/, '').trim();
        return `useEffect(() => {${body}}, [${newDeps}]);`;
      }
      return match;
    }
  }
];

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

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern 1: useCallback function in useEffect dependency array
  const useCallbackMatches = [...content.matchAll(/const\s+(\w+)\s*=\s*useCallback/g)];
  
  for (const match of useCallbackMatches) {
    const funcName = match[1];
    
    // Find useEffect that includes this function in dependency array
    const useEffectPattern = new RegExp(
      `useEffect\\(\\s*\\(\\s*\\)\\s*=>\\s*\\{[^}]*?${funcName}\\(\\)[^}]*?\\},\\s*\\[[^\\]]*?${funcName}[^\\]]*?\\]\\s*\\);`,
      'g'
    );
    
    if (useEffectPattern.test(content)) {
      // Extract the dependencies from useCallback
      const useCallbackMatch = content.match(
        new RegExp(`const\\s+${funcName}\\s*=\\s*useCallback[^}]*?\\},\\s*\\[([^\\]]*)\\]`, 's')
      );
      
      if (useCallbackMatch) {
        const callbackDeps = useCallbackMatch[1].trim();
        
        // Replace useEffect dependency array
        content = content.replace(
          new RegExp(
            `(useEffect\\(\\s*\\(\\s*\\)\\s*=>\\s*\\{[^}]*?${funcName}\\(\\)[^}]*?\\},\\s*\\[)([^\\]]*)${funcName}([^\\]]*)\\]`,
            'g'
          ),
          `$1$2$3]`
        );
        
        // Clean up extra commas
        content = content.replace(/,\s*\]/g, ']');
        content = content.replace(/\[\s*,/g, '[');
        
        modified = true;
        console.log(`✅ Fixed ${funcName} in ${path.basename(filePath)}`);
      }
    }
  }
  
  // Pattern 2: Multiple useEffect hooks that might trigger each other
  const useEffectCount = (content.match(/useEffect\(/g) || []).length;
  if (useEffectCount > 3) {
    console.log(`⚠️  ${path.basename(filePath)}: Has ${useEffectCount} useEffect hooks - review for circular dependencies`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return modified;
}

console.log('🔍 COMPREHENSIVE INFINITE LOOP AUTO-FIX\n');
console.log('=' .repeat(80));

const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir);

console.log(`\n📁 Found ${files.length} JavaScript files to scan\n`);

let fixedCount = 0;
let warningCount = 0;

for (const file of files) {
  try {
    if (fixFile(file)) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n✅ AUTO-FIX COMPLETE!`);
console.log(`   Fixed: ${fixedCount} files`);
console.log(`   Warnings: ${warningCount} files need review\n`);

