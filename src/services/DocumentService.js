// Document Service for file uploads and management
import { supabaseAdmin as supabase } from '../utils/supabaseClient';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '../utils/env';

class DocumentService {
  // Upload file to Supabase Storage
  static async uploadFile(companyId, file, linkedTo, type, uploadedBy) {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${companyId}/${type}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('company-files')
        .getPublicUrl(filePath);

      // Save metadata to documents table
      const documentData = {
        company_id: companyId,
        linked_to: linkedTo,
        type: type,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: uploadedBy,
        uploaded_at: new Date().toISOString()
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/documents`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        throw new Error('Failed to save document metadata');
      }

      const document = await response.json();
      
      return {
        success: true,
        document: document[0],
        message: 'File uploaded successfully!'
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        message: `Upload failed: ${error.message}`
      };
    }
  }

  // Get documents for a specific entity
  static async getDocuments(companyId, linkedTo = null, type = null) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/documents?company_id=eq.${companyId}`;
      
      if (linkedTo) {
        url += `&linked_to=eq.${linkedTo}`;
      }
      
      if (type) {
        url += `&type=eq.${type}`;
      }
      
      url += '&order=uploaded_at.desc';

      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      }
      
      return [];
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  // Delete document
  static async deleteDocument(documentId, companyId) {
    try {
      // Get document details first
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/documents?id=eq.${documentId}&company_id=eq.${companyId}`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Document not found');
      }

      const documents = await response.json();
      if (documents.length === 0) {
        throw new Error('Document not found');
      }

      const document = documents[0];
      
      // Extract file path from URL
      const urlParts = document.file_url.split('/');
      const filePath = urlParts.slice(-3).join('/'); // company_id/type/filename

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('company-files')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const deleteResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/documents?id=eq.${documentId}&company_id=eq.${companyId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        }
      );

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete document record');
      }

      return {
        success: true,
        message: 'Document deleted successfully!'
      };
    } catch (error) {
      console.error('Error deleting document:', error);
      return {
        success: false,
        message: `Delete failed: ${error.message}`
      };
    }
  }

  // Validate file type and size
  static validateFile(file, maxSizeMB = 10) {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: 'File type not allowed. Please upload PDF, JPG, PNG, GIF, TXT, or DOC files.'
      };
    }

    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        message: `File size too large. Maximum size is ${maxSizeMB}MB.`
      };
    }

    return { valid: true };
  }

  // Format file size for display
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file icon based on type
  static getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType === 'text/plain') return '📄';
    return '📎';
  }
}

export default DocumentService;
