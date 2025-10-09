import { supaFetch } from './supaFetch';

// Enhanced supaFetch with retry logic and backoff
export const supaFetchWithRetry = async (
  url, 
  options = {}, 
  companyId = null, 
  retryOptions = {}
) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = (error, response) => {
      // Retry on network errors or 5xx server errors
      if (!response) return true; // Network error
      return response.status >= 500 && response.status < 600;
    }
  } = retryOptions;

  let lastError = null;
  let lastResponse = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await supaFetch(url, options, companyId);
      
      // If successful or non-retryable error, return immediately
      if (response.ok || !retryCondition(null, response)) {
        return response;
      }
      
      lastResponse = response;
      
      // If this is the last attempt, don't wait
      if (attempt === maxRetries) break;
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );
      const jitteredDelay = delay + Math.random() * 1000; // Add up to 1s jitter
      
      console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(jitteredDelay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      
    } catch (error) {
      lastError = error;
      
      // If this is the last attempt or error is not retryable, throw
      if (attempt === maxRetries || !retryCondition(error, null)) {
        throw error;
      }
      
      // Calculate delay for network errors
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );
      const jitteredDelay = delay + Math.random() * 1000;
      
      console.warn(`Network error (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(jitteredDelay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  // If we get here, all retries failed
  if (lastError) {
    throw lastError;
  }
  
  return lastResponse;
};

// Batch request utility for reducing API calls
export const batchRequests = async (requests, options = {}) => {
  const {
    batchSize = 5,
    delayBetweenBatches = 100,
    failFast = false
  } = options;

  const results = [];
  const errors = [];

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    
    try {
      const batchPromises = batch.map(async (request, index) => {
        try {
          const result = await request();
          return { success: true, data: result, index: i + index };
        } catch (error) {
          const errorResult = { success: false, error, index: i + index };
          if (failFast) throw error;
          return errorResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results[result.index] = result.data;
        } else {
          errors[result.index] = result.error;
        }
      });

      // Add delay between batches to avoid overwhelming the server
      if (i + batchSize < requests.length && delayBetweenBatches > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }

    } catch (error) {
      if (failFast) throw error;
      // Mark remaining requests in this batch as failed
      for (let j = 0; j < batch.length; j++) {
        errors[i + j] = error;
      }
    }
  }

  return { results, errors };
};

// Query optimization helpers
export const optimizeQuery = (baseQuery, options = {}) => {
  const {
    select = '*',
    limit = null,
    offset = null,
    order = null,
    filters = {}
  } = options;

  let query = baseQuery;

  // Add select clause for specific fields only
  if (select !== '*') {
    query += `?select=${encodeURIComponent(select)}`;
  } else {
    query += '?select=*';
  }

  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      query += `&${key}=${encodeURIComponent(value)}`;
    }
  });

  // Add ordering
  if (order) {
    query += `&order=${encodeURIComponent(order)}`;
  }

  // Add pagination
  if (limit) {
    query += `&limit=${limit}`;
  }
  if (offset) {
    query += `&offset=${offset}`;
  }

  return query;
};

// Pagination helper
export const usePagination = (pageSize = 50) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);
  
  const offset = currentPage * pageSize;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const goToPage = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };
  
  const reset = () => {
    setCurrentPage(0);
    setTotalCount(0);
  };
  
  return {
    currentPage,
    pageSize,
    offset,
    totalCount,
    totalPages,
    setTotalCount,
    nextPage,
    prevPage,
    goToPage,
    reset,
    hasNextPage: currentPage < totalPages - 1,
    hasPrevPage: currentPage > 0
  };
};

export default supaFetchWithRetry;
