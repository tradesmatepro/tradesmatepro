-- INDUSTRY STANDARD INVENTORY ENHANCEMENT
-- Adds barcode/QR code support, batch tracking, serial numbers, and mobile scanning capabilities

-- =====================================================
-- 1. ENHANCE INVENTORY_ITEMS TABLE WITH INDUSTRY STANDARDS
-- =====================================================

-- Add barcode and tracking columns to inventory_items
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS barcode TEXT,
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS upc_code TEXT,
ADD COLUMN IF NOT EXISTS manufacturer_part_number TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,3),
ADD COLUMN IF NOT EXISTS dimensions TEXT, -- "L x W x H"
ADD COLUMN IF NOT EXISTS hazmat_class TEXT,
ADD COLUMN IF NOT EXISTS requires_serial_tracking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_batch_tracking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shelf_life_days INTEGER,
ADD COLUMN IF NOT EXISTS storage_requirements TEXT,
ADD COLUMN IF NOT EXISTS supplier_lead_time_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS abc_classification TEXT CHECK (abc_classification IN ('A', 'B', 'C')), -- ABC Analysis
ADD COLUMN IF NOT EXISTS is_consumable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_serialized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS warranty_months INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for barcode scanning performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON public.inventory_items(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_qr_code ON public.inventory_items(qr_code) WHERE qr_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_upc ON public.inventory_items(upc_code) WHERE upc_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_mpn ON public.inventory_items(manufacturer_part_number) WHERE manufacturer_part_number IS NOT NULL;

-- =====================================================
-- 2. CREATE SERIAL NUMBER TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.inventory_serial_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    serial_number TEXT NOT NULL,
    location_id UUID REFERENCES public.inventory_locations(id) ON DELETE SET NULL,
    
    -- Status tracking
    status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'ALLOCATED', 'USED', 'DEFECTIVE', 'RETURNED')),
    
    -- Work order tracking
    allocated_to_work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
    used_in_work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
    
    -- Dates
    received_date DATE DEFAULT CURRENT_DATE,
    warranty_expiry_date DATE,
    last_service_date DATE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique serial numbers per item
    UNIQUE(item_id, serial_number)
);

-- =====================================================
-- 3. CREATE BATCH/LOT TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.inventory_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    location_id UUID REFERENCES public.inventory_locations(id) ON DELETE SET NULL,
    
    -- Batch details
    quantity_received DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity_remaining DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit_cost DECIMAL(12,4) DEFAULT 0,
    
    -- Dates
    received_date DATE DEFAULT CURRENT_DATE,
    manufacture_date DATE,
    expiry_date DATE,
    
    -- Supplier info
    supplier_batch_number TEXT,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    
    -- Status
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'RECALLED', 'QUARANTINED')),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique batch numbers per item
    UNIQUE(item_id, batch_number)
);

-- =====================================================
-- 4. CREATE BARCODE SCAN LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.inventory_scan_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- Scan details
    scan_type TEXT NOT NULL CHECK (scan_type IN ('BARCODE', 'QR_CODE', 'UPC', 'MANUAL')),
    scanned_value TEXT NOT NULL,
    
    -- Item identification
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
    serial_number_id UUID REFERENCES public.inventory_serial_numbers(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES public.inventory_batches(id) ON DELETE SET NULL,
    
    -- Context
    location_id UUID REFERENCES public.inventory_locations(id) ON DELETE SET NULL,
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Action taken
    action_type TEXT CHECK (action_type IN ('RECEIVE', 'ISSUE', 'TRANSFER', 'COUNT', 'LOOKUP')),
    quantity DECIMAL(10,2),
    
    -- Device info
    device_type TEXT, -- 'MOBILE_APP', 'WIRELESS_SCANNER', 'WEB_BROWSER'
    device_id TEXT,
    
    -- Audit
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. CREATE CYCLE COUNT TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.inventory_cycle_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- Count details
    count_name TEXT NOT NULL,
    location_id UUID REFERENCES public.inventory_locations(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    
    -- Scheduling
    scheduled_date DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Assignment
    assigned_to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Results
    items_counted INTEGER DEFAULT 0,
    discrepancies_found INTEGER DEFAULT 0,
    total_variance_value DECIMAL(12,4) DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- =====================================================
-- 6. CREATE CYCLE COUNT ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.inventory_cycle_count_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_count_id UUID NOT NULL REFERENCES public.inventory_cycle_counts(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.inventory_locations(id) ON DELETE CASCADE,
    
    -- Expected vs Actual
    expected_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    counted_quantity DECIMAL(10,2),
    variance_quantity DECIMAL(10,2) GENERATED ALWAYS AS (COALESCE(counted_quantity, 0) - expected_quantity) STORED,
    variance_value DECIMAL(12,4) GENERATED ALWAYS AS ((COALESCE(counted_quantity, 0) - expected_quantity) * COALESCE((SELECT cost FROM inventory_items WHERE id = item_id), 0)) STORED,
    
    -- Count details
    counted_at TIMESTAMP WITH TIME ZONE,
    counted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    scan_method TEXT CHECK (scan_method IN ('BARCODE', 'QR_CODE', 'MANUAL', 'RFID')),
    
    -- Notes
    notes TEXT,
    requires_recount BOOLEAN DEFAULT false,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. CREATE BARCODE LOOKUP FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.lookup_item_by_barcode(
    p_company_id UUID,
    p_barcode_value TEXT,
    p_scan_type TEXT DEFAULT 'BARCODE'
)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    sku TEXT,
    barcode TEXT,
    qr_code TEXT,
    upc_code TEXT,
    manufacturer_part_number TEXT,
    current_stock DECIMAL,
    unit_of_measure TEXT,
    cost DECIMAL,
    sell_price DECIMAL,
    requires_serial_tracking BOOLEAN,
    requires_batch_tracking BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id as item_id,
        i.name as item_name,
        i.sku,
        i.barcode,
        i.qr_code,
        i.upc_code,
        i.manufacturer_part_number,
        COALESCE(SUM(s.quantity), 0) as current_stock,
        i.unit_of_measure,
        i.cost,
        i.sell_price,
        i.requires_serial_tracking,
        i.requires_batch_tracking
    FROM public.inventory_items i
    LEFT JOIN public.inventory_stock s ON i.id = s.item_id
    WHERE i.company_id = p_company_id
    AND (
        (p_scan_type = 'BARCODE' AND i.barcode = p_barcode_value) OR
        (p_scan_type = 'QR_CODE' AND i.qr_code = p_barcode_value) OR
        (p_scan_type = 'UPC' AND i.upc_code = p_barcode_value) OR
        (p_scan_type = 'MPN' AND i.manufacturer_part_number = p_barcode_value) OR
        (p_scan_type = 'SKU' AND i.sku = p_barcode_value)
    )
    GROUP BY i.id, i.name, i.sku, i.barcode, i.qr_code, i.upc_code, 
             i.manufacturer_part_number, i.unit_of_measure, i.cost, i.sell_price,
             i.requires_serial_tracking, i.requires_batch_tracking;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Serial numbers indexes
CREATE INDEX IF NOT EXISTS idx_serial_numbers_item_status ON public.inventory_serial_numbers(item_id, status);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_location ON public.inventory_serial_numbers(location_id) WHERE location_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_serial_numbers_work_order ON public.inventory_serial_numbers(allocated_to_work_order_id) WHERE allocated_to_work_order_id IS NOT NULL;

-- Batch tracking indexes
CREATE INDEX IF NOT EXISTS idx_batches_item_status ON public.inventory_batches(item_id, status);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON public.inventory_batches(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_batches_location ON public.inventory_batches(location_id) WHERE location_id IS NOT NULL;

-- Scan log indexes
CREATE INDEX IF NOT EXISTS idx_scan_log_item_date ON public.inventory_scan_log(item_id, scanned_at);
CREATE INDEX IF NOT EXISTS idx_scan_log_user_date ON public.inventory_scan_log(user_id, scanned_at);
CREATE INDEX IF NOT EXISTS idx_scan_log_scanned_value ON public.inventory_scan_log(scanned_value);

-- Cycle count indexes
CREATE INDEX IF NOT EXISTS idx_cycle_counts_status_date ON public.inventory_cycle_counts(status, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cycle_count_items_count_item ON public.inventory_cycle_count_items(cycle_count_id, item_id);

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON public.inventory_serial_numbers TO authenticated;
GRANT ALL ON public.inventory_batches TO authenticated;
GRANT ALL ON public.inventory_scan_log TO authenticated;
GRANT ALL ON public.inventory_cycle_counts TO authenticated;
GRANT ALL ON public.inventory_cycle_count_items TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_item_by_barcode TO authenticated;

-- =====================================================
-- 10. CREATE SAMPLE DATA STRUCTURE COMMENTS
-- =====================================================

COMMENT ON TABLE public.inventory_serial_numbers IS 'Tracks individual serial numbers for serialized inventory items';
COMMENT ON TABLE public.inventory_batches IS 'Tracks batch/lot numbers for batch-tracked inventory items with expiry dates';
COMMENT ON TABLE public.inventory_scan_log IS 'Audit log of all barcode/QR code scans for inventory operations';
COMMENT ON TABLE public.inventory_cycle_counts IS 'Scheduled physical inventory counts for accuracy verification';
COMMENT ON TABLE public.inventory_cycle_count_items IS 'Individual item counts within cycle count sessions';

COMMENT ON COLUMN public.inventory_items.barcode IS 'Standard barcode (Code 128, Code 39, etc.)';
COMMENT ON COLUMN public.inventory_items.qr_code IS 'QR code for mobile scanning';
COMMENT ON COLUMN public.inventory_items.upc_code IS 'Universal Product Code for retail items';
COMMENT ON COLUMN public.inventory_items.abc_classification IS 'ABC analysis classification (A=high value, B=medium, C=low)';

RAISE NOTICE 'Industry standard inventory enhancement completed successfully!';
RAISE NOTICE 'Added support for: Barcode/QR scanning, Serial tracking, Batch tracking, Cycle counts';

COMMIT;
