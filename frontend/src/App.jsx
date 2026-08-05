import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NetworkExplorer from './pages/NetworkExplorer';
import Recommendations from './pages/Recommendations';

// ── Icons ──────────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const NetworkIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// ── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = ({ collapsed, setCollapsed }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: <HomeIcon /> },
    { to: '/network', label: 'Network Explorer', icon: <NetworkIcon /> },
    { to: '/recommendations', label: 'Recommendations', icon: <StarIcon /> },
  ];

  return (
    <aside
      className="fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300"
      style={{
        width: collapsed ? 68 : 240,
        background: 'rgba(10, 15, 30, 0.95)',
        borderRight: '1px solid rgba(99, 102, 241, 0.15)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ minHeight: 64 }}>
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)'
          }}
        >
          <BriefcaseIcon />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm text-white leading-tight">Job Referral</p>
            <p className="text-xs" style={{ color: '#6366f1' }}>Network</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 flex flex-col gap-1">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            {icon}
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="m-3 p-2 rounded-lg text-center transition-colors hover:bg-white/10"
        style={{ color: '#64748b', fontSize: 12 }}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? '→' : '← Collapse'}
      </button>
    </aside>
  );
};

// ── App ────────────────────────────────────────────────────────────────────
function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Router>
      {/* Ambient background orbs */}
      <div className="bg-orb" style={{ width: 600, height: 600, background: '#6366f1', top: -200, left: -200 }} />
      <div className="bg-orb" style={{ width: 500, height: 500, background: '#a855f7', bottom: -200, right: -100 }} />

      <div className="flex min-h-screen relative" style={{ zIndex: 1 }}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main
          className="flex-1 transition-all duration-300"
          style={{ marginLeft: collapsed ? 68 : 240, padding: '32px 28px', minHeight: '100vh' }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/network" element={<NetworkExplorer />} />
            <Route path="/recommendations" element={<Recommendations />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
