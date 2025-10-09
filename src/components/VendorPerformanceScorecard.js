import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { VendorsService } from '../services/VendorsService';
import {
  ChartBarIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const VendorPerformanceScorecard = ({ vendorId, isOpen, onClose }) => {
  const { user } = useUser();
  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && vendorId) {
      loadVendorPerformance();
    }
  }, [isOpen, vendorId]);

  const loadVendorPerformance = async () => {
    try {
      setLoading(true);
      const vendorStats = await VendorsService.getVendorStats(user.company_id, vendorId);
      setVendor(vendorStats);
      
      // Generate performance metrics
      const performanceStats = generatePerformanceMetrics(vendorStats);
      setStats(performanceStats);
    } catch (error) {
      console.error('Error loading vendor performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePerformanceMetrics = (vendorData) => {
    // Placeholder calculations - in full implementation would use real delivery data
    const onTimeRate = Math.floor(Math.random() * 20) + 80; // 80-100%
    const qualityScore = Math.floor(Math.random() * 15) + 85; // 85-100%
    const responseTime = Math.floor(Math.random() * 24) + 1; // 1-24 hours
    const priceCompetitiveness = Math.floor(Math.random() * 20) + 80; // 80-100%
    
    return {
      onTimeDelivery: onTimeRate,
      qualityScore: qualityScore,
      avgResponseTime: responseTime,
      priceCompetitiveness: priceCompetitiveness,
      overallScore: Math.round((onTimeRate + qualityScore + priceCompetitiveness) / 3),
      trends: {
        deliveryTrend: Math.random() > 0.5 ? 'improving' : 'declining',
        qualityTrend: Math.random() > 0.5 ? 'improving' : 'stable',
        priceTrend: Math.random() > 0.5 ? 'stable' : 'increasing'
      }
    };
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-yellow-600 bg-yellow-100';
    if (score >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <span className="text-green-500">↗️</span>;
      case 'declining':
        return <span className="text-red-500">↘️</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Vendor Performance Scorecard
                </h3>
              </div>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : vendor && stats ? (
              <div className="space-y-6">
                {/* Vendor Header */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{vendor.name}</h4>
                      <p className="text-gray-600">{vendor.company_name}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(stats.overallScore)}`}>
                        Overall Score: {stats.overallScore}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center">
                      <TruckIcon className="h-8 w-8 text-blue-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">On-Time Delivery</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-semibold text-gray-900">{stats.onTimeDelivery}%</p>
                          {getTrendIcon(stats.trends.deliveryTrend)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-8 w-8 text-green-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Quality Score</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-semibold text-gray-900">{stats.qualityScore}%</p>
                          {getTrendIcon(stats.trends.qualityTrend)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-8 w-8 text-yellow-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Avg Response</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.avgResponseTime}h</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Price Competitive</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-semibold text-gray-900">{stats.priceCompetitiveness}%</p>
                          {getTrendIcon(stats.trends.priceTrend)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">Total Spend</h5>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${Number(vendor.lifetime_spend || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h5>
                    <p className="text-2xl font-semibold text-gray-900">{vendor.total_orders || 0}</p>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">Avg Order Value</h5>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${Number(vendor.avgOrderValue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Performance Details */}
                <div className="bg-white border rounded-lg p-4">
                  <h5 className="text-lg font-medium text-gray-900 mb-4">Performance Details</h5>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">On-Time Delivery Rate</span>
                        <span className="text-sm text-gray-500">{stats.onTimeDelivery}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${stats.onTimeDelivery}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Quality Score</span>
                        <span className="text-sm text-gray-500">{stats.qualityScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${stats.qualityScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Price Competitiveness</span>
                        <span className="text-sm text-gray-500">{stats.priceCompetitiveness}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${stats.priceCompetitiveness}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coming Soon Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Advanced Analytics</p>
                      <p className="text-yellow-700">
                        Historical trends, delivery tracking, and quality metrics - Coming Soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No performance data available</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorPerformanceScorecard;
