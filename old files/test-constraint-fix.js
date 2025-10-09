// Test the constraint auto-fix
const statement = `ALTER TABLE companies 
ADD CONSTRAINT IF NOT EXISTS chk_companies_name_not_empty 
CHECK (LENGTH(TRIM(name)) > 0);`;

console.log('Original statement:');
console.log(statement);
console.log('\n---\n');

// Test the regex
const constraintMatch = statement.match(/ALTER TABLE\s+(\w+)\s+ADD CONSTRAINT IF NOT EXISTS\s+(\w+)\s+([\s\S]+?)(?:;|$)/i);
if (constraintMatch) {
    const [, tableName, constraintName, constraintDef] = constraintMatch;
    console.log('Match found:');
    console.log('Table:', tableName);
    console.log('Constraint:', constraintName);
    console.log('Definition:', constraintDef.trim());
    
    const fixed = `DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = '${constraintName}'
        AND table_name = '${tableName}'
    ) THEN
        ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} ${constraintDef.trim()};
    END IF;
END $$;`;
    
    console.log('\nFixed statement:');
    console.log(fixed);
} else {
    console.log('No match found');
}
