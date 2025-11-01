const { execSync } = require('child_process');
const path = require('path');

console.log('\n🧪 RUNNING ALL AUTOMATED TESTS\n');
console.log('='.repeat(80));

const tests = [
  {
    name: 'Standard Settings Save Test',
    script: 'scripts/test-settings-save.js',
    description: 'Tests PATCH operations on settings and companies tables'
  },
  {
    name: 'Empty Strings Test',
    script: 'scripts/test-with-empty-strings.js',
    description: 'Tests real-world scenario with empty strings'
  }
];

let allPassed = true;
const results = [];

tests.forEach((test, index) => {
  console.log(`\n📋 TEST ${index + 1}/${tests.length}: ${test.name}`);
  console.log(`   ${test.description}`);
  console.log('\n' + '-'.repeat(80) + '\n');

  try {
    execSync(`node ${test.script}`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    results.push({ name: test.name, passed: true });
    console.log(`\n✅ ${test.name} PASSED\n`);
  } catch (error) {
    results.push({ name: test.name, passed: false });
    allPassed = false;
    console.log(`\n❌ ${test.name} FAILED\n`);
  }

  console.log('-'.repeat(80));
});

console.log('\n' + '='.repeat(80));
console.log('\n📊 TEST SUMMARY\n');

results.forEach((result, index) => {
  const status = result.passed ? '✅ PASSED' : '❌ FAILED';
  console.log(`${index + 1}. ${result.name}: ${status}`);
});

console.log('\n' + '='.repeat(80));

if (allPassed) {
  console.log('\n✅ ALL TESTS PASSED - PRODUCTION READY\n');
  console.log('The Settings page is fully functional and ready for deployment.');
  console.log('\nNext steps:');
  console.log('  1. Hard refresh browser (Ctrl+Shift+R)');
  console.log('  2. Test in Settings → Database page');
  console.log('  3. Try saving with empty fields');
  console.log('  4. Verify no errors appear\n');
  process.exit(0);
} else {
  console.log('\n❌ SOME TESTS FAILED\n');
  console.log('Run the autofix loop to fix issues:');
  console.log('  node scripts/full-autofix-loop.js\n');
  process.exit(1);
}

