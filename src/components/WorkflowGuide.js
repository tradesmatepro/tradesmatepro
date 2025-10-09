import React from 'react';
import { 
  DocumentTextIcon, 
  BriefcaseIcon, 
  ClipboardDocumentListIcon, 
  CurrencyDollarIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const WorkflowGuide = ({ currentStep = 'quote' }) => {
  const steps = [
    {
      id: 'quote',
      name: 'Quote',
      description: 'Create estimate',
      icon: DocumentTextIcon,
      color: 'blue'
    },
    {
      id: 'job',
      name: 'Job',
      description: 'Auto-created when accepted',
      icon: BriefcaseIcon,
      color: 'green'
    },
    {
      id: 'workorder',
      name: 'Work Order',
      description: 'Schedule & assign',
      icon: ClipboardDocumentListIcon,
      color: 'purple'
    },
    {
      id: 'invoice',
      name: 'Invoice',
      description: 'Bill completed work',
      icon: CurrencyDollarIcon,
      color: 'orange'
    }
  ];

  const getStepClasses = (step) => {
    const isActive = step.id === currentStep;
    const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors";
    
    if (isActive) {
      return `${baseClasses} bg-${step.color}-100 text-${step.color}-800 border border-${step.color}-200`;
    }
    
    return `${baseClasses} text-gray-500`;
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Workflow Pipeline</h3>
        <span className="text-xs text-gray-500">Industry Standard Process</span>
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          
          return (
            <React.Fragment key={step.id}>
              <div className={getStepClasses(step)}>
                <Icon className="w-4 h-4" />
                <div>
                  <div className="font-medium">{step.name}</div>
                  <div className="text-xs opacity-75">{step.description}</div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <ArrowRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        <strong>How it works:</strong> Create quotes for customers → Accept quotes to create jobs → Schedule jobs to create work orders → Complete work orders to create invoices
      </div>
    </div>
  );
};

export default WorkflowGuide;
