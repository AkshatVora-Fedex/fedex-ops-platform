import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ConsignmentLookup from './components/ConsignmentLookup';
import TrackingDetails from './components/TrackingDetails';
import AlertCenter from './components/AlertCenter';
import ScanCodeReference from './components/ScanCodeReference';
import PredictiveRiskAnalytics from './components/PredictiveRiskAnalytics';
import AlertRulesConfiguration from './components/AlertRulesConfiguration';
import TrendReports from './components/TrendReports';
import Shipments from './components/Shipments';
import Login from './components/Login';
import GlobalCommand from './components/GlobalCommand';
import HubPulse from './components/HubPulse';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function NavigationBar({ auth, onLogout }) {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const isActive = (path) => location.pathname === path;

  const isAdmin = auth?.role === 'admin';
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'ops'] },
    { path: '/search', label: 'Search AWB', icon: 'search', roles: ['admin', 'ops'] },
    { path: '/shipments', label: 'Shipments', icon: 'local_shipping', roles: ['admin', 'ops'] },
    { path: '/alerts', label: 'Action Center', icon: 'notifications_active', roles: ['admin', 'ops'] },
    { path: '/prediction', label: 'Prediction', icon: 'trending_up', roles: ['admin', 'ops'] },
    { path: '/global-command', label: 'Global Command', icon: 'public', roles: ['admin'] },
    { path: '/hub-pulse', label: 'Hub Pulse', icon: 'hub', roles: ['admin'] },
    { path: '/rules', label: 'Rules', icon: 'tune', roles: ['admin'] },
    { path: '/analytics', label: 'Analytics', icon: 'analytics', roles: ['admin'] },
    { path: '/trends', label: 'Trends', icon: 'insights', roles: ['admin'] },
    { path: '/scan-codes', label: 'Codes', icon: 'library_books', roles: ['admin'] }
  ];

  return (
    <header className="bg-[#4D148C] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center bg-white rounded px-2 py-1">
              <span className="text-2xl font-bold tracking-tighter leading-none">
                <span className="text-[#4D148C]">Fed</span>
                <span className="text-[#FF6600]">Ex</span>
              </span>
            </div>
            <div className="hidden md:block ml-6">
              <div className="text-white text-lg font-bold">Planning & Engineering</div>
              <div className="text-indigo-200 text-xs font-medium uppercase tracking-wider">
                Operations Proactivity Platform
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems
              .filter((item) => item.roles.includes(auth?.role))
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white'
                      : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="material-icons text-sm align-middle mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 focus:outline-none transition-all"
            >
              <span className="material-icons">{darkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            {auth && (
              <span className="text-xs font-semibold px-2 py-1 rounded bg-white/10 text-indigo-100">
                {isAdmin ? 'Admin' : 'Ops Team'}
              </span>
            )}
            {auth && (
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded bg-white/10 text-indigo-100 hover:bg-white/20"
              >
                <span className="material-icons text-xs mr-1">logout</span>
                Logout
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-white">{auth?.username || 'Ops Admin'}</p>
                <p className="text-xs text-indigo-200">{isAdmin ? 'Admin' : 'Ops Team'}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#FF6600] flex items-center justify-center text-white font-bold text-sm">
                OA
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('fedexOpsAuth');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('fedexOpsAuth');
    setAuth(null);
  };

  const handleLogin = (authData) => {
    setAuth(authData);
  };

  const requireAuth = (element, allowedRoles) => {
    if (!auth) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(auth.role)) return <Navigate to="/" replace />;
    return element;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {auth && <NavigationBar auth={auth} onLogout={handleLogout} />}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/" element={requireAuth(<Dashboard />, ['admin', 'ops'])} />
            <Route path="/search" element={requireAuth(<ConsignmentLookup />, ['admin', 'ops'])} />
            <Route path="/tracking/:awb" element={requireAuth(<TrackingDetails />, ['admin', 'ops'])} />
            <Route path="/alerts" element={requireAuth(<AlertCenter />, ['admin', 'ops'])} />
            <Route path="/shipments" element={requireAuth(<Shipments />, ['admin', 'ops'])} />
            <Route path="/prediction" element={requireAuth(<PredictiveRiskAnalytics />, ['admin', 'ops'])} />
            <Route path="/global-command" element={requireAuth(<GlobalCommand />, ['admin'])} />
            <Route path="/hub-pulse" element={requireAuth(<HubPulse />, ['admin'])} />
            <Route path="/rules" element={requireAuth(<AlertRulesConfiguration />, ['admin'])} />
            <Route path="/analytics" element={requireAuth(<AnalyticsDashboard />, ['admin'])} />
            <Route path="/trends" element={requireAuth(<TrendReports />, ['admin'])} />
            <Route path="/scan-codes" element={requireAuth(<ScanCodeReference />, ['admin'])} />
          </Routes>
        </main>

        <footer className="bg-gray-800 dark:bg-black mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-400">
              © 2026 FedEx Operations Platform | Real-time Tracking & Predictive Analytics
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
