import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import DocumentsService from '../services/DocumentsService';
import SharedTemplatesTab from '../components/SharedTemplatesTab';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import '../styles/modern-enhancements.css';
import {
  DocumentIcon,
  PhotoIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  TrashIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  PencilSquareIcon,
  LinkIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/solid';

const Documents = () => {
  const { user } = useUser();

  // Core data
  const [documents, setDocuments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, job-linked, general, photos
  const [jobFilter, setJobFilter] = useState('');
  const [sortBy, setSortBy] = useState('upload_date'); // upload_date, file_name, file_type, uploaded_by
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [viewMode, setViewMode] = useState('list'); // list, grid
  const [selectedDocs, setSelectedDocs] = useState({});
  const [tagFilter, setTagFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [inlineEditDoc, setInlineEditDoc] = useState(null); // {id, name, tags, jobId}
  const [newTag, setNewTag] = useState('');

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadJobId, setUploadJobId] = useState('');
  const [uploadType, setUploadType] = useState('general'); // general, job-linked

  // Preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState('documents');

  // E-Signature features
  const [showESignatureModal, setShowESignatureModal] = useState(false);
  const [selectedDocForSignature, setSelectedDocForSignature] = useState(null);
  const [signatureRequests, setSignatureRequests] = useState([]);

  // Version Control features
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedDocForVersions, setSelectedDocForVersions] = useState(null);
  const [documentVersions, setDocumentVersions] = useState([]);

  // Automated Workflows features
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [documentWorkflows, setDocumentWorkflows] = useState([]);
  const [selectedDocForWorkflow, setSelectedDocForWorkflow] = useState(null);

  useEffect(() => {
    if (user?.company_id) {
      loadAllData();
    }
  }, [user?.company_id]);

  useEffect(() => {
    if (user?.company_id) {
      loadDocuments();
    }
  }, [searchTerm, categoryFilter, jobFilter, sortBy, sortOrder, tagFilter, dateFrom, dateTo]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadJobs(),
        loadWorkOrders(),
        loadDocuments()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await supaFetch('work_orders?select=id,title&status=in.(SCHEDULED,IN_PROGRESS,COMPLETED)&order=created_at.desc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setJobs(data || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadWorkOrders = async () => {
    try {
      const response = await supaFetch('work_orders?select=id,title&status=in.(SCHEDULED,IN_PROGRESS,COMPLETED)&order=created_at.desc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data || []);
      }
    } catch (error) {
      console.error('Error loading work orders:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      // Load attachments and job photos with proper error handling
      let attachmentsResponse, photosResponse;

      try {
        // Simplified query without complex joins - get basic attachment data
        attachmentsResponse = await supaFetch('attachments?select=*&order=uploaded_at.desc', { method: 'GET' }, user.company_id);
      } catch (attachmentError) {
        console.warn('Could not load attachments:', attachmentError);
        attachmentsResponse = { ok: false };
      }

      try {
        // Simplified query without complex joins - get basic photo data
        photosResponse = await supaFetch('job_photos?select=*&order=uploaded_at.desc', { method: 'GET' }, user.company_id);
      } catch (photoError) {
        console.warn('Could not load job photos:', photoError);
        photosResponse = { ok: false };
      }

      let allDocuments = [];

      if (attachmentsResponse.ok) {
        const attachments = await attachmentsResponse.json();
        allDocuments = [...allDocuments, ...attachments.map(doc => ({
          ...doc,
          document_type: 'attachment',
          file_name: doc.file_url ? doc.file_url.split('/').pop() : 'Unknown'
        }))];
      }

      if (photosResponse.ok) {
        const photos = await photosResponse.json();
        allDocuments = [...allDocuments, ...photos.map(doc => ({
          ...doc,
          document_type: 'photo',
          file_name: doc.photo_url ? doc.photo_url.split('/').pop() : 'Unknown',
          file_url: doc.photo_url,
          file_type: 'image'
        }))];
      }

      // Apply filters and sorting
      const filteredDocs = filterAndSortDocuments(allDocuments);
      setDocuments(filteredDocs);

    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    }
  };

  const uniqueTags = Array.from(new Set((documents||[]).flatMap(d => d.auto_tags || []))).sort();

  const filterAndSortDocuments = (docs) => {
    let filtered = [...docs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => {
        const fileName = doc.file_name || doc.file_url?.split('/').pop() || '';
        const jobTitle = ''; // TODO: Add job lookup when needed
        const customerName = ''; // TODO: Add customer lookup when needed
        const uploader = ''; // TODO: Add user lookup when needed
        const jobId = doc.job_id?.toString() || '';

        return fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
               customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               uploader.toLowerCase().includes(searchTerm.toLowerCase()) ||
               jobId.includes(searchTerm.toLowerCase());
      });
    }

    // Category filter
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'job-linked') {
        filtered = filtered.filter(doc => doc.job_id);
      } else if (categoryFilter === 'general') {
        filtered = filtered.filter(doc => !doc.job_id);
      } else if (categoryFilter === 'photos') {
        filtered = filtered.filter(doc => doc.document_type === 'photo');
      } else if (categoryFilter === 'attachments') {
        filtered = filtered.filter(doc => doc.document_type === 'attachment');
      }
    }

    // Job filter
    if (jobFilter) {
      filtered = filtered.filter(doc => doc.job_id?.toString() === jobFilter);
    }

    // Tag filter
    if (tagFilter) {
      filtered = filtered.filter(doc => (doc.auto_tags || []).includes(tagFilter));
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(doc => new Date(doc.uploaded_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(doc => new Date(doc.uploaded_at) <= new Date(dateTo + 'T23:59:59'));
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'file_name':
          aVal = (a.file_name || a.file_url?.split('/').pop() || '').toLowerCase();
          bVal = (b.file_name || b.file_url?.split('/').pop() || '').toLowerCase();
          break;
        case 'file_type':
          aVal = a.file_type || '';
          bVal = b.file_type || '';
          break;
        case 'uploaded_by':
          aVal = ''; // TODO: Add user lookup when needed
          bVal = ''; // TODO: Add user lookup when needed
          break;
        default:
          aVal = new Date(a.uploaded_at || 0);
          bVal = new Date(b.uploaded_at || 0);
      }
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const jobId = uploadType === 'job-linked' ? uploadJobId : null;

        // AI-assisted auto-tagging
        const autoTags = await detectFileType(file);

        if (file.type.startsWith('image/')) {
          // Upload as job photo with auto-tags
          await DocumentsService.uploadJobPhoto(user.company_id, jobId, file, user.id, autoTags);
        } else {
          // Upload as attachment with auto-tags and OCR
          const ocrText = await extractTextFromFile(file);
          await DocumentsService.uploadAttachment(user.company_id, jobId, file, user.id, autoTags, ocrText);
        }
      }

      // Reload documents
      await loadDocuments();
      setShowUploadModal(false);
      setUploadJobId('');
      setUploadType('general');

    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // AI-assisted auto-tagging
  const detectFileType = async (file) => {
    const fileName = file.name.toLowerCase();
    const tags = [];

    if (fileName.includes('contract')) tags.push('contract');
    if (fileName.includes('invoice')) tags.push('invoice');
    if (fileName.includes('safety') || fileName.includes('compliance')) tags.push('safety');
    if (fileName.includes('permit')) tags.push('permit');
    if (fileName.includes('before')) tags.push('before');
    if (fileName.includes('after')) tags.push('after');
    if (fileName.includes('estimate') || fileName.includes('quote')) tags.push('estimate');

    return tags;
  };

  // OCR text extraction for searchability
  const extractTextFromFile = async (file) => {
    // For now, return empty string - in production, integrate with OCR service
    // like Google Vision API, AWS Textract, or Tesseract.js
    return '';
  };

  const handlePreview = (document) => {
    setPreviewFile(document);
    setShowPreviewModal(true);
  };

  const handleRename = async (documentId, newName) => {
    try {
      // Update in database
      await supaFetch(`attachments?id=eq.${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_name: newName })
      }, user.company_id);

      await loadDocuments();
    } catch (error) {
      console.error('Error renaming file:', error);
    }
  };

  const handleMove = async (documentId, newJobId) => {
    try {
      // Update job association
      await supaFetch(`attachments?id=eq.${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: newJobId || null })
      }, user.company_id);

      await loadDocuments();
    } catch (error) {
      console.error('Error moving file:', error);
    }
  };

  const handleDelete = async (document) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      if (document.document_type === 'photo') {
        await DocumentsService.deleteJobPhoto(document.id, user.company_id);
      } else {
        await DocumentsService.deleteAttachment(document.id, user.company_id);
      }
      await loadDocuments();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleMoveToJob = async (documentId, newJobId) => {
    try {
      await supaFetch(`attachments?id=eq.${documentId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ job_id: newJobId || null }) }, user.company_id);
      await loadDocuments();
    } catch (e) { console.error('move failed', e); }
  };

  const handleRenameInline = async (documentId, newName) => {
    try {
      await supaFetch(`attachments?id=eq.${documentId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ file_name: newName }) }, user.company_id);
      await loadDocuments();
    } catch (e) { console.error('rename failed', e); }
  };

  const handleUpdateTags = async (document, nextTags) => {
    try {
      const table = document.document_type === 'photo' ? 'job_photos' : 'attachments';
      await DocumentsService.updateTags(table, document.id, nextTags);
      await loadDocuments();
    } catch (e) { console.error('update tags failed', e); }
  };

  const getFileIcon = (fileType, isPreview = false) => {
    if (!fileType) return DocumentIcon;

    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return DocumentTextIcon;
    if (type.includes('doc') || type.includes('docx')) return DocumentIcon;
    if (type.includes('xls') || type.includes('xlsx')) return TableCellsIcon;
    if (type.includes('ppt') || type.includes('pptx')) return PresentationChartBarIcon;
    if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('gif')) return PhotoIcon;

    return DocumentIcon;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImageFile = (fileType) => {
    return fileType && fileType.toLowerCase().includes('image');
  };

  // E-Signature Functions
  const requestESignature = async (document) => {
    try {
      setSelectedDocForSignature(document);
      setShowESignatureModal(true);

      // Load existing signature requests for this document
      const response = await supaFetch(
        `esignatures?document_id=eq.${document.id}&order=signed_at.desc`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const signatures = await response.json();
        setSignatureRequests(signatures || []);
      }
    } catch (error) {
      console.error('Error loading signature requests:', error);
      alert('Failed to load signature requests');
    }
  };

  const sendSignatureRequest = async (document, recipientEmail, recipientName, message) => {
    try {
      // **COMING SOON**: Integration with DocuSign, HelloSign, or Adobe Sign
      // For now, create a signature request record
      const signatureRequest = {
        company_id: user.company_id,
        document_id: document.id,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        message: message,
        status: 'sent',
        sent_at: new Date().toISOString(),
        created_by: user.id
      };

      // **COMING SOON**: Store in signature_requests table
      console.log('Creating signature request:', signatureRequest);

      alert(`E-signature request sent to ${recipientEmail}!\n\nCOMING SOON: Integration with DocuSign/HelloSign for automated delivery.`);
      setShowESignatureModal(false);
    } catch (error) {
      console.error('Error sending signature request:', error);
      alert('Failed to send signature request');
    }
  };

  // Version Control Functions
  const viewVersionHistory = async (document) => {
    try {
      setSelectedDocForVersions(document);

      // **COMING SOON**: Load from document_versions table
      // For now, create mock version history
      const mockVersions = [
        {
          id: '1',
          version: 1,
          file_name: document.file_name,
          created_at: document.uploaded_at,
          created_by: document.uploaded_by,
          changes: 'Initial version',
          file_size: document.file_size
        }
      ];

      setDocumentVersions(mockVersions);
      setShowVersionHistory(true);

      // **COMING SOON**: Real version tracking with diff comparison
      console.log('COMING SOON: Full version control with document diff comparison');
    } catch (error) {
      console.error('Error loading version history:', error);
      alert('Failed to load version history');
    }
  };

  const createNewVersion = async (document, newFile, changeNotes) => {
    try {
      // **COMING SOON**: Upload new version and create version record
      console.log('COMING SOON: Document versioning with automatic change tracking');

      alert('COMING SOON: Document versioning will automatically track changes and maintain version history');
    } catch (error) {
      console.error('Error creating new version:', error);
      alert('Failed to create new version');
    }
  };

  // Automated Workflow Functions
  const createDocumentWorkflow = async (document, workflowType, approvers, dueDate) => {
    try {
      const workflow = {
        company_id: user.company_id,
        document_id: document.id,
        workflow_type: workflowType, // 'approval', 'review', 'signature'
        approvers: approvers,
        due_date: dueDate,
        status: 'pending',
        created_by: user.id,
        created_at: new Date().toISOString()
      };

      // **COMING SOON**: Store in document_workflows table
      console.log('Creating document workflow:', workflow);

      // **COMING SOON**: Send notifications to approvers
      alert(`Document workflow created!\n\nCOMING SOON: Automated notifications and approval tracking.`);
      setShowWorkflowModal(false);
    } catch (error) {
      console.error('Error creating workflow:', error);
      alert('Failed to create document workflow');
    }
  };

  const approveDocument = async (workflowId, approved, comments) => {
    try {
      // **COMING SOON**: Update workflow status and send notifications
      console.log('COMING SOON: Document approval workflow with automated notifications');

      alert('COMING SOON: Document approval workflow with email notifications and status tracking');
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Failed to process approval');
    }
  };

  // Check for overdue documents
  const checkOverdueDocuments = () => {
    const overdueJobs = [];
        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button className="btn-outline btn-xs" onClick={async ()=>{
            const selected = documents[0]?.work_orders; // fallback for demo context
            const job = selected || null;
            const html = `<!doctype html><html><head><meta charset='utf-8'><title>Closeout Package</title><style>body{font-family:Inter,system-ui,sans-serif;padding:24px}h1{font-size:20px;margin:0 0 8px}h2{font-size:16px;margin:16px 0 8px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}img{max-width:100%;height:auto;border-radius:8px;margin:6px 0}</style></head><body><h1>Closeout Package</h1><div>Generated: ${new Date().toLocaleString()}</div><hr/><h2>Job</h2><div>${job? (job.title + (job.customers? ' — ' + job.customers.name : '')) : 'General'}</div><h2>Summary</h2><ul><li>Total Documents: ${documents.length}</li></ul></body></html>`;
            const url = await DocumentsService.uploadPackageHtml(user.company_id, html, undefined);
            if (!url) { window?.toast?.error('Failed to generate package'); return; }
            const rec = await DocumentsService.createAttachmentRecord(user.company_id, job?.id || null, url, 'Closeout Package.html', user?.id || null, ['closeout','package']);
            if (rec) { window?.toast?.success('Closeout package saved to Documents'); await loadDocuments(); }
          }}>Generate Closeout Package</button>
          {Object.keys(selectedDocs).length>0 && (
            <button className="btn-outline btn-xs" onClick={async ()=>{
              // Create a shareable signed link for the first selected item
              const firstId = Object.keys(selectedDocs)[0];
              const doc = documents.find(d=>d.id===firstId);
              const signed = await DocumentsService.getSignedUrl(doc.file_url, 3600);
              if (signed) { await navigator.clipboard.writeText(signed); window?.toast?.success('Share link copied'); }
            }}>Copy Share Link</button>
          )}
        </div>

    jobs.forEach(job => {
      const jobDocs = documents.filter(doc => doc.job_id === job.id);
      const hasContract = jobDocs.some(doc => doc.auto_tags?.includes('contract'));
      const hasPermit = jobDocs.some(doc => doc.auto_tags?.includes('permit'));
      const hasSafety = jobDocs.some(doc => doc.auto_tags?.includes('safety'));

      const missing = [];
      if (!hasContract) missing.push('Contract');
      if (!hasPermit) missing.push('Permit');
      if (!hasSafety) missing.push('Safety Documentation');

      if (missing.length > 0) {
        overdueJobs.push({ job, missing });
      }
    });

    return overdueJobs;
  };

  const overdueDocuments = checkOverdueDocuments();

  const tabs = [
    { id: 'documents', name: 'My Documents', icon: DocumentIcon },
    { id: 'shared', name: 'Shared Templates', icon: GlobeAltIcon }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'shared':
        return <SharedTemplatesTab />;
      case 'documents':
      default:
        return <DocumentsContent />;
    }
  };

  const DocumentsContent = () => {
    return (
      <div className="space-y-6">
      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <CloudArrowUpIcon className="w-5 h-5" />
          Upload Files
        </button>
      </div>

      {/* Overdue Documents Alert */}
      {overdueDocuments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-red-800">Missing Required Documents</h3>
          </div>
          <div className="space-y-1">
            {overdueDocuments.map(({ job, missing }) => (
              <div key={job.id} className="text-sm text-red-700">
                <strong>{job.title}</strong>: Missing {missing.join(', ')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files, jobs, customers, tags, OCR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Files</option>
              <option value="job-linked">Job-Linked Files</option>
              <option value="general">Company Files</option>
              <option value="photos">Job Photos</option>
              <option value="attachments">Attachments</option>
            </select>
          </div>

          {/* Job Filter */}
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Jobs</option>
            {[...jobs, ...workOrders].map(job => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={tagFilter}
            onChange={(e)=>setTagFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Tags</option>
            {uniqueTags.map(tag => (<option key={tag} value={tag}>{tag}</option>))}
          </select>

          {/* Date Range */}
          <input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowsUpDownIcon className="w-4 h-4 text-gray-500" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="upload_date-desc">Newest First</option>
              <option value="upload_date-asc">Oldest First</option>
              <option value="file_name-asc">Name A-Z</option>
              <option value="file_name-desc">Name Z-A</option>
              <option value="file_type-asc">Type A-Z</option>
              <option value="uploaded_by-asc">Uploader A-Z</option>
            </select>
          </div>
        </div>

        {/* View Mode + Bulk Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {documents.length} files found
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <DocumentIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <PhotoIcon className="w-4 h-4" />
            </button>
            {/* Bulk actions when any selected */}
            {Object.keys(selectedDocs).length>0 && (
              <div className="flex items-center gap-2 ml-4">
                <button className="btn-secondary btn-xs" onClick={async ()=>{
                  // Download signed URLs in new tabs sequentially
                  for (const id of Object.keys(selectedDocs)) {
                    const doc = documents.find(d=>d.id===id);
                    if (!doc?.file_url) continue;
                    const signed = await DocumentsService.getSignedUrl(doc.file_url, 900);
                    window.open(signed || doc.file_url, '_blank');
                  }
                }}>Download</button>
                <button className="btn-danger btn-xs" onClick={async ()=>{
                  if (!window.confirm(`Delete ${Object.keys(selectedDocs).length} file(s)?`)) return;
                  for (const id of Object.keys(selectedDocs)) {
                    const doc = documents.find(d=>d.id===id);
                    if (!doc) continue;
                    if (doc.document_type === 'photo') await DocumentsService.deleteJobPhoto(id, user.company_id);
                    else await DocumentsService.deleteAttachment(id, user.company_id);
                  }
                  await loadDocuments();
                  setSelectedDocs({});
                }}>Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents Display */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <div className="mt-2 text-gray-600">Loading documents...</div>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
          <p className="text-gray-600 mb-4">Drag and drop to add your first file</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
          >
            Upload Files
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <PhotoGalleryView
          documents={documents}
          handlePreview={handlePreview}
          selectedDocs={selectedDocs}
          setSelectedDocs={setSelectedDocs}
        />
      ) : (
        <DocumentListView
          documents={documents}
          getFileIcon={getFileIcon}
          isImageFile={isImageFile}
          handlePreview={handlePreview}
          handleDelete={handleDelete}
          formatFileSize={formatFileSize}
          selectedDocs={selectedDocs}
          setSelectedDocs={setSelectedDocs}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          jobs={jobs}
          workOrders={workOrders}
          uploadType={uploadType}
          setUploadType={setUploadType}
          uploadJobId={uploadJobId}
          setUploadJobId={setUploadJobId}
          handleFileUpload={handleFileUpload}
          uploading={uploading}
          setShowUploadModal={setShowUploadModal}
          formatFileSize={formatFileSize}
        />
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <PreviewModal
          previewFile={previewFile}
          setShowPreviewModal={setShowPreviewModal}
          handleDelete={handleDelete}
          formatFileSize={formatFileSize}
          isImageFile={isImageFile}
        />
      )}
    </div>
  );
};

// Document List View Component
const DocumentListView = ({ documents, getFileIcon, isImageFile, handlePreview, handleDelete, formatFileSize, selectedDocs, setSelectedDocs }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3">
                <input type="checkbox" onChange={(e)=>{
                  if (e.target.checked) {
                    const all = {}; documents.forEach(d=> all[d.id]=true); setSelectedDocs(all);
                  } else { setSelectedDocs({}); }
                }} />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job/Work Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc) => {
              const FileIcon = getFileIcon(doc.file_type);
              const fileName = doc.file_name || doc.file_url?.split('/').pop() || 'Unknown';

              return (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4">
                    <input type="checkbox" checked={!!selectedDocs[doc.id]} onChange={(e)=>{
                      const next = { ...selectedDocs };
                      if (e.target.checked) next[doc.id] = true; else delete next[doc.id];
                      setSelectedDocs(next);
                    }} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {isImageFile(doc.file_type) ? (
                          <img src={doc.file_url} alt={fileName} className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                            <FileIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{fileName}</div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {(doc.auto_tags||[]).map(tag => (
                            <span key={tag} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{tag}</span>
                          ))}
                          <button title="Edit tags" className="ml-1 text-gray-400 hover:text-gray-600" onClick={(e)=>{ e.stopPropagation(); setInlineEditDoc({ id: doc.id, name: fileName, tags: doc.auto_tags||[], jobId: doc.job_id||'' }); }}>
                            <TagIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doc.job_id ? (
                      <div>
                        <div className="font-medium">Job #{doc.job_id}</div>
                        <div className="text-gray-500">Associated Job</div>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">General Company Files</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.file_type?.toUpperCase() || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(doc.file_size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(doc.uploaded_at).toLocaleDateString()}</div>
                    <div className="text-xs">User #{doc.uploaded_by || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handlePreview(doc)} className="text-primary-600 hover:text-primary-900" title="Preview">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => requestESignature(doc)} className="text-blue-600 hover:text-blue-900" title="Request E-Signature">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => viewVersionHistory(doc)} className="text-green-600 hover:text-green-900" title="Version History">
                        <ArrowsUpDownIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(doc)} className="text-red-600 hover:text-red-900" title="Delete">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

// Photo Gallery View Component
const PhotoGalleryView = ({ documents, handlePreview, selectedDocs, setSelectedDocs }) => {
  const groupPhotosByJob = () => {
    const photos = documents.filter(doc => doc.document_type === 'photo');
    const grouped = {};

    photos.forEach(photo => {
      const jobId = photo.job_id || 'general';
      if (!grouped[jobId]) {
        grouped[jobId] = {
          jobInfo: { title: jobId === 'general' ? 'General Company Photos' : `Job #${jobId}` },
          before: [],
          after: [],
          other: []
        };
      }

      const tags = photo.auto_tags || [];
      if (tags.includes('before')) {
        grouped[jobId].before.push(photo);
      } else if (tags.includes('after')) {
        grouped[jobId].after.push(photo);
      } else {
        grouped[jobId].other.push(photo);
      }
    });

    return grouped;
  };

  const photoGroups = groupPhotosByJob();

    return (
      <div className="space-y-8">
        {Object.entries(photoGroups).map(([jobId, group]) => (
          <div key={jobId} className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {group.jobInfo.title}
            </h3>

            {/* Before Photos */}
            {group.before.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Before Photos</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {group.before.map(photo => (
                    <div key={photo.id} className="relative group cursor-pointer" onClick={() => handlePreview(photo)}>
                      <img
                        src={photo.photo_url || photo.file_url}
                        alt="Before photo"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                        <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* After Photos */}
            {group.after.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">After Photos</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {group.after.map(photo => (
                    <div key={photo.id} className="relative group cursor-pointer" onClick={() => handlePreview(photo)}>
                      <img
                        src={photo.photo_url || photo.file_url}
                        alt="After photo"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                        <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Photos */}
            {group.other.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Job Photos</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {group.other.map(photo => (
                    <div key={photo.id} className="relative group cursor-pointer" onClick={() => handlePreview(photo)}>
                      <img
                        src={photo.photo_url || photo.file_url}
                        alt="Job photo"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                        <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Upload Modal Component
  const UploadModal = () => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setSelectedFiles(Array.from(e.dataTransfer.files));
      }
    };

    const handleFileSelect = (e) => {
      if (e.target.files && e.target.files[0]) {
        setSelectedFiles(Array.from(e.target.files));
      }
    };

    const handleUpload = async () => {
      if (selectedFiles.length === 0) return;

      await handleFileUpload(selectedFiles);
      setSelectedFiles([]);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upload Files</h3>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Upload Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="general"
                  checked={uploadType === 'general'}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="mr-2"
                />
                General Company Files
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="job-linked"
                  checked={uploadType === 'job-linked'}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="mr-2"
                />
                Link to Job/Work Order
              </label>
            </div>
          </div>

          {/* Job Selection */}
          {uploadType === 'job-linked' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job/Work Order
              </label>
              <select
                value={uploadJobId}
                onChange={(e) => setUploadJobId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Choose a job or work order...</option>
                <optgroup label="Jobs">
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Work Orders">
                  {workOrders.map(wo => (
                    <option key={wo.id} value={wo.id}>
                      {wo.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Supports images, PDFs, Word docs, Excel files, and more
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="btn-primary cursor-pointer"
            >
              Choose Files
            </label>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Selected Files ({selectedFiles.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-900">{file.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowUploadModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading || (uploadType === 'job-linked' && !uploadJobId)}
              className="btn-primary disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Preview Modal Component
  const PreviewModal = () => {
  if (!previewFile) return null;

  const fileName = previewFile.file_name || previewFile.file_url?.split('/').pop() || 'Unknown';
  const isImage = isImageFile(previewFile.file_type);
  const isPDF = previewFile.file_type?.toLowerCase().includes('pdf');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{fileName}</h3>
              <p className="text-sm text-gray-600">
                {previewFile.file_type?.toUpperCase()} • {formatFileSize(previewFile.file_size)}
              </p>
            </div>
            <button
              onClick={() => setShowPreviewModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[70vh] overflow-auto">
            {isImage ? (
              <div className="text-center">
                <img
                  src={previewFile.file_url}
                  alt={fileName}
                  className="max-w-full max-h-full mx-auto rounded-lg"
                />
              </div>
            ) : isPDF ? (
              <div className="w-full h-96">
                <iframe
                  src={previewFile.file_url}
                  className="w-full h-full border-0 rounded-lg"
                  title={fileName}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      {/* Inline Tag/Rename/Move Editor */}
      {inlineEditDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={()=>setInlineEditDoc(null)}>
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Edit Document</div>
              <button className="text-gray-400 hover:text-gray-600" onClick={()=>setInlineEditDoc(null)}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input className="w-full border rounded px-2 py-1" value={inlineEditDoc.name} onChange={(e)=>setInlineEditDoc({...inlineEditDoc, name:e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tags</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(inlineEditDoc.tags||[]).map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {tag}
                      <button className="text-blue-700" onClick={()=>{
                        setInlineEditDoc({...inlineEditDoc, tags: (inlineEditDoc.tags||[]).filter(t=>t!==tag)});
                      }}>×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="flex-1 border rounded px-2 py-1" placeholder="Add tag" value={newTag} onChange={(e)=>setNewTag(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter' && newTag.trim()){ setInlineEditDoc({...inlineEditDoc, tags:[...(inlineEditDoc.tags||[]), newTag.trim()]}); setNewTag(''); } }} />
                  <button className="btn-outline btn-xs" onClick={()=>{ if(newTag.trim()){ setInlineEditDoc({...inlineEditDoc, tags:[...(inlineEditDoc.tags||[]), newTag.trim()]}); setNewTag(''); } }}>Add</button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Move to Job/WO</label>
                <select className="w-full border rounded px-2 py-1" value={inlineEditDoc.jobId} onChange={(e)=>setInlineEditDoc({...inlineEditDoc, jobId:e.target.value})}>
                  <option value="">General Company Files</option>
                  {[...jobs, ...workOrders].map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn-secondary btn-sm" onClick={()=>setInlineEditDoc(null)}>Cancel</button>
                <button className="btn-primary btn-sm" onClick={async ()=>{
                  // Persist rename, tags, move
                  if (inlineEditDoc.name) await handleRenameInline(inlineEditDoc.id, inlineEditDoc.name);
                  await handleUpdateTags(documents.find(d=>d.id===inlineEditDoc.id)?.document_type==='photo'? { ...documents.find(d=>d.id===inlineEditDoc.id), document_type:'photo' } : documents.find(d=>d.id===inlineEditDoc.id), inlineEditDoc.tags||[]);
                  if (inlineEditDoc.jobId !== undefined) await handleMoveToJob(inlineEditDoc.id, inlineEditDoc.jobId || null);
                  setInlineEditDoc(null);
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
                <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                <a
                  href={previewFile.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Download File
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center p-4 border-t bg-gray-50">
            <div className="flex items-center gap-4">
              {previewFile.auto_tags && previewFile.auto_tags.length > 0 && (
                <div className="flex gap-1">
                  {previewFile.auto_tags.map(tag => (
                    <span key={tag} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <a
                href={previewFile.file_url}
                download
                className="btn-secondary"
              >
                Download
              </a>
              <button
                onClick={() => handleDelete(previewFile)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const totalSize = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
  const photoCount = documents.filter(doc => isImageFile(doc.file_type)).length;
  const recentUploads = documents.filter(doc => {
    const uploadDate = new Date(doc.upload_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return uploadDate >= weekAgo;
  }).length;

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Document Management"
        subtitle="Organize files, photos, and documents for jobs and company records"
        icon={DocumentIcon}
        gradient="indigo"
        stats={[
          { label: 'Total Files', value: documents.length },
          { label: 'Photos', value: photoCount },
          { label: 'Storage', value: `${(totalSize/1024/1024).toFixed(1)}MB` }
        ]}
        actions={[
          {
            label: 'Upload Files',
            icon: CloudArrowUpIcon,
            onClick: () => setShowUploadModal(true)
          },
          {
            label: 'E-Signatures',
            icon: PencilSquareIcon,
            onClick: () => alert('Select a document to request e-signature')
          },
          {
            label: 'Workflows',
            icon: ArrowsUpDownIcon,
            onClick: () => setShowWorkflowModal(true)
          }
        ]}
      />

      {/* Document Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernCard className="card-gradient-indigo text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total Documents</p>
                <p className="text-3xl font-bold text-white">{documents.length}</p>
                <p className="text-indigo-200 text-xs mt-1">All files</p>
              </div>
              <DocumentIcon className="w-12 h-12 text-indigo-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-green text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Photos & Images</p>
                <p className="text-3xl font-bold text-white">{photoCount}</p>
                <p className="text-green-200 text-xs mt-1">Visual content</p>
              </div>
              <PhotoIcon className="w-12 h-12 text-green-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-blue text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Recent Uploads</p>
                <p className="text-3xl font-bold text-white">{recentUploads}</p>
                <p className="text-blue-200 text-xs mt-1">This week</p>
              </div>
              <CloudArrowUpIcon className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-purple text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Storage Used</p>
                <p className="text-3xl font-bold text-white">{(totalSize/1024/1024).toFixed(1)}MB</p>
                <p className="text-purple-200 text-xs mt-1">File storage</p>
              </div>
              <FolderIcon className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && <UploadModal />}
      {showPreviewModal && previewFile && <PreviewModal />}

      {/* E-Signature Request Modal */}
      {showESignatureModal && selectedDocForSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Request E-Signature</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Document: {selectedDocForSignature.file_name}</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              sendSignatureRequest(
                selectedDocForSignature,
                formData.get('email'),
                formData.get('name'),
                formData.get('message')
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    className="w-full border rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Please review and sign this document..."
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>COMING SOON:</strong> Integration with DocuSign, HelloSign, and Adobe Sign for automated e-signature workflows
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 btn-primary">
                  Send Signature Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowESignatureModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && selectedDocForVersions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Version History</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Document: {selectedDocForVersions.file_name}</p>
            </div>

            <div className="space-y-3">
              {documentVersions.map((version, index) => (
                <div key={version.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Version {version.version}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(version.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">{version.changes}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {formatFileSize(version.file_size)}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-4">
              <p className="text-sm text-green-800">
                <strong>COMING SOON:</strong> Full version control with document diff comparison, rollback capabilities, and automatic change tracking
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowVersionHistory(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Workflow Modal */}
      {showWorkflowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Document Workflow</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              createDocumentWorkflow(
                selectedDocForWorkflow,
                formData.get('workflow_type'),
                formData.get('approvers').split(',').map(email => email.trim()),
                formData.get('due_date')
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Type
                  </label>
                  <select name="workflow_type" className="w-full border rounded-md px-3 py-2">
                    <option value="approval">Document Approval</option>
                    <option value="review">Document Review</option>
                    <option value="signature">Signature Required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approvers (comma-separated emails)
                  </label>
                  <input
                    type="text"
                    name="approvers"
                    required
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="manager@company.com, owner@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                  <p className="text-sm text-purple-800">
                    <strong>COMING SOON:</strong> Automated approval workflows with email notifications, deadline tracking, and escalation rules
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 btn-primary">
                  Create Workflow
                </button>
                <button
                  type="button"
                  onClick={() => setShowWorkflowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
