import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CustomerProvider } from './contexts/CustomerContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';
import DevToolsErrorBoundary from './components/DevToolsErrorBoundary';
import DevToolsInitializer from './components/DevToolsInitializer';

// Import developer tools services
import devToolsService from './services/DevToolsService';
import remoteDebugService from './services/RemoteDebugService';

// Auth pages (direct load)
import Login from './pages/Login';
import Signup from './pages/Signup';



// Public pages
const PublicQuote = lazy(() => import('./pages/PublicQuote'));

// Main pages (lazy loaded for better performance)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Quotes = lazy(() => import('./pages/Quotes'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Messages = lazy(() => import('./pages/Messages'));
const MyRequests = lazy(() => import('./pages/MyRequests'));
const Booking = lazy(() => import('./pages/Booking'));

const Profile = lazy(() => import('./pages/Profile'));

// Initialize developer tools and debugging services
const initializeDevTools = async (supabaseClient = null) => {
  try {
    // Initialize DevTools Service with supabase client
    await devToolsService.initialize(supabaseClient);

    // Initialize Remote Debug Service if WebSocket URL is provided
    const debugWsUrl = process.env.REACT_APP_DEBUG_WS_URL;
    if (debugWsUrl) {
      try {
        await remoteDebugService.initialize({
          url: debugWsUrl,
          autoReconnect: true
        });
        console.log('🔗 Remote Debug Service connected');
      } catch (error) {
        console.log('🟡 Remote Debug Service connection failed (this is normal if no debug server is running)');
      }
    } else {
      console.log('🟡 Remote Debug Service disabled (set REACT_APP_DEBUG_WS_URL to enable)');
    }

    console.log('🛠️ Customer Portal Developer tools initialized successfully');
  } catch (error) {
    console.warn('⚠️ Developer tools initialization failed:', error);
  }
};

function App() {
  useEffect(() => {
    // Initialize developer tools on app start (without supabase client initially)
    initializeDevTools();

    // Make devLogger globally available for error boundary
    if (window.devLogger) {
      window.devLogger.addLog('INFO', 'Customer Portal application started', 'app');
    }
  }, []);
  return (
    <DevToolsErrorBoundary componentName="App">
      <CustomerProvider>
        <DevToolsInitializer />
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/public/quote/:id" element={<PublicQuote />} />
              
              {/* Protected routes with layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/quotes" element={
                <ProtectedRoute>
                  <Layout>
                    <Quotes />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/jobs" element={
                <ProtectedRoute>
                  <Layout>
                    <Jobs />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <Layout>
                    <Invoices />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Layout>
                    <Messages />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/requests" element={
                <ProtectedRoute>
                  <Layout>
                    <MyRequests />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/booking" element={
                <ProtectedRoute>
                  <Layout>
                    <Booking />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />


            </Routes>
          </Suspense>
        </div>
      </Router>
    </CustomerProvider>
    </DevToolsErrorBoundary>
  );
}

export default App;
