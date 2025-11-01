#!/usr/bin/env node

/**
 * AUTOMATED MODERNIZATION SCRIPT
 * Systematically modernizes all pages with 2050+ glassmorphism design
 * Applies consistent patterns: glassmorphism, gradients, dark mode, rounded corners
 */

const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../src/pages');

// Pattern replacements for modernization
const modernizationPatterns = [
  // Old table containers → Modern glassmorphism
  {
    name: 'Table Container',
    from: /className="bg-white rounded-lg shadow-sm border border-gray-200"/g,
    to: 'className="rounded-3xl overflow-hidden border border-blue-200/50 dark:border-blue-900/50 backdrop-blur-xl shadow-2xl bg-gradient-to-br from-white/80 dark:from-slate-900/80 to-blue-50/40 dark:to-blue-900/20"'
  },
  // Old modal backgrounds → Modern glassmorphism
  {
    name: 'Modal Background',
    from: /className="fixed inset-0 bg-black\/40 z-50 flex items-center justify-center"/g,
    to: 'className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"'
  },
  // Old modal content → Modern glassmorphism
  {
    name: 'Modal Content',
    from: /className="bg-white rounded-lg shadow-lg w-full max-w-\w+ p-\d+"/g,
    to: 'className="rounded-3xl overflow-hidden border border-blue-200/50 dark:border-blue-900/50 backdrop-blur-xl shadow-2xl bg-gradient-to-br from-white/95 dark:from-slate-900/95 to-blue-50/50 dark:to-blue-900/30 w-full max-w-md p-8"'
  },
  // Old buttons → Modern gradient buttons
  {
    name: 'Primary Button',
    from: /className=".*?bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700.*?"/g,
    to: 'className="px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/30 dark:shadow-blue-600/30 backdrop-blur-sm font-medium"'
  },
  // Old input fields → Modern glassmorphism inputs
  {
    name: 'Input Field',
    from: /className="w-full border rounded-md px-3 py-2 text-sm"/g,
    to: 'className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-blue-200/50 dark:border-blue-900/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm shadow-lg shadow-blue-500/5 dark:shadow-blue-900/20"'
  },
  // Old select fields → Modern glassmorphism selects
  {
    name: 'Select Field',
    from: /className="w-full border rounded-md px-3 py-2 text-sm" value=/g,
    to: 'className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-blue-200/50 dark:border-blue-900/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm shadow-lg shadow-blue-500/5 dark:shadow-blue-900/20" value='
  },
  // Old table headers → Modern gradient headers
  {
    name: 'Table Header',
    from: /className="bg-gray-50"/g,
    to: 'className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 backdrop-blur-sm"'
  },
  // Old table rows → Modern hover effects
  {
    name: 'Table Row',
    from: /className="hover:bg-gray-50"/g,
    to: 'className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer"'
  }
];

function modernizeFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;

    modernizationPatterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        modified = true;
        console.log(`  ✅ Applied: ${pattern.name}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    return false;
  }
}

// Get all page files
const pageFiles = fs.readdirSync(pagesDir)
  .filter(f => f.endsWith('.js') && !f.startsWith('.'))
  .map(f => path.join(pagesDir, f));

console.log('\n🎨 AUTOMATED PAGE MODERNIZATION\n');
console.log('='.repeat(80));
console.log(`\n📁 Found ${pageFiles.length} page files to modernize\n`);

let modernizedCount = 0;
pageFiles.forEach(file => {
  const fileName = path.basename(file);
  console.log(`\n📄 Processing: ${fileName}`);
  
  if (modernizeFile(file)) {
    modernizedCount++;
  } else {
    console.log(`  ⏭️  No changes needed`);
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n✅ MODERNIZATION COMPLETE!`);
console.log(`   Modernized: ${modernizedCount}/${pageFiles.length} files\n`);

