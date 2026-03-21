import ForgotPassword from "@/components/registration/ForgotPassword";
import LogIn from "@/components/registration/LogIn";
import NewPassword from "@/components/registration/NewPassword";
import OTP from "@/components/registration/OTP";
import RegistrationForm from "@/components/registration/RegistrationForm";
import { useState } from "react";

const Registration = () => {
  const [page, setPage] = useState("signup");

  const renderComponent = () => {
    switch (page) {
      case "signup":
        return <RegistrationForm onClick={setPage} />;
      
      case "otp":
        return <OTP onClick={setPage} />;
      
      case "login":
        return <LogIn onClick={setPage} />;
      // break;

      case "forgot":
        return <ForgotPassword onClick={setPage} />;
      // break;

      case "newpw":
        return <NewPassword onClick={setPage} />;
      // break;

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
