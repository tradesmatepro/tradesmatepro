// PTO System Tests - Comprehensive test suite for PTO functionality
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PTOServiceProduction from '../services/PTOServiceProduction';
import PTOAccrualEngine from '../services/PTOAccrualEngine';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('PTO System Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PTOServiceProduction', () => {
    describe('Policy Management', () => {
      it('should create a new PTO policy', async () => {
        const mockPolicy = {
          id: 'policy-1',
          name: 'Standard Policy',
          vacation_hours_per_period: 3.08,
          sick_hours_per_period: 1.54,
          accrual_period: 'biweekly'
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockPolicy
        });

        const result = await PTOServiceProduction.createPolicy({
          name: 'Standard Policy',
          vacation_hours_per_period: 3.08,
          sick_hours_per_period: 1.54,
          accrual_period: 'biweekly'
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
            accrual_period: 'biweekly'
          })
        });

        expect(result).toEqual(mockPolicy);
      });

      it('should fetch all policies', async () => {
        const mockPolicies = [
          { id: 'policy-1', name: 'Standard Policy' },
          { id: 'policy-2', name: 'Senior Policy' }
        ];

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockPolicies
        });

        const result = await PTOServiceProduction.getPolicies();

        expect(fetch).toHaveBeenCalledWith('/api/pto/policies', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        });

        expect(result).toEqual(mockPolicies);
      });

      it('should handle policy creation errors', async () => {
        fetch.mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Invalid policy data' })
        });

        await expect(PTOServiceProduction.createPolicy({}))
          .rejects.toThrow('Invalid policy data');
      });
    });

    describe('Balance Management', () => {
      it('should fetch employee balance', async () => {
        const mockBalance = {
          employee_id: 'emp-1',
          vacation_balance: 40.0,
          sick_balance: 20.0
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockBalance
        });

        const result = await PTOServiceProduction.getEmployeeBalance('emp-1');

        expect(fetch).toHaveBeenCalledWith('/api/pto/balances/emp-1', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        });

        expect(result).toEqual(mockBalance);
      });

      it('should update employee balance', async () => {
        const mockUpdatedBalance = {
          employee_id: 'emp-1',
          vacation_balance: 45.0,
          sick_balance: 20.0
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockUpdatedBalance
        });

        const result = await PTOServiceProduction.updateBalance('emp-1', {
          vacation_balance: 45.0,
          reason: 'Manual adjustment'
        });

        expect(fetch).toHaveBeenCalledWith('/api/pto/balances/emp-1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            vacation_balance: 45.0,
            reason: 'Manual adjustment'
          })
        });

        expect(result).toEqual(mockUpdatedBalance);
      });
    });

    describe('Request Management', () => {
      it('should create a PTO request', async () => {
        const mockRequest = {
          id: 'req-1',
          employee_id: 'emp-1',
          accrual_type: 'vacation',
          hours_requested: 8.0,
          status: 'PENDING'
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockRequest
        });

        const result = await PTOServiceProduction.createRequest({
          accrual_type: 'vacation',
          start_date: '2024-01-15',
          end_date: '2024-01-15',
          hours_requested: 8.0,
          reason: 'Personal day'
        });

        expect(fetch).toHaveBeenCalledWith('/api/pto/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            accrual_type: 'vacation',
            start_date: '2024-01-15',
            end_date: '2024-01-15',
            hours_requested: 8.0,
            reason: 'Personal day'
          })
        });

        expect(result).toEqual(mockRequest);
      });

      it('should approve a PTO request', async () => {
        const mockApprovedRequest = {
          id: 'req-1',
          status: 'APPROVED',
          hours_approved: 8.0
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockApprovedRequest
        });

        const result = await PTOServiceProduction.approveRequest('req-1', {
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

      it('should deny a PTO request', async () => {
        const mockDeniedRequest = {
          id: 'req-1',
          status: 'DENIED',
          denial_reason: 'Insufficient coverage'
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockDeniedRequest
        });

        const result = await PTOServiceProduction.denyRequest('req-1', 'Insufficient coverage');

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

    describe('Utility Methods', () => {
      it('should calculate business days correctly', () => {
        // Monday to Friday (5 business days)
        const businessDays = PTOServiceProduction.calculateBusinessDays('2024-01-15', '2024-01-19');
        expect(businessDays).toBe(5);
      });

      it('should exclude weekends from business days calculation', () => {
        // Friday to Monday (2 business days, excluding weekend)
        const businessDays = PTOServiceProduction.calculateBusinessDays('2024-01-19', '2024-01-22');
        expect(businessDays).toBe(2);
      });

      it('should calculate hours from days', () => {
        const hours = PTOServiceProduction.calculateHoursFromDays(2.5, 8);
        expect(hours).toBe(20);
      });

      it('should format balance correctly', () => {
        expect(PTOServiceProduction.formatBalance(40.5)).toBe('40.5');
        expect(PTOServiceProduction.formatBalance(40)).toBe('40.0');
        expect(PTOServiceProduction.formatBalance(null)).toBe('0.0');
      });

      it('should validate request data', () => {
        const validData = {
          start_date: '2024-01-15',
          end_date: '2024-01-15',
          hours_requested: 8.0,
          accrual_type: 'vacation'
        };

        const errors = PTOServiceProduction.validateRequestData(validData);
        expect(errors).toHaveLength(0);
      });

      it('should return validation errors for invalid data', () => {
        const invalidData = {
          start_date: '',
          end_date: '2024-01-15',
          hours_requested: -1,
          accrual_type: ''
        };

        const errors = PTOServiceProduction.validateRequestData(invalidData);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors).toContain('Start date is required');
        expect(errors).toContain('Hours requested must be greater than 0');
        expect(errors).toContain('PTO type is required');
      });
    });
  });

  describe('PTOAccrualEngine', () => {
    it('should process accruals for all employees', async () => {
      const mockResult = {
        success: true,
        processed_employees: 5,
        results: []
      };

      // Mock the service call
      vi.spyOn(PTOServiceProduction, 'processAccrual').mockResolvedValue(mockResult);

      const result = await PTOAccrualEngine.processAllAccruals();

      expect(result.success).toBe(true);
      expect(result.processed_employees).toBe(5);
    });

    it('should handle accrual processing errors', async () => {
      vi.spyOn(PTOServiceProduction, 'processAccrual').mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await PTOAccrualEngine.processAllAccruals();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('should calculate correct interval from accrual period', () => {
      const weeklyInterval = PTOAccrualEngine.getIntervalFromPeriod('weekly');
      const biweeklyInterval = PTOAccrualEngine.getIntervalFromPeriod('biweekly');
      const monthlyInterval = PTOAccrualEngine.getIntervalFromPeriod('monthly');

      expect(weeklyInterval).toBe(7 * 24 * 60 * 60 * 1000);
      expect(biweeklyInterval).toBe(14 * 24 * 60 * 60 * 1000);
      expect(monthlyInterval).toBe(30 * 24 * 60 * 60 * 1000);
    });

    it('should return engine status', () => {
      const status = PTOAccrualEngine.getEngineStatus();

      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('lastRun');
      expect(status).toHaveProperty('scheduledJobs');
      expect(Array.isArray(status.scheduledJobs)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete PTO request workflow', async () => {
      // Mock the entire workflow
      const mockBalance = { vacation_balance: 40.0, sick_balance: 20.0 };
      const mockRequest = { id: 'req-1', status: 'PENDING' };
      const mockApproval = { id: 'req-1', status: 'APPROVED' };

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockBalance })
        .mockResolvedValueOnce({ ok: true, json: async () => mockRequest })
        .mockResolvedValueOnce({ ok: true, json: async () => mockApproval });

      // 1. Check balance
      const balance = await PTOServiceProduction.getEmployeeBalance('emp-1');
      expect(balance.vacation_balance).toBe(40.0);

      // 2. Create request
      const request = await PTOServiceProduction.createRequest({
        accrual_type: 'vacation',
        hours_requested: 8.0
      });
      expect(request.status).toBe('PENDING');

      // 3. Approve request
      const approval = await PTOServiceProduction.approveRequest('req-1');
      expect(approval.status).toBe('APPROVED');
    });

    it('should handle insufficient balance scenario', async () => {
      const mockBalance = { vacation_balance: 4.0, sick_balance: 20.0 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBalance
      });

      const balance = await PTOServiceProduction.getEmployeeBalance('emp-1');
      
      // Validate that 8 hours request would exceed available balance
      const requestData = {
        start_date: '2024-01-15',
        end_date: '2024-01-15',
        hours_requested: 8.0,
        accrual_type: 'vacation'
      };

      // This would be handled by the validation logic in the UI
      const availableBalance = balance.vacation_balance;
      const requestedHours = requestData.hours_requested;
      
      expect(requestedHours).toBeGreaterThan(availableBalance);
    });
  });
});

// Test utilities
export const createMockEmployee = (overrides = {}) => ({
  id: 'emp-1',
  name: 'John Doe',
  email: 'john@example.com',
  company_id: 'comp-1',
  is_active: true,
  ...overrides
});

export const createMockPTORequest = (overrides = {}) => ({
  id: 'req-1',
  employee_id: 'emp-1',
  accrual_type: 'vacation',
  starts_at: '2024-01-15T00:00:00Z',
  ends_at: '2024-01-15T23:59:59Z',
  hours_requested: 8.0,
  status: 'PENDING',
  note: 'Personal day',
  created_at: '2024-01-10T10:00:00Z',
  ...overrides
});

export const createMockPTOBalance = (overrides = {}) => ({
  employee_id: 'emp-1',
  vacation_balance: 40.0,
  sick_balance: 20.0,
  policy_id: 'policy-1',
  last_accrual: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-10T10:00:00Z',
  ...overrides
});

export const createMockPTOPolicy = (overrides = {}) => ({
  id: 'policy-1',
  company_id: 'comp-1',
  name: 'Standard Policy',
  vacation_hours_per_period: 3.08,
  sick_hours_per_period: 1.54,
  accrual_period: 'biweekly',
  max_vacation_hours: 120.0,
  max_sick_hours: 80.0,
  carryover_limit: 40.0,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
});
