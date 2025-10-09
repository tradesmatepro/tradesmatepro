import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  DocumentIcon, 
  PhotoIcon, 
  TrashIcon, 
  EyeIcon,
  ArrowDownTrayIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext';

const FileManager = ({ 
  entityType = 'job', // 'job', 'quote', 'customer'
  entityId,
  files = [],
  onFilesChange,
  maxFiles = 10,
  maxSizeMB = 10
}) => {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!entityId || !user?.company_id) {
      alert('Missing entity ID or company information');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        // Generate storage path: files/company-{company_id}/{entityType}s/{entityId}/
        const storagePath = `files/company-${user.company_id}/${entityType}s/${entityId}/${file.name}`;
        
        // In a real implementation, you'd upload to Supabase Storage
        // For now, we'll simulate the upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          size: file.size,
          type: file.type,
          path: storagePath,
          uploaded_at: new Date().toISOString(),
          uploaded_by: user.id,
          company_id: user.company_id
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const newFiles = [...files, ...uploadedFiles];
      onFilesChange?.(newFiles);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [entityId, entityType, files, onFilesChange, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - files.length,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: uploading
  });

  const handleDelete = (fileId) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const newFiles = files.filter(f => f.id !== fileId);
      onFilesChange?.(newFiles);
    }
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length === 0) return;
    if (confirm(`Delete ${selectedFiles.length} selected files?`)) {
      const newFiles = files.filter(f => !selectedFiles.includes(f.id));
      onFilesChange?.(newFiles);
      setSelectedFiles([]);
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const getFileIcon = (file) => {
    if (file.type?.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-primary-600">Drop files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Max {maxFiles} files, {maxSizeMB}MB each
            </p>
          </div>
        )}
        {uploading && (
          <div className="mt-2">
            <div className="text-sm text-gray-600">Uploading...</div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <span className="text-sm text-gray-600">
            {selectedFiles.length} file(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <TrashIcon className="h-4 w-4" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                selectedFiles.includes(file.id) ? 'ring-2 ring-primary-500 bg-primary-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => toggleFileSelection(file.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  {getFileIcon(file)}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => alert('Preview coming soon')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Preview"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => alert('Download coming soon')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Download"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(file.uploaded_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No files uploaded yet
        </div>
      )}
    </div>
  );
};

export default FileManager;
