import { createContext, useContext } from "react";

interface RegistrationContextValue extends RegistrationState {
  setPendingEmail: (email: string | null) => void;
}
interface RegistrationState {
  pendingEmail: string | null;
}

export const RegistrationContext =
  createContext<RegistrationContextValue | null>(null);

export const useRegistration = (): RegistrationContextValue => {
  const ctx = useContext(RegistrationContext);
  if (!ctx) {
    throw new Error(
      "useRegistration must be used inside <RegistrationProvider>",
    );
  }
  return ctx;
};
