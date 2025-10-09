// Subcontractor Dashboard - Main portal interface
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import SubcontractorWorkOrders from './SubcontractorWorkOrders';
import SubcontractorDocuments from './SubcontractorDocuments';
import SubcontractorTimesheets from './SubcontractorTimesheets';
import {
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const SubcontractorDashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subcontractors/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceAlerts = () => {
    if (!profile) return [];
    
    const alerts = [];
    
    if (profile.insurance_expired) {
      alerts.push({
        type: 'error',
        message: 'Insurance has expired',
        action: 'Upload new insurance certificate'
      });
    }
    
    if (profile.license_expired) {
      alerts.push({
        type: 'error',
        message: 'License has expired',
        action: 'Upload renewed license'
      });
    }
    
    // Check for expiring documents (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    profile.documents?.forEach(doc => {
      if (doc.expiration_date && new Date(doc.expiration_date) <= thirtyDaysFromNow && !doc.expired) {
        alerts.push({
          type: 'warning',
          message: `${doc.doc_type} expires soon`,
          action: 'Upload renewed document'
        });
      }
    });
    
    return alerts;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'work-orders', name: 'Work Orders', icon: ClipboardDocumentListIcon },
    { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
    { id: 'timesheets', name: 'Timesheets', icon: ClockIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const alerts = getComplianceAlerts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {profile?.name || 'Subcontractor'}
            </h1>
            <p className="text-gray-600">
              {profile?.trade} • Status: {profile?.status}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">
              {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Coming soon'}
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 ${
                alert.type === 'error' 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              <div className="flex">
                <ExclamationTriangleIcon 
                  className={`h-5 w-5 ${
                    alert.type === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`} 
                />
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    alert.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {alert.message}
                  </h3>
                  <p className={`text-sm ${
                    alert.type === 'error' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {alert.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Work Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {profile?.work_orders?.filter(wo => wo.status !== 'COMPLETED').length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Documents</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {profile?.documents?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.name || 'Coming soon'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.email || 'Coming soon'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.phone || 'Coming soon'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trade</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.trade || 'Coming soon'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.license_number || 'Coming soon'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Expiration</label>
                  <p className={`mt-1 text-sm ${profile?.license_expired ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                    {profile?.license_expiration ? new Date(profile.license_expiration).toLocaleDateString() : 'Coming soon'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'work-orders' && (
          <SubcontractorWorkOrders subcontractorId={user.id} />
        )}

        {activeTab === 'documents' && (
          <SubcontractorDocuments subcontractorId={user.id} onDocumentUpdate={loadProfile} />
        )}

        {activeTab === 'timesheets' && (
          <SubcontractorTimesheets subcontractorId={user.id} />
        )}
      </div>
    </div>
  );
};

export default SubcontractorDashboard;
