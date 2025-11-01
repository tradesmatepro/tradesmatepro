import React from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import JobPhotosTab from './JobPhotosTab';

/**
 * JobPhotosModal - Standalone modal for job photos
 * 
 * Used in active job edit forms to view/upload photos
 * without cluttering the main form
 */

const JobPhotosModal = ({ isOpen, onClose, jobId, workOrderId, jobTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <PhotoIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Job Photos
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                {jobTitle || 'Upload and manage photos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <JobPhotosTab jobId={jobId} workOrderId={workOrderId} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPhotosModal;

