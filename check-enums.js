const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('Supabase Schema/latest.json', 'utf8'));

const enums = schema.enums.filter(e => e.enum_name.includes('deposit'));
console.log('Deposit-related enums:');
enums.forEach(e => console.log(`  ${e.enum_name}: ${e.value}`));

