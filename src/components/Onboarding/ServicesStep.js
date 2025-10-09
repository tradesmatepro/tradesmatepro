import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabaseClient';
import {
  WrenchScrewdriverIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const ServicesStep = ({ onComplete, onValidationChange, quickStartMode = false }) => {
  const { user } = useUser();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    category_id: '',
    base_price: '',
    unit: 'hour'
  });

  // LOCKED SCHEMA: Create default service categories
  const createDefaultCategories = async () => {
    if (!user?.company_id) return;

    const defaultCategories = [
      { name: 'HVAC', description: 'Heating, Ventilation, and Air Conditioning', color: '#ef4444' },
      { name: 'Plumbing', description: 'Plumbing and Water Systems', color: '#3b82f6' },
      { name: 'Electrical', description: 'Electrical Systems and Wiring', color: '#f59e0b' },
      { name: 'General Contracting', description: 'General Construction and Contracting', color: '#6b7280' }
    ];

    try {
      const { data, error } = await supabase
        .from('service_categories')
        .insert(
          defaultCategories.map(cat => ({
            company_id: user.company_id,
            name: cat.name,
            description: cat.description,
            color: cat.color,
            is_active: true
          }))
        )
        .select();

      if (error) {
        console.error('Error creating default categories:', error);
      } else {
        setCategories(data || []);
        console.log('✅ Created default service categories');
      }
    } catch (error) {
      console.error('Error creating categories:', error);
    }
  };

  // ENHANCED: Industry-specific service templates (FIXED: Not contractor-only!)
  const serviceTemplates = {
    'Plumbing': [
      { name: 'Leak Repair', description: 'Fix residential or commercial leaks', base_price: 120, unit: 'service' },
      { name: 'Water Heater Install', description: 'Standard 40-50 gallon tank install', base_price: 1200, unit: 'service' },
      { name: 'Drain Cleaning', description: 'Snaking/jetting services', base_price: 150, unit: 'service' },
      { name: 'Fixture Replacement', description: 'Sinks, faucets, toilets', base_price: 200, unit: 'fixture' },
      { name: 'Emergency Plumbing', description: '24/7 emergency plumbing service', base_price: 180, unit: 'hour' }
    ],
    'Electrical': [
      { name: 'Panel Upgrade', description: 'Electrical panel replacement', base_price: 2500, unit: 'service' },
      { name: 'Outlet Installation', description: 'New outlet or GFCI install', base_price: 150, unit: 'outlet' },
      { name: 'Lighting Repair', description: 'Fix lighting issues', base_price: 100, unit: 'service' },
      { name: 'Ceiling Fan Install', description: 'Ceiling fan installation', base_price: 200, unit: 'service' },
      { name: 'Emergency Electrical', description: '24/7 electrical emergency service', base_price: 200, unit: 'hour' }
    ],
    'HVAC': [
      { name: 'A/C Installation', description: 'Central air conditioning install', base_price: 3500, unit: 'service' },
      { name: 'Furnace Tune-Up', description: 'Annual furnace maintenance', base_price: 200, unit: 'service' },
      { name: 'Duct Cleaning', description: 'Complete ductwork cleaning', base_price: 400, unit: 'service' },
      { name: 'Filter Replacement', description: 'HVAC filter change', base_price: 80, unit: 'service' },
      { name: 'Emergency HVAC', description: '24/7 heating/cooling emergency', base_price: 250, unit: 'hour' }
    ],
    'Landscaping': [
      { name: 'Lawn Mowing', description: 'Weekly lawn maintenance', base_price: 50, unit: 'service' },
      { name: 'Tree Trimming', description: 'Professional tree pruning', base_price: 300, unit: 'service' },
      { name: 'Irrigation Setup', description: 'Sprinkler system install', base_price: 800, unit: 'service' },
      { name: 'Leaf Cleanup', description: 'Seasonal leaf removal', base_price: 120, unit: 'service' },
      { name: 'Landscape Design', description: 'Custom landscape planning', base_price: 1200, unit: 'project' }
    ],
    'Cleaning': [
      { name: 'Deep Clean', description: 'Comprehensive deep cleaning', base_price: 200, unit: 'service' },
      { name: 'Carpet Cleaning', description: 'Professional carpet cleaning', base_price: 150, unit: 'room' },
      { name: 'Move-Out Clean', description: 'Complete move-out cleaning', base_price: 300, unit: 'service' },
      { name: 'Office Cleaning', description: 'Commercial office cleaning', base_price: 100, unit: 'visit' },
      { name: 'Post-Construction', description: 'Construction cleanup service', base_price: 400, unit: 'service' }
    ],
    'General Contracting': [
      { name: 'Kitchen Remodel', description: 'Complete kitchen renovation', base_price: 15000, unit: 'project' },
      { name: 'Bathroom Remodel', description: 'Full bathroom renovation', base_price: 8000, unit: 'project' },
      { name: 'Drywall Repair', description: 'Drywall patching and repair', base_price: 300, unit: 'service' },
      { name: 'Flooring Install', description: 'Hardwood/tile installation', base_price: 8, unit: 'sqft' },
      { name: 'Deck Building', description: 'Custom deck construction', base_price: 5000, unit: 'project' }
    ],
    'Roofing': [
      { name: 'Roof Inspection', description: 'Complete roof assessment', base_price: 200, unit: 'service' },
      { name: 'Shingle Repair', description: 'Shingle replacement service', base_price: 400, unit: 'service' },
      { name: 'Gutter Cleaning', description: 'Gutter cleaning and inspection', base_price: 150, unit: 'service' },
      { name: 'Roof Replacement', description: 'Complete roof replacement', base_price: 12000, unit: 'project' },
      { name: 'Emergency Repair', description: 'Emergency roof repair service', base_price: 500, unit: 'service' }
    ],
    'Pool Service': [
      { name: 'Pool Cleaning', description: 'Weekly pool cleaning and maintenance', base_price: 100, unit: 'service' },
      { name: 'Pool Equipment Repair', description: 'Pump, filter, and heater repairs', base_price: 300, unit: 'repair' },
      { name: 'Pool Opening/Closing', description: 'Seasonal pool opening and closing', base_price: 200, unit: 'service' },
      { name: 'Chemical Balancing', description: 'Water testing and chemical adjustment', base_price: 50, unit: 'service' },
      { name: 'Pool Liner Replacement', description: 'Vinyl liner replacement', base_price: 2500, unit: 'service' }
    ],
    'Pest Control': [
      { name: 'General Pest Treatment', description: 'Comprehensive pest control service', base_price: 150, unit: 'service' },
      { name: 'Termite Inspection', description: 'Professional termite inspection', base_price: 100, unit: 'service' },
      { name: 'Rodent Control', description: 'Mouse and rat control service', base_price: 200, unit: 'service' },
      { name: 'Ant Treatment', description: 'Targeted ant elimination', base_price: 120, unit: 'service' },
      { name: 'Quarterly Service', description: 'Regular pest prevention program', base_price: 80, unit: 'service' }
    ],
    'Garage Door': [
      { name: 'Garage Door Repair', description: 'Spring, opener, and track repairs', base_price: 200, unit: 'repair' },
      { name: 'Garage Door Installation', description: 'New garage door installation', base_price: 800, unit: 'door' },
      { name: 'Opener Installation', description: 'Garage door opener installation', base_price: 300, unit: 'opener' },
      { name: 'Spring Replacement', description: 'Torsion and extension spring replacement', base_price: 150, unit: 'spring' },
      { name: 'Annual Maintenance', description: 'Tune-up and safety inspection', base_price: 100, unit: 'service' }
    ],
    'Locksmith': [
      { name: 'Lock Installation', description: 'Residential and commercial lock installation', base_price: 150, unit: 'lock' },
      { name: 'Emergency Lockout', description: '24/7 emergency lockout service', base_price: 100, unit: 'service' },
      { name: 'Key Duplication', description: 'Key cutting and duplication', base_price: 25, unit: 'key' },
      { name: 'Rekey Service', description: 'Lock rekeying service', base_price: 75, unit: 'lock' },
      { name: 'Security System Install', description: 'Deadbolts and security hardware', base_price: 200, unit: 'system' }
    ],
    'Handyman': [
      { name: 'General Repairs', description: 'Various home repair services', base_price: 100, unit: 'hour' },
      { name: 'Fixture Installation', description: 'Light fixtures, fans, and hardware', base_price: 150, unit: 'fixture' },
      { name: 'Drywall Repair', description: 'Hole patching and drywall repairs', base_price: 200, unit: 'patch' },
      { name: 'Painting Touch-Up', description: 'Small painting and touch-up work', base_price: 120, unit: 'hour' },
      { name: 'Assembly Service', description: 'Furniture and equipment assembly', base_price: 80, unit: 'hour' }
    ]
  };

  const [companyIndustry, setCompanyIndustry] = useState('');

  // Load existing services and categories
  useEffect(() => {
    loadData();
  }, [user?.company_id]);

  const loadData = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      // INDUSTRY STANDARD: Load company industry for smart service suggestions
      // FIXED: Graceful fallback for missing columns
      try {
        // Try with industry_tags first, fallback to just name if column doesn't exist
        let companyData;
        let companyError;

        try {
          const result = await supabase
            .from('companies')
            .select('industry_tags, industry, name')
            .eq('id', user.company_id)
            .single();
          companyData = result.data;
          companyError = result.error;
        } catch (err) {
          // If industry_tags column doesn't exist, try without it
          console.log('⚠️ industry_tags column missing, trying fallback query');
          const result = await supabase
            .from('companies')
            .select('industry, name')
            .eq('id', user.company_id)
            .single();
          companyData = result.data;
          companyError = result.error;
        }

        if (companyError) {
          console.log('⚠️ Company data query failed, using default:', companyError.message);
          setCompanyIndustry('General Contracting');
        } else {
          let detectedIndustry = 'General Contracting';

          // Method 1: Use industry_tags if available (ServiceTitan standard)
          if (companyData?.industry_tags && Array.isArray(companyData.industry_tags) && companyData.industry_tags.length > 0) {
            detectedIndustry = companyData.industry_tags[0];
          }
          // Method 1b: Use industry column if available
          else if (companyData?.industry) {
            detectedIndustry = companyData.industry;
          }
          // Method 2: Smart detection from company name (fallback)
          else if (companyData?.name) {
            const companyName = companyData.name.toLowerCase();
            const industryKeywords = {
              'HVAC': ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace', 'ac'],
              'Plumbing': ['plumbing', 'plumber', 'pipe', 'drain', 'water', 'sewer'],
              'Electrical': ['electric', 'electrical', 'electrician', 'wiring', 'power'],
              'Roofing': ['roof', 'roofing', 'roofer', 'shingle', 'gutter'],
              'Landscaping': ['landscape', 'landscaping', 'lawn', 'garden', 'tree', 'irrigation'],
              'Pool Service': ['pool', 'spa', 'swimming'],
              'Pest Control': ['pest', 'exterminator', 'bug', 'termite', 'rodent'],
              'Garage Door': ['garage', 'door'],
              'Locksmith': ['lock', 'locksmith', 'key', 'security'],
              'Handyman': ['handyman', 'handymen', 'repair', 'maintenance']
            };

            for (const [industry, keywords] of Object.entries(industryKeywords)) {
              if (keywords.some(keyword => companyName.includes(keyword))) {
                detectedIndustry = industry;
                break;
              }
            }
          }

          setCompanyIndustry(detectedIndustry);
          console.log(`🎯 Detected industry: ${detectedIndustry} for company: ${companyData?.name}`);
        }
      } catch (error) {
        console.log('⚠️ Company industry detection failed, using default');
        setCompanyIndustry('General Contracting');
      }

      // Load service categories (company-specific and global defaults)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('service_categories')
        .select('*')
        .or(`company_id.eq.${user.company_id},company_id.is.null`)
        .order('name');

      if (categoriesError) throw categoriesError;

      let categories = categoriesData || [];
      console.log('📊 Loaded categories:', categories.length, categories.map(c => `${c.name} (company_id: ${c.company_id})`));

      // INDUSTRY STANDARD: Ensure company has at least basic categories
      if (categories.filter(c => c.company_id === user.company_id).length === 0) {
        console.log('🔧 No company-specific categories found, creating default ones...');

        // Create default categories for this company based on industry
        const defaultCategories = [
          { name: 'General Contracting', description: 'General construction and repair services', color: '#8b5cf6' },
          { name: 'Cleaning', description: 'Cleaning and maintenance services', color: '#06b6d4' }
        ];

        // Add industry-specific category
        if (companyIndustry && companyIndustry !== 'General Contracting') {
          defaultCategories.unshift({
            name: companyIndustry,
            description: `${companyIndustry} services and repairs`,
            color: '#3b82f6'
          });
        }

        for (const category of defaultCategories) {
          try {
            const { data: newCategory, error: createError } = await supabase
              .from('service_categories')
              .insert({
                company_id: user.company_id,
                name: category.name,
                description: category.description,
                color: category.color,
                is_active: true
              })
              .select()
              .single();

            if (!createError && newCategory) {
              categories.push(newCategory);
              console.log(`✅ Created category: ${category.name}`);
            }
          } catch (err) {
            console.log(`⚠️ Category ${category.name} might already exist:`, err.message);
          }
        }
      }

      setCategories(categories);

      // Load existing services (FIXED: service_types uses category_id, not company_id)
      const { data: servicesData, error: servicesError } = await supabase
        .from('service_types')
        .select(`
          *,
          service_categories!inner (
            name,
            company_id
          )
        `)
        .eq('service_categories.company_id', user.company_id)
        .order('name');

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

    } catch (error) {
      console.error('Error loading services data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate services - INDUSTRY STANDARD: Always allow skip
  const validateServices = () => {
    console.log('🔍 Validating services...');
    console.log('📊 Services count:', services.length);

    // INDUSTRY STANDARD: Always valid - users can skip services entirely
    const isValid = true;
    const errors = [];
    const warnings = [];

    if (services.length === 0) {
      warnings.push('You can add services later for faster quoting');
    } else if (services.length < 3) {
      warnings.push('Consider adding more services to give customers more options');
    }

    console.log('✅ Validation result:', { valid: isValid, errors, warnings });

    onValidationChange?.({
      valid: isValid,
      errors,
      warnings
    });

    return isValid;
  };

  // Validate on services change
  useEffect(() => {
    if (!loading) {
      validateServices();
    }
  }, [services, loading]);

  // Add service template
  const addServiceTemplate = async (template) => {
    if (!user?.company_id) return;

    try {
      // Find appropriate category
      let categoryId = categories.find(cat => 
        template.name.toLowerCase().includes(cat.name.toLowerCase()) ||
        cat.name.toLowerCase().includes('general')
      )?.id;

      if (!categoryId && categories.length > 0) {
        categoryId = categories[0].id; // Use first category as fallback
      }

      const serviceData = {
        category_id: categoryId,
        name: template.name,
        description: template.description,
        base_price: template.base_price,
        estimated_duration: `${template.base_price > 1000 ? '1 day' : '2 hours'}`, // Smart duration based on price
        is_active: true
      };

      const { data, error } = await supabase
        .from('service_types')
        .insert(serviceData)
        .select(`
          *,
          service_categories (name)
        `)
        .single();

      if (error) throw error;

      setServices(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding service template:', error);
    }
  };

  // Add custom service
  const addCustomService = async () => {
    if (!newService.name.trim() || !user?.company_id) return;

    try {
      setSaving(true);

      const serviceData = {
        category_id: newService.category_id || categories[0]?.id,
        name: newService.name.trim(),
        description: newService.description.trim(),
        base_price: parseFloat(newService.base_price) || 0,
        estimated_duration: '2 hours', // Default duration
        is_active: true
      };

      const { data, error } = await supabase
        .from('service_types')
        .insert(serviceData)
        .select(`
          *,
          service_categories (name)
        `)
        .single();

      if (error) throw error;

      setServices(prev => [...prev, data]);
      setNewService({
        name: '',
        description: '',
        category_id: '',
        base_price: '',
        unit: 'hour'
      });

    } catch (error) {
      console.error('Error adding custom service:', error);
    } finally {
      setSaving(false);
    }
  };

  // Remove service
  const removeService = async (serviceId) => {
    try {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (error) {
      console.error('Error removing service:', error);
    }
  };

  // Get relevant service templates based on company industry
  const getRelevantTemplates = () => {
    if (!companyIndustry) return [];

    // Find exact match first
    if (serviceTemplates[companyIndustry]) {
      return serviceTemplates[companyIndustry];
    }

    // Find partial matches (e.g., "HVAC Services" matches "HVAC")
    const industryKey = Object.keys(serviceTemplates).find(key =>
      companyIndustry.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(companyIndustry.toLowerCase())
    );

    if (industryKey) {
      return serviceTemplates[industryKey];
    }

    // Default to General Contracting if no match
    return serviceTemplates['General Contracting'] || [];
  };

  const handleComplete = () => {
    console.log('🔄 ServicesStep handleComplete called');
    console.log('📊 Current services:', services);
    console.log('📊 Current categories:', categories);

    const isValid = validateServices();
    console.log('✅ Validation result:', isValid);

    if (isValid) {
      console.log('🚀 Calling onComplete with services data');
      onComplete?.({ services });
    } else {
      console.log('❌ Validation failed, not proceeding');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading services...</p>
      </div>
    );
  }

  const industryTemplates = getRelevantTemplates();
  const allIndustries = Object.keys(serviceTemplates);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <WrenchScrewdriverIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Services & Pricing</h2>
        <p className="text-gray-600">
          Define the services you provide. This helps create accurate quotes and lets customers know what you offer.
        </p>
      </div>

      {/* ENHANCED: Industry-Specific Service Templates */}
      {industryTemplates.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ⚡ Quick Start: {companyIndustry || 'Common'} Services
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Click to add these {companyIndustry ? `${companyIndustry.toLowerCase()}` : 'common'} services to your account. You can customize pricing and details later.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {industryTemplates.map((template, index) => {
              const isAdded = services.some(s => s.name === template.name);
              return (
                <button
                  key={index}
                  onClick={() => addServiceTemplate(template)}
                  disabled={isAdded}
                  className={`text-left p-3 border rounded-md transition-colors ${
                    isAdded
                      ? 'border-green-300 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">{template.name}</div>
                    {isAdded && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="text-sm text-gray-600">{template.description}</div>
                  <div className="text-sm text-green-600 mt-1">
                    <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                    ${template.base_price} per {template.unit}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Skip Option */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {/* Skip to custom service form */}}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip templates - I'll add my own services →
            </button>
          </div>
        </div>
      )}

      {/* ENHANCED: Browse Other Industries */}
      {companyIndustry && allIndustries.length > 1 && (
        <div className="bg-gray-50 rounded-lg border p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🔍 Browse Other Service Types
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Need services from other industries? Browse templates from different trades:
          </p>
          <div className="flex flex-wrap gap-2">
            {allIndustries.filter(industry => industry !== companyIndustry).map((industry) => (
              <button
                key={industry}
                onClick={() => setCompanyIndustry(industry)}
                className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                {industry}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Services */}
      {services.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Services</h3>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{service.name}</div>
                  <div className="text-sm text-gray-600">{service.description}</div>
                  <div className="text-sm text-green-600 mt-1">
                    <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                    ${service.base_price} per {service.unit}
                  </div>
                </div>
                <button
                  onClick={() => removeService(service.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Service */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Custom Service</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Name *
            </label>
            <input
              type="text"
              value={newService.name}
              onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Drain Cleaning"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={newService.category_id}
              onChange={(e) => setNewService(prev => ({ ...prev, category_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newService.description}
              onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="2"
              placeholder="Brief description of the service"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Price
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={newService.base_price}
                onChange={(e) => setNewService(prev => ({ ...prev, base_price: e.target.value }))}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <select
              value={newService.unit}
              onChange={(e) => setNewService(prev => ({ ...prev, unit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="hour">Per Hour</option>
              <option value="service">Per Service</option>
              <option value="sqft">Per Sq Ft</option>
              <option value="item">Per Item</option>
              <option value="day">Per Day</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={addCustomService}
            disabled={!newService.name.trim() || saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adding...
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                Add Service
              </>
            )}
          </button>
        </div>
      </div>

      {/* Continue Buttons */}
      <div className="text-center space-y-3">
        <button
          onClick={handleComplete}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
        >
          <CheckCircleIcon className="w-5 h-5" />
          {services.length === 0
            ? 'Skip - I\'ll Quote Jobs Individually'
            : `Continue with ${services.length} Service${services.length !== 1 ? 's' : ''}`
          }
        </button>

        {services.length > 0 && (
          <div className="text-sm text-gray-500">
            You can always add more services later from Settings
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesStep;
