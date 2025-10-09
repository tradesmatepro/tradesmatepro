// Test the phone formatting logic from CompanyService
function formatPhoneNumber(ownerPhone) {
  let formattedPhone = null;
  if (ownerPhone && ownerPhone.trim()) {
    // Remove all non-digits
    const digitsOnly = ownerPhone.replace(/\D/g, '');
    
    // Add +1 for US numbers if not already international format
    if (digitsOnly.length === 10) {
      formattedPhone = `+1${digitsOnly}`;
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      formattedPhone = `+${digitsOnly}`;
    } else if (ownerPhone.startsWith('+')) {
      formattedPhone = ownerPhone; // Already formatted
    } else {
      console.warn('⚠️ Phone number format unclear, skipping:', ownerPhone);
      formattedPhone = null; // Skip invalid phone numbers
    }
    console.log('📱 Phone formatted:', ownerPhone, '→', formattedPhone);
  }
  return formattedPhone;
}

// Test various phone number formats
const testNumbers = [
  '5417050524',           // 10 digits
  '15417050524',          // 11 digits with 1
  '+15417050524',         // Already formatted
  '(541) 705-0524',       // Formatted with parentheses
  '541-705-0524',         // Formatted with dashes
  '541.705.0524',         // Formatted with dots
  '+44 20 7946 0958',     // UK number
  '123',                  // Too short
  '',                     // Empty
  null                    // Null
];

console.log('🧪 Testing phone number formatting:');
testNumbers.forEach(phone => {
  const result = formatPhoneNumber(phone);
  console.log(`  Input: "${phone}" → Output: "${result}"`);
});

// Test the specific failing number
console.log('\n🎯 Testing the specific failing number:');
const failingNumber = '5417050524';
const formatted = formatPhoneNumber(failingNumber);
console.log(`Result: "${formatted}"`);

// Test regex match
const phoneRegex = /^\+[1-9]\d{1,14}$/;
console.log(`Matches database constraint: ${phoneRegex.test(formatted)}`);
