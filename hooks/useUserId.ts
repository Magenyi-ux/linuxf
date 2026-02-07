
import { useEffect, useState } from "react";

/**
 * Robust hook for user identity.
 * Fallback to a device-specific ID.
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
