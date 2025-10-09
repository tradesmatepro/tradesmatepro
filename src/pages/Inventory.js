import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArchiveBoxIcon,
  MapPinIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  WrenchScrewdriverIcon,
  QrCodeIcon,
  ClockIcon,
  TagIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import EnhancedItemsTab from '../components/Inventory/EnhancedItemsTab';
import LocationsTab from '../components/Inventory/LocationsTab';
import StockTab from '../components/Inventory/StockTab';
import MovementsTab from '../components/Inventory/MovementsTab';
import InventoryDiagnostic from '../components/Inventory/InventoryDiagnostic';
import BarcodeScannerModal from '../components/Inventory/BarcodeScannerModal';

const Inventory = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('items');
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const tabs = [
    {
      id: 'items',
      name: 'Items',
      icon: ArchiveBoxIcon,
      component: EnhancedItemsTab
    },
    {
      id: 'locations',
      name: 'Locations',
      icon: MapPinIcon,
      component: LocationsTab
    },
    {
      id: 'stock',
      name: 'Stock',
      icon: ChartBarIcon,
      component: StockTab
    },
    {
      id: 'movements',
      name: 'Movements',
      icon: ArrowsRightLeftIcon,
      component: MovementsTab
    },
    {
      id: 'scanning',
      name: 'Scanning',
      icon: QrCodeIcon,
      component: () => <ComingSoonTab feature="Barcode & QR Code Scanning" />,
      comingSoon: true
    },
    {
      id: 'cycle-counts',
      name: 'Cycle Counts',
      icon: ClockIcon,
      component: () => <ComingSoonTab feature="Cycle Count Management" />,
      comingSoon: true
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  // Deep link: /inventory?item=<id> opens items tab and detail modal
  useEffect(() => {
    const itemId = searchParams.get('item');
    if (!itemId) return;
    // Items tab handles modal; just ensure items tab is selected
    setActiveTab('items');
    // The EnhancedItemsTab does not yet auto-open by id, but users can quickly find it; we can add auto-open later.
  }, [searchParams]);

  const handleScanResult = (result) => {
    console.log('Scan result:', result);
    // TODO: Implement item lookup by barcode/QR code
    setShowBarcodeScanner(false);
  };

  // Coming Soon Component
  const ComingSoonTab = ({ feature }) => (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{feature}</h3>
        <p className="text-gray-600 mb-6">
          This advanced inventory feature is coming soon.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Coming Soon</h4>
          <p className="text-xs text-blue-700">
            Advanced {feature.toLowerCase()} capabilities are in development.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">📦 Inventory Management</h1>
                <p className="mt-2 text-primary-100">
                  Real-time stock tracking with allocation management
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">📊</div>
                    <div className="text-xs text-primary-200">Live Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">🔄</div>
                    <div className="text-xs text-primary-200">Auto Sync</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">⚡</div>
                    <div className="text-xs text-primary-200">Real-time</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowBarcodeScanner(true)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-primary-100 bg-primary-500 bg-opacity-20 border border-primary-400 rounded-md hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors"
                    title="Quick Scan"
                  >
                    <QrCodeIcon className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Quick Scan</span>
                  </button>
                  <button
                    onClick={() => setShowDiagnostic(true)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-primary-100 bg-primary-500 bg-opacity-20 border border-primary-400 rounded-md hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors"
                    title="System Diagnostic"
                  >
                    <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Diagnostic</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm relative ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon
                      className={`-ml-0.5 mr-2 h-5 w-5 ${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {tab.name}
                    {tab.comingSoon && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Coming Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>

      {/* Diagnostic Modal */}
      {showDiagnostic && (
        <InventoryDiagnostic onClose={() => setShowDiagnostic(false)} />
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScanResult={handleScanResult}
        scanMode="lookup"
      />
    </div>
  );
};

export default Inventory;
