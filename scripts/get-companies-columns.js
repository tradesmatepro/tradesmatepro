const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCompaniesColumns() {
  try {
    // Get actual columns from companies table
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying companies:', error);
      return;
    }

    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('\n✅ ACTUAL companies table columns:');
      console.log(JSON.stringify(columns, null, 2));
      console.log('\n📊 Total columns:', columns.length);
      
      // Show sample data types
      console.log('\n📋 Sample row:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️ No data in companies table');
    }

    // Also get settings columns
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .limit(1);

    if (settingsError) {
      console.error('Error querying settings:', settingsError);
      return;
    }

    if (settingsData && settingsData.length > 0) {
      const settingsColumns = Object.keys(settingsData[0]);
      console.log('\n✅ ACTUAL settings table columns:');
      console.log(JSON.stringify(settingsColumns, null, 2));
      console.log('\n📊 Total columns:', settingsColumns.length);
    }

  } catch (err) {
    console.error('Fatal error:', err);
  }
}

getCompaniesColumns();

