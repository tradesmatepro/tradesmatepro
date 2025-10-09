// ===============================================
// MARKETPLACE TYPES - Industry Standard Schema
// Generated: 2025-09-22
// ===============================================

// Enum Types
// ===============================================

export type RequestTypeEnum = 
  | 'INSTALLATION'
  | 'REPAIR'
  | 'MAINTENANCE'
  | 'INSPECTION'
  | 'OTHER';

export type PricingPreferenceEnum = 
  | 'FIXED_PRICE'
  | 'HOURLY'
  | 'ESTIMATE'
  | 'BIDDING';

export type UrgencyEnum = 
  | 'ASAP'
  | 'SCHEDULED'
  | 'FLEXIBLE';

export type MarketplaceResponseStatusEnum = 
  | 'INTERESTED'
  | 'DECLINED'
  | 'ACCEPTED'
  | 'PENDING';

export type ContactPreferenceType = 
  | 'PHONE'
  | 'SMS'
  | 'EMAIL'
  | 'ANY';

// Reference Table Types
// ===============================================

export interface ServiceCategory {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceSubcategory {
  id: string;
  category_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface RequestTag {
  id: string;
  request_id: string;
  tag_id: string;
  tags?: Tag; // For joined queries
}

// Core Marketplace Types
// ===============================================

export interface MarketplaceRequest {
  id: string;
  company_id: string;
  customer_id?: string;
  title: string;
  description?: string;
  status: string;
  budget?: number; // Legacy field
  budget_min?: number;
  budget_max?: number;
  location?: string; // Legacy field
  service_address?: string;
  latitude?: number;
  longitude?: number;
  request_type?: RequestTypeEnum;
  pricing_preference?: PricingPreferenceEnum;
  urgency?: UrgencyEnum;
  category_id?: string;
  subcategory_id?: string;
  preferred_schedule?: any; // JSONB
  contact_preference?: ContactPreferenceType;
  created_at: string;
  updated_at: string;
  
  // Joined data
  service_categories?: ServiceCategory;
  service_subcategories?: ServiceSubcategory;
  request_tags?: RequestTag[];
}

export interface MarketplaceResponse {
  id: string;
  request_id: string;
  company_id: string;
  message?: string;
  proposed_price?: number;
  estimated_duration?: string;
  availability?: string;
  response_status?: MarketplaceResponseStatusEnum;
  created_at: string;
  updated_at: string;
  
  // Joined data
  marketplace_requests?: MarketplaceRequest;
}

export interface MarketplaceMessage {
  id: string;
  request_id: string;
  sender_company_id: string;
  receiver_company_id: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceReview {
  id: string;
  request_id: string;
  reviewer_company_id: string;
  reviewed_company_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
}

// Form Types for UI
// ===============================================

export interface CreateMarketplaceRequestForm {
  title: string;
  description?: string;
  request_type?: RequestTypeEnum;
  pricing_preference?: PricingPreferenceEnum;
  urgency?: UrgencyEnum;
  category_id?: string;
  subcategory_id?: string;
  service_address?: string;
  budget_min?: number;
  budget_max?: number;
  contact_preference?: ContactPreferenceType;
  preferred_schedule?: any;
  tags?: string[]; // Tag names for creation
}

export interface CreateMarketplaceResponseForm {
  request_id: string;
  message?: string;
  proposed_price?: number;
  estimated_duration?: string;
  availability?: string;
  response_status?: MarketplaceResponseStatusEnum;
}

// Filter Types for Search
// ===============================================

export interface MarketplaceFilters {
  categories?: string[];
  subcategories?: string[];
  request_types?: RequestTypeEnum[];
  pricing_preferences?: PricingPreferenceEnum[];
  urgency_levels?: UrgencyEnum[];
  budget_min?: number;
  budget_max?: number;
  location_radius?: number; // Miles from user location
  tags?: string[];
}

// API Response Types
// ===============================================

export interface MarketplaceRequestsResponse {
  data: MarketplaceRequest[];
  count: number;
  page: number;
  limit: number;
}

export interface MarketplaceResponsesResponse {
  data: MarketplaceResponse[];
  count: number;
  page: number;
  limit: number;
}

// Constants for UI
// ===============================================

export const REQUEST_TYPE_OPTIONS: { value: RequestTypeEnum; label: string }[] = [
  { value: 'INSTALLATION', label: 'Installation' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'OTHER', label: 'Other' }
];

export const PRICING_PREFERENCE_OPTIONS: { value: PricingPreferenceEnum; label: string }[] = [
  { value: 'FIXED_PRICE', label: 'Fixed Price' },
  { value: 'HOURLY', label: 'Hourly Rate' },
  { value: 'ESTIMATE', label: 'Get Estimate' },
  { value: 'BIDDING', label: 'Accept Bids' }
];

export const URGENCY_OPTIONS: { value: UrgencyEnum; label: string }[] = [
  { value: 'ASAP', label: 'ASAP' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'FLEXIBLE', label: 'Flexible' }
];

export const CONTACT_PREFERENCE_OPTIONS: { value: ContactPreferenceType; label: string }[] = [
  { value: 'PHONE', label: 'Phone Call' },
  { value: 'SMS', label: 'Text Message' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'ANY', label: 'Any Method' }
];

export const RESPONSE_STATUS_OPTIONS: { value: MarketplaceResponseStatusEnum; label: string }[] = [
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'PENDING', label: 'Pending' }
];
