import React from 'react';

/**
 * Enhanced Error Boundary for Developer Tools
 * Captures and reports React component errors with detailed information
 */
class DevToolsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Capture error details
    this.setState({
      error,
      errorInfo
    });

    // Log error to developer tools if available
    if (window.devLogger) {
      window.devLogger.addError({
        type: 'react-component',
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        props: this.props.componentName ? { componentName: this.props.componentName } : {}
      });
    }

    // Log to console for debugging
    console.error('🚨 React Error Boundary caught an error:', error);
    console.error('📍 Component Stack:', errorInfo.componentStack);

    // Report to external error tracking service if configured
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReportError = () => {
    const errorReport = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: {
        message: this.state.error?.message,
        stack: this.state.error?.stack,
        name: this.state.error?.name
      },
      errorInfo: this.state.errorInfo,
      componentName: this.props.componentName,
      userId: this.props.userId,
      companyId: this.props.companyId
    };

    // Create downloadable error report
    const blob = new Blob([JSON.stringify(errorReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${this.state.errorId}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('📄 Error report downloaded:', errorReport);
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">🚨</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-lg font-medium text-red-900">
                  Something went wrong
                </h1>
                <p className="text-sm text-red-700">
                  {this.props.componentName ? `Error in ${this.props.componentName} component` : 'A React component error occurred'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
                <p className="text-sm text-red-700 font-mono">
                  {this.state.error?.message || 'Unknown error'}
                </p>
                {this.state.errorId && (
                  <p className="text-xs text-red-600 mt-2">
                    Error ID: {this.state.errorId}
                  </p>
                )}
              </div>
            </div>

            {/* Error Stack Trace (collapsible) */}
            {this.state.error?.stack && (
              <details className="mb-6">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 mb-2">
                  View Stack Trace
                </summary>
                <div className="bg-gray-50 border rounded-md p-3 overflow-x-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}

            {/* Component Stack Trace (collapsible) */}
            {this.state.errorInfo?.componentStack && (
              <details className="mb-6">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 mb-2">
                  View Component Stack
                </summary>
                <div className="bg-gray-50 border rounded-md p-3 overflow-x-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={this.handleRetry}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                🔄 Try Again
              </button>
              
              <button
                onClick={this.handleReportError}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                📄 Download Error Report
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                🏠 Go Home
              </button>
            </div>

            {/* Developer Tools Link */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">
                For developers: This error has been logged to the Developer Tools.
              </p>
              <button
                onClick={() => window.location.href = '/developer-tools'}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                🛠️ Open Developer Tools
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export const withErrorBoundary = (WrappedComponent, componentName) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <DevToolsErrorBoundary 
        componentName={componentName}
        userId={props.userId}
        companyId={props.companyId}
      >
        <WrappedComponent {...props} />
      </DevToolsErrorBoundary>
    );
  };
};

/**
 * Hook to manually report errors to the error tracking system
 */
export const useErrorReporting = () => {
  const reportError = (error, context = {}) => {
    const errorReport = {
      type: 'manual',
      message: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Log to developer tools if available
    if (window.devLogger) {
      window.devLogger.addError(errorReport);
    }

    // Log to console
    console.error('🚨 Manual error report:', errorReport);
  };

  return { reportError };
};

export default DevToolsErrorBoundary;
