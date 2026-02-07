import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Safely register Service Worker
if (typeof window !== 'undefined') {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  }).catch(err => {
    console.error('Failed to register service worker:', err);
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
