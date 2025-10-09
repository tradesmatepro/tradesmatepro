import React, { useState, useRef, useEffect } from 'react';
import {
  XMarkIcon,
  CameraIcon,
  QrCodeIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BarcodeScannerModal = ({ isOpen, onClose, onScanResult, scanMode = 'lookup' }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [scanMethod, setScanMethod] = useState('camera'); // 'camera', 'manual'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup camera stream when modal closes
  useEffect(() => {
    if (!isOpen && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access denied. Please enable camera permissions or use manual input.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      const result = {
        value: manualInput.trim(),
        method: 'MANUAL',
        timestamp: new Date().toISOString()
      };
      setScanResult(result);
      onScanResult(result);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setError(null);
    setManualInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <QrCodeIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {scanMode === 'lookup' ? 'Scan Item' : 'Scan for Inventory'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Scan Method Selector */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setScanMethod('camera')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                scanMethod === 'camera'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CameraIcon className="h-4 w-4 inline mr-2" />
              Camera Scan
            </button>
            <button
              onClick={() => setScanMethod('manual')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                scanMethod === 'manual'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MagnifyingGlassIcon className="h-4 w-4 inline mr-2" />
              Manual Entry
            </button>
          </div>
        </div>

        {/* Camera Scanning */}
        {scanMethod === 'camera' && (
          <div className="mb-4">
            {!isScanning ? (
              <div className="text-center py-8">
                <CameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Click to start camera and scan barcodes or QR codes
                </p>
                <button
                  onClick={startCamera}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Camera
                </button>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-black rounded-lg"
                />
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-red-500 bg-red-500 bg-opacity-10 rounded-lg">
                    <div className="text-center text-white text-sm mt-2">
                      Position barcode here
                    </div>
                  </div>
                </div>
                <button
                  onClick={stopCamera}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manual Entry */}
        {scanMethod === 'manual' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Barcode, QR Code, SKU, or Part Number
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scan or type code here..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Search
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supports: Barcode, QR Code, UPC, SKU, Part Number
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <div className="flex-1">
                <span className="text-green-700 text-sm font-medium">Scanned: </span>
                <span className="text-green-700 text-sm">{scanResult.value}</span>
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <QrCodeIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Enhanced Scanning Coming Soon
              </h4>
              <p className="text-xs text-blue-700">
                • Real-time barcode/QR code detection<br/>
                • Wireless scanner integration<br/>
                • Batch scanning capabilities<br/>
                • Mobile app with offline support
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Scanning Tips:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Hold device steady and ensure good lighting</li>
            <li>• Position barcode within the red frame</li>
            <li>• For QR codes, include the entire square</li>
            <li>• Use manual entry if camera scanning fails</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={resetScan}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
