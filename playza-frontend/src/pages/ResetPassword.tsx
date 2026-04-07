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
    <div className="flex-1 min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-xl flex justify-center items-center">
        <NewPassword onClick={handleClick} />
      </div>
    </div>
  );
};

export default ResetPassword;
