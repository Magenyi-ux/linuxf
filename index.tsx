import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

// Fallback to placeholder if env vars are missing to prevent crash during initial setup
const CONVEX_URL = (import.meta.env.VITE_CONVEX_URL as string) || "https://placeholder-url.convex.cloud";
const PUBLISHABLE_KEY = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) || "pk_test_YW55LXN0cmluZy13aWxsLXdvcmstaWYtaXQtbG9va3MtcmVhbC0xMg";

const convex = new ConvexReactClient(CONVEX_URL);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </React.StrictMode>
);