import { Route, Routes, useLocation, useMatch, useNavigate } from "react-router";
import { useState } from "react";
import Home from "./pages/Home";
import Header from "./components/Header";
import NavFooter from "./components/NavFooter";
import LeaderBoard from "./pages/LeaderBoard";
import Profile from "./pages/Profile";
import Games from "./pages/Games";
import SideBar from "./components/SideBar";
import Footer from "./components/Footer";
import RightSideBar from "./components/RightSideBar";
import Game from "./pages/Game";
import MatchSession from "./pages/MatchSession";
import Registration from "./pages/Registration";
import Wallet from "./pages/Wallet";
import Transactions from "./pages/Transactions";
import Deposit from "./pages/Deposit";
import Withdrawal from "./pages/Withdrawal";
import Overview from "./components/profile/Overview";
import History from "./components/profile/History";
import Settings from "./components/profile/Settings";
import Achievements from "./components/profile/Achievements";
import Security from "./components/profile/Security";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import Referral from "./pages/Referral";
import DepositModal from "./components/wallet/DepositModal";
import WithdrawModal from "./components/wallet/WithdrawModal";
import WithdrawSuccess from "./pages/WithdrawSuccess";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/auth";
import { CompleteProfileModal } from "./components/profile/CompleteProfileModal";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Loyalty from "./pages/Loyalty";
import CategoryPage from "./pages/CategoryPage";

const AppContent = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isProfileComplete } = useAuth();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeModal = searchParams.get("modal");

  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // const isGameDetailPage = !!useMatch("/games/:id");
  const isGameSessionPage = !!useMatch("/games/:id/session");
  const isRegistrationPage = !!useMatch("/registration");
  // const { id } = useParams();
  // const isGameDetailPage = pathname.startsWith(`/games/${id}`);

  const handleWithdrawClick = () => {
    if (!isProfileComplete) {
      setShowVerificationModal(true);
    } else {
      navigate("?modal=withdraw");
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    navigate("?modal=withdraw");
  };

  return (
    <div className="relative min-h-screen bg-background">
      {!isRegistrationPage && <Header />}

      {activeModal === "deposit" && (
        <DepositModal onClose={() => navigate(location.pathname)} />
      )}
      {activeModal === "withdraw" && isProfileComplete && (
        <WithdrawModal onClose={() => navigate(location.pathname)} />
      )}

      {showVerificationModal && (
        <CompleteProfileModal
          onClose={() => setShowVerificationModal(false)}
          onSuccess={handleVerificationSuccess}
        />
      )}

      {/* {pathname === "/" && <AppNotification />} */}
      <div className="max-w-400 mx-auto flex gap-6 p-2 md:p-6">
        {!isGameSessionPage && !isRegistrationPage && (
          <aside className="w-72 hidden xl:block sticky self-start top-24 h-[calc(100vh-8rem)]">
            <SideBar />
          </aside>
        )}

        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<LeaderBoard />} />
            <Route
              path="/wallet"
              element={<Wallet onWithdrawClick={handleWithdrawClick} />}
            />
            <Route path="/games" element={<Games />} />
            <Route path="/games/category/:category" element={<CategoryPage />} />
            <Route path="/games/:id" element={<Game />} />
            <Route path="/games/:id/session" element={<MatchSession />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/wallet/transactions" element={<Transactions />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/wallet/deposit" element={<Deposit />} />
            <Route path="/wallet/withdraw" element={<Withdrawal />} />
            <Route
              path="/wallet/withdraw/success"
              element={<WithdrawSuccess />}
            />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="/profile" element={<Profile />}>
              <Route index element={<Overview />} />
              <Route path="overview" element={<Overview />} />
              {/* <Route path="performance" element={<Performance />} /> */}
              <Route path="history" element={<History />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="settings" element={<Settings />} />
              <Route path="security" element={<Security />} />
            </Route>
          </Routes>
        </>

        {pathname === "/" && (
          <aside className="hidden xl:flex w-72 flex-col gap-6 sticky self-start top-24 h-[calc(100vh-8rem)]">
            <RightSideBar />
          </aside>
        )}
      </div>

      {!isRegistrationPage && <Footer showAbout={pathname === "/"} />}

      {!isRegistrationPage && <NavFooter />}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
