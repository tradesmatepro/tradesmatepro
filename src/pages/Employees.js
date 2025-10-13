import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import PageHeader from '../components/Common/PageHeader';
import ModernTable from '../components/Common/ModernTable';
import EmployeeInviteModal from '../components/EmployeeInviteModal';
import PTORequestModal from '../components/PTORequestModal';
import PTOBalanceDashboard from '../components/PTO/PTOBalanceDashboard';
import PTORequestModalNew from '../components/PTO/PTORequestModal';
import PTOManagement from '../components/PTO/PTOManagement';
import PTOHistoryView from '../components/PTO/PTOHistoryView';
import { prepareCompanyData, logCompanyOperation } from '../utils/companyUtils';
import { autoInitializePTO } from '../utils/ptoSetup';
import { supaFetch } from '../utils/supaFetch';
import { getAvailableRoles, getRoleDisplayName, getRoleBadgeColor } from '../utils/roleUtils';
import { canManagePermissions } from '../utils/simplePermissions';
import { getInitials } from '../utils/avatarUtils';
import { supabase } from '../utils/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { generateTempPassword, getDefaultPermissions, EMPLOYEE_MODULES } from '../utils/employeePermissions';
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserGroupIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  EyeSlashIcon,
  PowerIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/solid';
import '../styles/modern-enhancements.css';
import { useUser } from '../contexts/UserContext';

import SkillsPicker from '../components/SkillsPicker';

// Legacy environment variables for beta (will be removed after full Supabase client migration)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;


const Employees = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [employees, setEmployees] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPTOModal, setShowPTOModal] = useState(false);
  const [showNewPTOModal, setShowNewPTOModal] = useState(false);
  const [ptoPolicies, setPtoPolicies] = useState([]);
  const [ptoLedger, setPtoLedger] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');


	  const [sortBy, setSortBy] = useState({ key: 'name', dir: 'asc' });

  // New state for enhanced features


  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [tempPasswordAlert, setTempPasswordAlert] = useState({ show: false, email: '', password: '' });
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    role: 'technician', // ✅ Fixed: Use actual enum value (technician is default employee role)
    is_schedulable: true // ✅ NEW: Default to schedulable for new employees
  });
  // ✅ NEW: Use unified module structure from employeePermissions.js
  const [newEmployeePermissions, setNewEmployeePermissions] = useState(() =>
    getDefaultPermissions('technician') // Default permissions for technician role
  );
  const [formLoading, setFormLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState({
    can_view_quotes: false,
    can_create_jobs: false,
    can_access_customers: false,
    can_edit_documents: false,
    can_manage_employees: false,
    can_access_settings: false,
    can_manage_permissions: false,
    can_access_scheduling: false,
    can_access_documents: false,
    can_access_quotes: false,
    can_access_invoices: false,
    can_access_employees: false,
    can_access_reports: false
  });

  // Skills editing state (Phase 1)
  const [editingEmployeeRowId, setEditingEmployeeRowId] = useState(null);
  const [editingEmployeeSkills, setEditingEmployeeSkills] = useState([]); // [{skill_id, level}]
  const [originalEmployeeSkills, setOriginalEmployeeSkills] = useState([]);


	  // Detail slide-over state
	  const [showDetailPanel, setShowDetailPanel] = useState(false);
	  const [detailEmployee, setDetailEmployee] = useState(null);
	  const [detailPermissions, setDetailPermissions] = useState(null);
	  const openDetailPanel = async (employee) => {
	    setDetailEmployee(employee);
	    setShowDetailPanel(true);
	    // ✅ REMOVED: user_permissions table doesn't exist yet
	    setDetailPermissions(null);
	  };
	  const closeDetailPanel = () => { setShowDetailPanel(false); setDetailEmployee(null); setDetailPermissions(null); };

	  // Quick role edit state within detail panel
	  const [detailRole, setDetailRole] = useState('technician');
	  const [savingRole, setSavingRole] = useState(false);
	  useEffect(()=>{
	    if (detailEmployee) setDetailRole(detailEmployee.role || 'technician');
	  }, [detailEmployee]);
	  const saveDetailRole = async () => {
	    if (!detailEmployee) return;
	    if (detailRole === detailEmployee.role) return;
	    try {
	      setSavingRole(true);
	      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${detailEmployee.id}`, {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Prefer': 'return=representation' },
	        body: JSON.stringify({ role: detailRole })
	      });
	      if (!res.ok) throw new Error('Failed to update role');
	      const [updated] = await res.json();
	      // Update local states
	      setDetailEmployee(prev => prev ? { ...prev, role: updated.role } : prev);
	      setEmployees(prev => prev.map(e => e.id === updated.id ? { ...e, role: updated.role } : e));
	      showAlert('success', 'Role updated');
	    } catch (e) {
	      console.error(e);
	      showAlert('error', 'Could not update role');
	    } finally { setSavingRole(false); }
	  };
	  const handleActivateEmployee = async (employeeId) => {
	    try {
	      const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${employeeId}` , {
	        method: 'PATCH', headers: { 'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${SUPABASE_ANON_KEY}`, 'Prefer': 'return=minimal' }, body: JSON.stringify({ status:'active', active:true })
	      });
	      if (res.ok) { showAlert('success','Employee activated'); loadEmployees(); setDetailEmployee(prev=> prev? { ...prev, status:'active', active:true }:prev);} else { showAlert('error','Failed to activate'); }
	    } catch(e){ console.error(e); showAlert('error','Failed to activate'); }
	  };
	  const resendInvite = async () => {
	    if (!detailEmployee) return;
	    try {
	      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
	      const link = `${window.location.origin}/accept-invite?token=${token}`;
	      try { await navigator.clipboard.writeText(link); } catch(_) {}
	      showAlert('success', `Invite link copied: ${link}`);
	    } catch (e) {
	      showAlert('error', 'Could not generate invite link');
	    }
	  };


	  // Detail panel extra state
	  const [detailAuth, setDetailAuth] = useState(null);
	  const [detailPhone, setDetailPhone] = useState('');
	  const [savingPhone, setSavingPhone] = useState(false);
	  useEffect(()=>{ if (detailEmployee) setDetailPhone(detailEmployee.phone || ''); }, [detailEmployee]); // ✅ FIX: phone, not phone_number
	  const saveDetailPhone = async () => {
	    if (!detailEmployee) return;
	    try {
	      setSavingPhone(true);
	      const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${detailEmployee.id}`, {
	        method: 'PATCH', headers: { 'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${SUPABASE_ANON_KEY}`, 'Prefer': 'return=representation' },
	        body: JSON.stringify({ phone_number: detailPhone || null })
	      });
	      if (!res.ok) throw new Error('Failed to update phone');
	      const [updated] = await res.json();
	      setDetailEmployee(prev => prev ? { ...prev, phone_number: updated.phone_number } : prev);
	      setEmployees(prev => prev.map(e => e.id === updated.id ? { ...e, phone_number: updated.phone_number } : e));
	      showAlert('success', 'Phone updated');
	    } catch(e) { console.error(e); showAlert('error','Could not update phone'); } finally { setSavingPhone(false); }
	  };



  useEffect(() => {
    console.log('🔧 FIX APPLIED: PTO loading is DISABLED');
    loadEmployees();
    // loadPTOData(); // ❌ DISABLED: PTO tables (pto_policies, pto_ledger) don't exist yet - uncomment when tables are created
  }, [user?.company_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const showAlert = (type, message, duration = 5000) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), duration);
  };

  const handlePermissionToggle = (permission) => {
    setNewEmployeePermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const exportEmployeesCSV = (rows) => {
    const headers = ['Full Name','Email','Role','Phone','Status','Joined'];
    const lines = rows.map(emp => [
      JSON.stringify(emp.full_name||''),
      JSON.stringify(emp.email||''),
      JSON.stringify(emp.role||''),
      JSON.stringify(emp.phone_number||''),
      JSON.stringify(emp.status || (emp.active ? 'active':'inactive')),
      JSON.stringify(emp.created_at ? new Date(emp.created_at).toLocaleDateString() : '')
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'employees.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      // ✅ INDUSTRY STANDARD: Query users table, left join with employees for is_schedulable
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          auth_user_id,
          company_id,
          role,
          status,
          first_name,
          last_name,
          name,
          email,
          phone,
          employee_number,
          hire_date,
          job_title,
          department,
          hourly_rate,
          created_at,
          updated_at,
          profiles (
            avatar_url,
            preferences
          ),
          employees (
            is_schedulable
          )
        `)
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('📋 Raw employee data from database:', data);

      // Transform data to include computed fields for compatibility
      const mappedData = (data || []).map(user => ({
        // User data (all in users table now)
        id: user.id,
        user_id: user.id,
        auth_user_id: user.auth_user_id,
        company_id: user.company_id,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,

        // Personal & employment data (from users table)
        full_name: user.name || 'Unknown User',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || 'N/A',
        phone: user.phone || '',
        employee_number: user.employee_number || '',
        hire_date: user.hire_date,
        job_title: user.job_title || '',
        department: user.department || '',
        hourly_rate: user.hourly_rate || 0,
        // ✅ NEW: Load from employees table (handle array or single object)
        is_schedulable: Array.isArray(user.employees)
          ? (user.employees[0]?.is_schedulable !== undefined ? user.employees[0].is_schedulable : true)
          : (user.employees?.is_schedulable !== undefined ? user.employees.is_schedulable : true),

        // UI preferences (from profiles table)
        avatar_url: user.profiles?.avatar_url || '',
        preferences: user.profiles?.preferences || {}
      }));

      console.log('📋 Mapped employee data:', mappedData);
      setEmployees(mappedData);
    } catch (error) {
      console.error('❌ Error loading employees:', error);
      showAlert('error', 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const loadPTOData = async () => {
    if (!user?.company_id) return;

    try {
      // Load PTO policies
      const policiesRes = await supaFetch('pto_policies?order=created_at.desc', { method: 'GET' }, user.company_id);
      if (policiesRes.ok) {
        const policies = await policiesRes.json();
        setPtoPolicies(policies || []);
      }

      // Load PTO ledger entries
      const ledgerRes = await supaFetch('pto_ledger?order=created_at.desc&limit=100', { method: 'GET' }, user.company_id);
      if (ledgerRes.ok) {
        const ledger = await ledgerRes.json();
        setPtoLedger(ledger || []);
      }
    } catch (error) {
      console.error('Error loading PTO data:', error);
    }
  };
  const handleInvite = async (inviteData) => {
    try {
      console.log('🚀 ========== EMPLOYEE INVITE STARTED ==========');
      console.log('📧 Email:', inviteData.email);
      console.log('👤 Name:', inviteData.fullName);
      console.log('🎭 Role:', inviteData.role);

      setLoading(true);

      // Step 1: Check if user already exists
      console.log('🔍 Step 1: Checking if user exists...');
      const userExists = await checkUserExists(inviteData.email);
      if (userExists) {
        throw new Error(`User with email ${inviteData.email} already exists`);
      }
      console.log('✅ Step 1 Complete: No existing user found');

      // Step 2: Create auth user with INVITE (sends magic link email)
      console.log('🔐 Step 2: Creating Supabase Auth user...');
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: inviteData.email,
          email_confirm: false, // ✅ Sends confirmation email with magic link
          user_metadata: {
            full_name: inviteData.fullName,
            role: inviteData.role,
            company_id: user.company_id,
            invited_by: user.id,
            invited_at: new Date().toISOString()
          }
        })
      });

      if (!authResponse.ok) {
        const authError = await authResponse.json();
        console.error('❌ Auth error:', authError);
        throw new Error(`Failed to create auth user: ${authError.msg || authError.message || 'Unknown error'}`);
      }

      const authResult = await authResponse.json();
      const authUserId = authResult.id;
      console.log('✅ Step 2 Complete: Auth user created:', authUserId);

      // Step 3: Create business user record (with all employee data)
      console.log('👔 Step 3: Creating business user record...');
      const nameParts = inviteData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userData = {
        auth_user_id: authUserId,
        company_id: user.company_id,
        role: inviteData.role.toLowerCase(),
        status: 'pending_invite', // ✅ INVITE: pending_invite (waiting for email confirmation)
        first_name: firstName,
        last_name: lastName,
        email: inviteData.email,
        phone: inviteData.phone || null,
        hire_date: new Date().toISOString().split('T')[0], // Today's date
        // ✅ NOTE: Permissions are handled by role-based system (simplePermissions.js), not stored in users table
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(userData)
      });

      if (!userResponse.ok) {
        const userError = await userResponse.json();
        console.error('❌ User creation error:', userError);
        throw new Error(`Failed to create user record: ${userError.message || userError.hint || 'Unknown error'}`);
      }

      const createdUser = await userResponse.json();
      const businessUserId = createdUser[0].id;
      console.log('✅ Step 3 Complete: Business user created:', businessUserId);

      // Step 4: Create profile record (UI preferences only)
      console.log('📝 Step 4: Creating profile record...');
      const profileData = {
        user_id: businessUserId,
        preferences: {},
        notification_preferences: {
          email: true,
          sms: false,
          push: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(profileData)
      });

      if (!profileResponse.ok) {
        const profileError = await profileResponse.json();
        console.warn('⚠️ Profile creation warning:', profileError);
        // Don't fail - profile can be created later
      } else {
        console.log('✅ Step 4 Complete: Profile created');
      }

      // Step 5: Create employees record (ONLY for staff, not customer portal users)
      // ✅ INDUSTRY STANDARD: All employees are users, but not all users are employees
      if (inviteData.role.toLowerCase() !== 'customer_portal') {
        console.log('👷 Step 5: Creating employees record...');
        const employeeData = {
          company_id: user.company_id,
          user_id: businessUserId,
          employee_number: `EMP-${Date.now()}`, // Auto-generate employee number
          hire_date: new Date().toISOString().split('T')[0], // Today's date
          job_title: inviteData.role, // Use role as default job title
          department: null,
          hourly_rate: 0.00, // Default to 0, can be updated later
          overtime_rate: null,
          emergency_contact_name: null,
          emergency_contact_phone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const employeeResponse = await fetch(`${SUPABASE_URL}/rest/v1/employees`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(employeeData)
        });

        if (!employeeResponse.ok) {
          const employeeError = await employeeResponse.json();
          console.error('❌ Employee creation error:', employeeError);
          throw new Error(`Failed to create employee record: ${employeeError.message || employeeError.hint || 'Unknown error'}`);
        }

        console.log('✅ Step 5 Complete: Employee record created');
      } else {
        console.log('⏭️ Step 5 Skipped: Customer portal user (no employee record needed)');
      }

      // ✅ REMOVED: user_permissions table doesn't exist yet
      // Permissions are managed through role-based access control in the users table
      console.log('✅ Step 6 Complete: User created (permissions managed via role)');

      console.log('🎉 ========== EMPLOYEE INVITE COMPLETE ==========');
      showAlert('success', `✅ Invite sent to ${inviteData.email}! They will receive an email to set their password.`);
      loadEmployees(); // Refresh the list

    } catch (error) {
      console.error('❌ ========== EMPLOYEE INVITE FAILED ==========');
      console.error('❌ Error:', error);
      showAlert('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkUserExists = async (email) => {
    try {
      // Check both Auth and users table (critical fix from old app)
      console.log(`🔍 COMPREHENSIVE USER EXISTENCE CHECK for: ${email}`);

      // Check users table (not profiles - profiles doesn't have email column)
      const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${email}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (dbResponse.ok) {
        const dbUsers = await dbResponse.json();
        if (dbUsers.length > 0) {
          console.log(`❌ Found existing user in DB: ${dbUsers[0].email}`);
          return true;
        }
      }

      // Check Auth users
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        const authUsers = authData.users || [];
        const existsInAuth = authUsers.some(user => user.email?.toLowerCase() === email.toLowerCase());

        if (existsInAuth) {
          console.log(`❌ Found existing user in Auth: ${email}`);
          return true;
        }
      }

      console.log(`✅ NO EXISTING USER FOUND - Safe to create`);
      return false;
    } catch (error) {
      console.error('Error checking user existence:', error);
      // If we can't check, assume user exists to be safe
      return true;
    }
  };

  const createEmployee = async (e) => {
    e.preventDefault();

    const { email, full_name, phone_number, role } = formData;

    // Validation
    if (!email || !full_name || !role) {
      showAlert('error', 'Please fill in email, full name, and role');
      return;
    }

    setFormLoading(true);

    try {
      console.log('🚀 ========== MANUAL EMPLOYEE CREATION STARTED ==========');
      console.log('📧 Email:', email);
      console.log('👤 Name:', full_name);
      console.log('🎭 Role:', role);

      // Step 1: Check if user already exists
      console.log('🔍 Step 1: Checking if user exists...');
      const userExists = await checkUserExists(email);
      if (userExists) {
        throw new Error(`A user with email ${email} already exists`);
      }
      console.log('✅ Step 1 Complete: No existing user found');

      // Step 2: Generate temporary password
      console.log('🔐 Step 2: Generating temporary password...');
      const tempPassword = generateTempPassword();
      console.log('✅ Step 2 Complete: Temp password generated');

      // Step 3: Create auth user with PASSWORD (manual creation - NO email sent)
      console.log('🔐 Step 3: Creating Supabase Auth user with temp password...');
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: tempPassword, // ✅ Set temp password (NO email sent)
          email_confirm: true, // ✅ Mark email as confirmed (skip verification)
          user_metadata: {
            full_name: full_name,
            role: role.toLowerCase(),
            company_id: user.company_id,
            created_by: user.id,
            created_at: new Date().toISOString(),
            requires_password_change: true // ✅ Flag for first login
          },
          app_metadata: {
            provider: 'email',
            providers: ['email']
          }
        })
      });

      if (!authResponse.ok) {
        const authError = await authResponse.json();
        console.error('❌ Auth error:', authError);
        throw new Error(`Failed to create auth user: ${authError.msg || authError.message || 'Unknown error'}`);
      }

      const authResult = await authResponse.json();
      const authUserId = authResult.id;
      console.log('✅ Step 3 Complete: Auth user created:', authUserId);

      // Step 4: Create business user record (users table)
      console.log('👔 Step 4: Creating business user record...');
      const nameParts = full_name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userData = {
        auth_user_id: authUserId,
        company_id: user.company_id,
        role: role.toLowerCase(),
        status: 'active', // ✅ MANUAL CREATION: Active immediately (not pending_invite)
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone_number || null,
        hire_date: new Date().toISOString().split('T')[0], // Today's date
        // ✅ NOTE: Permissions are handled by role-based system (simplePermissions.js), not stored in users table
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(userData)
      });

      if (!userResponse.ok) {
        const userError = await userResponse.json();
        console.error('❌ User creation error:', userError);
        throw new Error(`Failed to create user record: ${userError.message || userError.hint || 'Unknown error'}`);
      }

      const createdUser = await userResponse.json();
      const businessUserId = createdUser[0].id;
      console.log('✅ Step 4 Complete: Business user created:', businessUserId);

      // Step 5: Create profile record (UI preferences only)
      console.log('📝 Step 5: Creating profile record...');
      const profileData = {
        user_id: businessUserId,
        preferences: {},
        notification_preferences: {
          email: true,
          sms: false,
          push: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(profileData)
      });

      if (!profileResponse.ok) {
        const profileError = await profileResponse.json();
        console.warn('⚠️ Profile creation warning:', profileError);
        // Don't fail - profile can be created later
      } else {
        console.log('✅ Step 5 Complete: Profile created');
      }

      // Step 6: Create employees record (ONLY for staff, not customer portal users)
      // ✅ INDUSTRY STANDARD: All employees are users, but not all users are employees
      if (role.toLowerCase() !== 'customer_portal') {
        console.log('👷 Step 6: Creating employees record...');
        const employeeData = {
          company_id: user.company_id,
          user_id: businessUserId,
          employee_number: `EMP-${Date.now()}`, // Auto-generate employee number
          hire_date: new Date().toISOString().split('T')[0], // Today's date
          job_title: role, // Use role as default job title
          department: null,
          hourly_rate: 0.00, // Default to 0, can be updated later
          overtime_rate: null,
          emergency_contact_name: null,
          emergency_contact_phone: null,
          is_schedulable: formData.is_schedulable !== undefined ? formData.is_schedulable : true, // ✅ NEW: Save schedulable status
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const employeeResponse = await fetch(`${SUPABASE_URL}/rest/v1/employees`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(employeeData)
        });

        if (!employeeResponse.ok) {
          const employeeError = await employeeResponse.json();
          console.error('❌ Employee creation error:', employeeError);
          throw new Error(`Failed to create employee record: ${employeeError.message || employeeError.hint || 'Unknown error'}`);
        }

        console.log('✅ Step 6 Complete: Employee record created');
      } else {
        console.log('⏭️ Step 6 Skipped: Customer portal user (no employee record needed)');
      }

      console.log('🎉 ========== MANUAL EMPLOYEE CREATION COMPLETE ==========');

      // Show temp password alert with copy button
      setTempPasswordAlert({
        show: true,
        email: email,
        password: tempPassword
      });

      // Auto-hide after 30 seconds
      setTimeout(() => {
        setTempPasswordAlert({ show: false, email: '', password: '' });
      }, 30000);

      // Reset form
      setFormData({ email: '', full_name: '', phone_number: '', role: 'technician' });
      setNewEmployeePermissions(getDefaultPermissions('technician')); // Reset to default permissions
      setShowCreateForm(false);
      loadEmployees(); // Refresh the list

    } catch (error) {
      console.error('❌ Error creating employee:', error);
      showAlert('error', error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ REMOVED: generateTempPassword now imported from employeePermissions.js

  // Calculate employee analytics
  const getEmployeeAnalytics = () => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'active' || emp.active === true).length;
    const pendingInvites = employees.filter(emp => emp.status === 'pending_invite').length;
    // const ptoRequestsCount = ptoRequests.filter(req => req.status === 'pending').length; // REMOVED - using new PTO system
    const ptoRequestsCount = 0; // Placeholder - will be handled by new PTO components

    return {
      totalEmployees,
      activeEmployees,
      pendingInvites,
      ptoRequestsCount
    };
  };

  const analytics = getEmployeeAnalytics();

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm ||
      employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && (employee.status === 'active' || employee.active === true)) ||
      (statusFilter === 'inactive' && (employee.status === 'inactive' || employee.active === false)) ||
      (statusFilter === 'pending' && employee.status === 'pending_invite');



    return matchesSearch && matchesRole && matchesStatus;
  });

	  const sortedEmployees = useMemo(() => {
	    const arr = [...filteredEmployees];
	    const k = sortBy.key; const d = sortBy.dir === 'asc' ? 1 : -1;
	    arr.sort((a,b)=>{
	      const av = k==='name' ? (a.full_name||'') : k==='email' ? (a.email||'') : k==='role' ? (a.role||'') : k==='status' ? (a.status|| (a.active?'active':'inactive')) : (a.created_at||'');
	      const bv = k==='name' ? (b.full_name||'') : k==='email' ? (b.email||'') : k==='role' ? (b.role||'') : k==='status' ? (b.status|| (b.active?'active':'inactive')) : (b.created_at||'');
	      if (av<bv) return -1*d; if (av>bv) return 1*d; return 0;
	    });
	    return arr;
	  }, [filteredEmployees, sortBy]);


  // Utility functions

  const getStatusBadge = (employee) => {
    const status = employee.status || (employee.active ? 'active' : 'inactive');
    const statusMap = {
      'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      'inactive': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
      'pending_invite': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Invite' }
    };
    return statusMap[status] || statusMap['active'];
  };

	  // Bulk select (after filteredEmployees and sortedEmployees are declared)
	  const [selectedIds, setSelectedIds] = useState(new Set());
	  const allVisibleSelected = useMemo(()=>filteredEmployees?.length>0 && filteredEmployees.every(e=>selectedIds.has(e.id)), [filteredEmployees, selectedIds]);
	  const toggleSelectAll = () => {
	    setSelectedIds(prev => {
	      const next = new Set(prev);
	      const all = filteredEmployees.length>0 && filteredEmployees.every(e=>next.has(e.id));
	      filteredEmployees.forEach(e => { if (all) next.delete(e.id); else next.add(e.id); });
	      return next;
	    });
	  };
	  const toggleRow = (id) => setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });


	  // Bulk actions for selected employees
	  const activateSelected = async () => {
	    const ids = Array.from(selectedIds);
	    if (!ids.length) return showAlert('info', 'Select employees first');
	    try {
	      await Promise.all(ids.map(id => fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}` , {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Prefer': 'return=minimal' },
	        body: JSON.stringify({ status: 'active', active: true })
	      })));
	      showAlert('success', `Activated ${ids.length} employee${ids.length>1?'s':''}`);
	      setSelectedIds(new Set());
	      loadEmployees();
	    } catch (e) {
	      console.error(e);
	      showAlert('error', 'Failed to activate some employees');
	    }
	  };
	  const deactivateSelected = async () => {
	    const ids = Array.from(selectedIds);
	    if (!ids.length) return showAlert('info', 'Select employees first');
	    try {
	      await Promise.all(ids.map(id => fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}` , {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Prefer': 'return=minimal' },
	        body: JSON.stringify({ status: 'inactive', active: false })
	      })));
	      showAlert('success', `Deactivated ${ids.length} employee${ids.length>1?'s':''}`);
	      setSelectedIds(new Set());
	      loadEmployees();
	    } catch (e) {
	      console.error(e);
	      showAlert('error', 'Failed to deactivate some employees');
	    }
	  };


  const getTimeSinceJoined = (joinedDate) => {
    if (!joinedDate) return 'Unknown';
    const now = new Date();
    const joined = new Date(joinedDate);
    const diffTime = Math.abs(now - joined);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // OLD PTO Request Actions removed - using new PTO tab system

  // Employee Actions
  const handleDeactivateEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) return;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${employeeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status: 'inactive',
          active: false
        })
      });

      if (response.ok) {
        showAlert('success', 'Employee deactivated successfully');
        loadEmployees(); // Reload employees
      } else {
        showAlert('error', 'Failed to deactivate employee');
      }
    } catch (error) {
      console.error('Error deactivating employee:', error);
      showAlert('error', 'Failed to deactivate employee');
    }
  };

  const handleResetPassword = async (employeeId, email) => {
    if (!window.confirm('Send password reset email to this employee?')) return;

    try {
      // TODO: Implement password reset email functionality
      showAlert('info', 'Password reset email functionality will be implemented');
    } catch (error) {
      console.error('Error resetting password:', error);
      showAlert('error', 'Failed to send password reset email');
    }
  };



  const deleteEmployee = async (employeeId, employeeEmail) => {
    if (!window.confirm(`Are you sure you want to delete employee: ${employeeEmail}?\n\nThis will remove them from both the users table and authentication system.`)) {
      return;
    }

    try {
      console.log('🗑️ ========== EMPLOYEE DELETION STARTED (NEW CODE v2.0) ==========');
      console.log('🔧 USING SUPABASE ADMIN API (NOT REST API)');
      console.log('📧 Email:', employeeEmail);
      console.log('🆔 User ID:', employeeId);

      // Step 1: Get auth_user_id from users table
      console.log('🔍 Step 1: Getting auth_user_id...');
      const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${employeeId}&select=auth_user_id`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      const userData = await userResponse.json();
      const authUserId = userData[0]?.auth_user_id;
      console.log('✅ Step 1 Complete: auth_user_id =', authUserId);

      // Step 2: Delete from auth.users (Supabase Auth) FIRST
      if (authUserId) {
        console.log('🔐 Step 2: Deleting from auth.users...');
        console.log('🔐 Auth User ID:', authUserId);

        // Create admin client with service key for auth operations
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });

        console.log('🔐 Using Supabase Admin API to delete auth user...');
        const { data: deleteData, error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);

        if (deleteError) {
          console.error('❌ Step 2 FAILED: Could not delete from auth.users');
          console.error('❌ Error:', deleteError);

          // Don't continue if auth deletion fails - this is critical!
          throw new Error(`Failed to delete from auth.users: ${deleteError.message}`);
        }

        console.log('✅ Step 2 Complete: Deleted from auth.users');
        console.log('✅ Delete result:', deleteData);
      } else {
        console.warn('⚠️ Step 2 Skipped: No auth_user_id found');
        throw new Error('Cannot delete employee: No auth_user_id found in users table');
      }

      // Step 3: Delete from employees table (cascades to related records)
      console.log('👷 Step 3: Deleting from employees table...');
      await fetch(`${SUPABASE_URL}/rest/v1/employees?user_id=eq.${employeeId}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      console.log('✅ Step 3 Complete: Deleted from employees');

      // Step 4: Delete from profiles table
      console.log('📝 Step 4: Deleting from profiles table...');
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${employeeId}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      console.log('✅ Step 4 Complete: Deleted from profiles');

      // Step 5: Delete from users table (main record)
      console.log('👔 Step 5: Deleting from users table...');
      await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${employeeId}&company_id=eq.${user.company_id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      console.log('✅ Step 5 Complete: Deleted from users');

      console.log('🎉 ========== EMPLOYEE DELETION COMPLETE ==========');
      showAlert('success', `✅ Employee ${employeeEmail} deleted successfully from all systems!`);
      loadEmployees(); // Refresh the list

    } catch (error) {
      console.error('❌ Error deleting employee:', error);
      showAlert('error', `Failed to delete employee: ${error.message}`);
    }
  };

  const editEmployee = async (employee) => {
    console.log('📝 Editing employee:', employee);
    setEditingEmployee(employee);
    setFormData({
      email: employee.email || 'N/A',
      full_name: employee.full_name || '',
      phone_number: employee.phone || '', // ✅ FIX: employee.phone, not employee.phone_number
      role: employee.role || 'employee',
      is_schedulable: employee.is_schedulable !== undefined ? employee.is_schedulable : true // ✅ NEW: Load schedulable status
    });
    console.log('📝 Form data set:', {
      email: employee.email,
      full_name: employee.full_name,
      phone: employee.phone,
      role: employee.role
    });

    // ✅ REMOVED: user_permissions table doesn't exist yet
    // Set default permissions based on role for now
    setEditingPermissions({
      can_view_quotes: false,
      can_create_jobs: false,
      can_access_customers: false,
      can_edit_documents: false,
      can_manage_employees: false,
      can_access_settings: false,
      can_manage_permissions: false,
      can_access_scheduling: false,
      can_access_documents: false,
      can_access_quotes: false,
      can_access_invoices: false,
      can_access_employees: false,
      can_access_reports: false
    });

    // Load employee row id and skills for editing
    try {
      const empRowRes = await fetch(`${SUPABASE_URL}/rest/v1/employees?user_id=eq.${employee.id}&company_id=eq.${user.company_id}&select=id`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });
      if (empRowRes.ok) {
        const rows = await empRowRes.json();
        const row = rows && rows[0];
        if (row?.id) {
          setEditingEmployeeRowId(row.id);
          const esRes = await fetch(`${SUPABASE_URL}/rest/v1/employee_skills?employee_id=eq.${row.id}&select=skill_id,level`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
          });
          if (esRes.ok) {
            const list = await esRes.json();
            const mapped = (list || []).map(r => ({ skill_id: r.skill_id, level: r.level ?? 1 }));
            setEditingEmployeeSkills(mapped);
            setOriginalEmployeeSkills(mapped);
          } else {
            setEditingEmployeeSkills([]);
            setOriginalEmployeeSkills([]);
          }
        }
      }
    } catch (e) {
      console.warn('Failed loading employee skills', e);
      setEditingEmployeeRowId(null);
      setEditingEmployeeSkills([]);
      setOriginalEmployeeSkills([]);
    }

    }

    setShowEditForm(true);
  };

  const updateEmployee = async (e) => {
    e.preventDefault();

    const { email, full_name, phone_number, role, is_schedulable } = formData;

    // Validation
    if (!email || !full_name || !role) {
      showAlert('error', 'Please fill in email, full name, and role');
      return;
    }

    setFormLoading(true);

    try {
      // ✅ FIX: Update users table - split full_name into first_name and last_name
      const nameParts = full_name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userData = {
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: phone_number || null,
        role: role
      };

      const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${editingEmployee.id}&company_id=eq.${user.company_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(userData)
      });

      if (!dbResponse.ok) {
        const dbError = await dbResponse.json();
        throw new Error(`Failed to update employee: ${dbError.message || 'Unknown error'}`);
      }

      console.log(`✅ Employee user data updated successfully`);

      // ✅ NEW: Update employees table with is_schedulable
      const employeeData = {
        is_schedulable: is_schedulable
      };

      const employeeResponse = await fetch(`${SUPABASE_URL}/rest/v1/employees?user_id=eq.${editingEmployee.id}&company_id=eq.${user.company_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(employeeData)
      });

      if (!employeeResponse.ok) {
        const empError = await employeeResponse.json();
        console.warn(`⚠️ Failed to update employee schedulable status: ${empError.message}`);
        // Don't fail the whole process, just warn
      } else {
        console.log(`✅ Employee schedulable status updated successfully`);
      }

      // ✅ REMOVED: user_permissions table doesn't exist yet
      // Permissions are managed through role-based access control in the users table
      // Future: Implement granular permissions system when needed

      // Success!
      showAlert('success', `✅ Employee updated successfully!`);
      setFormData({ email: '', full_name: '', phone_number: '', role: 'employee' });
      setEditingPermissions({
        can_view_quotes: false,
        can_create_jobs: false,
        can_access_customers: false,
        can_edit_documents: false,
        can_manage_employees: false,
        can_access_settings: false,
        can_manage_permissions: false,
        can_access_scheduling: false,
        can_access_documents: false,
        can_access_quotes: false,
        can_access_invoices: false,
        can_access_employees: false,
        can_access_reports: false
      });
      setShowEditForm(false);
      setEditingEmployee(null);
      loadEmployees(); // Refresh the list

    } catch (error) {
      console.error('Error updating employee:', error);
      showAlert('error', error.message);
    } finally {
      setFormLoading(false);

      // Phase 1: Save employee skills (diff-based)
      try {
        if (editingEmployeeRowId != null) {
          const currentIds = new Set((editingEmployeeSkills || []).map(s => s.skill_id));
          const originalIds = new Set((originalEmployeeSkills || []).map(s => s.skill_id));
          const toDelete = [...originalIds].filter(id => !currentIds.has(id));
          const toUpsert = (editingEmployeeSkills || []).map(s => ({ employee_id: editingEmployeeRowId, skill_id: s.skill_id, level: s.level ?? 1 }));

          if (toDelete.length > 0) {
            const idsCsv = toDelete.join(',');
            await fetch(`${SUPABASE_URL}/rest/v1/employee_skills?employee_id=eq.${editingEmployeeRowId}&skill_id=in.(${idsCsv})`, {
              method: 'DELETE',
              headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
          }

          if (toUpsert.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/employee_skills`, {
              method: 'POST',
              headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=representation' },
              body: JSON.stringify(toUpsert)
            });
          }
        }
      } catch (e) {
        console.warn('⚠️ Failed to save employee skills', e);
      }

    }
  };

  const handleEditPermissionToggle = (permission) => {
    setEditingPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  // OLD loadPTORequests function removed - using new PTO tab system

  // Handle enhanced PTO request submission
  const handleNewPTOSubmit = async (ptoData) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/pto_requests`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ptoData)
      });

      if (response.ok) {
        showAlert('success', 'PTO request submitted successfully!');
        // loadPTORequests(); // REMOVED - using new PTO tab system
      } else {
        showAlert('error', 'Failed to submit PTO request');
      }
    } catch (error) {
      console.error('Error submitting PTO request:', error);
      showAlert('error', 'Failed to submit PTO request');
    }
  };



  // Handle PTO request submission (legacy)
  const handlePTOSubmit = async (ptoData) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_time_off`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_id: user.company_id,
          employee_id: ptoData.employeeId,
          kind: ptoData.kind,
          starts_at: new Date(ptoData.startsAt).toISOString(),



          ends_at: new Date(ptoData.endsAt).toISOString(),
          note: ptoData.note || null,
          created_by: user.id,
          status: 'APPROVED'
        })
      });

      if (response.ok) {
        console.log('✅ Time off request submitted successfully!');
        // loadPTORequests(); // REMOVED - using new PTO tab system
        window.alert && window.alert('Time off request submitted successfully!');
      } else {



        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting PTO:', error);
      throw error;
    }
  };



  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Team Members"
        subtitle="Manage your team, track performance, and handle time off requests"
        icon={UserGroupIcon}
        gradient="indigo"
        stats={[
          { label: 'Total', value: analytics.totalEmployees },
          { label: 'Active', value: analytics.activeEmployees },
          { label: 'Pending', value: analytics.pendingInvites }
        ]}
        actions={[
          {
            label: 'Invite Employee',
            icon: EnvelopeIcon,
            onClick: () => setShowInviteModal(true)
          },
          {
            label: 'Add Employee',
            icon: PlusIcon,
            onClick: () => setShowCreateForm(true)
          }
        ]}
      />

      {/* Team Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernStatCard
          title="Active Team"
          value={analytics.activeEmployees}
          icon={UserGroupIcon}
          gradient="blue"
          onClick={() => setStatusFilter('active')}

        />

        <ModernStatCard
          title="Pending Invites"
          value={analytics.pendingInvites}
          icon={EnvelopeIcon}
          gradient="orange"
          onClick={() => setShowInviteModal(true)}

        />

        <ModernStatCard
          title="PTO Requests"
          value={analytics.ptoRequestsCount}
          icon={CalendarDaysIcon}
          gradient="green"
          onClick={() => setActiveTab('pto')}

        />

        <ModernStatCard
          title="Team Utilization"
          value="87%"
          icon={ChartBarIcon}
          gradient="purple"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('employees')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'employees'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Team Members
              </div>
            </button>



            {/* Admin-only PTO tabs */}
            {(user?.role === 'owner' || user?.role === 'admin') && (
              <>
                <button
                  onClick={() => setActiveTab('pto-management')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pto-management'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    PTO Management
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('pto-history')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pto-history'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4" />
                    PTO History
                  </div>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-md ${
          alert.type === 'success' ? 'bg-green-100 text-green-700' :
          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          alert.type === 'info' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          <pre className="whitespace-pre-wrap font-sans">{alert.message}</pre>
        </div>
      )}

      {/* Temp Password Alert */}
      {tempPasswordAlert.show && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Employee Created Successfully!</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-green-800">📧 Email:</p>
                  <p className="text-base text-green-900 font-mono bg-white px-3 py-2 rounded border border-green-200">{tempPasswordAlert.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">🔑 Temporary Password:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl text-green-900 font-mono bg-white px-3 py-2 rounded border border-green-200 flex-1 select-all">{tempPasswordAlert.password}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tempPasswordAlert.password);
                        showAlert('success', '✅ Password copied to clipboard!', 2000);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ IMPORTANT:</strong> Copy this password and give it to the employee. They can login immediately and should change it on first login. This alert will disappear in 30 seconds.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setTempPasswordAlert({ show: false, email: '', password: '' })}
              className="flex-shrink-0 text-green-600 hover:text-green-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Analytics Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{analytics.totalEmployees}</div>
              <div className="text-sm text-gray-500">Total Employees</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircleIconSolid className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{analytics.activeEmployees}</div>
              <div className="text-sm text-gray-500">Active Employees</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <UserPlusIcon className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{analytics.pendingInvites}</div>
              <div className="text-sm text-gray-500">Pending Invites</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CalendarDaysIcon className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{analytics.ptoRequestsCount}</div>
              <div className="text-sm text-gray-500">PTO Requests</div>
            </div>
          </div>
        </div>
      </div>



      {/* Create Employee Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 overflow-y-auto">
          <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Add New Employee</h3>
                <p className="text-primary-100 text-sm">Set up employee details and permissions</p>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-primary-100 hover:text-white p-2 rounded-full hover:bg-primary-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={createEmployee} className="flex-1 flex flex-col">
              {/* Main Content Area */}
              <div className="flex-1 p-6 space-y-8">

                {/* Top Half - Contact Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="employee@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role *
                      </label>
                      <select
                        required
                        value={formData.role}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          setFormData({...formData, role: newRole});
                          // ✅ Auto-update permissions based on role
                          setNewEmployeePermissions(getDefaultPermissions(newRole));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {getAvailableRoles().map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Permissions will be automatically set based on role (you can customize them below)
                      </p>
                    </div>

                    {/* ✅ NEW: Schedulable Toggle */}
                    <div className="md:col-span-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.is_schedulable}
                              onChange={(e) => setFormData({...formData, is_schedulable: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Available for Scheduling
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {formData.is_schedulable ? (
                                <span className="text-green-700">✅ This employee will appear in scheduling dropdowns and calendar</span>
                              ) : (
                                <span className="text-orange-700">⚠️ This employee will NOT appear in scheduling (office staff, admin, etc.)</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              <strong>Enable for:</strong> Field technicians, installers, owner-operators<br/>
                              <strong>Disable for:</strong> Office managers, bookkeepers, dispatchers, admin staff
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Half - Module Access */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Module Access
                  </h4>

                  {/* ✅ NEW: Organized by category */}
                  <div className="space-y-6">
                    {Object.entries({
                      Core: Object.values(EMPLOYEE_MODULES).filter(m => m.category === 'Core'),
                      Sales: Object.values(EMPLOYEE_MODULES).filter(m => m.category === 'Sales'),
                      HR: Object.values(EMPLOYEE_MODULES).filter(m => m.category === 'HR'),
                      Finance: Object.values(EMPLOYEE_MODULES).filter(m => m.category === 'Finance'),
                      Operations: Object.values(EMPLOYEE_MODULES).filter(m => m.category === 'Operations'),
                      Admin: Object.values(EMPLOYEE_MODULES).filter(m => m.category === 'Admin')
                    }).map(([category, modules]) => (
                      <div key={category}>
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">{category}</h5>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {modules.map(module => (
                            <div key={module.key} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newEmployeePermissions[module.key] || false}
                                  onChange={() => handlePermissionToggle(module.key)}
                                  className="sr-only peer"
                                />
                                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                              </label>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{module.label}</div>
                                <div className="text-xs text-gray-500">{module.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Fill in employee details and set their permissions
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={formLoading}
                  >
                    {formLoading ? 'Creating Employee...' : 'Create Employee'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditForm && editingEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Employee</h3>

            <form onSubmit={updateEmployee}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="employee@company.com"
                  />
                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {getAvailableRoles().map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ✅ NEW: Schedulable Toggle */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_schedulable}
                        onChange={(e) => setFormData({...formData, is_schedulable: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Available for Scheduling
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {formData.is_schedulable ? (
                          <span className="text-green-700">✅ This employee will appear in scheduling dropdowns and calendar</span>
                        ) : (
                          <span className="text-orange-700">⚠️ This employee will NOT appear in scheduling (office staff, admin, etc.)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        <strong>Enable for:</strong> Field technicians, installers, owner-operators<br/>
                        <strong>Disable for:</strong> Office managers, bookkeepers, dispatchers, admin staff
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills (Phase 1) */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Skills</h4>
                  <SkillsPicker
                    value={editingEmployeeSkills}
                    onChange={setEditingEmployeeSkills}
                    showLevel={true}
                    showQuantity={false}
                    allowCreate={true}
                  />
                  <div className="text-xs text-gray-500 mt-2">Skills are used by Smart Scheduling to match required job skills and levels</div>
                </div>


                {/* Permissions Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Permissions</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {[
                      { key: 'can_view_quotes', label: 'View Quotes', description: 'Can view and access quote information' },
                      { key: 'can_create_jobs', label: 'Create Jobs', description: 'Can create and manage job entries' },
                      { key: 'can_access_customers', label: 'Access Customers', description: 'Can view and manage customer information' },
                      { key: 'can_edit_documents', label: 'Edit Documents', description: 'Can create and edit documents' },
                      { key: 'can_manage_employees', label: 'Manage Employees', description: 'Can add, edit, and manage employee accounts' },
                      { key: 'can_access_settings', label: 'Access Settings', description: 'Can access company settings and configuration' },
                      { key: 'can_manage_permissions', label: 'Manage Permissions', description: 'Can modify other users\' permissions' },


                      { key: 'can_access_scheduling', label: 'Access Scheduling', description: 'Can access the scheduling section' },
                      { key: 'can_access_documents', label: 'Access Documents', description: 'Can access the documents section' },
                      { key: 'can_access_quotes', label: 'Access Quotes', description: 'Can access the quotes section' },
                      { key: 'can_access_invoices', label: 'Access Invoices', description: 'Can access the invoices section' },
                      { key: 'can_access_employees', label: 'Access Employees', description: 'Can access the employees section' },
                      { key: 'can_access_reports', label: 'Access Reports', description: 'Can access the reports section' }
                    ].map(permission => (
                      <div key={permission.key} className="flex items-start gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPermissions[permission.key]}
                            onChange={() => handleEditPermissionToggle(permission.key)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{permission.label}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingEmployee(null);
                    setFormData({ email: '', full_name: '', phone_number: '', role: 'employee' });
                  }}
                  className="btn-secondary"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Updating...' : 'Update Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'employees' && (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="technician">Technician</option>
              <option value="office_staff">Office Staff</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending Invite</option>
            </select>
          </div>

	        <div className="px-6 py-2 border-b border-gray-100">
	          <div className="flex items-center gap-2">
	            <button
	              onClick={async ()=>{
	                const ids = Array.from(selectedIds);
	                if (!ids.length) return showAlert('info','Select employees first');
	                try {
	                  await Promise.all(ids.map(id => fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${SUPABASE_ANON_KEY}` }, body: JSON.stringify({ status:'active', active:true }) })));
	                  showAlert('success', 'Activated selected employees');

	            {/* Bulk role update */}
	            <div className="flex items-center gap-2 ml-4">
	              <select id="bulkRole" className="px-2 py-1 border rounded text-sm">
	                {getAvailableRoles().map(r => (<option key={r.value} value={r.value}>{r.label}</option>))}
	              </select>
	              <button
	                className={`btn-secondary ${selectedIds.size===0?'opacity-50 cursor-not-allowed':''}`}
	                disabled={selectedIds.size===0}
	                onClick={async ()=>{
	                  const selectEl = document.getElementById('bulkRole');
	                  const newRole = selectEl?.value;
	                  const ids = Array.from(selectedIds);
	                  if (!ids.length || !newRole) return;
	                  try {
	                    await Promise.all(ids.map(id => fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
	                      method: 'PATCH', headers: { 'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${SUPABASE_ANON_KEY}`, 'Prefer':'return=minimal' },
	                      body: JSON.stringify({ role: newRole })
	                    })));
	                    showAlert('success', `Updated role for ${ids.length} employee${ids.length>1?'s':''}`);
	                    setEmployees(prev => prev.map(e => selectedIds.has(e.id) ? { ...e, role: newRole } : e));
	                    setSelectedIds(new Set());
	                  } catch(e) { console.error(e); showAlert('error','Failed to update roles'); }
	                }}
	              >Apply Role</button>
	            </div>

	                  setSelectedIds(new Set());
	                  loadEmployees();
	                } catch(e) { showAlert('error','Failed to activate some employees'); }
	              }}
	              className={`btn-secondary ${selectedIds.size===0?'opacity-50 cursor-not-allowed':''}`}
	              disabled={selectedIds.size===0}
	            >Activate</button>
	            <button
	              onClick={async ()=>{
	                const ids = Array.from(selectedIds);
	                if (!ids.length) return showAlert('info','Select employees first');
	                try {
	                  await Promise.all(ids.map(id => fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${SUPABASE_ANON_KEY}` }, body: JSON.stringify({ status:'inactive', active:false }) })));
	                  showAlert('success', 'Deactivated selected employees');
	                  setSelectedIds(new Set());
	                  loadEmployees();
	                } catch(e) { showAlert('error','Failed to deactivate some employees'); }
	              }}
	              className={`btn-secondary ${selectedIds.size===0?'opacity-50 cursor-not-allowed':''}`}
	              disabled={selectedIds.size===0}
	            >Deactivate</button>
	          </div>
	        </div>

        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {filteredEmployees.length} employees found
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <div className="text-sm text-gray-500">
              {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading employees...</div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 mb-2">No employees found</div>
            <div className="text-sm text-gray-400">Add your first team member to get started</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3"><input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} /></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={()=>setSortBy(s=>({ key:'name', dir: s.key==='name' && s.dir==='asc' ? 'desc':'asc' }))}>
                    Employee{sortBy.key==='name' ? (sortBy.dir==='asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={()=>setSortBy(s=>({ key:'role', dir: s.key==='role' && s.dir==='asc' ? 'desc':'asc' }))}>
                    Role{sortBy.key==='role' ? (sortBy.dir==='asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={()=>setSortBy(s=>({ key:'phone', dir: s.key==='phone' && s.dir==='asc' ? 'desc':'asc' }))}>
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={()=>setSortBy(s=>({ key:'status', dir: s.key==='status' && s.dir==='asc' ? 'desc':'asc' }))}>
                    Status{sortBy.key==='status' ? (sortBy.dir==='asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={()=>setSortBy(s=>({ key:'created_at', dir: s.key==='created_at' && s.dir==='asc' ? 'desc':'asc' }))}>
                    Joined{sortBy.key==='created_at' ? (sortBy.dir==='asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedEmployees.map((employee) => {
                  const statusBadge = getStatusBadge(employee);
                  return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-3"><input type="checkbox" checked={selectedIds.has(employee.id)} onChange={()=>toggleRow(employee.id)} /></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700">
                              {getInitials(employee.full_name)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <button type="button" onClick={()=>openDetailPanel(employee)} className="text-primary-700 hover:underline">
                              {employee.full_name || 'N/A'}
                            </button>
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(employee.role)}`}>
                          {getRoleDisplayName(employee.role)}
                        </span>
                        {/* ✅ NEW: Schedulable badge */}
                        {employee.is_schedulable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Schedulable
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Office Only
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.phone || '-'}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{employee.created_at ? new Date(employee.created_at).toLocaleDateString() : '-'}</div>
                        <div className="text-xs text-gray-400">{getTimeSinceJoined(employee.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{employee.phone || '-'}</div>
                        {employee.phone && (
                          <a href={`tel:${employee.phone}`} className="text-xs text-primary-600 hover:text-primary-800">
                            Call
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => editEmployee(employee)}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded"
                            title="Edit employee"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          {(employee.status === 'active' || employee.active) && (
                            <button
                              onClick={() => handleDeactivateEmployee(employee.id)}
                              className="text-orange-600 hover:text-orange-900 p-1 rounded"
                              title="Deactivate employee"
                            >
                              <EyeSlashIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleResetPassword(employee.id, employee.email)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Reset password"
                          >
                            <KeyIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteEmployee(employee.id, employee.email)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete employee"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OLD TIME OFF SECTION REMOVED - Now using proper PTO tabs above */}


	      {/* Employee Detail Slide-over */}
	      {showDetailPanel && detailEmployee && (
	        <div className="fixed inset-0 z-50 flex">
	          <div className="fixed inset-0 bg-black/30" onClick={closeDetailPanel} />
	          <div className="ml-auto h-full w-full max-w-md bg-white shadow-xl overflow-y-auto">
	            <div className="p-4 border-b flex items-center justify-between">
	              <div className="flex items-center gap-3">
	                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
	                  <span className="text-sm font-medium text-primary-700">{getInitials(detailEmployee.full_name)}</span>
	                </div>
	                <div>
	                  <div className="text-base font-semibold text-gray-900">{detailEmployee.full_name || 'N/A'}</div>
	                  <div className="text-sm text-gray-500">{detailEmployee.email}</div>
	                </div>
	              </div>
	              <button onClick={closeDetailPanel} className="text-gray-500 hover:text-gray-700">✕</button>
	            </div>
	            <div className="p-4 space-y-4">
	              <div>
	                <div className="text-xs text-gray-500 mb-1">Role</div>
	                <div className="flex items-center gap-2">
	                  <select value={detailRole} onChange={(e)=>setDetailRole(e.target.value)} className="px-2 py-1 border rounded text-sm">
	                    {getAvailableRoles().map(r => (
	                      <option key={r.value} value={r.value}>{r.label}</option>
	                    ))}
	                  </select>
	                  <button onClick={saveDetailRole} disabled={savingRole || detailRole===detailEmployee.role} className={`btn-secondary ${savingRole || detailRole===detailEmployee.role ? 'opacity-50 cursor-not-allowed':''}`}>Save</button>
	                </div>
	              </div>

	              {detailEmployee.status==='pending_invite' && (
	                <div>
	                  <div className="text-xs text-gray-500 mb-1">Invitation</div>
	                  <div className="flex items-center gap-2">
	                    <button onClick={resendInvite} className="btn-secondary">Copy invite link</button>
	                    <button onClick={()=>handleActivateEmployee(detailEmployee.id)} className="btn-secondary">Mark as Active</button>
	                  </div>
	                </div>
	              )}

	              <div>
	                <div className="text-xs text-gray-500 mb-1">Status</div>
	                {(() => { const s = getStatusBadge(detailEmployee); return (<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${s.bg} ${s.text}`}>{s.label}</span>); })()}
	              </div>
	              <div>
	                <div className="text-xs text-gray-500 mb-1">Phone</div>
	                <div className="flex items-center gap-2">
	                  <input value={detailPhone} onChange={(e)=>setDetailPhone(e.target.value)} className="px-2 py-1 border rounded text-sm flex-1" placeholder="(555) 123-4567" />
	                  <button onClick={saveDetailPhone} disabled={savingPhone} className={`btn-secondary ${savingPhone ? 'opacity-50 cursor-not-allowed':''}`}>Save</button>
	                </div>
	              </div>
	              <div>
	                <div className="text-xs text-gray-500 mb-1">Joined</div>
	                <div className="text-sm text-gray-900">{detailEmployee.created_at ? new Date(detailEmployee.created_at).toLocaleDateString() : '-'}</div>
	                <div className="text-xs text-gray-400">{getTimeSinceJoined(detailEmployee.created_at)}</div>
	              </div>
	              <div>
	                <div className="text-xs text-gray-500 mb-2">Permissions</div>
	                {detailPermissions ? (
	                  <div className="grid grid-cols-2 gap-2 text-xs">
	                    {Object.entries(detailPermissions).filter(([k])=>k.startsWith('can_')).map(([k,v])=> (
	                      <div key={k} className="flex items-center gap-2">
	                        <span className={`inline-block w-2 h-2 rounded-full ${v?'bg-green-500':'bg-gray-300'}`} />
	                        <span className="text-gray-700">{k.replaceAll('_',' ').replace('can ','can ')}</span>
	                      </div>
	                    ))}
	                  </div>
	                ) : (
	                  <div className="text-xs text-gray-500">No permissions record</div>
	                )}
	              </div>
	              <div className="pt-2 flex gap-2">
	                <button onClick={()=>{ editEmployee(detailEmployee); closeDetailPanel(); }} className="btn-secondary">Edit</button>
	                {(detailEmployee.status==='active' || detailEmployee.active) ? (
	                  <button onClick={()=>{ handleDeactivateEmployee(detailEmployee.id); closeDetailPanel(); }} className="btn-secondary">Deactivate</button>
	                ) : null}
	              </div>
	            </div>
	          </div>
	        </div>
	      )}
        </>
      )}



      {/* PTO Management Tab */}
      {activeTab === 'pto-management' && (
        <PTOManagement />
      )}

      {/* PTO History Tab */}
      {activeTab === 'pto-history' && (
        <PTOHistoryView />
      )}

      {/* Invite Modal */}
      <EmployeeInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />

      {/* PTO Request Modal (Legacy) */}
      <PTORequestModal
        isOpen={showPTOModal}
        onClose={() => setShowPTOModal(false)}
        onSubmit={handlePTOSubmit}
        employees={employees}
      />

      {/* Enhanced PTO Request Modal */}
      <PTORequestModalNew
        isOpen={showNewPTOModal}
        onClose={() => setShowNewPTOModal(false)}
        onSubmit={handleNewPTOSubmit}
      />
    </div>
  );
};

export default Employees;
