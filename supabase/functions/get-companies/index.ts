import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Environment-based CORS configuration
const isDev = Deno.env.get("ENVIRONMENT") !== "production";
const corsHeaders = {
  "Access-Control-Allow-Origin": isDev ? "http://localhost:3003" : "https://app.tradesmate.com",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🏢 Fetching companies with owner profiles...');

    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });

    if (companiesError) {
      console.error('❌ Error fetching companies:', companiesError);
      throw companiesError;
    }

    // For each company, get the owner profile
    const companiesWithOwners = await Promise.all(
      (companies || []).map(async (company) => {
        try {
          // Find owner profile for this company
          const { data: ownerProfile, error: profileError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, phone")
            .eq("company_id", company.id)
            .eq("role", "OWNER")
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching owner profile:', profileError);
          }

          // Get owner email from auth.users
          let ownerEmail = 'N/A';
          if (ownerProfile?.id) {
            try {
              const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(ownerProfile.id);
              if (!authError && authUser?.user?.email) {
                ownerEmail = authUser.user.email;
              }
            } catch (error) {
              console.error('Error fetching owner email:', error);
            }
          }

          return {
            ...company,
            owner_profile: ownerProfile,
            owner_email: ownerEmail
          };
        } catch (error) {
          console.error('Error processing company:', error);
          return {
            ...company,
            owner_profile: null,
            owner_email: 'N/A'
          };
        }
      })
    );

    console.log('✅ Companies fetched successfully:', companiesWithOwners.length);

    return new Response(JSON.stringify({ 
      success: true,
      companies: companiesWithOwners
    }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ Failed to fetch companies:", err);
    return new Response(JSON.stringify({ 
      success: false,
      error: err.message || 'Unknown error occurred'
    }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
