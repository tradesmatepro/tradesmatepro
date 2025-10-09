// ===============================================
// SUPABASE TYPES - GENERATED FROM ACTUAL SCHEMA
// Based on MASTER_DATABASE_SCHEMA_LOCKED.md
// Date: 2025-10-01 - UPDATED TO LOWERCASE
// ===============================================

// Work Orders Status Enum (from actual database - lowercase only!)
export type WorkOrderStatus =
  | 'draft'
  | 'quote'
  | 'sent'
  | 'approved'
  | 'rejected'
  | 'scheduled'
  | 'parts_ordered'
  | 'on_hold'
  | 'in_progress'
  | 'requires_approval'
  | 'rework_needed'
  | 'completed'
  | 'invoiced'
  | 'cancelled'
  | 'paid'
  | 'closed';

// Customer Communications Type Enum
// Note: This is USER-DEFINED in schema, need to verify actual values
export type CustomerCommunicationType =
  | 'EMAIL'
  | 'PHONE'
  | 'SMS'
  | 'MEETING'
  | 'NOTE';

// Service Agreements Status Enum
export type ServiceAgreementStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'TERMINATED'
  | 'DRAFT';

// Notifications Status Enum (Updated to match database)
export type NotificationStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'clicked'
  | 'failed'
  | 'bounced'
  | 'unsubscribed';

// ===============================================
// TABLE INTERFACES
// ===============================================

// Work Orders table
export interface WorkOrder {
  id: string;
  company_id: string | null;
  customer_id: string | null;
  title: string;
  description: string | null;
  status: WorkOrderStatus | null;
  estimated_duration: number | null;
  total_amount: number | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Customer Communications table
export interface CustomerCommunication {
  id: string;
  company_id: string | null;
  customer_id: string | null;
  type: CustomerCommunicationType | null;
  subject: string | null;
  body: string | null;
  metadata: Record<string, any> | null;
  created_by: string | null;
  created_at: string | null;
  created_by_profile?: {
    first_name: string;
    last_name: string;
  };
}

// Customer Tags table
export interface CustomerTag {
  id: string;
  company_id: string | null;
  customer_id: string | null;
  tag: string;
  created_at: string | null;
}

// Customer Service Agreements table
export interface CustomerServiceAgreement {
  id: string;
  company_id: string | null;
  customer_id: string | null;
  agreement_text: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ServiceAgreementStatus | null;
  created_at: string | null;
  updated_at: string | null;
}

// Notifications table
export interface Notification {
  id: string;
  company_id: string | null;
  user_id: string | null;
  type: string | null;
  message: string | null;
  status: NotificationStatus | null;
  created_at: string | null;
  read_at: string | null;
}

// Customers table
export interface Customer {
  id: string;
  company_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ===============================================
// QUERY HELPERS
// ===============================================

// Work Order status filters for different contexts (lowercase only!)
export const WORK_ORDER_QUOTE_STATUSES: WorkOrderStatus[] = ['quote', 'sent', 'approved', 'rejected'];
export const WORK_ORDER_JOB_STATUSES: WorkOrderStatus[] = ['scheduled', 'in_progress', 'completed', 'cancelled', 'invoiced'];
export const WORK_ORDER_ALL_STATUSES: WorkOrderStatus[] = ['draft', 'quote', 'sent', 'approved', 'rejected', 'scheduled', 'in_progress', 'completed', 'invoiced', 'cancelled', 'paid', 'closed'];

// Helper function to build PostgREST status filters
export const buildStatusFilter = (statuses: WorkOrderStatus[]): string => {
  return `status=in.(${statuses.join(',')})`;
};

// ===============================================
// NOTES:
// - All nullable fields marked with | null based on schema
// - Enum values match exactly what's in the database
// - Use buildStatusFilter() for consistent query building
// - Customer Communications type enum needs verification
// ===============================================
