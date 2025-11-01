const fs = require('fs');

try {
  const data = fs.readFileSync('error_logs/smart_logs_latest.json', 'utf8');
  const logs = JSON.parse(data);
  
  console.log('📊 Total logs:', logs.totalLogs);
  console.log('📂 Categories:', Object.keys(logs.categorizedLogs));
  
  // Check API logs
  if (logs.categorizedLogs.api) {
    console.log('\n🌐 API logs:', logs.categorizedLogs.api.length);
    console.log('\nLast 20 API logs:');
    logs.categorizedLogs.api.slice(-20).forEach((log, i) => {
      const msg = typeof log === 'string' ? log : JSON.stringify(log).substring(0, 120);
      console.log(`${i+1}. ${msg}`);
    });
  }
  
  // Check error logs
  if (logs.categorizedLogs.error) {
    console.log('\n\n❌ Error logs:', logs.categorizedLogs.error.length);
    console.log('\nLast 10 error logs:');
    logs.categorizedLogs.error.slice(-10).forEach((log, i) => {
      const msg = typeof log === 'string' ? log : JSON.stringify(log).substring(0, 120);
      console.log(`${i+1}. ${msg}`);
    });
  }
} catch (error) {
  console.error('Error reading logs:', error.message);
}

