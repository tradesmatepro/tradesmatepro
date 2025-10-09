import React, { useState, useRef } from 'react';
import {
  PaintBrushIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const BrandingSection = ({ data, setData, errors, expanded, onToggle }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColorChange = (color) => {
    handleInputChange('theme_color', color);
    
    // Apply color immediately for preview
    document.documentElement.style.setProperty('--primary-color', color);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Supabase Storage (this would need to be implemented)
      // For now, we'll create a placeholder URL
      const fileName = `logo_${Date.now()}_${file.name}`;
      const logoUrl = `https://placeholder-storage.com/${fileName}`;

      handleInputChange('logo_url', logoUrl);
      
      // In a real implementation, you would upload to Supabase Storage:
      /*
      const { data: uploadData, error } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(uploadData.path);
      
      handleInputChange('logo_url', publicUrl);
      */

    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    handleInputChange('logo_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <div 
        className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PaintBrushIcon className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Branding</h3>
              <p className="text-sm text-gray-600">Company logo and color scheme</p>
            </div>
          </div>
          {expanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>

      {/* Section Content */}
      {expanded && (
        <div className="px-6 py-6">
          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Company Logo
              </label>
              
              {data.logo_url ? (
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={data.logo_url}
                      alt="Company Logo"
                      className="w-20 h-20 object-contain border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Current logo</p>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PhotoIcon className="w-4 h-4 mr-2" />
                        Change Logo
                      </button>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <XMarkIcon className="w-4 h-4 mr-2" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Upload your company logo</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <PhotoIcon className="w-4 h-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Theme Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Theme Color
              </label>
              
              {/* Color Preview */}
              <div className="flex items-center space-x-4 mb-4">
                <div 
                  className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm"
                  style={{ backgroundColor: data.theme_color }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Current Color</p>
                  <p className="text-sm text-gray-600">{data.theme_color}</p>
                </div>
              </div>

              {/* Predefined Colors */}
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">Choose from preset colors:</p>
                <div className="grid grid-cols-5 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        data.theme_color === color 
                          ? 'border-gray-900 scale-110' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Color Input */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Or enter a custom color:
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={data.theme_color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.theme_color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="#3B82F6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Branding Info */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <PaintBrushIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-purple-800">Branding Guidelines</h4>
                <p className="mt-1 text-sm text-purple-700">
                  Your logo and theme color will be used throughout the application and on customer-facing 
                  documents like quotes and invoices. Choose colors that represent your brand professionally.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandingSection;
