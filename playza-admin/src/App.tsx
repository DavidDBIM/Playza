import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Games from "./pages/Games";
import User from "./pages/User";
import Game from "./pages/Game";
import CreateGame from "./pages/CreateGame";
import Session from "./pages/Session";
import SessionLeaderboard from "./pages/SessionLeaderboard";
import Leaderboards from "./pages/Leaderboards";
import Transactions from "./pages/Transactions";
import TransactionDetails from "./pages/TransactionDetails";
import Withdrawals from "./pages/Withdrawals";
import Notifications from "./pages/Notifications";
import Ambassadors from "./pages/Ambassadors";
import ReferralPayouts from "./pages/ReferralPayouts";
import SignIn from "./pages/SignIn";
import { ThemeProvider } from "./components/theme/ThemeProvider";

// Placeholder components for routes
const Placeholder = ({ name }: { name: string }) => (
  <div className="p-10 text-[#E5E2E3]">
    <h1 className="text-3xl font-headline font-black mb-4">{name} Console</h1>
    <p className="text-[#E5E2E3]/60 font-body">
      This module is currently being calibrated in the Playza Empire system.
    </p>
  </div>
);

import ProtectedRoute from "./components/auth/ProtectedRoute";

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="users/:id" element={<User />} />
              <Route path="games" element={<Games />} />
              <Route path="games/create" element={<CreateGame />} />
              <Route path="games/:slug" element={<Game />} />
              <Route path="sessions/:id" element={<Session />} />
              <Route
                path="sessions/:id/leaderboard"
                element={<SessionLeaderboard />}
              />
              <Route path="leaderboards/*" element={<Leaderboards />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="transactions/:id" element={<TransactionDetails />} />
              <Route path="withdrawals" element={<Withdrawals />} />
              <Route path="rewards" element={<Placeholder name="Rewards" />} />
              <Route path="ambassadors" element={<Ambassadors />} />
              <Route path="referral-payouts" element={<ReferralPayouts />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="content" element={<Placeholder name="Content" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
