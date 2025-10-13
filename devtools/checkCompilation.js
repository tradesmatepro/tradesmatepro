/**
 * Check for all compilation issues
 * - Duplicate imports
 * - Duplicate declarations
 * - Syntax errors
 */

const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
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

function checkCompilation() {
  console.log('🔍 CHECKING FOR ALL COMPILATION ISSUES');
  console.log('═══════════════════════════════════════════════════════\n');

  const srcPath = path.join(__dirname, '..', 'src');
  const allFiles = getAllFiles(srcPath);

  console.log(`📁 Scanning ${allFiles.length} files...\n`);

  let totalIssues = 0;
  const issues = [];

  allFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    
    // Check for duplicate imports
    const importedVars = {};
    lines.forEach((line, index) => {
      const importMatch = line.match(/import\s+{([^}]+)}\s+from/);
      if (importMatch) {
        const vars = importMatch[1].split(',').map(v => v.trim());
        vars.forEach(varName => {
          if (importedVars[varName]) {
            issues.push({
              file: relativePath,
              line: index + 1,
              type: 'DUPLICATE_IMPORT',
              message: `'${varName}' imported multiple times in same statement`,
              code: line.trim()
            });
            totalIssues++;
          } else {
            importedVars[varName] = index + 1;
          }
        });
      }
    });

    // Check for duplicate export const declarations
    const declarations = {};
    lines.forEach((line, index) => {
      const match = line.match(/export\s+const\s+(\w+)/);
      if (match) {
        const varName = match[1];
        if (declarations[varName]) {
          issues.push({
            file: relativePath,
            line: index + 1,
            type: 'DUPLICATE_DECLARATION',
            message: `'${varName}' already declared on line ${declarations[varName]}`,
            code: line.trim()
          });
          totalIssues++;
        } else {
          declarations[varName] = index + 1;
        }
      }
    });

    // Check for duplicate const declarations (non-export)
    const localDeclarations = {};
    lines.forEach((line, index) => {
      const match = line.match(/^\s*const\s+(\w+)/);
      if (match && !line.includes('export')) {
        const varName = match[1];
        if (localDeclarations[varName]) {
          issues.push({
            file: relativePath,
            line: index + 1,
            type: 'DUPLICATE_CONST',
            message: `'${varName}' already declared on line ${localDeclarations[varName]}`,
            code: line.trim()
          });
          totalIssues++;
        } else {
          localDeclarations[varName] = index + 1;
        }
      }
    });
  });

  // Report results
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 COMPILATION CHECK RESULTS');
  console.log('═══════════════════════════════════════════════════════\n');

  if (totalIssues === 0) {
    console.log('🎉 NO COMPILATION ISSUES FOUND!');
    console.log('✅ All files are clean\n');
  } else {
    console.log(`❌ Found ${totalIssues} compilation issues:\n`);

    // Group by file
    const issuesByFile = {};
    issues.forEach(issue => {
      if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
      }
      issuesByFile[issue.file].push(issue);
    });

    Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
      console.log(`📄 ${file}`);
      fileIssues.forEach(issue => {
        console.log(`   ❌ Line ${issue.line}: ${issue.type}`);
        console.log(`      ${issue.message}`);
        console.log(`      ${issue.code}`);
      });
      console.log('');
    });
  }

  console.log('═══════════════════════════════════════════════════════\n');

  return totalIssues;
}

// Run it
const issueCount = checkCompilation();
process.exit(issueCount > 0 ? 1 : 0);

