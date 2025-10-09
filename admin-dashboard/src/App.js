import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import CompanyList from './pages/CompanyList';
import CompanyDetail from './pages/CompanyDetail';
import CreateCompany from './pages/CreateCompany';
import UserList from './pages/UserList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route path="/" element={<Navigate to="/companies" replace />} />
          <Route path="/companies" element={
            <ProtectedRoute>
              <Layout>
                <CompanyList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/company/:id" element={
            <ProtectedRoute>
              <Layout>
                <CompanyDetail />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/create-company" element={
            <ProtectedRoute>
              <Layout>
                <CreateCompany />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Layout>
                <UserList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/companies" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
