import { useState } from 'react';

/**
 * useConfirmation Hook
 * 
 * Provides a simple API to show modern confirmation modals
 * Replaces window.confirm() and window.alert() throughout the app
 * 
 * Usage:
 * const { modal, setModal, confirm, success, error, info, warning } = useConfirmation();
 * 
 * // Show confirmation
 * await confirm({
 *   title: 'Delete Job?',
 *   message: 'Are you sure you want to delete this job?',
 *   confirmText: 'Delete',
 *   isDangerous: true
 * });
 * 
 * // Show success
 * success({
 *   title: 'Success!',
 *   message: 'Job deleted successfully'
 * });
 * 
 * // Show error
 * error({
 *   title: 'Error',
 *   message: 'Failed to delete job'
 * });
 */

export const useConfirmation = () => {
  const [modal, setModal] = useState(null);

  const confirm = (options) => {
    return new Promise((resolve) => {
      const modalConfig = {
        isOpen: true,
        type: 'confirm',
        title: options.title || 'Confirm',
        message: options.message || 'Are you sure?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        secondaryText: options.secondaryText || null,
        isDangerous: options.isDangerous || false,
        onConfirm: () => {
          console.log('🗑️ Modal: User clicked Confirm');
          setModal(null);
          resolve('confirm');
        },
        onSecondary: options.secondaryText ? () => {
          console.log('🗑️ Modal: User clicked Secondary (Archive)');
          setModal(null);
          resolve('secondary');
        } : null,
        onCancel: () => {
          console.log('🗑️ Modal: User clicked Cancel');
          setModal(null);
          resolve(false);
        }
      };
      console.log('🗑️ useConfirmation: Setting modal state:', modalConfig);
      setModal(modalConfig);
    });
  };

  const success = (options) => {
    setModal({
      isOpen: true,
      type: 'success',
      title: options.title || 'Success!',
      message: options.message || 'Operation completed successfully',
      onClose: () => setModal(null)
    });
  };

  const error = (options) => {
    setModal({
      isOpen: true,
      type: 'error',
      title: options.title || 'Error',
      message: options.message || 'An error occurred',
      onClose: () => setModal(null)
    });
  };

  const info = (options) => {
    setModal({
      isOpen: true,
      type: 'info',
      title: options.title || 'Information',
      message: options.message || 'Here is some information',
      onClose: () => setModal(null)
    });
  };

  const warning = (options) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type: 'warning',
        title: options.title || 'Warning',
        message: options.message || 'Please be careful',
        confirmText: options.confirmText || 'Continue',
        cancelText: options.cancelText || 'Cancel',
        isDangerous: options.isDangerous || false,
        onConfirm: () => {
          setModal(null);
          resolve(true);
        },
        onCancel: () => {
          setModal(null);
          resolve(false);
        }
      });
    });
  };

  const close = () => {
    setModal(null);
  };

  return {
    modal,
    setModal,
    confirm,
    success,
    error,
    info,
    warning,
    close
  };
};

export default useConfirmation;

