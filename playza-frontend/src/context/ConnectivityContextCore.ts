import { createContext } from 'react';

export interface ConnectivityContextType {
  isOnline: boolean;
  wasOffline: boolean;
}

export const ConnectivityContext = createContext<ConnectivityContextType>({
  isOnline: typeof window !== 'undefined' ? window.navigator.onLine : true,
  wasOffline: false,
});
