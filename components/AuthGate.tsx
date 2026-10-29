import React from 'react';
import App from '../App';
import { Auth } from './Auth';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const AuthGateContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Never render a blank document while Supabase restores the session.
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-white px-6 text-slate-900"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" aria-hidden="true" />
          <p className="text-sm font-medium">Loading Examply…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white px-6">
        <Auth
          onAuthComplete={() => {}}
          onBack={() => {}}
        />
      </div>
    );
  }

  return <App />;
};

export const AuthGate: React.FC = () => (
  <AuthProvider>
    <AuthGateContent />
  </AuthProvider>
);
