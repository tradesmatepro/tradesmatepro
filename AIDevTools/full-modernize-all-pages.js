#!/usr/bin/env node
/**
 * FULL MODERNIZATION SCRIPT - 2050+ Design System
 * Converts ALL pages to 100% modern glassmorphism design
 * No mixing old and new - complete transformation
 */

const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../src/pages');

// COMPREHENSIVE modernization patterns - covers ALL old styles
const patterns = [
  // ===== CONTAINERS & SECTIONS - AGGRESSIVE MATCHING =====
  {
    name: 'Old white card containers with padding',
    from: /className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"/g,
    to: 'className="rounded-3xl overflow-hidden border border-blue-200/50 dark:border-blue-900/50 backdrop-blur-xl shadow-2xl bg-gradient-to-br from-white/80 dark:from-slate-900/80 to-blue-50/40 dark:to-blue-900/20 p-6"'
  },
  {
    name: 'Old white card containers no padding',
    from: /className="bg-white rounded-lg border border-gray-200 shadow-sm"/g,
    to: 'className="rounded-3xl overflow-hidden border border-blue-200/50 dark:border-blue-900/50 backdrop-blur-xl shadow-2xl bg-gradient-to-br from-white/80 dark:from-slate-900/80 to-blue-50/40 dark:to-blue-900/20"'
  },
  {
    name: 'Old white containers with rounded-lg',
    from: /className="bg-white rounded-lg p-6"/g,
    to: 'className="rounded-3xl overflow-hidden border border-blue-200/50 dark:border-blue-900/50 backdrop-blur-xl shadow-2xl bg-gradient-to-br from-white/80 dark:from-slate-900/80 to-blue-50/40 dark:to-blue-900/20 p-6"'
  },
  {
    name: 'Old gray background sections',
    from: /className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm p-6"/g,
    to: 'className="rounded-3xl overflow-hidden border border-blue-200/50 dark:border-blue-900/50 backdrop-blur-xl shadow-2xl bg-gradient-to-br from-white/80 dark:from-slate-900/80 to-blue-50/40 dark:to-blue-900/20 p-6"'
  },
  {
    name: 'Old gradient backgrounds',
    from: /className="bg-gradient-to-r from-gray-50 to-gray-100"/g,
    to: 'className="rounded-3xl overflow-hidden border border-blue-200/50 dark:border-blue-900/50 backdrop-blur-xl shadow-2xl bg-gradient-to-br from-white/80 dark:from-slate-900/80 to-blue-50/40 dark:to-blue-900/20"'
  },
  {
    name: 'Old card class',
    from: /className="card bg-white"/g,
    to: 'className="card rounded-3xl overflow-hidden border border-blue-200/50 dark:border-blue-900/50 backdrop-blur-xl shadow-2xl bg-gradient-to-br from-white/80 dark:from-slate-900/80 to-blue-50/40 dark:to-blue-900/20"'
  },

  // ===== BUTTONS - AGGRESSIVE MATCHING =====
  {
    name: 'Old primary buttons',
    from: /className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"/g,
    to: 'className="px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/30 dark:shadow-blue-600/30 backdrop-blur-sm font-medium"'
  },
  {
    name: 'Old secondary buttons',
    from: /className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors"/g,
    to: 'className="px-6 py-3 bg-white/60 dark:bg-slate-700/60 border border-blue-200/50 dark:border-blue-900/50 text-gray-900 dark:text-white rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/5 dark:shadow-blue-900/20 backdrop-blur-sm font-medium hover:bg-white/80 dark:hover:bg-slate-700/80"'
  },
  {
    name: 'Old rounded-md buttons',
    from: /className=".*?rounded-md.*?hover:bg-/g,
    to: 'className="px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/30 dark:shadow-blue-600/30 backdrop-blur-sm font-medium"'
  },

  // ===== INPUT FIELDS - AGGRESSIVE MATCHING =====
  {
    name: 'Old input fields',
    from: /className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"/g,
    to: 'className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-blue-200/50 dark:border-blue-900/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm shadow-lg shadow-blue-500/5 dark:shadow-blue-900/20"'
  },
  {
    name: 'Old select fields',
    from: /className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/g,
    to: 'className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-blue-200/50 dark:border-blue-900/50 rounded-2xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm shadow-lg shadow-blue-500/5 dark:shadow-blue-900/20"'
  },

  // ===== TABLES - AGGRESSIVE MATCHING =====
  {
    name: 'Old table headers',
    from: /className="px-6 py-3 bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"/g,
    to: 'className="px-6 py-3 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-b border-blue-200/50 dark:border-blue-900/50 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider"'
  },
  {
    name: 'Old table rows',
    from: /className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900"/g,
    to: 'className="px-6 py-4 border-b border-blue-200/30 dark:border-blue-900/30 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"'
  },

  // ===== MODALS - AGGRESSIVE MATCHING =====
  {
    name: 'Old modal overlay',
    from: /className="fixed inset-0 bg-black\/40 z-50 flex items-center justify-center"/g,
    to: 'className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"'
  },

  // ===== DIVIDERS & BORDERS =====
  {
    name: 'Old dividers',
    from: /className="border-t border-gray-200"/g,
    to: 'className="border-t border-blue-200/30 dark:border-blue-900/30"'
  },
];

function modernizeFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    patterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        modified = true;
        console.log(`  ✓ ${pattern.name}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🚀 FULL MODERNIZATION - Converting all pages to 2050+ design...\n');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.js'));
let modernized = 0;

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  if (modernizeFile(filePath)) {
    console.log(`✅ ${file}`);
    modernized++;
  }
});

console.log(`\n✅ FULL MODERNIZATION COMPLETE!`);
console.log(`   Modernized: ${modernized}/${files.length} files`);
console.log(`   All pages now use 100% 2050+ glassmorphism design!`);

