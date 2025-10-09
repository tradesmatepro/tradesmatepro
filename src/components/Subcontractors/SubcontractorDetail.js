// Subcontractor Detail - Profile view with contact info, status, trade
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const SubcontractorDetail = () => {
  const { id } = useParams();
  const [subcontractor, setSubcontractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    loadSubcontractor();
  }, [id]);

  const loadSubcontractor = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subcontractors/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubcontractor(data);
      }
    } catch (error) {
      console.error('Error loading subcontractor:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceStatus = () => {
    if (!subcontractor) return { status: 'unknown', issues: [] };
    
    const issues = [];
    
    if (subcontractor.insurance_expired) {
      issues.push('Insurance expired');
    }
    if (subcontractor.license_expired) {
      issues.push('License expired');
    }
    
    // Check for expiring documents
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    subcontractor.documents?.forEach(doc => {
      if (doc.expiration_date && new Date(doc.expiration_date) <= thirtyDaysFromNow && !doc.expired) {
        issues.push(`${doc.doc_type} expires soon`);
      }
    });
    
    return {
      status: issues.length === 0 ? 'compliant' : 'issues',
      issues
    };
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
    { id: 'work-orders', name: 'Work Orders', icon: ClipboardDocumentListIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subcontractor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Subcontractor not found</p>
      </div>
    );
  }

  const compliance = getComplianceStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xl font-medium text-gray-700">
                {subcontractor.name?.charAt(0) || 'S'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{subcontractor.name}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  subcontractor.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {subcontractor.status}
                </span>
                <span className="text-gray-600">{subcontractor.trade}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {compliance.status === 'compliant' ? (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Compliant</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">{compliance.issues.length} Issues</span>
              </div>
            )}
            
            <button
              onClick={() => {/* Coming soon - edit functionality */}}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
          </div>
        </div>

        {/* Compliance Issues */}
        {compliance.issues.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-medium text-red-800 mb-2">Compliance Issues</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {compliance.issues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

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
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-900">{subcontractor.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-sm text-gray-900">{subcontractor.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Trade</p>
                    <p className="text-sm text-gray-900">{subcontractor.trade || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* License & Insurance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">License & Insurance</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">License Number</p>
                  <p className="text-sm text-gray-900">{subcontractor.license_number || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">License Expiration</p>
                  <p className={`text-sm ${subcontractor.license_expired ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                    {subcontractor.license_expiration 
                      ? new Date(subcontractor.license_expiration).toLocaleDateString()
                      : 'Not provided'
                    }
                    {subcontractor.license_expired && ' (EXPIRED)'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Insurance Expiration</p>
                  <p className={`text-sm ${subcontractor.insurance_expired ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                    {subcontractor.insurance_expiration 
                      ? new Date(subcontractor.insurance_expiration).toLocaleDateString()
                      : 'Not provided'
                    }
                    {subcontractor.insurance_expired && ' (EXPIRED)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {subcontractor.work_orders?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total Work Orders</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {subcontractor.work_orders?.filter(wo => wo.status === 'COMPLETED').length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {subcontractor.documents?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Documents</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
            {subcontractor.documents?.length === 0 ? (
              <p className="text-gray-500">No documents uploaded</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subcontractor.documents?.map((doc) => (
                  <div key={doc.id} className={`border-2 rounded-lg p-4 ${
                    doc.expired ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{doc.doc_type}</h4>
                      {doc.expired && <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />}
                    </div>
                    <p className="text-sm text-gray-600">
                      Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                    {doc.expiration_date && (
                      <p className={`text-sm ${doc.expired ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        Expires: {new Date(doc.expiration_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'work-orders' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Work Orders</h3>
            {subcontractor.work_orders?.length === 0 ? (
              <p className="text-gray-500">No work orders assigned</p>
            ) : (
              <div className="space-y-4">
                {subcontractor.work_orders?.map((assignment) => (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {assignment.work_orders?.title || 'Work Order'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assignment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcontractorDetail;
