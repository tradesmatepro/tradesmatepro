import React, { useState, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import DocumentService from '../services/DocumentService';

const DocumentUpload = ({ linkedTo, type, onUploadComplete }) => {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      uploadFiles(Array.from(files));
    }
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    const results = [];

    for (const file of files) {
      try {
        // Validate file
        const validation = DocumentService.validateFile(file);
        if (!validation.valid) {
          results.push({
            file: file.name,
            success: false,
            message: validation.message
          });
          continue;
        }

        // Upload file
        const result = await DocumentService.uploadFile(
          user.company_id,
          file,
          linkedTo,
          type,
          user.id
        );

        results.push({
          file: file.name,
          success: result.success,
          message: result.message,
          document: result.document
        });
      } catch (error) {
        results.push({
          file: file.name,
          success: false,
          message: error.message
        });
      }
    }

    setUploading(false);
    
    // Show results
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    if (successful > 0) {
      alert(`Successfully uploaded ${successful} file(s)${failed > 0 ? `, ${failed} failed` : ''}`);
      if (onUploadComplete) {
        onUploadComplete(results.filter(r => r.success));
      }
    } else {
      alert(`Upload failed: ${results[0]?.message || 'Unknown error'}`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Uploading files...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl text-gray-400">📎</div>
            <div>
              <p className="text-sm text-gray-600">
                Drag and drop files here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports: PDF, JPG, PNG, GIF, TXT, DOC (max 10MB each)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Quick Upload Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
        >
          📄 Upload Documents
        </button>
        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.onchange = (e) => handleFileSelect(e.target.files);
            input.click();
          }}
          disabled={uploading}
          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
        >
          🖼️ Upload Photos
        </button>
      </div>
    </div>
  );
};

const DocumentList = ({ linkedTo, type, refreshTrigger }) => {
  const { user } = useUser();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadDocuments();
  }, [linkedTo, type, refreshTrigger]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await DocumentService.getDocuments(user.company_id, linkedTo, type);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const result = await DocumentService.deleteDocument(documentId, user.company_id);
      if (result.success) {
        setDocuments(docs => docs.filter(doc => doc.id !== documentId));
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to delete document: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Loading documents...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📁</div>
        <p className="text-sm">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{DocumentService.getFileIcon(doc.mime_type)}</span>
            <div>
              <p className="text-sm font-medium text-gray-900">{doc.file_name}</p>
              <p className="text-xs text-gray-500">
                {DocumentService.formatFileSize(doc.file_size)} • 
                {new Date(doc.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              View
            </a>
            <button
              onClick={() => handleDelete(doc.id)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export { DocumentUpload, DocumentList };
