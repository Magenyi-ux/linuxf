
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

export const useUserId = () => {
  const { userId: clerkId, isLoaded } = useAuth();
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("waExamPrep_deviceId");
    if (!id) {
      try {
        id = crypto.randomUUID();
        localStorage.setItem("waExamPrep_deviceId", id);
      } catch (e) {
        // Fallback for older browsers
        id = 'device-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("waExamPrep_deviceId", id);
      }
    }
    setDeviceId(id);
  }, []);

  if (!isLoaded) return { userId: null, isLoading: true, type: null };

  if (clerkId) {
    return { userId: clerkId, isLoading: false, type: 'clerk' as const };
  }

  return { userId: deviceId, isLoading: deviceId === null, type: 'device' as const };
};
