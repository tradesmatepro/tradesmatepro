import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';

const ItemAllocationModal = ({ item, location, availableQuantity, onClose, onSave }) => {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    jobId: '',
    quantity: 1,
    notes: ''
  });

  useEffect(() => {
    if (user?.company_id) {
      loadJobs();
    }
  }, [user?.company_id]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // Load active jobs from work_orders where stage = 'JOB'
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_orders?company_id=eq.${user.company_id}&status=in.(SCHEDULED,IN_PROGRESS,COMPLETED)&select=id,title,job_number,customer_name,status&order=created_at.desc`, {
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const jobsData = await response.json();
        setJobs(jobsData);
      } else {
        console.error('Failed to load jobs:', response.status);
        setJobs([]);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.jobId) {
      alert('Please select a job');
      return;
    }

    if (formData.quantity <= 0 || formData.quantity > availableQuantity) {
      alert(`Quantity must be between 1 and ${availableQuantity}`);
      return;
    }

    try {
      setSaving(true);
      
      // Create allocation movement
      const movementData = {
        item_id: item.id,
        location_id: location.location_id,
        related_work_order_id: formData.jobId,
        movement_type: 'ALLOCATION',
        quantity: parseFloat(formData.quantity),
        unit_cost: item.cost || 0,
        notes: formData.notes.trim() || `Allocated to job from ${location.name}`
      };

      await inventoryService.createMovement(user.company_id, movementData, user.id);
      
      onSave();
    } catch (error) {
      console.error('Error allocating item to job:', error);
      alert('Failed to allocate item to job');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!item || !location) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Allocate to Job
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Item Info */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-900">{item.name}</div>
          {item.sku && (
            <div className="text-xs text-gray-500">SKU: {item.sku}</div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            From: {location.name} • Available: {availableQuantity} {item.unit_of_measure || 'each'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Job *
            </label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading jobs...</div>
            ) : (
              <select
                name="jobId"
                value={formData.jobId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a job...</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title || job.job_number || 'Untitled Job'} ({job.job_status})
                  </option>
                ))}
              </select>
            )}
            {!loading && jobs.length === 0 && (
              <div className="text-sm text-gray-500 mt-1">No active jobs found</div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max={availableQuantity}
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="text-xs text-gray-500 mt-1">
              Max: {availableQuantity} {item.unit_of_measure || 'each'}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Optional notes about this allocation..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.jobId || formData.quantity <= 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {saving ? 'Allocating...' : 'Allocate to Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemAllocationModal;
