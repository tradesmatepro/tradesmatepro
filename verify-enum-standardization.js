const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('Supabase Schema/latest.json', 'utf8'));

console.log('=== ENUM STANDARDIZATION CHECK ===\n');

// Group by enum name and show values
const enumsByName = {};
schema.enums.forEach(e => {
  if (!enumsByName[e.enum_name]) enumsByName[e.enum_name] = [];
  enumsByName[e.enum_name].push(e.value);
});

// Check for mixed case
let hasUppercase = false;
let hasLowercase = false;
let hasMixed = false;

Object.entries(enumsByName).forEach(([name, values]) => {
  const hasUpper = values.some(v => /[A-Z]/.test(v));
  const hasLower = values.some(v => /[a-z]/.test(v));
  
  if (hasUpper && hasLower) {
    hasMixed = true;
    console.log(`MIXED CASE: ${name}`);
    values.forEach(v => console.log(`  - ${v}`));
  } else if (hasUpper) {
    hasUppercase = true;
  } else if (hasLower) {
    hasLowercase = true;
  }
});

console.log('\n=== SUMMARY ===');
console.log(`Total enums: ${Object.keys(enumsByName).length}`);
console.log(`Has uppercase enums: ${hasUppercase}`);
console.log(`Has lowercase enums: ${hasLowercase}`);
console.log(`Has mixed case enums: ${hasMixed}`);

// Show specific problematic enums
console.log('\n=== DEPOSIT TYPE ENUM ===');
if (enumsByName.deposit_type_enum) {
  enumsByName.deposit_type_enum.forEach(v => console.log(`  - ${v}`));
}

console.log('\n=== WORK ORDER STATUS ENUM ===');
if (enumsByName.work_order_status_enum) {
  enumsByName.work_order_status_enum.slice(0, 5).forEach(v => console.log(`  - ${v}`));
}

