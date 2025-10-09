import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const Tooltip = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 max-w-xs whitespace-normal shadow-lg">
            {content}
          </div>
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
};

// Stock Status Tooltip Component
export const StockStatusTooltip = ({ type, children }) => {
  const tooltipContent = {
    onHand: "Total physical inventory currently in this location",
    reserved: "Items allocated to open jobs but not yet consumed",
    available: "Items available for new allocations (On Hand - Reserved)"
  };

  return (
    <Tooltip content={tooltipContent[type]} position="top">
      <div className="flex items-center">
        {children}
        <InformationCircleIcon className="h-3 w-3 ml-1 text-gray-400" />
      </div>
    </Tooltip>
  );
};

export default Tooltip;
