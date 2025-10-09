import React from 'react';
import PageHeader from '../components/Common/PageHeader';
import { useIntegrations } from '../contexts/IntegrationsContext';
import {
  CloudArrowUpIcon,
  PhotoIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

const CloudStorage = () => {
  const { isCloudStorageEnabled } = useIntegrations();

  if (!isCloudStorageEnabled()) {
    return (
      <div className="p-6">
        <PageHeader
          title="Cloud Storage"
          subtitle="Automatic backup for job photos and documents"
        />
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-900">Cloud Storage Integration Required</h3>
              <p className="text-yellow-800 mt-2">
                This page requires Cloud Storage integration to be enabled. Enable it in Settings to access backup and file management features.
              </p>
              <button
                onClick={() => window.location.href = '/settings?tab=toggles&highlight=storage'}
                className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Enable Cloud Storage Integration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Cloud Storage"
        subtitle="Automatic backup for job photos and documents"
      />

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PhotoIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Photos Backed Up</h3>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DocumentIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Documents</h3>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CloudArrowUpIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
              <p className="text-2xl font-bold text-gray-900">2.4 GB</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Backup</h3>
              <p className="text-lg font-semibold text-gray-900">2 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Backup Settings</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Auto-backup Photos</h4>
                <p className="text-sm text-gray-500">Automatically backup job photos</p>
              </div>
              <div className="w-10 h-6 bg-green-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Auto-backup Documents</h4>
                <p className="text-sm text-gray-500">Backup quotes, invoices, contracts</p>
              </div>
              <div className="w-10 h-6 bg-green-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Organize by Job</h4>
                <p className="text-sm text-gray-500">Create folders for each job</p>
              </div>
              <div className="w-10 h-6 bg-green-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Team Sharing</h4>
                <p className="text-sm text-gray-500">Share files with team members</p>
              </div>
              <div className="w-10 h-6 bg-gray-300 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Storage Providers</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CloudArrowUpIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Google Drive</h4>
                  <p className="text-sm text-gray-500">Connected</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CloudArrowUpIcon className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Dropbox</h4>
                  <p className="text-sm text-gray-500">Not connected</p>
                </div>
              </div>
              <button className="text-sm text-primary-600 hover:text-primary-700">Connect</button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Backups */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Backups</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <FolderIcon className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Kitchen Renovation - Smith Residence</p>
                <p className="text-sm text-gray-500">24 photos, 3 documents backed up</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <PhotoIcon className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">HVAC Installation Photos</p>
                <p className="text-sm text-gray-500">18 photos from Johnson job</p>
              </div>
              <span className="text-sm text-gray-500">5 hours ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
              <DocumentIcon className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Contract Documents</p>
                <p className="text-sm text-gray-500">Service agreement and warranty docs</p>
              </div>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            Cloud Storage Active - Google Drive connected, auto-backup enabled
          </span>
        </div>
      </div>
    </div>
  );
};

export default CloudStorage;
