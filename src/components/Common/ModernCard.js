import React from 'react';
import {
  ChevronRightIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const ModernCard = ({ 
  children, 
  className = '', 
  gradient = false,
  hover = true,
  onClick,
  ...props 
}) => {
  const baseClasses = `
    bg-white rounded-2xl shadow-lg border-0 overflow-hidden transition-all duration-300
    ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''}
    ${className}
  `;

  return (
    <div className={baseClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export const ModernCardHeader = ({ 
  title, 
  subtitle, 
  icon: Icon,
  action,
  gradient = 'blue',
  className = ''
}) => {
  const gradientClasses = {
    blue: 'from-blue-50 to-indigo-50 border-blue-200',
    green: 'from-green-50 to-emerald-50 border-green-200',
    purple: 'from-purple-50 to-violet-50 border-purple-200',
    orange: 'from-orange-50 to-amber-50 border-orange-200',
    red: 'from-red-50 to-rose-50 border-red-200',
    gray: 'from-gray-50 to-slate-50 border-gray-200'
  };

  return (
    <div className={`px-6 py-4 bg-gradient-to-r ${gradientClasses[gradient]} border-b ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>
        {action && (
          <div className="flex items-center space-x-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export const ModernCardBody = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const ModernCardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-gray-50 border-t border-gray-100 ${className}`}>
    {children}
  </div>
);

// Enhanced metric card for dashboards
export const ModernMetricCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  trend = [],
  gradient = 'blue',
  onClick,
  loading = false
}) => {
  const gradientClasses = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-violet-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    indigo: 'from-indigo-500 to-blue-600'
  };

  return (
    <ModernCard 
      onClick={onClick}
      className="group relative overflow-hidden"
    >
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClasses[gradient]}`}></div>
      
      {/* Background decoration */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-gray-100 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-200"></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${gradientClasses[gradient]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {change && (
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
              changeType === 'increase' 
                ? 'text-green-700 bg-green-100 border border-green-200' 
                : changeType === 'decrease'
                ? 'text-red-700 bg-red-100 border border-red-200'
                : 'text-gray-700 bg-gray-100 border border-gray-200'
            }`}>
              {changeType === 'increase' && <ArrowTrendingUpIcon className="w-4 h-4" />}
              {changeType === 'decrease' && <ArrowTrendingDownIcon className="w-4 h-4" />}
              <span>{change}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
          
          {loading ? (
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-200">{value}</p>
          )}
        </div>

        {/* Mini trend visualization */}
        {trend.length > 0 && (
          <div className="mt-4 flex items-end space-x-1 h-8">
            {trend.map((point, index) => (
              <div
                key={index}
                className={`bg-gradient-to-t ${gradientClasses[gradient]} rounded-sm opacity-60 group-hover:opacity-80 transition-opacity duration-200`}
                style={{ 
                  height: `${Math.max(10, (point / Math.max(...trend)) * 100)}%`,
                  width: '6px'
                }}
              ></div>
            ))}
          </div>
        )}

        {onClick && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
    </ModernCard>
  );
};

// Enhanced list item for modern lists
export const ModernListItem = ({
  title,
  subtitle,
  meta,
  avatar,
  status,
  actions = [],
  onClick,
  className = ''
}) => {
  return (
    <div 
      className={`flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 rounded-xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4 flex-1">
        {avatar && (
          <div className="flex-shrink-0">
            {avatar}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
            {status && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                {status.label}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-600 truncate">{subtitle}</p>
          )}
          {meta && (
            <p className="text-xs text-gray-500">{meta}</p>
          )}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${action.className || 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              title={action.title}
            >
              <action.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced badge component
export const ModernBadge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default ModernCard;
