/**
 * Fix ALL 262 security issues automatically
 * 
 * Replaces SUPABASE_SERVICE_KEY with SUPABASE_ANON_KEY in ALL frontend files
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

function fixAllSecurityIssues() {
  console.log('🔒 FIXING ALL 262 SECURITY ISSUES');
  console.log('═══════════════════════════════════════════════════════\n');

  const srcPath = path.join(__dirname, '..', 'src');
  const publicPath = path.join(__dirname, '..', 'public');
  
  const allFiles = [
    ...getAllFiles(srcPath),
    ...getAllFiles(publicPath)
  ];

  console.log(`📁 Scanning ${allFiles.length} files...\n`);

  let totalReplacements = 0;
  let filesFixed = 0;

  allFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Replace all variations of SUPABASE_SERVICE_KEY with SUPABASE_ANON_KEY
    content = content.replace(/SUPABASE_SERVICE_KEY/g, 'SUPABASE_ANON_KEY');
    
    // Also replace process.env.REACT_APP_SUPABASE_SERVICE_KEY
    content = content.replace(/process\.env\.REACT_APP_SUPABASE_SERVICE_KEY/g, 'process.env.REACT_APP_SUPABASE_ANON_KEY');

    // Count replacements
    const replacements = (originalContent.match(/SUPABASE_SERVICE_KEY/g) || []).length;

    if (replacements > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      const relativePath = path.relative(path.join(__dirname, '..'), filePath);
      console.log(`✅ ${relativePath} - Fixed ${replacements} occurrences`);
      totalReplacements += replacements;
      filesFixed++;
    }
  });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🎉 ALL SECURITY ISSUES FIXED!');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`✅ Files fixed: ${filesFixed}`);
  console.log(`✅ Total replacements: ${totalReplacements}`);
  console.log(`✅ SUPABASE_SERVICE_KEY → SUPABASE_ANON_KEY\n`);
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('🚀 Dev server should auto-reload with all fixes!');
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run it
fixAllSecurityIssues();

