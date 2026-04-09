import { Route, Routes, useLocation, useNavigate } from "react-router";

import { lazy, Suspense, useState } from "react";
import Header from "./components/Header";
import NavFooter from "./components/NavFooter";
import SideBar from "./components/SideBar";
import Footer from "./components/Footer";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import DepositModal from "./components/wallet/DepositModal";
import WithdrawModal from "./components/wallet/WithdrawModal";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { useAuth } from "./context/auth";
import { CompleteProfileModal } from "./components/profile/CompleteProfileModal";

// Lazy-loaded pages for better performance
const Home = lazy(() => import("./pages/Home"));
const LeaderBoard = lazy(() => import("./pages/LeaderBoard"));
const Profile = lazy(() => import("./pages/Profile"));
const Games = lazy(() => import("./pages/Games"));
const Game = lazy(() => import("./pages/Game"));
const MatchSession = lazy(() => import("./pages/MatchSession"));
const GamePlay = lazy(() => import("./pages/GamePlay"));
const H2HZone = lazy(() => import("./pages/H2HZone"));
const Registration = lazy(() => import("./pages/Registration"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Deposit = lazy(() => import("./pages/Deposit"));
const Withdrawal = lazy(() => import("./pages/Withdrawal"));
const MyGames = lazy(() => import("./pages/MyGames"));
const Tournaments = lazy(() => import("./pages/Tournaments"));
const TournamentDetail = lazy(() => import("./pages/TournamentDetail"));
const Referral = lazy(() => import("./pages/Referral"));
const WithdrawSuccess = lazy(() => import("./pages/WithdrawSuccess"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Loyalty = lazy(() => import("./pages/Loyalty"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));

// Lazy-loaded profile subcomponents
const Overview = lazy(() => import("./components/profile/Overview"));
const History = lazy(() => import("./components/profile/History"));
const Achievements = lazy(() => import("./components/profile/Achievements"));
const Settings = lazy(() => import("./components/profile/Settings"));
const Security = lazy(() => import("./components/profile/Security"));

// Page loading skeleton
const PageLoader = () => (
  <div className="w-full h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">
        Loading...
      </span>
    </div>
  </div>
);

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
    (pathname.startsWith("/h2h") &&
      pathname.split("/").filter(Boolean).length >= 3);

  const isRegistrationPage = pathname.includes("/registration");

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
            : `w-full max-w-400 mx-auto flex gap-4 md:gap-8 px-1.5 md:px-4 pt-4 md:pt-8 ${isRegistrationPage ? "pb-0 min-h-screen flex items-center justify-center" : "pb-32 md:pb-24 lg:pb-10"}`
        }
      >
        {!isGameSessionPage && !isRegistrationPage && !isGamePlayPage && (
          <aside className="w-72 hidden lg:block sticky self-start top-24 h-[calc(100vh-8rem)] shrink-0">
            <SideBar />
          </aside>
        )}

        <main className="flex-1 min-w-0 w-full ">
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/reset-password" element={<ResetPassword />} />

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
                <Route path="history" element={<History />} />
                <Route path="achievements" element={<Achievements />} />
                <Route path="settings" element={<Settings />} />
                <Route path="security" element={<Security />} />
              </Route>
            </Routes>
          </Suspense>
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
