import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#8b5cf6', fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
        <div className="animate-fade-in">Loading Secure Portal...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#8b5cf6', fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
        <div className="animate-fade-in">Verifying Credentials...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'Admin') {
    return (
      <div className="auth-container">
        <div className="glass-panel auth-card animate-fade-in" style={{ textAlign: 'center' }}>
          <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '16px' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
            You do not have administrative privileges to access this section of the system.
          </p>
          <a href="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};
