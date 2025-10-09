/**
 * Test script to verify circular reference fix
 * This should run without throwing "Converting circular structure to JSON" errors
 */

console.log('🧪 Testing circular reference fix...');

// Test 1: Log DOM elements (this was causing the original error)
console.log('Test 1: Logging DOM elements');
const inputs = document.querySelectorAll('input');
console.log('Available inputs:', inputs);

// Test 2: Log forms
console.log('Test 2: Logging forms');
const forms = document.querySelectorAll('form');
console.log('Available forms:', forms);

// Test 3: Log individual DOM element
console.log('Test 3: Logging individual DOM element');
const body = document.body;
console.log('Body element:', body);

// Test 4: Log object with circular reference
console.log('Test 4: Logging object with circular reference');
const obj = { name: 'test' };
obj.self = obj; // Create circular reference
console.log('Circular object:', obj);

// Test 5: Log complex nested object with DOM elements
console.log('Test 5: Logging complex object with DOM elements');
const complexObj = {
  elements: inputs,
  body: body,
  nested: {
    forms: forms,
    timestamp: new Date()
  }
};
console.log('Complex object:', complexObj);

console.log('✅ All tests completed - no circular reference errors should appear!');
