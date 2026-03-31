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
    <div className="flex-1 w-full flex flex-col items-center justify-center my-auto py-4 md:py-8 px-4">
      <div className="w-full flex justify-center items-center h-full">
        {component}
      </div>
    </div>
  );
};

export default Registration;
