import { getSupabaseClient } from '../utils/supabaseClient';

/**
 * InvoiceRPCService - Backend RPC functions for invoice operations
 * Single source of truth for all invoice filtering/sorting
 * Used by: Web, Android, iOS apps
 */
class InvoiceRPCService {
  /**
   * Get filtered invoices from backend
   * @param {UUID} companyId - Company ID
   * @param {string} statusFilter - 'all', 'outstanding', 'paid', 'overdue', 'aging_0_30', etc.
   * @param {string} searchTerm - Search by invoice number, title, or customer name
   * @param {Date} dateStart - Filter by created_at start date
   * @param {Date} dateEnd - Filter by created_at end date
   * @param {number} limit - Results per page
   * @param {number} offset - Pagination offset
   * @returns {Promise<Array>} Filtered invoices
   */
  static async getFilteredInvoices({
    companyId,
    statusFilter = 'all',
    searchTerm = '',
    dateStart = null,
    dateEnd = null,
    limit = 100,
    offset = 0
  }) {
    try {
      const supabase = getSupabaseClient();

      console.log('📞 Calling RPC get_filtered_invoices with:', {
        p_company_id: companyId,
        p_status_filter: statusFilter,
        p_search_term: searchTerm,
        p_date_start: dateStart,
        p_date_end: dateEnd,
        p_limit: limit,
        p_offset: offset
      });

      // Call RPC with explicit parameter names
      const { data, error } = await supabase.rpc('get_filtered_invoices', {
        p_company_id: companyId,
        p_status_filter: statusFilter,
        p_search_term: searchTerm,
        p_date_start: dateStart,
        p_date_end: dateEnd,
        p_limit: limit,
        p_offset: offset
      }, {
        // Force fresh call, don't use cache
        count: 'exact'
      });

      if (error) {
        console.error('❌ RPC Error - getFilteredInvoices:', error);
        console.error('Error message:', error.message);
        console.error('Error details:', error);
        throw error;
      }

      console.log('✅ RPC Success - returned', data?.length || 0, 'invoice IDs');
      console.log('Data:', data);
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching filtered invoices:', error);
      throw error;
    }
  }

  /**
   * Get invoice analytics (KPIs)
   * @param {UUID} companyId - Company ID
   * @returns {Promise<Object>} Analytics data
   */
  static async getInvoiceAnalytics(companyId) {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.rpc('get_invoice_analytics', {
        p_company_id: companyId
      });

      if (error) {
        console.error('RPC Error - getInvoiceAnalytics:', error);
        throw error;
      }

      return data?.[0] || {
        total_invoices: 0,
        outstanding_amount: 0,
        outstanding_count: 0,
        paid_amount: 0,
        paid_count: 0,
        overdue_amount: 0,
        overdue_count: 0,
        this_month_amount: 0,
        this_month_count: 0
      };
    } catch (error) {
      console.error('Error fetching invoice analytics:', error);
      throw error;
    }
  }

  /**
   * Update invoice status with validation
   * @param {UUID} invoiceId - Invoice ID
   * @param {string} newStatus - New status
   * @param {UUID} companyId - Company ID
   * @returns {Promise<Object>} Result with success flag and message
   */
  static async updateInvoiceStatus(invoiceId, newStatus, companyId) {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.rpc('update_invoice_status', {
        p_invoice_id: invoiceId,
        p_new_status: newStatus,
        p_company_id: companyId
      });

      if (error) {
        console.error('RPC Error - updateInvoiceStatus:', error);
        throw error;
      }

      const result = data?.[0];
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to update invoice status');
      }

      return result;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }
}

export default InvoiceRPCService;

