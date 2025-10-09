-- Service Tags Management Migration
-- Creates tables for managing company service tags/trades

-- Create service_tags table (master list of all available trade tags)
CREATE TABLE IF NOT EXISTS service_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create company_service_tags junction table (links companies to their service tags)
CREATE TABLE IF NOT EXISTS company_service_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  service_tag_id UUID NOT NULL REFERENCES service_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (company_id, service_tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_service_tags_company_id ON company_service_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_company_service_tags_service_tag_id ON company_service_tags(service_tag_id);
CREATE INDEX IF NOT EXISTS idx_service_tags_name ON service_tags(name);

-- Insert default service tags (common trades)
INSERT INTO service_tags (name, description) VALUES
  ('HVAC', 'Heating, Ventilation, and Air Conditioning services'),
  ('Plumbing', 'Plumbing installation, repair, and maintenance'),
  ('Electrical', 'Electrical installation, repair, and maintenance'),
  ('Roofing', 'Roof installation, repair, and maintenance'),
  ('Flooring', 'Flooring installation and repair services'),
  ('Painting', 'Interior and exterior painting services'),
  ('Carpentry', 'Custom carpentry and woodworking services'),
  ('Drywall', 'Drywall installation and repair'),
  ('Insulation', 'Insulation installation and energy efficiency'),
  ('Windows & Doors', 'Window and door installation and repair'),
  ('Concrete', 'Concrete work and masonry services'),
  ('Landscaping', 'Landscaping and outdoor maintenance'),
  ('Pool & Spa', 'Pool and spa installation and maintenance'),
  ('Solar', 'Solar panel installation and maintenance'),
  ('Security Systems', 'Security system installation and monitoring'),
  ('Appliance Repair', 'Appliance installation and repair services'),
  ('Cleaning', 'Commercial and residential cleaning services'),
  ('General Contracting', 'General contracting and project management')
ON CONFLICT (name) DO NOTHING;

-- Add RLS policies (Row Level Security)
ALTER TABLE service_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_service_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read service_tags (they're public reference data)
CREATE POLICY "service_tags_select_policy" ON service_tags
  FOR SELECT USING (true);

-- Policy: Only authenticated users can read company_service_tags for their company
CREATE POLICY "company_service_tags_select_policy" ON company_service_tags
  FOR SELECT USING (
    auth.uid() IN (
      SELECT u.id FROM users u WHERE u.company_id = company_service_tags.company_id
    )
  );

-- Policy: Only admins/owners can insert company_service_tags
CREATE POLICY "company_service_tags_insert_policy" ON company_service_tags
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT u.id FROM users u 
      WHERE u.company_id = company_service_tags.company_id 
      AND u.role IN ('admin', 'owner')
    )
  );

-- Policy: Only admins/owners can delete company_service_tags
CREATE POLICY "company_service_tags_delete_policy" ON company_service_tags
  FOR DELETE USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      WHERE u.company_id = company_service_tags.company_id 
      AND u.role IN ('admin', 'owner')
    )
  );

-- Add audit log trigger for company_service_tags changes
CREATE OR REPLACE FUNCTION audit_company_service_tags_changes()
RETURNS TRIGGER AS $$
DECLARE
  tag_name TEXT;
BEGIN
  -- Get the service tag name for better audit logs
  IF TG_OP = 'DELETE' THEN
    SELECT name INTO tag_name FROM service_tags WHERE id = OLD.service_tag_id;
    INSERT INTO audit_logs (
      company_id,
      actor_id,
      action,
      table_name,
      record_id,
      changes,
      timestamp
    ) VALUES (
      OLD.company_id,
      auth.uid(),
      'DELETE',
      'company_service_tags',
      OLD.id,
      jsonb_build_object(
        'service_tag_name', tag_name,
        'service_tag_id', OLD.service_tag_id
      ),
      now()
    );
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    SELECT name INTO tag_name FROM service_tags WHERE id = NEW.service_tag_id;
    INSERT INTO audit_logs (
      company_id,
      actor_id,
      action,
      table_name,
      record_id,
      changes,
      timestamp
    ) VALUES (
      NEW.company_id,
      auth.uid(),
      'INSERT',
      'company_service_tags',
      NEW.id,
      jsonb_build_object(
        'service_tag_name', tag_name,
        'service_tag_id', NEW.service_tag_id
      ),
      now()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS audit_company_service_tags_trigger ON company_service_tags;
CREATE TRIGGER audit_company_service_tags_trigger
  AFTER INSERT OR DELETE ON company_service_tags
  FOR EACH ROW EXECUTE FUNCTION audit_company_service_tags_changes();
