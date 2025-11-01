import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // tighten in prod
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

type AdminListUsersInput = {
  limit?: number
  search?: string
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    )

    // Verify caller
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: userRes, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !userRes?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const caller = userRes.user

    // Determine caller app-role and company scope
    // 1) Try users table by email
    const { data: appUser } = await supabaseAdmin
      .from('users')
      .select('id, email, role, company_id')
      .eq('email', caller.email ?? '')
      .maybeSingle()

    // 2) Fallback to employees by auth user id
    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('company_id, role')
      .eq('user_id', caller.id)
      .maybeSingle()

    const callerRole = (appUser?.role || employee?.role || '').toUpperCase()
    const callerCompanyId = appUser?.company_id || employee?.company_id || null

    // Enforce permissions
    // APP_OWNER => global access; OWNER/ADMIN => scoped to own company; others => forbidden
    const isSuperUser = callerRole === 'APP_OWNER'
    const isCompanyAdmin = ['OWNER', 'ADMIN'].includes(callerRole)

    if (!isSuperUser && !isCompanyAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Parse input
    let input: AdminListUsersInput = {}
    try {
      input = await req.json()
    } catch (_) {}

    const limit = Math.min(Math.max(parseInt(String(input.limit ?? 200)), 1), 1000) // 1..1000
    const search = (input.search ?? '').trim()

    // Base users query
    let usersQuery = supabaseAdmin
      .from('users')
      .select('id, email, role, status, created_at, company_id')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!isSuperUser && callerCompanyId) {
      usersQuery = usersQuery.eq('company_id', callerCompanyId)
    }

    if (search) {
      // simple ilike filters on email and full_name if present
      usersQuery = usersQuery.or(`email.ilike.%${search}%`)
    }

    const { data: users, error: usersErr } = await usersQuery
    if (usersErr) {
      return new Response(JSON.stringify({ error: usersErr.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Fetch related profiles and companies
    const userIds = users.map(u => u.id)
    const companyIds = Array.from(new Set(users.map(u => u.company_id).filter(Boolean)))

    const [{ data: profiles }, { data: companies }] = await Promise.all([
      userIds.length
        ? supabaseAdmin.from('profiles').select('id, first_name, last_name, phone').in('id', userIds)
        : Promise.resolve({ data: [] as any[] } as any),
      companyIds.length
        ? supabaseAdmin.from('companies').select('id, name').in('id', companyIds)
        : Promise.resolve({ data: [] as any[] } as any)
    ])

    const profileMap = new Map<string, any>()
    profiles?.forEach((p: any) => profileMap.set(p.id, p))

    const companyMap = new Map<string, any>()
    companies?.forEach((c: any) => companyMap.set(c.id, c))

    const result = users.map((u: any) => {
      const p = profileMap.get(u.id) || {}
      const c = companyMap.get(u.company_id) || null
      const display_name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim()
      return {
        id: u.id,
        email: u.email,
        role: u.role,
        status: u.status,
        created_at: u.created_at,
        company_id: u.company_id,
        company: c ? { id: c.id, name: c.name } : null,
        display_name,
        phone: p.phone || null
      }
    })

    return new Response(JSON.stringify({ users: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

