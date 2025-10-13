/**
 * Check for duplicate SUPABASE_ANON_KEY declarations
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

function checkForDuplicates() {
  console.log('🔍 Checking for duplicate declarations...\n');

  const srcPath = path.join(__dirname, '..', 'src');
  const allFiles = getAllFiles(srcPath);

  let issuesFound = 0;

  allFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const declarations = {};
    
    lines.forEach((line, index) => {
      // Check for export const declarations
      const match = line.match(/export\s+const\s+(\w+)/);
      if (match) {
        const varName = match[1];
        if (declarations[varName]) {
          const relativePath = path.relative(path.join(__dirname, '..'), filePath);
          console.log(`❌ ${relativePath}`);
          console.log(`   Line ${declarations[varName]}: export const ${varName}`);
          console.log(`   Line ${index + 1}: export const ${varName} (DUPLICATE)`);
          console.log('');
          issuesFound++;
        } else {
          declarations[varName] = index + 1;
        }
      }
    });
  });

  if (issuesFound === 0) {
    console.log('✅ No duplicate declarations found!\n');
  } else {
    console.log(`❌ Found ${issuesFound} duplicate declarations\n`);
  }

  return issuesFound;
}

// Run it
const issues = checkForDuplicates();
process.exit(issues > 0 ? 1 : 0);

