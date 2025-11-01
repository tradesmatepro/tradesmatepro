import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const { companyName, ownerFirstName, ownerLastName, ownerEmail, ownerPhone, ownerRole, tempPassword } = await req.json()

    console.log('Creating company:', companyName, 'for owner:', ownerEmail)

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: ownerEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: ownerFirstName,
        last_name: ownerLastName,
        role: ownerRole
      }
    })

    if (authError) {
      console.error('Auth user creation failed:', authError)
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    const authUserId = authData.user.id
    console.log('Auth user created:', authUserId)

    // Step 2: Create company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({ name: companyName })
      .select()
      .single()

    if (companyError) {
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      throw new Error(`Failed to create company: ${companyError.message}`)
    }

    console.log('Company created:', company.company_number)

    // Step 3: Create users record
    const { data: userRecord, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUserId,
        email: ownerEmail,
        company_id: company.id,
        role: ownerRole,
        status: 'active',
        first_name: ownerFirstName,
        last_name: ownerLastName,
        phone: ownerPhone
      })
      .select()
      .single()

    if (userError) {
      // Rollback: delete company and auth user
      await supabaseAdmin.from('companies').delete().eq('id', company.id)
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      throw new Error(`Failed to create user record: ${userError.message}`)
    }

    console.log('User record created:', userRecord.id)

    // Step 4: Create profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userRecord.id,
        first_name: ownerFirstName,
        last_name: ownerLastName,
        phone: ownerPhone,
        role: ownerRole,
        company_id: company.id
      })
      .select()
      .single()

    if (profileError) {
      // Rollback: delete user, company, and auth user
      await supabaseAdmin.from('users').delete().eq('id', userRecord.id)
      await supabaseAdmin.from('companies').delete().eq('id', company.id)
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    console.log('Profile created')

    return new Response(
      JSON.stringify({
        success: true,
        company,
        authUser: { id: authUserId, email: ownerEmail },
        userRecord,
        profile
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Company creation failed:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

