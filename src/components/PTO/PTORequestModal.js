import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
// import { supaFetch } from '../../utils/supaFetch'; // DISABLED - using mock data
import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const PTORequestModal = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useUser();
  const [categories, setCategories] = useState([]);
  const [balances, setBalances] = useState([]);
  const [formData, setFormData] = useState({
    category_code: '',
    start_date: '',
    end_date: '',
    hours_requested: '',
    reason: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.company_id) {
      loadPTOData();
      resetForm();
    }
  }, [isOpen, user?.company_id]);

  const loadPTOData = async () => {
    try {
      console.log('Loading real PTO request data...');

      // Load PTO categories from real database
      try {
        const categoriesRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/pto_categories?select=*&is_active=eq.true&order=name`, {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          }
        });

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      }

      // Load current balances from unified view (CONSOLIDATED APPROACH)
      try {
        const balancesRes = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/pto_current_balances_v?employee_id=eq.${user.id}&company_id=eq.${user.company_id}&select=*`, {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          }
        });

        if (balancesRes.ok) {
          const balancesData = await balancesRes.json();
          setBalances(balancesData);
        } else {
          setBalances([]);
        }
      } catch (error) {
        console.error('Error loading balances:', error);
        setBalances([]);
      }

    } catch (error) {
      console.error('Error loading PTO data:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      category_code: '',
      start_date: '',
      end_date: '',
      hours_requested: '',
      reason: '',
      notes: ''
    });
    setErrors({});
  };

  const getBalanceForCategory = (categoryCode) => {
    const balance = balances.find(b => b.category_code === categoryCode);
    return balance ? Number(balance.current_balance || 0) : 0;
  };

  const getSelectedCategory = () => {
    return categories.find(c => c.code === formData.category_code);
  };

  const calculateBusinessDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
    }
    
    return count;
  };

  const calculateHours = () => {
    if (formData.start_date && formData.end_date) {
      const businessDays = calculateBusinessDays(formData.start_date, formData.end_date);
      return businessDays * 8; // 8 hours per day
    }
    return 0;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.category_code) {
      newErrors.category_code = 'Please select a PTO category';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.start_date = 'Start date cannot be in the past';
      }
      
      if (endDate < startDate) {
        newErrors.end_date = 'End date must be after start date';
      }
      
      // Check advance notice requirements
      const selectedCategory = getSelectedCategory();
      if (selectedCategory?.advance_notice_days > 0) {
        const requiredNoticeDate = new Date();
        requiredNoticeDate.setDate(requiredNoticeDate.getDate() + selectedCategory.advance_notice_days);
        
        if (startDate < requiredNoticeDate) {
          newErrors.start_date = `This category requires ${selectedCategory.advance_notice_days} days advance notice`;
        }
      }
      
      // Check consecutive days limit
      if (selectedCategory?.max_consecutive_days) {
        const requestDays = calculateBusinessDays(formData.start_date, formData.end_date);
        if (requestDays > selectedCategory.max_consecutive_days) {
          newErrors.end_date = `Maximum ${selectedCategory.max_consecutive_days} consecutive days allowed`;
        }
      }
    }
    
    const requestedHours = Number(formData.hours_requested);
    if (!formData.hours_requested || requestedHours <= 0) {
      newErrors.hours_requested = 'Please select time off amount or enter custom hours';
    }
    
    // Check available balance
    if (formData.category_code) {
      const availableBalance = getBalanceForCategory(formData.category_code);
      if (requestedHours > availableBalance) {
        newErrors.hours_requested = `Insufficient balance. Available: ${availableBalance} hours`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const requestData = {
        ...formData,
        hours_requested: Number(formData.hours_requested),
        employee_id: user.id,
        company_id: user.company_id,
        status: 'PENDING'
      };
      
      await onSubmit(requestData);

      // Fire notification (manager/admin audience handled elsewhere)
      try {
        const { default: NotificationGenerator } = await import('../../services/NotificationGenerator');
        await NotificationGenerator.ptoSubmitted(user.company_id, { id: 'TEMP', ...requestData });
      } catch (e) { console.warn('ptoSubmitted notification failed', e); }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error submitting PTO request:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hours) => {
    const h = Number(hours || 0);
    if (h === 0) return '0 hrs';
    if (h < 8) return `${h.toFixed(1)} hrs`;
    const days = Math.floor(h / 8);
    const remainingHours = h % 8;
    if (remainingHours === 0) return `${days} day${days !== 1 ? 's' : ''}`;
    return `${days}d ${remainingHours.toFixed(1)}h`;
  };

  if (!isOpen) return null;

  const selectedCategory = getSelectedCategory();
  const availableBalance = formData.category_code ? getBalanceForCategory(formData.category_code) : 0;
  const calculatedHours = calculateHours();
  const requestedHours = Number(formData.hours_requested) || calculatedHours;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="w-6 h-6" />
            Request Time Off
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* PTO Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PTO Category *
            </label>
            <select
              value={formData.category_code}
              onChange={(e) => setFormData({ ...formData, category_code: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.category_code ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.code}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_code && (
              <p className="mt-1 text-sm text-red-600">{errors.category_code}</p>
            )}
            
            {selectedCategory && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <InformationCircleIcon className="w-4 h-4" />
                  <span>Available balance: {formatHours(availableBalance)}</span>
                </div>
                {selectedCategory.advance_notice_days > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    Requires {selectedCategory.advance_notice_days} days advance notice
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.start_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.end_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Hours Calculation */}
          {calculatedHours > 0 && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <ClockIcon className="w-4 h-4" />
                <span>
                  Calculated: {formatHours(calculatedHours)} 
                  ({calculateBusinessDays(formData.start_date, formData.end_date)} business days)
                </span>
              </div>
            </div>
          )}

          {/* Hours Requested - Market Research Optimized */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Off Amount
            </label>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hours_requested: '8' })}
                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                  formData.hours_requested === '8'
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Full Day
                <div className="text-xs text-gray-500">8 hrs</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, hours_requested: '4' })}
                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                  formData.hours_requested === '4'
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Half Day
                <div className="text-xs text-gray-500">4 hrs</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, hours_requested: '2' })}
                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                  formData.hours_requested === '2'
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Appointment
                <div className="text-xs text-gray-500">2 hrs</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, hours_requested: '' })}
                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                  !formData.hours_requested || (formData.hours_requested !== '8' && formData.hours_requested !== '4' && formData.hours_requested !== '2')
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Custom
                <div className="text-xs text-gray-500">Other</div>
              </button>
            </div>

            {/* Custom Hours Input */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0"
                max="40"
                value={formData.hours_requested}
                onChange={(e) => setFormData({ ...formData, hours_requested: e.target.value })}
                placeholder={calculatedHours.toString()}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.hours_requested ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <span className="text-sm text-gray-500">hours</span>
            </div>

            {errors.hours_requested && (
              <p className="mt-1 text-sm text-red-600">{errors.hours_requested}</p>
            )}

            <div className="mt-2 text-xs text-gray-500">
              💡 Tip: Use presets for common requests, or enter custom hours for appointments
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g., Family vacation, Medical appointment"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any additional information for your manager..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Balance Warning */}
          {requestedHours > availableBalance && availableBalance > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-sm text-red-800">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>
                  Insufficient balance. You're requesting {formatHours(requestedHours)} 
                  but only have {formatHours(availableBalance)} available.
                </span>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || requestedHours > availableBalance}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PTORequestModal;
