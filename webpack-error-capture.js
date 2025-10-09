/**
 * Webpack Error Capture Plugin
 * Captures webpack build errors and sends them to our error server
 */

const axios = require('axios');

class WebpackErrorCapturePlugin {
  constructor(options = {}) {
    this.errorServerUrl = options.errorServerUrl || 'http://localhost:4000';
    this.enabled = options.enabled !== false;
  }

  apply(compiler) {
    if (!this.enabled) return;

    // Hook into compilation to capture errors during build process
    compiler.hooks.compilation.tap('WebpackErrorCapturePlugin', (compilation) => {
      // Capture module build failures (including PostCSS errors)
      compilation.hooks.failedModule.tap('WebpackErrorCapturePlugin', (module, error) => {
        this.captureModuleError(module, error);
      });

      // Capture build module errors
      compilation.hooks.buildModule.tap('WebpackErrorCapturePlugin', (module) => {
        // Store module for error context
        this.currentModule = module;
      });
    });

    // Capture compilation errors using comprehensive stats approach
    compiler.hooks.done.tap('WebpackErrorCapturePlugin', (stats) => {
      // Use stats.toJson() to get comprehensive error information
      const info = stats.toJson({ all: false, errors: true, warnings: true });

      if (stats.hasErrors()) {
        const errors = info.errors.map(error => {
          // Extract comprehensive error information from stats
          const errorInfo = {
            message: error.message || error.toString(),
            stack: error.stack,
            file: error.moduleName || error.file,
            details: error.details,
            loc: error.loc,
            timestamp: new Date().toISOString(),
            type: 'WEBPACK_BUILD_ERROR',
            severity: 'error'
          };

          // Special handling for CSS/PostCSS errors
          if (error.message && (error.message.includes('postcss-loader') ||
                                error.message.includes('postcss') ||
                                error.message.includes('tailwindcss'))) {
            errorInfo.type = 'CSS_BUILD_ERROR';
            errorInfo.category = 'CSS_COMPILATION';
          }

          // Special handling for Tailwind CSS class errors
          if (error.message && (error.message.includes('does not exist') ||
                                error.message.includes('class') ||
                                error.message.includes('@apply'))) {
            errorInfo.type = 'TAILWIND_CSS_ERROR';
            errorInfo.category = 'CSS_CLASS_MISSING';

            // Extract class name from error message
            const classMatch = error.message.match(/`([^`]+)`/);
            if (classMatch) {
              errorInfo.missingClass = classMatch[1];
            }
          }

          return errorInfo;
        });

        this.sendErrorsToServer(errors);
      }

      if (stats.hasWarnings()) {
        const warnings = info.warnings.map(warning => ({
          message: warning.message || warning.toString(),
          stack: warning.stack,
          file: warning.moduleName || warning.file,
          details: warning.details,
          loc: warning.loc,
          timestamp: new Date().toISOString(),
          type: 'WEBPACK_BUILD_WARNING',
          severity: 'warning'
        }));

        this.sendErrorsToServer(warnings);
      }
    });

    // Capture failed compilation
    compiler.hooks.failed.tap('WebpackErrorCapturePlugin', (error) => {
      const buildError = {
        message: error.message || error.toString(),
        stack: error.stack,
        timestamp: new Date().toISOString(),
        type: 'WEBPACK_COMPILATION_FAILED',
        severity: 'critical'
      };

      this.sendErrorsToServer([buildError]);
    });
  }

  captureModuleError(module, error) {
    const moduleError = {
      message: error.message || error.toString(),
      stack: error.stack,
      file: module.resource || module.identifier(),
      timestamp: new Date().toISOString(),
      type: 'MODULE_BUILD_ERROR',
      severity: 'error',
      module: {
        resource: module.resource,
        identifier: module.identifier(),
        type: module.type
      }
    };

    // Special handling for CSS/PostCSS module errors
    if (module.resource && (module.resource.includes('.css') ||
                           module.resource.includes('postcss') ||
                           module.type === 'css/mini-extract')) {
      moduleError.type = 'CSS_MODULE_ERROR';
      moduleError.category = 'CSS_COMPILATION';
    }

    // Special handling for Tailwind CSS class errors in modules
    if (error.message && (error.message.includes('does not exist') ||
                          error.message.includes('class') ||
                          error.message.includes('@apply') ||
                          error.message.includes('tailwind'))) {
      moduleError.type = 'TAILWIND_MODULE_ERROR';
      moduleError.category = 'CSS_CLASS_MISSING';

      // Extract class name from error message
      const classMatch = error.message.match(/`([^`]+)`/);
      if (classMatch) {
        moduleError.missingClass = classMatch[1];
      }
    }

    console.log(`🔍 MODULE ERROR CAPTURED: ${moduleError.type} - ${moduleError.message}`);
    this.sendErrorsToServer([moduleError]);
  }

  async sendErrorsToServer(errors) {
    try {
      // Format errors for our error server
      const formattedErrors = {
        timestamp: new Date().toISOString(),
        type: 'BUILD_ERROR_LOG',
        source: 'webpack',
        data: [{
          errors: errors.filter(e => e.severity === 'error' || e.severity === 'critical'),
          warnings: errors.filter(e => e.severity === 'warning'),
          logs: []
        }]
      };

      await axios.post(`${this.errorServerUrl}/save-errors`, formattedErrors, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      console.log(`📤 Webpack: Sent ${errors.length} build errors/warnings to error server`);

      // Also log to console for immediate visibility
      errors.forEach(error => {
        if (error.severity === 'error' || error.severity === 'critical') {
          console.error(`🔴 BUILD ERROR: ${error.message}`);
        } else {
          console.warn(`🟡 BUILD WARNING: ${error.message}`);
        }
      });

    } catch (error) {
      console.error('❌ Failed to send build errors to server:', error.message);
    }
  }
}

module.exports = WebpackErrorCapturePlugin;
