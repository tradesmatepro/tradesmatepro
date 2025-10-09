import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

// Create supabase client for the Customer Portal
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * MarketplaceService - Service layer for marketplace operations (Customer Portal)
 * Uses Supabase RPC functions for optimized queries
 */

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

// Accept marketplace response and create work order using RPC function
export async function acceptMarketplaceResponse(responseId, customerId) {
  try {
    // Get response details first to get the request_id
    const { data: response, error: responseError } = await supabase
      .from('marketplace_responses')
      .select(`
        *,
        marketplace_requests (*),
        companies (*)
      `)
      .eq('id', responseId)
      .single();

    if (responseError) {
      console.error('Error fetching response:', responseError);
      throw responseError;
    }

    // Use the accept_marketplace_response RPC function
    const { data: result, error: rpcError } = await supabase.rpc('accept_marketplace_response', {
      request_id: response.request_id,
      response_id: responseId,
      customer_id: customerId
    });

    if (rpcError) {
      console.error('Error calling accept_marketplace_response RPC:', rpcError);
      throw rpcError;
    }

    // Fetch the created work order
    const { data: workOrder, error: workOrderError } = await supabase
      .from('work_orders')
      .select('*')
      .eq('marketplace_response_id', responseId)
      .single();

    if (workOrderError) {
      console.error('Error fetching created work order:', workOrderError);
      // Don't throw here as the acceptance was successful
    }

    return { response, workOrder, result };
  } catch (error) {
    console.error('MarketplaceService.acceptMarketplaceResponse error:', error);
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

// Get customer's marketplace requests
export async function getCustomerMarketplaceRequests(customerId) {
  try {
    const { data, error } = await supabase
      .from('marketplace_requests')
      .select(`
        *,
        request_tags (
          tags (id, name, category)
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer marketplace requests:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('MarketplaceService.getCustomerMarketplaceRequests error:', error);
    throw error;
  }
}

// Get all available tags
export async function getAllTags() {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, category')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('MarketplaceService.getAllTags error:', error);
    throw error;
  }
}

// Create or get tag by name
export async function createOrGetTag(tagName) {
  try {
    const normalizedName = tagName.toLowerCase().trim();
    
    // Try to get existing tag first
    const { data: existingTag, error: fetchError } = await supabase
      .from('tags')
      .select('*')
      .eq('name', normalizedName)
      .single();

    if (existingTag) {
      return existingTag;
    }

    // Create new tag if it doesn't exist
    const { data: newTag, error: createError } = await supabase
      .from('tags')
      .insert([{ 
        name: normalizedName,
        category: 'CUSTOM'
      }])
      .select()
      .single();

    if (createError) {
      // If it's a duplicate key error, try to fetch again
      if (createError.code === '23505') {
        const { data: tag, error: refetchError } = await supabase
          .from('tags')
          .select('*')
          .eq('name', normalizedName)
          .single();
        
        if (refetchError) {
          throw refetchError;
        }
        return tag;
      }
      throw createError;
    }

    return newTag;
  } catch (error) {
    console.error('MarketplaceService.createOrGetTag error:', error);
    throw error;
  }
}
