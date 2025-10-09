import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import {
  PlusIcon,
  TrashIcon,
  StarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  TagIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// CPQ (Configure-Price-Quote) Builder - Advanced quote configuration
const CPQBuilder = ({ formData, setFormData, onClose }) => {
  const { user } = useUser();
  const [bundles, setBundles] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBundles();
    loadOptions();
  }, []);

  const loadBundles = async () => {
    try {
      const res = await supaFetch('quote_bundles?select=*,bundle_items(*)&order=tier.asc', { method: 'GET' }, user?.company_id);
      if (res.ok) {
        const data = await res.json();
        setBundles(data);
      }
    } catch (error) {
      console.error('Error loading bundles:', error);
    }
  };

  const loadOptions = async () => {
    try {
      const res = await supaFetch('quote_options?select=*&order=category.asc,name.asc', { method: 'GET' }, user?.company_id);
      if (res.ok) {
        const data = await res.json();
        setOptions(data);
      }
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const handleBundleSelect = (bundle) => {
    setSelectedBundle(bundle);
    
    // Add bundle items to quote
    const bundleItems = bundle.bundle_items.map(item => ({
      item_name: item.item_name,
      description: item.description || '',
      item_type: item.item_type || 'service',
      quantity: item.quantity || 1,
      rate: item.rate || 0,
      photo_url: '',
      bundle_id: bundle.id,
      bundle_tier: bundle.tier
    }));

    setFormData(prev => ({
      ...prev,
      quote_items: [...prev.quote_items, ...bundleItems],
      selected_bundle: bundle.id,
      bundle_tier: bundle.tier
    }));
  };

  const handleOptionToggle = (option) => {
    const isSelected = selectedOptions.find(opt => opt.id === option.id);
    
    if (isSelected) {
      // Remove option
      setSelectedOptions(prev => prev.filter(opt => opt.id !== option.id));
      setFormData(prev => ({
        ...prev,
        quote_items: prev.quote_items.filter(item => item.option_id !== option.id)
      }));
    } else {
      // Add option
      setSelectedOptions(prev => [...prev, option]);
      
      const optionItem = {
        item_name: option.name,
        description: option.description || '',
        item_type: 'service',
        quantity: 1,
        rate: option.price || 0,
        photo_url: '',
        option_id: option.id,
        is_optional: true
      };

      setFormData(prev => ({
        ...prev,
        quote_items: [...prev.quote_items, optionItem]
      }));
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'good': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'better': return 'bg-green-50 border-green-200 text-green-800';
      case 'best': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'good': return <CheckCircleIcon className="w-5 h-5" />;
      case 'better': return <StarIcon className="w-5 h-5" />;
      case 'best': return <SparklesIcon className="w-5 h-5" />;
      default: return <TagIcon className="w-5 h-5" />;
    }
  };

  const calculateBundleTotal = (bundle) => {
    return bundle.bundle_items.reduce((total, item) => {
      return total + (item.quantity || 1) * (item.rate || 0);
    }, 0);
  };

  const optionsByCategory = options.reduce((acc, option) => {
    const category = option.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(option);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Configure Quote Package</h3>
            <p className="text-sm text-gray-600 mt-1">Choose a service bundle and add optional features</p>
          </div>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Bundles */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Service Packages</h4>
            <div className="space-y-4">
              {bundles.map(bundle => (
                <div
                  key={bundle.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedBundle?.id === bundle.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleBundleSelect(bundle)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTierColor(bundle.tier)}`}>
                        {getTierIcon(bundle.tier)}
                        {bundle.tier?.toUpperCase() || 'STANDARD'}
                      </span>
                      <h5 className="font-medium text-gray-900">{bundle.name}</h5>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${calculateBundleTotal(bundle).toLocaleString()}
                      </div>
                      {bundle.savings_amount > 0 && (
                        <div className="text-xs text-green-600">
                          Save ${bundle.savings_amount}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{bundle.description}</p>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700 mb-1">Includes:</div>
                    {bundle.bundle_items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        {item.quantity}x {item.item_name}
                      </div>
                    ))}
                    {bundle.bundle_items.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{bundle.bundle_items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {bundles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p>No service bundles available</p>
                  <p className="text-sm">Create bundles in Settings to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Optional Add-ons */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Optional Add-ons</h4>
            <div className="space-y-4">
              {Object.entries(optionsByCategory).map(([category, categoryOptions]) => (
                <div key={category}>
                  <h5 className="font-medium text-gray-700 mb-2">{category}</h5>
                  <div className="space-y-2">
                    {categoryOptions.map(option => {
                      const isSelected = selectedOptions.find(opt => opt.id === option.id);
                      return (
                        <div
                          key={option.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleOptionToggle(option)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckCircleIcon className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <div className="font-medium text-sm text-gray-900">{option.name}</div>
                                {option.description && (
                                  <div className="text-xs text-gray-600">{option.description}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              +${(option.price || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {Object.keys(optionsByCategory).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <PlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p>No optional add-ons available</p>
                  <p className="text-sm">Create options in Settings to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        {(selectedBundle || selectedOptions.length > 0) && (
          <div className="mt-8 border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Configuration Summary</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              {selectedBundle && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">
                    {selectedBundle.name} ({selectedBundle.tier?.toUpperCase()})
                  </span>
                  <span className="font-medium">${calculateBundleTotal(selectedBundle).toLocaleString()}</span>
                </div>
              )}
              
              {selectedOptions.map(option => (
                <div key={option.id} className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{option.name}</span>
                  <span className="font-medium">+${(option.price || 0).toLocaleString()}</span>
                </div>
              ))}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Total Configuration</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${(
                      (selectedBundle ? calculateBundleTotal(selectedBundle) : 0) +
                      selectedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={onClose}
            disabled={!selectedBundle && selectedOptions.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default CPQBuilder;
