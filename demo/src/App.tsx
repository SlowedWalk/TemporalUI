import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { TemporalZone } from '@temporalui/react';
import { AuthProvider, useAuth } from './lib/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoutes from './pages/ProtectedRoutes';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import Settings from './components/Settings';
import DataEntry from './components/DataEntry';
import Onboarding from './components/Onboarding';

function AppContent() {
  const { user } = useAuth();
  
  return (
    <TemporalZone config={{
      classifier: {
        weights: {
          engagement_depth: 0.3,
          session_recurrence: 0.25,
          dismissal_rate: 0.2,
          time_to_interact: 0.15,
          error_recovery: 0.1,
        },
      },
    }}>
      <div className="app">
        {user && <Navigation />}
        
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoutes />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/data-entry" element={<DataEntry />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </main>
      </div>
    </TemporalZone>
  );
}

function Navigation() {
  const location = useLocation();
  const { logout } = useAuth();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/tasks', label: 'Tasks', icon: '✓' },
    { path: '/data-entry', label: 'Data Entry', icon: '📝' },
    { path: '/settings', label: 'Settings', icon: '⚙' },
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">TemporalUI</div>
      <ul className="nav-links">
        {navItems.map(item => (
          <li key={item.path}>
            <Link 
              to={item.path} 
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="nav-footer">
        <Link to="/onboarding" className="nav-link">Tour</Link>
        <button onClick={() => logout()} className="nav-link btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
