// Subcontractor Portal API Routes
import express from 'express';
import { supaFetch } from '../utils/supaFetch.js';

const router = express.Router();

// =====================================================
// SUBCONTRACTOR MANAGEMENT
// =====================================================

// POST /api/subcontractors → create subcontractor
router.post('/', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    
    // Only admins can create subcontractors
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const subcontractorData = {
      ...req.body,
      company_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const response = await supaFetch(
      'subcontractors',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subcontractorData)
      },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to create subcontractor');
    }
    
    const subcontractor = await response.json();
    res.json(subcontractor[0]);
  } catch (error) {
    console.error('Error creating subcontractor:', error);
    res.status(500).json({ error: 'Failed to create subcontractor' });
  }
});

// GET /api/subcontractors → list subcontractors (filter by status, trade)
router.get('/', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { status, trade, search } = req.query;
    
    // Only admins can list all subcontractors
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    let query = `subcontractors?company_id=eq.${company_id}&order=created_at.desc`;
    
    if (status) {
      query += `&status=eq.${status}`;
    }
    if (trade) {
      query += `&trade=eq.${trade}`;
    }
    if (search) {
      query += `&or=(name.ilike.%${search}%,email.ilike.%${search}%)`;
    }
    
    const response = await supaFetch(query, { method: 'GET' }, company_id);
    
    if (!response.ok) {
      throw new Error('Failed to fetch subcontractors');
    }
    
    const subcontractors = await response.json();
    
    // Add expired flags for insurance and license
    const enrichedSubcontractors = subcontractors.map(sub => ({
      ...sub,
      insurance_expired: sub.insurance_expiration ? new Date(sub.insurance_expiration) < new Date() : false,
      license_expired: sub.license_expiration ? new Date(sub.license_expiration) < new Date() : false
    }));
    
    res.json(enrichedSubcontractors);
  } catch (error) {
    console.error('Error fetching subcontractors:', error);
    res.status(500).json({ error: 'Failed to fetch subcontractors' });
  }
});

// GET /api/subcontractors/:id → get details, docs, work orders
router.get('/:id', async (req, res) => {
  try {
    const { company_id, role, id: user_id } = req.user;
    const { id } = req.params;
    
    // Subcontractors can only see their own profile
    if (role === 'subcontractor' && user_id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get subcontractor details
    const subResponse = await supaFetch(
      `subcontractors?id=eq.${id}&company_id=eq.${company_id}`,
      { method: 'GET' },
      company_id
    );
    
    if (!subResponse.ok) {
      return res.status(404).json({ error: 'Subcontractor not found' });
    }
    
    const subcontractors = await subResponse.json();
    if (subcontractors.length === 0) {
      return res.status(404).json({ error: 'Subcontractor not found' });
    }
    
    const subcontractor = subcontractors[0];
    
    // Get documents
    const docsResponse = await supaFetch(
      `subcontractor_documents?subcontractor_id=eq.${id}&order=uploaded_at.desc`,
      { method: 'GET' },
      company_id
    );
    
    // Get work orders
    const workOrdersResponse = await supaFetch(
      `subcontractor_work_orders?subcontractor_id=eq.${id}&select=*,work_orders(id,title,status,start_time,customer_id,customers(name))&order=assigned_at.desc`,
      { method: 'GET' },
      company_id
    );
    
    const documents = docsResponse.ok ? await docsResponse.json() : [];
    const workOrders = workOrdersResponse.ok ? await workOrdersResponse.json() : [];
    
    // Add expired flags
    const enrichedDocuments = documents.map(doc => ({
      ...doc,
      expired: doc.expiration_date ? new Date(doc.expiration_date) < new Date() : false
    }));
    
    res.json({
      ...subcontractor,
      insurance_expired: subcontractor.insurance_expiration ? new Date(subcontractor.insurance_expiration) < new Date() : false,
      license_expired: subcontractor.license_expiration ? new Date(subcontractor.license_expiration) < new Date() : false,
      documents: enrichedDocuments,
      work_orders: workOrders
    });
  } catch (error) {
    console.error('Error fetching subcontractor details:', error);
    res.status(500).json({ error: 'Failed to fetch subcontractor details' });
  }
});

// PUT /api/subcontractors/:id → update
router.put('/:id', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { id } = req.params;
    
    // Only admins can update subcontractors
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    const response = await supaFetch(
      `subcontractors?id=eq.${id}&company_id=eq.${company_id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to update subcontractor');
    }
    
    const subcontractor = await response.json();
    res.json(subcontractor[0]);
  } catch (error) {
    console.error('Error updating subcontractor:', error);
    res.status(500).json({ error: 'Failed to update subcontractor' });
  }
});

// DELETE /api/subcontractors/:id → archive (set status = 'INACTIVE')
router.delete('/:id', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { id } = req.params;
    
    // Only admins can archive subcontractors
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const response = await supaFetch(
      `subcontractors?id=eq.${id}&company_id=eq.${company_id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'INACTIVE',
          updated_at: new Date().toISOString()
        })
      },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to archive subcontractor');
    }
    
    const subcontractor = await response.json();
    res.json(subcontractor[0]);
  } catch (error) {
    console.error('Error archiving subcontractor:', error);
    res.status(500).json({ error: 'Failed to archive subcontractor' });
  }
});

// =====================================================
// DOCUMENT MANAGEMENT
// =====================================================

// POST /api/subcontractors/:id/documents → upload document metadata
router.post('/:id/documents', async (req, res) => {
  try {
    const { company_id, role, id: user_id } = req.user;
    const { id } = req.params;
    
    // Subcontractors can upload their own docs, admins can upload for anyone
    if (role === 'subcontractor' && user_id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const documentData = {
      subcontractor_id: id,
      ...req.body,
      uploaded_at: new Date().toISOString()
    };
    
    const response = await supaFetch(
      'subcontractor_documents',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData)
      },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to upload document');
    }
    
    const document = await response.json();
    res.json(document[0]);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// GET /api/subcontractors/:id/documents → list documents
router.get('/:id/documents', async (req, res) => {
  try {
    const { company_id, role, id: user_id } = req.user;
    const { id } = req.params;
    
    // Subcontractors can only see their own docs
    if (role === 'subcontractor' && user_id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const response = await supaFetch(
      `subcontractor_documents?subcontractor_id=eq.${id}&order=uploaded_at.desc`,
      { method: 'GET' },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }
    
    const documents = await response.json();
    
    // Add expired flags
    const enrichedDocuments = documents.map(doc => ({
      ...doc,
      expired: doc.expiration_date ? new Date(doc.expiration_date) < new Date() : false
    }));
    
    res.json(enrichedDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// =====================================================
// WORK ORDER MANAGEMENT
// =====================================================

// POST /api/subcontractors/:id/work-orders → assign subcontractor to existing work order
router.post('/:id/work-orders', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { id } = req.params;
    const { work_order_id, notes } = req.body;

    // Only admins can assign work orders
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!work_order_id) {
      return res.status(400).json({ error: 'work_order_id is required' });
    }

    const assignmentData = {
      subcontractor_id: id,
      work_order_id,
      notes,
      assigned_at: new Date().toISOString(),
      status: 'ASSIGNED'
    };

    const response = await supaFetch(
      'subcontractor_work_orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      },
      company_id
    );

    if (!response.ok) {
      throw new Error('Failed to assign work order');
    }

    const assignment = await response.json();
    res.json(assignment[0]);
  } catch (error) {
    console.error('Error assigning work order:', error);
    res.status(500).json({ error: 'Failed to assign work order' });
  }
});

// GET /api/subcontractors/:id/work-orders → list assigned work orders
router.get('/:id/work-orders', async (req, res) => {
  try {
    const { company_id, role, id: user_id } = req.user;
    const { id } = req.params;

    // Subcontractors can only see their own work orders
    if (role === 'subcontractor' && user_id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const response = await supaFetch(
      `subcontractor_work_orders?subcontractor_id=eq.${id}&select=*,work_orders(id,title,description,status,scheduled_start,scheduled_end,customer_id,customers(name,phone,email))&order=assigned_at.desc`,
      { method: 'GET' },
      company_id
    );

    if (!response.ok) {
      throw new Error('Failed to fetch work orders');
    }

    const workOrders = await response.json();
    res.json(workOrders);
  } catch (error) {
    console.error('Error fetching work orders:', error);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

// =====================================================
// TIMESHEET MANAGEMENT
// =====================================================

// POST /api/subcontractors/:id/timesheets → log hours
router.post('/:id/timesheets', async (req, res) => {
  try {
    const { company_id, role, id: user_id } = req.user;
    const { id } = req.params;

    // Subcontractors can only log their own hours
    if (role === 'subcontractor' && user_id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const timesheetData = {
      subcontractor_id: id,
      ...req.body,
      created_at: new Date().toISOString()
    };

    const response = await supaFetch(
      'subcontractor_timesheets',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timesheetData)
      },
      company_id
    );

    if (!response.ok) {
      throw new Error('Failed to log timesheet');
    }

    const timesheet = await response.json();
    res.json(timesheet[0]);
  } catch (error) {
    console.error('Error logging timesheet:', error);
    res.status(500).json({ error: 'Failed to log timesheet' });
  }
});

// GET /api/subcontractors/:id/timesheets → list logged hours
router.get('/:id/timesheets', async (req, res) => {
  try {
    const { company_id, role, id: user_id } = req.user;
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    // Subcontractors can only see their own timesheets
    if (role === 'subcontractor' && user_id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let query = `subcontractor_timesheets?subcontractor_id=eq.${id}&select=*,work_orders(id,title)&order=work_date.desc`;

    if (start_date) {
      query += `&work_date=gte.${start_date}`;
    }
    if (end_date) {
      query += `&work_date=lte.${end_date}`;
    }

    const response = await supaFetch(query, { method: 'GET' }, company_id);

    if (!response.ok) {
      throw new Error('Failed to fetch timesheets');
    }

    const timesheets = await response.json();
    res.json(timesheets);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
});

export default router;
