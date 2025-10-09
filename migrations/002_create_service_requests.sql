-- Service Requests System Migration
-- Creates tables and logic for customer service requests and contractor matching

-- Add emergency_fee field to business_settings table
ALTER TABLE business_settings 
ADD COLUMN IF NOT EXISTS emergency_fee NUMERIC(12,2) DEFAULT 0.00;

-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id), -- filled once accepted by a contractor
  service_tag_id UUID NOT NULL REFERENCES service_tags(id), -- type of service requested
  description TEXT,
  emergency BOOLEAN DEFAULT false,
  customer_budget NUMERIC(12,2), -- optional "I have $200 for this"
  emergency_fee NUMERIC(12,2),   -- contractor default fee if emergency
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'declined', 'expired', 'completed', 'cancelled')),
  customer_location TEXT, -- address or area for the service
  customer_phone TEXT,    -- contact phone for this request
  customer_email TEXT,    -- contact email for this request
  preferred_time TEXT,    -- when customer prefers service
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours') -- requests expire after 24 hours
);

-- Create service_request_responses table to track contractor responses
CREATE TABLE IF NOT EXISTS service_request_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  response_type TEXT NOT NULL CHECK (response_type IN ('accept', 'decline', 'quote')),
  quoted_price NUMERIC(12,2), -- if providing a quote
  estimated_arrival TEXT,     -- "within 2 hours", "tomorrow morning"
  notes TEXT,                 -- additional contractor notes
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (service_request_id, company_id) -- one response per company per request
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_tag_id ON service_requests(service_tag_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_company_id ON service_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_service_requests_emergency ON service_requests(emergency);
CREATE INDEX IF NOT EXISTS idx_service_request_responses_service_request_id ON service_request_responses(service_request_id);
CREATE INDEX IF NOT EXISTS idx_service_request_responses_company_id ON service_request_responses(company_id);

-- Add RLS policies (disabled for beta but structured for future)
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_request_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can read their own requests
CREATE POLICY "service_requests_customer_select" ON service_requests
  FOR SELECT USING (true); -- Disabled for beta - would be: customer_id = auth.uid()

-- Policy: Companies can read requests for their service tags or assigned to them
CREATE POLICY "service_requests_company_select" ON service_requests
  FOR SELECT USING (true); -- Disabled for beta

-- Policy: Customers can insert their own requests
CREATE POLICY "service_requests_insert" ON service_requests
  FOR INSERT WITH CHECK (true); -- Disabled for beta

-- Policy: Companies can update requests assigned to them
CREATE POLICY "service_requests_update" ON service_requests
  FOR UPDATE USING (true); -- Disabled for beta

-- Policy: Companies can read/insert their own responses
CREATE POLICY "service_request_responses_select" ON service_request_responses
  FOR SELECT USING (true); -- Disabled for beta

CREATE POLICY "service_request_responses_insert" ON service_request_responses
  FOR INSERT WITH CHECK (true); -- Disabled for beta

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_service_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on service_requests
DROP TRIGGER IF EXISTS service_requests_updated_at_trigger ON service_requests;
CREATE TRIGGER service_requests_updated_at_trigger
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_service_request_updated_at();

-- Function to handle service request acceptance (first-accept wins)
CREATE OR REPLACE FUNCTION accept_service_request(
  request_id UUID,
  accepting_company_id UUID,
  quoted_price NUMERIC DEFAULT NULL,
  estimated_arrival TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  request_record service_requests%ROWTYPE;
  result JSONB;
BEGIN
  -- Lock the request row to prevent race conditions
  SELECT * INTO request_record 
  FROM service_requests 
  WHERE id = request_id 
  FOR UPDATE;
  
  -- Check if request exists and is still open
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;
  
  IF request_record.status != 'open' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request is no longer available');
  END IF;
  
  -- Check if company has the required service tag
  IF NOT EXISTS (
    SELECT 1 FROM company_service_tags cst
    WHERE cst.company_id = accepting_company_id 
    AND cst.service_tag_id = request_record.service_tag_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Company does not provide this service');
  END IF;
  
  -- Accept the request (first-accept wins)
  UPDATE service_requests 
  SET 
    company_id = accepting_company_id,
    status = 'accepted',
    accepted_at = now(),
    updated_at = now()
  WHERE id = request_id;
  
  -- Record the acceptance response
  INSERT INTO service_request_responses (
    service_request_id,
    company_id,
    response_type,
    quoted_price,
    estimated_arrival,
    notes
  ) VALUES (
    request_id,
    accepting_company_id,
    'accept',
    quoted_price,
    estimated_arrival,
    notes
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Request accepted successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decline a service request
CREATE OR REPLACE FUNCTION decline_service_request(
  request_id UUID,
  declining_company_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
  -- Record the decline response
  INSERT INTO service_request_responses (
    service_request_id,
    company_id,
    response_type,
    notes
  ) VALUES (
    request_id,
    declining_company_id,
    'decline',
    notes
  ) ON CONFLICT (service_request_id, company_id) 
  DO UPDATE SET 
    response_type = 'decline',
    notes = EXCLUDED.notes,
    created_at = now();
  
  RETURN jsonb_build_object('success', true, 'message', 'Request declined');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old service requests
CREATE OR REPLACE FUNCTION expire_old_service_requests()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE service_requests 
  SET status = 'expired', updated_at = now()
  WHERE status = 'open' 
  AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Audit logging function for service requests
CREATE OR REPLACE FUNCTION audit_service_request_changes()
RETURNS TRIGGER AS $$
DECLARE
  service_tag_name TEXT;
  customer_name TEXT;
BEGIN
  -- Get service tag name and customer name for better audit logs
  IF TG_OP = 'INSERT' THEN
    SELECT st.name INTO service_tag_name FROM service_tags st WHERE st.id = NEW.service_tag_id;
    SELECT c.name INTO customer_name FROM customers c WHERE c.id = NEW.customer_id;
    
    INSERT INTO audit_logs (
      company_id,
      actor_id,
      action,
      table_name,
      record_id,
      changes,
      timestamp
    ) VALUES (
      NEW.company_id, -- may be null initially
      NEW.customer_id, -- using customer as actor for request creation
      'INSERT',
      'service_requests',
      NEW.id,
      jsonb_build_object(
        'service_tag', service_tag_name,
        'customer', customer_name,
        'emergency', NEW.emergency,
        'status', NEW.status
      ),
      now()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    SELECT st.name INTO service_tag_name FROM service_tags st WHERE st.id = NEW.service_tag_id;
    
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
      auth.uid(), -- current user making the update
      'UPDATE',
      'service_requests',
      NEW.id,
      jsonb_build_object(
        'service_tag', service_tag_name,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'company_assigned', NEW.company_id IS NOT NULL
      ),
      now()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit trigger for service requests
DROP TRIGGER IF EXISTS audit_service_requests_trigger ON service_requests;
CREATE TRIGGER audit_service_requests_trigger
  AFTER INSERT OR UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION audit_service_request_changes();

-- Insert some example service request statuses for reference
COMMENT ON COLUMN service_requests.status IS 'Request status: open (available), accepted (assigned to company), declined (no contractors available), expired (timed out), completed (work finished), cancelled (customer cancelled)';

-- Create a view for contractors to see available requests
CREATE OR REPLACE VIEW available_service_requests AS
SELECT 
  sr.*,
  st.name as service_tag_name,
  st.description as service_tag_description,
  c.name as customer_name,
  c.email as customer_email_fallback,
  c.phone as customer_phone_fallback
FROM service_requests sr
JOIN service_tags st ON sr.service_tag_id = st.id
JOIN customers c ON sr.customer_id = c.id
WHERE sr.status = 'open' 
AND sr.expires_at > now()
ORDER BY sr.emergency DESC, sr.created_at ASC;
