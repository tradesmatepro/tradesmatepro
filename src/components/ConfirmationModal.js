import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Modern Confirmation Modal Component
 * 
 * Replaces old window.confirm() and window.alert() with beautiful, modern dialogs
 * Supports: confirmation, success, error, info, warning types
 * 
 * Usage:
 * const [modal, setModal] = useState(null);
 * 
 * // Show confirmation
 * setModal({
 *   type: 'confirm',
 *   title: 'Delete Job?',
 *   message: 'Are you sure you want to delete this job?',
 *   confirmText: 'Delete',
 *   cancelText: 'Cancel',
 *   onConfirm: () => { handleDelete(); setModal(null); },
 *   onCancel: () => setModal(null),
 *   isDangerous: true
 * });
 * 
 * // Show success
 * setModal({
 *   type: 'success',
 *   title: 'Success!',
 *   message: 'Job deleted successfully',
 *   onClose: () => setModal(null)
 * });
 */

const ConfirmationModal = ({
  isOpen,
  type = 'confirm', // 'confirm', 'success', 'error', 'info', 'warning'
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  secondaryText = null, // Optional second action button
  onConfirm,
  onSecondary,
  onCancel,
  onClose,
  isDangerous = false,
  isLoading = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-12 h-12 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-12 h-12 text-yellow-600" />;
      case 'info':
        return <InformationCircleIcon className="w-12 h-12 text-blue-600" />;
      case 'confirm':
      default:
        return <ExclamationTriangleIcon className="w-12 h-12 text-blue-600" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-600 to-emerald-600';
      case 'error':
        return 'bg-gradient-to-r from-red-600 to-rose-600';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-600 to-orange-600';
      case 'info':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600';
      case 'confirm':
      default:
        return 'bg-gradient-to-r from-blue-600 to-indigo-600';
    }
  };

  const getConfirmButtonColor = () => {
    if (isDangerous) return 'bg-red-600 hover:bg-red-700';
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'confirm':
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  // For success/error/info - auto-close after 3 seconds if no action buttons
  const isAutoClose = ['success', 'error', 'info'].includes(type) && !onConfirm;

  React.useEffect(() => {
    if (isAutoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAutoClose, type, onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        {/* Header */}
        <div className={`${getHeaderColor()} text-white px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors p-1"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-700 text-base leading-relaxed">{message}</p>
        </div>

        {/* Footer - Only show for confirm/warning types */}
        {(type === 'confirm' || type === 'warning') && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            {secondaryText && onSecondary && (
              <button
                onClick={onSecondary}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                {secondaryText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${getConfirmButtonColor()}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Processing...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        )}

        {/* Footer - Only show close button for success/error/info */}
        {['success', 'error', 'info'].includes(type) && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationModal;

