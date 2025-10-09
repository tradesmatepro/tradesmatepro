// PTO API Routes - Production-ready PTO system endpoints
import express from 'express';
import { supaFetch } from '../utils/supaFetch.js';
import { validateCompanyAccess, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and company isolation to all routes
router.use(requireAuth);
router.use(validateCompanyAccess);

// =====================================================
// PTO POLICIES ENDPOINTS
// =====================================================

// GET /api/pto/policies - List all company policies
router.get('/policies', async (req, res) => {
  try {
    const { company_id } = req.user;
    
    const response = await supaFetch(
      `pto_policies?company_id=eq.${company_id}&order=created_at.desc`,
      { method: 'GET' },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch PTO policies');
    }
    
    const policies = await response.json();
    res.json(policies);
  } catch (error) {
    console.error('Error fetching PTO policies:', error);
    res.status(500).json({ error: 'Failed to fetch PTO policies' });
  }
});

// POST /api/pto/policies - Create or update policy
router.post('/policies', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    
    // Only admins can manage policies
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const policyData = {
      ...req.body,
      company_id,
      created_at: new Date().toISOString()
    };
    
    // Validate required fields
    if (!policyData.name) {
      return res.status(400).json({ error: 'Policy name is required' });
    }
    
    const response = await supaFetch(
      'pto_policies',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyData)
      },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to create PTO policy');
    }
    
    const policy = await response.json();
    res.status(201).json(policy[0]);
  } catch (error) {
    console.error('Error creating PTO policy:', error);
    res.status(500).json({ error: 'Failed to create PTO policy' });
  }
});

// PUT /api/pto/policies/:id - Update policy
router.put('/policies/:id', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { id } = req.params;
    
    // Only admins can manage policies
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    const response = await supaFetch(
      `pto_policies?id=eq.${id}&company_id=eq.${company_id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to update PTO policy');
    }
    
    const policy = await response.json();
    res.json(policy[0]);
  } catch (error) {
    console.error('Error updating PTO policy:', error);
    res.status(500).json({ error: 'Failed to update PTO policy' });
  }
});

// =====================================================
// PTO BALANCES ENDPOINTS
// =====================================================

// GET /api/pto/balances/:employee_id - Get current balances
router.get('/balances/:employee_id', async (req, res) => {
  try {
    const { company_id, id: user_id, role } = req.user;
    const { employee_id } = req.params;
    
    // Employees can only view their own balances
    if (!['admin', 'owner'].includes(role) && user_id !== employee_id) {
      return res.status(403).json({ error: 'Can only view your own PTO balances' });
    }
    
    const response = await supaFetch(
      `pto_employee_summary?employee_id=eq.${employee_id}&company_id=eq.${company_id}`,
      { method: 'GET' },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch PTO balances');
    }
    
    const balances = await response.json();
    res.json(balances[0] || null);
  } catch (error) {
    console.error('Error fetching PTO balances:', error);
    res.status(500).json({ error: 'Failed to fetch PTO balances' });
  }
});

// GET /api/pto/balances - Get all employee balances (admin only)
router.get('/balances', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    
    // Only admins can view all balances
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const response = await supaFetch(
      `pto_employee_summary?company_id=eq.${company_id}&order=employee_name.asc`,
      { method: 'GET' },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch PTO balances');
    }
    
    const balances = await response.json();
    res.json(balances);
  } catch (error) {
    console.error('Error fetching PTO balances:', error);
    res.status(500).json({ error: 'Failed to fetch PTO balances' });
  }
});

// =====================================================
// PTO ACCRUAL ENDPOINTS
// =====================================================

// POST /api/pto/accrue - Run accrual process
router.post('/accrue', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { employee_id } = req.body;
    
    // Only admins can run accruals
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Call the stored procedure
    const response = await supaFetch(
      'rpc/process_pto_accrual',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_employee_id: employee_id || null,
          target_company_id: company_id
        })
      },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to process PTO accrual');
    }
    
    const results = await response.json();
    res.json({
      success: true,
      processed_employees: results.length,
      results
    });
  } catch (error) {
    console.error('Error processing PTO accrual:', error);
    res.status(500).json({ error: 'Failed to process PTO accrual' });
  }
});

// =====================================================
// PTO REQUEST ENDPOINTS
// =====================================================

// POST /api/pto/request - Create PTO request
router.post('/request', async (req, res) => {
  try {
    const { company_id, id: user_id } = req.user;
    
    const requestData = {
      company_id,
      employee_id: req.body.employee_id || user_id,
      kind: req.body.accrual_type || 'vacation',
      accrual_type: req.body.accrual_type || 'vacation',
      starts_at: req.body.start_date,
      ends_at: req.body.end_date,
      hours_requested: req.body.hours_requested,
      note: req.body.reason || req.body.note,
      status: 'PENDING',
      created_by: user_id,
      created_at: new Date().toISOString()
    };
    
    // Validate required fields
    if (!requestData.starts_at || !requestData.ends_at || !requestData.hours_requested) {
      return res.status(400).json({ error: 'Start date, end date, and hours are required' });
    }
    
    // Check if employee has sufficient balance
    const balanceResponse = await supaFetch(
      `pto_balances?employee_id=eq.${requestData.employee_id}`,
      { method: 'GET' },
      company_id
    );
    
    if (balanceResponse.ok) {
      const balances = await balanceResponse.json();
      if (balances.length > 0) {
        const balance = balances[0];
        const availableHours = requestData.accrual_type === 'vacation' 
          ? balance.vacation_balance 
          : balance.sick_balance;
          
        if (requestData.hours_requested > availableHours) {
          return res.status(400).json({ 
            error: `Insufficient ${requestData.accrual_type} balance. Available: ${availableHours} hours` 
          });
        }
      }
    }
    
    const response = await supaFetch(
      'employee_time_off',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to create PTO request');
    }
    
    const request = await response.json();
    res.status(201).json(request[0]);
  } catch (error) {
    console.error('Error creating PTO request:', error);
    res.status(500).json({ error: 'Failed to create PTO request' });
  }
});

// GET /api/pto/requests - Get PTO requests
router.get('/requests', async (req, res) => {
  try {
    const { company_id, id: user_id, role } = req.user;
    const { employee_id, status, start_date, end_date } = req.query;
    
    let query = `pto_requests_detailed?company_id=eq.${company_id}`;
    
    // Employees can only see their own requests
    if (!['admin', 'owner'].includes(role)) {
      query += `&employee_id=eq.${user_id}`;
    } else if (employee_id) {
      query += `&employee_id=eq.${employee_id}`;
    }
    
    // Add filters
    if (status) query += `&status=eq.${status}`;
    if (start_date) query += `&starts_at=gte.${start_date}`;
    if (end_date) query += `&ends_at=lte.${end_date}`;
    
    query += '&order=created_at.desc';
    
    const response = await supaFetch(query, { method: 'GET' }, company_id);
    
    if (!response.ok) {
      throw new Error('Failed to fetch PTO requests');
    }
    
    const requests = await response.json();
    res.json(requests);
  } catch (error) {
    console.error('Error fetching PTO requests:', error);
    res.status(500).json({ error: 'Failed to fetch PTO requests' });
  }
});

// POST /api/pto/approve/:id - Approve PTO request
router.post('/approve/:id', async (req, res) => {
  try {
    const { company_id, id: user_id, role } = req.user;
    const { id } = req.params;
    const { hours_approved, notes } = req.body;

    // Only admins can approve requests
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get the request details
    const requestResponse = await supaFetch(
      `employee_time_off?id=eq.${id}&company_id=eq.${company_id}`,
      { method: 'GET' },
      company_id
    );

    if (!requestResponse.ok) {
      return res.status(404).json({ error: 'PTO request not found' });
    }

    const requests = await requestResponse.json();
    if (requests.length === 0) {
      return res.status(404).json({ error: 'PTO request not found' });
    }

    const request = requests[0];
    const approvedHours = hours_approved || request.hours_requested;

    // Update the request
    const updateResponse = await supaFetch(
      `employee_time_off?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          hours_approved: approvedHours,
          approved_by: user_id,
          approved_at: new Date().toISOString(),
          note: notes || request.note
        })
      },
      company_id
    );

    if (!updateResponse.ok) {
      throw new Error('Failed to approve PTO request');
    }

    // Deduct from employee balance
    const balanceResponse = await supaFetch(
      `pto_balances?employee_id=eq.${request.employee_id}`,
      { method: 'GET' },
      company_id
    );

    if (balanceResponse.ok) {
      const balances = await balanceResponse.json();
      if (balances.length > 0) {
        const balance = balances[0];
        const field = request.accrual_type === 'vacation' ? 'vacation_balance' : 'sick_balance';
        const currentBalance = balance[field];
        const newBalance = Math.max(0, currentBalance - approvedHours);

        await supaFetch(
          `pto_balances?employee_id=eq.${request.employee_id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              [field]: newBalance,
              updated_at: new Date().toISOString()
            })
          },
          company_id
        );
      }
    }

    const updatedRequest = await updateResponse.json();
    res.json(updatedRequest[0]);
  } catch (error) {
    console.error('Error approving PTO request:', error);
    res.status(500).json({ error: 'Failed to approve PTO request' });
  }
});

// POST /api/pto/deny/:id - Deny PTO request
router.post('/deny/:id', async (req, res) => {
  try {
    const { company_id, id: user_id, role } = req.user;
    const { id } = req.params;
    const { reason } = req.body;

    // Only admins can deny requests
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Denial reason is required' });
    }

    const response = await supaFetch(
      `employee_time_off?id=eq.${id}&company_id=eq.${company_id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DENIED',
          approved_by: user_id,
          denied_at: new Date().toISOString(),
          denial_reason: reason
        })
      },
      company_id
    );

    if (!response.ok) {
      throw new Error('Failed to deny PTO request');
    }

    const request = await response.json();
    res.json(request[0]);
  } catch (error) {
    console.error('Error denying PTO request:', error);
    res.status(500).json({ error: 'Failed to deny PTO request' });
  }
});

// PUT /api/pto/balances/:employee_id - Override employee balance (admin only)
router.put('/balances/:employee_id', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { employee_id } = req.params;
    const { vacation_balance, sick_balance, reason } = req.body;

    // Only admins can override balances
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (vacation_balance !== undefined) updateData.vacation_balance = vacation_balance;
    if (sick_balance !== undefined) updateData.sick_balance = sick_balance;

    const response = await supaFetch(
      `pto_balances?employee_id=eq.${employee_id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      },
      company_id
    );

    if (!response.ok) {
      throw new Error('Failed to update PTO balance');
    }

    const balance = await response.json();
    res.json(balance[0]);
  } catch (error) {
    console.error('Error updating PTO balance:', error);
    res.status(500).json({ error: 'Failed to update PTO balance' });
  }
});

export default router;
