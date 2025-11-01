const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🤖 FULL AUTOFIX LOOP - Settings Page\n');
console.log('='.repeat(80));

const MAX_ITERATIONS = 10;
let iteration = 0;
let allTestsPassed = false;

// Constraint rules discovered
const CONSTRAINT_RULES = {
  tax_id: {
    rule: 'Cannot be empty string - must be null or valid value',
    validFormats: ['null', '12-3456789', '123456789', '12-345678', '123-45-6789'],
    fix: (value) => value === '' ? null : value
  },
  phone: {
    rule: 'Must be E.164 format (+15551234567) or null',
    validFormats: ['null', '+15551234567'],
    fix: (value) => {
      if (!value || value === '') return null;
      const digits = value.replace(/\D/g, '');
      if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
      if (digits.length === 10) return '+1' + digits;
      if (value.startsWith('+')) return '+' + digits;
      return null;
    }
  },
  email: {
    rule: 'Must be valid email format or null',
    validFormats: ['null', 'test@example.com'],
    fix: (value) => {
      if (!value || value === '') return null;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
      return value;
    }
  },
  website: {
    rule: 'Empty string should be null',
    fix: (value) => value === '' ? null : value
  },
  tagline: {
    rule: 'Empty string should be null',
    fix: (value) => value === '' ? null : value
  },
  logo_url: {
    rule: 'Empty string should be null',
    fix: (value) => value === '' ? null : value
  },
  banner_url: {
    rule: 'Empty string should be null',
    fix: (value) => value === '' ? null : value
  }
};

function applyFixes() {
  console.log(`\n🔧 ITERATION ${iteration + 1}: Applying fixes...\n`);
  
  const files = [
    'src/components/SettingsDatabasePanel.js',
    'src/components/CompanyProfileSettingsTab.js'
  ];

  files.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  Skipping ${filePath} (not found)`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Add sanitization function if not exists
    const sanitizeFunction = `
// Sanitize company data to meet database constraints
const sanitizeCompanyData = (data) => {
  const sanitized = { ...data };
  
  // Convert empty strings to null for all fields
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === '') {
      sanitized[key] = null;
    }
  });
  
  // Phone: must be E.164 format or null
  if (sanitized.phone !== null && sanitized.phone !== undefined) {
    const digits = String(sanitized.phone).replace(/\\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      sanitized.phone = '+' + digits;
    } else if (digits.length === 10) {
      sanitized.phone = '+1' + digits;
    } else if (String(sanitized.phone).startsWith('+')) {
      sanitized.phone = '+' + digits;
    } else {
      sanitized.phone = null;
    }
  }
  
  // Email: must be valid format or null
  if (sanitized.email !== null && sanitized.email !== undefined) {
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(sanitized.email)) {
      sanitized.email = null;
    }
  }
  
  return sanitized;
};
`;

    if (!content.includes('sanitizeCompanyData')) {
      // Find where to insert (before first function that saves company data)
      const insertPoints = [
        /const saveSettings = async \(\) => {/,
        /const saveCompanyData = async \(\) => {/,
        /const handleSave = async \(\) => {/
      ];

      for (const pattern of insertPoints) {
        if (pattern.test(content)) {
          content = content.replace(pattern, sanitizeFunction + '\n  ' + pattern.source.replace(/\\/g, ''));
          modified = true;
          console.log(`✅ Added sanitizeCompanyData to ${filePath}`);
          break;
        }
      }
    }

    // Find and wrap companyData with sanitization
    const companyDataPatterns = [
      /const companyData = \{([^}]+)\};/gs,
      /const updatedCompanyData = \{([^}]+)\};/gs
    ];

    companyDataPatterns.forEach(pattern => {
      if (pattern.test(content) && !content.includes('sanitizeCompanyData(')) {
        content = content.replace(
          /const (companyData|updatedCompanyData) = \{/g,
          'const $1 = sanitizeCompanyData({'
        );
        content = content.replace(
          /\};(\s*)(\/\/ Save company data|\/\/ Update company|const \{ error)/g,
          '});$1$2'
        );
        modified = true;
        console.log(`✅ Wrapped companyData with sanitization in ${filePath}`);
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
    } else {
      console.log(`⏭️  No changes needed for ${filePath}`);
    }
  });
}

function runTests() {
  console.log('\n🧪 Running automated tests...\n');
  
  try {
    execSync('node scripts/test-settings-save.js', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Main autofix loop
console.log('📋 Constraint Rules Discovered:');
Object.keys(CONSTRAINT_RULES).forEach(field => {
  console.log(`   ${field}: ${CONSTRAINT_RULES[field].rule}`);
});

console.log('\n' + '='.repeat(80));

while (iteration < MAX_ITERATIONS && !allTestsPassed) {
  iteration++;
  
  applyFixes();
  
  console.log('\n' + '-'.repeat(80));
  
  allTestsPassed = runTests();
  
  if (allTestsPassed) {
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ ALL TESTS PASSED!\n');
    console.log(`Completed in ${iteration} iteration(s)`);
    console.log('\n' + '='.repeat(80));
    break;
  } else {
    console.log('\n⚠️  Tests failed, will retry...\n');
  }
}

if (!allTestsPassed) {
  console.log('\n' + '='.repeat(80));
  console.log('\n❌ AUTOFIX FAILED AFTER ' + MAX_ITERATIONS + ' ITERATIONS\n');
  console.log('Manual intervention required.');
  console.log('\n' + '='.repeat(80));
  process.exit(1);
}

