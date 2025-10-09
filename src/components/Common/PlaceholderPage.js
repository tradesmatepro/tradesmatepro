import React from 'react';
import PageHeader from './PageHeader';

const PlaceholderPage = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  description,
  features = []
}) => {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      
      <div className="max-w-3xl mx-auto">
        <div className="card text-center">
          {Icon && (
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Icon className="w-8 h-8 text-primary-600" />
            </div>
          )}
          
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Coming Soon
          </h3>
          
          {description && (
            <p className="text-gray-600 mb-6">
              {description}
            </p>
          )}
          
          {features.length > 0 && (
            <div className="text-left">
              <h4 className="font-medium text-gray-900 mb-3">Planned Features:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              This feature is currently in development and will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
