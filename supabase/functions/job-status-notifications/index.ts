// =====================================================
// Job Status Notifications Edge Function
// Sends notifications for jobs that need status updates
// Can be called via cron job or manually
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobNotification {
  id: string;
  title: string;
  work_order_number: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  assigned_to: string;
  customer_name: string;
  notification_type: 'should_start' | 'should_complete' | 'upcoming';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
    const notifications: JobNotification[] = [];

    // 1. Find jobs scheduled to start within 15 minutes (status = 'scheduled')
    const { data: upcomingJobs, error: upcomingError } = await supabaseClient
      .from('work_orders')
      .select(`
        id,
        title,
        work_order_number,
        scheduled_start,
        scheduled_end,
        status,
        assigned_to,
        customers (
          name
        )
      `)
      .eq('status', 'scheduled')
      .gte('scheduled_start', now.toISOString())
      .lte('scheduled_start', fifteenMinutesFromNow.toISOString());

    if (upcomingError) {
      console.error('Error fetching upcoming jobs:', upcomingError);
    } else if (upcomingJobs && upcomingJobs.length > 0) {
      upcomingJobs.forEach(job => {
        notifications.push({
          id: job.id,
          title: job.title,
          work_order_number: job.work_order_number,
          scheduled_start: job.scheduled_start,
          scheduled_end: job.scheduled_end,
          status: job.status,
          assigned_to: job.assigned_to,
          customer_name: job.customers?.name || 'Unknown',
          notification_type: 'upcoming'
        });
      });
    }

    // 2. Find jobs that should have started but haven't (status = 'scheduled', scheduled_start < now)
    const { data: shouldStartJobs, error: shouldStartError } = await supabaseClient
      .from('work_orders')
      .select(`
        id,
        title,
        work_order_number,
        scheduled_start,
        scheduled_end,
        status,
        assigned_to,
        customers (
          name
        )
      `)
      .eq('status', 'scheduled')
      .lt('scheduled_start', now.toISOString());

    if (shouldStartError) {
      console.error('Error fetching should-start jobs:', shouldStartError);
    } else if (shouldStartJobs && shouldStartJobs.length > 0) {
      shouldStartJobs.forEach(job => {
        notifications.push({
          id: job.id,
          title: job.title,
          work_order_number: job.work_order_number,
          scheduled_start: job.scheduled_start,
          scheduled_end: job.scheduled_end,
          status: job.status,
          assigned_to: job.assigned_to,
          customer_name: job.customers?.name || 'Unknown',
          notification_type: 'should_start'
        });
      });
    }

    // 3. Find jobs that should be completed (status = 'in_progress', scheduled_end < now)
    const { data: shouldCompleteJobs, error: shouldCompleteError } = await supabaseClient
      .from('work_orders')
      .select(`
        id,
        title,
        work_order_number,
        scheduled_start,
        scheduled_end,
        status,
        assigned_to,
        customers (
          name
        )
      `)
      .eq('status', 'in_progress')
      .lt('scheduled_end', now.toISOString());

    if (shouldCompleteError) {
      console.error('Error fetching should-complete jobs:', shouldCompleteError);
    } else if (shouldCompleteJobs && shouldCompleteJobs.length > 0) {
      shouldCompleteJobs.forEach(job => {
        notifications.push({
          id: job.id,
          title: job.title,
          work_order_number: job.work_order_number,
          scheduled_start: job.scheduled_start,
          scheduled_end: job.scheduled_end,
          status: job.status,
          assigned_to: job.assigned_to,
          customer_name: job.customers?.name || 'Unknown',
          notification_type: 'should_complete'
        });
      });
    }

    // 4. Send notifications (placeholder - implement actual notification logic)
    // This could be:
    // - Browser push notifications via web push API
    // - Email notifications via Resend/SendGrid
    // - SMS notifications via Twilio
    // - In-app notifications stored in database

    // For now, just log and return the notifications
    console.log(`Found ${notifications.length} notifications to send:`, notifications);

    // Optional: Store notifications in database for in-app display
    if (notifications.length > 0) {
      const notificationRecords = notifications.map(notif => ({
        user_id: notif.assigned_to,
        type: notif.notification_type,
        title: getNotificationTitle(notif),
        message: getNotificationMessage(notif),
        data: {
          work_order_id: notif.id,
          work_order_number: notif.work_order_number
        },
        read: false,
        created_at: new Date().toISOString()
      }));

      // Uncomment when notifications table exists
      // const { error: insertError } = await supabaseClient
      //   .from('notifications')
      //   .insert(notificationRecords);
      
      // if (insertError) {
      //   console.error('Error inserting notifications:', insertError);
      // }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_count: notifications.length,
        notifications: notifications,
        timestamp: now.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in job-status-notifications function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper functions for notification messages
function getNotificationTitle(notif: JobNotification): string {
  switch (notif.notification_type) {
    case 'upcoming':
      return '📅 Job Starting Soon';
    case 'should_start':
      return '⚠️ Job Should Have Started';
    case 'should_complete':
      return '⏰ Job Past Scheduled End Time';
    default:
      return 'Job Status Update';
  }
}

function getNotificationMessage(notif: JobNotification): string {
  const startTime = new Date(notif.scheduled_start).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  switch (notif.notification_type) {
    case 'upcoming':
      return `Job "${notif.title}" for ${notif.customer_name} starts at ${startTime}`;
    case 'should_start':
      return `Job "${notif.title}" for ${notif.customer_name} was scheduled to start at ${startTime} but hasn't been marked as started`;
    case 'should_complete':
      const endTime = new Date(notif.scheduled_end).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `Job "${notif.title}" for ${notif.customer_name} was scheduled to end at ${endTime} but hasn't been marked as completed`;
    default:
      return `Job "${notif.title}" needs attention`;
  }
}

