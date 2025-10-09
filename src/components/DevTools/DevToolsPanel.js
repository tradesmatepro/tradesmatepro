import React, { useState, useEffect, useRef } from 'react';
import {
  WrenchScrewdriverIcon,
  BugAntIcon,
  CircleStackIcon,
  CommandLineIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  PlayIcon
} from '@heroicons/react/24/outline';


// DevTools API base URL (env or global) and enable flag
const DEVTOOLS_API_BASE = (process.env.REACT_APP_DEVTOOLS_API_URL || (typeof window !== 'undefined' ? window.REACT_APP_DEVTOOLS_API_URL : '')) || '';
const DEVTOOLS_ENABLED = !!DEVTOOLS_API_BASE;

const DevToolsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  const [logs, setLogs] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [apiTests, setApiTests] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const logsEndRef = useRef(null);

  // Auto-scroll logs to bottom
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // Load latest error logs from error server (graceful fallback)
  const loadErrorLogs = async () => {
    try {
      // Check if development error server is available
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout

      if (!DEVTOOLS_ENABLED) { setLogs([]); return; }
      const filesResponse = await fetch(`${DEVTOOLS_API_BASE}/list-files`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!filesResponse.ok) {
        throw new Error(`Server responded with ${filesResponse.status}`);
      }

      const files = await filesResponse.json();

      // Find the latest.json file or most recent error log
      const latestFile = files.find(f => f === 'latest.json') ||
                        files.filter(f => f.startsWith('errors_')).sort().pop();

      if (latestFile) {
        const logResponse = await fetch(`${DEVTOOLS_API_BASE}/get-log/${latestFile}`);
        const data = await logResponse.json();
        setLogs(Array.isArray(data) ? data : []);
      } else {
        setLogs([]);
      }
    } catch (error) {
      // Silently handle development server not running - this is normal in production
      if (error.name === 'AbortError' || error.message.includes('ERR_CONNECTION_REFUSED')) {
        // Development server not running - use fallback to browser console logs
        setLogs([]);
        return;
      }
      console.warn('DevTools: Error server unavailable, using fallback logging');
      setLogs([]);
    }
  };

  // Check database status (graceful fallback)
  const checkDatabaseStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      if (!DEVTOOLS_ENABLED) {
        setDbStatus({ status: 'dev_server_offline', message: 'DevTools API not configured' });
        return;
      }
      const response = await fetch(`${DEVTOOLS_API_BASE}/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      setDbStatus({ status: 'connected', data });
    } catch (error) {
      // Gracefully handle development server not running
      if (error.name === 'AbortError' || error.message.includes('ERR_CONNECTION_REFUSED')) {
        setDbStatus({
          status: 'dev_server_offline',
          message: 'Development server offline (normal in production)'
        });
        return;
      }
      setDbStatus({ status: 'error', error: error.message });
    }
  };

  // Generate test error for testing
  const generateTestError = () => {
    try {
      // Intentionally cause an error
      throw new Error('Test error generated from DevTools panel');
    } catch (error) {
      console.error('DevTools Test Error:', error);
      // This should be captured by the error capture system
    }
  };

  // Run API tests (with graceful handling)
  const runApiTests = async () => {
    setIsRunningTests(true);
    const tests = [
      { name: 'Health Check', url: `${DEVTOOLS_API_BASE}/health`, method: 'GET' },
      { name: 'List Files', url: `${DEVTOOLS_API_BASE}/list-files`, method: 'GET' },
      { name: 'Get Latest Log', url: `${DEVTOOLS_API_BASE}/get-log/latest.json`, method: 'GET' },
      { name: 'Error Server', url: `${DEVTOOLS_API_BASE}/save-errors`, method: 'POST', body: [] },
      { name: 'AI Analysis', url: `${DEVTOOLS_API_BASE}/ai-analysis`, method: 'POST', body: { test: true, timestamp: new Date().toISOString() } },
    ];

    const results = [];
    for (const test of tests) {
      try {
        const options = {
          method: test.method,
          headers: { 'Content-Type': 'application/json' },
        };
        if (test.body) {
          options.body = JSON.stringify(test.body);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(test.url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);

        const data = await response.text();

        results.push({
          ...test,
          status: response.ok ? 'success' : 'error',
          response: data,
          statusCode: response.status
        });
      } catch (error) {
        // Handle connection refused gracefully
        const status = error.name === 'AbortError' || error.message.includes('ERR_CONNECTION_REFUSED')
          ? 'dev_server_offline'
          : 'error';

        results.push({
          ...test,
          status,
          error: status === 'dev_server_offline'
            ? 'Development server offline (normal in production)'
            : error.message
        });
      }
    }

    setApiTests(results);
    setIsRunningTests(false);
  };

  // Initialize dev tools (reduced frequency to avoid spam)
  useEffect(() => {
    loadErrorLogs();
    checkDatabaseStatus();

    // Auto-refresh logs every 30 seconds (reduced from 10s to avoid connection spam)
    const interval = setInterval(() => {
      loadErrorLogs();
      checkDatabaseStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'logs', name: 'Error Logs', icon: DocumentTextIcon },
    { id: 'database', name: 'Database', icon: CircleStackIcon },
    { id: 'api', name: 'API Tests', icon: CommandLineIcon },
    { id: 'monitor', name: 'Monitor', icon: ChartBarIcon },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'warning': return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
      case 'dev_server_offline': return <div className="w-4 h-4 bg-gray-500 rounded-full" title="Development server offline (normal in production)" />;
      default: return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Open Dev Tools"
        >
          <WrenchScrewdriverIcon className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full max-w-4xl h-96 bg-gray-900 text-white shadow-2xl z-50 border-t border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <BugAntIcon className="w-5 h-5 text-blue-400" />
          <span className="font-semibold">TradeMate Pro Dev Tools</span>
          <div className="flex items-center space-x-1 ml-4">
            {getStatusIcon(dbStatus?.status)}
            <span className="text-xs text-gray-400">
              {dbStatus?.status === 'connected' ? 'Connected' :
               dbStatus?.status === 'dev_server_offline' ? 'Dev Server Offline' : 'Disconnected'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          <XCircleIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'logs' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <span className="text-sm font-medium">Error Logs ({logs.length})</span>
              <button
                onClick={loadErrorLogs}
                className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircleIcon className="w-8 h-8 mx-auto mb-2" />
                  <p>No errors detected</p>
                  <p className="text-xs">App is running cleanly</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="bg-gray-800 rounded p-2 text-xs">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(log.severity || 'error')}
                      <span className="text-gray-400">{formatTimestamp(log.timestamp)}</span>
                      <span className="text-blue-400">{log.type}</span>
                    </div>
                    <div className="text-gray-200">{log.message}</div>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="h-full p-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Database Status</span>
              <button
                onClick={checkDatabaseStatus}
                className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Check</span>
              </button>
            </div>
            {dbStatus && (
              <div className="bg-gray-800 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(dbStatus.status)}
                  <span className="font-medium">
                    {dbStatus.status === 'connected' ? 'Connected' :
                     dbStatus.status === 'dev_server_offline' ? 'Dev Server Offline' : 'Error'}
                  </span>
                </div>
                {dbStatus.data && (
                  <pre className="text-xs text-gray-300 overflow-auto">
                    {JSON.stringify(dbStatus.data, null, 2)}
                  </pre>
                )}
                {dbStatus.error && (
                  <div className="text-red-400 text-xs">{dbStatus.error}</div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'api' && (
          <div className="h-full p-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">API Tests</span>
              <div className="flex space-x-2">
                <button
                  onClick={generateTestError}
                  className="flex items-center space-x-1 text-xs text-orange-400 hover:text-orange-300"
                >
                  <BugAntIcon className="w-4 h-4" />
                  <span>Test Error</span>
                </button>
                <button
                  onClick={runApiTests}
                  disabled={isRunningTests}
                  className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>{isRunningTests ? 'Running...' : 'Run Tests'}</span>
                </button>
              </div>
            </div>
            <div className="space-y-2 overflow-y-auto">
              {apiTests.map((test, index) => (
                <div key={index} className="bg-gray-800 rounded p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                    <span className="text-xs text-gray-400">{test.method}</span>
                    {test.statusCode && (
                      <span className="text-xs text-blue-400">{test.statusCode}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">{test.url}</div>
                  {test.response && (
                    <pre className="text-xs text-gray-300 overflow-auto max-h-20">
                      {test.response}
                    </pre>
                  )}
                  {test.error && (
                    <div className="text-red-400 text-xs">{test.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="h-full p-3">
            <div className="text-sm font-medium mb-4">System Monitor</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">Error Server</div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(DEVTOOLS_ENABLED ? 'success' : 'dev_server_offline')}
                  <span className="text-sm">{DEVTOOLS_ENABLED ? `Configured: ${DEVTOOLS_API_BASE}` : 'Disabled'}</span>
                </div>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">React App</div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon('success')}
                  <span className="text-sm">Running on :3000</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevToolsPanel;
