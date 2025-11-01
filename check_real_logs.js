const fs = require('fs');

try {
  const data = fs.readFileSync('error_logs/smart_logs_latest.json', 'utf8');
  const logs = JSON.parse(data);
  
  console.log('Log structure:', typeof logs, Array.isArray(logs) ? 'is array' : 'is object');
  
  if (Array.isArray(logs)) {
    const requests = logs.filter(l => l.message && l.message.includes('supaFetch request'));
    console.log('\n📊 Total supaFetch requests:', requests.length);
    console.log('\n🔍 Last 15 requests:');
    requests.slice(-15).forEach((r, i) => {
      console.log(`${i+1}. ${r.timestamp} - ${r.message.substring(0, 100)}`);
    });
  } else if (logs.logs && Array.isArray(logs.logs)) {
    const requests = logs.logs.filter(l => l.message && l.message.includes('supaFetch request'));
    console.log('\n📊 Total supaFetch requests:', requests.length);
    console.log('\n🔍 Last 15 requests:');
    requests.slice(-15).forEach((r, i) => {
      console.log(`${i+1}. ${r.timestamp} - ${r.message.substring(0, 100)}`);
    });
  } else {
    console.log('Unexpected log format:', Object.keys(logs).slice(0, 5));
  }
} catch (error) {
  console.error('Error reading logs:', error.message);
}

