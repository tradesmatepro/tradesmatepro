/**
 * Fix ALL modals to support dark mode
 * Adds dark: classes to all modal components
 */

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../src/components');

// Patterns to replace
const replacements = [
  // Modal container
  { from: /className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-\[60\]"/g, to: 'className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"' },
  
  // Main modal div - bg-white
  { from: /className="bg-white rounded-lg shadow-xl/g, to: 'className="bg-white dark:bg-gray-800 rounded-lg shadow-xl' },
  { from: /className="bg-white rounded-2xl shadow-2xl/g, to: 'className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl' },
  
  // Header - bg-white with border
  { from: /className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10"/g, to: 'className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10"' },
  
  // Body - p-6
  { from: /className="p-6">/g, to: 'className="p-6 dark:bg-gray-800">' },
  
  // Text colors - gray-900
  { from: /className="text-xl font-semibold text-gray-900"/g, to: 'className="text-xl font-semibold text-gray-900 dark:text-gray-100"' },
  { from: /className="text-lg font-semibold text-gray-900"/g, to: 'className="text-lg font-semibold text-gray-900 dark:text-gray-100"' },
  { from: /className="text-sm font-medium text-gray-900"/g, to: 'className="text-sm font-medium text-gray-900 dark:text-gray-100"' },
  
  // Text colors - gray-500
  { from: /className="text-sm text-gray-500 mt-0.5"/g, to: 'className="text-sm text-gray-500 dark:text-gray-400 mt-0.5"' },
  { from: /className="text-xs text-gray-500"/g, to: 'className="text-xs text-gray-500 dark:text-gray-400"' },
  
  // Close button
  { from: /className="text-gray-400 hover:text-gray-600 transition-colors"/g, to: 'className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"' },
  
  // Info boxes - bg-gray-50
  { from: /className="bg-gray-50 border border-gray-200 rounded-lg p-4"/g, to: 'className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"' },
  
  // Inputs and textareas
  { from: /className="w-full px-4 py-2 border border-gray-300 rounded-lg/g, to: 'className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' },
  
  // Footer
  { from: /className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0"/g, to: 'className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky bottom-0"' },
];

function fixModalFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    replacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`❌ Error fixing ${filePath}:`, err.message);
    return false;
  }
}

// Get all modal files
const files = fs.readdirSync(componentsDir)
  .filter(f => f.endsWith('Modal.js'))
  .map(f => path.join(componentsDir, f));

console.log(`\n🔧 Fixing ${files.length} modal files for dark mode...\n`);

let fixed = 0;
files.forEach(file => {
  if (fixModalFile(file)) fixed++;
});

console.log(`\n✅ Fixed ${fixed}/${files.length} modal files\n`);

