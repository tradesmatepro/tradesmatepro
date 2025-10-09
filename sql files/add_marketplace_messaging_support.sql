-- Add marketplace messaging support to messages table
-- This allows messages to be linked to marketplace requests for contractor-customer communication

-- Add marketplace_request_id column to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS marketplace_request_id UUID REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;

-- Add message_type column to categorize different types of messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'internal' 
CHECK (message_type IN ('internal', 'customer_to_company', 'marketplace_communication', 'system'));

-- Add content column (some existing code uses 'content' instead of 'message')
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Add status column for message delivery status
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' 
CHECK (status IN ('sent', 'delivered', 'read', 'failed'));

-- Add recipient_id column (some code uses this instead of receiver_id)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add created_at column for consistency
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add company_id for proper RLS and data isolation
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Update existing messages to have content = message if content is null
UPDATE public.messages 
SET content = message 
WHERE content IS NULL AND message IS NOT NULL;

-- Update existing messages to have recipient_id = receiver_id if recipient_id is null
UPDATE public.messages 
SET recipient_id = receiver_id 
WHERE recipient_id IS NULL AND receiver_id IS NOT NULL;

-- Update existing messages to have created_at = sent_at if created_at is null
UPDATE public.messages 
SET created_at = sent_at 
WHERE created_at IS NULL AND sent_at IS NOT NULL;

-- Create index for marketplace messaging queries
CREATE INDEX IF NOT EXISTS idx_messages_marketplace_request_id 
ON public.messages(marketplace_request_id);

-- Create index for message type queries
CREATE INDEX IF NOT EXISTS idx_messages_message_type 
ON public.messages(message_type);

-- Create index for company-based queries
CREATE INDEX IF NOT EXISTS idx_messages_company_id 
ON public.messages(company_id);

-- Create composite index for marketplace messaging
CREATE INDEX IF NOT EXISTS idx_messages_marketplace_communication 
ON public.messages(marketplace_request_id, message_type, created_at DESC) 
WHERE message_type = 'marketplace_communication';

COMMENT ON COLUMN public.messages.marketplace_request_id IS 'Links message to a marketplace request for contractor-customer communication';
COMMENT ON COLUMN public.messages.message_type IS 'Type of message: internal, customer_to_company, marketplace_communication, system';
COMMENT ON COLUMN public.messages.content IS 'Message content (alternative to message field for consistency)';
COMMENT ON COLUMN public.messages.status IS 'Message delivery status: sent, delivered, read, failed';
COMMENT ON COLUMN public.messages.recipient_id IS 'Message recipient (alternative to receiver_id for consistency)';
