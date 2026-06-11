import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot'; // <-- Vite is looking for this inside src/components/

// Pages
import LoginScreen from './pages/LoginScreen';
import SubmitTicket from './pages/SubmitTicket'; // <-- UPDATED FROM SubmissionAndChatbot
import MyTickets from './pages/MyTickets';
import SupportAgentDashboard from './pages/SupportAgentDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import UserManagement from './pages/UserManagement';
import CategoryManagement from './pages/CategoryManagement';
import HelpAndSupport from './pages/HelpAndSupport';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Layout wrapper to inject Nav/Sidebar based on role
function AppLayout() {
  const location = useLocation();
  const path = location.pathname;

  // Determine role based on path for demo purposes
  let role = 'user';
  if (path.startsWith('/admin')) role = 'admin';
  else if (path.startsWith('/agent')) role = 'agent';

  return (
    <div className="app-layout flex-col">
      <TopNav role={role} />
      <div className="flex" style={{ flex: 1, overflow: 'hidden' }}>
        <Sidebar role={role} />
        <main className="main-content" style={{ backgroundColor: 'var(--background)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />

        {/* Protected Routes Wrapper */}
        <Route element={<AppLayout />}>
          {/* End-User Routes */}
          <Route path="/submit" element={<SubmitTicket />} /> {/* <-- UPDATED ROUTE */}
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/support" element={<HelpAndSupport />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Agent Routes */}
          <Route path="/agent" element={<Navigate to="/agent/dashboard" replace />} />
          <Route path="/agent/dashboard" element={<SupportAgentDashboard />} />
          <Route path="/agent/my-assigned" element={<SupportAgentDashboard />} />
          <Route path="/agent/completed" element={<SupportAgentDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminAnalytics />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
        </Route>
      </Routes>

      {/* Global Chatbot injected here so it appears on all screens */}
      <Chatbot />
    </Router>
  );
}

export default App;