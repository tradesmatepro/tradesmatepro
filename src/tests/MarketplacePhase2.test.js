import { 
  submitMarketplaceResponse, 
  acceptMarketplaceResponse,
  getMatchingContractors 
} from '../services/MarketplaceService';
import { DB_RESPONSE_STATUS } from '../constants/marketplaceEnums';

// Mock Supabase
jest.mock('../utils/supabaseClient', () => ({
  supabase: {
    rpc: jest.fn()
  }
}));

import { supabase } from '../utils/supabaseClient';

describe('Marketplace Phase 2 - Service Layer RPC Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitMarketplaceResponse', () => {
    test('calls submit_marketplace_response RPC with correct parameters', async () => {
      const mockResponseId = 'response-123';
      supabase.rpc.mockResolvedValue({ data: mockResponseId, error: null });

      const payload = {
        request_id: 'request-123',
        company_id: 'company-123',
        role_id: 'role-123',
        response_status: DB_RESPONSE_STATUS.INTERESTED,
        proposed_rate: 100.50,
        duration_hours: 8,
        proposed_start: '2025-01-01T09:00:00Z',
        proposed_end: '2025-01-01T17:00:00Z',
        message: 'I am interested in this project'
      };

      const result = await submitMarketplaceResponse(payload);

      expect(supabase.rpc).toHaveBeenCalledWith('submit_marketplace_response', {
        _request_id: payload.request_id,
        _company_id: payload.company_id,
        _role_id: payload.role_id,
        _response_status: payload.response_status,
        _proposed_rate: payload.proposed_rate,
        _duration_hours: payload.duration_hours,
        _proposed_start: payload.proposed_start,
        _proposed_end: payload.proposed_end,
        _message: payload.message
      });

      expect(result).toEqual({ id: mockResponseId });
    });

    test('handles null optional parameters correctly', async () => {
      const mockResponseId = 'response-456';
      supabase.rpc.mockResolvedValue({ data: mockResponseId, error: null });

      const payload = {
        request_id: 'request-123',
        company_id: 'company-123',
        role_id: null,
        response_status: DB_RESPONSE_STATUS.INTERESTED,
        proposed_rate: null,
        duration_hours: null,
        proposed_start: null,
        proposed_end: null,
        message: null
      };

      await submitMarketplaceResponse(payload);

      expect(supabase.rpc).toHaveBeenCalledWith('submit_marketplace_response', {
        _request_id: payload.request_id,
        _company_id: payload.company_id,
        _role_id: null,
        _response_status: payload.response_status,
        _proposed_rate: null,
        _duration_hours: null,
        _proposed_start: null,
        _proposed_end: null,
        _message: null
      });
    });

    test('throws error when RPC fails', async () => {
      const mockError = new Error('RPC failed');
      supabase.rpc.mockResolvedValue({ data: null, error: mockError });

      const payload = {
        request_id: 'request-123',
        company_id: 'company-123',
        response_status: DB_RESPONSE_STATUS.INTERESTED
      };

      await expect(submitMarketplaceResponse(payload)).rejects.toThrow('RPC failed');
    });
  });

  describe('acceptMarketplaceResponse', () => {
    test('calls accept_marketplace_response RPC with correct parameters', async () => {
      const mockWorkOrderId = 'work-order-123';
      supabase.rpc.mockResolvedValue({ data: mockWorkOrderId, error: null });

      const responseId = 'response-123';
      const customerId = 'customer-123';

      const result = await acceptMarketplaceResponse(responseId, customerId);

      expect(supabase.rpc).toHaveBeenCalledWith('accept_marketplace_response', {
        _response_id: responseId,
        _customer_id: customerId
      });

      expect(result).toEqual({ workOrderId: mockWorkOrderId });
    });

    test('throws error when RPC fails', async () => {
      const mockError = new Error('Accept failed');
      supabase.rpc.mockResolvedValue({ data: null, error: mockError });

      await expect(acceptMarketplaceResponse('response-123', 'customer-123'))
        .rejects.toThrow('Accept failed');
    });
  });

  describe('getMatchingContractors', () => {
    test('calls match_contractors_to_request RPC with correct parameters', async () => {
      const mockContractors = [
        { company_id: 'company-1', company_name: 'Contractor A' },
        { company_id: 'company-2', company_name: 'Contractor B' }
      ];
      supabase.rpc.mockResolvedValue({ data: mockContractors, error: null });

      const requestId = 'request-123';
      const result = await getMatchingContractors(requestId);

      expect(supabase.rpc).toHaveBeenCalledWith('match_contractors_to_request', {
        _request_id: requestId
      });

      expect(result).toEqual(mockContractors);
    });

    test('returns empty array when no contractors match', async () => {
      supabase.rpc.mockResolvedValue({ data: [], error: null });

      const result = await getMatchingContractors('request-123');
      expect(result).toEqual([]);
    });

    test('returns empty array when RPC returns null', async () => {
      supabase.rpc.mockResolvedValue({ data: null, error: null });

      const result = await getMatchingContractors('request-123');
      expect(result).toEqual([]);
    });
  });

  describe('Integration Flow', () => {
    test('complete marketplace flow works end-to-end', async () => {
      // Mock sequence: submit response -> accept response -> get contractors
      supabase.rpc
        .mockResolvedValueOnce({ data: 'response-123', error: null }) // submit
        .mockResolvedValueOnce({ data: 'work-order-123', error: null }) // accept
        .mockResolvedValueOnce({ data: [{ company_id: 'company-1', company_name: 'Test Co' }], error: null }); // match

      // 1. Submit response
      const submitResult = await submitMarketplaceResponse({
        request_id: 'request-123',
        company_id: 'company-123',
        response_status: DB_RESPONSE_STATUS.OFFER_SUBMITTED,
        proposed_rate: 150.00
      });

      expect(submitResult.id).toBe('response-123');

      // 2. Accept response
      const acceptResult = await acceptMarketplaceResponse('response-123', 'customer-123');
      expect(acceptResult.workOrderId).toBe('work-order-123');

      // 3. Get matching contractors
      const contractors = await getMatchingContractors('request-123');
      expect(contractors).toHaveLength(1);
      expect(contractors[0].company_name).toBe('Test Co');

      // Verify all RPC calls were made
      expect(supabase.rpc).toHaveBeenCalledTimes(3);
    });
  });
});
