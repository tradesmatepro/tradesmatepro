import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import DocumentsService from '../services/DocumentsService';
import { QRCodeSVG } from 'qrcode.react';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

/**
 * JobPhotosTab - Photo upload and gallery for jobs
 * 
 * Industry Standard: Before/During/After photo workflow
 * Matches: ServiceTitan, Jobber, Housecall Pro
 * 
 * Features:
 * - Upload photos directly to job
 * - Tag photos as BEFORE/DURING/AFTER
 * - Photo gallery with preview
 * - Delete photos
 * - Auto-link to work_order_id
 */

const JobPhotosTab = ({ jobId, workOrderId }) => {
  const { user } = useUser();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [selectedTag, setSelectedTag] = useState('DURING'); // Default tag
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUploadUrl, setQrUploadUrl] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    if (jobId || workOrderId) {
      loadPhotos();
    }
  }, [jobId, workOrderId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const id = workOrderId || jobId;
      
      // Load photos for this work order
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/job_photos?work_order_id=eq.${id}&order=created_at.desc`,
        {
          headers: {
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const id = workOrderId || jobId;
      
      for (const file of files) {
        // Only allow images
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          continue;
        }

        // Upload photo with selected tag
        await DocumentsService.uploadJobPhoto(
          user.company_id,
          id,
          file,
          user.id,
          [selectedTag] // Tag as BEFORE/DURING/AFTER
        );
      }

      // Reload photos
      await loadPhotos();
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await DocumentsService.deleteJobPhoto(photoId);
      await loadPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  const generateQRCode = async () => {
    setGeneratingQR(true);
    try {
      const id = workOrderId || jobId;

      // Call edge function to generate upload URL
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/generate-upload-qr`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            jobId: id,
            workOrderId: id,
            companyId: user.company_id,
            uploadedBy: user.id,
            tag: selectedTag
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      setQrUploadUrl(data.uploadUrl);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  const getTagColor = (tag) => {
    switch (tag?.toUpperCase()) {
      case 'BEFORE':
        return 'bg-blue-100 text-blue-800';
      case 'DURING':
        return 'bg-yellow-100 text-yellow-800';
      case 'AFTER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagIcon = (tag) => {
    switch (tag?.toUpperCase()) {
      case 'BEFORE':
        return ClockIcon;
      case 'AFTER':
        return CheckCircleIcon;
      default:
        return PhotoIcon;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <CloudArrowUpIcon className="w-5 h-5 text-primary-600" />
              Upload Photos
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Upload from computer or scan QR code with your phone
            </p>
          </div>
          <button
            onClick={generateQRCode}
            disabled={generatingQR}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingQR ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm font-medium">Generating...</span>
              </>
            ) : (
              <>
                <QrCodeIcon className="w-5 h-5" />
                <DevicePhoneMobileIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Upload from Phone</span>
              </>
            )}
          </button>
        </div>

        {/* Tag Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo Type
          </label>
          <div className="flex gap-2">
            {['BEFORE', 'DURING', 'AFTER'].map((tag) => {
              const TagIcon = getTagIcon(tag);
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedTag === tag
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <TagIcon className="w-4 h-4" />
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* File Input */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {uploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 text-primary-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                <span className="text-sm font-medium">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No photos yet</p>
          <p className="text-sm text-gray-400 mt-1">Upload photos to document this job</p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Photos ({photos.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => {
              const TagIcon = getTagIcon(photo.tag);
              return (
                <div
                  key={photo.id}
                  className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Photo */}
                  <div
                    className="aspect-square bg-gray-100 cursor-pointer"
                    onClick={() => setPreviewPhoto(photo)}
                  >
                    <img
                      src={photo.photo_url}
                      alt={`Job photo - ${photo.tag}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Tag Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getTagColor(photo.tag)}`}>
                      <TagIcon className="w-3 h-3" />
                      {photo.tag}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    title="Delete photo"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  {/* Zoom Icon */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-1.5 bg-black bg-opacity-50 rounded-md">
                      <MagnifyingGlassIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>

            {/* Photo */}
            <img
              src={previewPhoto.photo_url}
              alt={`Job photo - ${previewPhoto.tag}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Tag */}
            <div className="absolute top-4 left-4">
              <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getTagColor(previewPhoto.tag)}`}>
                {React.createElement(getTagIcon(previewPhoto.tag), { className: 'w-4 h-4' })}
                {previewPhoto.tag}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrUploadUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <QrCodeIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Upload from Phone</h3>
                  <p className="text-sm text-gray-500">Scan with your phone camera</p>
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border-4 border-gray-200 rounded-lg">
                <QRCodeSVG
                  value={qrUploadUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <p className="text-sm text-gray-700">
                  Open your phone's camera app
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <p className="text-sm text-gray-700">
                  Point it at the QR code above
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <p className="text-sm text-gray-700">
                  Tap the notification to open the upload page
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <p className="text-sm text-gray-700">
                  Take a photo and upload - it will appear here automatically!
                </p>
              </div>
            </div>

            {/* Tag Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <PhotoIcon className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-900">
                  Photos will be tagged as <span className="font-semibold">{selectedTag}</span>
                </p>
              </div>
            </div>

            {/* Expiry Notice */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                This QR code expires in 60 minutes
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full mt-6 btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPhotosTab;

