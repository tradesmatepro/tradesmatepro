import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DeveloperTools from '../pages/DeveloperTools';
import { UserProvider } from '../contexts/UserContext';
import devToolsService from '../services/DevToolsService';
import remoteDebugService from '../services/RemoteDebugService';

// Mock services
jest.mock('../services/DevToolsService');
jest.mock('../services/RemoteDebugService');
jest.mock('../utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
      }))
    })),
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null }))
    },
    storage: {
      listBuckets: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }
  }
}));

// Mock user context
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  company_id: 'test-company-id'
};

const mockCompany = {
  id: 'test-company-id',
  name: 'Test Company'
};

const MockUserProvider = ({ children }) => (
  <UserProvider value={{ user: mockUser, company: mockCompany }}>
    {children}
  </UserProvider>
);

const renderDeveloperTools = () => {
  return render(
    <BrowserRouter>
      <MockUserProvider>
        <DeveloperTools />
      </MockUserProvider>
    </BrowserRouter>
  );
};

describe('DeveloperTools', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset console methods
    global.console = {
      ...console,
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn()
    };
  });

  test('renders developer tools interface', async () => {
    renderDeveloperTools();
    
    expect(screen.getByText('🛠️ Developer Tools')).toBeInTheDocument();
    expect(screen.getByText('Real-time debugging and monitoring interface')).toBeInTheDocument();
  });

  test('displays all tabs with badges', async () => {
    renderDeveloperTools();
    
    // Check for all tabs
    expect(screen.getByText('📋 Live Logs')).toBeInTheDocument();
    expect(screen.getByText('🌐 Network Monitor')).toBeInTheDocument();
    expect(screen.getByText('🗄️ Database Inspector')).toBeInTheDocument();
    expect(screen.getByText('🚨 Error Tracker')).toBeInTheDocument();
    expect(screen.getByText('⚡ Performance')).toBeInTheDocument();
    expect(screen.getByText('🔐 Auth Debugger')).toBeInTheDocument();
    expect(screen.getByText('💚 System Health')).toBeInTheDocument();
    expect(screen.getByText('📤 Export Tools')).toBeInTheDocument();
  });

  test('logs panel shows real-time logs', async () => {
    renderDeveloperTools();
    
    // Should show initial system logs
    await waitFor(() => {
      expect(screen.getByText(/Developer Tools initialized successfully/)).toBeInTheDocument();
    });
  });

  test('network monitor captures API requests', async () => {
    renderDeveloperTools();
    
    // Switch to network tab
    fireEvent.click(screen.getByText('🌐 Network Monitor'));
    
    // Should show network monitor interface
    expect(screen.getByText('🌐 Network Monitor')).toBeInTheDocument();
    expect(screen.getByText('Method')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
  });

  test('database inspector tests connection', async () => {
    renderDeveloperTools();
    
    // Switch to database tab
    fireEvent.click(screen.getByText('🗄️ Database Inspector'));
    
    // Should show database inspector
    expect(screen.getByText('🗄️ Database Inspector')).toBeInTheDocument();
    expect(screen.getByText('Connection Status')).toBeInTheDocument();
    
    // Test connection button
    const testButton = screen.getByText('Test Connection');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Testing Supabase connection/)).toBeInTheDocument();
    });
  });

  test('error tracker displays errors', async () => {
    renderDeveloperTools();
    
    // Switch to errors tab
    fireEvent.click(screen.getByText('🚨 Error Tracker'));
    
    // Should show error tracker
    expect(screen.getByText('🚨 Error Tracker')).toBeInTheDocument();
    expect(screen.getByText(/No errors captured yet/)).toBeInTheDocument();
  });

  test('performance monitor shows memory usage', async () => {
    renderDeveloperTools();
    
    // Mock performance.memory
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 50000000,
        totalJSHeapSize: 100000000,
        jsHeapSizeLimit: 200000000
      },
      configurable: true
    });
    
    // Switch to performance tab
    fireEvent.click(screen.getByText('⚡ Performance'));
    
    // Should show performance monitor
    expect(screen.getByText('⚡ Performance Monitor')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
  });

  test('auth debugger shows user information', async () => {
    renderDeveloperTools();
    
    // Switch to auth tab
    fireEvent.click(screen.getByText('🔐 Auth Debugger'));
    
    // Should show auth debugger
    expect(screen.getByText('🔐 Auth Debugger')).toBeInTheDocument();
    expect(screen.getByText('Current Session')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('system health shows service status', async () => {
    renderDeveloperTools();
    
    // Switch to health tab
    fireEvent.click(screen.getByText('💚 System Health'));
    
    // Should show system health
    expect(screen.getByText('💚 System Health Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Refresh Health Check')).toBeInTheDocument();
  });

  test('export tools provide debug data export', async () => {
    renderDeveloperTools();
    
    // Switch to export tab
    fireEvent.click(screen.getByText('📤 Export Tools'));
    
    // Should show export tools
    expect(screen.getByText('📤 Export & Debug Tools')).toBeInTheDocument();
    expect(screen.getByText('📤 Export Full Debug Package')).toBeInTheDocument();
    expect(screen.getByText('📋 Export Logs Only')).toBeInTheDocument();
  });

  test('search and filter functionality works', async () => {
    renderDeveloperTools();
    
    // Find search input
    const searchInput = screen.getByPlaceholderText('Search logs, API requests, errors...');
    expect(searchInput).toBeInTheDocument();
    
    // Find filter dropdown
    const filterSelect = screen.getByDisplayValue('All Levels');
    expect(filterSelect).toBeInTheDocument();
    
    // Test filtering
    fireEvent.change(filterSelect, { target: { value: 'ERROR' } });
    expect(filterSelect.value).toBe('ERROR');
  });

  test('real-time monitoring can be paused and resumed', async () => {
    renderDeveloperTools();
    
    // Find pause/resume button
    const pauseButton = screen.getByText('⏸️ Pause');
    expect(pauseButton).toBeInTheDocument();
    
    // Click to pause
    fireEvent.click(pauseButton);
    
    // Should change to resume button
    await waitFor(() => {
      expect(screen.getByText('▶️ Resume')).toBeInTheDocument();
    });
  });

  test('clear functionality works for different data types', async () => {
    renderDeveloperTools();
    
    // Switch to export tab to see clear buttons
    fireEvent.click(screen.getByText('📤 Export Tools'));
    
    // Should show clear buttons
    expect(screen.getByText(/Clear Logs/)).toBeInTheDocument();
    expect(screen.getByText(/Clear API Requests/)).toBeInTheDocument();
    expect(screen.getByText(/Clear Errors/)).toBeInTheDocument();
    expect(screen.getByText('🗑️ Clear All Data')).toBeInTheDocument();
  });

  test('SQL query execution with safety checks', async () => {
    renderDeveloperTools();
    
    // Switch to database tab
    fireEvent.click(screen.getByText('🗄️ Database Inspector'));
    
    // Find SQL textarea
    const sqlTextarea = screen.getByPlaceholderText('Enter SQL query...');
    expect(sqlTextarea).toBeInTheDocument();
    
    // Enter a SELECT query
    fireEvent.change(sqlTextarea, { target: { value: 'SELECT * FROM companies LIMIT 5' } });
    
    // Execute query
    const executeButton = screen.getByText('Execute Query');
    fireEvent.click(executeButton);
    
    // Should show query execution
    await waitFor(() => {
      expect(screen.getByText(/Executing query/)).toBeInTheDocument();
    });
  });
});

describe('DevToolsService', () => {
  test('initializes correctly', async () => {
    const result = await devToolsService.initialize();
    expect(result).toBe(true);
  });

  test('executes database queries safely', async () => {
    const result = await devToolsService.executeQuery('SELECT * FROM companies');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('timestamp');
  });

  test('gets system information', async () => {
    const systemInfo = await devToolsService.getSystemInfo();
    expect(systemInfo).toHaveProperty('timestamp');
    expect(systemInfo).toHaveProperty('environment');
    expect(systemInfo).toHaveProperty('performance');
  });
});

describe('RemoteDebugService', () => {
  test('initializes with configuration', async () => {
    const result = await remoteDebugService.initialize({
      url: 'ws://test:8080/debug',
      autoReconnect: false
    });
    // Should handle connection failure gracefully
    expect(typeof result).toBe('boolean');
  });

  test('provides connection status', () => {
    const status = remoteDebugService.getStatus();
    expect(status).toHaveProperty('connected');
    expect(status).toHaveProperty('sessionId');
  });
});
