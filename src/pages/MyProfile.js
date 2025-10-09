import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import PageHeader from '../components/Common/PageHeader';
import { getInitials } from '../utils/avatarUtils';
import { getRoleDisplayName, getRoleBadgeColor } from '../utils/roleUtils';
import { SUPABASE_URL } from '../utils/env';
import { supabase } from '../utils/supabaseClient';

import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  CameraIcon,
  CreditCardIcon,
  ClockIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  BellIcon,
  CogIcon,
  BanknotesIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BriefcaseIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const MyProfile = () => {
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [employeeData, setEmployeeData] = useState(null);
  const [compensationData, setCompensationData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Info (INDUSTRY STANDARD: first_name + last_name)
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || user?.phone_number || '',
    address_line_1: user?.address_line_1 || '',
    city: user?.city || '',
    state_province: user?.state_province || '',
    postal_code: user?.postal_code || '',
    date_of_birth: user?.date_of_birth || '',
    emergency_contact_name: user?.emergency_contact_name || '',
    emergency_contact_phone: user?.emergency_contact_phone || '',
    emergency_contact_relationship: user?.emergency_contact_relationship || '',

    // Work Info (read-only for employees)
    role: user?.role || '',
    department: user?.department || '',
    employee_id: user?.employee_id || '',
    hire_date: user?.hire_date || '',
    status: user?.status || 'active',
    pto_balance_hours: user?.pto_balance_hours || 0,
    certifications: user?.certifications || [],

    // Preferences
    timezone: user?.timezone || 'America/Los_Angeles',
    language: user?.language || 'en',
    notification_preferences: user?.notification_preferences || {
      email: true,
      sms: false,
      push: true,
      job_updates: true,
      schedule_changes: true,
      timesheet_reminders: true,
      pto_updates: true
    }
  });

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: UserIcon },
    { id: 'work', name: 'Work Info', icon: BanknotesIcon },
    { id: 'skills', name: 'Skills & Certifications', icon: AcademicCapIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon }
  ];

  // Load comprehensive employee data
  useEffect(() => {
    console.log('🔍 MyProfile useEffect triggered, user:', user);
    if (user?.user_id) {
      console.log('✅ MyProfile: user.user_id exists:', user.user_id);
      loadEmployeeData();
      loadCompensationData();
    } else {
      console.warn('⚠️ MyProfile: user.user_id is missing!', user);
    }
  }, [user?.user_id]);

  const loadEmployeeData = async () => {
    try {
      console.log('🔍 MyProfile: Loading profile for user_id:', user.user_id);

      // INDUSTRY STANDARD: Load from users table (all employee data)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          profiles (
            avatar_url,
            preferences,
            timezone,
            language,
            notification_preferences
          )
        `)
        .eq('id', user.user_id)
        .single();

      if (userError) {
        console.error('❌ MyProfile: Error loading user data:', userError);
        return;
      }

      // Combine user data with profile preferences
      const profileData = {
        ...userData,
        avatar_url: userData.profiles?.avatar_url,
        preferences: userData.profiles?.preferences,
        timezone: userData.profiles?.timezone,
        language: userData.profiles?.language,
        notification_preferences: userData.profiles?.notification_preferences
      };

      if (profileData) {
        console.log('✅ MyProfile: Profile loaded:', profileData);
        setEmployeeData(profileData);
        setFormData(prev => ({
          ...prev,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone || '',
          address_line_1: profileData.address_line_1 || '',
          city: profileData.city || '',
          state_province: profileData.state_province || '',
          postal_code: profileData.postal_code || '',
          date_of_birth: profileData.date_of_birth || '',
          emergency_contact_name: profileData.emergency_contact_name || '',
          emergency_contact_phone: profileData.emergency_contact_phone || '',
          emergency_contact_relationship: profileData.emergency_contact_relationship || '',
          timezone: profileData.timezone || 'America/Los_Angeles',
          language: profileData.language || 'en',
          notification_preferences: profileData.notification_preferences || prev.notification_preferences
        }));
        console.log('✅ MyProfile: formData updated');
      } else {
        console.warn('⚠️ MyProfile: No profile data returned');
      }
    } catch (error) {
      console.error('❌ MyProfile: Error loading employee data:', error);
    }
  };

  const loadCompensationData = async () => {
    try {
      // Load compensation data using Supabase client (respects RLS)
      const { data: compData, error } = await supabase
        .from('employee_compensation')
        .select('*')
        .eq('user_id', user.user_id)
        .single();

      if (error) {
        // It's OK if compensation data doesn't exist yet
        console.log('No compensation data found (this is normal):', error.message);
        return;
      }

      if (compData) {
        setCompensationData(compData);
      }
    } catch (error) {
      console.error('Error loading compensation data:', error);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // INDUSTRY STANDARD: Save to profiles table using Supabase client (respects RLS)
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        address_line_1: formData.address_line_1,
        city: formData.city,
        state_province: formData.state_province,
        postal_code: formData.postal_code,
        date_of_birth: formData.date_of_birth || null,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        timezone: formData.timezone,
        language: formData.language,
        notification_preferences: formData.notification_preferences,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.user_id);

      if (error) {
        console.error('Error updating profile:', error);
        showAlert('error', `Failed to update profile: ${error.message}`);
        return;
      }

      // Update user context with new data
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      updateUser({
        ...user,
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: fullName,
        phone: formData.phone,
        phone_number: formData.phone,
        address_line_1: formData.address_line_1,
        city: formData.city,
        state_province: formData.state_province,
        postal_code: formData.postal_code,
        timezone: formData.timezone,
        language: formData.language,
        notification_preferences: formData.notification_preferences
      });

      // Reload data to ensure consistency
      await loadEmployeeData();

      showAlert('success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert('error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showAlert('error', 'Password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);

    try {
      console.log('🔐 ========== PASSWORD CHANGE STARTED ==========');

      // Step 1: Verify current password by attempting to sign in
      console.log('🔍 Step 1: Verifying current password...');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword
      });

      if (signInError) {
        console.error('❌ Current password verification failed:', signInError);
        showAlert('error', 'Current password is incorrect');
        setPasswordLoading(false);
        return;
      }
      console.log('✅ Step 1 Complete: Current password verified');

      // Step 2: Update to new password
      console.log('🔐 Step 2: Updating to new password...');
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (updateError) {
        console.error('❌ Password update failed:', updateError);
        throw new Error(updateError.message);
      }
      console.log('✅ Step 2 Complete: Password updated successfully');

      console.log('🎉 ========== PASSWORD CHANGE COMPLETE ==========');

      // Reset form and close modal
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordModal(false);
      showAlert('success', '✅ Password changed successfully!');

    } catch (error) {
      console.error('❌ Error changing password:', error);
      showAlert('error', `Failed to change password: ${error.message}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePhotoUpload = () => {
    // TODO: Implement photo upload functionality
    showAlert('info', 'Photo upload functionality will be implemented');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and preferences"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'My Profile' }
        ]}
      />

      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-md ${
          alert.type === 'success' ? 'bg-green-100 text-green-700' :
          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          alert.type === 'info' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          {alert.message}
        </div>
      )}

      {/* Enhanced Profile Header - Competitor Beating Design */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-gray-700 via-gray-800 to-blue-900 px-6 py-8 relative overflow-hidden">
          {/* Background Pattern - pointer-events-none allows clicks to pass through */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-6">
              {/* Large Profile Photo */}
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center ring-4 ring-white shadow-lg">
                  <span className="text-3xl font-bold text-primary-700">
                    {getInitials(`${formData.first_name} ${formData.last_name}`.trim())}
                  </span>
                </div>
                <button
                  onClick={handlePhotoUpload}
                  className="absolute bottom-0 right-0 bg-white border-2 border-gray-300 rounded-full p-2 hover:bg-gray-50 shadow-sm"
                  title="Upload photo"
                >
                  <CameraIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Profile Summary */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{`${formData.first_name} ${formData.last_name}`.trim() || 'Employee Name'}</h1>
                <p className="text-lg text-gray-600">{formData.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getRoleBadgeColor(formData.role)}`}>
                    {getRoleDisplayName(formData.role)}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                    formData.status === 'active' ? 'bg-green-100 text-green-800' :
                    formData.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    {formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
                  </span>
                  {formData.department && (
                    <span className="text-sm text-gray-500">
                      {formData.department}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data
                      setFormData(prev => ({
                        ...prev,
                        ...employeeData
                      }));
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions - Professional Enhancement */}
            <div className="flex items-center gap-3">
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm border border-white/20">
                <ClockIcon className="w-4 h-4 inline mr-2" />
                Log Time
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm border border-white/20">
                <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
                Request PTO
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm border border-white/20">
                <BellIcon className="w-4 h-4 inline mr-2" />
                Notifications
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Dashboard - Competitor Beating Feature */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Hours This Month</p>
              <p className="text-3xl font-bold text-blue-900">--</p>
              <p className="text-xs text-blue-600 mt-1">
                {user?.role === 'employee' ? 'Track time to see hours' : 'No timesheet data'}
              </p>
            </div>
            <div className="bg-blue-200 p-3 rounded-full">
              <ClockIcon className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Projects Active</p>
              <p className="text-3xl font-bold text-gray-900">--</p>
              <p className="text-xs text-gray-600 mt-1">
                No projects assigned
              </p>
            </div>
            <div className="bg-gray-200 p-3 rounded-full">
              <BriefcaseIcon className="h-8 w-8 text-gray-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Performance</p>
              <p className="text-3xl font-bold text-slate-900">--</p>
              <p className="text-xs text-slate-600 mt-1">
                Not yet evaluated
              </p>
            </div>
            <div className="bg-slate-200 p-3 rounded-full">
              <CheckCircleIcon className="h-8 w-8 text-slate-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700 mb-1">Team Rank</p>
              <p className="text-3xl font-bold text-indigo-900">--</p>
              <p className="text-xs text-indigo-600 mt-1">
                Not yet ranked
              </p>
            </div>
            <div className="bg-indigo-200 p-3 rounded-full">
              <AcademicCapIcon className="h-8 w-8 text-indigo-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* INDUSTRY STANDARD: Separate first_name and last_name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{formData.first_name || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{formData.last_name || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center py-2">
                      <span className="text-gray-900">{formData.email}</span>
                      <span className="ml-2 text-xs text-gray-500">(Admin managed)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{formData.phone || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.date_of_birth || ''}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString() : 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address_line_1}
                        onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="123 Main Street"
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{formData.address_line_1 || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="City"
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{formData.city || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.state_province}
                        onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="State"
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{formData.state_province || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="12345"
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{formData.postal_code || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.emergency_contact_name}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="John Doe"
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{formData.emergency_contact_name || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="(555) 123-4567"
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{formData.emergency_contact_phone || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.emergency_contact_relationship}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select relationship</option>
                        <option value="spouse">Spouse</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                        <option value="child">Child</option>
                        <option value="friend">Friend</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="py-2 text-gray-900">{formData.emergency_contact_relationship || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Work Info Tab */}
          {activeTab === 'work' && (
            <div className="space-y-8">
              {/* Employment Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <BanknotesIcon className="w-5 h-5 text-gray-400" />
                  Employment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID
                    </label>
                    <div className="flex items-center py-2">
                      <span className="text-gray-900 font-mono">{formData.employee_id || 'Not assigned'}</span>
                      <span className="ml-2 text-xs text-gray-500">(Admin managed)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <div className="flex items-center py-2">
                      <span className={`inline-flex items-center px-2 py-1 text-sm font-medium rounded-full ${getRoleBadgeColor(formData.role)}`}>
                        {getRoleDisplayName(formData.role)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">(Admin managed)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <div className="flex items-center py-2">
                      <span className="text-gray-900">{formData.department || 'Not assigned'}</span>
                      <span className="ml-2 text-xs text-gray-500">(Admin managed)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hire Date
                    </label>
                    <div className="flex items-center py-2">
                      <CalendarDaysIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formData.hire_date ? new Date(formData.hire_date).toLocaleDateString() : 'Not set'}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">(Admin managed)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Status
                    </label>
                    <div className="flex items-center py-2">
                      <span className={`inline-flex items-center px-2 py-1 text-sm font-medium rounded-full ${
                        formData.status === 'active' ? 'bg-green-100 text-green-800' :
                        formData.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        formData.status === 'terminated' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">(Admin managed)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PTO Balance
                    </label>
                    <div className="flex items-center py-2">
                      <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-semibold">
                        {formData.pto_balance_hours || 0} hours
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compensation (Admin Only View) */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <BanknotesIcon className="w-5 h-5 text-gray-400" />
                  Compensation
                  <span className="text-xs text-gray-500 font-normal">(Admin access only)</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-center py-8">
                    <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-500 mb-2">Compensation Information</div>
                    <div className="text-sm text-gray-400">
                      Salary and pay information is only accessible to administrators
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                  Certifications & Licenses
                </h3>
                <div className="space-y-4">
                  {formData.certifications && formData.certifications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.certifications.map((cert, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{cert.name}</h4>
                              <p className="text-sm text-gray-600">
                                Issued by: {cert.issuer}
                              </p>
                              {cert.expiry_date && (
                                <p className="text-sm text-gray-500">
                                  Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className={`px-2 py-1 text-xs rounded-full ${
                              cert.status === 'active' ? 'bg-green-100 text-green-800' :
                              cert.status === 'expired' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {cert.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="text-center py-4">
                        <AcademicCapIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <div className="text-gray-500 mb-1">No certifications on file</div>
                        <div className="text-sm text-gray-400">
                          Contact your administrator to add certifications
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-8">
              {/* Notification Preferences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <BellIcon className="w-5 h-5 text-gray-400" />
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Communication Channels</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notification_preferences.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            notification_preferences: {
                              ...formData.notification_preferences,
                              email: e.target.checked
                            }
                          })}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">Email notifications</span>
                          <p className="text-xs text-gray-500">Receive notifications via email</p>
                        </div>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notification_preferences.sms}
                          onChange={(e) => setFormData({
                            ...formData,
                            notification_preferences: {
                              ...formData.notification_preferences,
                              sms: e.target.checked
                            }
                          })}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">SMS notifications</span>
                          <p className="text-xs text-gray-500">Receive notifications via text message</p>
                        </div>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notification_preferences.app}
                          onChange={(e) => setFormData({
                            ...formData,
                            notification_preferences: {
                              ...formData.notification_preferences,
                              app: e.target.checked
                            }
                          })}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">In-app notifications</span>
                          <p className="text-xs text-gray-500">Receive notifications within the application</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Notification Types</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notification_preferences.job_updates}
                          onChange={(e) => setFormData({
                            ...formData,
                            notification_preferences: {
                              ...formData.notification_preferences,
                              job_updates: e.target.checked
                            }
                          })}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">Job updates</span>
                          <p className="text-xs text-gray-500">New jobs, status changes, and assignments</p>
                        </div>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notification_preferences.schedule_changes}
                          onChange={(e) => setFormData({
                            ...formData,
                            notification_preferences: {
                              ...formData.notification_preferences,
                              schedule_changes: e.target.checked
                            }
                          })}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">Schedule changes</span>
                          <p className="text-xs text-gray-500">Schedule updates and time-off approvals</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                  Security Settings
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Password</h4>
                        <p className="text-sm text-gray-500">Last updated: {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Never'}</p>
                      </div>
                      <button
                        onClick={handleResetPassword}
                        className="btn-secondary text-sm flex items-center gap-2"
                      >
                        <KeyIcon className="w-4 h-4" />
                        Reset Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* App Preferences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CogIcon className="w-5 h-5 text-gray-400" />
                  App Preferences
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-center py-4">
                    <CogIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-500 mb-1">Additional Preferences</div>
                    <div className="text-sm text-gray-400">
                      Theme, language, and display preferences coming soon
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skills & Certifications Tab - Competitor Beating Feature */}
          {activeTab === 'skills' && (
            <div className="space-y-8">
              {/* Skills Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                  Technical Skills
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Core Competencies</h4>
                    <div className="text-center py-8">
                      <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="text-sm font-medium text-gray-900 mb-1">No Skills Added</h4>
                      <p className="text-sm text-gray-500">
                        Skills and competencies will be displayed here once added by your manager.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Software Proficiency</h4>
                    <div className="text-center py-8">
                      <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="text-sm font-medium text-gray-900 mb-1">No Software Skills Listed</h4>
                      <p className="text-sm text-gray-500">
                        Software proficiency levels will be displayed here once assessed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                  Certifications & Training
                </h3>
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="text-center">
                    <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 mb-1">No Certifications</h4>
                    <p className="text-sm text-gray-500">
                      Professional certifications and training records will appear here.
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Development Goals */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-gray-400" />
                  Development Goals
                </h3>
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="text-center">
                    <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 mb-1">No Development Goals Set</h4>
                    <p className="text-sm text-gray-500">
                      Professional development goals and progress tracking will appear here.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab - Advanced Analytics */}
          {activeTab === 'performance' && (
            <div className="space-y-8">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Overall Rating</p>
                      <p className="text-3xl font-bold text-blue-900">--</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Not yet rated
                      </p>
                    </div>
                    <div className="bg-blue-200 p-3 rounded-full">
                      <ChartBarIcon className="h-8 w-8 text-blue-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Goals Completed</p>
                      <p className="text-3xl font-bold text-gray-900">--</p>
                      <p className="text-xs text-gray-600 mt-1">
                        No goals set
                      </p>
                    </div>
                    <div className="bg-gray-200 p-3 rounded-full">
                      <CheckCircleIcon className="h-8 w-8 text-gray-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Peer Rating</p>
                      <p className="text-3xl font-bold text-slate-900">--</p>
                      <p className="text-xs text-slate-600 mt-1">
                        No peer reviews
                      </p>
                    </div>
                    <div className="bg-slate-200 p-3 rounded-full">
                      <UsersIcon className="h-8 w-8 text-slate-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                  Recent Achievements
                </h3>
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="text-center">
                    <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 mb-1">No Achievements Yet</h4>
                    <p className="text-sm text-gray-500">
                      Awards, recognitions, and achievements will be displayed here.
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Tracking Insights */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  Time Tracking Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-medium text-gray-900 mb-4">This Month Summary</h4>
                    <div className="text-center py-6">
                      <ClockIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        No time tracking data available for this month.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Productivity Trends</h4>
                    <div className="text-center py-6">
                      <ChartBarIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Productivity insights will appear here once you start logging time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Recognition - Social Feature */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-gray-400" />
                  Team Recognition
                </h3>
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="text-center">
                    <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 mb-1">No Team Recognition Yet</h4>
                    <p className="text-sm text-gray-500">
                      Recognition and feedback from team members will appear here.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-primary-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <KeyIcon className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Change Password</h2>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="text-white hover:text-gray-200"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Mix of uppercase and lowercase letters recommended</li>
                  <li>• Include numbers and special characters for better security</li>
                </ul>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
