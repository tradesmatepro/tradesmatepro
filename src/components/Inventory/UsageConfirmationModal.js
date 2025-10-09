import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';

const UsageConfirmationModal = ({ workOrder, onClose, onSave }) => {
  const { user } = useUser();
  const [allocations, setAllocations] = useState([]);
  const [usageData, setUsageData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (workOrder && user?.company_id) {
      loadAllocations();
    }
  }, [workOrder, user?.company_id]);

  const loadAllocations = async () => {
    try {
      setLoading(true);
      
      // Load allocations for this work order
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/inventory_movements?related_work_order_id=eq.${workOrder.id}&movement_type=eq.ALLOCATION&select=*,inventory_items(name,sku,unit_of_measure,cost),inventory_locations(name)`, {
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const allocationsData = await response.json();
        setAllocations(allocationsData);
        
        // Initialize usage data with allocated quantities
        const initialUsage = {};
        allocationsData.forEach(allocation => {
          initialUsage[allocation.id] = {
            used: allocation.quantity,
            returned: 0
          };
        });
        setUsageData(initialUsage);
      }
    } catch (error) {
      console.error('Error loading allocations:', error);
      alert('Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  const handleUsageChange = (allocationId, field, value) => {
    setUsageData(prev => ({
      ...prev,
      [allocationId]: {
        ...prev[allocationId],
        [field]: Math.max(0, parseFloat(value) || 0)
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      for (const allocation of allocations) {
        const usage = usageData[allocation.id];
        const usedQuantity = usage?.used || 0;
        const returnedQuantity = usage?.returned || 0;
        
        if (usedQuantity > 0) {
          // Create usage movement
          const usageMovement = {
            item_id: allocation.item_id,
            location_id: allocation.location_id,
            related_work_order_id: workOrder.id,
            movement_type: 'USAGE',
            quantity: usedQuantity,
            unit_cost: allocation.unit_cost,
            notes: `Used on job: ${workOrder.title || workOrder.job_number}`
          };
          
          await inventoryService.createMovement(user.company_id, usageMovement, user.id);
        }
        
        if (returnedQuantity > 0) {
          // Create return movement (positive adjustment)
          const returnMovement = {
            item_id: allocation.item_id,
            location_id: allocation.location_id,
            related_work_order_id: workOrder.id,
            movement_type: 'ADJUSTMENT',
            quantity: returnedQuantity,
            unit_cost: allocation.unit_cost,
            notes: `Returned unused materials from job: ${workOrder.title || workOrder.job_number}`
          };
          
          await inventoryService.createMovement(user.company_id, returnMovement, user.id);
        }
        
        // Delete the original allocation
        await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/inventory_movements?id=eq.${allocation.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Error confirming usage:', error);
      alert('Failed to confirm usage');
    } finally {
      setSaving(false);
    }
  };

  if (!workOrder) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm Material Usage
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Job Info */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-gray-900">{workOrder.title}</div>
          {workOrder.job_number && (
            <div className="text-xs text-gray-500">Job #: {workOrder.job_number}</div>
          )}
        </div>

        {/* Allocations */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Allocated Materials</h4>
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading allocations...</div>
          ) : allocations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No materials allocated to this job</div>
          ) : (
            <div className="space-y-4">
              {allocations.map(allocation => {
                const usage = usageData[allocation.id] || { used: allocation.quantity, returned: 0 };
                const total = usage.used + usage.returned;
                const isValid = total <= allocation.quantity;
                
                return (
                  <div key={allocation.id} className={`p-4 border rounded-lg ${isValid ? 'border-gray-200' : 'border-red-300 bg-red-50'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {allocation.inventory_items?.name}
                        </div>
                        {allocation.inventory_items?.sku && (
                          <div className="text-xs text-gray-500">SKU: {allocation.inventory_items.sku}</div>
                        )}
                        <div className="text-xs text-gray-600">
                          From: {allocation.inventory_locations?.name} • 
                          Allocated: {allocation.quantity} {allocation.inventory_items?.unit_of_measure || 'each'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Used Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={allocation.quantity}
                          step="0.01"
                          value={usage.used}
                          onChange={(e) => handleUsageChange(allocation.id, 'used', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Returned to Stock
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={allocation.quantity}
                          step="0.01"
                          value={usage.returned}
                          onChange={(e) => handleUsageChange(allocation.id, 'returned', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    
                    {!isValid && (
                      <div className="mt-2 flex items-center text-red-600 text-xs">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        Total used + returned cannot exceed allocated quantity ({allocation.quantity})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || allocations.length === 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm Usage'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsageConfirmationModal;
