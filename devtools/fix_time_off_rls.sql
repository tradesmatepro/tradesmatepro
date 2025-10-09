-- Fix RLS policy for employee_time_off table
DROP POLICY IF EXISTS "Owners and admins can update time off" ON employee_time_off;

CREATE POLICY "Owners and admins can update time off"
    ON employee_time_off
    FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'admin', 'manager')
        )
    );

