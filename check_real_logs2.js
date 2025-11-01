const fs = require('fs');

try {
  const data = fs.readFileSync('error_logs/smart_logs_latest.json', 'utf8');
  const logs = JSON.parse(data);
  
  console.log('📊 Total logs:', logs.totalLogs);
  console.log('\n📂 Categories:', Object.keys(logs.categorizedLogs));
  
  // Check for supaFetch in recent logs
  const recentLogs = logs.recentLogs || [];
  const supaFetchLogs = recentLogs.filter(l => l.includes('supaFetch'));
  
  console.log('\n🌐 supaFetch logs in recent:', supaFetchLogs.length);
  console.log('\n🔍 Last 20 recent logs:');
  recentLogs.slice(-20).forEach((log, i) => {
    console.log(`${i+1}. ${log.substring(0, 120)}`);
  });
  
  // Check categorized logs
  if (logs.categorizedLogs.network) {
    console.log('\n\n🌐 Network logs:', logs.categorizedLogs.network.length);
    console.log('Last 10 network logs:');
    logs.categorizedLogs.network.slice(-10).forEach((log, i) => {
      console.log(`${i+1}. ${log.substring(0, 120)}`);
    });
  }
} catch (error) {
  console.error('Error reading logs:', error.message);
}

