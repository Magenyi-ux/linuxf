
/**
 * useUserId.ts - Custom Hook for User Identification
 * This hook provides a unique identifier for the user to track progress locally.
 * It has been simplified to remove Clerk authentication dependency.
 */
// import { useAuth } from "@clerk/clerk-react"; // Removed Clerk import
import { useEffect, useState } from "react";

/**
 * Hook to manage and provide a persistent device-specific ID.
 * This ID is stored in localStorage to ensure it persists across browser sessions.
 */
export const useUserId = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to retrieve an existing ID from local storage
    let id = localStorage.getItem("waExamPrep_deviceId");

    // If no ID exists, generate a new one
    if (!id) {
      try {
        // Use the browser's native UUID generator if available
        id = crypto.randomUUID();
        localStorage.setItem("waExamPrep_deviceId", id);
      } catch (e) {
        // Fallback to a simple random string generator if randomUUID is not supported
        id = 'device-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("waExamPrep_deviceId", id);
      }
    }
    setDeviceId(id);
  }, []);

  // Return the device ID and its loading state
  // 'type' is fixed to 'device' as we are not using Clerk for now
  return { userId: deviceId, isLoading: deviceId === null, type: 'device' as const };
};

/**
 * useClerkUserId was removed as Clerk integration is disabled.
 */
