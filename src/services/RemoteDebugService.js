/**
 * Remote Debug Service
 * Provides real-time remote debugging capabilities through WebSocket connection
 * Allows external tools to monitor and control the application
 */
class RemoteDebugService {
  constructor() {
    this.isConnected = false;
    this.websocket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.commandHandlers = new Map();
    this.sessionId = null;
    this.setupCommandHandlers();
  }

  /**
   * Initialize remote debugging connection
   */
  async initialize(config = {}) {
    const defaultConfig = {
      url: 'ws://localhost:8080/debug', // Default WebSocket URL
      autoReconnect: true,
      heartbeatInterval: 30000
    };

    this.config = { ...defaultConfig, ...config };
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      await this.connect();
      this.setupHeartbeat();
      console.log('🔌 Remote Debug Service initialized');
      return true;
    } catch (error) {
      const errorMessage = error?.message || (typeof error === 'string' ? error : 'WebSocket connection failed - no debug server available');
      console.warn('⚠️ Remote Debug Service failed to initialize:', errorMessage);
      // Continue without remote debugging
      return false;
    }
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(this.config.url);

        this.websocket.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Send initial handshake
          this.send('handshake', {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            capabilities: this.getCapabilities()
          });

          console.log('🟢 Remote debug connection established');
          resolve();
        };

        this.websocket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.websocket.onclose = () => {
          this.isConnected = false;
          console.log('🔴 Remote debug connection closed');
          
          if (this.config.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.websocket.onerror = (error) => {
          console.error('❌ Remote debug connection error:', error);
          reject(new Error(`WebSocket connection failed to ${this.config.url}`));
        };

        // Timeout for connection
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connect().catch(() => {
        // Reconnection failed, will try again if under limit
      });
    }, delay);
  }

  /**
   * Set up heartbeat to keep connection alive
   */
  setupHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('heartbeat', { timestamp: new Date().toISOString() });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      const { type, payload, id } = message;

      // Handle command requests
      if (type === 'command' && this.commandHandlers.has(payload.command)) {
        const handler = this.commandHandlers.get(payload.command);
        handler(payload.args, id);
      }

      // Notify listeners
      if (this.listeners.has(type)) {
        this.listeners.get(type).forEach(listener => listener(payload, id));
      }

    } catch (error) {
      console.error('Failed to parse remote debug message:', error);
    }
  }

  /**
   * Send message to remote debugger
   */
  send(type, payload, responseId = null) {
    if (!this.isConnected || !this.websocket) {
      console.warn('Cannot send message: not connected to remote debugger');
      return false;
    }

    const message = {
      type,
      payload,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      ...(responseId && { responseId })
    };

    try {
      this.websocket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send remote debug message:', error);
      return false;
    }
  }

  /**
   * Set up command handlers for remote control
   */
  setupCommandHandlers() {
    // Execute JavaScript code (disabled for security)
    this.commandHandlers.set('eval', (args, id) => {
      try {
        // For security reasons, eval is disabled
        // In a production environment, you would implement a safe sandbox
        const result = 'Code execution disabled for security';
        this.send('command-response', { result, success: false, reason: 'eval disabled' }, id);
      } catch (error) {
        this.send('command-response', { error: error.message, success: false }, id);
      }
    });

    // Get DOM element information
    this.commandHandlers.set('getElement', (args, id) => {
      try {
        const element = document.querySelector(args.selector);
        const result = element ? {
          tagName: element.tagName,
          id: element.id,
          className: element.className,
          textContent: element.textContent?.substring(0, 100),
          attributes: Array.from(element.attributes).map(attr => ({
            name: attr.name,
            value: attr.value
          }))
        } : null;
        
        this.send('command-response', { result, success: true }, id);
      } catch (error) {
        this.send('command-response', { error: error.message, success: false }, id);
      }
    });

    // Get application state
    this.commandHandlers.set('getState', (args, id) => {
      try {
        const state = {
          url: window.location.href,
          title: document.title,
          localStorage: this.getStorageData('localStorage'),
          sessionStorage: this.getStorageData('sessionStorage'),
          cookies: document.cookie,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };
        
        this.send('command-response', { result: state, success: true }, id);
      } catch (error) {
        this.send('command-response', { error: error.message, success: false }, id);
      }
    });

    // Capture screenshot (if supported)
    this.commandHandlers.set('screenshot', (args, id) => {
      try {
        // This would require additional implementation for actual screenshots
        // For now, return viewport information
        const result = {
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          note: 'Screenshot capture requires additional implementation'
        };
        
        this.send('command-response', { result, success: true }, id);
      } catch (error) {
        this.send('command-response', { error: error.message, success: false }, id);
      }
    });

    // Reload page
    this.commandHandlers.set('reload', (args, id) => {
      this.send('command-response', { result: 'Reloading page...', success: true }, id);
      setTimeout(() => window.location.reload(), 1000);
    });
  }

  /**
   * Get storage data safely
   */
  getStorageData(storageType) {
    try {
      const storage = window[storageType];
      const data = {};
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        data[key] = storage.getItem(key);
      }
      return data;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get debugging capabilities
   */
  getCapabilities() {
    return {
      eval: true,
      domInspection: true,
      stateInspection: true,
      networkMonitoring: true,
      consoleAccess: true,
      pageControl: true,
      errorTracking: true
    };
  }

  /**
   * Stream logs to remote debugger
   */
  streamLog(level, message, source) {
    this.send('log', {
      level,
      message,
      source,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Stream API requests to remote debugger
   */
  streamApiRequest(request) {
    this.send('api-request', request);
  }

  /**
   * Stream errors to remote debugger
   */
  streamError(error) {
    this.send('error', error);
  }

  /**
   * Add event listener for remote debug events
   */
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(type, listener) {
    if (this.listeners.has(type)) {
      const listeners = this.listeners.get(type);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Disconnect from remote debugger
   */
  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.isConnected = false;
    console.log('🔌 Remote debug service disconnected');
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      sessionId: this.sessionId,
      reconnectAttempts: this.reconnectAttempts,
      url: this.config?.url
    };
  }
}

// Create singleton instance
const remoteDebugService = new RemoteDebugService();

export default remoteDebugService;
