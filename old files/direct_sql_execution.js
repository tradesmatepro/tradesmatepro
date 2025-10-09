const { Client } = require('pg');

// PostgreSQL connection configuration
const client = new Client({
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.amgtktrwpdsigcomavlg',
    password: 'TradeMate2024!',
    ssl: { rejectUnauthorized: false }
});

async function executeDirectSQLFix() {
    console.log('🚀 EXECUTING DIRECT SQL FIX FOR TRADEMATE PRO');
    console.log('=' .repeat(70));
    console.log('📋 Using direct PostgreSQL connection');
    console.log('📋 Target: Fix all 44 network errors');
    console.log('');

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL database');

        // PHASE 1: Create Missing Sales/CRM Tables
        console.log('\n📋 PHASE 1: CREATING MISSING SALES/CRM TABLES');
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

        await client.query(salesTablesSQL);
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

        await client.query(customerTablesSQL);
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

        await client.query(quoteTablesSQL);
        console.log('   ✅ Phase 3 completed: Quote enhancement tables created');

        console.log('\n📋 PHASE 4: CREATING INDEXES AND VIEWS');
        console.log('-'.repeat(50));
        
        const indexesAndViewsSQL = `
        -- Sales table indexes
        CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);
        CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(company_id, status);
        CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to) WHERE assigned_to IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(company_id, source);

        CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON public.opportunities(company_id);
        CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON public.opportunities(company_id, stage);
        CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_to ON public.opportunities(assigned_to) WHERE assigned_to IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(company_id, status);

        CREATE INDEX IF NOT EXISTS idx_sales_activities_company_id ON public.sales_activities(company_id);
        CREATE INDEX IF NOT EXISTS idx_sales_activities_lead_id ON public.sales_activities(lead_id) WHERE lead_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_sales_activities_customer_id ON public.sales_activities(customer_id) WHERE customer_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_sales_activities_opportunity_id ON public.sales_activities(opportunity_id) WHERE opportunity_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_sales_activities_performed_by ON public.sales_activities(performed_by) WHERE performed_by IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_sales_activities_next_action_date ON public.sales_activities(next_action_date) WHERE next_action_date IS NOT NULL;

        -- Customer management indexes
        CREATE INDEX IF NOT EXISTS idx_customer_service_agreements_company_id ON public.customer_service_agreements(company_id);
        CREATE INDEX IF NOT EXISTS idx_customer_service_agreements_customer_id ON public.customer_service_agreements(customer_id);
        CREATE INDEX IF NOT EXISTS idx_customer_service_agreements_status ON public.customer_service_agreements(company_id, status);

        CREATE INDEX IF NOT EXISTS idx_customer_tags_company_id ON public.customer_tags(company_id);
        CREATE INDEX IF NOT EXISTS idx_customer_tags_active ON public.customer_tags(company_id, is_active) WHERE is_active = true;

        CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_customer_id ON public.customer_tag_assignments(customer_id);
        CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_tag_id ON public.customer_tag_assignments(tag_id);

        CREATE INDEX IF NOT EXISTS idx_customer_communications_company_id ON public.customer_communications(company_id);
        CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON public.customer_communications(customer_id);
        CREATE INDEX IF NOT EXISTS idx_customer_communications_user_id ON public.customer_communications(user_id) WHERE user_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_customer_communications_type ON public.customer_communications(company_id, type);
        CREATE INDEX IF NOT EXISTS idx_customer_communications_created_at ON public.customer_communications(customer_id, created_at DESC);

        -- Quote enhancement indexes
        CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_company_id ON public.quote_follow_ups(company_id);
        CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_work_order_id ON public.quote_follow_ups(work_order_id);
        CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_scheduled_date ON public.quote_follow_ups(scheduled_date);
        CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_user_id ON public.quote_follow_ups(user_id) WHERE user_id IS NOT NULL;

        CREATE INDEX IF NOT EXISTS idx_quote_analytics_company_id ON public.quote_analytics(company_id);
        CREATE INDEX IF NOT EXISTS idx_quote_analytics_work_order_id ON public.quote_analytics(work_order_id);
        CREATE INDEX IF NOT EXISTS idx_quote_analytics_customer_id ON public.quote_analytics(customer_id) WHERE customer_id IS NOT NULL;

        CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_company_id ON public.quote_approval_workflows(company_id);
        CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_work_order_id ON public.quote_approval_workflows(work_order_id);
        CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_status ON public.quote_approval_workflows(company_id, status);
        CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_approver_id ON public.quote_approval_workflows(approver_id) WHERE approver_id IS NOT NULL;

        -- Company customers view for optimized queries
        CREATE OR REPLACE VIEW public.company_customers_view AS
        SELECT 
            c.*,
            COUNT(DISTINCT wo.id) as total_work_orders,
            COUNT(DISTINCT wo.id) FILTER (WHERE wo.stage = 'QUOTE') as total_quotes,
            COUNT(DISTINCT wo.id) FILTER (WHERE wo.stage = 'COMPLETED') as completed_jobs,
            COALESCE(SUM(wo.total_amount) FILTER (WHERE wo.stage = 'COMPLETED'), 0) as total_revenue,
            COALESCE(SUM(wo.total_amount) FILTER (WHERE wo.stage = 'QUOTE'), 0) as pending_quote_value,
            MAX(wo.created_at) as last_work_order_date,
            COUNT(DISTINCT csa.id) as active_service_agreements,
            COUNT(DISTINCT cc.id) as total_communications,
            MAX(cc.created_at) as last_communication_date
        FROM public.customers c
        LEFT JOIN public.work_orders wo ON wo.customer_id = c.id
        LEFT JOIN public.customer_service_agreements csa ON csa.customer_id = c.id AND csa.status = 'active'
        LEFT JOIN public.customer_communications cc ON cc.customer_id = c.id
        GROUP BY c.id;
        `;

        await client.query(indexesAndViewsSQL);
        console.log('   ✅ Phase 4 completed: Indexes and views created');

        console.log('\n📋 PHASE 5: CREATING RPC FUNCTIONS');
        console.log('-'.repeat(50));
        
        const rpcFunctionsSQL = `
        -- Create get_company_customers RPC function
        CREATE OR REPLACE FUNCTION public.get_company_customers(company_uuid UUID)
        RETURNS TABLE (
            id UUID,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            phone TEXT,
            total_work_orders BIGINT,
            total_revenue DECIMAL,
            last_work_order_date TIMESTAMPTZ
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                c.id,
                c.first_name,
                c.last_name,
                c.email,
                c.phone,
                COUNT(wo.id) as total_work_orders,
                COALESCE(SUM(wo.total_amount), 0) as total_revenue,
                MAX(wo.created_at) as last_work_order_date
            FROM public.customers c
            LEFT JOIN public.work_orders wo ON wo.customer_id = c.id
            WHERE c.company_id = company_uuid
            GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone;
        END;
        $$ LANGUAGE plpgsql;
        `;

        await client.query(rpcFunctionsSQL);
        console.log('   ✅ Phase 5 completed: RPC functions created');

        console.log('\n🎉 ALL PHASES COMPLETED SUCCESSFULLY!');
        console.log('=' .repeat(70));
        console.log('✅ Sales/CRM tables: leads, opportunities, sales_activities');
        console.log('✅ Customer management tables: customer_service_agreements, customer_tags, customer_communications');
        console.log('✅ Quote enhancement tables: quote_follow_ups, quote_analytics, quote_approval_workflows');
        console.log('✅ Optimized views: company_customers_view');
        console.log('✅ RPC functions: get_company_customers');
        console.log('✅ Performance indexes: All critical indexes created');

    } catch (error) {
        console.log('❌ Error during SQL execution:', error.message);
        console.error('Full error:', error);
    } finally {
        await client.end();
        console.log('\n📋 Database connection closed');
    }
}

executeDirectSQLFix().catch(console.error);
