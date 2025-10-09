const fs = require('fs');

try {
    const data = JSON.parse(fs.readFileSync('./Supabase Schema/supabase schema/latest.json', 'utf8'));
    const tables = [...new Set(data.tables.map(t => t.table_name))].sort();
    
    console.log('TOTAL TABLES:', tables.length);
    console.log('=====================================');
    
    tables.forEach((table, i) => {
        console.log(`${i+1}. ${table}`);
    });
    
    console.log('=====================================');
    
    // Also show enums
    if (data.enums) {
        const enums = [...new Set(data.enums.map(e => e.enum_name))].sort();
        console.log('\nTOTAL ENUMS:', enums.length);
        console.log('=====================================');
        enums.forEach((enumName, i) => {
            console.log(`${i+1}. ${enumName}`);
        });
    }
    
} catch (error) {
    console.error('Error:', error.message);
}
