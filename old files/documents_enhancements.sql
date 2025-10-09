-- Documents Enhancements SQL Script
-- Add tables and columns for e-signatures, version control, and automated workflows

-- 1. Enhance existing documents table with version control support
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES documents(id),
ADD COLUMN IF NOT EXISTS is_current_version BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS change_notes TEXT,
ADD COLUMN IF NOT EXISTS checksum VARCHAR(64), -- For file integrity verification
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Create document_versions table for detailed version tracking
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    
    -- Version details
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    checksum VARCHAR(64),
    
    -- Change tracking
    change_notes TEXT,
    changes_summary JSONB DEFAULT '{}', -- Structured diff data
    previous_version_id UUID REFERENCES document_versions(id),
    
    -- Audit fields
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(document_id, version)
);

-- 3. Create signature_requests table for e-signature workflow
CREATE TABLE IF NOT EXISTS signature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Request details
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    message TEXT,
    
    -- Signature workflow
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'signed', 'declined', 'expired')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    viewed_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    
    -- Signature data (when signed)
    signature_data JSONB, -- Base64 signature image, coordinates, etc.
    ip_address INET,
    user_agent TEXT,
    
    -- Integration data
    external_provider VARCHAR(50), -- 'docusign', 'hellosign', 'adobe_sign'
    external_request_id TEXT,
    external_envelope_id TEXT,
    
    -- Audit fields
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create document_workflows table for approval processes
CREATE TABLE IF NOT EXISTS document_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Workflow configuration
    workflow_type TEXT NOT NULL CHECK (workflow_type IN ('approval', 'review', 'signature', 'custom')),
    title TEXT NOT NULL,
    description TEXT,
    
    -- Approval settings
    required_approvers TEXT[] NOT NULL DEFAULT '{}', -- Email addresses
    approval_order TEXT DEFAULT 'any' CHECK (approval_order IN ('any', 'sequential', 'parallel')),
    minimum_approvals INTEGER DEFAULT 1,
    
    -- Timing
    due_date DATE,
    reminder_frequency TEXT DEFAULT 'daily' CHECK (reminder_frequency IN ('none', 'daily', 'weekly')),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'expired')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Audit fields
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create workflow_approvals table for individual approval tracking
CREATE TABLE IF NOT EXISTS workflow_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES document_workflows(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Approver details
    approver_email TEXT NOT NULL,
    approver_name TEXT,
    approver_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Approval status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'delegated')),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    
    -- Approval details
    comments TEXT,
    signature_data JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- Delegation (if applicable)
    delegated_to TEXT, -- Email address
    delegated_at TIMESTAMPTZ,
    delegation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create document_access_log for audit trail
CREATE TABLE IF NOT EXISTS document_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Access details
    action TEXT NOT NULL CHECK (action IN ('view', 'download', 'edit', 'delete', 'share', 'sign')),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email TEXT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_version ON documents(parent_document_id, version) WHERE parent_document_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_current ON documents(company_id, is_current_version) WHERE is_current_version = TRUE;
CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id, version);
CREATE INDEX IF NOT EXISTS idx_signature_requests_status ON signature_requests(company_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_document_workflows_status ON document_workflows(company_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_pending ON workflow_approvals(workflow_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_document_access_log_document ON document_access_log(document_id, created_at);

-- 8. Create functions for version management
CREATE OR REPLACE FUNCTION create_document_version(
    p_document_id UUID,
    p_file_name TEXT,
    p_file_url TEXT,
    p_file_size INTEGER,
    p_mime_type TEXT,
    p_change_notes TEXT,
    p_created_by UUID
) RETURNS UUID AS $$
DECLARE
    v_company_id UUID;
    v_next_version INTEGER;
    v_version_id UUID;
BEGIN
    -- Get company_id and next version number
    SELECT company_id INTO v_company_id FROM documents WHERE id = p_document_id;
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_next_version FROM document_versions WHERE document_id = p_document_id;
    
    -- Create new version record
    INSERT INTO document_versions (
        company_id, document_id, version, file_name, file_url, 
        file_size, mime_type, change_notes, created_by
    ) VALUES (
        v_company_id, p_document_id, v_next_version, p_file_name, p_file_url,
        p_file_size, p_mime_type, p_change_notes, p_created_by
    ) RETURNING id INTO v_version_id;
    
    -- Update main document record
    UPDATE documents 
    SET 
        version = v_next_version,
        file_name = p_file_name,
        file_url = p_file_url,
        file_size = p_file_size,
        mime_type = p_mime_type,
        updated_at = NOW()
    WHERE id = p_document_id;
    
    RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to send workflow notifications (placeholder)
CREATE OR REPLACE FUNCTION send_workflow_notification(
    p_workflow_id UUID,
    p_notification_type TEXT DEFAULT 'reminder'
) RETURNS BOOLEAN AS $$
DECLARE
    workflow_record document_workflows%ROWTYPE;
    approver_email TEXT;
BEGIN
    -- Get workflow details
    SELECT * INTO workflow_record FROM document_workflows WHERE id = p_workflow_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Send notifications to pending approvers
    FOR approver_email IN 
        SELECT UNNEST(workflow_record.required_approvers)
        WHERE approver_email NOT IN (
            SELECT approver_email FROM workflow_approvals 
            WHERE workflow_id = p_workflow_id AND status IN ('approved', 'rejected')
        )
    LOOP
        -- TODO: Integrate with email service (SendGrid, Mailgun, etc.)
        -- For now, just log the notification
        RAISE NOTICE 'Sending % notification to % for workflow %', p_notification_type, approver_email, p_workflow_id;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers for automatic workflow processing
CREATE OR REPLACE FUNCTION process_workflow_approval() RETURNS TRIGGER AS $$
DECLARE
    workflow_record document_workflows%ROWTYPE;
    total_approvals INTEGER;
    required_approvals INTEGER;
BEGIN
    -- Get workflow details
    SELECT * INTO workflow_record FROM document_workflows WHERE id = NEW.workflow_id;
    
    -- Count current approvals
    SELECT COUNT(*) INTO total_approvals 
    FROM workflow_approvals 
    WHERE workflow_id = NEW.workflow_id AND status = 'approved';
    
    required_approvals := workflow_record.minimum_approvals;
    
    -- Check if workflow is complete
    IF total_approvals >= required_approvals THEN
        UPDATE document_workflows 
        SET status = 'approved', completed_at = NOW()
        WHERE id = NEW.workflow_id;
    END IF;
    
    -- Check if workflow is rejected
    IF NEW.status = 'rejected' THEN
        UPDATE document_workflows 
        SET status = 'rejected', completed_at = NOW()
        WHERE id = NEW.workflow_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_process_workflow_approval
    AFTER INSERT OR UPDATE ON workflow_approvals
    FOR EACH ROW
    EXECUTE FUNCTION process_workflow_approval();

-- 11. Add RLS policies (assuming RLS is enabled)
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON document_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON signature_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON document_workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_approvals TO authenticated;
GRANT SELECT, INSERT ON document_access_log TO authenticated;
GRANT EXECUTE ON FUNCTION create_document_version TO authenticated;
GRANT EXECUTE ON FUNCTION send_workflow_notification TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE document_versions IS 'Tracks all versions of documents with change history';
COMMENT ON TABLE signature_requests IS 'Manages e-signature requests and tracking';
COMMENT ON TABLE document_workflows IS 'Defines approval workflows for documents';
COMMENT ON TABLE workflow_approvals IS 'Tracks individual approvals within workflows';
COMMENT ON TABLE document_access_log IS 'Audit trail for document access and actions';

-- Sample data (optional - uncomment to add test data)
/*
-- Add sample workflow
INSERT INTO document_workflows (
    company_id, document_id, workflow_type, title, required_approvers, minimum_approvals
) VALUES (
    (SELECT id FROM companies LIMIT 1),
    (SELECT id FROM documents LIMIT 1),
    'approval',
    'Contract Review',
    ARRAY['manager@company.com', 'legal@company.com'],
    1
);
*/
