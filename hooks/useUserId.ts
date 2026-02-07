
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

const isClerkAvailable = () => {
    const key = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string);
    return key && key !== "pk_test_YW55LXN0cmluZy13aWxsLXdvcmstaWYtaXQtbG9va3MtcmVhbC0xMg";
};

export const useUserId = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // This is the tricky part: we can only call useAuth if we are inside ClerkProvider.
  // App.tsx ensures we only use 'clerk' type if isClerkAvailable() is true.
  // But useUserId is called in App.tsx.

  // If we are NOT inside ClerkProvider, useAuth() will throw.

  useEffect(() => {
    let id = localStorage.getItem("waExamPrep_deviceId");
    if (!id) {
      try {
        id = crypto.randomUUID();
        localStorage.setItem("waExamPrep_deviceId", id);
      } catch (e) {
        id = 'device-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("waExamPrep_deviceId", id);
      }
    }
    setDeviceId(id);
  }, []);

  // For the sake of safety and simplicity in this specific app structure:
  // We return the device ID always, and App.tsx can decide how to handle Clerk.

  return { userId: deviceId, isLoading: deviceId === null, type: 'device' as const };
};
