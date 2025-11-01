/**
 * Compare old vs new Supabase exports to verify consolidation changes
 */

const fs = require('fs');
const path = require('path');

const oldDir = path.join(__dirname, 'supabase db', 'old');
const newDir = path.join(__dirname, 'supabase db', 'new');

// Get all CSV files
const oldFiles = fs.readdirSync(oldDir).filter(f => f.endsWith('.csv')).sort();
const newFiles = fs.readdirSync(newDir).filter(f => f.endsWith('.csv')).sort();

console.log('📊 SUPABASE EXPORT COMPARISON\n');
console.log('='.repeat(80));

// Compare file counts
console.log(`\n📁 File Count:`);
console.log(`  Old: ${oldFiles.length} files`);
console.log(`  New: ${newFiles.length} files`);

if (newFiles.length > oldFiles.length) {
  console.log(`  ✅ NEW FILES ADDED: ${newFiles.length - oldFiles.length}`);
}

// Find new files
const newFileNames = new Set(newFiles);
const oldFileNames = new Set(oldFiles);
const addedFiles = [...newFileNames].filter(f => !oldFileNames.has(f));
const removedFiles = [...oldFileNames].filter(f => !newFileNames.has(f));

if (addedFiles.length > 0) {
  console.log(`\n✅ NEW FILES ADDED:`);
  addedFiles.forEach(f => console.log(`  + ${f}`));
}

if (removedFiles.length > 0) {
  console.log(`\n❌ FILES REMOVED:`);
  removedFiles.forEach(f => console.log(`  - ${f}`));
}

// Compare common files
const commonFiles = [...oldFileNames].filter(f => newFileNames.has(f));
console.log(`\n📋 COMPARING ${commonFiles.length} COMMON FILES:\n`);

let totalChanges = 0;

commonFiles.forEach(file => {
  const oldPath = path.join(oldDir, file);
  const newPath = path.join(newDir, file);
  
  const oldContent = fs.readFileSync(oldPath, 'utf8');
  const newContent = fs.readFileSync(newPath, 'utf8');
  
  const oldLines = oldContent.split('\n').length;
  const newLines = newContent.split('\n').length;
  
  if (oldContent === newContent) {
    console.log(`✅ ${file}`);
    console.log(`   No changes (${oldLines} lines)`);
  } else {
    console.log(`⚠️  ${file}`);
    console.log(`   Old: ${oldLines} lines → New: ${newLines} lines`);
    const diff = newLines - oldLines;
    if (diff > 0) {
      console.log(`   ✅ ADDED ${diff} lines`);
    } else {
      console.log(`   ❌ REMOVED ${Math.abs(diff)} lines`);
    }
    totalChanges++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 SUMMARY:`);
console.log(`  Files with changes: ${totalChanges}/${commonFiles.length}`);
console.log(`  New files added: ${addedFiles.length}`);
console.log(`  Files removed: ${removedFiles.length}`);

// Detailed analysis of key files
console.log('\n' + '='.repeat(80));
console.log('\n🔍 DETAILED ANALYSIS OF CHANGES:\n');

commonFiles.forEach(file => {
  const oldPath = path.join(oldDir, file);
  const newPath = path.join(newDir, file);
  
  const oldContent = fs.readFileSync(oldPath, 'utf8');
  const newContent = fs.readFileSync(newPath, 'utf8');
  
  if (oldContent !== newContent) {
    console.log(`\n📄 ${file}:`);
    
    // Parse CSV headers
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    const oldHeader = oldLines[0];
    const newHeader = newLines[0];
    
    if (oldHeader !== newHeader) {
      console.log(`  ⚠️  HEADER CHANGED`);
      const oldCols = oldHeader.split(',').length;
      const newCols = newHeader.split(',').length;
      console.log(`     Old columns: ${oldCols}`);
      console.log(`     New columns: ${newCols}`);
      if (newCols > oldCols) {
        console.log(`     ✅ ADDED ${newCols - oldCols} columns`);
      }
    }
    
    // Count data rows
    const oldDataRows = oldLines.filter(l => l.trim() && l !== oldHeader).length;
    const newDataRows = newLines.filter(l => l.trim() && l !== newHeader).length;
    
    console.log(`  📊 Data rows: ${oldDataRows} → ${newDataRows}`);
    if (newDataRows > oldDataRows) {
      console.log(`     ✅ ADDED ${newDataRows - oldDataRows} rows`);
    } else if (newDataRows < oldDataRows) {
      console.log(`     ❌ REMOVED ${oldDataRows - newDataRows} rows`);
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n✅ COMPARISON COMPLETE\n');

