// Customer Portal Demo Data Setup
// This script creates sample data for demonstrating the customer portal

const { supaFetch } = require('../src/utils/supaFetch');

async function setupPortalDemo() {
  console.log('🚀 Setting up Customer Portal demo data...');

  try {
    // 1. Create a demo customer
    const customerData = {
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      address_line_1: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      zip_code: '90210',
      company_id: 'demo-company-id' // Replace with actual company ID
    };

    console.log('📝 Creating demo customer...');
    const customerResponse = await supaFetch('customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });

    if (!customerResponse.ok) {
      throw new Error('Failed to create customer');
    }

    const customer = await customerResponse.json();
    const customerId = customer[0].id;
    console.log(`✅ Created customer: ${customerId}`);

    // 2. Create customer portal account
    const portalAccountData = {
      customer_id: customerId,
      email: 'john.smith@example.com',
      is_active: true,
      created_at: new Date().toISOString()
    };

    console.log('🔐 Creating portal account...');
    const portalResponse = await supaFetch('customer_portal_accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(portalAccountData)
    });

    if (!portalResponse.ok) {
      throw new Error('Failed to create portal account');
    }

    const portalAccount = await portalResponse.json();
    console.log(`✅ Created portal account: ${portalAccount[0].id}`);

    // 3. Create sample quotes
    const quotes = [
      {
        customer_id: customerId,
        company_id: 'demo-company-id',
        quote_number: 'Q-2024-001',
        title: 'Kitchen Renovation',
        description: 'Complete kitchen renovation including new cabinets, countertops, and appliances.',
        subtotal: 15000.00,
        total_amount: 16200.00,
        status: 'PENDING',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      },
      {
        customer_id: customerId,
        company_id: 'demo-company-id',
        quote_number: 'Q-2024-002',
        title: 'Bathroom Remodel',
        description: 'Master bathroom remodel with new tile, fixtures, and vanity.',
        subtotal: 8500.00,
        total_amount: 9180.00,
        status: 'APPROVED',
        approved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days ago
      }
    ];

    console.log('💰 Creating sample quotes...');
    for (const quote of quotes) {
      const quoteResponse = await supaFetch('quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote)
      });

      if (quoteResponse.ok) {
        const createdQuote = await quoteResponse.json();
        console.log(`✅ Created quote: ${createdQuote[0].quote_number}`);
      }
    }

    // 4. Create sample work orders/jobs
    const jobs = [
      {
        customer_id: customerId,
        company_id: 'demo-company-id',
        title: 'Plumbing Repair',
        description: 'Fix leaky kitchen faucet and replace garbage disposal.',
        status: 'COMPLETED',
        scheduled_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        total_amount: 450.00,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        customer_id: customerId,
        company_id: 'demo-company-id',
        title: 'HVAC Maintenance',
        description: 'Annual HVAC system inspection and filter replacement.',
        status: 'SCHEDULED',
        scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        total_amount: 200.00,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    console.log('🔧 Creating sample jobs...');
    for (const job of jobs) {
      const jobResponse = await supaFetch('work_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });

      if (jobResponse.ok) {
        const createdJob = await jobResponse.json();
        console.log(`✅ Created job: ${createdJob[0].title}`);
      }
    }

    // 5. Create sample invoices
    const invoices = [
      {
        customer_id: customerId,
        company_id: 'demo-company-id',
        invoice_number: 'INV-2024-001',
        total_amount: 450.00,
        status: 'PAID',
        due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        customer_id: customerId,
        company_id: 'demo-company-id',
        invoice_number: 'INV-2024-002',
        total_amount: 200.00,
        status: 'SENT',
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        created_at: new Date().toISOString()
      }
    ];

    console.log('💳 Creating sample invoices...');
    for (const invoice of invoices) {
      const invoiceResponse = await supaFetch('invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
      });

      if (invoiceResponse.ok) {
        const createdInvoice = await invoiceResponse.json();
        console.log(`✅ Created invoice: ${createdInvoice[0].invoice_number}`);
      }
    }

    // 6. Create sample service request
    const serviceRequest = {
      customer_id: customerId,
      category: 'Electrical',
      title: 'Install Ceiling Fan',
      description: 'Need to install a new ceiling fan in the living room. Have the fan already, just need installation.',
      urgency: 'normal',
      address_line_1: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      zip_code: '90210',
      budget_range: '$100 - $500',
      status: 'open',
      requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    };

    console.log('🛠 Creating sample service request...');
    const serviceResponse = await supaFetch('service_requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceRequest)
    });

    if (serviceResponse.ok) {
      const createdRequest = await serviceResponse.json();
      console.log(`✅ Created service request: ${createdRequest[0].title}`);

      // Create a sample response to the service request
      const serviceResponseData = {
        service_request_id: createdRequest[0].id,
        contractor_company_id: 'demo-company-id',
        quoted_amount: 275.00,
        estimated_duration: '2 hours',
        availability: 'Available this week',
        message: 'I can install your ceiling fan this week. I have experience with electrical work and am licensed. The quoted price includes installation and cleanup.',
        status: 'pending',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      };

      const responseResponse = await supaFetch('service_request_responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceResponseData)
      });

      if (responseResponse.ok) {
        console.log('✅ Created service request response');
      }
    }

    // 7. Create sample messages
    const messages = [
      {
        customer_id: customerId,
        content: 'Hi, I have a question about the kitchen renovation quote.',
        message_type: 'customer_to_company',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        customer_id: customerId,
        content: 'Hello! I\'d be happy to answer any questions about your kitchen renovation. What would you like to know?',
        message_type: 'company_to_customer',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString() // 2 hours later
      },
      {
        customer_id: customerId,
        content: 'Can we schedule a time to discuss the timeline and material options?',
        message_type: 'customer_to_company',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    console.log('💬 Creating sample messages...');
    for (const message of messages) {
      const messageResponse = await supaFetch('messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      if (messageResponse.ok) {
        console.log('✅ Created message');
      }
    }

    console.log('\n🎉 Demo data setup complete!');
    console.log('\n📋 Demo Account Details:');
    console.log(`Email: john.smith@example.com`);
    console.log(`Customer ID: ${customerId}`);
    console.log(`Portal Account ID: ${portalAccount[0].id}`);
    console.log('\n🔗 You can now test the customer portal at /portal');
    console.log('💡 Use any password or request a magic link for login');

  } catch (error) {
    console.error('❌ Error setting up demo data:', error);
    process.exit(1);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupPortalDemo();
}

module.exports = { setupPortalDemo };
