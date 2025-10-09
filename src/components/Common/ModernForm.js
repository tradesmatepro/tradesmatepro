import React from 'react';
import { 
  ExclamationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

// Modern form container
export const ModernForm = ({ children, onSubmit, className = '' }) => (
  <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
    {children}
  </form>
);

// Modern form group
export const ModernFormGroup = ({ children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {children}
  </div>
);

// Modern form label
export const ModernFormLabel = ({ 
  children, 
  required = false, 
  className = '',
  htmlFor 
}) => (
  <label 
    htmlFor={htmlFor}
    className={`block text-sm font-semibold text-gray-700 ${className}`}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

// Modern input field
export const ModernInput = ({ 
  type = 'text',
  error,
  success,
  icon: Icon,
  className = '',
  ...props 
}) => {
  const baseClasses = `
    w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 bg-white shadow-sm
    focus:outline-none focus:ring-4 focus:ring-opacity-20
    ${Icon ? 'pl-12' : ''}
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : success
      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300'
    }
  `;

  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className={`w-5 h-5 ${error ? 'text-red-400' : success ? 'text-green-400' : 'text-gray-400'}`} />
        </div>
      )}
      <input
        type={type}
        className={`${baseClasses} ${className}`}
        {...props}
      />
      {error && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
        </div>
      )}
      {success && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <CheckCircleIcon className="w-5 h-5 text-green-400" />
        </div>
      )}
    </div>
  );
};

// Modern password input with toggle
export const ModernPasswordInput = ({ 
  error,
  success,
  className = '',
  ...props 
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const baseClasses = `
    w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 bg-white shadow-sm
    focus:outline-none focus:ring-4 focus:ring-opacity-20
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : success
      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300'
    }
  `;

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        className={`${baseClasses} ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-4 flex items-center"
      >
        {showPassword ? (
          <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
        ) : (
          <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
        )}
      </button>
    </div>
  );
};

// Modern textarea
export const ModernTextarea = ({ 
  error,
  success,
  rows = 4,
  className = '',
  ...props 
}) => {
  const baseClasses = `
    w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 bg-white shadow-sm resize-none
    focus:outline-none focus:ring-4 focus:ring-opacity-20
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : success
      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300'
    }
  `;

  return (
    <textarea
      rows={rows}
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};

// Modern select dropdown
export const ModernSelect = ({ 
  error,
  success,
  children,
  className = '',
  ...props 
}) => {
  const baseClasses = `
    w-full px-4 py-3 pr-10 border-2 rounded-xl transition-all duration-200 bg-white shadow-sm
    focus:outline-none focus:ring-4 focus:ring-opacity-20 appearance-none
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : success
      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300'
    }
  `;

  return (
    <div className="relative">
      <select className={`${baseClasses} ${className}`} {...props}>
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

// Modern checkbox
export const ModernCheckbox = ({ 
  label,
  error,
  className = '',
  ...props 
}) => (
  <div className={`flex items-center ${className}`}>
    <input
      type="checkbox"
      className={`w-5 h-5 rounded border-2 transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
        error 
          ? 'border-red-300 text-red-600 focus:ring-red-500' 
          : 'border-gray-300 text-blue-600 focus:ring-blue-500'
      }`}
      {...props}
    />
    {label && (
      <label className="ml-3 text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
  </div>
);

// Modern radio button
export const ModernRadio = ({ 
  label,
  error,
  className = '',
  ...props 
}) => (
  <div className={`flex items-center ${className}`}>
    <input
      type="radio"
      className={`w-5 h-5 border-2 transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
        error 
          ? 'border-red-300 text-red-600 focus:ring-red-500' 
          : 'border-gray-300 text-blue-600 focus:ring-blue-500'
      }`}
      {...props}
    />
    {label && (
      <label className="ml-3 text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
  </div>
);

// Modern form error message
export const ModernFormError = ({ children, className = '' }) => (
  <div className={`flex items-center space-x-2 text-sm text-red-600 ${className}`}>
    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
    <span>{children}</span>
  </div>
);

// Modern form success message
export const ModernFormSuccess = ({ children, className = '' }) => (
  <div className={`flex items-center space-x-2 text-sm text-green-600 ${className}`}>
    <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
    <span>{children}</span>
  </div>
);

// Modern form help text
export const ModernFormHelp = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

// Modern form buttons container
export const ModernFormButtons = ({ children, className = '' }) => (
  <div className={`flex items-center justify-end space-x-4 pt-6 border-t border-gray-100 ${className}`}>
    {children}
  </div>
);

// Modern submit button
export const ModernSubmitButton = ({ 
  children,
  loading = false,
  variant = 'primary',
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-200',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-200',
    secondary: 'bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 shadow-lg'
  };

  return (
    <button
      type="submit"
      disabled={loading}
      className={`
        inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold
        transition-all duration-200 hover:scale-105 hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
      ) : null}
      {children}
    </button>
  );
};

// Modern cancel button
export const ModernCancelButton = ({ 
  children,
  className = '',
  ...props 
}) => (
  <button
    type="button"
    className={`
      inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold
      bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50
      transition-all duration-200 hover:scale-105 shadow-lg
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
);
