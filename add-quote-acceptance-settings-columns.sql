-- Add missing columns to settings table for quote acceptance workflow

ALTER TABLE settings ADD COLUMN IF NOT EXISTS signature_type VARCHAR(20) DEFAULT 'basic' CHECK (signature_type IN ('basic', 'docusign'));
ALTER TABLE settings ADD COLUMN IF NOT EXISTS deposit_type VARCHAR(20) DEFAULT 'percentage' CHECK (deposit_type IN ('percentage', 'fixed'));
ALTER TABLE settings ADD COLUMN IF NOT EXISTS show_technician_names BOOLEAN DEFAULT FALSE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS scheduling_buffer_hours INTEGER DEFAULT 24 CHECK (scheduling_buffer_hours >= 0);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS auto_send_rejection_email BOOLEAN DEFAULT TRUE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stripe_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stripe_public_key TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stripe_secret_key TEXT;

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'settings' 
AND column_name IN (
  'signature_type',
  'deposit_type',
  'show_technician_names',
  'scheduling_buffer_hours',
  'auto_send_rejection_email',
  'stripe_enabled',
  'stripe_public_key',
  'stripe_secret_key'
)
ORDER BY column_name;

