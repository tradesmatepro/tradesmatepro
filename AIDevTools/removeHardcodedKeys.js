const fs = require('fs');
const path = require('path');

console.log('🔐 Removing Hardcoded API Keys from Frontend\n');

const srcDir = path.join(__dirname, '../src');
let filesFixed = 0;
let keysRemoved = 0;

// Patterns to find and remove
const patterns = [
  // Hardcoded JWT tokens
  {
    regex: /const\s+SUPABASE_SERVICE_KEY\s*=\s*["']eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9[^"']+["'];?/g,
    replacement: '// SECURITY: Service key removed - use Edge Functions instead',
    description: 'Hardcoded service key constant'
  },
  {
    regex: /const\s+SUPABASE_SERVICE_KEY_HARD\s*=\s*["']eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9[^"']+["'];?/g,
    replacement: '// SECURITY: Service key removed - use Edge Functions instead',
    description: 'Hardcoded service key (HARD) constant'
  },
  // Hardcoded anon keys (old ones)
  {
    regex: /["']eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjY2RxZGJxZGsiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNjE3NTI5NiwiZXhwIjoyMDQxNzUxMjk2fQ\.Iq-Iq8Iq8Iq8Iq8Iq8Iq8Iq8Iq8Iq8Iq8Iq8Iq8Iq8["']/g,
    replacement: 'process.env.REACT_APP_SUPABASE_ANON_KEY',
    description: 'Old hardcoded anon key'
  },
  // Hardcoded Supabase URLs
  {
    regex: /["']https:\/\/amgtktrwpdsigccdqdbqdk\.supabase\.co["']/g,
    replacement: 'process.env.REACT_APP_SUPABASE_URL',
    description: 'Old hardcoded Supabase URL'
  }
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let fileKeysRemoved = 0;

  patterns.forEach(pattern => {
    const matches = content.match(pattern.regex);
    if (matches) {
      content = content.replace(pattern.regex, pattern.replacement);
      modified = true;
      fileKeysRemoved += matches.length;
      console.log(`  ✓ Removed ${matches.length}x ${pattern.description}`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    keysRemoved += fileKeysRemoved;
    return true;
  }
  return false;
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      const relativePath = filePath.replace(srcDir, 'src');
      const fixed = fixFile(filePath);
      if (fixed) {
        console.log(`✅ Fixed: ${relativePath}`);
      }
    }
  });
}

console.log('Scanning source files...\n');
scanDirectory(srcDir);

console.log(`\n✅ Complete!`);
console.log(`📊 Summary:`);
console.log(`  - ${filesFixed} files fixed`);
console.log(`  - ${keysRemoved} hardcoded keys removed`);
console.log(`\n🔐 Next steps:`);
console.log(`  1. Review the changes`);
console.log(`  2. Test the app with new keys`);
console.log(`  3. Create Edge Functions for admin operations`);
console.log(`  4. Enable RLS on all tables`);

