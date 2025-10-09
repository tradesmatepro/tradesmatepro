// Advanced Approval Workflow Service for Purchase Orders
// Implements multi-level approval routing with mobile notifications

import { supaFetch } from '../utils/supaFetch';

export class ApprovalWorkflowService {
  // Default approval thresholds (configurable per company)
  static DEFAULT_THRESHOLDS = {
    auto_approve: 500,      // Under $500 auto-approved
    manager_approval: 5000, // $500-$5000 needs manager
    owner_approval: Infinity // Over $5000 needs owner
  };

  // Get approval requirements for a PO amount
  static getApprovalRequirements(amount, companySettings = {}) {
    const thresholds = { ...this.DEFAULT_THRESHOLDS, ...companySettings.approval_thresholds };
    
    if (amount < thresholds.auto_approve) {
      return { level: 'auto', approvers: [], message: 'Auto-approved' };
    } else if (amount < thresholds.manager_approval) {
      return { level: 'manager', approvers: ['manager'], message: 'Manager approval required' };
    } else {
      return { level: 'owner', approvers: ['manager', 'owner'], message: 'Owner approval required' };
    }
  }

  // Create approval workflow for a PO
  static async createApprovalWorkflow(poId, amount, companyId, createdBy) {
    try {
      const requirements = this.getApprovalRequirements(amount);
      
      if (requirements.level === 'auto') {
        // Auto-approve
        await this.autoApprovePO(poId);
        return { approved: true, workflow_id: null };
      }

      // Create workflow record
      const workflowData = {
        purchase_order_id: poId,
        company_id: companyId,
        created_by: createdBy,
        total_amount: amount,
        approval_level: requirements.level,
        status: 'pending',
        required_approvers: requirements.approvers,
        created_at: new Date().toISOString()
      };

      const response = await supaFetch('po_approval_workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      });

      if (!response.ok) throw new Error('Failed to create approval workflow');
      
      const workflow = await response.json();
      
      // Send notifications to required approvers
      await this.sendApprovalNotifications(workflow[0]);
      
      return { approved: false, workflow_id: workflow[0].id };
    } catch (error) {
      console.error('Error creating approval workflow:', error);
      throw error;
    }
  }

  // Auto-approve a PO
  static async autoApprovePO(poId) {
    await supaFetch(`purchase_orders?id=eq.${poId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'APPROVED',
        approved_at: new Date().toISOString(),
        approved_by: 'system'
      })
    });
  }

  // Send approval notifications (mobile push + email)
  static async sendApprovalNotifications(workflow) {
    try {
      // Get approvers for this company (using users table with admin role) - use status field
      const approversResponse = await supaFetch(
        `users?company_id=eq.${workflow.company_id}&role=in.(admin)&status=eq.ACTIVE`,
        { method: 'GET' }
      );

      if (!approversResponse.ok) return;

      const approvers = await approversResponse.json();
      
      for (const approver of approvers) {
        // Create notification record
        await supaFetch('notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: approver.id,
            company_id: workflow.company_id,
            type: 'po_approval_required',
            title: 'Purchase Order Approval Required',
            message: `PO #${workflow.purchase_order_id} for $${workflow.total_amount} needs your approval`,
            data: {
              workflow_id: workflow.id,
              po_id: workflow.purchase_order_id,
              amount: workflow.total_amount
            },
            created_at: new Date().toISOString()
          })
        });
      }
    } catch (error) {
      console.error('Error sending approval notifications:', error);
    }
  }

  // Approve a PO (called when approver clicks approve)
  static async approvePO(workflowId, approverId, comments = '') {
    try {
      // Record the approval
      await supaFetch('po_approval_actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_id: workflowId,
          approver_id: approverId,
          action: 'approved',
          comments,
          created_at: new Date().toISOString()
        })
      });

      // Check if all required approvals are complete
      const workflowResponse = await supaFetch(`po_approval_workflows?id=eq.${workflowId}`, { method: 'GET' });
      const workflow = (await workflowResponse.json())[0];

      const actionsResponse = await supaFetch(`po_approval_actions?workflow_id=eq.${workflowId}&action=eq.approved`, { method: 'GET' });
      const approvals = await actionsResponse.json();

      const requiredCount = workflow.required_approvers.length;
      const approvedCount = approvals.length;

      if (approvedCount >= requiredCount) {
        // All approvals complete - approve the PO
        await supaFetch(`purchase_orders?id=eq.${workflow.purchase_order_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'APPROVED',
            approved_at: new Date().toISOString(),
            approved_by: approverId
          })
        });

        // Update workflow status
        await supaFetch(`po_approval_workflows?id=eq.${workflowId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
        });

        return { status: 'completed', message: 'PO fully approved' };
      }

      return { status: 'pending', message: `${approvedCount}/${requiredCount} approvals complete` };
    } catch (error) {
      console.error('Error approving PO:', error);
      throw error;
    }
  }

  // Reject a PO
  static async rejectPO(workflowId, approverId, comments = '') {
    try {
      // Record the rejection
      await supaFetch('po_approval_actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_id: workflowId,
          approver_id: approverId,
          action: 'rejected',
          comments,
          created_at: new Date().toISOString()
        })
      });

      // Get workflow to update PO
      const workflowResponse = await supaFetch(`po_approval_workflows?id=eq.${workflowId}`, { method: 'GET' });
      const workflow = (await workflowResponse.json())[0];

      // Reject the PO
      await supaFetch(`purchase_orders?id=eq.${workflow.purchase_order_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          rejected_at: new Date().toISOString(),
          rejected_by: approverId
        })
      });

      // Update workflow status
      await supaFetch(`po_approval_workflows?id=eq.${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          completed_at: new Date().toISOString()
        })
      });

      return { status: 'rejected', message: 'PO rejected' };
    } catch (error) {
      console.error('Error rejecting PO:', error);
      throw error;
    }
  }

  // Get pending approvals for a user
  static async getPendingApprovals(userId, companyId) {
    try {
      const response = await supaFetch(
        `po_approval_workflows?company_id=eq.${companyId}&status=eq.pending&select=*,purchase_orders(po_number,vendor_name,total_amount)`,
        { method: 'GET' }
      );
      
      if (!response.ok) return [];
      
      const workflows = await response.json();
      
      // Filter to only workflows this user can approve
      const userResponse = await supaFetch(`users?id=eq.${userId}`, { method: 'GET' });
      const user = (await userResponse.json())[0];

      return workflows.filter(w =>
        w.required_approvers.includes(user?.role) ||
        user?.role === 'admin'
      );
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      return [];
    }
  }

  // Get approval history for a PO
  static async getApprovalHistory(poId) {
    try {
      const response = await supaFetch(
        `po_approval_workflows?purchase_order_id=eq.${poId}&select=*,po_approval_actions(*)`,
        { method: 'GET' }
      );
      
      if (!response.ok) return null;
      
      const workflows = await response.json();
      return workflows[0] || null;
    } catch (error) {
      console.error('Error getting approval history:', error);
      return null;
    }
  }
}

export default ApprovalWorkflowService;
