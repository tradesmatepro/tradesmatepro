import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      to,
      subject,
      html,
      from,
      cc,
      bcc,
      reply_to,
      tags,
      attachments,
      companyId,
      quoteId,
    } = body || {};

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Resend API from the Edge Function (server-side)
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from || `TradeMate Pro <quotes@updates.tradesmatepro.com>`
        , to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(cc ? { cc } : {}),
        ...(bcc ? { bcc } : {}),
        ...(reply_to ? { reply_to } : {}),
        ...(tags ? { tags } : {}),
        ...(attachments ? { attachments } : {}),
      }),
    });

    const resendData = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(
        JSON.stringify({ success: false, error: resendData }),
        { status: resendRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optionally update the quote as sent (server-side ensures auditability)
    if (companyId && quoteId) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("work_orders")
          .update({
            status: "sent",
            sent_at: now,
            sent_via: ["email"],
            sent_to_email: Array.isArray(to) ? to[0] : to,
            email_id: resendData.id,
            updated_at: now,
          })
          .eq("id", quoteId)
          .eq("company_id", companyId);

        if (error) {
          console.error("Failed to update work_order as sent:", error);
        } else {
          console.log("✅ Quote status updated to 'sent'");
        }
      } catch (e) {
        console.error("Failed to update work_order as sent:", e);
        // Non-fatal: email already sent
      }
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-quote-email function failed:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

