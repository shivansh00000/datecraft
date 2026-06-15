import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProposalBuilder from './pages/ProposalBuilder';
import ProposalView from './pages/ProposalView';
import Admin from './pages/Admin';

// Route Guard for authenticated creators
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          <p className="text-slate-400 font-medium">Opening DateCraft...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Route Guard for admins
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Marketing Route */}
        <Route path="/" element={<Landing />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Recipient Experience (No Login Required) */}
        <Route path="/p/:slug" element={<ProposalView />} />

        {/* Creator Dashboard (Auth required) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Proposal Creator Wizard & Drag/Drop Editor (Auth required) */}
        <Route 
          path="/builder/:id" 
          element={
            <ProtectedRoute>
              <ProposalBuilder />
            </ProtectedRoute>
          } 
        />

        {/* Admin Dashboard */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } 
        />

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
