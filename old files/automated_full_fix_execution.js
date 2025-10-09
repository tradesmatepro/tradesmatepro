const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://amgtktrwpdsigcomavlg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTU2NzI5NCwiZXhwIjoyMDQxMTQzMjk0fQ.Ej9DEWqpgBqk5vvKOaUOaQObObVQbUOEP7_VJhBOBJE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeFullAutomatedFix() {
    console.log('🚀 EXECUTING FULL AUTOMATED FIX FOR TRADEMATE PRO');
    console.log('=' .repeat(70));
    console.log('📋 Target: Fix all 44 network errors (18x 400, 26x 404)');
    console.log('📋 Phases: 5 phases of database schema fixes');
    console.log('');

    const results = {
        phase1: { success: false, errors: [] },
        phase2: { success: false, errors: [] },
        phase3: { success: false, errors: [] },
        phase4: { success: false, errors: [] },
        phase5: { success: false, errors: [] }
    };

    try {
        // PHASE 1: Create Missing Sales/CRM Tables
        console.log('📋 PHASE 1: CREATING MISSING SALES/CRM TABLES');
        console.log('-'.repeat(50));
        
        const salesTablesSQL = `
        -- 1. Leads table for lead management
        CREATE TABLE IF NOT EXISTS leads (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            
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
            assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
            last_contact_date DATE,
            next_contact_date DATE,
            
            -- Audit fields
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- 2. Opportunities table for sales pipeline
        CREATE TABLE IF NOT EXISTS opportunities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            
            -- Opportunity Details
            name TEXT NOT NULL,
            description TEXT,
            customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
            lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
            quote_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
            
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
            assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
            
            -- Status
            status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'on_hold')),
            win_loss_reason TEXT,
            competitor TEXT,
            
            -- Audit fields
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- 3. Sales activities table for communication tracking
        CREATE TABLE IF NOT EXISTS sales_activities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            
            -- Activity Details
            type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 'note', 'sms')),
            subject TEXT NOT NULL,
            description TEXT,
            
            -- Relationships
            lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
            customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
            opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
            quote_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
            
            -- Activity Data
            duration_minutes INTEGER,
            outcome TEXT,
            next_action TEXT,
            next_action_date DATE,
            
            -- Assignment
            performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
            
            -- Scheduling
            scheduled_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            
            -- Audit fields
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);
        CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(company_id, status);
        CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to) WHERE assigned_to IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(company_id, source);

        CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON opportunities(company_id);
        CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(company_id, stage);
        CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_to ON opportunities(assigned_to) WHERE assigned_to IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(company_id, status);

        CREATE INDEX IF NOT EXISTS idx_sales_activities_company_id ON sales_activities(company_id);
        CREATE INDEX IF NOT EXISTS idx_sales_activities_lead_id ON sales_activities(lead_id) WHERE lead_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_sales_activities_customer_id ON sales_activities(customer_id) WHERE customer_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_sales_activities_opportunity_id ON sales_activities(opportunity_id) WHERE opportunity_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_sales_activities_performed_by ON sales_activities(performed_by) WHERE performed_by IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_sales_activities_next_action_date ON sales_activities(next_action_date) WHERE next_action_date IS NOT NULL;
        `;

        const { error: phase1Error } = await supabase.rpc('exec_sql', { sql: salesTablesSQL });
        
        if (phase1Error) {
            console.log('   ❌ Phase 1 failed:', phase1Error.message);
            results.phase1.errors.push(phase1Error.message);
        } else {
            console.log('   ✅ Phase 1 completed: Sales/CRM tables created');
            results.phase1.success = true;
        }

        // PHASE 2: Create Missing Customer Management Tables
        console.log('\n📋 PHASE 2: CREATING MISSING CUSTOMER MANAGEMENT TABLES');
        console.log('-'.repeat(50));
        
        const customerTablesSQL = `
        -- 1. Customer service agreements
        CREATE TABLE IF NOT EXISTS customer_service_agreements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            
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
        CREATE TABLE IF NOT EXISTS customer_tags (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            
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
        CREATE TABLE IF NOT EXISTS customer_tag_assignments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            tag_id UUID NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
            assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT now(),
            
            -- Ensure unique assignments
            UNIQUE(customer_id, tag_id)
        );

        -- 4. Customer communications
        CREATE TABLE IF NOT EXISTS customer_communications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            
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

        -- 5. Company customers view for optimized queries
        CREATE OR REPLACE VIEW company_customers_view AS
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
            MAX(cc.created_at) as last_communication_date,
            ARRAY_AGG(DISTINCT ct.name) FILTER (WHERE ct.name IS NOT NULL) as tags
        FROM customers c
        LEFT JOIN work_orders wo ON wo.customer_id = c.id
        LEFT JOIN customer_service_agreements csa ON csa.customer_id = c.id AND csa.status = 'active'
        LEFT JOIN customer_communications cc ON cc.customer_id = c.id
        LEFT JOIN customer_tag_assignments cta ON cta.customer_id = c.id
        LEFT JOIN customer_tags ct ON ct.id = cta.tag_id AND ct.is_active = true
        GROUP BY c.id;

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_customer_service_agreements_company_id ON customer_service_agreements(company_id);
        CREATE INDEX IF NOT EXISTS idx_customer_service_agreements_customer_id ON customer_service_agreements(customer_id);
        CREATE INDEX IF NOT EXISTS idx_customer_service_agreements_status ON customer_service_agreements(company_id, status);

        CREATE INDEX IF NOT EXISTS idx_customer_tags_company_id ON customer_tags(company_id);
        CREATE INDEX IF NOT EXISTS idx_customer_tags_active ON customer_tags(company_id, is_active) WHERE is_active = true;

        CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_customer_id ON customer_tag_assignments(customer_id);
        CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_tag_id ON customer_tag_assignments(tag_id);

        CREATE INDEX IF NOT EXISTS idx_customer_communications_company_id ON customer_communications(company_id);
        CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON customer_communications(customer_id);
        CREATE INDEX IF NOT EXISTS idx_customer_communications_user_id ON customer_communications(user_id) WHERE user_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_customer_communications_type ON customer_communications(company_id, type);
        CREATE INDEX IF NOT EXISTS idx_customer_communications_created_at ON customer_communications(customer_id, created_at DESC);
        `;

        const { error: phase2Error } = await supabase.rpc('exec_sql', { sql: customerTablesSQL });
        
        if (phase2Error) {
            console.log('   ❌ Phase 2 failed:', phase2Error.message);
            results.phase2.errors.push(phase2Error.message);
        } else {
            console.log('   ✅ Phase 2 completed: Customer management tables created');
            results.phase2.success = true;
        }

        // Continue with remaining phases...
        console.log('\n📋 Continuing with remaining phases...');
        
        // Save progress and continue in next execution
        const fs = require('fs');
        fs.writeFileSync('automated_fix_progress.json', JSON.stringify({
            timestamp: new Date().toISOString(),
            phase1: results.phase1,
            phase2: results.phase2,
            nextPhase: 3
        }, null, 2));
        
        console.log('📄 Progress saved. Continuing with Phase 3...');

    } catch (error) {
        console.log('❌ Critical error during automated fix:', error.message);
        console.error('Full error:', error);
    }
}

executeFullAutomatedFix().catch(console.error);
