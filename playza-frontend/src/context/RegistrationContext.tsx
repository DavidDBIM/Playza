import { RegistrationContext } from "@/hooks/auth/useRegistration";
import { useState, type ReactNode } from "react";

export const RegistrationProvider = ({ children }: { children: ReactNode }) => {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  return (
    <RegistrationContext.Provider value={{ pendingEmail, setPendingEmail }}>
      {children}
    </RegistrationContext.Provider>
  );
};
