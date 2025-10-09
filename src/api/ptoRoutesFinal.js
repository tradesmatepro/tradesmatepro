// PTO API Routes - FINAL SCHEMA COMPLIANT
// Works with: pto_current_balances, pto_ledger, employee_time_off, pto_policies
import express from 'express';
import { supaFetch } from '../utils/supaFetch.js';
import PTOAccrualEngine from '../services/PTOAccrualEngine.js';

const router = express.Router();

// =====================================================
// GET /api/pto/policies → list company policies
// =====================================================
router.get('/policies', async (req, res) => {
  try {
    const { company_id } = req.user;
    
    const response = await supaFetch(
      `pto_policies?company_id=eq.${company_id}&is_active=eq.true&order=created_at.desc`,
      { method: 'GET' },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch policies');
    }
    
    const policies = await response.json();
    res.json(policies);
  } catch (error) {
    console.error('Error fetching PTO policies:', error);
    res.status(500).json({ error: 'Failed to fetch PTO policies' });
  }
});

// =====================================================
// POST /api/pto/policies → create/update a policy
// =====================================================
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
      is_active: true,
      created_at: new Date().toISOString()
    };
    
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
      throw new Error('Failed to create policy');
    }
    
    const policy = await response.json();
    res.json(policy[0]);
  } catch (error) {
    console.error('Error creating PTO policy:', error);
    res.status(500).json({ error: 'Failed to create PTO policy' });
  }
});

// =====================================================
// GET /api/pto/balances/:employee_id → return balances from pto_current_balances
// =====================================================
router.get('/balances/:employee_id', async (req, res) => {
  try {
    const { company_id, id: user_id, role } = req.user;
    const { employee_id } = req.params;
    
    // Employees can only see their own balances
    if (role === 'employee' && user_id !== employee_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const response = await supaFetch(
      `pto_current_balances?employee_id=eq.${employee_id}&company_id=eq.${company_id}`,
      { method: 'GET' },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch balances');
    }
    
    const balances = await response.json();
    
    // Transform to expected format
    const result = {
      employee_id,
      vacation_balance: 0,
      sick_balance: 0,
      personal_balance: 0
    };
    
    balances.forEach(balance => {
      switch (balance.category_code) {
        case 'VAC':
          result.vacation_balance = balance.current_balance;
          break;
        case 'SICK':
          result.sick_balance = balance.current_balance;
          break;
        case 'PERS':
          result.personal_balance = balance.current_balance;
          break;
      }
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching PTO balances:', error);
    res.status(500).json({ error: 'Failed to fetch PTO balances' });
  }
});

// =====================================================
// POST /api/pto/accrue → run accrual engine manually
// =====================================================
router.post('/accrue', async (req, res) => {
  try {
    const { company_id, role } = req.user;
    const { employee_id } = req.body;
    
    // Only admins can run accruals
    if (!['admin', 'owner'].includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    let result;
    if (employee_id) {
      result = await PTOAccrualEngine.processEmployeeAccrual(employee_id, company_id);
    } else {
      result = await PTOAccrualEngine.processAllAccruals(company_id);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error running PTO accrual:', error);
    res.status(500).json({ error: 'Failed to run PTO accrual' });
  }
});

// =====================================================
// POST /api/pto/request → employee submits PTO request
// =====================================================
router.post('/request', async (req, res) => {
  try {
    const { company_id, id: user_id } = req.user;
    const { accrual_type, starts_at, ends_at, hours_requested, note } = req.body;
    
    // Validate required fields
    if (!accrual_type || !starts_at || !ends_at || !hours_requested) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if employee has sufficient balance
    const categoryCode = accrual_type === 'vacation' ? 'VAC' : 
                        accrual_type === 'sick' ? 'SICK' : 'PERS';
    
    const balanceResponse = await supaFetch(
      `pto_current_balances?employee_id=eq.${user_id}&category_code=eq.${categoryCode}`,
      { method: 'GET' },
      company_id
    );
    
    if (balanceResponse.ok) {
      const balances = await balanceResponse.json();
      const currentBalance = balances[0]?.current_balance || 0;
      
      if (hours_requested > currentBalance) {
        return res.status(400).json({ 
          error: `Insufficient ${accrual_type} balance. Available: ${currentBalance} hours` 
        });
      }
    }
    
    const requestData = {
      company_id,
      employee_id: user_id,
      kind: accrual_type.charAt(0).toUpperCase() + accrual_type.slice(1),
      accrual_type,
      starts_at,
      ends_at,
      hours_requested: parseFloat(hours_requested),
      note,
      status: 'PENDING',
      created_by: user_id,
      created_at: new Date().toISOString()
    };
    
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
    res.json(request[0]);
  } catch (error) {
    console.error('Error creating PTO request:', error);
    res.status(500).json({ error: 'Failed to create PTO request' });
  }
});

// =====================================================
// POST /api/pto/approve/:id → approve request, deduct balances, update ledger
// =====================================================
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
    const categoryCode = request.accrual_type === 'vacation' ? 'VAC' : 
                        request.accrual_type === 'sick' ? 'SICK' : 'PERS';
    
    // Get current balance
    const balanceResponse = await supaFetch(
      `pto_current_balances?employee_id=eq.${request.employee_id}&category_code=eq.${categoryCode}`,
      { method: 'GET' },
      company_id
    );
    
    if (!balanceResponse.ok) {
      return res.status(400).json({ error: 'Employee balance not found' });
    }
    
    const balances = await balanceResponse.json();
    const currentBalance = balances[0];
    
    if (!currentBalance || currentBalance.current_balance < approvedHours) {
      return res.status(400).json({ error: 'Insufficient balance for approval' });
    }
    
    const newBalance = currentBalance.current_balance - approvedHours;
    
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
          approved_at: new Date().toISOString()
        })
      },
      company_id
    );
    
    if (!updateResponse.ok) {
      throw new Error('Failed to approve PTO request');
    }
    
    // Deduct from balance
    await supaFetch(
      `pto_current_balances?employee_id=eq.${request.employee_id}&category_code=eq.${categoryCode}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_balance: newBalance,
          last_transaction_date: new Date().toISOString(),
          usage_count: currentBalance.usage_count + 1,
          updated_at: new Date().toISOString()
        })
      },
      company_id
    );
    
    // Log to ledger
    await supaFetch(
      'pto_ledger',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: request.employee_id,
          policy_id: request.policy_id,
          entry_type: 'deduction',
          hours: -approvedHours,
          effective_date: request.starts_at.split('T')[0],
          notes: notes || 'PTO request approved',
          company_id,
          category_code: categoryCode,
          balance_after: newBalance,
          related_request_id: id,
          description: `Approved PTO: ${approvedHours} hours`,
          processed_by: user_id,
          processed_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        })
      },
      company_id
    );
    
    const updatedRequest = await updateResponse.json();
    res.json(updatedRequest[0]);
  } catch (error) {
    console.error('Error approving PTO request:', error);
    res.status(500).json({ error: 'Failed to approve PTO request' });
  }
});

// =====================================================
// POST /api/pto/deny/:id → deny request with reason
// =====================================================
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

// =====================================================
// GET /api/pto/history/:employee_id → return ledger entries for employee
// =====================================================
router.get('/history/:employee_id', async (req, res) => {
  try {
    const { company_id, id: user_id, role } = req.user;
    const { employee_id } = req.params;
    
    // Employees can only see their own history
    if (role === 'employee' && user_id !== employee_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const response = await supaFetch(
      `pto_ledger?employee_id=eq.${employee_id}&company_id=eq.${company_id}&order=created_at.desc`,
      { method: 'GET' },
      company_id
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch PTO history');
    }
    
    const history = await response.json();
    res.json(history);
  } catch (error) {
    console.error('Error fetching PTO history:', error);
    res.status(500).json({ error: 'Failed to fetch PTO history' });
  }
});

export default router;
