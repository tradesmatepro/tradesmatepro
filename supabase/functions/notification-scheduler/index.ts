// ============================================================================
// NOTIFICATION SCHEDULER - Daily Background Job
// ============================================================================
// Purpose: Check for overdue invoices, expired quotes, low inventory, etc.
// Runs: Daily at 9:00 AM via Supabase cron job
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const results = {
      overdueInvoices: 0,
      expiredQuotes: 0,
      lowInventory: 0,
      appointmentReminders: 0,
      errors: []
    }

    // ========================================================================
    // 1. CHECK OVERDUE INVOICES
    // ========================================================================
    try {
      const { data: overdueInvoices, error: invoiceError } = await supabaseAdmin
        .from('work_orders')
        .select('id, company_id, invoice_number, due_date, total_amount, customer_id')
        .eq('status', 'invoiced')
        .lt('due_date', new Date().toISOString())
        .is('paid_at', null)

      if (invoiceError) throw invoiceError

      for (const invoice of overdueInvoices || []) {
        // Check if notification already exists (don't spam)
        const { data: existing } = await supabaseAdmin
          .from('notifications')
          .select('id')
          .eq('company_id', invoice.company_id)
          .eq('data->>category', 'INVOICE_OVERDUE')
          .eq('data->>related_id', invoice.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1)

        if (!existing || existing.length === 0) {
          // Create overdue invoice notification
          await supabaseAdmin
            .from('notifications')
            .insert({
              company_id: invoice.company_id,
              user_id: null, // Broadcast
              type: 'in_app',
              title: 'Invoice Overdue',
              message: `Invoice ${invoice.invoice_number} is overdue (due ${new Date(invoice.due_date).toLocaleDateString()})`,
              data: {
                category: 'INVOICE_OVERDUE',
                severity: 'CRITICAL',
                related_id: invoice.id,
                invoice_number: invoice.invoice_number,
                due_date: invoice.due_date,
                amount: invoice.total_amount
              },
              status: 'pending',
              action_url: `/invoices?id=${invoice.id}`
            })

          results.overdueInvoices++
        }
      }
    } catch (error) {
      results.errors.push(`Overdue invoices: ${error.message}`)
    }

    // ========================================================================
    // 2. CHECK EXPIRED QUOTES
    // ========================================================================
    try {
      const { data: expiredQuotes, error: quoteError } = await supabaseAdmin
        .from('work_orders')
        .select('id, company_id, quote_number, quote_expires_date, total_amount')
        .in('status', ['quote', 'sent'])
        .lt('quote_expires_date', new Date().toISOString())
        .is('quote_accepted_at', null)
        .is('quote_rejected_at', null)

      if (quoteError) throw quoteError

      for (const quote of expiredQuotes || []) {
        // Check if notification already exists
        const { data: existing } = await supabaseAdmin
          .from('notifications')
          .select('id')
          .eq('company_id', quote.company_id)
          .eq('data->>category', 'QUOTE')
          .eq('data->>related_id', quote.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1)

        if (!existing || existing.length === 0) {
          // Create expired quote notification
          await supabaseAdmin
            .from('notifications')
            .insert({
              company_id: quote.company_id,
              user_id: null, // Broadcast
              type: 'in_app',
              title: 'Quote Expired',
              message: `Quote ${quote.quote_number} expired on ${new Date(quote.quote_expires_date).toLocaleDateString()}`,
              data: {
                category: 'QUOTE',
                severity: 'WARNING',
                related_id: quote.id,
                quote_number: quote.quote_number,
                expires_date: quote.quote_expires_date,
                amount: quote.total_amount
              },
              status: 'pending',
              action_url: `/quotes?id=${quote.id}`
            })

          results.expiredQuotes++
        }
      }
    } catch (error) {
      results.errors.push(`Expired quotes: ${error.message}`)
    }

    // ========================================================================
    // 3. CHECK LOW INVENTORY
    // ========================================================================
    try {
      // Get all inventory items with stock levels
      const { data: inventoryItems, error: inventoryError } = await supabaseAdmin
        .from('inventory_items')
        .select(`
          id,
          company_id,
          name,
          item_name,
          reorder_point,
          inventory_stock (
            quantity_on_hand
          )
        `)
        .not('reorder_point', 'is', null)

      if (inventoryError) throw inventoryError

      for (const item of inventoryItems || []) {
        const totalStock = (item.inventory_stock || []).reduce((sum: number, stock: any) => sum + (stock.quantity_on_hand || 0), 0)
        
        if (totalStock <= (item.reorder_point || 0)) {
          // Check if notification already exists
          const { data: existing } = await supabaseAdmin
            .from('notifications')
            .select('id')
            .eq('company_id', item.company_id)
            .eq('data->>category', 'INVENTORY')
            .eq('data->>related_id', item.id)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .limit(1)

          if (!existing || existing.length === 0) {
            // Create low inventory notification
            await supabaseAdmin
              .from('notifications')
              .insert({
                company_id: item.company_id,
                user_id: null, // Broadcast
                type: 'in_app',
                title: totalStock <= 0 ? 'Out of Stock' : 'Low Inventory',
                message: `${item.name || item.item_name} available: ${totalStock} (reorder point: ${item.reorder_point})`,
                data: {
                  category: 'INVENTORY',
                  severity: totalStock <= 0 ? 'CRITICAL' : 'WARNING',
                  related_id: item.id,
                  available: totalStock,
                  reorder_point: item.reorder_point
                },
                status: 'pending',
                action_url: `/inventory?id=${item.id}`
              })

            results.lowInventory++
          }
        }
      }
    } catch (error) {
      results.errors.push(`Low inventory: ${error.message}`)
    }

    // ========================================================================
    // 4. SEND APPOINTMENT REMINDERS (24 hours before)
    // ========================================================================
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0))
      const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999))

      const { data: upcomingAppointments, error: appointmentError } = await supabaseAdmin
        .from('schedule_events')
        .select(`
          id,
          company_id,
          work_order_id,
          employee_id,
          start_time,
          work_orders (
            id,
            work_order_number,
            customer_id,
            customers (
              name,
              company_name
            )
          ),
          employees (
            user_id,
            users (
              first_name,
              last_name
            )
          )
        `)
        .gte('start_time', tomorrowStart.toISOString())
        .lte('start_time', tomorrowEnd.toISOString())

      if (appointmentError) throw appointmentError

      for (const appointment of upcomingAppointments || []) {
        const employee = appointment.employees?.[0]
        const workOrder = appointment.work_orders?.[0]
        const customer = workOrder?.customers?.[0]

        if (employee?.user_id) {
          // Check if notification already exists
          const { data: existing } = await supabaseAdmin
            .from('notifications')
            .select('id')
            .eq('company_id', appointment.company_id)
            .eq('user_id', employee.user_id)
            .eq('data->>category', 'SCHEDULE')
            .eq('data->>related_id', appointment.id)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .limit(1)

          if (!existing || existing.length === 0) {
            // Create appointment reminder
            await supabaseAdmin
              .from('notifications')
              .insert({
                company_id: appointment.company_id,
                user_id: employee.user_id,
                type: 'in_app',
                title: 'Appointment Reminder',
                message: `Upcoming appointment with ${customer?.name || customer?.company_name || 'customer'} tomorrow at ${new Date(appointment.start_time).toLocaleTimeString()}`,
                data: {
                  category: 'SCHEDULE',
                  severity: 'INFO',
                  related_id: appointment.id,
                  work_order_id: appointment.work_order_id,
                  start_time: appointment.start_time
                },
                status: 'pending',
                action_url: `/calendar?date=${new Date(appointment.start_time).toISOString().split('T')[0]}`
              })

            results.appointmentReminders++
          }
        }
      }
    } catch (error) {
      results.errors.push(`Appointment reminders: ${error.message}`)
    }

    // ========================================================================
    // RETURN RESULTS
    // ========================================================================
    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

