/**
 * Fix SUPABASE_SERVICE_KEY errors - replace with SUPABASE_ANON_KEY
 */

const fs = require('fs');
const path = require('path');

function fixSupabaseKeyErrors() {
  console.log('🔧 Fixing SUPABASE_SERVICE_KEY errors...\n');

  const filesToFix = [
    'src/pages/Payroll.js',
    'src/services/GoogleCalendarService.js'
  ];

  let totalReplacements = 0;

  for (const file of filesToFix) {
    const filePath = path.join(__dirname, '..', file);
    
    console.log(`📝 Fixing ${file}...`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`  ❌ File not found: ${file}\n`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Replace SUPABASE_SERVICE_KEY with SUPABASE_ANON_KEY
    content = content.replace(/SUPABASE_SERVICE_KEY/g, 'SUPABASE_ANON_KEY');

    // Count replacements
    const replacements = (originalContent.match(/SUPABASE_SERVICE_KEY/g) || []).length;
    totalReplacements += replacements;

    if (replacements > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Fixed ${replacements} occurrences\n`);
    } else {
      console.log(`  ℹ️ No changes needed\n`);
    }
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('🎉 DONE!');
  console.log('');
  console.log(`✅ Total replacements: ${totalReplacements}`);
  console.log('✅ SUPABASE_SERVICE_KEY → SUPABASE_ANON_KEY');
  console.log('');
  console.log('📋 Files fixed:');
  filesToFix.forEach(file => console.log(`   - ${file}`));
  console.log('');
  console.log('🚀 Dev server should auto-reload with the fix!');
  console.log('═══════════════════════════════════════════════════════');
}

// Run it
fixSupabaseKeyErrors();

