import { Route, Routes, useLocation, useNavigate } from "react-router";
import { lazy, Suspense, useState, useTransition, useEffect } from "react";
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
import { FloatingSpinNotification } from "./components/loyalty/FloatingSpinNotification";
import NotificationBanner from "./components/NotificationBanner";
import PayoutBanner from "./components/PayoutBanner";
import { DeactivatedAccountModal } from "./components/profile/DeactivatedAccountModal";
import { FloatingFeedbackButton } from "./components/feedback/FloatingFeedbackButton";

// ─── Lazy pages ───────────────────────────────────────────────────────────────
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
const Referral = lazy(() => import("./pages/Referral"));
const WithdrawSuccess = lazy(() => import("./pages/WithdrawSuccess"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Loyalty = lazy(() => import("./pages/Loyalty"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const SpeedTapArena = lazy(() => import("./pages/games/SpeedTapArena"));
const QuizChampionship = lazy(() => import("./pages/games/QuizChampionship"));
const SoloEarn = lazy(() => import("./pages/SoloEarn"));
const Support = lazy(() => import("./pages/Support"));
const FAQ = lazy(() => import("./pages/FAQ"));



// Profile sub-pages
const Overview = lazy(() => import("./components/profile/Overview"));
const History = lazy(() => import("./components/profile/History"));

const Settings = lazy(() => import("./components/profile/Settings"));
const Security = lazy(() => import("./components/profile/Security"));

// ─── Top-bar progress indicator ──────────────────────────────────────────────
// Appears instantly on click, disappears when new page is ready.
// This gives immediate feedback even before the lazy chunk finishes loading.
const NavProgress = ({ active }: { active: boolean }) => (
  <div
    aria-hidden
    className="fixed top-0 left-0 z-9999 h-[2px] bg-primary transition-all duration-300 pointer-events-none"
    style={{
      width: active ? "85%" : "0%",
      opacity: active ? 1 : 0,
      transitionTimingFunction: active ? "ease-out" : "ease-in",
      transitionDuration: active ? "800ms" : "200ms",
    }}
  />
);

// ─── Minimal inline spinner (only shown if chunk loads > 200ms) ───────────────
const PageLoader = () => (
  <div className="w-full h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="size-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
        Loading...
      </span>
    </div>
  </div>
);

// ─── AppContent ───────────────────────────────────────────────────────────────
const AppContent = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isProfileComplete, user } = useAuth();
  const location = useLocation();

  // useTransition defers the route update inside Suspense so the old page stays
  // visible until the new one is ready — React 18 concurrent feature.
  // isPending is true IMMEDIATELY on click, giving instant visual feedback.
  const [isPending, startTransition] = useTransition();

  const searchParams = new URLSearchParams(location.search);
  const activeModal = searchParams.get("modal");
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const isGameSessionPage = pathname.includes("/session");
  const isGamePlayPage =
    pathname.endsWith("/play") ||
    (pathname.startsWith("/h2h") &&
      pathname.split("/").filter(Boolean).length >= 3);
  const isRegistrationPage = pathname.includes("/registration");
  const isSpinActive = searchParams.get("spin") === "true";
  const showFeedback = pathname === "/wallet" || pathname === "/";

  const isHiddenPage = isRegistrationPage || isGamePlayPage || pathname.includes("/reset-password");

  // Wrap navigate calls in startTransition so the browser stays responsive
  const handleWithdrawClick = () => {
    if (!isProfileComplete) {
      setShowVerificationModal(true);
    } else {
      startTransition(() => { navigate("?modal=withdraw"); });
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    startTransition(() => { navigate("?modal=withdraw"); });
  };

  // Prefetch pages in priority order — lightest/most-visited first
  // H2HZone loads last because it pulls vendor-chess (~200KB extra)
  useEffect(() => {
    // Tier 1: Most visited, no heavy deps — prefetch almost immediately
    const t1 = setTimeout(() => {
      import("./pages/Games");
      import("./pages/Wallet");
      import("./pages/Tournaments");
    }, 500);

    // Tier 2: Moderate — prefetch after page is interactive
    const t2 = setTimeout(() => {
      import("./pages/LeaderBoard");
      import("./pages/Profile");
      import("./pages/MyGames");
    }, 2000);

    // Tier 3: Heavy (chess vendor) — prefetch last, only if idle
    const t3 = setTimeout(() => {
      import("./pages/H2HZone");
    }, 4000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Instant top-bar progress on nav clicks */}
      <NavProgress active={isPending} />

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

      <DeactivatedAccountModal isOpen={user?.is_active === false} />

      <FloatingSpinNotification />
      <NotificationBanner />
      <PayoutBanner />

      {!isHiddenPage && showFeedback && user && (
        <FloatingFeedbackButton />
      )}

      <div
        className={
          isGamePlayPage
            ? ""
            : `w-full max-w-400 mx-auto flex gap-4 md:gap-8 px-1.5 md:px-4 pt-4 md:pt-8 ${
                isRegistrationPage
                  ? "pb-0 min-h-screen flex items-center justify-center"
                  : "pb-12 md:pb-16 lg:pb-10"
              }`
        }
      >
        {!isGameSessionPage && !isRegistrationPage && !isGamePlayPage && (
          <aside className="w-72 hidden lg:block sticky self-start top-24 h-[calc(100vh-8rem)] shrink-0">
            <SideBar />
          </aside>
        )}

        {/* Dim content slightly while a new page is loading */}
        <main
          className="flex-1 min-w-0 w-full"
          style={{
            opacity: isPending ? 0.6 : 1,
            transition: "opacity 150ms ease",
          }}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/leaderboard" element={<LeaderBoard />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route
                path="/wallet"
                element={<Wallet onWithdrawClick={handleWithdrawClick} />}
              />
              <Route path="/games" element={<Games />} />
              <Route path="/solo-earn" element={<SoloEarn />} />
              <Route path="/my-games" element={<MyGames />} />
              <Route
                path="/games/category/:category"
                element={<CategoryPage />}
              />
              <Route path="/games/speed-tap-arena" element={<SpeedTapArena />} />
              <Route path="/quiz/:id" element={<QuizChampionship />} />
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
              <Route path="/support" element={<Support />} />
              <Route path="/faq" element={<FAQ />} />

              <Route path="/profile" element={<Profile />}>
                <Route index element={<Overview />} />
                <Route path="overview" element={<Overview />} />
                <Route path="history" element={<History />} />
                <Route path="settings" element={<Settings />} />
                <Route path="security" element={<Security />} />
              </Route>
            </Routes>
          </Suspense>
        </main>
      </div>

      {pathname === "/" && <Footer showAbout={true} />}
      {!isRegistrationPage && !isGamePlayPage && !activeModal && !showVerificationModal && !isSpinActive && <NavFooter />}
    </div>
  );
};

import { ConnectivityProvider } from "./context/ConnectivityContext";

// ─── App root ─────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <ConnectivityProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ConnectivityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
