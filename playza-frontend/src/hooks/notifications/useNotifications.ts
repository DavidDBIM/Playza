import { useQuery, useMutation } from "@tanstack/react-query";
import { getActiveBannerApi, registerPushTokenApi } from "../../api/notifications.api";
import type { RegisterPushPayload } from "../../api/notifications.api";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useActiveBanner = () => {
  return useQuery({
    queryKey: ["notifications", "banner"],
    queryFn: getActiveBannerApi,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useRegisterPush = () => {
  return useMutation({
    mutationFn: async (deviceType: string = 'web') => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported on this browser');
      }

      // 1. Register Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // 2. Wait for registration to be ready
      await navigator.serviceWorker.ready;

      // 3. Subscribe to Push Manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Send subscription object to backend
      const payload: RegisterPushPayload = {
        token: JSON.stringify(subscription),
        deviceType
      };

      return registerPushTokenApi(payload);
    },
  });
};
