import React, { useState } from 'react';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernTable from '../components/Common/ModernTable';
import ModernCard, { ModernCardHeader, ModernCardBody, ModernCardFooter, ModernMetricCard, ModernBadge } from '../components/Common/ModernCard';
import { ModernForm, ModernFormGroup, ModernFormLabel, ModernInput, ModernSelect, ModernSubmitButton, ModernCancelButton } from '../components/Common/ModernForm';
import '../styles/modern-enhancements.css';

import {
  SparklesIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const ModernUIDemo = () => {
  const [showForm, setShowForm] = useState(false);

  // Sample data for demonstrations
  const sampleStats = [
    { label: 'Active Users', value: '2,847' },
    { label: 'Revenue', value: '$125K' },
    { label: 'Growth', value: '+18%' }
  ];

  const sampleTableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', revenue: 15000 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive', revenue: 8500 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active', revenue: 22000 },
  ];

  const tableColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <ModernBadge variant={row.status === 'Active' ? 'success' : 'secondary'}>
          {row.status}
        </ModernBadge>
      )
    },
    { 
      header: 'Revenue', 
      accessor: 'revenue',
      cell: (row) => `$${row.revenue.toLocaleString()}`
    }
  ];

  const tableActions = [
    { icon: EyeIcon, onClick: (row) => alert(`View ${row.name}`), title: 'View' },
    { icon: PencilIcon, onClick: (row) => alert(`Edit ${row.name}`), title: 'Edit' },
    { icon: TrashIcon, onClick: (row) => alert(`Delete ${row.name}`), title: 'Delete', className: 'text-red-400 hover:text-red-600' }
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header Demo */}
      <ModernPageHeader
        title="Modern UI Showcase"
        subtitle="Experience the new TradeMate Pro visual design system with enhanced components and animations"
        icon={SparklesIcon}
        gradient="purple"
        stats={sampleStats}
        actions={[
          {
            label: 'Create New',
            icon: PlusIcon,
            onClick: () => setShowForm(true)
          }
        ]}
      />

      {/* Modern Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernStatCard
          title="Total Customers"
          value="1,247"
          icon={UserGroupIcon}
          gradient="blue"
          change="+12%"
          changeType="increase"
          trend={[850, 920, 1050, 1150, 1200, 1230, 1247]}
          onClick={() => alert('Navigate to Customers')}
        />
        <ModernStatCard
          title="Monthly Revenue"
          value="$89,500"
          icon={CurrencyDollarIcon}
          gradient="green"
          change="+8.2%"
          changeType="increase"
          trend={[75000, 78000, 82000, 85000, 87000, 88500, 89500]}
          onClick={() => alert('Navigate to Reports')}
        />
        <ModernStatCard
          title="Active Jobs"
          value="156"
          icon={BriefcaseIcon}
          gradient="orange"
          change="-3%"
          changeType="decrease"
          trend={[180, 175, 170, 165, 160, 158, 156]}
          onClick={() => alert('Navigate to Jobs')}
        />
        <ModernStatCard
          title="Completion Rate"
          value="94.2%"
          icon={CheckCircleIcon}
          gradient="indigo"
          change="+2.1%"
          changeType="increase"
          trend={[90, 91, 92, 93, 93.5, 94, 94.2]}
          onClick={() => alert('Navigate to Analytics')}
        />
      </div>

      {/* Modern Cards Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard className="hover-lift">
          <ModernCardHeader
            title="Recent Activity"
            subtitle="Latest updates from your team"
            icon={ClockIcon}
            gradient="blue"
            action={
              <ModernActionButton variant="secondary" size="sm">
                View All
              </ModernActionButton>
            }
          />
          <ModernCardBody>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New customer added</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Job completed</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Invoice paid</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </ModernCardBody>
        </ModernCard>

        <ModernCard className="hover-lift">
          <ModernCardHeader
            title="Performance Metrics"
            subtitle="Key performance indicators"
            icon={ChartBarIcon}
            gradient="green"
          />
          <ModernCardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
                <span className="text-sm font-bold text-green-600">98.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: '98.5%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">On-Time Delivery</span>
                <span className="text-sm font-bold text-blue-600">94.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '94.2%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Revenue Growth</span>
                <span className="text-sm font-bold text-purple-600">+18.3%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </ModernCardBody>
        </ModernCard>
      </div>

      {/* Modern Table Demo */}
      <ModernCard>
        <ModernCardHeader
          title="Customer Data"
          subtitle="Manage your customer relationships"
          icon={UserGroupIcon}
          gradient="blue"
          action={
            <ModernActionButton variant="primary" size="sm" icon={PlusIcon}>
              Add Customer
            </ModernActionButton>
          }
        />
        <ModernCardBody className="p-0">
          <ModernTable
            data={sampleTableData}
            columns={tableColumns}
            actions={tableActions}
            searchable={true}
            sortable={true}
            selectable={true}
          />
        </ModernCardBody>
      </ModernCard>

      {/* Modern Form Demo */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Create New Item</h3>
              <p className="text-sm text-gray-600">Fill out the form below</p>
            </div>
            <div className="px-6 py-4">
              <ModernForm>
                <ModernFormGroup>
                  <ModernFormLabel htmlFor="name" required>Name</ModernFormLabel>
                  <ModernInput
                    id="name"
                    placeholder="Enter name"
                    icon={UserGroupIcon}
                  />
                </ModernFormGroup>
                
                <ModernFormGroup>
                  <ModernFormLabel htmlFor="email" required>Email</ModernFormLabel>
                  <ModernInput
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                  />
                </ModernFormGroup>
                
                <ModernFormGroup>
                  <ModernFormLabel htmlFor="status">Status</ModernFormLabel>
                  <ModernSelect id="status">
                    <option value="">Select status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </ModernSelect>
                </ModernFormGroup>
                
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                  <ModernCancelButton onClick={() => setShowForm(false)}>
                    Cancel
                  </ModernCancelButton>
                  <ModernSubmitButton>
                    Create Item
                  </ModernSubmitButton>
                </div>
              </ModernForm>
            </div>
          </div>
        </div>
      )}

      {/* Color Palette Demo */}
      <ModernCard>
        <ModernCardHeader
          title="Design System Colors"
          subtitle="Modern gradient color palette"
          icon={SparklesIcon}
          gradient="purple"
        />
        <ModernCardBody>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mx-auto mb-2 shadow-lg"></div>
              <p className="text-xs font-medium text-gray-700">Blue</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mx-auto mb-2 shadow-lg"></div>
              <p className="text-xs font-medium text-gray-700">Green</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl mx-auto mb-2 shadow-lg"></div>
              <p className="text-xs font-medium text-gray-700">Purple</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl mx-auto mb-2 shadow-lg"></div>
              <p className="text-xs font-medium text-gray-700">Orange</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl mx-auto mb-2 shadow-lg"></div>
              <p className="text-xs font-medium text-gray-700">Red</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mx-auto mb-2 shadow-lg"></div>
              <p className="text-xs font-medium text-gray-700">Indigo</p>
            </div>
          </div>
        </ModernCardBody>
      </ModernCard>
    </div>
  );
};

export default ModernUIDemo;
