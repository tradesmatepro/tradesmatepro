/**
 * Debug company settings to see what's configured
 */

const { Client } = require('pg');
require('dotenv').config();

async function debugSettings() {
  let client;
  try {
    client = new Client({
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT || 5432),
      database: process.env.SUPABASE_DB_NAME || 'postgres',
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Get the test company
    const companyResult = await client.query(`
      SELECT company_id FROM employees LIMIT 1
    `);

    const testCompanyId = companyResult.rows[0].company_id;
    console.log(`\n📋 Checking settings for company: ${testCompanyId}\n`);

    // Check company_settings
    const settingsResult = await client.query(`
      SELECT 
        company_id,
        business_hours_start,
        business_hours_end,
        working_days,
        timezone,
        min_advance_booking_hours,
        max_advance_booking_days
      FROM company_settings
      WHERE company_id = $1
    `, [testCompanyId]);

    if (settingsResult.rows.length === 0) {
      console.log('❌ No settings found in company_settings table!');
    } else {
      const settings = settingsResult.rows[0];
      console.log('✅ Settings found:');
      console.log(`   business_hours_start: ${settings.business_hours_start}`);
      console.log(`   business_hours_end: ${settings.business_hours_end}`);
      console.log(`   working_days: ${JSON.stringify(settings.working_days)}`);
      console.log(`   timezone: ${settings.timezone}`);
      console.log(`   min_advance_booking_hours: ${settings.min_advance_booking_hours}`);
      console.log(`   max_advance_booking_days: ${settings.max_advance_booking_days}`);
    }

    // Check what day today is
    const dayResult = await client.query(`
      SELECT 
        CURRENT_DATE as today,
        EXTRACT(DOW FROM CURRENT_DATE)::integer as dow,
        to_char(CURRENT_DATE, 'Day') as day_name,
        EXTRACT(DOW FROM CURRENT_DATE + 1)::integer as tomorrow_dow,
        to_char(CURRENT_DATE + 1, 'Day') as tomorrow_name
    `);

    const dayInfo = dayResult.rows[0];
    console.log(`\n📅 Date Info:`);
    console.log(`   Today: ${dayInfo.today} (${dayInfo.day_name.trim()}, DOW=${dayInfo.dow})`);
    console.log(`   Tomorrow: ${dayInfo.today} + 1 (${dayInfo.tomorrow_name.trim()}, DOW=${dayInfo.tomorrow_dow})`);

    // Check if working_days contains the day names
    if (settingsResult.rows.length > 0) {
      const workingDays = settingsResult.rows[0].working_days;
      console.log(`\n🔍 Working Days Check:`);
      console.log(`   working_days value: ${JSON.stringify(workingDays)}`);
      
      if (workingDays) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const tomorrowDow = dayInfo.tomorrow_dow;
        const tomorrowDayName = dayNames[tomorrowDow];
        
        console.log(`   Tomorrow is: ${tomorrowDayName} (DOW=${tomorrowDow})`);
        console.log(`   Is tomorrow in working_days? ${workingDays.includes(tomorrowDayName)}`);
      }
    }

    await client.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugSettings();

