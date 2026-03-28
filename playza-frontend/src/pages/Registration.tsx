import ForgotPassword from "@/components/registration/ForgotPassword";
import LogIn from "@/components/registration/LogIn";
import NewPassword from "@/components/registration/NewPassword";
import OTP from "@/components/registration/OTP";
import RegistrationForm from "@/components/registration/RegistrationForm";
import { useState } from "react";

import { useSearchParams } from "react-router";

const Registration = () => {
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get("view") || "signup";
  const [page, setPage] = useState(initialView);

  const renderComponent = () => {
    switch (page) {
      case "signup":
        return <RegistrationForm onClick={setPage} />;
      
      case "otp":
        return <OTP onClick={setPage} />;
      
      case "login":
        return <LogIn onClick={setPage} />;

      case "forgot":
        return <ForgotPassword onClick={setPage} />;

      case "newpw":
        return <NewPassword onClick={setPage} />;

      default:
        break;
    }
  };

  const component = renderComponent();

  return (
    <div className="flex-1 min-h-[calc(100dvh-16px)] md:min-h-[calc(100dvh-48px)] min-w-0">
      {component}
    </div>
  );
};

export default Registration;
