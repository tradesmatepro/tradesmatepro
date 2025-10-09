// Service Tags API Routes
import express from 'express';
import { supaFetch } from '../utils/supaFetch.js';

const router = express.Router();

// =====================================================
// SERVICE TAGS MANAGEMENT
// =====================================================

// GET /api/service-tags → Get all available service tags (public reference data)
router.get('/', async (req, res) => {
  try {
    const { company_id } = req.user;
    
    const response = await supaFetch(
      'service_tags?order=name.asc',
      { method: 'GET' },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch service tags');
    }
    
    const serviceTags = await response.json();
    res.json(serviceTags);
  } catch (error) {
    console.error('Error fetching service tags:', error);
    res.status(500).json({ error: 'Failed to fetch service tags' });
  }
});

// GET /api/service-tags/company → Get current company's assigned service tags
router.get('/company', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    
    // Only admins and owners can view company service tags
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const response = await supaFetch(
      `company_service_tags?company_id=eq.${company_id}&select=*,service_tags(id,name,description)&order=service_tags(name).asc`,
      { method: 'GET' },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch company service tags');
    }
    
    const companyServiceTags = await response.json();
    
    // Transform the response to flatten the service tag data
    const transformedTags = companyServiceTags.map(cst => ({
      id: cst.id,
      company_id: cst.company_id,
      service_tag_id: cst.service_tag_id,
      created_at: cst.created_at,
      service_tag: cst.service_tags
    }));
    
    res.json(transformedTags);
  } catch (error) {
    console.error('Error fetching company service tags:', error);
    res.status(500).json({ error: 'Failed to fetch company service tags' });
  }
});

// POST /api/service-tags/company → Add a service tag to the company
router.post('/company', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { service_tag_id } = req.body;
    
    // Only admins and owners can modify company service tags
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    if (!service_tag_id) {
      return res.status(400).json({ error: 'service_tag_id is required' });
    }
    
    // Verify the service tag exists
    const tagResponse = await supaFetch(
      `service_tags?id=eq.${service_tag_id}`,
      { method: 'GET' },
      company_id
    );
    
    if (!tagResponse.ok) {
      return res.status(400).json({ error: 'Invalid service tag' });
    }
    
    const tags = await tagResponse.json();
    if (tags.length === 0) {
      return res.status(400).json({ error: 'Service tag not found' });
    }
    
    // Add the service tag to the company
    const companyServiceTagData = {
      company_id,
      service_tag_id,
      created_at: new Date().toISOString()
    };
    
    const response = await supaFetch(
      'company_service_tags',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyServiceTagData)
      },
      company_id
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle unique constraint violation (duplicate tag)
      if (errorData.code === '23505') {
        return res.status(409).json({ error: 'Service tag already assigned to company' });
      }
      
      throw new Error('Failed to add service tag to company');
    }
    
    const companyServiceTag = await response.json();
    
    // Return the created record with service tag details
    const detailResponse = await supaFetch(
      `company_service_tags?id=eq.${companyServiceTag[0].id}&select=*,service_tags(id,name,description)`,
      { method: 'GET' },
      company_id
    );
    
    if (detailResponse.ok) {
      const detailData = await detailResponse.json();
      const transformedTag = {
        id: detailData[0].id,
        company_id: detailData[0].company_id,
        service_tag_id: detailData[0].service_tag_id,
        created_at: detailData[0].created_at,
        service_tag: detailData[0].service_tags
      };
      res.json(transformedTag);
    } else {
      res.json(companyServiceTag[0]);
    }
  } catch (error) {
    console.error('Error adding service tag to company:', error);
    res.status(500).json({ error: 'Failed to add service tag to company' });
  }
});

// DELETE /api/service-tags/company/:id → Remove a service tag from the company
router.delete('/company/:id', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { id } = req.params;
    
    // Only admins and owners can modify company service tags
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Verify the company service tag exists and belongs to this company
    const verifyResponse = await supaFetch(
      `company_service_tags?id=eq.${id}&company_id=eq.${company_id}`,
      { method: 'GET' },
      company_id
    );
    
    if (!verifyResponse.ok) {
      return res.status(404).json({ error: 'Company service tag not found' });
    }
    
    const existingTags = await verifyResponse.json();
    if (existingTags.length === 0) {
      return res.status(404).json({ error: 'Company service tag not found' });
    }
    
    // Delete the company service tag
    const response = await supaFetch(
      `company_service_tags?id=eq.${id}&company_id=eq.${company_id}`,
      { method: 'DELETE' },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to remove service tag from company');
    }
    
    res.json({ message: 'Service tag removed from company successfully' });
  } catch (error) {
    console.error('Error removing service tag from company:', error);
    res.status(500).json({ error: 'Failed to remove service tag from company' });
  }
});

// GET /api/service-tags/available → Get service tags not yet assigned to the company
router.get('/available', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    
    // Only admins and owners can view available service tags
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Get all service tags
    const allTagsResponse = await supaFetch(
      'service_tags?order=name.asc',
      { method: 'GET' },
      company_id
    );
    
    if (!allTagsResponse.ok) {
      throw new Error('Failed to fetch service tags');
    }
    
    const allTags = await allTagsResponse.json();
    
    // Get company's current service tags
    const companyTagsResponse = await supaFetch(
      `company_service_tags?company_id=eq.${company_id}&select=service_tag_id`,
      { method: 'GET' },
      company_id
    );
    
    if (!companyTagsResponse.ok) {
      throw new Error('Failed to fetch company service tags');
    }
    
    const companyTags = await companyTagsResponse.json();
    const assignedTagIds = new Set(companyTags.map(ct => ct.service_tag_id));
    
    // Filter out already assigned tags
    const availableTags = allTags.filter(tag => !assignedTagIds.has(tag.id));
    
    res.json(availableTags);
  } catch (error) {
    console.error('Error fetching available service tags:', error);
    res.status(500).json({ error: 'Failed to fetch available service tags' });
  }
});

export default router;
