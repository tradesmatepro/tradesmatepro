import React from 'react';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from './ModernPageHeader';
import '../styles/modern-enhancements.css';

/**
 * ModernPageLayout - Unified modern page layout component
 * Provides consistent header, stats, and content area styling
 */
export const ModernPageLayout = ({
  title,
  subtitle,
  icon: Icon,
  stats = [],
  actions = [],
  children,
  loading = false,
  className = ''
}) => (
  <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
    {/* Header Section */}
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
          </div>
          {actions.length > 0 && (
            <div className="flex gap-3">
              {actions.map((action, idx) => (
                <ModernActionButton key={idx} {...action} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Stats Section */}
    {stats.length > 0 && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <ModernStatCard key={idx} {...stat} />
          ))}
        </div>
      </div>
    )}

    {/* Content Section */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

/**
 * ModernContentCard - Reusable content card with modern styling
 */
export const ModernContentCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  className = '',
  hoverable = true
}) => (
  <div className={`
    bg-white rounded-2xl border border-gray-200 shadow-sm
    ${hoverable ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : ''}
    ${className}
  `}>
    {(title || Icon) && (
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div>
            {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    )}
    <div className="px-6 py-4">
      {children}
    </div>
    {footer && (
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        {footer}
      </div>
    )}
  </div>
);

/**
 * ModernGrid - Responsive grid layout
 */
export const ModernGrid = ({ children, cols = 3, gap = 6, className = '' }) => (
  <div className={`
    grid gap-${gap}
    grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols}
    ${className}
  `}>
    {children}
  </div>
);

/**
 * ModernSection - Section wrapper with title
 */
export const ModernSection = ({ title, subtitle, children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {title && (
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

/**
 * ModernEmptyState - Empty state component
 */
export const ModernEmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => (
  <div className={`
    flex flex-col items-center justify-center py-12 px-4
    bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300
    ${className}
  `}>
    {Icon && (
      <div className="p-4 bg-gray-200 rounded-full mb-4">
        <Icon className="w-8 h-8 text-gray-600" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    {description && <p className="text-gray-600 text-center mb-6 max-w-sm">{description}</p>}
    {action && (
      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        {action.label}
      </button>
    )}
  </div>
);

export default ModernPageLayout;

