import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // dev only, restrict in prod
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { companyId } = await req.json();
    
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    console.log('🏢 Fetching company details for:', companyId);

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name, created_at")
      .eq("id", companyId)
      .single();

    if (companyError) {
      console.error('❌ Error fetching company:', companyError);
      throw companyError;
    }

    // Get all profiles for this company
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, role, phone, created_at")
      .eq("company_id", companyId);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      throw profilesError;
    }

    // Find owner and employees
    const owner = profiles?.find(p => p.role === 'OWNER');
    const employees = profiles?.filter(p => p.role !== 'OWNER') || [];

    // Get owner email from auth.users
    let ownerEmail = 'N/A';
    if (owner?.id) {
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(owner.id);
        if (!authError && authUser?.user?.email) {
          ownerEmail = authUser.user.email;
        }
      } catch (error) {
        console.error('Error fetching owner email:', error);
      }
    }

    // Get employee emails from auth.users
    const employeesWithEmails = await Promise.all(
      employees.map(async (employee) => {
        try {
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(employee.id);
          return {
            ...employee,
            email: (!authError && authUser?.user?.email) ? authUser.user.email : 'N/A'
          };
        } catch (error) {
          console.error('Error fetching employee email:', error);
          return { ...employee, email: 'N/A' };
        }
      })
    );

    const result = {
      ...company,
      owner_profile: owner,
      owner_email: ownerEmail,
      employees: employeesWithEmails
    };

    console.log('✅ Company details fetched successfully');

    return new Response(JSON.stringify({ 
      success: true,
      company: result
    }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ Failed to fetch company details:", err);
    return new Response(JSON.stringify({ 
      success: false,
      error: err.message || 'Unknown error occurred'
    }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
