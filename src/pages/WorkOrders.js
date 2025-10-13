import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/Common/PageHeader';
import { WorkOrderBuilder } from '../components/WorkOrderBuilder';
import SmartSchedulingAssistant from '../components/SmartSchedulingAssistant';

import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import { supabase } from '../utils/supabaseClient';
import WorkOrderService from '../services/WorkOrderService';
import {
  WORK_ORDER_STATUS,
  WORK_ORDER_STATUS_LABELS,
  getStatusBadgeProps,
  getWorkOrderType,
  createDefaultWorkOrder,
  isStatusTransitionAllowed
} from '../utils/workOrderStatus';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// WorkOrder Stats Component
const WorkOrderStats = ({ workOrders }) => {
  // Focus on work order statuses (unified status field)
  const scheduledCount = workOrders.filter(wo => wo.status === 'SCHEDULED' || wo.status === 'ACCEPTED').length;
  const inProgressCount = workOrders.filter(wo => wo.status === 'IN_PROGRESS').length;
  const completedCount = workOrders.filter(wo => wo.status === 'COMPLETED').length;
  const cancelledCount = workOrders.filter(wo => wo.status === 'CANCELLED').length;
  const totalValue = workOrders.reduce((sum, wo) => sum + (parseFloat(wo.total_amount) || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <ClockIcon className="w-8 h-8 text-yellow-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{scheduledCount}</div>
            <div className="text-sm text-gray-500">Scheduled</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <PlayCircleIcon className="w-8 h-8 text-orange-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{inProgressCount}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <CheckCircleIcon className="w-8 h-8 text-green-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{completedCount}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <XCircleIcon className="w-8 h-8 text-red-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{cancelledCount}</div>
            <div className="text-sm text-gray-500">Cancelled</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <CurrencyDollarIcon className="w-8 h-8 text-purple-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkOrders = () => {
  const { user } = useUser();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Work Orders page focuses only on work orders (no view switching)
  
  const [workOrders, setWorkOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSmartAssistant, setShowSmartAssistant] = useState(false);
  const [selectedWorkOrderForScheduling, setSelectedWorkOrderForScheduling] = useState(null);
  const [formData, setFormData] = useState(null);
  const [workOrderCrew, setWorkOrderCrew] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
  };

  useEffect(() => {
    if (user?.company_id) {
      loadData();
    }
  }, [user?.company_id]);

  // Handle URL parameters for editing and scheduling
  useEffect(() => {
    const editWorkOrderId = searchParams.get('edit');
    const scheduleWorkOrderId = searchParams.get('schedule');

    if (editWorkOrderId && workOrders.length > 0 && !showEditForm) {
      const workOrderToEdit = workOrders.find(wo => wo.id === editWorkOrderId);
      if (workOrderToEdit) {
        handleEditWorkOrder(workOrderToEdit);
        // Clear the URL parameter
        setSearchParams({});
      }
    }

    if (scheduleWorkOrderId && workOrders.length > 0) {
      const workOrderToSchedule = workOrders.find(wo => wo.id === scheduleWorkOrderId);
      if (workOrderToSchedule) {
        // Load work order items before opening Smart Scheduling Assistant
        loadWorkOrderItems(workOrderToSchedule.id).then(items => {
          const workOrderWithItems = {
            ...workOrderToSchedule,
            work_order_items: items
          };
          console.log('📋 Work order with items for scheduling:', workOrderWithItems);
          setSelectedWorkOrderForScheduling(workOrderWithItems);
          setShowSmartAssistant(true);
          // Clear the URL parameter
          setSearchParams({});
        });
      }
    }
  }, [searchParams, workOrders, showEditForm]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadWorkOrders(),
        loadCustomers(),
        loadEmployees()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkOrders = async () => {
    try {
      // Load only work orders (scheduled jobs that became work orders)
      // Use unified status field
      const customerFields = 'name,phone,email,street_address,city,state,zip_code';
      // Prefer work_orders_v if available for stability
      let query = `work_orders_v?select=*,customers(${customerFields}),users(full_name)&order=created_at.desc`;
      let response = await supaFetch(query, { method: 'GET' }, user.company_id);
      if (!response.ok) {
        // ✅ FIXED: Show all job-stage work orders (approved through paid)
        // approved = unscheduled jobs, scheduled/in_progress/on_hold/needs_rescheduling = active jobs
        // completed/invoiced/paid = finished jobs
        query = `work_orders?select=*,customers(${customerFields}),users(full_name)&status=in.(approved,scheduled,in_progress,completed,invoiced,paid,on_hold,needs_rescheduling)&order=created_at.desc`;
        response = await supaFetch(query, { method: 'GET' }, user.company_id);
      }

      console.log('Loading work orders with query:', query);
      if (response.ok) {
        const data = await response.json();
        console.log(`Loaded ${data?.length || 0} work orders:`, data);
        setWorkOrders(data || []);
      } else {
        console.error('Failed to load work orders:', response.status);
      }
    } catch (error) {
      console.error('Error loading work orders:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      // Load complete customer data to support AddressCard component
      const response = await supaFetch('customers?select=*&order=name.asc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DEBUG: Work Orders page loaded customers:', data);
        setCustomers(data || []);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await supaFetch('users?select=id,full_name&active.eq.true&order=full_name.asc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data || []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleCreateWorkOrder = () => {
    // For work orders page, default to SCHEDULED status
    const newWorkOrder = createDefaultWorkOrder(user.company_id, user.id);
    newWorkOrder.status = WORK_ORDER_STATUS.SCHEDULED;
    
    setFormData(newWorkOrder);
    setShowCreateForm(true);
  };

  const handleEditWorkOrder = async (workOrder) => {
    // Load work order items and crew
    const [items, crew] = await Promise.all([
      loadWorkOrderItems(workOrder.id),
      loadWorkOrderCrew(workOrder.id)
    ]);

    setWorkOrderCrew(crew);
      // Use unified status field (no more stage-based normalization needed)
      const normalizedStatus = workOrder.status;

      // Debug logging (schema-aligned)
      console.log('🔧 EDIT WORK ORDER DEBUG:', {
        id: workOrder.id,
        status: workOrder.status,
        normalizedStatus,
        work_location: workOrder.work_location,
        location: workOrder.location,
        customer_address: workOrder.customers?.address,
        total_amount: workOrder.total_amount,
        scheduled_start: workOrder.scheduled_start,
        scheduled_end: workOrder.scheduled_end,
        items_count: items?.length
      });

    setFormData({
      ...workOrder,
      // Normalize status for the unified form
      status: normalizedStatus,
      // Preserve labor_summary if present on the row
      labor_summary: workOrder.labor_summary || null,
      // Ensure work_location is mapped from various possible fields, constructing from detailed address if available
      work_location: (() => {
        // If work_location already exists, use it
        if (workOrder.work_location || workOrder.location) {
          return workOrder.work_location || workOrder.location;
        }

        // Otherwise, construct from customer's detailed address fields
        if (workOrder.customers) {
          const customer = workOrder.customers;
          const addressParts = [];

          if (customer.street_address) addressParts.push(customer.street_address);

          const cityStateZip = [];
          if (customer.city) cityStateZip.push(customer.city);
          if (customer.state) cityStateZip.push(customer.state);
          if (customer.zip_code) cityStateZip.push(customer.zip_code);

          if (cityStateZip.length > 0) {
            addressParts.push(cityStateZip.join(', '));
          }

          const constructedAddress = addressParts.join(', ');
          if (constructedAddress) return constructedAddress;

          // Fallback to single address field
          if (customer.address) return customer.address;
        }

        return '';
      })(),
      // Fix total calculation display - ensure we have a valid number
      total_amount: Number(workOrder.total_amount) || (Number(workOrder.subtotal || 0) + Number(workOrder.tax_amount || 0)),
      // Do NOT auto-add a default item; keep empty until user adds intentionally
      work_order_items: items && items.length > 0 ? items : []
    });
    setShowEditForm(true);
  };


  const loadWorkOrderItems = async (workOrderId) => {
    try {
      const response = await supaFetch(`work_order_items?work_order_id=eq.${workOrderId}&order=created_at.asc`, { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        return data || [];
      }
    } catch (error) {
      console.error('Error loading work order items:', error);
    }
    return [];
  };

  const loadWorkOrderCrew = async (workOrderId) => {
    try {
      const { data: crewRows, error } = await supabase
        .from('work_order_labor')
        .select('employee_id, hours, rate, work_date, users:employee_id(full_name)')
        .eq('work_order_id', workOrderId)
        .eq('company_id', user.company_id);

      if (error) {
        console.error('Error loading work order crew:', error);
        return [];
      }

      return crewRows || [];
    } catch (error) {
      console.error('Error loading work order crew:', error);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build clean object with only updatable fields (NO STATUS FIELDS)
      const workOrderData = {
        title: formData.title,
        description: formData.description,
        customer_id: formData.customer_id,
        work_location: formData.work_location,
        priority: formData.priority,
        assigned_technician_id: formData.assigned_technician_id,
        scheduled_start: formData.scheduled_start,
        scheduled_end: formData.scheduled_end,
        estimated_duration: formData.estimated_duration,
        notes: formData.notes,
        tax_rate: formData.tax_rate
      };

      // DO NOT include status fields in form submission - they are handled by RPC

      // Add labor_summary if present and valid
      if (formData.labor_summary && typeof formData.labor_summary === 'object') {
        workOrderData.labor_summary = formData.labor_summary;
      }

      // Remove any undefined values
      Object.keys(workOrderData).forEach(key => {
        if (workOrderData[key] === undefined) {
          delete workOrderData[key];
        }
      });

      console.log('📝 SUBMITTING CLEAN DATA:', workOrderData);

      // Use centralized service to save work order + items and compute totals
      const workOrderId = showEditForm ? formData.id : undefined;
      const wo = { ...(workOrderId ? { id: workOrderId } : {}), ...workOrderData };
      const items = (formData.work_order_items || []).filter(i => (i.item_name || '').trim());
      await WorkOrderService.saveWorkOrder({ workOrder: wo, items, labor: [] }, user.company_id);

      // Refresh data and close form
      await loadWorkOrders();
      setShowCreateForm(false);
      setShowEditForm(false);
      setFormData(null);
    } catch (error) {
      console.error('Error saving work order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus, reasonText = null) => {
    if (!formData) return;

    console.log('🔄 STATUS CHANGE DEBUG:', {
      currentStatus: formData.status,
      newStatus,
      workOrderId: formData.id,
      customerId: formData.customer_id,
      reason: reasonText
    });

    try {
      console.log('🔄 CALLING RPC wo_change_status...');

      // Use RPC function for status changes
      const { data, error } = await supabase.rpc('wo_change_status', {
        p_id: formData.id,
        p_to: newStatus,
        p_reason: reasonText || null
      });

      if (error) {
        console.error('🔄 RPC ERROR DETAILS:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: error
        });
        const errorMsg = error.message || error.details || error.hint || 'Unknown error';
        showAlert('error', `Failed to change status: ${errorMsg}`);
        return;
      }

      if (data.error) {
        console.error('🔄 RPC RETURNED ERROR:', data.error);
        showAlert('error', `Failed to change status: ${data.error}`);
        return;
      }

      console.log('🔄 RPC SUCCESS:', data);

      // Handle status transitions - clear scheduling state when moving to earlier stages
      if (['QUOTE', 'SENT', 'ACCEPTED', 'REJECTED'].includes(newStatus)) {
        console.log('🔄 STATUS CHANGE: Clearing scheduling state for quote stage');

        // Clear scheduling-related fields for quote stages
        const clearedFormData = {
          ...formData,
          status: newStatus,
          scheduled_start: null,
          scheduled_end: null,
          assigned_technician_id: null,
          estimated_duration: null,
        };

        // Also clear crew state
        setWorkOrderCrew([]);

        setFormData(clearedFormData);

        // Close the edit form and refresh to show updated state
        setShowEditForm(false);
        setFormData(null);
        await loadWorkOrders();
        showAlert('success', `Work order status updated to ${newStatus}`);
        return;
      }

      // Update local state with server data for normal status changes
      if (data.data) {
        setFormData({ ...formData, ...data.data, status: newStatus });
      } else {
        setFormData({ ...formData, status: newStatus });
      }

      // Auto-create invoice when marked as COMPLETED
      if (newStatus === 'COMPLETED') {
        try {
          console.log('🧾 CREATING INVOICE...');
          const { InvoicesService } = await import('../services/InvoicesService');

          const invoiceId = await InvoicesService.ensureInvoiceForCompletion({
            companyId: user.company_id,
            jobId: formData.job_id || null,
            workOrderId: formData.id,
            customerId: formData.customer_id,
            issuedAt: new Date().toISOString()
          });

          console.log('🧾 INVOICE CREATED:', invoiceId);

          await InvoicesService.copyWorkOrderItemsToInvoice(invoiceId, {
            workOrderId: formData.id,
            jobId: formData.job_id
          }, user.company_id);

          console.log('🧾 ITEMS COPIED');

          // Close the edit form
          setShowEditForm(false);
          setFormData(null);

          // Navigate to invoice detail
          navigate(`/invoices?view=${invoiceId}`);
          showAlert('success', 'Job completed and invoice created!');

        } catch (invoiceError) {
          console.error('Error creating invoice:', invoiceError);
          showAlert('warning', 'Job marked complete but invoice creation failed');
        }
      } else {
        await loadWorkOrders();
        showAlert('success', 'Status updated');
      }

    } catch (error) {
      console.error('🔄 CATCH ERROR DETAILS:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: error
      });
      const errorMsg = error.message || error.details || error.hint || error.toString();
      showAlert('error', `Failed to change status: ${errorMsg}`);
    }
  };

  const handleDeleteWorkOrder = async (workOrder) => {
    if (!window.confirm(`Are you sure you want to delete "${workOrder.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await supaFetch(`work_orders?id=eq.${workOrder.id}`, {
        method: 'DELETE'
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Work order deleted successfully');
        loadWorkOrders(); // Refresh the list
      } else {
        throw new Error('Failed to delete work order');
      }
    } catch (error) {
      console.error('Error deleting work order:', error);
      showAlert('error', 'Failed to delete work order');
    }
  };

  const filteredWorkOrders = workOrders.filter(workOrder => {
    // Enhanced search: title, customer name, work order ID
    const customerName = workOrder.customers?.name || '';
    const workOrderTitle = workOrder.title || '';
    const workOrderId = workOrder.id?.toString() || '';

    const matchesSearch = !searchTerm ||
      workOrderTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrderId.includes(searchTerm.toLowerCase());

    // For work orders, use unified status field
    const currentStatus = workOrder.status || 'SCHEDULED';
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPageTitle = () => {
    return 'Work Orders';
  };

  const getPageSubtitle = () => {
    return 'Scheduled and active work orders - track progress from assignment to completion';
  };

  const getCreateButtonText = () => {
    return 'Create Work Order';
  };

  return (
    <div>
      <PageHeader
        title={getPageTitle()}
        subtitle={getPageSubtitle()}
      >
        <button
          onClick={handleCreateWorkOrder}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          {getCreateButtonText()}
        </button>
      </PageHeader>

      {/* Alert */}
      {alert.show && (
        <div className={`mb-6 p-4 rounded-md ${
          alert.type === 'success' ? 'bg-green-100 text-green-700' :
          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {alert.message}
        </div>
      )}

      {/* Work Order Stats */}
      <WorkOrderStats workOrders={workOrders} />



      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title, customer name, or work order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
            />
          </div>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Work Orders</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredWorkOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-500 mb-2">No work orders found</div>
                    <div className="text-sm text-gray-400">Work orders appear here when jobs are scheduled</div>
                  </td>
                </tr>
              ) : (
                filteredWorkOrders.map(workOrder => {
                  // For work orders, use unified status field
                  const currentStatus = workOrder.status || 'SCHEDULED';
                  const statusBadge = getStatusBadgeProps(currentStatus);

                  return (
                    <tr key={workOrder.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {workOrder.title || `Work Order #${workOrder.id}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {workOrder.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {workOrder.customers?.name || 'No customer'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={statusBadge.className}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(workOrder.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(workOrder.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditWorkOrder(workOrder)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
                          {currentStatus === 'COMPLETED' && (
                            <button
                              onClick={async () => {
                                if (creatingInvoice) return; // Prevent double-clicking

                                setCreatingInvoice(true);

                                // Clear previous logs and start fresh
                                sessionStorage.removeItem('invoiceCreationLogs');
                                const logs = [];
                                const addLog = (message, data = null) => {
                                  const logEntry = { timestamp: new Date().toISOString(), message, data };
                                  logs.push(logEntry);
                                  console.log(`%c${message}`, 'color: #2563eb; font-weight: bold;', data);
                                  sessionStorage.setItem('invoiceCreationLogs', JSON.stringify(logs));
                                  // Also store in window for debugging
                                  window.invoiceDebugLogs = logs;
                                };

                                try {
                                  addLog('🧾 STARTING INVOICE CREATION FOR WORK ORDER:', workOrder.id);
                                  const { InvoicesService } = await import('../services/InvoicesService');
                                  const invoiceId = await InvoicesService.createFromWorkOrder(user.company_id, workOrder.id);

                                  addLog('🧾 INVOICE CREATION RESULT:', invoiceId);

                                  if (!invoiceId) {
                                    addLog('🧾 NO INVOICE ID RETURNED');
                                    showAlert('error', 'Could not create invoice');
                                    return;
                                  }

                                  addLog('🧾 INVOICE CREATED SUCCESSFULLY, NAVIGATING TO:', `/invoices?view=${invoiceId}`);
                                  showAlert('success', 'Invoice created successfully');

                                  // Use React Router navigation to avoid page refresh
                                  navigate(`/invoices?view=${invoiceId}`);

                                } catch (error) {
                                  addLog('🧾 INVOICE CREATION ERROR:', {
                                    message: error.message,
                                    stack: error.stack,
                                    fullError: error
                                  });
                                  showAlert('error', `Failed to create invoice: ${error.message || error}`);
                                } finally {
                                  setCreatingInvoice(false);
                                }
                              }}
                              disabled={creatingInvoice}
                              className={`${creatingInvoice ? 'text-gray-400' : 'text-purple-600 hover:text-purple-900'}`}
                            >
                              {creatingInvoice ? 'Creating...' : 'Create Invoice'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteWorkOrder(workOrder)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <WorkOrderBuilder
          isEdit={false}
          formData={formData}
          setFormData={setFormData}
          customers={customers}
          employees={employees}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowCreateForm(false);
            setFormData(null);
          }}
          onStatusChange={handleStatusChange}
          loading={loading}
        />
      )}

      {/* Edit Form */}
      {showEditForm && (
        <WorkOrderBuilder
          isEdit={true}
          formData={formData}
          setFormData={setFormData}
          customers={customers}
          employees={employees}
          crew={workOrderCrew}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowEditForm(false);
            setFormData(null);
            setWorkOrderCrew([]);
          }}
          onStatusChange={handleStatusChange}
          loading={loading}
        />
      )}

      {/* Smart Scheduling Assistant */}
      {showSmartAssistant && selectedWorkOrderForScheduling && (
        <SmartSchedulingAssistant
          jobData={selectedWorkOrderForScheduling}
          onClose={() => {
            setShowSmartAssistant(false);
            setSelectedWorkOrderForScheduling(null);
          }}
          onEventCreated={(event) => {
            console.log('Work order scheduled:', event);
            // Refresh work orders to show updated status
            loadWorkOrders();
            setShowSmartAssistant(false);
            setSelectedWorkOrderForScheduling(null);
          }}
        />
      )}
    </div>
  );
};

export default WorkOrders;
