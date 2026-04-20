import NewPassword from "@/components/registration/NewPassword";
import { useNavigate } from "react-router";

const ResetPassword = () => {
  const navigate = useNavigate();

  const handleClick = (view: string) => {
    if (view === "login") {
      navigate("/registration?view=login");
    } else if (view === "forgot") {
      navigate("/registration?view=forgot");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center py-12 md:py-20">
      <div className="w-full relative z-10">
        <NewPassword onClick={handleClick} />
      </div>
    </div>
  );
};

export default ResetPassword;
