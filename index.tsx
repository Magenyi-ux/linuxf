/**
 * index.tsx - Entry point for the React application.
 * This file handles the initial mounting of the React app to the DOM.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Removed Clerk and Convex imports to simplify the app for Vercel deployment
// import { ClerkProvider, useAuth } from "@clerk/clerk-react";
// import { ConvexProviderWithClerk } from "convex/react-clerk";
// import { ConvexReactClient, ConvexProvider } from "convex/react";
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline support and PWA functionality
registerSW({ immediate: true });

// Configuration for Convex and Clerk removed as per request to remove these environment variables
// const CONVEX_URL = (import.meta.env.VITE_CONVEX_URL as string) || "https://placeholder-url.convex.cloud";
// const PUBLISHABLE_KEY = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) || "pk_test_YW55LXN0cmluZy13aWxsLXdvcmstaWYtaXQtbG9va3MtcmVhbC0xMg";

// const convex = new ConvexReactClient(CONVEX_URL);

// Locate the root element in index.html where the app will be rendered
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create the React root using the concurrent rendering API
const root = ReactDOM.createRoot(rootElement);

/**
 * Render the main App component.
 * We've removed the Clerk and Convex providers to allow the app to run
 * independently of those external services.
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
