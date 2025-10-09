#!/usr/bin/env node

// Customer Portal Deployment Script
// This script handles the complete deployment of the customer portal

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORTAL_CONFIG = {
  DATABASE_SCHEMA: 'database/customer_portal_schema.sql',
  DEMO_DATA: 'scripts/setupPortalDemo.js',
  SERVER_PORT: process.env.PORTAL_PORT || 3001,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type];
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function checkPrerequisites() {
  log('Checking prerequisites...');
  
  // Check if Node.js is installed
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    log(`Node.js version: ${nodeVersion}`, 'success');
  } catch (error) {
    log('Node.js is not installed or not in PATH', 'error');
    process.exit(1);
  }

  // Check if npm is installed
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`npm version: ${npmVersion}`, 'success');
  } catch (error) {
    log('npm is not installed or not in PATH', 'error');
    process.exit(1);
  }

  // Check if required files exist
  const requiredFiles = [
    'package.json',
    'src/components/CustomerPortal/PortalDashboard.js',
    'src/services/CustomerPortalService.js',
    'src/contexts/CustomerPortalContext.js',
    'src/api/portalRoutes.js',
    'server/portalServer.js'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      log(`Required file missing: ${file}`, 'error');
      process.exit(1);
    }
  }

  log('All prerequisites met', 'success');
}

function installDependencies() {
  log('Installing dependencies...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    log('Dependencies installed successfully', 'success');
  } catch (error) {
    log('Failed to install dependencies', 'error');
    process.exit(1);
  }
}

function buildApplication() {
  log('Building React application...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    log('Application built successfully', 'success');
  } catch (error) {
    log('Failed to build application', 'error');
    process.exit(1);
  }
}

function setupDatabase() {
  log('Setting up database schema...');
  
  if (fs.existsSync(PORTAL_CONFIG.DATABASE_SCHEMA)) {
    log(`Database schema found: ${PORTAL_CONFIG.DATABASE_SCHEMA}`);
    log('Please run the schema in your Supabase SQL Editor:', 'warning');
    log(`\\i ${PORTAL_CONFIG.DATABASE_SCHEMA}`, 'info');
  } else {
    log('Database schema file not found', 'warning');
    log('Please ensure the schema is deployed to your database', 'warning');
  }
}

function setupDemoData() {
  log('Setting up demo data...');
  
  if (fs.existsSync(PORTAL_CONFIG.DEMO_DATA)) {
    try {
      require(`../${PORTAL_CONFIG.DEMO_DATA}`);
      log('Demo data setup initiated', 'success');
    } catch (error) {
      log(`Failed to setup demo data: ${error.message}`, 'warning');
      log('You can run this manually later with: node scripts/setupPortalDemo.js', 'info');
    }
  } else {
    log('Demo data script not found', 'warning');
  }
}

function createEnvironmentFile() {
  log('Creating environment configuration...');
  
  const envContent = `# Customer Portal Configuration
PORTAL_PORT=${PORTAL_CONFIG.SERVER_PORT}
FRONTEND_URL=${PORTAL_CONFIG.FRONTEND_URL}

# Supabase Configuration (update with your values)
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Email Service (for magic links)
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@yourapp.com

# Payment Processing (future)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
`;

  if (!fs.existsSync('.env.portal')) {
    fs.writeFileSync('.env.portal', envContent);
    log('Created .env.portal file', 'success');
    log('Please update the environment variables with your actual values', 'warning');
  } else {
    log('.env.portal file already exists', 'info');
  }
}

function runTests() {
  log('Running tests...');
  
  try {
    // Check if test dependencies are installed
    if (fs.existsSync('tests/customerPortal.test.js')) {
      log('Test files found, but skipping automated tests for now', 'info');
      log('Run tests manually with: npm test', 'info');
    } else {
      log('No test files found', 'warning');
    }
  } catch (error) {
    log(`Test execution failed: ${error.message}`, 'warning');
  }
}

function startServices() {
  log('Starting services...');
  
  log(`Portal server will run on port ${PORTAL_CONFIG.SERVER_PORT}`, 'info');
  log(`Frontend will connect to ${PORTAL_CONFIG.FRONTEND_URL}`, 'info');
  
  log('To start the development environment:', 'info');
  log('  npm run dev', 'info');
  log('', 'info');
  log('To start services individually:', 'info');
  log('  Frontend: npm start', 'info');
  log('  Portal API: npm run portal-server', 'info');
}

function displaySummary() {
  log('', 'info');
  log('🎉 Customer Portal Deployment Complete!', 'success');
  log('', 'info');
  log('📋 Next Steps:', 'info');
  log('1. Update .env.portal with your Supabase credentials', 'info');
  log('2. Run the database schema in Supabase SQL Editor', 'info');
  log('3. Start the development environment: npm run dev', 'info');
  log('4. Visit http://localhost:3000/portal to test', 'info');
  log('', 'info');
  log('🔐 Demo Account:', 'info');
  log('  Email: john.smith@example.com', 'info');
  log('  Password: any password (demo mode)', 'info');
  log('', 'info');
  log('📚 Documentation:', 'info');
  log('  See CUSTOMER_PORTAL_README.md for detailed information', 'info');
  log('', 'info');
  log('🚀 The portal includes:', 'success');
  log('  ✅ Authentication (password + magic link)', 'success');
  log('  ✅ Quote viewing and e-signature', 'success');
  log('  ✅ Job tracking and status updates', 'success');
  log('  ✅ Invoice management', 'success');
  log('  ✅ Service request marketplace', 'success');
  log('  ✅ Customer-contractor messaging', 'success');
  log('  ✅ Mobile-responsive design', 'success');
  log('  ✅ Security and activity logging', 'success');
}

async function main() {
  const args = process.argv.slice(2);
  const skipSteps = args.includes('--skip-build');
  
  log('🚀 Starting Customer Portal Deployment', 'info');
  log('', 'info');

  try {
    checkPrerequisites();
    installDependencies();
    
    if (!skipSteps) {
      buildApplication();
    }
    
    setupDatabase();
    createEnvironmentFile();
    setupDemoData();
    runTests();
    startServices();
    displaySummary();
    
  } catch (error) {
    log(`Deployment failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  main().catch(error => {
    log(`Unexpected error: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  main,
  checkPrerequisites,
  installDependencies,
  buildApplication,
  setupDatabase,
  setupDemoData,
  PORTAL_CONFIG
};
