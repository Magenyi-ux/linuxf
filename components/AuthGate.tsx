import React from 'react';
import App from '../App';
import { Auth } from './Auth';
import PrivateVideoGenerator from './PrivateVideoGenerator';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const AuthGateContent: React.FC = () => {
  const { user, loading } = useAuth();

  // The private generator has its own server-verified access token and must not
  // require an Examply student account.
  if (window.location.pathname === '/private-video') {
    return <PrivateVideoGenerator />;
  }

  if (loading) {
    // Restore the persisted session in the background without exposing a blocking
    // preparation screen. Keep the auth gate closed until restoration completes.
    return null;
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
