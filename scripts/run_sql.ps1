$headers = @{
  'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
  'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
  'Content-Type' = 'application/json'
}

Write-Host "Creating customer_communications table..."
$sql1 = "CREATE TABLE IF NOT EXISTS public.customer_communications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE, customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, type TEXT NOT NULL DEFAULT 'call', direction TEXT NOT NULL DEFAULT 'outbound', subject TEXT, content TEXT, outcome TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());"
$body1 = @{ sql_query = $sql1 } | ConvertTo-Json
$result1 = Invoke-RestMethod -Uri 'https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/rpc/exec_readonly_sql' -Method POST -Headers $headers -Body $body1
Write-Host "Result: $result1"

Write-Host "Creating customer_tags table..."
$sql2 = "CREATE TABLE IF NOT EXISTS public.customer_tags (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, color TEXT DEFAULT '#3B82F6', is_active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), UNIQUE(company_id, name));"
$body2 = @{ sql_query = $sql2 } | ConvertTo-Json
$result2 = Invoke-RestMethod -Uri 'https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/rpc/exec_readonly_sql' -Method POST -Headers $headers -Body $body2
Write-Host "Result: $result2"

Write-Host "Creating customer_service_agreements table..."
$sql3 = "CREATE TABLE IF NOT EXISTS public.customer_service_agreements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE, customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT, agreement_type TEXT NOT NULL DEFAULT 'maintenance', start_date DATE NOT NULL, end_date DATE, monthly_fee DECIMAL(10,2), annual_fee DECIMAL(10,2), status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());"
$body3 = @{ sql_query = $sql3 } | ConvertTo-Json
$result3 = Invoke-RestMethod -Uri 'https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/rpc/exec_readonly_sql' -Method POST -Headers $headers -Body $body3
Write-Host "Result: $result3"

Write-Host "Creating service_requests table..."
$sql4 = "CREATE TABLE IF NOT EXISTS public.service_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE, customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT NOT NULL, category TEXT, priority TEXT NOT NULL DEFAULT 'medium', status TEXT NOT NULL DEFAULT 'open', assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());"
$body4 = @{ sql_query = $sql4 } | ConvertTo-Json
$result4 = Invoke-RestMethod -Uri 'https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/rpc/exec_readonly_sql' -Method POST -Headers $headers -Body $body4
Write-Host "Result: $result4"

Write-Host "All tables created successfully!"
