const { Client } = require('pg');

async function checkNotificationSchema() {
  const config = {
    host: 'aws-1-us-west-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.cxlqzejzraczumqmsrcx',
    password: 'Alphaecho19!',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  };

  console.log('🔍 Connecting to Supabase...\n');
  const client = new Client(config);
  await client.connect();

  try {
    // Check notifications table
    console.log('📋 NOTIFICATIONS TABLE SCHEMA:');
    const notificationsSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'notifications'
      ORDER BY ordinal_position;
    `);
    
    if (notificationsSchema.rows.length > 0) {
      console.table(notificationsSchema.rows);
    } else {
      console.log('❌ Table does not exist\n');
    }

    // Check notification enums
    console.log('\n📋 NOTIFICATION ENUMS:');
    const enums = await client.query(`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname LIKE '%notification%'
      ORDER BY t.typname, e.enumsortorder;
    `);
    
    if (enums.rows.length > 0) {
      console.table(enums.rows);
    } else {
      console.log('❌ No notification enums found\n');
    }

    // Check sample notifications
    console.log('\n📊 SAMPLE NOTIFICATIONS:');
    const sampleNotifications = await client.query(`
      SELECT * FROM notifications ORDER BY created_at DESC LIMIT 3;
    `);
    
    if (sampleNotifications.rows.length > 0) {
      console.log('Found', sampleNotifications.rows.length, 'notifications');
      sampleNotifications.rows.forEach((n, i) => {
        console.log(`\nNotification ${i + 1}:`, JSON.stringify(n, null, 2));
      });
    } else {
      console.log('No notifications in database\n');
    }

    // Check notification preferences in profiles
    console.log('\n📋 NOTIFICATION PREFERENCES IN PROFILES:');
    const profilePrefs = await client.query(`
      SELECT id, user_id, notification_preferences 
      FROM profiles 
      WHERE notification_preferences IS NOT NULL 
      LIMIT 1;
    `);
    
    if (profilePrefs.rows.length > 0) {
      console.log('Sample notification preferences:', JSON.stringify(profilePrefs.rows[0].notification_preferences, null, 2));
    } else {
      console.log('No notification preferences found in profiles\n');
    }

    // Check settings table for notification settings
    console.log('\n📋 NOTIFICATION SETTINGS IN SETTINGS TABLE:');
    const settingsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'settings'
        AND column_name LIKE '%notification%'
      ORDER BY column_name;
    `);
    
    if (settingsCheck.rows.length > 0) {
      console.log('Notification-related columns in settings:');
      console.table(settingsCheck.rows);
    } else {
      console.log('No notification columns in settings table\n');
    }

    // Check public_settings table
    console.log('\n📋 NOTIFICATION SETTINGS IN PUBLIC_SETTINGS TABLE:');
    const publicSettingsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'public_settings'
        AND column_name LIKE '%notification%'
      ORDER BY column_name;
    `);
    
    if (publicSettingsCheck.rows.length > 0) {
      console.log('Notification-related columns in public_settings:');
      console.table(publicSettingsCheck.rows);
    } else {
      console.log('No notification columns in public_settings table\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkNotificationSchema().catch(console.error);

