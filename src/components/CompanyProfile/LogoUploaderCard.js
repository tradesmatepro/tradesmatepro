import React, { useRef, useState } from 'react';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CameraIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const LogoUploaderCard = ({ data, setData, onFileUpload, uploading, errors }) => {
  const logoInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleLogoUpload = async (file) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const logoUrl = await onFileUpload(file, 'company_logo');
    if (logoUrl) {
      setData(prev => ({ ...prev, logo_url: logoUrl }));
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeLogo = () => {
    setData(prev => ({ ...prev, logo_url: '' }));
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'CO';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <PhotoIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Company Logo</h3>
            <p className="text-sm text-gray-600">Upload your logo for professional branding</p>
          </div>
          {data.logo_url && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Uploaded</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Logo Upload
              <span className="ml-2 inline-flex items-center text-xs text-purple-600">
                <InformationCircleIcon className="w-3 h-3 mr-1" />
                Square format recommended
              </span>
            </label>

            {data.logo_url ? (
              /* Current Logo Display */
              <div className="relative group">
                <div className="w-32 h-32 rounded-xl border-2 border-gray-200 overflow-hidden bg-white shadow-sm">
                  <img
                    src={data.logo_url}
                    alt="Company Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Change logo"
                  >
                    <CameraIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Remove logo"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Upload Area */
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  dragOver 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => logoInputRef.current?.click()}
              >
                {uploading ? (
                  <div className="py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Drop your logo here or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </>
                )}
              </div>
            )}

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Logo Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Live Preview
            </label>
            
            <div className="space-y-4">
              {/* Business Card Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Business Card</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg border border-gray-300 bg-white flex items-center justify-center overflow-hidden">
                    {data.logo_url ? (
                      <img src={data.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-sm font-bold text-gray-400">{getInitials(data.name)}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{data.name || 'Your Company'}</div>
                    <div className="text-sm text-gray-600">{data.tagline || 'Professional Services'}</div>
                  </div>
                </div>
              </div>

              {/* Header Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Website Header</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded border border-gray-300 bg-white flex items-center justify-center overflow-hidden">
                    {data.logo_url ? (
                      <img src={data.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-gray-400">{getInitials(data.name)}</span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">{data.name || 'Your Company'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Guidelines */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Logo Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use a square format (1:1 ratio) for best results</li>
            <li>• Minimum size: 200x200 pixels</li>
            <li>• Transparent background (PNG) works best</li>
            <li>• Keep it simple and readable at small sizes</li>
            <li>• Avoid text-heavy designs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LogoUploaderCard;
