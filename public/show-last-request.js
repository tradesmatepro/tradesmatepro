// Show the last captured request details
(function() {
  console.log('🔍 CHECKING LAST CAPTURED REQUEST...');
  
  const requests = window.__capturedRequests || [];
  
  if (requests.length === 0) {
    console.log('❌ No captured requests found');
    return;
  }
  
  // Find the last PATCH request to companies
  const lastCompanyPatch = requests.filter(r => 
    r.url && r.url.includes('/companies') && r.method === 'PATCH'
  ).pop();
  
  if (!lastCompanyPatch) {
    console.log('❌ No PATCH requests to companies found');
    console.log(`Total requests captured: ${requests.length}`);
    return;
  }
  
  console.log('📋 LAST COMPANY PATCH REQUEST:');
  console.log('=====================================');
  console.log('URL:', lastCompanyPatch.url);
  console.log('Method:', lastCompanyPatch.method);
  console.log('Status:', lastCompanyPatch.status);
  console.log('Timestamp:', lastCompanyPatch.timestamp);
  console.log('');
  console.log('📤 REQUEST BODY:');
  console.log(lastCompanyPatch.requestBody);
  console.log('');
  console.log('📥 RESPONSE BODY:');
  console.log(lastCompanyPatch.responseBody);
  console.log('=====================================');
  
  // Try to parse and pretty print
  try {
    const reqBody = JSON.parse(lastCompanyPatch.requestBody);
    console.log('');
    console.log('📤 REQUEST BODY (Parsed):');
    console.log(JSON.stringify(reqBody, null, 2));
  } catch (e) {
    // Not JSON
  }
  
  try {
    const resBody = JSON.parse(lastCompanyPatch.responseBody);
    console.log('');
    console.log('📥 RESPONSE BODY (Parsed):');
    console.log(JSON.stringify(resBody, null, 2));
  } catch (e) {
    // Not JSON
  }
})();

