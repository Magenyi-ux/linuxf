import React from 'react';
import App from '../App';
import { Auth } from './Auth';
import { LoadingScreen } from './LoadingScreen';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const AuthGateContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking your secure session..." />;
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
