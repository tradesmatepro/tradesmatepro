import React, { useRef, useState } from 'react';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CameraIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const CompanyAvatar = ({ data, setData, onFileUpload, uploading, errors }) => {
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const logoUrl = await onFileUpload(file, 'company_logo');
    if (logoUrl) {
      setData(prev => ({ ...prev, logo_url: logoUrl }));
    }
  };

  const handleBannerUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const bannerUrl = await onFileUpload(file, 'company_banner');
    if (bannerUrl) {
      setData(prev => ({ ...prev, banner_url: bannerUrl }));
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleLogoUpload({ target: { files: [file] } });
    }
  };

  const removeLogo = () => {
    setData(prev => ({ ...prev, logo_url: '' }));
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const removeBanner = () => {
    setData(prev => ({ ...prev, banner_url: '' }));
    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
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
    <div className="group relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-50 opacity-50"></div>

      {/* Banner Section */}
      <div className="relative h-40 bg-gray-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gray-600"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>

        {data.banner_url ? (
          <img
            src={data.banner_url}
            alt="Company Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <SparklesIcon className="w-12 h-12 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium opacity-90">Add your company banner</p>
            </div>
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploading}
            className="group/btn inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-sm font-medium rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
          >
            <CameraIcon className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
            {data.banner_url ? 'Change' : 'Add Banner'}
          </button>

          {data.banner_url && (
            <button
              type="button"
              onClick={removeBanner}
              className="p-2 bg-red-500/80 backdrop-blur-sm hover:bg-red-600 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative px-8 pb-8">
        {/* Company Logo/Avatar */}
        <div className="relative -mt-20 mb-6 flex justify-center">
          <div className="relative group/avatar">
            {data.logo_url ? (
              <div className="relative">
                <img
                  src={data.logo_url}
                  alt="Company Logo"
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-2xl bg-white object-contain group-hover/avatar:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 rounded-2xl bg-gray-500/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300"></div>
              </div>
            ) : (
              <div
                className={`w-32 h-32 rounded-2xl border-4 border-white shadow-2xl bg-gray-100 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 ${
                  dragOver ? 'border-blue-400 bg-blue-50' : ''
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => logoInputRef.current?.click()}
              >
                {uploading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <span className="text-xs text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-3xl font-bold text-gray-700">
                      {getInitials(data.name)}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-2xl">
                      <CloudArrowUpIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Floating Upload Button */}
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-xl transition-all duration-200 hover:scale-110 group-hover/avatar:rotate-12"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <CameraIcon className="w-5 h-5" />
              )}
            </button>

            {/* Success Badge */}
            {data.logo_url && (
              <div className="absolute -top-2 -left-2 p-1 bg-green-500 rounded-full shadow-lg">
                <CheckCircleIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Company Info */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data.name || 'Your Company Name'}
          </h1>
          <p className="text-gray-600 flex items-center justify-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            {data.city && data.state ? `${data.city}, ${data.state}` : 'Add your location'}
          </p>
        </div>

        {/* Enhanced Upload Guidelines */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PhotoIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                Professional Upload Guidelines
                <SparklesIcon className="w-5 h-5 ml-2 text-yellow-500" />
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span><strong>Logo:</strong> Square format (200x200px+)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span><strong>Banner:</strong> Wide format (1200x300px+)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span><strong>Formats:</strong> PNG, JPG, GIF</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span><strong>Size:</strong> Max 5MB per file</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CompanyAvatar;
