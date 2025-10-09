import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
// Icons are imported in UI components, not needed here

// Supabase configuration
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '../utils/env';

const CustomerDatabasePanel = () => {
  const { user } = useUser();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    preferred_contact_method: 'phone',
    preferred_technician: '',
    preferred_times: '',
    preferred_service_time: 'morning',
    special_instructions: '',
    notes: '',
    status: 'ACTIVE',
    rating: 5,
    lifetime_revenue: 0,
    total_jobs: 0,
    last_service_date: '',
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    initializeDatabase();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeDatabase = async () => {
    try {
      console.log('Loading customers...');
      loadCustomers();
    } catch (error) {
      console.error('Error loading customers:', error);
      showAlert('error', 'Failed to load customers');
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customers?company_id=eq.${user.company_id}&select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else if (response.status === 404) {
        // Table doesn't exist yet, create it
        await createCustomersTable();
        setCustomers([]);
      } else {
        throw new Error('Failed to load customers');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      showAlert('error', 'Failed to load customers. Creating table...');
      await createCustomersTable();
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const createCustomersTable = async () => {
    try {
      // Match the exact current Supabase schema
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS customers (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          company_id UUID NULL,
          name TEXT NOT NULL,
          phone TEXT NULL,
          email TEXT NULL,
          address TEXT NULL,
          preferred_contact_method TEXT NULL,
          created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
          notes TEXT NULL,
          preferred_technician UUID NULL,
          preferred_times TEXT NULL,
          street_address TEXT NULL,
          city TEXT NULL,
          state TEXT NULL,
          zip_code TEXT NULL,
          country TEXT NULL DEFAULT 'United States',
          latitude DOUBLE PRECISION NULL,
          longitude DOUBLE PRECISION NULL,
          last_service_date DATE NULL,
          rating INTEGER NULL DEFAULT 5,
          lifetime_revenue NUMERIC NULL DEFAULT 0,
          total_jobs INTEGER NULL DEFAULT 0,
          status TEXT NULL DEFAULT 'ACTIVE',
          preferred_service_time TEXT NULL,
          special_instructions TEXT NULL
        );
      `;

      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: createTableSQL })
      });

      if (response.ok) {
        console.log('✅ Customers table created successfully');
        showAlert('success', 'Customer database initialized successfully!');
      }
    } catch (error) {
      console.error('Error creating customers table:', error);
      showAlert('error', 'Failed to initialize customer database');
    }
  };

  const createCustomer = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      showAlert('error', 'Customer name is required');
      return;
    }

    try {
      console.log("Submitting form data:", formData);

      // Match the exact current Supabase schema
      const customerData = {
        company_id: user?.company_id || null, // Use logged-in user's company_id
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        preferred_contact_method: formData.preferred_contact_method,
        notes: formData.notes,
        preferred_technician: formData.preferred_technician || null,
        preferred_times: formData.preferred_times,
        street_address: formData.street_address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
        last_service_date: formData.last_service_date || null,
        rating: formData.rating,
        lifetime_revenue: formData.lifetime_revenue,
        total_jobs: formData.total_jobs,
        status: formData.status,
        preferred_service_time: formData.preferred_service_time,
        special_instructions: formData.special_instructions
      };

      console.log('Creating customer with data:', customerData);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(customerData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Customer created successfully:', result);
        showAlert('success', 'Customer created successfully!');
        resetForm();
        setShowCreateForm(false);
        loadCustomers();
      } else {
        const errorText = await response.text();
        console.error('Failed to create customer:', response.status, errorText);
        throw new Error(`Failed to create customer: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      showAlert('error', `Failed to create customer: ${error.message}`);
    }
  };

  const updateCustomer = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      showAlert('error', 'Customer name is required');
      return;
    }

    try {
      // Match the exact current Supabase schema
      const customerData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        preferred_contact_method: formData.preferred_contact_method,
        notes: formData.notes,
        preferred_technician: formData.preferred_technician || null,
        preferred_times: formData.preferred_times,
        street_address: formData.street_address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
        last_service_date: formData.last_service_date || null,
        rating: formData.rating,
        lifetime_revenue: formData.lifetime_revenue,
        total_jobs: formData.total_jobs,
        status: formData.status,
        preferred_service_time: formData.preferred_service_time,
        special_instructions: formData.special_instructions
      };

      console.log('Updating customer with data:', customerData);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${selectedCustomer.id}&company_id=eq.${user.company_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Customer updated successfully:', result);
        showAlert('success', 'Customer updated successfully!');
        resetForm();
        setShowEditForm(false);
        setSelectedCustomer(null);
        loadCustomers();
      } else {
        const errorText = await response.text();
        console.error('Failed to update customer:', response.status, errorText);
        throw new Error(`Failed to update customer: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      showAlert('error', `Failed to update customer: ${error.message}`);
    }
  };

  const deleteCustomer = async (customerId, customerName) => {
    if (!window.confirm(`Are you sure you want to delete customer: ${customerName}?`)) {
      return;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${customerId}&company_id=eq.${user.company_id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      });

      if (response.ok) {
        showAlert('success', `Customer ${customerName} deleted successfully`);
        loadCustomers();
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      showAlert('error', 'Failed to delete customer');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'United States',
      preferred_contact_method: 'phone',
      preferred_technician: '',
      preferred_times: '',
      preferred_service_time: 'morning',
      special_instructions: '',
      notes: '',
      status: 'ACTIVE',
      rating: 5,
      lifetime_revenue: 0,
      total_jobs: 0,
      last_service_date: '',
      latitude: null,
      longitude: null
    });
  };

  const openEditForm = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      street_address: customer.street_address || '',
      city: customer.city || '',
      state: customer.state || '',
      zip_code: customer.zip_code || '',
      preferred_contact_method: customer.preferred_contact_method || 'phone',
      preferred_technician: customer.preferred_technician || '',
      preferred_service_time: customer.preferred_service_time || 'morning',
      special_instructions: customer.special_instructions || '',
      status: customer.status || 'active',
      rating: customer.rating || 5,
      lifetime_revenue: customer.lifetime_revenue || 0,
      total_jobs: customer.total_jobs || 0,
      last_service_date: customer.last_service_date || '',
      properties: customer.properties || [],
      communication_logs: customer.communication_logs || []
    });
    setShowEditForm(true);
  };

  const openDetailsModal = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return { 
    customers: filteredCustomers,
    loading,
    showCreateForm,
    showEditForm,
    showDetailsModal,
    selectedCustomer,
    searchTerm,
    statusFilter,
    alert,
    formData,
    setSearchTerm,
    setStatusFilter,
    setShowCreateForm,
    setShowEditForm,
    setShowDetailsModal,
    setFormData,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    openEditForm,
    openDetailsModal,
    resetForm
  };
};

export default CustomerDatabasePanel;
