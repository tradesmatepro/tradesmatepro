// Service Request API Routes
import express from 'express';
import { supaFetch } from '../utils/supaFetch.js';

const router = express.Router();

// =====================================================
// CUSTOMER SERVICE REQUESTS
// =====================================================

// POST /api/service-requests → Customer creates a new service request
router.post('/', async (req, res) => {
  try {
    const { company_id } = req.user;
    const {
      customer_id,
      service_tag_id,
      description,
      emergency = false,
      customer_budget,
      customer_location,
      customer_phone,
      customer_email,
      preferred_time
    } = req.body;
    
    if (!customer_id || !service_tag_id || !description) {
      return res.status(400).json({ 
        error: 'customer_id, service_tag_id, and description are required' 
      });
    }
    
    // Get emergency fee from companies that provide this service
    const companiesResponse = await supaFetch(
      `company_service_tags?service_tag_id=eq.${service_tag_id}&select=company_id,companies(business_settings)`,
      { method: 'GET' },
      company_id
    );
    
    let emergency_fee = null;
    if (emergency && companiesResponse.ok) {
      const companies = await companiesResponse.json();
      // Use the first company's emergency fee as default (could be improved with averaging)
      if (companies.length > 0 && companies[0].companies?.business_settings?.emergency_fee) {
        emergency_fee = companies[0].companies.business_settings.emergency_fee;
      }
    }
    
    const serviceRequestData = {
      customer_id,
      service_tag_id,
      description,
      emergency,
      customer_budget,
      emergency_fee,
      customer_location,
      customer_phone,
      customer_email,
      preferred_time,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };
    
    const response = await supaFetch(
      'service_requests',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceRequestData)
      },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to create service request');
    }
    
    const serviceRequest = await response.json();
    
    // TODO: Trigger notifications to matching contractors
    // This would integrate with your existing notification system
    
    res.json(serviceRequest[0]);
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ error: 'Failed to create service request' });
  }
});

// GET /api/service-requests → Get service requests (filtered by user role)
router.get('/', async (req, res) => {
  try {
    const { company_id, role, id: user_id } = req.user;
    const { status, emergency, service_tag_id, customer_id } = req.query;
    
    let query = 'service_requests?';
    const params = [];
    
    // Role-based filtering
    if (role === 'customer') {
      // Customers see only their own requests
      params.push(`customer_id=eq.${user_id}`);
    } else if (['admin', 'owner', 'employee'].includes(role)) {
      // Contractors see requests for their service tags or assigned to their company
      if (req.query.available === 'true') {
        // Show available requests for this company's service tags
        const serviceTagsResponse = await supaFetch(
          `company_service_tags?company_id=eq.${company_id}&select=service_tag_id`,
          { method: 'GET' },
          company_id
        );
        
        if (serviceTagsResponse.ok) {
          const serviceTags = await serviceTagsResponse.json();
          const tagIds = serviceTags.map(st => st.service_tag_id);
          if (tagIds.length > 0) {
            params.push(`service_tag_id=in.(${tagIds.join(',')})`);
            params.push('status=eq.open');
          } else {
            // Company has no service tags, return empty result
            return res.json([]);
          }
        }
      } else {
        // Show requests assigned to this company
        params.push(`company_id=eq.${company_id}`);
      }
    }
    
    // Additional filters
    if (status) params.push(`status=eq.${status}`);
    if (emergency !== undefined) params.push(`emergency=eq.${emergency}`);
    if (service_tag_id) params.push(`service_tag_id=eq.${service_tag_id}`);
    if (customer_id) params.push(`customer_id=eq.${customer_id}`);
    
    query += params.join('&');
    query += '&select=*,service_tags(name,description),customers(name,email,phone)';
    query += '&order=emergency.desc,created_at.desc';
    
    const response = await supaFetch(query, { method: 'GET' }, company_id);
    
    if (!response.ok) {
      throw new Error('Failed to fetch service requests');
    }
    
    const serviceRequests = await response.json();
    res.json(serviceRequests);
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({ error: 'Failed to fetch service requests' });
  }
});

// GET /api/service-requests/:id → Get specific service request details
router.get('/:id', async (req, res) => {
  try {
    const { company_id, role, id: user_id } = req.user;
    const { id } = req.params;
    
    const response = await supaFetch(
      `service_requests?id=eq.${id}&select=*,service_tags(name,description),customers(name,email,phone),companies(name)`,
      { method: 'GET' },
      company_id
    );
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Service request not found' });
    }
    
    const serviceRequests = await response.json();
    if (serviceRequests.length === 0) {
      return res.status(404).json({ error: 'Service request not found' });
    }
    
    const serviceRequest = serviceRequests[0];
    
    // Role-based access control
    if (role === 'customer' && serviceRequest.customer_id !== user_id) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (['admin', 'owner', 'employee'].includes(role) && 
               serviceRequest.company_id !== company_id) {
      // Check if company provides this service (for open requests)
      if (serviceRequest.status === 'open') {
        const hasServiceResponse = await supaFetch(
          `company_service_tags?company_id=eq.${company_id}&service_tag_id=eq.${serviceRequest.service_tag_id}`,
          { method: 'GET' },
          company_id
        );
        
        if (!hasServiceResponse.ok) {
          return res.status(403).json({ error: 'Access denied' });
        }
        
        const hasService = await hasServiceResponse.json();
        if (hasService.length === 0) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    // Get responses for this request
    const responsesResponse = await supaFetch(
      `service_request_responses?service_request_id=eq.${id}&select=*,companies(name)&order=created_at.desc`,
      { method: 'GET' },
      company_id
    );
    
    let responses = [];
    if (responsesResponse.ok) {
      responses = await responsesResponse.json();
    }
    
    res.json({
      ...serviceRequest,
      responses
    });
  } catch (error) {
    console.error('Error fetching service request:', error);
    res.status(500).json({ error: 'Failed to fetch service request' });
  }
});

// =====================================================
// CONTRACTOR RESPONSES
// =====================================================

// POST /api/service-requests/:id/accept → Contractor accepts a service request
router.post('/:id/accept', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { id } = req.params;
    const { quoted_price, estimated_arrival, notes } = req.body;
    
    // Only contractors can accept requests
    if (!['admin', 'owner', 'employee'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Use the database function to handle first-accept logic
    const response = await supaFetch(
      'rpc/accept_service_request',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: id,
          accepting_company_id: company_id,
          quoted_price,
          estimated_arrival,
          notes
        })
      },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to accept service request');
    }
    
    const result = await response.json();
    
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error accepting service request:', error);
    res.status(500).json({ error: 'Failed to accept service request' });
  }
});

// POST /api/service-requests/:id/decline → Contractor declines a service request
router.post('/:id/decline', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { id } = req.params;
    const { notes } = req.body;
    
    // Only contractors can decline requests
    if (!['admin', 'owner', 'employee'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Use the database function to handle decline logic
    const response = await supaFetch(
      'rpc/decline_service_request',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: id,
          declining_company_id: company_id,
          notes
        })
      },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to decline service request');
    }
    
    const result = await response.json();
    res.json({ message: result.message });
  } catch (error) {
    console.error('Error declining service request:', error);
    res.status(500).json({ error: 'Failed to decline service request' });
  }
});

// PUT /api/service-requests/:id/status → Update service request status
router.put('/:id/status', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    
    const validStatuses = ['open', 'accepted', 'declined', 'expired', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Only contractors can update status of their assigned requests
    if (!['admin', 'owner', 'employee'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const response = await supaFetch(
      `service_requests?id=eq.${id}&company_id=eq.${company_id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          updated_at: new Date().toISOString()
        })
      },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to update service request status');
    }
    
    const serviceRequest = await response.json();
    res.json(serviceRequest[0]);
  } catch (error) {
    console.error('Error updating service request status:', error);
    res.status(500).json({ error: 'Failed to update service request status' });
  }
});

export default router;
