import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Games from './pages/Games';
import User from './pages/User';
import { ThemeProvider } from './components/theme/ThemeProvider';

// Placeholder components for routes
const Placeholder = ({ name }: { name: string }) => (
  <div className="p-10 text-[#E5E2E3]">
    <h1 className="text-3xl font-headline font-black mb-4">{name} Console</h1>
    <p className="text-[#E5E2E3]/60 font-body">This module is currently being calibrated in the Playza Empire system.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<User />} />
            <Route path="games" element={<Games />} />
            <Route path="sessions" element={<Placeholder name="Sessions" />} />
            <Route path="leaderboards" element={<Placeholder name="Leaderboards" />} />
            <Route path="transactions" element={<Placeholder name="Transactions" />} />
            <Route path="withdrawals" element={<Placeholder name="Withdrawals" />} />
            <Route path="rewards" element={<Placeholder name="Rewards" />} />
            <Route path="notifications" element={<Placeholder name="Notifications" />} />
            <Route path="content" element={<Placeholder name="Content" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;