-- Profile Page Schema Additions
-- Run this SQL in Supabase SQL Editor to add missing tables for advanced profile features

-- 1. Employee Skills Table
CREATE TABLE IF NOT EXISTS public.employee_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_category TEXT NOT NULL DEFAULT 'technical', -- 'technical', 'soft', 'software', 'certification'
    proficiency_level INTEGER NOT NULL DEFAULT 1 CHECK (proficiency_level >= 1 AND proficiency_level <= 100),
    assessed_by UUID REFERENCES public.users(id),
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(company_id, employee_id, skill_name)
);

-- 2. Employee Certifications Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.employee_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    certification_name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    certification_number TEXT,
    issue_date DATE NOT NULL,
    expiration_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'expiring', 'revoked')),
    verification_url TEXT,
    document_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Employee Performance Reviews Table
CREATE TABLE IF NOT EXISTS public.employee_performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.users(id),
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
    performance_goals_rating DECIMAL(3,2) CHECK (performance_goals_rating >= 0 AND performance_goals_rating <= 5),
    teamwork_rating DECIMAL(3,2) CHECK (teamwork_rating >= 0 AND teamwork_rating <= 5),
    communication_rating DECIMAL(3,2) CHECK (communication_rating >= 0 AND communication_rating <= 5),
    technical_skills_rating DECIMAL(3,2) CHECK (technical_skills_rating >= 0 AND technical_skills_rating <= 5),
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_for_next_period TEXT,
    reviewer_comments TEXT,
    employee_comments TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'finalized')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Employee Goals & Development Table
CREATE TABLE IF NOT EXISTS public.employee_development_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    goal_title TEXT NOT NULL,
    goal_description TEXT,
    goal_category TEXT NOT NULL DEFAULT 'professional' CHECK (goal_category IN ('professional', 'technical', 'leadership', 'certification', 'training')),
    target_completion_date DATE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_by UUID REFERENCES public.users(id),
    notes TEXT,
    completion_notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Employee Recognition & Achievements Table
CREATE TABLE IF NOT EXISTS public.employee_recognition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recognition_type TEXT NOT NULL CHECK (recognition_type IN ('achievement', 'award', 'praise', 'thanks', 'milestone')),
    title TEXT NOT NULL,
    description TEXT,
    given_by UUID REFERENCES public.users(id),
    recognition_date DATE DEFAULT CURRENT_DATE,
    is_public BOOLEAN DEFAULT true,
    points_awarded INTEGER DEFAULT 0,
    badge_icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Employee Time Tracking Summary (for dashboard metrics)
CREATE TABLE IF NOT EXISTS public.employee_time_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    summary_month DATE NOT NULL, -- First day of the month
    total_hours DECIMAL(8,2) DEFAULT 0,
    regular_hours DECIMAL(8,2) DEFAULT 0,
    overtime_hours DECIMAL(8,2) DEFAULT 0,
    pto_hours DECIMAL(8,2) DEFAULT 0,
    working_days INTEGER DEFAULT 0,
    average_daily_hours DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(company_id, employee_id, summary_month)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employee_skills_employee_id ON public.employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_company_id ON public.employee_skills(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_certifications_employee_id ON public.employee_certifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_certifications_company_id ON public.employee_certifications(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_certifications_status ON public.employee_certifications(status);
CREATE INDEX IF NOT EXISTS idx_employee_performance_reviews_employee_id ON public.employee_performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_development_goals_employee_id ON public.employee_development_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_recognition_employee_id ON public.employee_recognition(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_time_summary_employee_month ON public.employee_time_summary(employee_id, summary_month);

-- Enable Row Level Security (RLS)
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_development_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_time_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Employees can view their own data, admins can view all)
-- Employee Skills Policies
CREATE POLICY "Users can view own skills" ON public.employee_skills
    FOR SELECT USING (
        employee_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_skills.company_id 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Admins can manage skills" ON public.employee_skills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_skills.company_id 
            AND role IN ('owner', 'admin')
        )
    );

-- Employee Certifications Policies
CREATE POLICY "Users can view own certifications" ON public.employee_certifications
    FOR SELECT USING (
        employee_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_certifications.company_id 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can manage own certifications" ON public.employee_certifications
    FOR ALL USING (
        employee_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_certifications.company_id 
            AND role IN ('owner', 'admin')
        )
    );

-- Performance Reviews Policies
CREATE POLICY "Users can view own reviews" ON public.employee_performance_reviews
    FOR SELECT USING (
        employee_id = auth.uid() OR 
        reviewer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_performance_reviews.company_id 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Reviewers can manage reviews" ON public.employee_performance_reviews
    FOR ALL USING (
        reviewer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_performance_reviews.company_id 
            AND role IN ('owner', 'admin')
        )
    );

-- Development Goals Policies
CREATE POLICY "Users can view own goals" ON public.employee_development_goals
    FOR SELECT USING (
        employee_id = auth.uid() OR 
        assigned_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_development_goals.company_id 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can update own goals" ON public.employee_development_goals
    FOR UPDATE USING (
        employee_id = auth.uid() OR 
        assigned_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_development_goals.company_id 
            AND role IN ('owner', 'admin')
        )
    );

-- Recognition Policies
CREATE POLICY "Users can view recognition" ON public.employee_recognition
    FOR SELECT USING (
        employee_id = auth.uid() OR 
        given_by = auth.uid() OR
        (is_public = true AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_recognition.company_id
        )) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_recognition.company_id 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can give recognition" ON public.employee_recognition
    FOR INSERT WITH CHECK (
        given_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_recognition.company_id
        )
    );

-- Time Summary Policies
CREATE POLICY "Users can view own time summary" ON public.employee_time_summary
    FOR SELECT USING (
        employee_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_time_summary.company_id 
            AND role IN ('owner', 'admin')
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.employee_skills TO authenticated;
GRANT ALL ON public.employee_certifications TO authenticated;
GRANT ALL ON public.employee_performance_reviews TO authenticated;
GRANT ALL ON public.employee_development_goals TO authenticated;
GRANT ALL ON public.employee_recognition TO authenticated;
GRANT ALL ON public.employee_time_summary TO authenticated;
