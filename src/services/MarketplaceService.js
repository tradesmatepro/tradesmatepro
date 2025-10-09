import { supabase } from '../utils/supabaseClient';
import { DB_RESPONSE_STATUS } from '../constants/marketplaceEnums';

// ===============================================
// REFERENCE DATA SERVICES
// ===============================================

// Get all service categories
export async function getServiceCategories() {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }
}

// Get subcategories for a category
export async function getServiceSubcategories(categoryId = null) {
  try {
    let query = supabase
      .from('service_subcategories')
      .select(`
        *,
        service_categories (
          id,
          name
        )
      `)
      .order('name');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching service subcategories:', error);
    throw error;
  }
}

// Get all tags
export async function getTags() {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
}

// Create new tag if it doesn't exist
export async function createTag(name) {
  try {
    const { data, error } = await supabase
      .from('tags')
      .upsert({ name }, { onConflict: 'name' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
}

// ===============================================
// MARKETPLACE REQUESTS SERVICES
// ===============================================

/**
 * MarketplaceService - Service layer for marketplace operations
 * Phase 2: Uses Supabase RPC functions exclusively - no direct table access
 */

// Contractor: get requests available to this company
export async function getAvailableRequests(companyId, tags = []) {
  try {
    const { data, error } = await supabase.rpc('get_available_requests', {
      _company_id: companyId,
      _tags: tags.length ? tags : null
    });
    
    if (error) {
      console.error('Error fetching available requests:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('MarketplaceService.getAvailableRequests error:', error);
    throw error;
  }
}

// Contractor: browse marketplace requests with filters
export async function getBrowseRequests(
  companyId,
  tags = [],
  pricing = [],
  requestType = []
) {
  try {
    // Pull available requests not posted by this company (or posted by customers without a company)
    const resp = await supabase
      .from('marketplace_requests')
      .select(`
        *,
        service_categories (
          id,
          name
        )
      `)
      .eq('status', 'available')
      .or(`company_id.is.null,company_id.neq.${companyId}`)
      .order('created_at', { ascending: false });

    if (resp.error) {
      console.error('Error browsing requests:', resp.error);
      throw resp.error;
    }

    let data = resp.data || [];

    // Normalize embedded tag names for client-side filtering (handle both old and new schema)
    const normalized = (arr) => (arr || []).map(t => {
      // New schema: use tags.name if available
      if (t?.tags?.name) return t.tags.name.toLowerCase();
      // Old schema fallback: use tag field directly
      if (t?.tag) return t.tag.toLowerCase();
      return '';
    }).filter(Boolean);

    if (tags && tags.length) {
      const desired = tags.map(t => t.toLowerCase());
      data = data.filter(r => {
        const names = normalized(r.request_tags);
        return names.some(n => desired.includes(n));
      });
    }
    if (requestType && requestType.length) {
      data = data.filter(r => r && requestType.includes(r.request_type));
    }
    if (pricing && pricing.length) {
      data = data.filter(r => r && pricing.includes(r.pricing_preference));
    }

    return data;
  } catch (error) {
    console.error('MarketplaceService.getBrowseRequests error:', error);
    throw error;
  }
}

// Customer: search contractors by tags
export async function getCompaniesByTags(tags = [], limit = 20) {
  try {
    const { data, error } = await supabase.rpc('get_companies_by_tags', {
      _tags: tags.length ? tags : null,
      _limit: limit
    });
    
    if (error) {
      console.error('Error fetching companies by tags:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('MarketplaceService.getCompaniesByTags error:', error);
    throw error;
  }
}

// Create marketplace request
export async function createMarketplaceRequest(requestData, tags = []) {
  try {
    // Insert marketplace request
    const { data: request, error: requestError } = await supabase
      .from('marketplace_requests')
      .insert([requestData])
      .select()
      .single();

    if (requestError) {
      console.error('Error creating marketplace request:', requestError);
      throw requestError;
    }

    // Insert tags if provided
    if (tags.length > 0) {
      // First ensure all tags exist
      for (const tagName of tags) {
        const { error: tagError } = await supabase
          .from('tags')
          .insert([{ name: tagName.toLowerCase().trim() }])
          .select()
          .single();
        
        // Ignore duplicate key errors (tag already exists)
        if (tagError && tagError.code !== '23505') {
          console.error('Error creating tag:', tagError);
        }
      }

      // Get tag IDs
      const { data: tagData, error: tagFetchError } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', tags.map(t => t.toLowerCase().trim()));

      if (tagFetchError) {
        console.error('Error fetching tag IDs:', tagFetchError);
        throw tagFetchError;
      }

      // Insert request_tags relationships
      const requestTags = tagData.map(tag => ({
        request_id: request.id,
        tag_id: tag.id
      }));

      const { error: requestTagsError } = await supabase
        .from('request_tags')
        .insert(requestTags);

      if (requestTagsError) {
        console.error('Error linking request tags:', requestTagsError);
        throw requestTagsError;
      }
    }

    return request;
  } catch (error) {
    console.error('MarketplaceService.createMarketplaceRequest error:', error);
    throw error;
  }
}

// Submit marketplace response - Phase 2: RPC only
export async function submitMarketplaceResponse(payload) {
  try {
    console.log('🚀 Submitting marketplace response via RPC:', payload);

    const { data, error } = await supabase.rpc('submit_marketplace_response', {
      _request_id: payload.request_id,
      _company_id: payload.company_id,
      _role_id: payload.role_id || null,
      _response_status: payload.response_status,
      _proposed_rate: payload.proposed_rate || null,
      _duration_hours: payload.duration_hours || null,
      _proposed_start: payload.proposed_start || null,
      _proposed_end: payload.proposed_end || null,
      _message: payload.message || null
    });

    if (error) {
      console.error('❌ RPC submit_marketplace_response failed:', error);
      throw error;
    }

    console.log('✅ Response submitted successfully, ID:', data);
    return { id: data };
  } catch (error) {
    console.error('❌ MarketplaceService.submitMarketplaceResponse error:', error);
    throw error;
  }
}

// Accept marketplace response - Phase 2: RPC only
export async function acceptMarketplaceResponse(responseId, customerId) {
  try {
    console.log('🚀 Accepting marketplace response via RPC:', { responseId, customerId });

    const { data, error } = await supabase.rpc('accept_marketplace_response', {
      _response_id: responseId,
      _customer_id: customerId
    });

    if (error) {
      console.error('❌ RPC accept_marketplace_response failed:', error);
      throw error;
    }

    console.log('✅ Response accepted successfully, work order ID:', data);
    return { workOrderId: data };
  } catch (error) {
    console.error('❌ MarketplaceService.acceptMarketplaceResponse error:', error);
    throw error;
  }
}


// Get matching contractors for a request - Phase 2: RPC only
export async function getMatchingContractors(requestId) {
  try {
    console.log('🚀 Getting matching contractors via RPC for request:', requestId);

    const { data, error } = await supabase.rpc('match_contractors_to_request', {
      _request_id: requestId
    });

    if (error) {
      console.error('❌ RPC match_contractors_to_request failed:', error);
      throw error;
    }

    console.log('✅ Found matching contractors:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ MarketplaceService.getMatchingContractors error:', error);
    throw error;
  }
}

// Submit marketplace review
export async function submitMarketplaceReview(reviewData) {
  try {
    const { data, error } = await supabase
      .from('marketplace_reviews')
      .insert([reviewData])
      .select()
      .single();

    if (error) {
      console.error('Error submitting review:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('MarketplaceService.submitMarketplaceReview error:', error);
    throw error;
  }
}

// Get marketplace responses for a request
export async function getMarketplaceResponses(requestId) {
  try {
    const { data, error } = await supabase
      .from('marketplace_responses')
      .select(`
        *,
        companies (
          id,
          name,
          email,
          phone,
          avg_rating,
          rating_count,
          company_logo_url
        )
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching marketplace responses:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('MarketplaceService.getMarketplaceResponses error:', error);
    throw error;
  }
}

// Get company's marketplace requests
export async function getCompanyMarketplaceRequests(companyId) {
  try {
    const { data, error } = await supabase
      .from('marketplace_requests')
      .select(`
        *,
        marketplace_responses!marketplace_responses_request_id_fkey (*)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching company marketplace requests:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('MarketplaceService.getCompanyMarketplaceRequests error:', error);
    throw error;
  }
}

// Get company's marketplace responses
export async function getCompanyMarketplaceResponses(companyId) {
  try {
    const { data, error } = await supabase
      .from('marketplace_responses')
      .select(`
        *,
        marketplace_requests!marketplace_responses_request_id_fkey (
          id,
          title,
          description,
          budget_min,
          budget_max,
          service_address,
          status,
          service_categories (
            id,
            name
          )
        )
      `)
      .eq('contractor_company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching company marketplace responses:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('MarketplaceService.getCompanyMarketplaceResponses error:', error);
    throw error;
  }
}

// Check if company has already responded to a request
export async function getCompanyResponseForRequest(companyId, requestId) {
  try {
    const { data, error } = await supabase
      .from('marketplace_responses')
      .select('*')
      .eq('contractor_company_id', companyId)
      .eq('request_id', requestId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking company response:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('MarketplaceService.getCompanyResponseForRequest error:', error);
    throw error;
  }
}

// Get responses for multiple requests (batch check)
export async function getCompanyResponsesForRequests(companyId, requestIds) {
  try {
    const { data, error } = await supabase
      .from('marketplace_responses')
      .select('request_id, response_status, created_at, id')
      .eq('contractor_company_id', companyId)
      .in('request_id', requestIds);

    if (error) {
      console.error('Error fetching company responses for requests:', error);
      throw error;
    }

    // Convert to map for easy lookup
    const responseMap = {};
    (data || []).forEach(response => {
      responseMap[response.request_id] = response;
    });

    return responseMap;
  } catch (error) {
    console.error('MarketplaceService.getCompanyResponsesForRequests error:', error);
    throw error;
  }
}
