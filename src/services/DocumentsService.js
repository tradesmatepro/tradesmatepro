// Documents Service for Attachments and Job Photos
import { supabaseAdmin as supabase } from '../utils/supabaseClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

class DocumentsService {
  static getPathFromPublicUrl(publicUrl) {
    try {
      // Works for urls like: https://.../storage/v1/object/public/files/<path>
      const marker = '/storage/v1/object/public/';
      const idx = publicUrl.indexOf(marker);
      if (idx === -1) return null;
      const rest = publicUrl.substring(idx + marker.length); // files/<path>
      const parts = rest.split('/');
      const bucket = parts.shift();
      const path = parts.join('/');
      return { bucket, path };
    } catch { return null; }
  }
  // Upload attachment file
  static async uploadAttachment(companyId, jobId, file, uploadedBy, autoTags = [], ocrText = '') {
    try {
      console.log('📎 DocumentsService.uploadAttachment called:', { companyId, jobId, fileName: file.name, fileSize: file.size });

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}-${randomId}.${fileExt}`;

      // Use different path for general vs job-specific files
      const filePath = jobId
        ? `company-${companyId}/jobs/${jobId}/attachments/${fileName}`
        : `company-${companyId}/general/attachments/${fileName}`;

      console.log('📁 Upload path:', filePath);
      console.log('🪣 Storage bucket: files');

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('✅ File uploaded to storage:', uploadData);

      // Do NOT store public URL for private buckets; store storage path instead
      const storagePath = filePath;
      console.log('🔗 Storage path to save (private):', storagePath);

      // Insert into attachments table
      const attachmentData = {
        work_order_id: jobId || null, // Allow null for general files
        company_id: companyId,
        uploaded_by: uploadedBy,
        file_url: storagePath, // store path; signed URL will be generated when reading
        file_name: file.name,
        file_type: fileExt.toLowerCase(),
        file_size: file.size,
        auto_tags: autoTags,
        ocr_text: ocrText,
        uploaded_at: new Date().toISOString()
      };

      console.log('💾 Saving metadata to attachments table:', attachmentData);

      // Get authenticated user's session token for RLS
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || SUPABASE_ANON_KEY;

      const response = await fetch(`${SUPABASE_URL}/rest/v1/attachments`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(attachmentData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Database insert error:', response.status, errorText);
        throw new Error(`Failed to save attachment metadata: ${errorText}`);
      }

      const attachment = await response.json();
      console.log('✅ Metadata saved:', attachment);

      return {
        success: true,
        attachment: attachment[0],
        message: 'Attachment uploaded successfully!'
      };
    } catch (error) {
      console.error('❌ Error uploading attachment:', error);
      console.error('Error stack:', error.stack);
      return {
        success: false,
        message: `Upload failed: ${error.message}`
      };
    }
  }

  // Upload job photo
  static async uploadJobPhoto(companyId, workOrderId, file, uploadedBy, autoTags = []) {
    try {
      console.log('📸 DocumentsService.uploadJobPhoto called:', { companyId, workOrderId, fileName: file.name, fileSize: file.size, autoTags });

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}-${randomId}.${fileExt}`;

      // Use different path for general vs work order-specific photos
      const filePath = workOrderId
        ? `company-${companyId}/work-orders/${workOrderId}/photos/${fileName}`
        : `company-${companyId}/general/photos/${fileName}`;

      console.log('📁 Upload path:', filePath);
      console.log('🪣 Storage bucket: files');

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('✅ File uploaded to storage:', uploadData);

      // Do NOT store public URL for private buckets; store storage path instead
      const storagePath = filePath;
      console.log('🔗 Storage path to save (private):', storagePath);

      // Insert into job_photos table with correct schema
      const photoData = {
        company_id: companyId,
        work_order_id: workOrderId || null,
        photo_url: storagePath, // store path; signed URL will be generated when reading
        tag: autoTags.includes('BEFORE') ? 'BEFORE' : autoTags.includes('AFTER') ? 'AFTER' : 'DURING',
        uploaded_by: uploadedBy,
        created_at: new Date().toISOString()
      };

      console.log('💾 Saving metadata to job_photos table:', photoData);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/job_photos`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(photoData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Database insert error:', response.status, errorText);
        throw new Error(`Failed to save photo metadata: ${errorText}`);
      }

      const photo = await response.json();
      console.log('✅ Metadata saved:', photo);

      return {
        success: true,
        photo: photo[0],
        message: 'Photo uploaded successfully!'
      };
    } catch (error) {
      console.error('❌ Error uploading photo:', error);
      console.error('Error stack:', error.stack);
      return {
        success: false,
        message: `Upload failed: ${error.message}`
      };
    }
  }

  // Get attachments for company with relations and extended search
  static async getAttachments(companyId, searchTerm = '', jobId = null) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/attachments?company_id=eq.${companyId}&select=*,work_orders(id,title,customers(name)),users(full_name)&order=uploaded_at.desc`;
      if (jobId) url += `&work_order_id=eq.${jobId}`;
      const response = await fetch(url, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Accept': 'application/json' } });
      if (response.ok) {
        let attachments = await response.json();
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          attachments = attachments.filter(att =>
            (att.file_url||'').toLowerCase().includes(term) ||
            (att.file_name||'').toLowerCase().includes(term) ||
            (att.file_type||'').toLowerCase().includes(term) ||
            (att.ocr_text||'').toLowerCase().includes(term) ||
            (att.auto_tags||[]).some(t => t.toLowerCase().includes(term)) ||
            att.work_orders?.title?.toLowerCase().includes(term) ||
            att.work_orders?.customers?.name?.toLowerCase().includes(term)
          );
        }
        return attachments;
      }
      return [];
    } catch (error) {
      console.error('Error getting attachments:', error);
      return [];
    }
  }

  // Get job photos for company
  static async getJobPhotos(companyId, searchTerm = '', workOrderId = null) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/job_photos?select=*,work_orders(id,title),users(full_name)&order=created_at.desc`;

      if (workOrderId) {
        url += `&work_order_id=eq.${workOrderId}`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        let photos = await response.json();

        // Filter by search term if provided
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          photos = photos.filter(photo =>
            photo.tag?.toLowerCase().includes(term) ||
            photo.work_orders?.title?.toLowerCase().includes(term) ||
            photo.work_orders?.id?.toLowerCase().includes(term)
          );
        }

        return photos;
      }

      return [];
    } catch (error) {
      console.error('Error getting job photos:', error);
      return [];
    }
  }

  // Update tags or metadata for attachment/photo
  static async updateTags(table, id, autoTags) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ auto_tags: autoTags })
      });
      if (!response.ok) throw new Error('Failed to update tags');
      return await response.json();
    } catch (e) { console.error('updateTags failed', e); return null; }
  }

  static async getSignedUrl(publicUrl, expiresInSeconds = 3600) {
    try {
      let bucket = 'files';
      let path = publicUrl;

      // If it's a full URL, parse it
      if (publicUrl.includes('/storage/v1/object/')) {
        const parsed = this.getPathFromPublicUrl(publicUrl);
        if (parsed) {
          bucket = parsed.bucket;
          path = parsed.path;
        }
      }
      // Otherwise, assume it's already a storage path (e.g., "company-xxx/jobs/yyy/attachments/file.png")

      console.log('🔐 Generating signed URL for:', { bucket, path });

      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
      if (error) {
        console.warn('createSignedUrl error:', error);
        return null;
      }

      console.log('✅ Signed URL generated:', data?.signedUrl);
      return data?.signedUrl || null;
    } catch (e) {
      console.error('getSignedUrl failed:', e);
      return null;
    }
  }

  // Delete attachment
  static async deleteAttachment(attachmentId, companyId) {
    try {
      // Get attachment details first
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/attachments?id=eq.${attachmentId}&company_id=eq.${companyId}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Attachment not found');
      }

      const attachments = await response.json();
      if (attachments.length === 0) {
        throw new Error('Attachment not found');
      }

      const attachment = attachments[0];

      // Determine storage path and bucket from stored value
      let bucketName = 'files';
      let filePath = attachment.file_url;
      if (typeof attachment.file_url === 'string' && attachment.file_url.startsWith('http')) {
        const parsed = DocumentsService.getPathFromPublicUrl(attachment.file_url);
        if (parsed) {
          bucketName = parsed.bucket || 'files';
          filePath = parsed.path;
        }
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
      }

      // Delete from database
      const deleteResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/attachments?id=eq.${attachmentId}&company_id=eq.${companyId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete attachment record');
      }

      return { success: true, message: 'Attachment deleted successfully!' };
    } catch (error) {
      console.error('Error deleting attachment:', error);
      return { success: false, message: `Delete failed: ${error.message}` };
    }
  }

  // Delete job photo
  static async deleteJobPhoto(photoId, companyId) {
    try {
      // Get photo details first
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/job_photos?id=eq.${photoId}&company_id=eq.${companyId}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Photo not found');
      }

      const photos = await response.json();
      if (photos.length === 0) {
        throw new Error('Photo not found');
      }

      const photo = photos[0];

      // Determine storage path and bucket from stored value
      let bucketName = 'files';
      let filePath = photo.photo_url;
      if (typeof photo.photo_url === 'string' && photo.photo_url.startsWith('http')) {
        const parsed = DocumentsService.getPathFromPublicUrl(photo.photo_url);
        if (parsed) {
          bucketName = parsed.bucket || 'files';
          filePath = parsed.path;
        }
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
      }

      // Delete from database
      const deleteResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/job_photos?id=eq.${photoId}&company_id=eq.${companyId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete photo record');
      }

      return { success: true, message: 'Photo deleted successfully!' };
    } catch (error) {
      console.error('Error deleting photo:', error);
      return { success: false, message: `Delete failed: ${error.message}` };
    }
  }

  // Validate file types
  static validateAttachment(file) {
    const allowedTypes = [
      // Microsoft Office Documents
      'doc', 'docx', 'dot', 'dotx', 'docm',           // Word
      'xls', 'xlsx', 'xlt', 'xltx', 'xlsm', 'xlsb',  // Excel
      'ppt', 'pptx', 'pot', 'potx', 'pptm', 'pps', 'ppsx', // PowerPoint
      'mdb', 'accdb',                                  // Access
      'pub',                                           // Publisher
      'vsd', 'vsdx',                                   // Visio
      'mpp',                                           // Project

      // Other Office Suites
      'odt', 'ods', 'odp', 'odg',                     // LibreOffice/OpenOffice
      'pages', 'numbers', 'key',                      // Apple iWork

      // Adobe Documents
      'pdf', 'ai', 'psd', 'indd',

      // Text files
      'txt', 'md', 'rtf', 'csv', 'tsv',

      // Images
      'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif', 'ico',

      // Archives
      'zip', 'rar', '7z', 'tar', 'gz',

      // Other common business files
      'json', 'xml', 'html', 'css', 'js', 'yaml', 'yml'
    ];

    const fileExt = file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExt)) {
      return {
        valid: false,
        message: `File type ".${fileExt}" not allowed. Supported: Microsoft Office, PDF, Images, Archives, and more.`
      };
    }

    const maxSize = 50 * 1024 * 1024; // 50MB for beta testing
    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'File size too large. Maximum size is 50MB.'
      };
    }

    return { valid: true };
  }

  static validatePhoto(file) {
    const allowedTypes = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif', 'ico', 'heic', 'heif'];
    const fileExt = file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExt)) {
      return {
        valid: false,
        message: `Image type ".${fileExt}" not allowed. Supported types: ${allowedTypes.join(', ')}`
      };
    }

    const maxSize = 50 * 1024 * 1024; // 50MB for beta testing
    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'File size too large. Maximum size is 50MB.'
      };
    }

    return { valid: true };
  }

  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file icon
  static getFileIcon(fileType) {
    switch (fileType?.toLowerCase()) {
      // Microsoft Word
      case 'doc': case 'docx': case 'dot': case 'dotx': case 'docm': return '📝';

      // Microsoft Excel
      case 'xls': case 'xlsx': case 'xlt': case 'xltx': case 'xlsm': case 'xlsb': return '📊';

      // Microsoft PowerPoint
      case 'ppt': case 'pptx': case 'pot': case 'potx': case 'pptm': case 'pps': case 'ppsx': return '📊';

      // Microsoft Access
      case 'mdb': case 'accdb': return '🗃️';

      // Microsoft Publisher
      case 'pub': return '📰';

      // Microsoft Visio
      case 'vsd': case 'vsdx': return '📐';

      // Microsoft Project
      case 'mpp': return '📅';

      // Other Office Suites
      case 'odt': case 'ods': case 'odp': case 'odg': return '📄';
      case 'pages': return '📝';
      case 'numbers': return '📊';
      case 'key': return '📊';

      // Adobe
      case 'pdf': return '📄';
      case 'ai': return '🎨';
      case 'psd': return '🖼️';
      case 'indd': return '📰';

      // Text files
      case 'txt': return '📄';
      case 'md': return '📝';
      case 'rtf': return '📝';
      case 'csv': case 'tsv': return '📊';

      // Images
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'bmp': case 'webp': case 'tiff': case 'tif': case 'ico': case 'heic': case 'heif': return '🖼️';
      case 'svg': return '🎨';

      // Archives
      case 'zip': case 'rar': case '7z': case 'tar': case 'gz': return '📦';

      // Code files
      case 'json': case 'xml': case 'html': case 'css': case 'js': case 'yaml': case 'yml': return '💻';

      default: return '📎';
    }
  }

  // Get photo type badge color
  static getPhotoTypeBadge(type) {
    switch (type?.toUpperCase()) {
      case 'BEFORE': return 'bg-red-100 text-red-800';
      case 'AFTER': return 'bg-green-100 text-green-800';
      case 'OTHER': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  static async uploadPackageHtml(companyId, html, fileName) {
    try {
      const timestamp = Date.now();
      const name = fileName || `closeout-${timestamp}.html`;
      const filePath = `company-${companyId}/packages/${name}`;
      const blob = new Blob([html], { type: 'text/html' });
      const { error } = await supabase.storage.from('files').upload(filePath, blob, { upsert: false, contentType: 'text/html' });
      if (error) throw error;
      // Return storage path; UI will generate a signed URL when needed
      return filePath;
    } catch (e) { console.error('uploadPackageHtml failed', e); return null; }
  }

  static async createAttachmentRecord(companyId, jobId, fileUrl, fileName, uploadedBy, autoTags = []) {
    try {
      const body = {
        company_id: companyId,
        work_order_id: jobId || null,
        file_url: fileUrl,
        file_name: fileName,
        file_type: 'html',
        file_size: (fileUrl?.length || 0),
        auto_tags: autoTags,
        uploaded_by: uploadedBy,
        uploaded_at: new Date().toISOString()
      };
      // Get authenticated user's session token for RLS
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || SUPABASE_ANON_KEY;

      const res = await fetch(`${SUPABASE_URL}/rest/v1/attachments`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to create attachment record');
      const [row] = await res.json();
      return row;
    } catch (e) { console.error('createAttachmentRecord failed', e); return null; }
  }
}

export default DocumentsService;
