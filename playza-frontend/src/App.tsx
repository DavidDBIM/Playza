import { Route, Routes, useLocation, useNavigate } from "react-router";

import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Header from "./components/Header";
import NavFooter from "./components/NavFooter";
import LeaderBoard from "./pages/LeaderBoard";
import Profile from "./pages/Profile";
import Games from "./pages/Games";
import SideBar from "./components/SideBar";
import Footer from "./components/Footer";
import Game from "./pages/Game";
import MatchSession from "./pages/MatchSession";
import GamePlay from "./pages/GamePlay";
import H2HZone from "./pages/H2HZone";
// Individual games are now handled dynamically by H2HZone
import Registration from "./pages/Registration";

import Wallet from "./pages/Wallet";
import Transactions from "./pages/Transactions";
import Deposit from "./pages/Deposit";
import Withdrawal from "./pages/Withdrawal";
import Overview from "./components/profile/Overview";
import History from "./components/profile/History";
import MyGames from "./pages/MyGames";
import Settings from "./components/profile/Settings";
import Achievements from "./components/profile/Achievements";
import Security from "./components/profile/Security";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import Referral from "./pages/Referral";
import DepositModal from "./components/wallet/DepositModal";
import WithdrawModal from "./components/wallet/WithdrawModal";
import WithdrawSuccess from "./pages/WithdrawSuccess";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
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
  const isGameSessionPage = pathname.includes("/session");
  const isGamePlayPage =
    pathname.includes("/play") ||
    // Only hide layout if we are in an active game room (e.g., /h2h/chess/room-id)
    (pathname.startsWith("/h2h") && pathname.split("/").filter(Boolean).length >= 3);

  const isRegistrationPage = pathname.includes("/registration");

  // const isGameDetailPage = pathname.startsWith(`/games/${id}`);

  const [isInitializing, setIsInitializing] = useState(
    () => window.innerWidth < 768,
  );

  useEffect(() => {
    if (isInitializing) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isInitializing]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-primary font-bold animate-pulse">
          Loading PlayZa...
        </p>
      </div>
    );
  }

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
      {!isRegistrationPage && !isGamePlayPage && <Header />}

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
      <div
        className={
          isGamePlayPage
            ? ""
            : `w-full max-w-400 mx-auto flex gap-4 md:gap-8 px-1.5 md:px-4 pt-4 md:pt-8 ${isRegistrationPage ? "pb-0 min-h-screen flex items-center justify-center" : "pb-32 md:pb-24 xl:pb-0 lg:0"}`
        }
      >
        {!isGameSessionPage && !isRegistrationPage && !isGamePlayPage && (
          <aside className="w-72 hidden lg:block sticky self-start top-24 h-[calc(100vh-8rem)] shrink-0">
            <SideBar />
          </aside>
        )}

        <main className="flex-1 min-w-0 w-full ">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<LeaderBoard />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route
              path="/wallet"
              element={<Wallet onWithdrawClick={handleWithdrawClick} />}
            />
            <Route path="/games" element={<Games />} />
            <Route path="/my-games" element={<MyGames />} />
            <Route
              path="/games/category/:category"
              element={<CategoryPage />}
            />
            <Route path="/games/:id" element={<Game />} />
            <Route path="/games/:id/session" element={<MatchSession />} />
            <Route path="/games/:id/play" element={<GamePlay />} />
            <Route path="/h2h" element={<H2HZone />} />
            <Route path="/h2h/:gameType" element={<H2HZone />} />
            <Route path="/h2h/:gameType/:roomId" element={<H2HZone />} />
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
        </main>
      </div>

      {pathname === "/" && <Footer showAbout={true} />}

      {!isRegistrationPage && !isGamePlayPage && <NavFooter />}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
