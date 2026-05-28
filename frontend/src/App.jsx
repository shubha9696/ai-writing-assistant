import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import AuthCard from './components/AuthCard';
import Dashboard from './components/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());

  useEffect(() => {
    const handleAuthExpired = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans selection:bg-brand-accent selection:text-white">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-4">
          <AuthCard onAuthSuccess={handleAuthSuccess} />
        </div>
      )}
    </div>
  );
}

