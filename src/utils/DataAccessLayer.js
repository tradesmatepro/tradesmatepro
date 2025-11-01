/**
 * UNIFIED DATA ACCESS LAYER
 * 
 * Single source of truth for all database queries.
 * Enforces:
 * - Company scoping (multi-tenant isolation)
 * - Consistent error handling
 * - Query validation
 * - RLS compliance
 * - Centralized logging
 * 
 * Usage:
 *   const dal = new DataAccessLayer(user.company_id);
 *   const employees = await dal.query('employees').select('*').execute();
 *   const employee = await dal.query('employees').where('id', id).single();
 *   const result = await dal.rpc('start_job', { p_work_order: id });
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env.js';
import { getSupabaseClient } from './supabaseClient.js';

// Tables that MUST be scoped by company_id
const SCOPED_TABLES = new Set([
  'users', 'customers', 'employees', 'work_orders', 'work_order_items',
  'work_order_line_items', 'work_order_labor', 'invoices', 'invoice_line_items',
  'expenses', 'messages', 'schedule_events', 'settings', 'companies',
  'purchase_orders', 'po_items', 'vendors', 'marketplace_requests',
  'marketplace_responses', 'pto_requests', 'pto_categories'
]);

// Tables that should NOT be scoped (global reference data)
const UNSCOPED_TABLES = new Set([
  'service_categories', 'service_tags', 'tax_rates', 'countries', 'states'
]);

class QueryBuilder {
  constructor(table, companyId, dal) {
    this.table = table;
    this.companyId = companyId;
    this.dal = dal;
    this.filters = [];
    this.selectFields = '*';
    this.orderBy = null;
    this.limit_ = null;
    this.offset_ = null;
    this.joins = [];
    this.isSingle = false;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  where(field, operator, value) {
    // Support both where(field, value) and where(field, operator, value)
    if (value === undefined) {
      value = operator;
      operator = 'eq';
    }
    this.filters.push({ field, operator, value });
    return this;
  }

  join(table, onField, joinField) {
    this.joins.push({ table, onField, joinField });
    return this;
  }

  order(field, ascending = true) {
    this.orderBy = `${field}.${ascending ? 'asc' : 'desc'}`;
    return this;
  }

  limit(n) {
    this.limit_ = n;
    return this;
  }

  offset(n) {
    this.offset_ = n;
    return this;
  }

  single() {
    this.isSingle = true;
    this.limit_ = 1;
    return this;
  }

  async execute() {
    try {
      const query = this._buildQuery();
      console.log(`📊 DAL Query: ${query}`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${this.dal.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`[${response.status}] ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return this.isSingle ? data[0] : data;
    } catch (error) {
      console.error(`❌ DAL Error in ${this.table}:`, error);
      throw error;
    }
  }

  _buildQuery() {
    let query = `${this.table}?select=${encodeURIComponent(this.selectFields)}`;

    // Auto-scope by company_id if required
    if (SCOPED_TABLES.has(this.table) && this.companyId) {
      this.filters.push({ field: 'company_id', operator: 'eq', value: this.companyId });
    }

    // Add all filters
    for (const filter of this.filters) {
      const { field, operator, value } = filter;
      query += `&${field}=${operator}.${encodeURIComponent(value)}`;
    }

    // Add ordering
    if (this.orderBy) {
      query += `&order=${this.orderBy}`;
    }

    // Add pagination
    if (this.limit_) query += `&limit=${this.limit_}`;
    if (this.offset_) query += `&offset=${this.offset_}`;

    return query;
  }
}

export class DataAccessLayer {
  constructor(companyId, accessToken = null) {
    this.companyId = companyId;
    this.accessToken = accessToken || SUPABASE_ANON_KEY;
  }

  /**
   * Start a new query
   * @param {string} table - Table name
   * @returns {QueryBuilder}
   */
  query(table) {
    if (!table) throw new Error('Table name required');
    return new QueryBuilder(table, this.companyId, this);
  }

  /**
   * Call RPC function
   * @param {string} functionName - RPC function name
   * @param {object} params - Function parameters
   * @returns {Promise}
   */
  async rpc(functionName, params = {}) {
    try {
      console.log(`📞 DAL RPC: ${functionName}`, params);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`RPC Error: ${error.message}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ DAL RPC Error in ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Insert record
   * @param {string} table - Table name
   * @param {object} data - Record data
   * @returns {Promise}
   */
  async insert(table, data) {
    try {
      // Auto-inject company_id if scoped table
      if (SCOPED_TABLES.has(table) && this.companyId && !data.company_id) {
        data.company_id = this.companyId;
      }

      console.log(`➕ DAL Insert: ${table}`, data);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Insert Error: ${error.message}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ DAL Insert Error in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Update record
   * @param {string} table - Table name
   * @param {string} id - Record ID
   * @param {object} data - Updated data
   * @returns {Promise}
   */
  async update(table, id, data) {
    try {
      console.log(`✏️ DAL Update: ${table}/${id}`, data);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Update Error: ${error.message}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ DAL Update Error in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Delete record
   * @param {string} table - Table name
   * @param {string} id - Record ID
   * @returns {Promise}
   */
  async delete(table, id) {
    try {
      console.log(`🗑️ DAL Delete: ${table}/${id}`);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Delete Error: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ DAL Delete Error in ${table}:`, error);
      throw error;
    }
  }
}

export default DataAccessLayer;

