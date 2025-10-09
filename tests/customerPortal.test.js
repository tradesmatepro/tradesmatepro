// Customer Portal Integration Tests
// Tests the complete customer portal functionality end-to-end

const request = require('supertest');
const app = require('../server/portalServer');

describe('Customer Portal API', () => {
  let sessionToken;
  let testCustomerId;
  let testQuoteId;

  beforeAll(async () => {
    // Setup test data
    console.log('Setting up test data...');
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('Cleaning up test data...');
  });

  describe('Authentication', () => {
    test('POST /api/portal/login - should authenticate customer', async () => {
      const response = await request(app)
        .post('/api/portal/login')
        .send({
          email: 'john.smith@example.com',
          password: 'test123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.account).toBeDefined();
      expect(response.body.sessionToken).toBeDefined();

      sessionToken = response.body.sessionToken;
      testCustomerId = response.body.account.customer_id;
    });

    test('POST /api/portal/magic-link - should generate magic link', async () => {
      const response = await request(app)
        .post('/api/portal/magic-link')
        .send({
          email: 'john.smith@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    test('Should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/portal/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrong'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Quotes', () => {
    test('GET /api/portal/quotes - should fetch customer quotes', async () => {
      const response = await request(app)
        .get('/api/portal/quotes')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        testQuoteId = response.body[0].id;
        expect(response.body[0]).toHaveProperty('quote_number');
        expect(response.body[0]).toHaveProperty('total_amount');
        expect(response.body[0]).toHaveProperty('status');
      }
    });

    test('GET /api/portal/quotes/:id - should fetch specific quote', async () => {
      if (!testQuoteId) {
        console.log('Skipping quote detail test - no quotes available');
        return;
      }

      const response = await request(app)
        .get(`/api/portal/quotes/${testQuoteId}`)
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testQuoteId);
    });

    test('POST /api/portal/quotes/:id/sign - should sign quote', async () => {
      if (!testQuoteId) {
        console.log('Skipping quote signing test - no quotes available');
        return;
      }

      const signatureData = {
        signed_by: 'John Smith',
        signature_data: {
          dataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          timestamp: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post(`/api/portal/quotes/${testQuoteId}/sign`)
        .set('Authorization', `Bearer ${sessionToken}`)
        .send({ signatureData });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Jobs', () => {
    test('GET /api/portal/jobs - should fetch customer jobs', async () => {
      const response = await request(app)
        .get('/api/portal/jobs')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Invoices', () => {
    test('GET /api/portal/invoices - should fetch customer invoices', async () => {
      const response = await request(app)
        .get('/api/portal/invoices')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Service Requests', () => {
    test('POST /api/portal/service-requests - should create service request', async () => {
      const serviceRequest = {
        category: 'Plumbing',
        title: 'Fix Leaky Faucet',
        description: 'Kitchen faucet is dripping constantly',
        urgency: 'normal',
        address_line_1: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        zip_code: '90210',
        budget_range: 'Under $100'
      };

      const response = await request(app)
        .post('/api/portal/service-requests')
        .set('Authorization', `Bearer ${sessionToken}`)
        .send(serviceRequest);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(serviceRequest.title);
      expect(response.body.status).toBe('open');
    });

    test('GET /api/portal/service-requests - should fetch service requests', async () => {
      const response = await request(app)
        .get('/api/portal/service-requests')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Messages', () => {
    test('POST /api/portal/messages - should send message', async () => {
      const message = {
        content: 'Hello, I have a question about my service request.',
        service_request_id: null // General message
      };

      const response = await request(app)
        .post('/api/portal/messages')
        .set('Authorization', `Bearer ${sessionToken}`)
        .send(message);

      expect(response.status).toBe(200);
      expect(response.body.content).toBe(message.content);
      expect(response.body.message_type).toBe('customer_to_company');
    });

    test('GET /api/portal/messages - should fetch messages', async () => {
      const response = await request(app)
        .get('/api/portal/messages')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Security', () => {
    test('Should reject requests without session token', async () => {
      const response = await request(app)
        .get('/api/portal/quotes');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('Should reject requests with invalid session token', async () => {
      const response = await request(app)
        .get('/api/portal/quotes')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('POST /api/portal/logout - should logout customer', async () => {
      const response = await request(app)
        .post('/api/portal/logout')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Should reject requests with expired session token', async () => {
      const response = await request(app)
        .get('/api/portal/quotes')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });
});

// Frontend Component Tests
describe('Customer Portal Components', () => {
  // These would be React Testing Library tests
  // For now, just placeholder structure

  describe('PortalLogin', () => {
    test('should render login form', () => {
      // Test login form rendering
    });

    test('should handle email/password login', () => {
      // Test login functionality
    });

    test('should handle magic link request', () => {
      // Test magic link functionality
    });
  });

  describe('PortalDashboard', () => {
    test('should render dashboard tabs', () => {
      // Test dashboard rendering
    });

    test('should load customer data', () => {
      // Test data loading
    });
  });

  describe('ESignatureModal', () => {
    test('should render signature canvas', () => {
      // Test signature modal
    });

    test('should capture signature data', () => {
      // Test signature capture
    });
  });
});

// Performance Tests
describe('Customer Portal Performance', () => {
  test('API endpoints should respond within 500ms', async () => {
    const start = Date.now();
    
    const response = await request(app)
      .post('/api/portal/login')
      .send({
        email: 'john.smith@example.com',
        password: 'test123'
      });

    const duration = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(500);
  });

  test('Should handle concurrent requests', async () => {
    // Test concurrent API calls
    const promises = Array(10).fill().map(() => 
      request(app).get('/health')
    );

    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});

module.exports = {
  // Export test utilities for other test files
};
