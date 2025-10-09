import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { companyName, ownerFirstName, ownerLastName, ownerEmail, ownerPhone, tempPassword } = await req.json();

    console.log('🚀 Starting company creation workflow...');
    console.log('📝 Data received:', { companyName, ownerFirstName, ownerLastName, ownerEmail, ownerPhone });

    // Step A. Create company
    console.log('🏢 Step A: Creating company:', companyName);
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({ name: companyName })
      .select()
      .single();
    
    if (companyError) {
      console.error('❌ Company creation failed:', companyError);
      throw companyError;
    }
    console.log('✅ Company created:', company);

    // Step B. Create auth user
    console.log('👤 Step B: Creating auth user for:', ownerEmail);
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: ownerEmail,
      password: tempPassword,
      email_confirm: true,
    });
    
    if (authError) {
      console.error('❌ Auth user creation failed:', authError);
      // Rollback company
      await supabase.from("companies").delete().eq("id", company.id);
      throw authError;
    }
    console.log('✅ Auth user created:', authUser.user.id);

    // Step C. Create profile
    console.log('📋 Step C: Creating owner profile for user:', authUser.user.id);
    const profileData = {
      id: authUser.user.id,
      company_id: company.id,
      role: "OWNER",
      full_name: `${ownerFirstName} ${ownerLastName}`,
      phone: ownerPhone || null,
    };
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert(profileData)
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      // Rollback auth user and company
      await supabase.auth.admin.deleteUser(authUser.user.id);
      await supabase.from("companies").delete().eq("id", company.id);
      throw profileError;
    }
    console.log('✅ Profile created:', profile);

    // Step D. Link company to owner
    console.log('🔗 Step D: Linking company to owner profile');
    const { error: linkError } = await supabase
      .from("companies")
      .update({ owner_profile_id: profile.id })
      .eq("id", company.id);
    
    if (linkError) {
      console.error('❌ Company linking failed:', linkError);
      // Note: We could rollback here, but the core data is created successfully
      console.warn('⚠️ Company created but linking failed - this can be fixed manually');
    } else {
      console.log('✅ Company linked to owner profile');
    }

    console.log('🎉 Company creation workflow completed successfully!');
    
    return new Response(JSON.stringify({
      success: true,
      company,
      profile,
      authUser: { id: authUser.user.id, email: authUser.user.email }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ Failed to create company + owner:", err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Unknown error occurred'
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
