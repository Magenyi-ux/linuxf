import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline support
registerSW({ immediate: true });

const CONVEX_URL = (import.meta.env.VITE_CONVEX_URL as string) || "https://placeholder-url.convex.cloud";
const PUBLISHABLE_KEY = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) || "pk_test_YW55LXN0cmluZy13aWxsLXdvcmstaWYtaXQtbG9va3MtcmVhbC0xMg";

const convex = new ConvexReactClient(CONVEX_URL);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Detection for placeholder keys to enable offline-first/unconfigured mode
const isClerkPlaceholder = PUBLISHABLE_KEY === "pk_test_YW55LXN0cmluZy13aWxsLXdvcmstaWYtaXQtbG9va3MtcmVhbC0xMg";
const isConvexPlaceholder = CONVEX_URL.includes("placeholder-url.convex.cloud");

const isClerkValid = PUBLISHABLE_KEY && !isClerkPlaceholder;

root.render(
  <React.StrictMode>
    {isClerkValid ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <App />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    ) : (
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    )}
  </React.StrictMode>
);
