// Test the error server
const fetch = require('node-fetch');

async function testErrorServer() {
  try {
    console.log('🧪 Testing error server...');
    
    const testErrors = [
      {
        type: 'TEST_ERROR',
        message: 'This is a test error',
        timestamp: new Date().toISOString()
      }
    ];
    
    const response = await fetch('http://localhost:4000/save-errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testErrors)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Error server test successful:', result);
    } else {
      const error = await response.text();
      console.error('❌ Error server test failed:', response.status, error);
    }
    
  } catch (error) {
    console.error('❌ Error server test failed:', error.message);
  }
}

testErrorServer();
