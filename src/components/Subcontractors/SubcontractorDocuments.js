// Subcontractor Documents - Upload and manage documents
import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const SubcontractorDocuments = ({ subcontractorId, onDocumentUpdate }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [subcontractorId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subcontractors/${subcontractorId}/documents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (documentData) => {
    try {
      setUploading(true);
      const response = await fetch(`/api/subcontractors/${subcontractorId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(documentData)
      });
      
      if (response.ok) {
        setShowUploadForm(false);
        loadDocuments();
        if (onDocumentUpdate) onDocumentUpdate();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploading(false);
    }
  };

  const getDocumentStatus = (doc) => {
    if (doc.expired) {
      return {
        status: 'expired',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: ExclamationTriangleIcon,
        message: 'Expired'
      };
    }
    
    if (doc.expiration_date) {
      const daysUntilExpiry = Math.ceil((new Date(doc.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 30) {
        return {
          status: 'expiring',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
          icon: ExclamationTriangleIcon,
          message: `Expires in ${daysUntilExpiry} days`
        };
      }
    }
    
    return {
      status: 'valid',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      icon: CheckCircleIcon,
      message: 'Valid'
    };
  };

  const documentTypes = [
    'W9',
    'Insurance',
    'License',
    'Certification',
    'Contract',
    'Other'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
        <button
          onClick={() => setShowUploadForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload your required documents to maintain compliance.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload First Document
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const status = getDocumentStatus(doc);
            const StatusIcon = status.icon;
            
            return (
              <div key={doc.id} className={`rounded-lg border-2 p-6 ${status.bgColor}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-gray-600" />
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{doc.doc_type}</h3>
                      <p className="text-sm text-gray-600">
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusIcon className={`h-5 w-5 ${status.color}`} />
                </div>
                
                <div className="mt-4">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color} bg-white`}>
                    {status.message}
                  </div>
                </div>
                
                {doc.expiration_date && (
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    <span>Expires: {new Date(doc.expiration_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => window.open(doc.file_url, '_blank')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <UploadDocumentForm
          onSubmit={handleUpload}
          onCancel={() => setShowUploadForm(false)}
          uploading={uploading}
          documentTypes={documentTypes}
        />
      )}
    </div>
  );
};

// Upload Document Form Component
const UploadDocumentForm = ({ onSubmit, onCancel, uploading, documentTypes }) => {
  const [formData, setFormData] = useState({
    doc_type: '',
    file_url: '',
    expiration_date: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                value={formData.doc_type}
                onChange={(e) => setFormData(prev => ({ ...prev, doc_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select document type</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File URL *
              </label>
              <input
                type="url"
                value={formData.file_url}
                onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/document.pdf"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Upload your file to cloud storage and paste the URL here
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubcontractorDocuments;
