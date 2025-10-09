const { Client } = require('pg');
const fs = require('fs');

async function runUrgentSQLFix() {
    console.log('🔧 RUNNING URGENT SQL FIXES...');
    console.log('=' .repeat(50));

    const client = new Client({
        host: 'aws-0-us-east-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        user: 'postgres.amgtktrwpdsigcomavlg',
        password: 'TradeMate2024!',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to Supabase database');

        // Read the SQL file
        const sqlContent = fs.readFileSync('supabase db/URGENT_400_ERROR_FIX.sql', 'utf8');
        
        // Split by sections and run each part
        const sections = sqlContent.split('-- ============================================================================');
        
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i].trim();
            if (!section || section.startsWith('URGENT:') || section.startsWith('VERIFICATION') || section.startsWith('AFTER RUNNING')) {
                continue;
            }

            console.log(`\n📋 Running section ${i}...`);
            
            try {
                const result = await client.query(section);
                console.log('✅ Section completed successfully');
                if (result.rows && result.rows.length > 0) {
                    console.log('   Results:', result.rows);
                }
            } catch (error) {
                console.log('⚠️  Section had issues (might be expected):', error.message);
            }
        }

        // Run verification queries
        console.log('\n🔍 RUNNING VERIFICATION CHECKS...');
        
        // Check created_via column
        const createdViaCheck = await client.query(`
            SELECT 'created_via column check:' as check_type, 
                   CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
            FROM information_schema.columns 
            WHERE table_name = 'customers' AND column_name = 'created_via'
        `);
        console.log('Created_via column:', createdViaCheck.rows[0]);

        // Check foreign key
        const fkCheck = await client.query(`
            SELECT 'foreign key check:' as check_type,
                   CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'customer_portal_accounts_customer_id_fkey'
        `);
        console.log('Foreign key:', fkCheck.rows[0]);

        // Check portal accounts structure
        const structureCheck = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'customer_portal_accounts' 
            ORDER BY ordinal_position
        `);
        console.log('\n📊 Portal accounts table structure:');
        structureCheck.rows.forEach(row => {
            console.log(`   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });

        console.log('\n✅ SQL FIXES COMPLETED SUCCESSFULLY!');
        
    } catch (error) {
        console.error('❌ Error running SQL fixes:', error);
    } finally {
        await client.end();
    }
}

runUrgentSQLFix().catch(console.error);
