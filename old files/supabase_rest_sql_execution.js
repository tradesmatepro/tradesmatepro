const fetch = require('node-fetch');

// Supabase configuration
const SUPABASE_URL = 'https://amgtktrwpdsigcomavlg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';

async function executeSQL(sql) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
            body: JSON.stringify({ sql })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.log(`   ❌ SQL execution failed: ${error.message}`);
        throw error;
    }
}

async function executeSupabaseRestFix() {
    console.log('🚀 EXECUTING SUPABASE REST API FIX FOR TRADEMATE PRO');
    console.log('=' .repeat(70));
    console.log('📋 Using Supabase REST API with service key');
    console.log('📋 Target: Fix all 44 network errors');
    console.log('');

    try {
        // PHASE 1: Create Missing Sales/CRM Tables
        console.log('📋 PHASE 1: CREATING MISSING SALES/CRM TABLES');
        console.log('-'.repeat(50));
        
        const salesTablesSQL = `
        -- 1. Leads table for lead management
        CREATE TABLE IF NOT EXISTS public.leads (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
            
            -- Lead Information
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            company_name TEXT,
            
            -- Lead Source & Attribution  
            source TEXT DEFAULT 'unknown',
            source_details JSONB DEFAULT '{}',
            utm_data JSONB DEFAULT '{}',
            
            -- Lead Qualification
            status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost')),
            temperature TEXT DEFAULT 'cold' CHECK (temperature IN ('hot', 'warm', 'cold')),
            score INTEGER DEFAULT 0,
            
            -- Assignment & Tracking
            assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
            last_contact_date DATE,
            next_contact_date DATE,
            
            -- Audit fields
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- 2. Opportunities table for sales pipeline
        CREATE TABLE IF NOT EXISTS public.opportunities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
            
            -- Opportunity Details
            name TEXT NOT NULL,
            description TEXT,
            customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
            lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
            quote_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
            
            -- Sales Pipeline
            stage TEXT NOT NULL DEFAULT 'prospecting' CHECK (stage IN (
                'prospecting', 'qualification', 'needs_analysis', 'proposal', 
                'negotiation', 'closed_won', 'closed_lost'
            )),
            probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
            expected_value DECIMAL(10,2),
            actual_value DECIMAL(10,2),
            expected_close_date DATE,
            actual_close_date DATE,
            
            -- Assignment
            assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
            
            -- Status
            status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'on_hold')),
            win_loss_reason TEXT,
            competitor TEXT,
            
            -- Audit fields
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- 3. Sales activities table for communication tracking
        CREATE TABLE IF NOT EXISTS public.sales_activities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
            
            -- Activity Details
            type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 'note', 'sms')),
            subject TEXT NOT NULL,
            description TEXT,
            
            -- Relationships
            lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
            customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
            opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
            quote_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
            
            -- Activity Data
            duration_minutes INTEGER,
            outcome TEXT,
            next_action TEXT,
            next_action_date DATE,
            
            -- Assignment
            performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
            
            -- Scheduling
            scheduled_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            
            -- Audit fields
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
        `;

        await executeSQL(salesTablesSQL);
        console.log('   ✅ Phase 1 completed: Sales/CRM tables created');

        // PHASE 2: Create Missing Customer Management Tables
        console.log('\n📋 PHASE 2: CREATING MISSING CUSTOMER MANAGEMENT TABLES');
        console.log('-'.repeat(50));
        
        const customerTablesSQL = `
        -- 1. Customer service agreements
        CREATE TABLE IF NOT EXISTS public.customer_service_agreements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
            customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
            
            -- Agreement Details
            agreement_type TEXT NOT NULL CHECK (agreement_type IN ('maintenance', 'warranty', 'service_plan', 'contract')),
            title TEXT NOT NULL,
            description TEXT,
            
            -- Terms
            start_date DATE NOT NULL,
            end_date DATE,
            auto_renew BOOLEAN DEFAULT false,
            renewal_period_months INTEGER,
            
            -- Financial
            monthly_fee DECIMAL(10,2),
            annual_fee DECIMAL(10,2),
            service_discount_percentage DECIMAL(5,2),
            
            -- Status
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
            
            -- Terms and conditions
            terms TEXT,
            notes TEXT,
            
            -- Audit fields
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- 2. Customer tags
        CREATE TABLE IF NOT EXISTS public.customer_tags (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
            
            -- Tag Details
            name TEXT NOT NULL,
            description TEXT,
            color TEXT DEFAULT '#3B82F6',
            
            -- Status
            is_active BOOLEAN DEFAULT true,
            
            -- Audit fields
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            
            -- Ensure unique tag names per company
            UNIQUE(company_id, name)
        );

        -- 3. Customer tag assignments (many-to-many)
        CREATE TABLE IF NOT EXISTS public.customer_tag_assignments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
            tag_id UUID NOT NULL REFERENCES public.customer_tags(id) ON DELETE CASCADE,
            assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT now(),
            
            -- Ensure unique assignments
            UNIQUE(customer_id, tag_id)
        );

        -- 4. Customer communications
        CREATE TABLE IF NOT EXISTS public.customer_communications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
            customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
            user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
            
            -- Communication Details
            type TEXT NOT NULL CHECK (type IN ('email', 'phone', 'sms', 'meeting', 'note', 'letter', 'chat')),
            subject TEXT,
            content TEXT,
            
            -- Direction and status
            direction TEXT CHECK (direction IN ('inbound', 'outbound')),
            status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'failed', 'cancelled')),
            
            -- Scheduling
            scheduled_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            
            -- Attachments and metadata
            attachments JSONB DEFAULT '[]',
            metadata JSONB DEFAULT '{}',
            
            -- Audit fields
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
        `;

        await executeSQL(customerTablesSQL);
        console.log('   ✅ Phase 2 completed: Customer management tables created');

        // PHASE 3: Create Missing Quote Enhancement Tables
        console.log('\n📋 PHASE 3: CREATING MISSING QUOTE ENHANCEMENT TABLES');
        console.log('-'.repeat(50));
        
        const quoteTablesSQL = `
        -- 1. Quote follow-ups
        CREATE TABLE IF NOT EXISTS public.quote_follow_ups (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
            work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
            user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
            
            -- Follow-up Details
            scheduled_date DATE NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('call', 'email', 'visit', 'proposal', 'reminder')),
            subject TEXT,
            notes TEXT,
            
            -- Status
            status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
            completed_at TIMESTAMPTZ,
            outcome TEXT,
            next_follow_up_date DATE,
            
            -- Audit fields
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- 2. Quote analytics
        CREATE TABLE IF NOT EXISTS public.quote_analytics (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
            work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
            customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
            
            -- Analytics Data
            views_count INTEGER DEFAULT 0,
            time_to_decision_days INTEGER,
            conversion_probability DECIMAL(5,2),
            
            -- Competitive Analysis
            competitor_info TEXT,
            win_loss_reason TEXT,
            price_sensitivity_notes TEXT,
            
            -- Customer Behavior
            customer_engagement_score INTEGER DEFAULT 0,
            follow_up_response_rate DECIMAL(5,2),
            
            -- Audit fields
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- 3. Quote approval workflows
        CREATE TABLE IF NOT EXISTS public.quote_approval_workflows (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
            work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
            user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
            
            -- Approval Details
            approver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
            approval_level INTEGER DEFAULT 1,
            required_approval_amount DECIMAL(10,2),
            
            -- Status
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
            comments TEXT,
            rejection_reason TEXT,
            
            -- Timing
            submitted_at TIMESTAMPTZ DEFAULT now(),
            approved_at TIMESTAMPTZ,
            rejected_at TIMESTAMPTZ,
            
            -- Audit fields
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
        `;

        await executeSQL(quoteTablesSQL);
        console.log('   ✅ Phase 3 completed: Quote enhancement tables created');

        console.log('\n🎉 CORE TABLES CREATED SUCCESSFULLY!');
        console.log('=' .repeat(70));
        console.log('✅ Sales/CRM tables: leads, opportunities, sales_activities');
        console.log('✅ Customer management tables: customer_service_agreements, customer_tags, customer_communications');
        console.log('✅ Quote enhancement tables: quote_follow_ups, quote_analytics, quote_approval_workflows');
        console.log('');
        console.log('📋 Next: Creating indexes, views, and RPC functions...');

    } catch (error) {
        console.log('❌ Error during execution:', error.message);
        throw error;
    }
}

executeSupabaseRestFix().catch(console.error);
