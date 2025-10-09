-- RUN FIFTH (optional if you want dedicated quote templates table)
-- If you prefer to use existing document_templates/company_document_templates, you can skip this.

CREATE TABLE IF NOT EXISTS public.quote_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  content jsonb NOT NULL DEFAULT '{}', -- store a skeleton of quote fields & items
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quote_templates_company_idx ON public.quote_templates (company_id);

