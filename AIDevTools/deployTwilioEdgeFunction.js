// Deploy Twilio Edge Function to Supabase
// This script deploys the send-sms Edge Function and sets up secrets

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Twilio Edge Function...\n');

// Check if .env.local exists
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.error('❌ ERROR: .env.local file not found!');
  console.error('📝 Please create .env.local with your Twilio credentials.');
  console.error('📄 See .env.local.example for template.\n');
  process.exit(1);
}

// Read .env.local
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

// Check required Twilio credentials
const requiredVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER'
];

const missingVars = requiredVars.filter(v => !envVars[v]);
if (missingVars.length > 0) {
  console.error('❌ ERROR: Missing required Twilio credentials in .env.local:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\n📝 Please add these to .env.local\n');
  process.exit(1);
}

console.log('✅ Found Twilio credentials in .env.local\n');

// Step 1: Check if Supabase CLI is installed
console.log('📦 Step 1: Checking Supabase CLI...');
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI is installed\n');
} catch (error) {
  console.error('❌ ERROR: Supabase CLI not installed!');
  console.error('📝 Install it with: npm install -g supabase');
  console.error('📄 Or visit: https://supabase.com/docs/guides/cli\n');
  process.exit(1);
}

// Step 2: Check if logged in
console.log('🔐 Step 2: Checking Supabase login...');
try {
  execSync('supabase projects list', { stdio: 'pipe' });
  console.log('✅ Logged in to Supabase\n');
} catch (error) {
  console.error('❌ ERROR: Not logged in to Supabase!');
  console.error('📝 Login with: supabase login\n');
  process.exit(1);
}

// Step 3: Check if linked to project
console.log('🔗 Step 3: Checking project link...');
const supabaseConfigPath = path.join(__dirname, '..', 'supabase', 'config.toml');
if (!fs.existsSync(supabaseConfigPath)) {
  console.error('❌ ERROR: Not linked to Supabase project!');
  console.error('📝 Link with: supabase link --project-ref cxlqzejzraczumqmsrcx\n');
  process.exit(1);
}
console.log('✅ Linked to Supabase project\n');

// Step 4: Set Supabase secrets
console.log('🔑 Step 4: Setting Supabase secrets...');
try {
  requiredVars.forEach(varName => {
    const value = envVars[varName];
    console.log(`   Setting ${varName}...`);
    execSync(`supabase secrets set ${varName}="${value}"`, { stdio: 'pipe' });
  });
  
  // Optional: Set API key secrets if they exist
  if (envVars.TWILIO_API_KEY_SID) {
    console.log('   Setting TWILIO_API_KEY_SID...');
    execSync(`supabase secrets set TWILIO_API_KEY_SID="${envVars.TWILIO_API_KEY_SID}"`, { stdio: 'pipe' });
  }
  if (envVars.TWILIO_API_KEY_SECRET) {
    console.log('   Setting TWILIO_API_KEY_SECRET...');
    execSync(`supabase secrets set TWILIO_API_KEY_SECRET="${envVars.TWILIO_API_KEY_SECRET}"`, { stdio: 'pipe' });
  }
  
  console.log('✅ Secrets set successfully\n');
} catch (error) {
  console.error('❌ ERROR: Failed to set secrets!');
  console.error(error.message);
  process.exit(1);
}

// Step 5: Deploy Edge Function
console.log('🚀 Step 5: Deploying send-sms Edge Function...');
try {
  const output = execSync('supabase functions deploy send-sms', { 
    encoding: 'utf8',
    cwd: path.join(__dirname, '..')
  });
  console.log(output);
  console.log('✅ Edge Function deployed successfully!\n');
} catch (error) {
  console.error('❌ ERROR: Failed to deploy Edge Function!');
  console.error(error.message);
  process.exit(1);
}

// Step 6: Verify deployment
console.log('🔍 Step 6: Verifying deployment...');
try {
  const output = execSync('supabase functions list', { encoding: 'utf8' });
  console.log(output);
  
  if (output.includes('send-sms')) {
    console.log('✅ send-sms function is deployed!\n');
  } else {
    console.error('⚠️  WARNING: send-sms function not found in list!\n');
  }
} catch (error) {
  console.error('⚠️  WARNING: Could not verify deployment');
  console.error(error.message);
}

// Success!
console.log('🎉 DEPLOYMENT COMPLETE!\n');
console.log('📋 Next steps:');
console.log('   1. Test the Edge Function with test-twilio-edge-function.html');
console.log('   2. Send a quote via SMS from the Quotes page');
console.log('   3. Check integration_logs table in Supabase\n');
console.log('🔗 Edge Function URL:');
console.log('   https://cxlqzejzraczumqmsrcx.supabase.co/functions/v1/send-sms\n');

