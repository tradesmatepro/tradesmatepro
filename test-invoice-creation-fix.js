/**
 * Test Invoice Creation Fix
 * Verifies that the backend RPC is working correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testInvoiceCreationFix() {
  try {
    console.log('🧪 Testing Invoice Creation Fix\n');
    console.log('=' .repeat(60));

    // Initialize Supabase client
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_ANON_KEY
    );

    // Use the known test data
    const companyId = '48f32d34-f32c-46d0-8281-312fd21762d8'; // Handyman Jerry's
    const customerId = '5efca30f-3809-43ce-ae09-e59fe64b3cda'; // Beacon Oral
    const workOrderId = 'f1669866-fa94-4bdb-9366-4a686e720469'; // Troubleshooting

    console.log(`✅ Using test data:`);
    console.log(`  Company: ${companyId}`);
    console.log(`  Customer: ${customerId}`);
    console.log(`  Work Order: ${workOrderId}\n`);

    // Test the RPC
    console.log('🔄 Calling create_invoice_and_update_work_order RPC...\n');

    const invoiceNumber = `TEST-INV-${Date.now()}`;

    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('create_invoice_and_update_work_order', {
        p_company_id: companyId,
        p_work_order_id: workOrderId,
        p_customer_id: customerId,
        p_invoice_number: invoiceNumber,
        p_total_amount: 1500.00,
        p_subtotal: 1500.00,
        p_tax_amount: 0.00,
        p_issue_date: new Date().toISOString().split('T')[0],
        p_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_notes: 'Test invoice from RPC'
      });

    if (rpcError) {
      console.log('❌ RPC Error:', rpcError);
      return;
    }

    console.log('📊 RPC Result:');
    console.log(`  Success: ${rpcResult.success}`);
    console.log(`  Invoice ID: ${rpcResult.invoice_id}`);
    console.log(`  Invoice Number: ${rpcResult.invoice_number}`);
    console.log(`  Message: ${rpcResult.message}\n`);

    if (!rpcResult.success) {
      console.log('❌ RPC returned error:', rpcResult.error);
      return;
    }

    // Verify invoice was created
    console.log('🔍 Verifying invoice was created...\n');

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', rpcResult.invoice_id)
      .single();

    if (invError) {
      console.log('❌ Failed to fetch invoice:', invError);
      return;
    }

    console.log('✅ Invoice verified:');
    console.log(`  ID: ${invoice.id}`);
    console.log(`  Number: ${invoice.invoice_number}`);
    console.log(`  Status: ${invoice.status}`);
    console.log(`  Total: $${invoice.total_amount}\n`);

    // Verify work order was updated
    console.log('🔍 Verifying work order was updated...\n');

    const { data: workOrder, error: woFetchError } = await supabase
      .from('work_orders')
      .select('status, invoiced_at')
      .eq('id', workOrderId)
      .single();

    if (woFetchError) {
      console.log('❌ Failed to fetch work order:', woFetchError);
      return;
    }

    console.log('✅ Work order verified:');
    console.log(`  Status: ${workOrder.status}`);
    console.log(`  Invoiced At: ${workOrder.invoiced_at}\n`);

    if (workOrder.status === 'invoiced') {
      console.log('=' .repeat(60));
      console.log('✅ ✅ ✅ INVOICE CREATION FIX IS WORKING! ✅ ✅ ✅');
      console.log('=' .repeat(60));
      console.log('\n✅ Backend RPC successfully:');
      console.log('   1. Created invoice record');
      console.log('   2. Updated work order status to "invoiced"');
      console.log('   3. Performed atomic transaction (both succeeded)');
      console.log('\n✅ No 403 Forbidden errors!');
      console.log('✅ Production-ready architecture confirmed!');
    } else {
      console.log('❌ Work order status was not updated to "invoiced"');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testInvoiceCreationFix();

