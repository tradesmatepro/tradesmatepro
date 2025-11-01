import React from 'react';
import {
  WrenchScrewdriverIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import WarrantyBadge from './WarrantyBadge';

/**
 * EquipmentCard Component
 * Displays a single equipment item with all details
 */
const EquipmentCard = ({ equipment, onEdit, onDelete, onViewPhotos }) => {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'retired': 'bg-yellow-100 text-yellow-800',
      'replaced': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || colors.inactive;
  };

  const photoCount = equipment.photos?.length || 0;
  const documentCount = equipment.documents?.length || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <WrenchScrewdriverIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {equipment.equipment_type || 'Unknown Equipment'}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(equipment.status)}`}>
              {equipment.status || 'active'}
            </span>
          </div>
          
          {equipment.manufacturer && (
            <p className="text-sm text-gray-600">
              {equipment.manufacturer} {equipment.model_number && `- ${equipment.model_number}`}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(equipment)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit Equipment"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(equipment)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Equipment"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Serial Number */}
      {equipment.serial_number && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600 mb-1">Serial Number</p>
          <p className="text-sm font-mono font-semibold text-gray-900">
            {equipment.serial_number}
          </p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Installation Date */}
        {equipment.install_date && (
          <div className="flex items-start gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600">Installed</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(equipment.install_date)}
              </p>
            </div>
          </div>
        )}

        {/* Last Service */}
        {equipment.last_service_date && (
          <div className="flex items-start gap-2">
            <ClockIcon className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600">Last Service</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(equipment.last_service_date)}
              </p>
            </div>
          </div>
        )}

        {/* Installed By */}
        {equipment.installed_by_name && (
          <div className="flex items-start gap-2">
            <UserIcon className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600">Installed By</p>
              <p className="text-sm font-medium text-gray-900">
                {equipment.installed_by_name}
              </p>
            </div>
          </div>
        )}

        {/* Location */}
        {equipment.location_description && (
          <div className="flex items-start gap-2">
            <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600">Location</p>
              <p className="text-sm font-medium text-gray-900">
                {equipment.location_description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Warranty Status */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <p className="text-xs text-gray-600 mb-2">Warranty Status</p>
        <WarrantyBadge
          warrantyStartDate={equipment.warranty_start_date}
          warrantyEndDate={equipment.warranty_end_date}
          size="md"
        />
        {equipment.warranty_provider && (
          <p className="text-xs text-gray-600 mt-2">
            Provider: {equipment.warranty_provider}
          </p>
        )}
      </div>

      {/* Notes */}
      {equipment.notes && (
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-1">Notes</p>
          <p className="text-sm text-gray-700 line-clamp-2">
            {equipment.notes}
          </p>
        </div>
      )}

      {/* Photos & Documents */}
      {(photoCount > 0 || documentCount > 0) && (
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          {photoCount > 0 && (
            <button
              onClick={() => onViewPhotos(equipment)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <PhotoIcon className="w-4 h-4" />
              {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
            </button>
          )}
          {documentCount > 0 && (
            <span className="text-sm text-gray-600">
              {documentCount} {documentCount === 1 ? 'Document' : 'Documents'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EquipmentCard;

