import { useContext } from 'react';
import { ConnectivityContext } from '../context/ConnectivityContextCore';

export const useConnectivity = () => {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
};
