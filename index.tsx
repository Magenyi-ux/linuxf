import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'katex/dist/katex.min.css';
import { initPostHog } from './services/posthogClient';
import { AuthGate } from './components/AuthGate';

type BoundaryState = { hasError: boolean };

class AppErrorBoundary extends React.Component<React.PropsWithChildren, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Examply UI crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
          <section style={{ width: '100%', maxWidth: 420, textAlign: 'center' }} role="alert">
            <div style={{ fontSize: 22, fontWeight: 750, marginBottom: 8 }}>Examply needs to reload</div>
            <p style={{ color: '#475569', lineHeight: 1.6 }}>Something interrupted this screen. Your saved study progress has not been intentionally cleared.</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: 16, border: 0, borderRadius: 12, padding: '12px 18px', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Reload Examply</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

initPostHog();

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<main style="font:16px system-ui;padding:32px">Examply could not start. Please reload the page.</main>';
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <AuthGate />
      </AppErrorBoundary>
    </React.StrictMode>
  );
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch((registrationError) => {
        console.warn('Service worker registration failed:', registrationError);
      });
  });
}
