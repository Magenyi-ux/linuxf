
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

/**
 * Robust hook for user identity.
 * It uses Clerk if available, otherwise falls back to a device-specific ID.
 */
export const useUserId = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);

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

  return { userId: deviceId, isLoading: deviceId === null, type: 'device' as const };
};

/**
 * Extension hook for Clerk identity.
 * Should only be called inside a ClerkProvider.
 */
export const useClerkUserId = () => {
    const { userId, isLoaded } = useAuth();
    return { userId, isLoaded };
};
