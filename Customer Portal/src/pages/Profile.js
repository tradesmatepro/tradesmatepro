import React, { useEffect, useState } from 'react';
import { useCustomer } from '../contexts/CustomerContext';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { customer } = useCustomer();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: Save profile changes
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>
      {/* Appearance (Theme) */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
        <p className="text-sm text-gray-600 mb-4">Choose your display theme. "System" follows your device preference.</p>
        <AppearanceSelector />
      </div>


      {/* Profile Information */}
      <div className="card-modern p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? 'btn-secondary' : 'btn-primary'}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <UserCircleIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Phone Number</label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Service Address</label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Notifications */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Email Updates</h4>
              <p className="text-sm text-gray-600">Receive updates about appointments and invoices</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              defaultChecked
              disabled
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Text Reminders</h4>
              <p className="text-sm text-gray-600">Get text reminders before appointments</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              defaultChecked
              disabled
            />
          </div>
        </div>

// Inline Appearance selector component for Customer Portal Profile page
const AppearanceSelector = () => {
  const { customer, supabase } = useCustomer();
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState('system');

  // Initialize from localStorage (same key used across apps)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setValue(stored);
      } else {
        setValue('system');
      }
    } catch {}
  }, []);

  const applyTheme = (mode) => {
    try {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = mode === 'dark' ? true : (mode === 'light' ? false : prefersDark);
      const root = document.documentElement;
      if (isDark) root.classList.add('dark'); else root.classList.remove('dark');
      try { root.style.colorScheme = isDark ? 'dark' : 'light'; } catch(e){}
      localStorage.setItem('theme', mode);
      window.dispatchEvent(new CustomEvent('trademate:set-theme', { detail: { themeMode: mode } }));
    } catch (e) {
      console.warn('Failed to apply theme', e);
    }
  };

  const tryPersistToAccount = async (mode) => {
    if (!customer?.id) return;
    setSaving(true);
    try {
      // Check if a preferences column exists; if not, skip without error
      const check = await supabase
        .from('customer_portal_accounts')
        .select('id, preferences')
        .eq('id', customer.id)
        .single();
      if (check.error || !check.data) return; // Column may not exist; silently skip
      const currentPrefs = check.data.preferences || {};
      const newPrefs = { ...currentPrefs, theme: mode };
      await supabase
        .from('customer_portal_accounts')
        .update({ preferences: newPrefs, updated_at: new Date().toISOString() })
        .eq('id', customer.id);
    } catch (e) {
      // Non-fatal; localStorage still persists locally
      console.warn('Theme preference not persisted to server (non-fatal):', e);
    } finally {
      setSaving(false);
    }
  };

  const onChange = async (mode) => {
    setValue(mode);
    applyTheme(mode);
    await tryPersistToAccount(mode);
  };

  return (
    <div className="inline-flex items-center gap-3">
      {['system','light','dark'].map((opt) => (
        <label key={opt} className={`px-3 py-2 rounded-md cursor-pointer border ${value===opt? 'bg-blue-50 border-blue-300 text-blue-700':'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
          <input type="radio" name="portal-theme" className="mr-2" checked={value===opt} onChange={() => onChange(opt)} disabled={saving} />
          {opt.charAt(0).toUpperCase()+opt.slice(1)}
        </label>
      ))}
    </div>
  );
};


        <p className="text-sm text-gray-500 mt-4">
          Notification preferences will be available in the full version.
        </p>
      </div>
    </div>
  );
};

export default Profile;
