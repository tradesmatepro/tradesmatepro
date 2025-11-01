import React, { Suspense, lazy, useEffect } from 'react';
import './styles/theme-system.css';
import './styles/modern-enhancements.css';
import './styles/animations.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { IntegrationsProvider } from './contexts/IntegrationsContext';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FeatureFlagProvider } from './contexts/FeatureFlagContext';
import ProtectedRoute from './components/ProtectedRoute';
import SimplePermissionRoute from './components/SimplePermissionRoute';
import { MODULES } from './utils/simplePermissions';
import Layout from './components/Layout/Layout';
import DashboardRouter from './pages/DashboardRouter';
import DevToolsErrorBoundary from './components/DevToolsErrorBoundary';
import devToolsService from './services/DevToolsService';
import remoteDebugService from './services/RemoteDebugService';
import SecurityService from './services/SecurityService';
import './utils/realTimeErrorFixer';
import { supabase } from './utils/supabaseClient';
import { getCurrentDeploymentType } from './config/deploymentConfig';

// Small/auth pages (direct)
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Logout from './pages/Logout';
// CompanyOnboarding removed - now handled by separate Admin Dashboard
import GoogleOAuthCallback from './pages/GoogleOAuthCallback';
import DeveloperTools from './pages/DeveloperTools';
import OnboardingTest from './pages/OnboardingTest';
import SchemaTest from './components/SchemaTest';

// Medium pages (direct)
import Employees from './pages/Employees';
import Timesheets from './pages/Timesheets';
import MyTime from './pages/MyTime';
import MyTimeOff from './pages/MyTimeOff';
import AdminApprovals from './pages/AdminApprovals';
import AdminTimeOff from './pages/AdminTimeOff';
import Payroll from './pages/Payroll';
import ModernPageHeader from './components/Common/ModernPageHeader';


// Lazy-loaded heavy pages
const AgingReport = lazy(() => import('./pages/AgingReport'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Quotes = lazy(() => import('./pages/QuotesPro'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Invoices = lazy(() => import('./pages/Invoices'));
const JobsHistory = lazy(() => import('./pages/JobsHistory'));
const Customers = lazy(() => import('./pages/Customers'));
const Documents = lazy(() => import('./pages/Documents'));
const Settings = lazy(() => import('./pages/Settings'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Expenses = lazy(() => import('./pages/Expenses'));
const PurchaseOrders = lazy(() => import('./pages/PurchaseOrders'));
const Vendors = lazy(() => import('./pages/Vendors'));
const AdvancedReports = lazy(() => import('./pages/AdvancedReports'));
const Notifications = lazy(() => import('./pages/Notifications'));
const CloudStorage = lazy(() => import('./pages/CloudStorage'));
const CRM = lazy(() => import('./pages/CRM'));
const Messages = lazy(() => import('./pages/Messages'));
const Automation = lazy(() => import('./pages/Automation'));
const Reports = lazy(() => import('./pages/Reports'));
const Tools = lazy(() => import('./pages/Tools'));
const CustomerScheduling = lazy(() => import('./pages/CustomerScheduling'));
const MyProfile = lazy(() => import('./pages/MyProfile'));

// Coming Soon Placeholder Pages
const MobileApp = lazy(() => import('./pages/MobileApp'));
const GPSTracking = lazy(() => import('./pages/GPSTracking'));
const MarketingAutomation = lazy(() => import('./pages/MarketingAutomation'));
const AIEstimating = lazy(() => import('./pages/AIEstimating'));
const EnhancedCustomerPortal = lazy(() => import('./pages/EnhancedCustomerPortal'));
const BusinessIntelligence = lazy(() => import('./pages/BusinessIntelligence'));
const PaymentProcessing = lazy(() => import('./pages/PaymentProcessing'));
// Removed AdvancedScheduling - already implemented and industry-leading

// Service Request System
const IncomingRequests = lazy(() => import('./pages/IncomingRequests'));
const RequestService = lazy(() => import('./pages/CustomerPortal/RequestService'));
const RequestHistory = lazy(() => import('./pages/CustomerPortal/RequestHistory'));
const PortalQuote = lazy(() => import('./pages/PortalQuote'));
const PublicQuoteView = lazy(() => import('./pages/PublicQuoteView'));
const CustomerPortal = lazy(() => import('./pages/CustomerPortal'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Booking = lazy(() => import('./pages/Booking'));

// Initialize developer tools and debugging services
const initializeDevTools = async () => {
  try {
    // Initialize DevTools Service
    await devToolsService.initialize();

    // Initialize Remote Debug Service (optional, disabled by default)
    const wsUrl = process.env.REACT_APP_DEBUG_WS_URL;
    if (wsUrl && wsUrl.trim() !== '') {
      try {
        await remoteDebugService.initialize({
          url: wsUrl,
          autoReconnect: true
        });
        console.log('🔌 Remote Debug Service enabled');
      } catch (error) {
        console.warn('⚠️ Remote Debug Service failed to initialize:', error.message);
      }
    } else {
      console.log('🟡 Remote Debug Service disabled (set REACT_APP_DEBUG_WS_URL to enable)');
    }

    console.log('🛠️ Developer tools initialized successfully');
  } catch (error) {
    console.warn('⚠️ Developer tools initialization failed:', error);
  }
};

function App() {
  useEffect(() => {
    // Initialize Supabase Auth Session Bootstrap
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        } else if (!session) {
          console.warn('No session found - user needs to log in');
        } else {
          console.log('✅ Session loaded for user:', session.user.email);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      }
    };

    // Initialize auth session
    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event);
      if (session) {
        console.log('✅ Session updated for user:', session.user.email);
      } else {
        console.log('❌ Session ended - user logged out');
        // End security session tracking
        const sessionToken = localStorage.getItem('session_token');
        if (sessionToken) {
          SecurityService.endSession(sessionToken, 'logout');
        }
      }
    });

    // Listen for session expiry events
    const handleSessionExpired = () => {
      console.warn('⏰ Session expired - logging out');
      supabase.auth.signOut();
      window.location.href = '/login';
    };
    window.addEventListener('session-expired', handleSessionExpired);

    // Initialize developer tools on app start
    initializeDevTools();



    // Make devLogger globally available for error boundary
    if (window.devLogger) {
      window.devLogger.addLog('INFO', 'TradeMate Pro application started', 'app');
    }

    // Cleanup auth listener on unmount
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('session-expired', handleSessionExpired);
      SecurityService.stopSessionMonitoring();
    };
  }, []);

  const deploymentType = getCurrentDeploymentType();

  return (
    <DevToolsErrorBoundary componentName="App">
      <UserProvider>
        <IntegrationsProvider>
          <ThemeProvider>
            <FeatureFlagProvider deploymentType={deploymentType}>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>


              <Suspense fallback={<div className="p-6 text-gray-600">Loading…</div>}>

          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/oauth/google/callback" element={<GoogleOAuthCallback />} />
            <Route path="/schedule-appointment" element={<CustomerScheduling />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/portal/quote/:id" element={<PortalQuote />} />
            <Route path="/portal/quote/view/:token" element={<PublicQuoteView />} />
            <Route path="/portal" element={<CustomerPortal />} />
            <Route path="/portal/*" element={<CustomerPortal />} />

            {/* New Onboarding System Test */}
            <Route path="/onboarding-test" element={<OnboardingTest />} />
            <Route path="/schema-test" element={<SchemaTest />} />

            {/* Onboarding is now integrated into ProtectedRoute */}

            {/* Protected routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    {/* Core routes with module access checks */}
                    <Route path="/" element={<DashboardRouter />} />
                    <Route path="/dashboard" element={<DashboardRouter />} />
                    <Route path="/my-dashboard" element={<DashboardRouter />} />
                    <Route path="/admin-dashboard" element={<DashboardRouter />} />
                    <Route path="/jobs" element={
                      <SimplePermissionRoute module={MODULES.JOBS}>
                        <Jobs />
                      </SimplePermissionRoute>
                    } />
                    <Route path="/calendar" element={
                      <SimplePermissionRoute module={MODULES.CALENDAR}>
                        <Calendar />
                      </SimplePermissionRoute>
                    } />
                    <Route path="/documents" element={
                      <SimplePermissionRoute module={MODULES.DOCUMENTS}>
                        <Documents />
                      </SimplePermissionRoute>
                    } />

                    {/* Marketplace route */}
                    <Route path="/marketplace" element={
                      <SimplePermissionRoute module={MODULES.MARKETPLACE}>
                        <Marketplace />
                      </SimplePermissionRoute>
                    } />

                    {/* Booking route - unified booking system */}
                    <Route path="/booking" element={
                      <SimplePermissionRoute module={MODULES.MARKETPLACE}>
                        <Booking />
                      </SimplePermissionRoute>
                    } />

                    {/* Admin routes with module access checks */}
                    <Route path="/customer-dashboard" element={
                      <SimplePermissionRoute module={MODULES.CUSTOMERS}>
                        <CustomerDashboard />
                      </SimplePermissionRoute>
                    } />
                    <Route path="/customers" element={
                      <SimplePermissionRoute module={MODULES.CUSTOMERS}>
                        <Customers />
                      </SimplePermissionRoute>
                    } />
                    <Route path="/quotes" element={
                      <SimplePermissionRoute module={MODULES.QUOTES}>
                        <Quotes />
                      </SimplePermissionRoute>
                    } />
                    {/* Removed Work Orders page; use Calendar for scheduling */}
                    <Route path="/invoices" element={
                      <SimplePermissionRoute module={MODULES.INVOICES}>
                        {require('./utils/features').FEATURES.INVOICING ? <Invoices /> : <div className="p-6 text-gray-600">Invoices disabled.</div>}
                      </SimplePermissionRoute>
                    } />
                    <Route path="/invoices/aging" element={
                      <SimplePermissionRoute module={MODULES.INVOICES}>
                        <AgingReport />
                      </SimplePermissionRoute>
                    } />
                    <Route path="/purchase-orders" element={
                      <SimplePermissionRoute module={MODULES.PURCHASE_ORDERS}>
                        <PurchaseOrders />
                      </SimplePermissionRoute>
                    } />
                    <Route path="/vendors" element={
                      <SimplePermissionRoute module={MODULES.VENDORS}>
                        <Vendors />
                      </SimplePermissionRoute>
                    } />
                    <Route path="/advanced-reports" element={
                      <SimplePermissionRoute module={MODULES.REPORTS}>
                        <AdvancedReports />
                      </SimplePermissionRoute>
                    } />
                    <Route path="/employees" element={
                      <SimplePermissionRoute module={MODULES.EMPLOYEES}>
                        <Employees />
                      </SimplePermissionRoute>
                    } />
                    {/* Employee self-service routes */}
                    <Route path="/my/time" element={
                      <SimplePermissionRoute module={MODULES.TIMESHEETS}>
                        <MyTime />
                      </SimplePermissionRoute>
                    } />
                    <Route path="/my/time-off" element={
                      <SimplePermissionRoute module={MODULES.TIMESHEETS}>
                        <MyTimeOff />
                      </SimplePermissionRoute>
                    } />

                    {/* Admin routes */}
                    <Route path="/admin/approvals" element={
                      <SimplePermissionRoute module={MODULES.TIMESHEETS}>
                        <AdminApprovals />
                      </SimplePermissionRoute>
                    } />
                    <Route path="/admin/time-off" element={
                      <SimplePermissionRoute module={MODULES.TIMESHEETS}>
                        <AdminTimeOff />
                      </SimplePermissionRoute>
                    } />

                    {/* Legacy combined page retained temporarily */}
                    <Route path="/timesheets" element={
                      <SimplePermissionRoute module={MODULES.TIMESHEETS}>
                        <Timesheets />
                      </SimplePermissionRoute>
                    } />
                    <Route path="/payroll" element={
                      <SimplePermissionRoute module={MODULES.PAYROLL}>
                        <Payroll />
                      </SimplePermissionRoute>
                    } />
                    <Route path="/reports" element={
                      <SimplePermissionRoute module={MODULES.REPORTS}>
                        {require('./utils/features').FEATURES.REPORTS ? <Reports /> : <div className="p-6 text-gray-600">Reports disabled.</div>}
                      </SimplePermissionRoute>
                    } />

                    {/* Tools route - available to all users */}
                    <Route path="/tools" element={<Tools />} />

                    {/* Inventory route - Operations section */}
                    <Route path="/operations/inventory" element={
                      <SimplePermissionRoute module={MODULES.INVENTORY}>
                        <Inventory />
                      </SimplePermissionRoute>
                    } />

                    {/* Messages route - available to all users */}
                    <Route path="/messages" element={<Messages />} />

                    {/* Integration routes */}
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/storage" element={<CloudStorage />} />
                    <Route path="/crm" element={<CRM />} />
                    <Route path="/automation" element={<Automation />} />

                    {/* Coming Soon Feature Routes */}
                    <Route path="/coming-soon/mobile-app" element={<MobileApp />} />
                    <Route path="/coming-soon/gps-tracking" element={<GPSTracking />} />
                    <Route path="/coming-soon/marketing-automation" element={<MarketingAutomation />} />
                    <Route path="/coming-soon/ai-estimating" element={<AIEstimating />} />
                    <Route path="/coming-soon/customer-portal" element={<EnhancedCustomerPortal />} />
                    <Route path="/coming-soon/business-intelligence" element={<BusinessIntelligence />} />
                    <Route path="/coming-soon/payment-processing" element={<PaymentProcessing />} />
                    {/* Removed advanced-scheduling route - already implemented */}

                    {/* Service Request System Routes - moved to Sales as Leads */}
                    <Route path="/leads" element={<IncomingRequests />} />
                    <Route path="/incoming-requests" element={<IncomingRequests />} /> {/* Legacy redirect */}
                    <Route path="/customer/request-service" element={<RequestService />} />
                    <Route path="/customer/requests" element={<RequestHistory />} />

                    {/* Profile route */}
                    <Route path="/profile" element={<MyProfile />} />

                    {/* Jobs History */}
                    <Route path="/jobs/history" element={<JobsHistory />} />

                    {/* Settings route */}
                    <Route path="/settings" element={
                      <SimplePermissionRoute module={MODULES.SETTINGS}>
                        <Settings />
                      </SimplePermissionRoute>
                    } />

                    {/* Developer Tools route - Beta only */}
                    <Route path="/developer-tools" element={<DeveloperTools />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </Router>
            </FeatureFlagProvider>
    </ThemeProvider>
  </IntegrationsProvider>
</UserProvider>
</DevToolsErrorBoundary>
  );
}

export default App;