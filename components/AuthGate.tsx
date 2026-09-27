import React from 'react';
import { Auth } from './components/Auth';
import { LoadingScreen } from './components/LoadingScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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

  return <AppContent />;
};

const AppContent: React.FC = () => {
  // App is loaded lazily so unauthenticated visitors do not mount the protected
  // Examply application at all.
  return <ProtectedApp />;
};

const ProtectedApp: React.FC = () => {
  const App = React.lazy(() => import('./App'));
  return (
    <React.Suspense fallback={<LoadingScreen message="Loading Examply..." />}>
      <App />
    </React.Suspense>
  );
};

export const AuthGate: React.FC = () => (
  <AuthProvider>
    <AuthGateContent />
  </AuthProvider>
);
