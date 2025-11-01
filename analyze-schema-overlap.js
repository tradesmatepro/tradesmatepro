const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('Supabase Schema/latest.json', 'utf8'));

// Extract table columns
const companies = schema.tables.filter(t => t.table_name === 'companies');
const settings = schema.tables.filter(t => t.table_name === 'settings');
const company_settings = schema.tables.filter(t => t.table_name === 'company_settings');

console.log('=== COMPANIES TABLE ===');
companies.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));

console.log('\n=== SETTINGS TABLE ===');
settings.forEach(s => console.log(`  ${s.column_name}: ${s.data_type}`));

console.log('\n=== COMPANY_SETTINGS TABLE ===');
company_settings.forEach(cs => console.log(`  ${cs.column_name}: ${cs.data_type}`));

// Find overlaps
const companiesColumns = new Set(companies.map(c => c.column_name));
const settingsColumns = new Set(settings.map(s => s.column_name));
const company_settingsColumns = new Set(company_settings.map(cs => cs.column_name));

console.log('\n=== OVERLAPS ===');
console.log('Companies ∩ Settings:', Array.from(companiesColumns).filter(c => settingsColumns.has(c)));
console.log('Companies ∩ Company_Settings:', Array.from(companiesColumns).filter(c => company_settingsColumns.has(c)));
console.log('Settings ∩ Company_Settings:', Array.from(settingsColumns).filter(c => company_settingsColumns.has(c)));

// Show foreign keys
console.log('\n=== FOREIGN KEYS ===');
const fks = schema.foreign_keys.filter(fk => 
  ['companies', 'settings', 'company_settings'].includes(fk.table_name)
);
fks.forEach(fk => {
  console.log(`${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
});

