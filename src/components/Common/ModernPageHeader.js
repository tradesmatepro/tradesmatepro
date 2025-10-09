import React from 'react';
import {
  SparklesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const ModernPageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  gradient = 'blue',
  stats = [],
  actions = [],
  className = ''
}) => {
  const gradientClasses = {
    blue: 'from-blue-600 via-blue-500 to-indigo-600',
    green: 'from-green-600 via-emerald-500 to-teal-600',
    purple: 'from-purple-600 via-violet-500 to-indigo-600',
    orange: 'from-orange-600 via-amber-500 to-yellow-600',
    red: 'from-red-600 via-rose-500 to-pink-600',
    indigo: 'from-indigo-600 via-blue-500 to-purple-600',
    gray: 'from-gray-700 via-gray-600 to-slate-700'
  };

  const iconBgClasses = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-violet-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    indigo: 'from-indigo-500 to-blue-600',
    gray: 'from-gray-600 to-slate-700'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl mb-8 ${className}`}>
      {/* Background with gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[gradient]} opacity-90`}></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-8 -right-8 w-16 h-16 bg-white opacity-5 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white opacity-5 rounded-full"></div>
        <div className="absolute bottom-4 left-8 w-8 h-8 bg-white opacity-10 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative px-8 py-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {Icon && (
              <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${iconBgClasses[gradient]} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-white">{title}</h1>
                <SparklesIcon className="w-6 h-6 text-white opacity-80" />
              </div>
              
              {subtitle && (
                <p className="text-lg text-white opacity-90 max-w-2xl">{subtitle}</p>
              )}

              {/* Quick stats */}
              {stats.length > 0 && (
                <div className="flex items-center space-x-6 mt-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 ${stat.onClick ? 'cursor-pointer hover:bg-white hover:bg-opacity-10 px-2 py-1 rounded-lg transition-all duration-200' : ''}`}
                      onClick={stat.onClick}
                    >
                      <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
                      <span className="text-white opacity-90 text-sm font-medium">
                        {stat.label}: <span className="font-bold">{stat.value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex items-center space-x-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20 hover:scale-105"
                >
                  {action.icon && <action.icon className="w-4 h-4" />}
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
      </div>
    </div>
  );
};

// Enhanced stat card component
export const ModernStatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  gradient = 'blue',
  onClick,
  loading = false,
  trend = []
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
    <div 
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Gradient top border */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClasses[gradient]}`}></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 w-16 h-16 bg-gray-300 rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${gradientClasses[gradient]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {change && (
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
              changeType === 'increase' 
                ? 'text-green-700 bg-green-100 border border-green-200' 
                : 'text-red-700 bg-red-100 border border-red-200'
            }`}>
              {changeType === 'increase' ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ChartBarIcon className="w-4 h-4" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
          
          {loading ? (
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          )}
        </div>

        {/* Mini trend line */}
        {trend.length > 0 && (
          <div className="mt-4 flex items-end space-x-1 h-8">
            {trend.map((point, index) => (
              <div
                key={index}
                className={`bg-gradient-to-t ${gradientClasses[gradient]} rounded-sm opacity-60 group-hover:opacity-80 transition-opacity duration-200`}
                style={{ 
                  height: `${Math.max(10, (point / Math.max(...trend)) * 100)}%`,
                  width: '8px'
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced action button component
export const ModernActionButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon: Icon,
  loading = false,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-200',
    warning: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg shadow-orange-200',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-200',
    secondary: 'bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 shadow-lg'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center space-x-2 font-semibold rounded-xl
        transition-all duration-200 hover:scale-105 hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <BoltIcon className="w-5 h-5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default ModernPageHeader;
