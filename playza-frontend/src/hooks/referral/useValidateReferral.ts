import { useQuery } from "@tanstack/react-query";
import { validateReferralCodeApi } from "../../api/referral.api";
import { useState, useEffect } from "react";

export const useValidateReferral = (code: string) => {
  const [debouncedCode, setDebouncedCode] = useState(code);

  // Wait 600ms after user stops typing before firing the request
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(code);
    }, 600);
    return () => clearTimeout(timer);
  }, [code]);

  return useQuery({
    queryKey: ["referral", "validate", debouncedCode],
    queryFn: () => validateReferralCodeApi(debouncedCode),
    // Only fire when debounced code is ready and at least 6 chars
    enabled: !!debouncedCode && debouncedCode.length >= 4,
    retry: false,
    staleTime: 60000,
  });
};
