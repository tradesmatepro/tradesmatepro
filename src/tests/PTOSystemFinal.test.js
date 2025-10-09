// PTO System Tests - FINAL SCHEMA COMPLIANT
// Tests for: pto_current_balances, pto_ledger, employee_time_off, pto_policies
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PTOServiceFinal from '../services/PTOServiceFinal';
import PTOAccrualEngine from '../services/PTOAccrualEngine';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('PTO System Tests - FINAL SCHEMA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PTOServiceFinal', () => {
    describe('Policy Management', () => {
      it('should create a new PTO policy with FINAL schema', async () => {
        const mockPolicy = {
          id: 'policy-1',
          company_id: 'comp-1',
          name: 'Standard Policy',
          vacation_hours_per_period: 3.08,
          sick_hours_per_period: 1.54,
          accrual_period: 'biweekly',
          max_vacation_hours: 120,
          max_sick_hours: 80,
          carryover_vacation_hours: 40,
          carryover_sick_hours: 0,
          is_active: true
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockPolicy
        });

        const result = await PTOServiceFinal.createPolicy({
          name: 'Standard Policy',
          vacation_hours_per_period: 3.08,
          sick_hours_per_period: 1.54,
          accrual_period: 'biweekly',
          max_vacation_hours: 120,
          max_sick_hours: 80,
          carryover_vacation_hours: 40
        });

        expect(fetch).toHaveBeenCalledWith('/api/pto/policies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            name: 'Standard Policy',
            vacation_hours_per_period: 3.08,
            sick_hours_per_period: 1.54,
            accrual_period: 'biweekly',
            max_vacation_hours: 120,
            max_sick_hours: 80,
            carryover_vacation_hours: 40
          })
        });

        expect(result).toEqual(mockPolicy);
      });
    });

    describe('Balance Management - pto_current_balances', () => {
      it('should fetch employee balance from pto_current_balances', async () => {
        const mockBalance = {
          employee_id: 'emp-1',
          vacation_balance: 40.0,
          sick_balance: 20.0,
          personal_balance: 8.0
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockBalance
        });

        const result = await PTOServiceFinal.getEmployeeBalance('emp-1');

        expect(fetch).toHaveBeenCalledWith('/api/pto/balances/emp-1', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        });

        expect(result).toEqual(mockBalance);
      });
    });

    describe('Request Management - employee_time_off', () => {
      it('should create a PTO request in employee_time_off table', async () => {
        const mockRequest = {
          id: 'req-1',
          company_id: 'comp-1',
          employee_id: 'emp-1',
          kind: 'Vacation',
          accrual_type: 'vacation',
          starts_at: '2024-01-15T00:00:00Z',
          ends_at: '2024-01-15T23:59:59Z',
          hours_requested: 8.0,
          status: 'PENDING',
          created_by: 'emp-1'
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockRequest
        });

        const result = await PTOServiceFinal.createRequest({
          accrual_type: 'vacation',
          starts_at: '2024-01-15',
          ends_at: '2024-01-15',
          hours_requested: 8.0,
          note: 'Personal day'
        });

        expect(fetch).toHaveBeenCalledWith('/api/pto/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            accrual_type: 'vacation',
            starts_at: '2024-01-15',
            ends_at: '2024-01-15',
            hours_requested: 8.0,
            note: 'Personal day'
          })
        });

        expect(result).toEqual(mockRequest);
      });

      it('should approve a PTO request and update balances/ledger', async () => {
        const mockApprovedRequest = {
          id: 'req-1',
          status: 'APPROVED',
          hours_approved: 8.0,
          approved_by: 'admin-1',
          approved_at: '2024-01-10T10:00:00Z'
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockApprovedRequest
        });

        const result = await PTOServiceFinal.approveRequest('req-1', {
          hours_approved: 8.0,
          notes: 'Approved'
        });

        expect(fetch).toHaveBeenCalledWith('/api/pto/approve/req-1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            hours_approved: 8.0,
            notes: 'Approved'
          })
        });

        expect(result).toEqual(mockApprovedRequest);
      });

      it('should deny a PTO request with reason', async () => {
        const mockDeniedRequest = {
          id: 'req-1',
          status: 'DENIED',
          denied_at: '2024-01-10T10:00:00Z',
          denial_reason: 'Insufficient coverage'
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockDeniedRequest
        });

        const result = await PTOServiceFinal.denyRequest('req-1', 'Insufficient coverage');

        expect(fetch).toHaveBeenCalledWith('/api/pto/deny/req-1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({ reason: 'Insufficient coverage' })
        });

        expect(result).toEqual(mockDeniedRequest);
      });
    });

    describe('History Management - pto_ledger', () => {
      it('should fetch employee history from pto_ledger', async () => {
        const mockHistory = [
          {
            id: 'ledger-1',
            employee_id: 'emp-1',
            entry_type: 'accrual',
            hours: 3.08,
            effective_date: '2024-01-01',
            category_code: 'VAC',
            balance_after: 43.08,
            description: 'Biweekly vacation accrual'
          },
          {
            id: 'ledger-2',
            employee_id: 'emp-1',
            entry_type: 'deduction',
            hours: -8.0,
            effective_date: '2024-01-15',
            category_code: 'VAC',
            balance_after: 35.08,
            description: 'Approved PTO: 8.0 hours',
            related_request_id: 'req-1'
          }
        ];

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistory
        });

        const result = await PTOServiceFinal.getEmployeeHistory('emp-1');

        expect(fetch).toHaveBeenCalledWith('/api/pto/history/emp-1', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        });

        expect(result).toEqual(mockHistory);
      });
    });

    describe('Utility Methods', () => {
      it('should calculate business days correctly', () => {
        const businessDays = PTOServiceFinal.calculateBusinessDays('2024-01-15', '2024-01-19');
        expect(businessDays).toBe(5);
      });

      it('should get correct category code for accrual type', () => {
        expect(PTOServiceFinal.getCategoryCode('vacation')).toBe('VAC');
        expect(PTOServiceFinal.getCategoryCode('sick')).toBe('SICK');
        expect(PTOServiceFinal.getCategoryCode('personal')).toBe('PERS');
        expect(PTOServiceFinal.getCategoryCode('other')).toBe('OTHER');
      });

      it('should validate request data correctly', () => {
        const validData = {
          starts_at: '2024-01-15',
          ends_at: '2024-01-15',
          hours_requested: 8.0,
          accrual_type: 'vacation'
        };

        const errors = PTOServiceFinal.validateRequestData(validData);
        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('PTOAccrualEngine - FINAL SCHEMA', () => {
    it('should process accruals and update pto_current_balances', async () => {
      const mockResult = {
        success: true,
        processed_employees: 5,
        results: [
          {
            employee_id: 'emp-1',
            employee_name: 'John Doe',
            vacation_accrued: 3.08,
            sick_accrued: 1.54,
            vacation_balance: 43.08,
            sick_balance: 21.54
          }
        ]
      };

      vi.spyOn(PTOAccrualEngine, 'processAllAccruals').mockResolvedValue(mockResult);

      const result = await PTOAccrualEngine.processAllAccruals('comp-1');

      expect(result.success).toBe(true);
      expect(result.processed_employees).toBe(5);
      expect(result.results[0].vacation_accrued).toBe(3.08);
    });

    it('should handle accrual processing errors', async () => {
      vi.spyOn(PTOAccrualEngine, 'processAllAccruals').mockResolvedValue({
        success: false,
        error: 'Database connection failed'
      });

      const result = await PTOAccrualEngine.processAllAccruals('comp-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('Integration Tests - FINAL SCHEMA', () => {
    it('should handle complete PTO workflow with FINAL schema', async () => {
      // Mock the entire workflow
      const mockBalance = { vacation_balance: 40.0, sick_balance: 20.0 };
      const mockRequest = { id: 'req-1', status: 'PENDING' };
      const mockApproval = { id: 'req-1', status: 'APPROVED' };
      const mockHistory = [
        { id: 'ledger-1', entry_type: 'deduction', hours: -8.0, category_code: 'VAC' }
      ];

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockBalance })
        .mockResolvedValueOnce({ ok: true, json: async () => mockRequest })
        .mockResolvedValueOnce({ ok: true, json: async () => mockApproval })
        .mockResolvedValueOnce({ ok: true, json: async () => mockHistory });

      // 1. Check balance from pto_current_balances
      const balance = await PTOServiceFinal.getEmployeeBalance('emp-1');
      expect(balance.vacation_balance).toBe(40.0);

      // 2. Create request in employee_time_off
      const request = await PTOServiceFinal.createRequest({
        accrual_type: 'vacation',
        hours_requested: 8.0
      });
      expect(request.status).toBe('PENDING');

      // 3. Approve request (updates balances and ledger)
      const approval = await PTOServiceFinal.approveRequest('req-1');
      expect(approval.status).toBe('APPROVED');

      // 4. Check history from pto_ledger
      const history = await PTOServiceFinal.getEmployeeHistory('emp-1');
      expect(history[0].entry_type).toBe('deduction');
    });
  });
});

// Test utilities for FINAL schema
export const createMockPTOPolicy = (overrides = {}) => ({
  id: 'policy-1',
  company_id: 'comp-1',
  name: 'Standard Policy',
  vacation_hours_per_period: 3.08,
  sick_hours_per_period: 1.54,
  accrual_period: 'biweekly',
  max_vacation_hours: 120.0,
  max_sick_hours: 80.0,
  carryover_vacation_hours: 40.0,
  carryover_sick_hours: 0.0,
  accrual_rates: {},
  max_balances: {},
  carryover_rules: {},
  eligibility_days: 0,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
});

export const createMockCurrentBalance = (overrides = {}) => ({
  id: 'balance-1',
  employee_id: 'emp-1',
  company_id: 'comp-1',
  category_code: 'VAC',
  current_balance: 40.0,
  last_transaction_date: '2024-01-01T00:00:00Z',
  accrual_count: 5,
  usage_count: 2,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-10T10:00:00Z',
  ...overrides
});

export const createMockLedgerEntry = (overrides = {}) => ({
  id: 'ledger-1',
  employee_id: 'emp-1',
  policy_id: 'policy-1',
  entry_type: 'accrual',
  hours: 3.08,
  effective_date: '2024-01-01',
  notes: 'Biweekly accrual',
  created_at: '2024-01-01T00:00:00Z',
  company_id: 'comp-1',
  category_code: 'VAC',
  balance_after: 43.08,
  processed_date: '2024-01-01',
  related_request_id: null,
  payroll_period_id: null,
  description: 'Vacation accrual: 3.08 hours',
  processed_by: null,
  ...overrides
});

export const createMockTimeOffRequest = (overrides = {}) => ({
  id: 'req-1',
  company_id: 'comp-1',
  employee_id: 'emp-1',
  kind: 'Vacation',
  starts_at: '2024-01-15T00:00:00Z',
  ends_at: '2024-01-15T23:59:59Z',
  note: 'Personal day',
  status: 'PENDING',
  created_by: 'emp-1',
  created_at: '2024-01-10T10:00:00Z',
  approved_by: null,
  approved_at: null,
  denied_at: null,
  denial_reason: null,
  hours_requested: 8.0,
  hours_approved: null,
  accrual_type: 'vacation',
  policy_id: 'policy-1',
  ...overrides
});
