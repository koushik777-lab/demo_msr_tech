import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TemplatePicker from './pages/TemplatePicker';
import Editor from './pages/Editor';
import BillingPage from './pages/BillingPage';
import PublishPage from './pages/PublishPage';
import BuilderLanding from './pages/BuilderLanding';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}>Loading...</div>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/builder/login" replace />;
}

function BuilderRoutes() {
  return (
    <Routes>
      <Route path="" element={<BuilderLanding />} />
      <Route path="login" element={<AuthPage />} />
      <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="templates" element={<ProtectedRoute><TemplatePicker /></ProtectedRoute>} />
      <Route path="editor/:siteId" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
      <Route path="billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
      <Route path="publish/:siteId" element={<ProtectedRoute><PublishPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default function BuilderRouter() {
  return (
    <AuthProvider>
      <BuilderRoutes />
    </AuthProvider>
  );
}
